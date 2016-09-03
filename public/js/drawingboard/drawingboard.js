//Check if the changes are made by a user or due to change received from websockets.
var trueChanges=true;

var canvas;
function sendPosition(path){
  var res={
    "type":"path",
    "url":window.location.href,
    "path":path
  };
  sock.send(JSON.stringify(res));
}

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "rgb(" +r + "," + g + "," + b +")";
}

$(document).ready(function(){
  var $colorPalette = $(".select-color ul");
  var $strokeWidth = $("#line-size");
  canvas = new fabric.Canvas('drawingboard',{
    isDrawingMode:true
  });
  var mouseDown = false;
  var canvasClicked = false;

  $(".barbaad").spectrum({
      color: "#f00",
      move:function(color){
        $('.add-color').css("background",color.toHexString());

      },
      change: function(color) {
          $("<li></li>").css('background',color.toHexString()).attr("value",color.toHexString()).insertBefore(".add-color");
      }
  });

  // Adds selected class to chosen color
  $colorPalette.on("click", "li", function() {
     if(!$(this).hasClass('add-color')){
      canvas.freeDrawingBrush.color = $(this).attr('value');
      selectColor($(this));
    }
  });

  $strokeWidth.on("change",function(e){
    console.log(e.target.value);
    canvas.freeDrawingBrush.width=e.target.value;
  });

  sock.onmessage=function(change){
    change=JSON.parse(change.data);
    console.log("Haila server bolta hai: ");
    //These changes must not send the message to the websockets.
    trueChanges=false;
    //Make changes to the clients
    switch(change.type){
      case "path":
        var change_path=$(change.path);
        var to_add=new fabric.Path(change_path.attr('d'));
        to_add.fill=null;
        to_add.stroke=change_path.css("stroke");
        to_add.strokeWidth=parseInt(change_path.css("stroke-width"));
        console.log(to_add);
        // to_add.set({opacity:0});
        canvas.add(to_add);
        break;
    }
  };

  function initCanvas() {
          canvas.setWidth(window.innerWidth);
          canvas.setHeight(window.innerHeight);

          $.ajax({
            url:'/getPaths',
            type:"GET",
            data:{'url':window.location.pathname.replace("/board/","")},
            success:function(data){
              console.log(data);
              if(data.status=="failed"){
                errorDisplay(data.error);
              }
              else{
                data.paths.forEach(function(path){
                  var change_path=$(path);
                  var to_add=new fabric.Path(change_path.attr('d'));
                  to_add.fill=null;
                  to_add.stroke=change_path.css("stroke");
                  to_add.strokeWidth=parseInt(change_path.css("stroke-width"));
                  console.log(to_add);
                  // to_add.set({opacity:0});
                  canvas.add(to_add);

                });
              }
            },
            error:function(req,error){
              console.log(error);
            }
          });


          canvas.on('path:created',function(path){
            if(trueChanges===true){            
              path=path.path;
              console.log(path);
              sendPosition(path.toSVG());
            }
            trueChanges=true;
          });

          /**
           * Your drawings need to be inside this function otherwise they will be reset when 
           * you resize the browser window and the canvas goes will be cleared.
           */
          // Appends new color onto color selection menu
          // $(".add-color-btn").on("click", function() {
          //   var $newColor = $("<li></li>").hide();
          //   $newColor.css("background", currentColor());
          //   $colorPalette.append($newColor);
          //   selectColor($newColor);
          //   $newColor.animate({ width: 'toggle' }, 200);
          //   togglePanel();
          // });

          // // Allows user to draw onto canvas
          // $canvas.mousedown(function(e) {
          //   lastEvent = e;
          //   mouseDown = true;
          // }).mousemove(function(e) {
          //   if (mouseDown) {
          //     // console.log(ctx);
          //     ctx.beginPath();
          //     ctx.moveTo(lastEvent.offsetX, lastEvent.offsetY);
          //     ctx.lineTo(e.offsetX, e.offsetY);
          //     ctx.strokeStyle = $(".selected").css("background-color");
          //     ctx.lineWidth = $("#line-size").val();
          //     ctx.lineJoin = ctx.lineCap = 'round';
          //     ctx.stroke();
          //     sendPosition(e,ctx);
          //     lastEvent = e;
          //   }
          // }).mouseup(function() {
          //   mouseDown = false;
          // }).mouseleave(function() {
          //   $canvas.mouseup();
          // });

  }
  initCanvas();
});



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


