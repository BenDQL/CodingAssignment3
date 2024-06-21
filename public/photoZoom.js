const selectPhotoToZoom = function (image_name) {
  const sketch = function (p) {
    let photo,
      resizeWidth = 1280,
      resizeHeight,
      RECT_WIDTH,
      RECT_HEIGHT,
      rectX,
      rectY,
      dx,
      dy,
      dWidth,
      dHeight,
      isZoomed = false,
      destTopLeft,
      destBottomRight,
      topLeftParticle,
      bottomRightParticle,
      EXTRA_ZOOM_SPEED = 1.75,
      FRAME_RATE = 30;

    p.setup = function () {
      p.frameRate(FRAME_RATE);

      photo = p.loadImage(image_name, function () {
        resizeHeight = (photo.height / photo.width) * 1280;
        const myCanvas = p.createCanvas(resizeWidth, resizeHeight);
        myCanvas.parent("canvas-wrapper");
        p.image(photo, 0, 0, resizeWidth, resizeHeight);
        RECT_WIDTH = p.floor(resizeWidth * 0.075);
        RECT_HEIGHT = p.floor(RECT_WIDTH / (photo.width / photo.height));
        dWidth = RECT_WIDTH * 5;
        dHeight = RECT_HEIGHT * 5;
        dx = p.floor(resizeWidth / 2 - dWidth / 2);
        dy = p.floor(resizeHeight / 2 - dHeight / 2);
        destTopLeft = p.createVector(dx, dy);
        destBottomRight = p.createVector(dx + dWidth, dy + dHeight);
      });
    };

    p.draw = function () {
      p.clear();
      p.noFill();
      p.stroke("#FFFFF");
      p.strokeWeight(2);

      p.image(photo, 0, 0, resizeWidth, resizeHeight);

      if (isZoomed) {
        topLeftParticle.update();
        bottomRightParticle.update();

        const zoom_rect_x = topLeftParticle.position.x;
        const zoom_rect_y = topLeftParticle.position.y;
        const zoom_rect_width =
          bottomRightParticle.position.x - topLeftParticle.position.x;
        const zoom_rect_height =
          bottomRightParticle.position.y - topLeftParticle.position.y;

        p.rect(zoom_rect_x, zoom_rect_y, zoom_rect_width, zoom_rect_height);

        // Draw a zoomed image of the current rect
        p.image(
          photo,
          zoom_rect_x,
          zoom_rect_y,
          zoom_rect_width,
          zoom_rect_height,
          (rectX / 1280) * photo.width,
          (rectY / resizeHeight) * photo.height,
          zoom_rect_width,
          zoom_rect_height
        );

        return;
      }

      updateZoomSelectRect();
      drawZoomSelectRect();
    };

    // const removeSketch = function () {
    //   p.remove();
    // };

    function updateZoomSelectRect() {
      let cursorX, cursorY;

      cursorX = p.mouseX;
      cursorY = p.mouseY;

      if (cursorX === 0 && cursorY === 0) {
        cursorX = p.floor(resizeWidth / 2 - RECT_WIDTH / 2);
        cursorY = p.floor(resizeHeight / 2 - RECT_HEIGHT / 2);
      }

      // keep the rect within the bounds of the image
      rectX = cursorX - p.floor(RECT_WIDTH / 2);
      rectY = cursorY - p.floor(RECT_HEIGHT / 2);
      rectX = applyCoordBoundary(rectX, RECT_WIDTH, resizeWidth);
      rectY = applyCoordBoundary(rectY, RECT_HEIGHT, resizeHeight);
    }

    function drawZoomSelectRect() {
      // Draw the zoom rect
      p.rect(rectX, rectY, RECT_WIDTH, RECT_HEIGHT);

      // draw the plus symbol circle in the top left
      const w = 14;
      const line_w = w / 2;
      const x = rectX + w;
      const y = rectY + w;
      p.ellipse(x, y, w, w);

      // draw the cross in the ellipse
      p.line(x, y + line_w, x, y - line_w);
      p.line(x + line_w, y, x - line_w, y);
    }

    p.touchStarted = function () {
      updateZoomSelectRect();
    };

    p.touchMoved = function () {
      updateZoomSelectRect();
    };

    p.touchEnded = function () {
      const origin = p.createVector(p.mouseX, p.mouseY);
      const topLeftDist = p5.Vector.dist(destTopLeft, origin);
      const bottomRightDist = p5.Vector.dist(destBottomRight, origin);
      let multiplierA;
      let multiplierB;

      updateZoomSelectRect();

      // try to make two particles arrive at their destination at the same time
      if (topLeftDist < bottomRightDist) {
        multiplierA = topLeftDist / FRAME_RATE;
        multiplierB = multiplierA * (bottomRightDist / topLeftDist);
      } else if (bottomRightDist < topLeftDist) {
        multiplierB = bottomRightDist / FRAME_RATE;
        multiplierA = multiplierB * (topLeftDist / bottomRightDist);
      } else {
        multiplierB = multiplierA = topLeftDist / FRAME_RATE;
      }

      topLeftParticle = new Particle(
        origin,
        destTopLeft,
        multiplierA * EXTRA_ZOOM_SPEED
      );
      bottomRightParticle = new Particle(
        origin,
        destBottomRight,
        multiplierB * EXTRA_ZOOM_SPEED
      );

      isZoomed = !isZoomed;
      return false;
    };

    /**
     * Prevents the rect from drawing outside the canvas boundary
     */
    function applyCoordBoundary(coord, sideLength, boundary) {
      if (coord < 0) {
        return 0;
      }
      if (coord + sideLength > boundary) {
        return boundary - sideLength;
      }
      return coord;
    }

    // A simple Particle class
    const Particle = function (position, dest, speed) {
      this.position = position.copy();
      this.dest = dest.copy();
      this.acceleration = p.createVector(0.0, 0.0);
      this.direction = p5.Vector.sub(dest, position);
      this.direction.normalize();
      this.direction.mult(speed);
      this.velocity = p.createVector(this.direction.x, this.direction.y); //createVector(0, 0);
    };

    // Method to update position
    Particle.prototype.update = function () {
      this.velocity.add(this.acceleration);
      if (p5.Vector.dist(this.dest, this.position) < 20) {
        this.velocity = p.createVector(0, 0);
      }
      this.position.add(this.velocity);
    };
  };

  return new p5(sketch);
};
