var $colorPalette = $(".select-color ul");
var $canvas = $("#drawingboard");
var $buffer = $("#buffer");
var ctx = $canvas[0].getContext("2d");
var bufferctx = $buffer[0].getContext("2d");
var mouseDown = false;
var canvasClicked = false;

// Adds selected class to chosen color
$colorPalette.on("click", "li", function() {
  selectColor($(this));
});

function sendPosition(e,ctx){
  var res={
    "type":"position",
    "url":window.location.href,
    "position":{
      "x":e.offsetX,
      "y":e.offsetY,
      "size":ctx.lineWidth,
      "color":ctx.strokeStyle
    }
  };
  sock.send(JSON.stringify(res));
}

function resizeCanvas(){
  //NOT WORKING PROPERLY
  //TO DO
  var w=window.innerWidth;
  var h=window.innerHeight;
  
  bufferctx.canvas.width = w;
  bufferctx.canvas.height = h;
  bufferctx.drawImage(ctx.canvas, 0, 0);

  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.drawImage(bufferctx.canvas, 0, 0);
}

function initCanvas() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

        /**
         * Your drawings need to be inside this function otherwise they will be reset when 
         * you resize the browser window and the canvas goes will be cleared.
         */
        // Appends new color onto color selection menu
        $(".add-color-btn").on("click", function() {
          var $newColor = $("<li></li>").hide();
          $newColor.css("background", currentColor());
          $colorPalette.append($newColor);
          selectColor($newColor);
          $newColor.animate({ width: 'toggle' }, 200);
          togglePanel();
        });

        // Allows user to draw onto canvas
        $canvas.mousedown(function(e) {
          lastEvent = e;
          mouseDown = true;
        }).mousemove(function(e) {
          if (mouseDown) {
            // console.log(ctx);
            ctx.beginPath();
            ctx.moveTo(lastEvent.offsetX, lastEvent.offsetY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = $(".selected").css("background-color");
            ctx.lineWidth = $("#line-size").val();
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.stroke();
            sendPosition(e,ctx);
            lastEvent = e;
          }
        }).mouseup(function() {
          mouseDown = false;
        }).mouseleave(function() {
          $canvas.mouseup();
        });

}

// Removes class from siblings, adds class to chosen
function selectColor(e) {
  e.siblings().removeClass("selected");
  e.addClass("selected");
}


// Toggles and animates hidden panel
$(".new-color-btn").click("click", function() {
  togglePanel();
});

// Allows animation to toggle
function togglePanel() {
  renewElement($(".anim-wrap"));
  var $animated = $(".anim-wrap");
  var shown = $animated.hasClass('on');
  $animated.toggleClass('on', !shown).toggleClass('off', shown);
}

// Allows animation to play more than once
function renewElement(e) {
  var newElement = e.clone(true);
  e.remove();
  $(".new-color").append(newElement);
}

// Changes the color preview to the user defined color
$(".rgb-sliders input").change(function() {
  $(".color-preview").css("background", currentColor());
});

// Returns the RGB from the defined slider values
function currentColor() {
  var r = $("#red").val();
  var g = $("#green").val();
  var b = $("#blue").val();
  var color = "rgb(" + r + "," + g + "," + b + ")";

  return color;
}

$(window).resize(function(){
  resizeCanvas();
});

initCanvas();


