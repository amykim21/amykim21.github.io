// https://www.freecodecamp.org/news/learn-d3-js-in-5-minutes-c5ec29fb0725/
// import * as d3 from "d3"; // not necessary it seems
// import * as d3 from "./node_modules/d3";
// import * as d3 from "https://cdn.skypack.dev/d3@7";
// import { sort } from "d3";
// import * as d3 from "https://d3js.org/d3.v4.min.js";

// d3.select('h3').style('color', 'blue');
// d3.select('h3').style('font-size', '24px');
// d3.select('div').style('display', 'inline-block');

/* https://www.tutorialsteacher.com/d3js/function-of-data-in-d3js
Took the skeleton of how to make a function in V3
*/

var pointID = 0; // unique id for each point and its dual line
var points = [];
var hulls = {upperHull: [], lowerHull: []};
var dualLines = []; // dual plane version of points

// var stack = [];
var x;
var y;
const cr = 5; // point radius, in pixels

var width = 500;
var height = 500;

/* https://www.tutorialsteacher.com/codeeditor?cid=d3-37
Skeleton for appending a circle to an svg element
*/
//Create SVG element
var svg = d3.select("body")
// var svg = d3.select("gs")
            .append("svg")
            .attr("class", "gs")
            .attr("id", "gsSVG")
            .attr("width", width)
            .attr("height", height)
            .attr("style", "border:1px solid #000000;");
            // .attr("display", "inline-block");

var dualSvg = d3.select("body")
// var dualSvg = d3.select("dp")
                .append("svg")
                .attr("class", "dp")
                .attr("id", "dpSVG")
                .attr("width", width)
                .attr("height", height)
                .attr("style", "border:1px solid #000000;");
                // .attr("display", "inline-block");


document.getElementById("gsButton").addEventListener("click", function() {
    console.log("gsButton clicked");

    const lowerH = lowerHull();
    console.log(lowerH);
    for(var i = 0; i < lowerH.length-1; i++) {
        var point1 = lowerH[i];
        var point2 = lowerH[i+1];
        // draw lines between lower hull points, left to right
        drawLine(point1.x, point1.y, point2.x, point2.y, "red");

        // color dual line as red also
        document.getElementById(point1.pointID).style("stroke", "red");
    }
    


    const upperH = upperHull();
    console.log(upperH);
    for(var i = 0; i < upperH.length-1; i++) {
        var point1 = upperH[i];
        var point2 = upperH[i+1];
        // draw lines between lower hull points, left to right
        drawLine(point1.x, point1.y, point2.x, point2.y, "blue");

        // color dual line as bleu also
        document.getElementById(point1.pointID).style("stroke", "blue");
    }

});

document.getElementById("resetButton").addEventListener("click", function() {
    console.log("resetButton clicked");

    svg.selectAll("*").remove();

    points = [];
});

document.getElementById("resetButtonDualPlane").addEventListener("click", function() {
    console.log("resetButtonDualPlane clicked");

    dualSvg.selectAll("*").remove();

    // dualLines = [];
});



d3.select("svg")
    .on("click", function() {
    var xy = d3.mouse(this);
    // console.log(xy); // x and y coordinates; (0, 0) is top left
    x = xy[0];
    y = xy[1];

    var point = {x: x, y: y, pointID: pointID}

    points.push(point);
    ++pointID;
    
    // draw point
    svg.append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", cr);

    // draw dual line
    var line = convertToDualLine(point);
    drawDualLine(line);


    const x1 = d3.mouse(this)[0];
    const y1 = d3.mouse(this)[1];


    var x2 = x1;
    var y2 = y1;

    if(points.length > 1) {
        x2 = points[points.length-2].x;
        y2 = points[points.length-2].y;
    }
    console.log(points);


    // svg.append("line")
    // .attr("class", "dashed")
    // .style("stroke-dasharray", ("10, 10")) // adding this line makes it dashed
    // // means 5 pixels draw, 5 pixels off
    // .style("stroke", "black")
    // .style("stroke-width", 5)
    // .attr("x1", x1)
    // .attr("y1", y1)
    // .attr("x2", x2)
    // .attr("y2", y2);
});

function drawDualLine(point) {
    dualSvg.append("line")
        .style("stroke", "black")
        .style("stroke-width", 5)
        .attr("id", point.pointID)
        .attr("x1", point.a1)
        .attr("y1", point.b1)
        .attr("x2", point.a2)
        .attr("y2", point.b2);
}

function drawLine(x1, y1, x2, y2, color) {
    svg.append("line")
        .style("stroke", color)
        .style("stroke-width", 5)
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
}

function drawDashedLine(x1, y1, x2, y2) {
    svg.append("line")
        .attr("class", "dashed")
        .style("stroke-dasharray", ("10, 10")) // adding this line makes it dashed
        // means 5 pixels draw, 5 pixels off
        .style("stroke", "black")
        .style("stroke-width", 5)
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
}

/*
if orient() < 0, then it is a right turn
if orient() > 0, then it is a left turn
if orient() = 0, then straight
*/
function orient(p, q, r) {
    const M = [
        [1, 1, 1],
        [p.x, q.x, r.x],
        [p.y, q.y, r.y]
    ];
    var det = (q.x * r.y - r.x * q.y) - (p.x * r.y - r.x * p.y) + (p.x * q.y - q.x * p.y);

    return det;
}

function upperHull() {
    var stack = []; // will contain convex hull
    var sorted = Array.from(points); // make copy

    // sort points by x-coordinate
    sorted.sort((a, b) => {
        return (a.x-b.x);
    });

    if(sorted.length > 1) {
        stack.push(sorted[0]);
        stack.push(sorted[1]);
    } else {
        console.log("need more points for convex hull");
        return stack;
    }

    for(var i = 2; i < sorted.length; i++) {
        const point = sorted[i];
        console.log(orient(stack[stack.length-2], stack[stack.length-1], point));
        while(stack.length > 1 && orient(stack[stack.length-2], stack[stack.length-1], point) < 0) {
            stack.pop();
        }
        stack.push(point);
    }
    hulls.upperHull = stack;
    return stack; // array of points
}

function lowerHull() {
    var stack = []; // will contain convex hull
    var sorted = Array.from(points); // make copy

    // sort points by x-coordinate
    sorted.sort((a, b) => {
        return (a.x-b.x);
    });

    if(sorted.length > 1) {
        stack.push(sorted[0]);
        stack.push(sorted[1]);
    } else {
        console.log("need more points for convex hull");
        return stack;
    }

    for(var i = 2; i < sorted.length; i++) {
        const point = sorted[i];
        console.log("lowerHull orient: " + orient(stack[stack.length-2], stack[stack.length-1], point));
        while(stack.length > 1 && orient(stack[stack.length-2], stack[stack.length-1], point) > 0) {
            stack.pop();
        }
        stack.push(point);
    }
    hulls.lowerHull = stack;
    return stack;
}




// -----------------------------------Dual Plane----------------------------------------------

/* To make the dual lines more spread out and easier to visualize, I chose to have (0, 0)
 on the center of the primal plane and the dual plane.  Also, to have slopes be not too big,
 I chose to have the axes be scaled, so that slope is better visualized on the dual plane.
 This is different from the coordinate system of SVG, which has (0, 0) on the upper left;
  so adjustments must be made, but duality relationships stay the same.
*/

/*
(p, q) is the SVG coordinates of a point on the primal plane
returns: coordinates of the point in a center (0, 0) coordinate system
ex. primalPlaneGetCenteredCoords(0, 0) returns [-250, 250]
*/
function primalPlaneGetCenteredCoords(p, q) {
    return [(p-250)/50, (250-q)/50];
}

/*
(p, q) is the centered coordinates of a point on the dual plane
returns: coordinates of the point in a SVG coordinate system
ex. dualPlaneGetSVGCoords(0, 0) returns [250, 250]
*/
function dualPlaneGetSVGCoords(m, n) {
    return [(m*50+250), (250-n*50)];
}


function convertToDualLine(point) {
    const p = point.x;
    const q = point.y;
    var centeredCoords = primalPlaneGetCenteredCoords(p, q);
    var slope = 0;
    var yIntercept = 0;
    var a1 = 0;
    var b1 = 0;
    var a2 = 0;
    var b2 = 0;

    // do the math using centered coordinates
    // note: SVG's grid has (0, 0) on the upper left; y coordinate flipped
    slope = centeredCoords[0];
    yIntercept = -1 * centeredCoords[1];
    // set a1 and a2 as the leftmost and rightmost of the centered coordinates
    a1 = -250;
    a2 = 250;
    b1 = a1 * slope + yIntercept;
    b2 = a2 * slope + yIntercept;

    console.log("centeredCoords: " + centeredCoords);
    console.log("(slope, yIntercept): (" + slope + ", " + yIntercept + ")");
    console.log("(a1, b1): (" + a1 + ", " + b1 + ")");
    console.log("(a2, b2): (" + a2 + ", " + b2 + ")");

    // convert to SVG coordinates for graphing
    var line = {a1: dualPlaneGetSVGCoords(a1, b1)[0], b1: dualPlaneGetSVGCoords(a1, b1)[1],
    a2: dualPlaneGetSVGCoords(a2, b2)[0], b2: dualPlaneGetSVGCoords(a2, b2)[1], pointID: point.pointID};
    console.log("SVG line (a1, b1, a2, b2): " + line);
    // dualLines.push(line);

    return line;
}


