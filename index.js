// Import stylesheets
import "./style.css";
import Konva from "konva";

// Write Javascript code!
// const appDiv = document.getElementById('app');
// appDiv.innerHTML = `<h1>JS Starter</h1>`;
var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
  container: "app",
  width: width,
  height: height
});

var output = new Konva.Stage({
  container: "app1",
  width: width,
  height: height
});

var layer = new Konva.Layer();
stage.add(layer);


var layer1 = new Konva.Layer();
output.add(layer1);

var rect1 = new Konva.Rect({
        x: 50,
        y: 50,
        width: 450,
        height: 350,
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 4,
  });
      // add the shape to the layer
layer1.add(rect1);
layer1.draw()  

 // alternative API:

// main API:
var img = new Image();
var yoda = null;
var image = null;
// var img = new Image()

img.onload = function () {
  yoda = new Konva.Image({
    x: 0,
    y: 0,
    image: img,
    // scaleX: 0.5,
    // scaleY: 0.5
  });

  // add the shape to the layer
  layer.add(yoda);
  yoda.moveToBottom();
  layer.batchDraw();
};
img.src = 'https://p2.piqsels.com/preview/891/296/1003/notebook-pen-book-dairy.jpg';

// Konva.Image.fromURL('https://p2.piqsels.com/preview/891/296/1003/notebook-pen-book-dairy.jpg', function (darthNode) {
//         darthNode.setAttrs({
//           x: 50,
//           y: 50,
//           scaleX: 0.5,
//           scaleY: 0.5,
//         });
//         layer.add(darthNode);
//         darthNode.moveToBottom();
//         layer.batchDraw();
//       });

// function to generate a list of "targets" (circles)
function generateTargets() {
  var number = 4;
  var result = [];
  var points = [[50, 50, 'TL'], [250, 50, 'TR'], [250, 250, 'BR'], [50, 250, 'BL']];
  while (result.length < number) {
    result.push({
      id: "target-" + result.length,
      x: points[result.length][0] + 100,
      y: points[result.length][1] + 100,
      dir: points[result.length][2]
    });
  }
  return result;
}

var targets = generateTargets();
// function to generate arrows between targets
function generateConnectors() {
  var number = 4;
  var result = [];
  var seq1 = [0,1,2,3];
  var seq2 = [1,2,3,0];
  while (result.length < number) {
    var from = "target-" + seq1[result.length];
    var to = "target-" + seq2[result.length];
    if (from === to) {
      continue;
    }
    result.push({
      id: "connector-" + result.length,
      from: from,
      to: to
    });
  }
  return result;
}

function getConnectorPoints(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let angle = Math.atan2(-dy, dx);

  const radius = 10;

  return [
    from.x + -radius * Math.cos(angle + Math.PI),
    from.y + radius * Math.sin(angle + Math.PI),
    to.x + -radius * Math.cos(angle),
    to.y + radius * Math.sin(angle)
  ];
}

var connectors = generateConnectors();

// update all objects on the canvas from the state of the app
function updateObjects() {
  targets.forEach(target => {
    var node = layer.findOne("#" + target.id);
    node.x(target.x);
    node.y(target.y);
  });
  connectors.forEach(connect => {
    var line = layer.findOne("#" + connect.id);
    var fromNode = layer.findOne("#" + connect.from);
    var toNode = layer.findOne("#" + connect.to);

    const points = getConnectorPoints(fromNode.position(), toNode.position());
    line.points(points);
  });
  layer.batchDraw();
}

// generate nodes for the app
connectors.forEach(connect => {
  var line = new Konva.Line({
    stroke: "#32a852",
    strokeWidth: 3,
    id: connect.id,
    fill: "#32a852"
  });
  layer.add(line);
});

targets.forEach(target => {
  var node = new Konva.Circle({
    id: target.id,
    fill: "#fff",
    radius: 5,
    shadowBlur: 10,
    draggable: true
  });
  layer.add(node);

  node.on("dragmove", () => {
    // mutate the state
    target.x = node.x();
    target.y = node.y();

    // update nodes from the new state
    updateObjects();
  });
});


updateObjects();

// function start(){

//   // set canvas sizes equal to image size
//   cw=canvas.width=canvas1.width=img.width;
//   ch=canvas.height=canvas1.height=img.height;

//   // draw the example image on the source canvas
//   ctx.drawImage(img,0,0);

//   // unwarp the source rectangle and draw it to the destination canvas
//   unwarp(anchors,unwarped,ctx1);

// }

document.getElementById("btn").onclick = () => {

  var anchors = {
    TL: targets.filter(x => x.dir === 'TL')[0],
    TR: targets.filter(x => x.dir === 'TR')[0],
    BR: targets.filter(x => x.dir === 'BR')[0],
    BL: targets.filter(x => x.dir === 'BL')[0]
    };

    var contours = {
      TL:{x:anchors.TL.x,y:anchors.TL.y},        // r
      TR:{x:anchors.TR.x,y:anchors.TR.y},      // g
      BR:{x:anchors.BR.x,y:anchors.BR.y},    // b
      BL:{x:anchors.BL.x,y:anchors.BL.y},
    }
    var unwrapped = {
      TL:{x:0,y:0},        // r
      TR:{x:300,y:0},      // g
      BR:{x:300,y:300},    // b
      BL:{x:0,y:300},
    }

   unwarp(contours, unwrapped, layer1.canvas.context, layer.canvas.context)
}

// unwarp the source rectangle
function unwarp(anchors,unwarped,context, ctx1){

  // clear the destination canvas
  context.clearRect(0,0,context.canvas.width,context.canvas.height);

  // unwarp the bottom-left triangle of the warped polygon
  mapTriangle(context,
              anchors.TL,  anchors.BR,  anchors.BL,
              unwarped.TL, unwarped.BR, unwarped.BL
             );

  // eliminate slight space between triangles
  ctx1.translate(-1,1);

  // unwarp the top-right triangle of the warped polygon
  mapTriangle(context,
              anchors.TL,  anchors.TR,  anchors.BR,
              unwarped.TL, unwarped.TR, unwarped.BR
             );

}


// Perspective mapping: Map warped triangle into unwarped triangle
// Attribution: (SO user: 6502), http://stackoverflow.com/questions/4774172/image-manipulation-and-texture-mapping-using-html5-canvas/4774298#4774298
function mapTriangle(ctx,p0, p1, p2, p_0, p_1, p_2) {

  // break out the individual triangles x's & y's
  var x0=p_0.x, y0=p_0.y;
  var x1=p_1.x, y1=p_1.y;
  var x2=p_2.x, y2=p_2.y;
  var u0=p0.x,  v0=p0.y;
  var u1=p1.x,  v1=p1.y;
  var u2=p2.x,  v2=p2.y;

  // save the unclipped & untransformed destination canvas
  ctx.save();

  // clip the destination canvas to the unwarped destination triangle
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.clip();

  // Compute matrix transform
  var delta   = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
  var delta_a = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
  var delta_b = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
  var delta_c = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2;
  var delta_d = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
  var delta_e = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
  var delta_f = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;

  // Draw the transformed image
  ctx.transform(
    delta_a / delta, delta_d / delta,
    delta_b / delta, delta_e / delta,
    delta_c / delta, delta_f / delta
  );

  // draw the transformed source image to the destination canvas
  ctx.drawImage(img,0,0);

  // restore the context to it's unclipped untransformed state
  ctx.restore();
}