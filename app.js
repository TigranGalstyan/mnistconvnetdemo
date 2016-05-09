if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}
  
var app = angular.module("Calc", []);
app.directive("drawing", function($window, $http){
  return {
    restrict: "A",
    link: function(scope, element) {

      scope.digits = new Array(10);

      for(var i = 0; i < 10; ++i ){ 
      	scope.digits[i] = "10%";
      }

      var ctx = element[0].getContext('2d');
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      var ps = [0,0,0,0,0,0,0,0,0,0];
      var bitmap = new Array(28);
      // the last coordinates before the current move
      var lastX;
      var lastY;
      
      
      var net = new convnetjs.Net(); 
      net.fromJSON(netstr);

      $window.requestAnimationFrame(update);
      
    //  update_probs();
      element.bind('mousedown', function(event){
        if(event.offsetX!==undefined){
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
      
      element.bind('mousemove', function(event){
        if(drawing){
          // get current mouse position
          if(event.offsetX!==undefined){
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
      element.bind('mouseup', function(event){
        // stop drawing
        drawing = false;
      });

      // canvas reset
      scope.reset = function(){
        element[0].width = element[0].width; 
      }
      
      function update() {
        var imgData=ctx.getImageData(0,0,560,560);
        // invert colors
        var imd = new Array(560*560);
        for(var i = 0; i<imgData.data.length; i += 4) {
          imd[i/4] = imgData.data[i+3 ]/255.0;

        }
        for(var i = 0; i < 28; ++i) {
          bitmap[i] = new Array(28);
          for(var j = 0; j < 28; ++j) {
            var pixel = 0.0;
            for(var k = 0; k < 20; ++k) {
              for(var t = 0; t < 20; ++t) {
                pixel += imd[i * 560 * 20 + j*20 + k*560 + t];
              }
            }
            pixel /= 400.0;
            bitmap[i][j]=pixel;
          }
        }
        update_probabilities();

        for(var i = 0; i <= 9; ++i) {
          scope.digits[i] = ps[i] * 100 + '%';
        }

        scope.$apply();
        
        $window.requestAnimationFrame(update);
      }
      function update_probabilities() {
        var sample = new convnetjs.Vol(28,28,1);
        for(var xc=0;xc<28;xc++) {
          for(var yc=0;yc<28;yc++) {
            sample.set(yc,xc,1, bitmap[xc][yc]- 0.5);
          }
        }
        var probability_volume = net.forward(sample).w;
        for(var i = 0; i < 10; ++i) {
          ps[i] = probability_volume[i];
        }
      }
      function draw(lX, lY, cX, cY){
        i = 0
        for(var i = 0; i < 1; i += 0.02) {
          ctx.beginPath();
          ctx.arc(cX + (lX - cX) * i, cY + (lY - cY) * i, 25, 0, 2 * Math.PI, false);
          ctx.strokeStyle = "#000000";
          ctx.fill();
        }
      }
    }
  };
});
