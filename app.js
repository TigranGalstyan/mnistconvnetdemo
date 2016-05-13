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
var detectmob =function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
var app = angular.module("Calc", []);
app.directive("drawing", function ($window, $http) {
  return {
    restrict: "A",
    link: function (scope, element) {

      scope.digits = new Array(10);
      scope.isMobile = detectmob();
      
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
      
      element.bind('touchstart',function (event) {
        lastX = event.touches[0].clientX;
        lastY = event.touches[0].clientY;
      });
      element.bind('touchmove', function (event) {
          // get current mouse position
          currentX = event.touches[0].clientX;
          currentY = event.touches[0].clientY;
          draw(lastX, lastY, currentX, currentY);

          // set current coordinates to last one
          lastX = currentX;
          lastY = currentY;
      });
      element.bind('touchend',function(event) {
          update(true);
      });

      function update(force) {
        if(scope.isMobile && !force) {
          return;
        }
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

        var W = ((right - left + 8 * 28 - 1) / 28) | 0,
          H = ((bottom - top + 8 * 28 - 1) / 28) | 0;
        W = H = Math.max(W, H);
        var cx = (left + right) >> 1;
        var cy = (top + bottom) >> 1;
        var lx = cx - W * 28 / 2;
        var ly = cy - H * 28 / 2;

        imgData = ctx.getImageData(lx, ly, W * 28, H * 28);
        imd = new Array(W * 28 * H * 28);
        for (var i = 0; i < imgData.data.length; i += 4) {
          imd[i / 4] = imgData.data[i + 3] / 255.0;
        }


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

        for (var i = 0; i < 28; ++i) {
          for (var j = 0; j < 28; ++j) {
            previewImgData.data[((i * 28) + j) * 4 + 3] = bitmap[i][j] * 255;
          }
        }

        preview.putImageData(previewImgData, 0, 0);
        
        update_probabilities();

        for (var i = 0; i <= 9; ++i) {
          scope.digits[i] = (ps[i]).toFixed(3);
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
        for (var i = 0; i < 1; i += 0.1) {
          ctx.beginPath();
          ctx.arc(cX + (lX - cX) * i, cY + (lY - cY) * i, 33, 0, 2 * Math.PI, false);
          ctx.fillStyle = "#00000055";
          ctx.fill();
        }
      }
    }
  };
});
