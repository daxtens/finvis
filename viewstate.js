"use strict";
ViewState.prototype = new ParentingObject();
/***** General Constructor */
function ViewState(svg) {
	
	// keep the 'real' svg private
	this._svg = svg;
	// publish a viewport that we can shift around.
	this.svg = this._svg.append("g");

	this.centreView();

    this.mouseData = {};
    this.mouseData.inDrag=false;
    this.mouseData.isInObjDrag=false;
    this.mouseData.objMoveHandler = function () {};
    this.mouseData.objUpHandler = function () {};
    this.mouseData.startX=0;
    this.mouseData.startY=0;

}

/***** size and scaling */
// calculate the size so something of value scaleMax can fit on screen.
ViewState.prototype.calculateSize = function (scaleMax) {

	this.width = window.outerWidth*0.9;
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

ViewState.prototype.zoom = function (factor) {
	this.scaleMax /= factor;
	this.scaler = this.scaler.domain([0,this.scaleMax]);
	this.children().map( function(child) {child.render()} );
}

ViewState.prototype.centreViewOn = function( viewObj ) {
    var bbox = viewObj.svg[0][0].getBBox();
    
    var doesHeightLimit = ( (this.height/bbox.height) < (this.width/bbox.width) ) ? true : false;

    if (doesHeightLimit) {
	var scaleFactor = (this.scaler.invert(this.height/2))/this.scaler.invert(bbox.height/2);
    } else {
	var scaleFactor = (this.scaler.invert(this.width/2))/this.scaler.invert(bbox.width/2);
    }

    this.zoom(scaleFactor);
    bbox = viewObj.svg[0][0].getBBox();
   
    this.moveTo( [bbox.x+this.scaler(viewObj.position[0])-(this.width-bbox.width)/2, 
		  bbox.y+this.scaler(viewObj.position[1])-(this.height-bbox.height)/2] );
}

/***** movement */
// units are not! dollars
ViewState.prototype.moveTo = function (position) {
	if (arguments.length == 2) position = arguments;
	this.position = position;
	this.svg.attr("transform","translate("+-this.position[0]+","+-this.position[1]+")")
}

ViewState.prototype.move = function (position) {
	if (arguments.length == 2) position = arguments;
	this.position[0] += position[0];
	this.position[1] += position[1];
	this.moveTo(this.position);
}

ViewState.prototype.repositionChildren = function () {};