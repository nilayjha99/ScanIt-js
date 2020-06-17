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

var layer = new Konva.Layer();
stage.add(layer);


 // alternative API:
Konva.Image.fromURL('https://p2.piqsels.com/preview/891/296/1003/notebook-pen-book-dairy.jpg', function (darthNode) {
        darthNode.setAttrs({
          x: 50,
          y: 50,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        layer.add(darthNode);
        darthNode.moveToBottom();
        layer.batchDraw();
      });

// function to generate a list of "targets" (circles)
function generateTargets() {
  var number = 4;
  var result = [];
  var points = [[50, 50], [250, 50], [250, 250], [50, 250]];
  while (result.length < number) {
    result.push({
      id: "target-" + result.length,
      x: points[result.length][0] + 100,
      y: points[result.length][1] + 100
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
