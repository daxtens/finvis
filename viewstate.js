"use strict";
ViewState.prototype = new ParentingObject();

function ViewState(svg) {
	
	this.svg = svg;
  
	this.calculateSize();
}

// size and scaling
ViewState.prototype.calculateSize = function () {
	var width = window.innerWidth-300,
	    height = window.innerHeight*0.9,
        maxOuterRadius = Math.min(width, height) / 2;
	
	this.svg.attr("width", width).attr("height", height);
	
	this.scaleMax=1000000000000;
	// work out the min and max x and y values across all children.
	//var minX = 

	this.scaler = d3.scale.sqrt().domain([0,this.scaleMax]).range([0,maxOuterRadius]);
}

ViewState.prototype.zoom = function (scale) {
	this.scaleMax /= scale;
	this.scaler = this.scaler.domain([0,this.scaleMax]);
	this.children.map( function(child) {child.render()} );
}
