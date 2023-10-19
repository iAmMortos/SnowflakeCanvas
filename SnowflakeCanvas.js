/* Create an instance of this class to kick everything off automatically.
 * Optionally, pass in the maximum number of snowflakes allowed to be processed
 * at once. Default is 200. */
function SnowflakeCanvas(maxSnowflakes) {
  // if no max given, set to 200
  this.maxSnowflakes = typeof maxSnowflakes !== "undefined" ? maxSnowflakes : 200;
  
  // so "this" can be used inside lambdas in this scope.
  var self = this;
  
  /* instance of CappedAnimationFrames. Give it an action, start it, and it runs
   * in sync with the browser's render loop for optimal animation frequency.
   * Passes a 'delta' into whatever method it's given of time in milliseconds
   * since the last frame. */
  this.caf = new CappedAnimationFrames((delta)=>self.update(delta));
  
  // Snowflake storage. 3 Layers for parallax effect. Index 0 is foremost layer.
  this.snowflakes = [[],[],[]];
  
  // Create a new canvas element and give it the necessary css styling.
  this.canvas = $("<canvas>")[0];
  $(this.canvas).css({
    "box-sizing": "border-box",
    "width": "100%",
    "height": "100%",
    "position": "fixed",
    "top": "0",
    "left": "0",
    "z-index": "-9001",
  });
  
  // Get the 2d context and set the canvas's resolution (1:1 with size);
  this.ctx = this.canvas.getContext("2d");
  this.ctx.canvas.height = window.innerHeight;
  this.ctx.canvas.width = window.innerWidth;
  
  $("body").append(this.canvas);
  // update the canvas's size when the screen gets resized
  $(window).resize((e)=>self.updateCanvasSize());
  
  // This is what starts the capped animation frames ticking.
  this.caf.start();
}
SnowflakeCanvas.prototype.update = function(delta) {
  // erase the whole canvas
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  /* If all the snowflakes in all 3 layers are less than the max, consider
   * creating a new one. */
  if (this.snowflakes[0].length + 
      this.snowflakes[1].length +
      this.snowflakes[2].length < this.maxSnowflakes) {
    /* TODO: rewrite the generation probability to take into account delta so
     * snowflakes are generated at about the same rate regardless of FPS. */
    // ~10 per second running at 60 fps
    if (Math.random() < 0.167) {
      var row = Math.floor(Math.random() * 3);
      this.snowflakes[row].push(new Snowflake(row));
    }
  }
  
  // update, draw, and remove snowflakes in layers from back to front
  for (var r = 2; r >= 0; r--) {
    /* keep track of indices of off-screen flakes so they can be removed outside
     * the following loop. */
    var toRemove = [];
    for (var i = 0; i < this.snowflakes[r].length; i++) {
      var snowflake = this.snowflakes[r][i];
      snowflake.update(delta);
      snowflake.draw(this.ctx);
      if (snowflake.y > window.innerHeight + 10) {
        toRemove.push(i);
      }
    }
    
    /* Removed marked flakes from before. Sort the flake indices in decending order and
     * delete them, highest index first to not affect the indices of flakes that
     * still need to be deleted. */
    toRemove.sort((a,b)=>a<b);
    for (var i = 0; i < toRemove.length; i++) {
      var idx = toRemove[i];
      this.snowflakes[r].splice(idx, 1);
    }
  }
};
SnowflakeCanvas.prototype.updateCanvasSize = function() {
  // clear anything that was on the canvas before, then readjust the size.
  this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
  this.ctx.canvas.height = window.innerHeight;
  this.ctx.canvas.width = window.innerWidth;
};



/* Individual snowflake objects keep track of all their own info. They use sine
 * waves to simulate the gentle fluttering of snowflakes back and forth. */
function Snowflake(row) {
  // Select a color based on the row this snowflake will be in. (0 = foremost)
  this.color = ["rgba(255,255,255,0.95)",
                "rgba(255,255,255,0.8)",
                "rgba(255,255,255,0.6)"][row];
  /* A multiplier that will be applied to various other fields to simulate those
   * flakes being farther back, shortening distances and slowing velocities etc. */
  this.rowMultiplier = [1, 0.8, 0.6][row];
  
  // radius of the flake
  this.radius = (Math.random() * 2 + 2) * this.rowMultiplier;
  
  /* The *center* line of this snowflake. This value will not change. The sinX
   * value represents the changing x value of this snowflake based on the sine
   * wave and this.sinWidth. */
  this.x = Math.random() * window.innerWidth;
  
  /* The actual x value of the snowflake after the sine wave is calculated and
   * applied with this.sinWidth to this.x */
  this.sinX;
  
  // The starting position of the snowflake so that it appears *right* out of sight
  this.y = -1 * this.radius;
  
  // How wide this snowflake will sway back and forth in pixels
  this.sinWidth = (Math.random() * 120 + 50) * this.rowMultiplier;
  
  // The downward velocity of the flake in pixels per millisecond
  this.yVel = (Math.random() * 0.15 + 0.02) * this.rowMultiplier;
  
  // The length of time in milliseconds this sine wave should take to repeat
  this.sinPeriod = Math.random() * 1000 + 2500;
  
  // The current position in the sine wave (in radians)
  this.curSin = Math.random() * (Math.PI * 2);
}
Snowflake.prototype.update = function(delta) {
  // update y position
  this.y += delta * this.yVel;
  
  // calculate and modulate the new position in the sin wave
  this.curSin += (delta / this.sinPeriod) * (Math.PI * 2);
  this.curSin %= (Math.PI * 2);
  
  // Calculate the actual x value of the flake used for drawing
  this.sinX = this.x + (this.sinWidth * Math.sin(this.curSin));
};
Snowflake.prototype.draw = function(ctx) {
  // draw a circle using this snowflakes various fields
  ctx.beginPath();
  ctx.arc(this.sinX, this.y, this.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = this.color;
  ctx.fill();
};
