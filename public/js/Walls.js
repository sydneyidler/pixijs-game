function Walls() {
  PIXI.Container.call(this);

  this.pool = new WallSpritesPool();
  this.createLookupTables();

  this.slices = [];

  this.viewportX = 0;
  this.viewportSliceX = 0;
}

Walls.prototype = Object.create(PIXI.Container.prototype);

Walls.VIEWPORT_WIDTH = 512;
Walls.VIEWPORT_NUM_SLICES = Math.ceil(Walls.VIEWPORT_WIDTH/WallSlice.WIDTH) + 1; 

Walls.prototype.setViewportX = function(viewportX) {
  this.viewportX = this.checkViewportXBounds(viewportX);

  let prevViewportSliceX = this.viewportSliceX;
  this.viewportSliceX = Math.floor(this.viewportX / WallSlice.WIDTH);
  
  this.removeOldSlices(prevViewportSliceX);
  this.addNewSlices();
}

Walls.prototype.removeOldSlices = function(prevViewportSliceX) {
  let numOldSlices = this.viewportSliceX - prevViewportSliceX;
  if (numOldSlices > Walls.VIEWPORT_NUM_SLICES) {
    numOldSlices = Walls.VIEWPORT_NUM_SLICES;
  }

  for (let i = prevViewportSliceX; i < prevViewportSliceX + numOldSlices; i++) {
    let slice = this.slices[i];
    if (slice.sprite != null) {
      this.returnWallSprite(slice.type, slice.sprite);
      this.removeChild(slice.sprite);
      slice.sprite = null;
    }
  }
}

Walls.prototype.addNewSlices = function() {
  let firstX = -(this.viewportX % WallSlice.WIDTH);
  for (let i = this.viewportSliceX, sliceIndex = 0; i < this.viewportSliceX + Walls.VIEWPORT_NUM_SLICES; i++, sliceIndex++) {
    let slice = this.slices[i];
    if (slice.sprite == null && slice.type != SliceType.GAP) {
      slice.sprite = this.borrowWallSprite(slice.type);
      slice.sprite.position.x = firstX + (sliceIndex * WallSlice.WIDTH);
      slice.sprite.position.y = slice.y;

      this.addChild(slice.sprite);
    } else if (slice.sprite != null) {
      slice.sprite.position.x = firstX + (sliceIndex * WallSlice.WIDTH); 
    }
  } 
}

Walls.prototype.checkViewportXBounds = function(viewportX) {
  let maxViewportX = (this.slices.length - Walls.VIEWPORT_NUM_SLICES) * WallSlice.WIDTH;

  if (viewportX < 0) {
    viewportX = 0;
  } else if (viewportX >= maxViewportX) {
    viewportX = maxViewportX;
  }

  return viewportX;
}

Walls.prototype.addSlice = function(sliceType, y) {
  let slice = new WallSlice(sliceType, y);
  this.slices.push(slice);
}

Walls.prototype.createLookupTables = function() {
  this.borrowWallSpriteLookup = [];
  this.borrowWallSpriteLookup[SliceType.FRONT] = this.pool.borrowFrontEdge;
  this.borrowWallSpriteLookup[SliceType.BACK] = this.pool.borrowBackEdge;
  this.borrowWallSpriteLookup[SliceType.STEP] = this.pool.borrowStep;
  this.borrowWallSpriteLookup[SliceType.DECORATION] = this.pool.borrowDecoration;
  this.borrowWallSpriteLookup[SliceType.WINDOW] = this.pool.borrowWindow;

  this.returnWallSpriteLookup = [];
  this.returnWallSpriteLookup[SliceType.FRONT] = this.pool.returnFrontEdge;
  this.returnWallSpriteLookup[SliceType.BACK] = this.pool.returnBackEdge;
  this.returnWallSpriteLookup[SliceType.STEP] = this.pool.returnStep;
  this.returnWallSpriteLookup[SliceType.DECORATION] = this.pool.returnDecoration;
  this.returnWallSpriteLookup[SliceType.WINDOW] = this.pool.returnWindow;
}

Walls.prototype.borrowWallSprite = function(sliceType) {
  return this.borrowWallSpriteLookup[sliceType].call(this.pool);
}

Walls.prototype.returnWallSprite = function(sliceType, sliceSprite) {
  return this.returnWallSpriteLookup[sliceType].call(this.pool, sliceSprite);
}

Walls.prototype.getWallOnPlayerYPos = function() {
  return this.slices[this.viewportSliceX + 1].y; 
}

