"use strict";

/* A view object handles the display of a single 'object'; be it a quadrant 
   diagram, a simple bubble, or a more complex bubble (e.g. embedded media)

   Views nest sub-views.

   The idea is that you deal directly with the view object, and it handles 
   mapping everything out to d3.

   It's not a 'view' object in the traditional MVC sense; it includes logic on
   what happens when it is clicked, for example.

*/


/* Constructor. 

   data : at the top level, this should be an entity; subview may be 
          passed individual items

   parent : either a viewObj, or at the root level, a viewstate 

   position : an (x$, y$) pair
*/
ViewObj.prototype = new ParentingObject();
function ViewObj( data, parent, position ) {
	
	this._data = data;
	
	this.parent = parent;
	this.parent.addChild(this);
	
	this.position = position;

	/* getter and setter for data
	   automatically re-renders if the data has changed 
	*/
	this.data = function () {
		if (arguments.length == 0) return this._data;

		this._data = arguments[0];
		this.render();
	}

	/* Rendering
	   
	   svg is the context to draw stuff into.

	   renderMode choses a renderer, render() kicks the process off,
	   the heavy lifting is done by the renderers stored in the ViewObjRenders
	   array. 
	*/
	this.svg = this.parent.svg.append("g").attr("transform", "translate(" + this.position[0] + "," + this.position[1] + ")");

	this.renderMode = 'defaultRenderer';

	this.render = function (mode) {
		// this is a pretty naive way of handling the transition.
		// we probably need an 'unrender'/destroy method in the renderers
		if (mode != null) this.renderMode = mode;
		ViewObjRenderers[this.renderMode](this);
	}

}

/* Renderers go here. 

   This is *not* the way to design a totally new way of rendering data, because
   there's really tight linkage to the viewObj in event handling (what happens 
   when you click or drag something). If you want to draw something totally new,
   create a subclass or new sort of ViewObj.

   This *is* the place to put interesting variants on the same way of showing
   data. For example, to display the amount of carbon emmitted by a sector of
   the economy, write another renderer. Use the same conventions for classes
   and such so the event management works.

*/

var ViewObjRenderers = {};

ViewObjRenderers.defaultRenderer = function (viewObj) {

	
	viewObj.renderData = {};
	var data = viewObj.data();
	

	var donut = d3.layout.pie().value( function(d) { return d.internal.wedgeSize; } ).startAngle(-Math.PI/2).endAngle(3*Math.PI/2);
	var arc = d3.svg.arc()
		.innerRadius(0)
		.outerRadius( function(d) {return viewstate.scaler(d.data.value); } );

	var maxValue=-1;
	for (var d in data) {
		if (data[d].value>maxValue) maxValue = data[d].value;
	}
	var exponent = Math.floor(Math.log(maxValue)/Math.LN10);
	
	var niceMaxValue = Math.ceil(maxValue/Math.pow(10, exponent))*Math.pow(10, exponent);

	var centerOffset = viewstate.scaler(niceMaxValue);

	// create the scale background
	var backdata = d3.range( 1, 9 ).map( function (d) { return d*Math.pow(10, exponent - 1); } );
	var backdata2 = d3.range( 1, Math.ceil(maxValue/Math.pow(10, exponent))+1 ).
					          map(function (d) { return d*Math.pow(10, exponent); } );

	//console.log( backdata )
	//console.log(backdata2)

	backdata = backdata.concat( backdata2 );

	var circles = viewObj.svg.selectAll("circle.axis_circle")
		.data(backdata);

	circles
		.enter().append("circle")
		.classed('axis_circle', true)
		.attr("r",function(d) { return viewstate.scaler(d); } )
		.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")");
	
	circles
		.attr("r",function(d) { return viewstate.scaler(d); } )
		.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")");

	circles.exit().remove();

	// label them!
	var labels=viewObj.svg.selectAll("text.axis_label").data(backdata2);
	
	labels.enter().append("text")
		.text(formatDollarValue)
		.classed("axis_label", true)
		.attr("transform", function(d) {return "translate("+centerOffset+","+(centerOffset-viewstate.scaler(d))+")"} )
		.attr("dy","1em")
	
	labels
		.text(formatDollarValue)
		.attr("transform", function(d) {return "translate("+centerOffset+","+(centerOffset-viewstate.scaler(d))+")"} );
	
	labels.exit().remove();

	// create the wedges
	var paths = viewObj.svg.selectAll("path.wedge").data(donut(data));

	paths.enter().append("path")
		.classed("wedge", true)
		.attr("id", function(d) {return d.data.internal.cssId;} )
		.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")")
		.attr("d", arc);
	
	paths.exit().remove();

	// update arcs, ergh
	paths
		.attr("d", arc)
		.attr("id", function(d) {return d.data.internal.cssId;} )
		.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")");
	
	/*arcs.append("text")
	  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .attr("display", function(d) { return d.value > .15 ? null : "none"; })
	  .text(function(d, i) { return d.data.label; });*/
	
	// arcs.selectAll("path").attr('d',arc)

	/**************************************** Formatters */

	function formatDollarValue( d ) {
		if (d >= 1000000000000) {
			return (d/1000000000000).toFixed(1)+"T";
		} else if (d >= 1000000000) {
			return (d/1000000000).toFixed(1)+"B";
		} else if (d >= 1000000) {
			return (d/1000000).toFixed(1)+"M";
		} else if (d >= 1000) {
			return (d/1000).toFixed(1)+"K";
		} else {
			return d.toFixed(1);
		}
	}


}