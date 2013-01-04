'use strict';

/**
 * Epsilon value for floating point equality.
 * @const
 */
var EPSILON = 1E-6;

/**
 * Calculates the minimum bounding circle for a set of points.
 * This a naive O(n^4) implementation.
 *
 * @param {Array.<Array.<number>>} pts A list of 2+ pts, [[x, y], ...].
 * @return {Object.<string, number>} cx, cy, radius of the circle.
 */
function minimumBoundingCircle(pts) {

    var areAllPtsInOrOnCircle = function(circle) {
        for (var i = 0; i < pts.length; i++) {
            if (!isPtInOrOnCircle(pts[i], circle)) return false;
        }
        return true;
    };

    // try every pair and triple
    var best = {radius: 9E9};

    for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
            var circle = circleFrom2Pts(pts[i], pts[j]);
            if (areAllPtsInOrOnCircle(circle) &&
                circle.radius < best.radius) {
                best.cx = circle.cx; best.cy = circle.cy;
                best.radius = circle.radius;
            }

            for (var k = j + 1; k < pts.length; k++) {
                try {
                    circle = circleFrom3Pts(pts[i], pts[j], pts[k]);
                    if (areAllPtsInOrOnCircle(circle) &&
                        circle.radius < best.radius) {
                        best.cx = circle.cx; best.cy = circle.cy;
                        best.radius = circle.radius;
                    }
                } catch (e) {
                    // something went wrong; probably collinear pts.
                    // ignore
                }
            }
        }
    }

    return best;
}

/**
 * Calculates the minimum bounding circle for a set of circles.
 * O(n^4)
 * I explain it a bit more at http://stackoverflow.com/a/14153613/463510
 *
 * @param {Array.<Object.<string, number>>} circles A list of 2+ circles.
 * @return {Object.<string, number>} {cx, cy, radius} of the circle.
 */
function minimumBoundingCircleForCircles(circles) {

    var areAllCirclesInOrOnCircle = function(circle) {
        for (var i = 0; i < circles.length; i++) {
            if (!isCircleInOrOnCircle(circles[i], circle)) return false;
        }
        return true;
    };

    // try every pair and triple
    var best = {radius: 9E9};

    for (var i = 0; i < circles.length; i++) {
        for (var j = i + 1; j < circles.length; j++) {
            var circle = circleFrom2Circles(circles[i], circles[j]);
            if (areAllCirclesInOrOnCircle(circle) &&
                circle.radius < best.radius) {
                best.cx = circle.cx; best.cy = circle.cy;
                best.radius = circle.radius;
            }

            for (var k = j + 1; k < circles.length; k++) {
                var signs = [-1, 1, 1, 1];
                circle = apollonius(circles[i], circles[j], circles[k],
                                    signs);
                if (areAllCirclesInOrOnCircle(circle) &&
                    circle.radius < best.radius) {
                    best.cx = circle.cx; best.cy = circle.cy;
                    best.radius = circle.radius;
                }
            }
        }
    }

    return best;
}



/**
 * Calculates a circle from 2 pts.
 *
 * @param {Array.<number>} pt1 The first pt, [x, y].
 * @param {Array.<number>} pt2 The second pt, [x, y].
 * @return {Object.<string, number>} cx, cy, radius of the circle.
 */
function circleFrom2Pts(pt1, pt2) {

    // diameter is |pt1-pt2|
    // the center is the midpoint of that line.
    var center = lineMidpoint(pt1, pt2);
    return { cx: center[0],
             cy: center[1],
             radius: lineLength(pt1, pt2) / 2 };
}

/**
 * Calculates a circle from 3 pts.
 * Stolen from http://stackoverflow.com/questions/4103405/what-is-the-algorithm-for-finding-the-center-of-a-circle-from-three-points
 *
 * @param {Array.<number>} pt1 The first pt, [x, y].
 * @param {Array.<number>} pt2 The second pt, [x, y].
 * @param {Array.<number>} pt3 The third pt, [x, y].
 * @return {Object.<string, number>} cx, cy, radius of the circle.
 */
function circleFrom3Pts(pt1, pt2, pt3) {
    var TOL = EPSILON;

    var offset = Math.pow(pt2[0], 2) + Math.pow(pt2[1], 2);
    var bc = (Math.pow(pt1[0], 2) + Math.pow(pt1[1], 2) - offset) / 2.0;
    var cd = (offset - Math.pow(pt3[0], 2) - Math.pow(pt3[1], 2)) / 2.0;
    var det = (pt1[0] - pt2[0]) * (pt2[1] - pt3[1]) - (pt2[0] - pt3[0]) *
              (pt1[1] - pt2[1]);

    if (Math.abs(det) < TOL) { throw 'error constructing circle'; }

    var idet = 1 / det;

    var centerx = (bc * (pt2[1] - pt3[1]) - cd * (pt1[1] - pt2[1])) * idet;
    var centery = (cd * (pt1[0] - pt2[0]) - bc * (pt2[0] - pt3[0])) * idet;
    var radius =
       Math.sqrt(Math.pow(pt2[0] - centerx, 2) + Math.pow(pt2[1] - centery, 2));

    return {cx: centerx, cy: centery, radius: radius};
}

/**
 * Is the point inside/on the circle?
 *
 * @param {Array.<number>} pt the point [x, y].
 * @param {Object.<string, number>} circle the circle {cx, cy, radius}.
 * @return {boolean} is the point inside/on the circle?
 */
function isPtInOrOnCircle(pt, circle) {
    return ((lineLength([circle.cx, circle.cy], pt) - EPSILON) < circle.radius);
}

/**
 * Calculates a circle from 2 circles.
 *
 * @param {Object.<string, number>} circle1 The first circle.
 * @param {Object.<string, number>} circle2 The second circle.
 * @return {Object.<string, number>} cx, cy, radius of the circle.
 */
function circleFrom2Circles(circle1, circle2) {

    var angle = Math.atan2(circle1.cy - circle2.cy,
                           circle1.cx - circle2.cx);

    var lineBetweenExtrema = [[circle1.cx + circle1.radius * Math.cos(angle),
                               circle1.cy + circle1.radius * Math.sin(angle)],
                              [circle2.cx - circle2.radius * Math.cos(angle),
                               circle2.cy - circle2.radius * Math.sin(angle)]];

    var center = lineMidpoint(lineBetweenExtrema[0], lineBetweenExtrema[1]);
    return { cx: center[0],
             cy: center[1],
             radius: lineLength(lineBetweenExtrema[0],
                                lineBetweenExtrema[1]) / 2
           };
}

/**
 * Solve the Problem of Apollonius: a circle tangent to all 3 circles.
 * http://mathworld.wolfram.com/ApolloniusProblem.html
 *
 * @param {Object.<string, number>} circle1 The first circle.
 * @param {Object.<string, number>} circle2 The second circle.
 * @param {Object.<string, number>} circle3 The third circle.
 * @param {Array.<number>} signs The array of signs to use.
 *                               [-1, 1, 1, 1] gives max circle.
 * @return {Object.<string, number>} The tangent circle.
 */
function apollonius(circle1, circle2, circle3, signs) {

    var sqr = function(x) { return x * x };

    var a1 = 2 * (circle1.cx - circle2.cx);
    var a2 = 2 * (circle1.cx - circle3.cx);
    var b1 = 2 * (circle1.cy - circle2.cy);
    var b2 = 2 * (circle1.cy - circle3.cy);
    var c1 = 2 * (signs[0] * circle1.radius + signs[1] * circle2.radius);
    var c2 = 2 * (signs[0] * circle1.radius + signs[2] * circle3.radius);
    var d1 = (sqr(circle1.cx) + sqr(circle1.cy) - sqr(circle1.radius)) -
             (sqr(circle2.cx) + sqr(circle2.cy) - sqr(circle2.radius));
    var d2 = (sqr(circle1.cx) + sqr(circle1.cy) - sqr(circle1.radius)) -
             (sqr(circle3.cx) + sqr(circle3.cy) - sqr(circle3.radius));

    // x = (p+q*r)/s; y = (t+u*r)/s

    var p = b2 * d1 - b1 * d2;
    var q = (- b2 * c1) + (b1 * c2);
    var s = a1 * b2 - b1 * a2;
    var t = - a2 * d1 + a1 * d2;
    var u = a2 * c1 - a1 * c2;

    // you are not expected to understand this.
    // It was generated using Mathematica's Solve function.
    var det = (2 * (-sqr(q) + sqr(s) - sqr(u)));
    var r = (1 / det) *
        (2 * p * q + 2 * circle1.radius * sqr(s) + 2 * t * u -
         2 * q * s * circle1.cx - 2 * s * u * circle1.cy + signs[3] *
         Math.sqrt(sqr(-2 * p * q - 2 * circle1.radius * sqr(s) - 2 * t * u +
                       2 * q * s * circle1.cx + 2 * s * u * circle1.cy) -
                   4 * (-sqr(q) + sqr(s) - sqr(u)) *
                   (-sqr(p) + sqr(circle1.radius) * sqr(s) - sqr(t) +
                    2 * p * s * circle1.cx - sqr(s) * sqr(circle1.cx) +
                    2 * s * t * circle1.cy - sqr(s) * sqr(circle1.cy))));

    //console.log(r);
    r = Math.abs(r);

    var x = (p + q * r) / s;

    var y = (t + u * r) / s;

    //console.log(x); console.log(y);
    return {cx: x, cy: y, radius: r};
}

/**
 * Is the circle inside/on another circle?
 *
 * @param {Object.<string, number>} innerCircle the inner circle.
 * @param {Object.<string, number>} outerCircle the outer circle.
 * @return {boolean} is the circle inside/on the circle?
 */
function isCircleInOrOnCircle(innerCircle, outerCircle) {
    return ((lineLength([innerCircle.cx, innerCircle.cy],
                        [outerCircle.cx, outerCircle.cy]) +
             innerCircle.radius - EPSILON) < outerCircle.radius);
}


/**
 * Calculates the length of a line.
 * @param {Array.<number>} pt1 The first pt, [x, y].
 * @param {Array.<number>} pt2 The second pt, [x, y].
 * @return {number} The length of the line.
 */
function lineLength(pt1, pt2) {
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) +
                     Math.pow(pt1[1] - pt2[1], 2));
}

/**
 * Calculates the midpoint of a line.
 * @param {Array.<number>} pt1 The first pt, [x, y].
 * @param {Array.<number>} pt2 The second pt, [x, y].
 * @return {Array.<number>} The midpoint of the line, [x, y].
 */
function lineMidpoint(pt1, pt2) {
    return [(pt1[0] + pt2[0]) / 2,
            (pt1[1] + pt2[1]) / 2];
}
