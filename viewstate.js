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

/***** size and scaling */
// calculate the size so something of value scaleMax can fit on screen.
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

ViewState.prototype.zoom = function (factor, immediate) {
	try {
		window.clearTimeout( this.renderTimeout );
	} catch (err) {}

	this.scaleFactor = this.scaler.invert(this.scaleFactor);

	this.scaleMax /= factor;
	this.scaler = this.scaler.domain([0,this.scaleMax]);

	this.scaleFactor = this.scaler(this.scaleFactor);


	if (immediate) {
		this.svg.attr("transform","translate("+-this.position[0]+","+-this.position[1]+")");
		this.children().map( function(child) {child.render()} );
		this.scaleFactor = 1;
	} else {
		this.svg.attr("transform","translate("+-this.position[0]+","+-this.position[1]+") scale("+this.scaleFactor+")")
		var that = this;
		this.renderTimeout = window.setTimeout( function () {
			that.svg.attr("transform","translate("+-that.position[0]+","+-that.position[1]+")");
			that.children().map( function(child) {child.render()} );
			that.scaleFactor = 1;
		}, 50);
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

    this.zoom(scaleFactor, true);
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