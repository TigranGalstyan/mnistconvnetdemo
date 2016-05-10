if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function (callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () { callback(currTime + timeToCall); },
      timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

var app = angular.module("Calc", []);
app.directive("drawing", function ($window, $http) {
  return {
    restrict: "A",
    link: function (scope, element) {

      scope.digits = new Array(10);

      for (var i = 0; i < 10; ++i) {
        scope.digits[i] = "10%";
      }

      var ctx = element[0].getContext('2d');
      var preview = document.getElementById('preview').getContext('2d');
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      var ps = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var bitmap = new Array(28);
      // the last coordinates before the current move
      var lastX;
      var lastY;


      var net = new convnetjs.Net();
      net.fromJSON(netstr);

      $window.requestAnimationFrame(update);

      //  update_probs();
      element.bind('mousedown', function (event) {
        if (event.offsetX !== undefined) {
          lastX = event.offsetX;
          lastY = event.offsetY;
        } else { // Firefox compatibility
          lastX = event.layerX - event.currentTarget.offsetLeft;
          lastY = event.layerY - event.currentTarget.offsetTop;
        }

        // begins new line
        //ctx.beginPath();

        drawing = true;
      });

      element.bind('mousemove', function (event) {
        if (drawing) {
          // get current mouse position
          if (event.offsetX !== undefined) {
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          draw(lastX, lastY, currentX, currentY);

          // set current coordinates to last one
          lastX = currentX;
          lastY = currentY;
        }

      });
      element.bind('mouseup', function (event) {
        // stop drawing
        drawing = false;
      });

      // canvas reset
      scope.reset = function () {
        element[0].width = element[0].width;
      }

      function update() {
        var imgData = ctx.getImageData(0, 0, 560, 560);
        // invert colors
        var imd = new Array(560 * 560);
        for (var i = 0; i < imgData.data.length; i += 4) {
          imd[i / 4] = imgData.data[i + 3] / 255.0;
        }

        var top = 360, right = 200, bottom = 200, left = 360;
        for (var i = 0; i < 560; ++i) {
          for (var j = 0; j < 560; ++j) {
            if (imd[i * 560 + j] > 0.001) {
              top = Math.min(i, top);
              right = Math.max(j, right);
              bottom = Math.max(i, bottom);
              left = Math.min(j, left);
            }
          }
        }

        var W = ((right - left + 28 + 27) / 28) | 0,
          H = ((bottom - top + 28 + 27) / 28) | 0;
        W = H = Math.max(W, H);
        var cx = (left + right) >> 1;
        var cy = (top + bottom) >> 1;
        var lx = cx - W * 28 / 2;
        var ly = cy - H * 28 / 2;

        /*
        //ctx.fillStyle = 'rgba(0,0,0,0)';
        //ctx.strokeStyle = 'rgba(0,0,0,1)';
        ov.clearRect(0,0,560,560);
        ov.beginPath();
        ov.rect(lx, ly, W * 28, H * 28);
        ov.stroke();
        //ctx.fillStyle = 'rgba(0,0,0,1)';
        */
        imgData = ctx.getImageData(lx, ly, W * 28, H * 28);
        imd = new Array(W * 28 * H * 28);
        for (var i = 0; i < imgData.data.length; i += 4) {
          imd[i / 4] = imgData.data[i + 3] / 255.0;
        }


        //console.log(imd.length);
        for (var i = 0; i < 28; ++i) {
          bitmap[i] = new Array(28);
          for (var j = 0; j < 28; ++j) {
            var pixel = 0.0;
            for (var k = 0; k < W; ++k) {
              for (var t = 0; t < H; ++t) {
                pixel += imd[(i * W + k) * 28 * W + j * H + t];
              }
            }
            pixel /= W * H;
            bitmap[i][j] = pixel;
          }
        }

        var previewImgData = preview.getImageData(0, 0, 28, 28);
        //console.log(previewImgData.data.length);

        for (var i = 0; i < 28; ++i) {
          for (var j = 0; j < 28; ++j) {
            previewImgData.data[((i * 28) + j) * 4 + 3] = bitmap[i][j] * 255;
          }
        }

        //debugger;

        preview.putImageData(previewImgData, 0, 0);
        update_probabilities();

        for (var i = 0; i <= 9; ++i) {
          scope.digits[i] = (ps[i] * 100).toFixed(3) + '%';
        }

        scope.$apply();

        $window.requestAnimationFrame(update);
      }
      function update_probabilities() {
        var sample = new convnetjs.Vol(28, 28, 1);
        for (var xc = 0; xc < 28; xc++) {
          for (var yc = 0; yc < 28; yc++) {
            sample.set(yc, xc, 1, bitmap[xc][yc] - 0.5);
          }
        }
        var probability_volume = net.forward(sample).w;
        for (var i = 0; i < 10; ++i) {
          ps[i] = probability_volume[i];
        }
      }
      function draw(lX, lY, cX, cY) {
        i = 0
        for (var i = 0; i < 1; i += 0.02) {
          ctx.beginPath();
          ctx.arc(cX + (lX - cX) * i, cY + (lY - cY) * i, 33, 0, 2 * Math.PI, false);
          ctx.fillStyle = "#00000055";
          ctx.fill();
        }
      }
    }
  };
});
