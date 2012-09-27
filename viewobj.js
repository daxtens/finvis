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
	*/
	this.data = function () {
		if (arguments.length == 0) return this._data;

		this._data = arguments[0];
	}

	/* getter and setter for year/time period
	*/
	this.period = function () {
		if (arguments.length == 0) return this._period;

		this._period = arguments[0];
	}

	/* Rendering
	   
	   svg is the context to draw stuff into.

	   renderMode choses a renderer, render() kicks the process off,
	   the heavy lifting is done by the renderers stored in the ViewObjRenders
	   array. 
	*/
	this.svg = this.parent.svg.append("g");

	this.renderMode = {'name': 'defaultSectorRenderer', 
					   'aggregateFilter': function (aggregate) {return true;} 
					  };

}

ViewObj.prototype.render = function (mode) {

	this.svg.attr("transform", "translate( " + this.position.map(viewstate.scaler).join(",") + " )")


	// this is a pretty naive way of handling the transition.
	// we probably need an 'unrender'/destroy method in the renderers
	if (mode != null) this.renderMode = mode;
	ViewObjRenderers[this.renderMode['name']](this, this.renderMode);
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

ViewObjRenderers.defaultSectorRenderer = function (viewObj, renderMode) {

	/***** Constants */
	var minPtsForAxisLabelDisplay = 75;
	var minPtsForSectorLabelDisplay = 80;

	/***** Pre-process the data */
	var data = JSON.parse(JSON.stringify(viewObj.data()));

	// which aggregates are we interested in?
	if (renderMode['aggregateFilter']) {
		data['aggregates'] = data['aggregates'].filter( renderMode['aggregateFilter'] );
	}

	data['aggregates']
		.sort(function (a, b) {
			var ref = { 'assets':0, 'revenue':1, 'expenses':2, 'liabilities':3 };
			return ref[a.metadata.cssClass] - ref[b.metadata.cssClass];
		})

	/***** Calculate ranges etc */
	var maxValue=-1;
	var minValue=tril*tril;
	for (var d in data['aggregates']) {
		if (data['aggregates'][d].periods[viewObj.period()].value>maxValue) maxValue = data['aggregates'][d].periods[viewObj.period()].value;
		if (data['aggregates'][d].periods[viewObj.period()].value<minValue) minValue = data['aggregates'][d].periods[viewObj.period()].value;

	}
	var exponent = Math.floor(Math.log(maxValue)/Math.LN10);
	
	var niceMaxValue = Math.ceil(maxValue/Math.pow(10, exponent))*Math.pow(10, exponent);

	//var centerOffset = viewstate.scaler(niceMaxValue);

	/***** Start laying things out */
	// create the scale background
	var backdata = d3.range( 1, 9 ).map( function (d) { return d*Math.pow(10, exponent - 1); } );
	var backdata2 = d3.range( 1, Math.ceil(maxValue/Math.pow(10, exponent))+1 ).
					          map(function (d) { return d*Math.pow(10, exponent); } );

	//console.log( backdata )
	//console.log(backdata2)

	backdata = backdata.concat( backdata2 );

	var backGroup = viewObj.svg.select("g.back");
	if (backGroup.empty()) backGroup=viewObj.svg.append("g").classed('back',true);


	var circles = backGroup.selectAll("circle.axis_circle")
		.data(backdata);

	circles
		.enter().append("circle")
		.classed('axis_circle', true)
		.attr("r",function(d) { return viewstate.scaler(d); } )
		//.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")");
	
	circles
		.attr("r",function(d) { return viewstate.scaler(d); } )
		//.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")");

	circles.exit().remove();

	// label them!
	var labels=backGroup.selectAll("text.axis_label").data(backdata2);
	
	labels.enter().append("text")
		.text(formatDollarValue)
		.classed("axis_label", true)
//		.attr("transform", function(d) {return "translate("+centerOffset+","+(centerOffset-viewstate.scaler(d))+")"} )
		.attr("transform", function(d) {return "translate("+0+","+(0-viewstate.scaler(d))+")"} )
		.attr("display",function (d) { return viewstate.scaler(niceMaxValue) > minPtsForAxisLabelDisplay ? null : "none" })
		.attr("dy","1em")
		.attr("dx",function (d) { return -this.getComputedTextLength()/2 })
	
	labels
		.text(formatDollarValue)
//		.attr("transform", function(d) {return "translate("+centerOffset+","+(centerOffset-viewstate.scaler(d))+")"} );
		.attr("display",function (d) { return viewstate.scaler(niceMaxValue) > minPtsForAxisLabelDisplay ? null : "none" })
		.attr("transform", function(d) {return "translate("+0+","+(0-viewstate.scaler(d))+")"} );
	
	labels.exit().remove();

	// create the wedges/sectors
	var sectorsGroup = viewObj.svg.select("g.sections");
	if (sectorsGroup.empty()) sectorsGroup=viewObj.svg.append("g").classed('sections',true);


	var donut = d3.layout.pie().value( function(d) { return 1; } ).startAngle(-Math.PI/2).endAngle(3*Math.PI/2);
	var arc = d3.svg.arc()
		.innerRadius(0)
		.outerRadius( function(d) {return viewstate.scaler(d.data.periods[viewObj.period()].value); } );

	var paths = sectorsGroup.selectAll("path.wedge").data(donut(data['aggregates']));

	var enterer = paths.enter().append("path")
		.classed("wedge", true)
//		.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")")
		.attr("d", arc);

	// d3 does not seem to provide a nice way to set dynamic styles...
	for (var style in cssStyles) {
		enterer.classed( cssStyles[style], function(d) {return d.data.metadata.cssClass == cssStyles[style];} )
	}
	
	paths.exit().remove();

	// update arcs, ergh
	var updater = paths
		.attr("d", arc)
//		.attr("transform", "translate(" + centerOffset + "," + centerOffset + ")");

	// d3 does not seem to provide a nice way to set dynamic styles...
	for (var style in cssStyles) {
		updater.classed( cssStyles[style], function(d) {return d.data.metadata.cssClass == cssStyles[style];} )
	}


	/* Create section labels */
	var labelsGroup = viewObj.svg.select("g.labels");
	if (labelsGroup.empty()) labelsGroup=viewObj.svg.append("g").classed('labels',true);


	// special case if this is a bubble...

	// General Case
	// ... utility functions
	function isTop( d ) {
		if (d.data.metadata.cssClass == "revenue" || d.data.metadata.cssClass == "assets") {
			return true;
		} else {
			return false;
		}
	}

	function isBottom(d) {return !isTop(d);}

	function horizSide( d ) {
		if (data['aggregates'].length == 2) {
			return 'middle';
		} else {
			if (d.data.metadata.cssClass == "revenue" || d.data.metadata.cssClass == "expenses") {
				return 'right';
			} else {
				return 'left';
			}
		}
	}

	function donutKey(d) {
		return d.data.name;
	}

	var wedgeInnerLabels = labelsGroup.selectAll('text.wedgeLabel.inner').data(donut(data['aggregates']),donutKey);
	var wedgeOuterLabels = labelsGroup.selectAll('text.wedgeLabel.outer').data(donut(data['aggregates']),donutKey);

	function innerLabelsText( d ) {
		if (!isTop(d)) {
			return d.data.name.toUpperCase();	
		} else {
			return formatDollarValue( d.data.periods[viewObj.period()].value );
		}
	}

	function outerLabelsText( d ) {
		if (isTop(d)) {
			return d.data.name.toUpperCase();	
		} else {
			return formatDollarValue( d.data.periods[viewObj.period()].value );
		}
	}

	function labelsX( d ) {
		var horiz = horizSide(d);
		if (horiz == 'left') {
			return -(this.getComputedTextLength()+15);
		} else if (horiz == 'middle') {
			return -(this.getComputedTextLength())/2;
		} else { // assume right
			return 15;
		}
	}

	function innerLabelsY( d ) {
		// safety switch: getBBox fails if scaled too hard
		if (viewstate.scaler(niceMaxValue) <= minPtsForSectorLabelDisplay) return 0;
		var height = this.getBBox()['height'];
		// save the value for the outer label
		d.data.metadata.computedTextHeight = height;
		if (isTop(d)) {
			return -15;
		} else {
			return (height+10);
		}
	}

	function outerLabelsY( d ) {
		// safety switch: getBBox fails if scaled too hard
		if (viewstate.scaler(niceMaxValue) <= minPtsForSectorLabelDisplay) return 0;
		var height = this.getBBox()['height'];
		if (isTop(d)) {
			return -8-d.data.metadata.computedTextHeight;
		} else {
			return d.data.metadata.computedTextHeight+height+4;
		}
	}
	console.log(minValue);
	var scaleFactor=1/(d3.scale.sqrt().domain([0,tril]).range([0,1])(viewstate.scaleMax)/
					   d3.scale.sqrt().domain([0,250*bil]).range([0,1])(minValue));

	wedgeInnerLabels.enter()
	// inner text: for top labels this is the money value, for bottom lables this is the name
	// we determine what's what by virtue of the section's css class
	    .append("text")
		.classed('wedgeLabel', true)
		.classed('inner', true)
		.classed('value', isTop)
		.classed('name', isBottom)
		.text(innerLabelsText)
		.attr("transform", function (d) {return "scale(" + tril/viewstate.scaleMax + ")"; })
		.attr("x", labelsX)
		.attr("y", innerLabelsY)
		.attr("display",function (d) { return viewstate.scaler(niceMaxValue) > minPtsForSectorLabelDisplay ? null : "none" })

	wedgeInnerLabels//.attr("transform", function (d) {return "translate(" + arc.centroid(d) + ")"; })
		.attr("display",function (d) { return viewstate.scaler(niceMaxValue) > minPtsForSectorLabelDisplay ? null : "none" })
		.text(innerLabelsText)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; })
		.attr("x", labelsX)
		.attr("y", innerLabelsY)

	wedgeInnerLabels.exit().remove();

	wedgeOuterLabels.enter()
	// outer text: vice versa
	    .append("text")
		.classed('wedgeLabel', true)
		.classed('outer', true)
		.classed('value', isBottom)
		.classed('name', isTop)
		.text(outerLabelsText)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; })
		.attr("x", labelsX)
		.attr("y", outerLabelsY)
		//.attr("transform", function (d) {return "translate(" + arc.centroid(d) + ")"; })
		.attr("display",function (d) { return viewstate.scaler(niceMaxValue) > minPtsForSectorLabelDisplay ? null : "none" })

	wedgeOuterLabels//.attr("transform", function (d) {return "translate(" + arc.centroid(d) + ")"; })
		.attr("display",function (d) { return viewstate.scaler(niceMaxValue) > minPtsForSectorLabelDisplay ? null : "none" })
		.text(outerLabelsText)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; })
		.attr("x", labelsX)
		.attr("y", outerLabelsY)

	wedgeOuterLabels.exit().remove();


	/*arcs.append("text")
	  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .attr("display", function(d) { return d.value > .15 ? null : "none"; })
	  .text(function(d, i) { return d.data.label; });*/
	
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