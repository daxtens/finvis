//"use strict";
ViewState.prototype = new ParentingObject();
/**
 * Construct a ViewState.
 * @constructor
 * @param svg A d3 svg.
 */
function ViewState(svg) {
    
    // keep the 'real' svg private
    this._svg = svg;
    // publish a viewport that we can shift around.
    this.svg = this._svg.append("g");

    /* Events */
    // this works fine, contra viewobj.js
    var that = this;
    var dragHandler = d3.behavior.drag()
        .origin(function (d) {
            return {x: -that.position[0], y: -that.position[1]};
        })
        .on("drag", function (d) {
            that.moveTo([-d3.event.x, -d3.event.y]);
        });
    this._svg.call(dragHandler);

    this.svg.on('click', function() {
        if (that.mouseData.inDropState) {
	    that.finishAddingView( [ d3.event.x, d3.event.y ] );
        }
    });

    this.centreView();

    this.mouseData = {};
    this.mouseData.isDrag=false;
    this.mouseData.isInObjDrag=false;
    this.mouseData.objMoveHandler = function () {};
    this.mouseData.objUpHandler = function () {};
    this.mouseData.startX=0;
    this.mouseData.startY=0;


    // zoom
    this.renderTimeout = -1;
    this.scaleFactor = 1;
}

/** 
 * Calculate the size so something of value scaleMax can fit on screen.
 * Adjusts the scaler to match.
 * @param {number} scaleMax The largest thing that should fit on the screen.
 */
ViewState.prototype.calculateSize = function (scaleMax) {

    this.width = window.innerWidth*0.99;
    this.height = (window.innerHeight-30);
    var maxOuterRadius = Math.min(this.width, this.height) / 2;
    
    this._svg.attr("style", "width: "+this.width+"px; height: "+this.height+"px;");
    
    this.scaleMax = scaleMax;
    
    this.scaler = d3.scale.sqrt().domain([0,this.scaleMax]).range([0,maxOuterRadius]);
}

ViewState.prototype.centreView = function () {
    this.calculateSize(tril);
    this.moveTo([-this.width/2, -this.height/2]);
}

/**
 * @param {Array.<number>} about The point about which to zoom.
 *                               Pixels relative to top left corner.
 */
ViewState.prototype.zoom = function (factor, about, immediate) {
    try {
	window.clearTimeout( this.renderTimeout );
    } catch (err) {}

    // we want the dollar value at about to be invariant upon scaling.
    var aboutDollars = [about[0] + this.position[0],
                        about[1] + this.position[1]].map(this.scaler.invert);

    this.scaleFactor = this.scaler.invert(this.scaleFactor);

    this.scaleMax /= factor;
    this.scaler = this.scaler.domain([0,this.scaleMax]);

    this.scaleFactor = this.scaler(this.scaleFactor);

    aboutDollars = aboutDollars.map(this.scaler);
    this.position = [aboutDollars[0] - about[0],
                     aboutDollars[1] - about[1]];

    var that = this;
    var doRealZoom = function() {
        that.svg.attr("transform",
                      "translate("+-that.position[0]+
                      ","+-that.position[1]+")");
	that.children().map( function(child) {child.render()} );
	that.scaleFactor = 1;
    }

    if (immediate) {
	doRealZoom();
    } else {
	this.svg.attr("transform","translate("+-this.position[0]+","+-this.position[1]+") scale("+this.scaleFactor+")")
	var that = this;
	this.renderTimeout = window.setTimeout(doRealZoom, 50);
    }
}

ViewState.prototype.centreViewOn = function( viewObj ) {
    var bbox = viewObj.svg[0][0].getBBox();
    
    var doesHeightLimit = ( (this.height/bbox.height) < (this.width/bbox.width) ) ? true : false;

    if (doesHeightLimit) {
	var scaleFactor = (this.scaler.invert(this.height/2))/this.scaler.invert(bbox.height/2);
    } else {
	var scaleFactor = (this.scaler.invert(this.width/2))/this.scaler.invert(bbox.width/2);
    }

    this.zoom(scaleFactor, [0,0], true);
    bbox = viewObj.svg[0][0].getBBox();
    
    var xpos = bbox.x;
    var ypos = bbox.y;
    var obj = viewObj;
    while (!(obj instanceof ViewState)) {
	xpos += this.scaler(obj.position[0]);
	ypos += this.scaler(obj.position[1]);
	obj = obj.parent;
    }

    this.moveTo( [xpos-(this.width-bbox.width)/2, 
		  ypos-(this.height-bbox.height)/2] );
}

/***** movement */
// units are not! dollars
ViewState.prototype.moveTo = function (position) {
    this.position = position;
    this.svg.attr("transform","translate("+-this.position[0]+","+-this.position[1]+")")
}

ViewState.prototype.move = function (position) {
    this.position[0] += position[0];
    this.position[1] += position[1];
    this.moveTo(this.position);
}

ViewState.prototype.repositionChildren = function () {};

ViewState.prototype.beginAddingView = function (data) {
    this._addingData = data;
    this.mouseData.inDropState = true;
}

ViewState.prototype.finishAddingView = function (position) {

    position[0] += this.position[0];
    position[1] += this.position[1];

    position = position.map( viewstate.scaler.invert );

    var vo = new ViewObj( this._addingData, this, position );
    vo.period('2011-12');
    vo.render();

    this.mouseData.inDropState=false;
}