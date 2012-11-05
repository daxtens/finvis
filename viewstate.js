"use strict";
ViewState.prototype = new ParentingObject();
/***** General Constructor */
function ViewState(svg) {
	
	// keep the 'real' svg private
	this._svg = svg;
	// publish a viewport that we can shift around.
	this.svg = this._svg.append("g");

	this.centerView();

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

ViewState.prototype.centerView = function () {
	this.calculateSize(tril);
	this.moveTo([-this.width/2, -this.height/2]);
}

ViewState.prototype.zoom = function (factor) {
	this.scaleMax /= factor;
	this.scaler = this.scaler.domain([0,this.scaleMax]);
	this.children().map( function(child) {child.render()} );
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
