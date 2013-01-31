'use strict';
ViewState.prototype = new ParentingObject();
/**
 * Construct a ViewState.
 * @constructor
 * @param {Object} svg A d3 svg.
 */
function ViewState(svg) {

    // keep the 'real' svg private
    this._svg = svg;
    // publish a viewport that we can shift around.
    this.svg = this._svg.append('g');

    /* Events */
    // this works fine, contra viewobj.js
    var that = this;
    var dragHandler = d3.behavior.drag()
        .origin(function(d) {
            return {x: -that.position[0], y: -that.position[1]};
        })
        .on('drag', function(d) {
            that.moveTo([-d3.event.x, -d3.event.y]);
        });
    this._svg.call(dragHandler);

    this._svg.on('click', function() {
        if (that.mouseData.inDropState) {
            that.finishAddingView([d3.event.x, d3.event.y]);
        }
    });

    // cannot for the life of me work out what the translate vector represents.
    var oldScale = 1;
    var zoomHandler = d3.behavior.zoom();
    zoomHandler.on('zoom', function(d) {
        var scale = d3.event.scale / oldScale;
        // because the preferred way doesn't work, attempt this to break the
        // double-click thingy
        if (d3.event.sourceEvent.type == 'dblclick' ||
            d3.event.sourceEvent.type == 'touchstart') {
            return;
        }
        if (d3.event.sourceEvent.webkitDirectionInvertedFromDevice) {
            scale = 1 / scale;
        }
        that.zoom(scale, d3.mouse(this));
        oldScale = d3.event.scale;
    });
    //.on('dblclick.zoom',null);
    // ^ doesn't work, despite being what is suggested in
    // http://stackoverflow.com/a/11788800/463510
    // by mbostock himself.
    this._svg.call(zoomHandler);

    this.centreView();

    this.mouseData = {};
    this.mouseData.inDropState = false;

    // zoom
    this.renderTimeout = -1;
    this.scaleFactor = 1;
}

/**
 * Calculate the size so something of value scaleMax can fit on screen.
 * Adjusts the scaler to match.
 * @param {number} scaleMax The largest thing that should fit on the screen.
 */
ViewState.prototype.calculateSize = function(scaleMax) {

    this.width = window.innerWidth * 0.99;
    this.height = (window.innerHeight - 30);
    var maxOuterRadius = Math.min(this.width, this.height) / 2;

    this._svg.attr('style',
                   'width: ' + this.width + 'px; ' +
                   'height: ' + this.height + 'px;');

    this.scaleMax = scaleMax;

    this.scaler = d3.scale.sqrt()
        .domain([0, this.scaleMax]).range([0, maxOuterRadius]);
};
/** 
 * Move the ViewState object to the centre of the display
 */
ViewState.prototype.centreView = function() {
    this.calculateSize(tril);
    this.moveTo([-this.width / 2, -this.height / 2]);
};

/**
 * Zoom the view
 *
 * @param {number} factor The desired zoom factor,
 *                        relative to the existing zoom.
 * @param {Array.<number>} about The point about which to zoom.
 *                               Pixels relative to top left corner.
 * @param {boolean=} immediate Whether or not to force rendering now or allow
 *                             it to be deferred.
 */
ViewState.prototype.zoom = function(factor, about, immediate) {
    try {
        window.clearTimeout(this.renderTimeout);
    } catch (err) {}

    // we want the dollar value at about to be invariant upon scaling.
    var aboutDollars = [about[0] + this.position[0],
                        about[1] + this.position[1]].map(this.scaler.invert);

    this.scaleFactor = this.scaler.invert(this.scaleFactor);

    this.scaleMax /= factor;
    this.scaler = this.scaler.domain([0, this.scaleMax]);

    this.scaleFactor = this.scaler(this.scaleFactor);

    aboutDollars = aboutDollars.map(this.scaler);
    this.position = [aboutDollars[0] - about[0],
                     aboutDollars[1] - about[1]];

    var that = this;
    var doRealZoom = function() {
        that.svg.attr('transform',
                      'translate(' + -that.position[0] +
                      ',' + -that.position[1] + ')');
        that.children().map(function(child) {child.render()});
        that.scaleFactor = 1;
    };

    if (immediate) {
        doRealZoom();
    } else {
        this.svg.attr('transform',
                      'translate(' + (-this.position[0] + ',' +
                                     -this.position[1] + ') ') +
                      'scale(' + this.scaleFactor + ')');
        this.renderTimeout = window.setTimeout(doRealZoom, 50);
    }
};

/**
 * Centre display around an object
 *
 * @param {Object} viewObj Object on which to centre display
*/
ViewState.prototype.centreViewOn = function(viewObj) {
    var bbox = viewObj.svg[0][0].getBBox();

    var doesHeightLimit =
        ((this.height / bbox.height) < (this.width / bbox.width)) ?
        true : false;

    if (doesHeightLimit) {
        var scaleFactor = (this.scaler.invert(this.height / 2)) /
            this.scaler.invert(bbox.height / 2);
    } else {
        var scaleFactor = (this.scaler.invert(this.width / 2)) /
            this.scaler.invert(bbox.width / 2);
    }

    this.zoom(scaleFactor, [0, 0], true);
    bbox = viewObj.svg[0][0].getBBox();

    var xpos = bbox.x;
    var ypos = bbox.y;
    var obj = viewObj;
    while (!(obj instanceof ViewState)) {
        xpos += this.scaler(obj.position[0]);
        ypos += this.scaler(obj.position[1]);
        obj = obj.parent;
    }

    this.moveTo([xpos - (this.width - bbox.width) / 2,
                 ypos - (this.height - bbox.height) / 2]);
};

/**
 * Use svg to translate the current object to a new position
 *  
 * @param {Position} position Array of x,y location
 */
ViewState.prototype.moveTo = function(position) {
    this.position = position;
    this.svg.attr('transform',
                  'translate(' + (-this.position[0] + ',' +
                                 -this.position[1]) + ')');
};

/**
 * Use svg to translate the current object to an offset from the current position
 *  
 * @param {Position} position Array of x,y location as offset
 */
ViewState.prototype.move = function(position) {
    this.position[0] += position[0];
    this.position[1] += position[1];
    this.moveTo(this.position);
};

/**
 * repositionChildren stub
 *  
 */
ViewState.prototype.repositionChildren = function() {};

/**
 * Begin process to add view data
 *  
 * @param {Object} data Dropped data to view
 */
ViewState.prototype.beginAddingView = function(data) {
    this._addingData = data;
    this.mouseData.inDropState = true;
};

/**
 * Complete add view data by specifying offset from current location to display it
 *  
 * @param {Position} position Array of x,y location as offset
 */
ViewState.prototype.finishAddingView = function(position) {

    position[0] += this.position[0];
    position[1] += this.position[1];

    position = position.map(this.scaler.invert);

    var vo = new ViewObj(this._addingData, this, position);
    vo.period('2011-12');
    vo.render();

    this.mouseData.inDropState = false;
};
