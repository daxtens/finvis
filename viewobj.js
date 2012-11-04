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

//having wacky non-fun with inheritance; children array was being shared!
//ViewObj.prototype = new ParentingObject();
function ViewObj( data, parent, position ) {
	
	this._data = data;

	this.ParentingObject = ParentingObject;
	this.ParentingObject();

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

	this.renderMode = {'name': 'defaultSectorRenderer' };

    /* Event handling */
    this.mouseData={};
    this.mouseData.isDrag = false;
    this.mouseData.startX = 0;
    this.mouseData.startY = 0;

    /* we have to attack these to things with substance like wedges, not the overall group 
       these functions manufacture a suitable function for that. */
    this.onmousedownMaker = function () {
	var that = this;
	return function(d) {
	    // make sure this is a left click, otherwise pass it through
	    // TODO: context menu
	    if (d3.event.button != 0) return true;
	    
	    // ergh, protection from when the mouse 'escapes' is messy
	    viewstate.mouseData.isInObjDrag = true;
	    viewstate.mouseData.objMoveHandler = that.onmousemoveMaker();
	    viewstate.mouseData.objUpHandler = that.onmouseupMaker();


	    that.mouseData.isDrag = true;
	    that.mouseData.startX = d3.event.clientX;
	    that.mouseData.startY = d3.event.clientY;
	    
	    d3.event.stopPropagation();
	    return false;
	};
    }

    this.onmouseupMaker = function () {
	var that = this;
	return function(d) {    
	    that.mouseData.isDrag = false;
	    viewstate.mouseData.isInObjDrag = false;
	};
    }
    
    this.onmousemoveMaker = function (e) {
	var that = this;
	return function(d) {
	    
	    if (d.data) e = d3.event
	    else e = d;

	    if (!that.mouseData.isDrag) return true;
	    
	    that.position = that.position.map( viewstate.scaler );
	    that.position[0] -= (that.mouseData.startX - e.clientX);
	    that.position[1] -= (that.mouseData.startY - e.clientY);
	    that.position = that.position.map( viewstate.scaler.invert );
	    
	    that.svg.attr("transform", "translate( " + that.position.map(viewstate.scaler).join(",") + " )")
	
	    that.mouseData.startX = e.clientX;
	    that.mouseData.startY = e.clientY;

	    e.stopPropagation();
	}
    }

}



ViewObj.prototype.remove = function() {
	this.svg.remove();
}

ViewObj.prototype.popIn = function () {
	this.children().map( function (child) { child.remove(); } );
	this.children().splice(0,this.children().length);
	this.poppedOut = null;
}

ViewObj.prototype.popOut = function( aggregate ) {

	this.popIn();

	this.poppedOut = aggregate;


	var angleOffset = Math.PI;

	/* this whole function assumes that there's only one sector being displayed.
	   This is a bit dodge in some circumstances. Be warned. */

	var items = this.data()['aggregates'][aggregate]['periods'][this.period()]['items'];
	if (!items) return;
	items = JSON.parse(JSON.stringify(items));
	items.sort( function (a, b) { return b.value - a.value; } );
	
	var numChildren = items.length;
	//var angleIncrement = 2*Math.PI/numChildren;

	var innerDollarValue = this.data()['aggregates'][aggregate]['periods'][this.period()]['value'];
	var exponent = Math.floor(Math.log(innerDollarValue)/Math.LN10);
	var niceInnerRadius = Math.ceil(innerDollarValue/Math.pow(10, exponent))*Math.pow(10, exponent);
	
	/* do maths to figure out how to position and space the bubbles
	   we figure out angle between:
	   - the line between the center of the bubble and the center of the sector diagram; and,
	   - the line from the center of the sector diagram that is tangent to the bubble
	   doubling this gives us the radial angle taken to draw the bubble
	   we get the sum of those, (hopefully it's <2Pi!) 
	   and then scale them over the available space

	   We also do some of the work to figure out the position. 
	   We can't add dollar values to get the new radius due to sqrt scaling.
	*/
	var sectorPtRadius = viewstate.scaler(niceInnerRadius);
	var bubblePtRadii = [];
	var bubbleAngles = [];
	var bubbleAnglesSum = 0;

	for (var item in items) {
		var itemValue = items[item]['value'];
		 
		bubblePtRadii[item] = viewstate.scaler(itemValue);

		bubbleAngles[item] = 2*Math.asin( bubblePtRadii[item] / (bubblePtRadii[item] + sectorPtRadius) );
		bubbleAnglesSum += bubbleAngles[item];
	}

	var angleScaler = d3.scale.linear().domain([0,bubbleAnglesSum]).range([0,2*Math.PI]);
	var angle = angleOffset-angleScaler(bubbleAngles[0])/2;

	for (var item in items) {
		angle += angleScaler(bubbleAngles[item])/2;
		var itemPosition = [
			(sectorPtRadius+bubblePtRadii[item])*Math.cos(angle),
			(sectorPtRadius+bubblePtRadii[item])*Math.sin(angle)
		].map(viewstate.scaler.invert);
		angle += angleScaler(bubbleAngles[item])/2;

		var itemObj = new ViewObj( items[item], this, itemPosition );
		itemObj.render({'name': 'bubbleRenderer', 'cssClass': this.data()['aggregates'][aggregate]['metadata']['cssClass'] });
	}
}

ViewObj.prototype.render = function (mode) {

    this.svg.attr("transform", "translate( " + this.position.map(viewstate.scaler).join(",") + " )");


	// this is a pretty naive way of handling the transition.
	// we probably need an 'unrender'/destroy method in the renderers
	if (mode != null) this.renderMode = mode;
	ViewObjRenderers[this.renderMode['name']](this, this.renderMode);

	// render all children
	this.children().map( function (child) { child.render(); } );
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
	var minScaleFactorForLabelDisplay = 0.2;

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

	/***** Create the wedges/sectors */
	var sectorsGroup = viewObj.svg.select("g.sections");
	if (sectorsGroup.empty()) sectorsGroup=viewObj.svg.append("g").classed('sections',true);


	var donut = d3.layout.pie().value( function(d) { return 1; } ).startAngle(-Math.PI/2).endAngle(3*Math.PI/2);
	var arc = d3.svg.arc()
		.innerRadius(0)
		.outerRadius( function(d) {return viewstate.scaler(d.data.periods[viewObj.period()].value); } );

	var paths = sectorsGroup.selectAll("path.wedge").data(donut(data['aggregates']));

	var enterer = paths.enter().append("path")
		.classed("wedge", true)
		.attr("d", arc)
	.on('mousedown', viewObj.onmousedownMaker() )
	.on('mousemove', viewObj.onmousemoveMaker() )
	.on('mouseup', viewObj.onmouseupMaker() );

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


	/***** Create section labels */
	var labelsGroup = viewObj.svg.select("g.labels");
	if (labelsGroup.empty()) labelsGroup=viewObj.svg.append("g").classed('labels',true);


	// TODO special case if this is a bubble...

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
    // this is full of magic numbers. le sigh. In short, [0,tril] sets a default scaling factor for
    // the size of the window, and [0, 400*bil] sets a scale for the smallest value.
	var scaleFactor=1/(d3.scale.sqrt().domain([0,tril]).range([0,1])(viewstate.scaleMax)/
					   d3.scale.sqrt().domain([0,400*bil]).range([0,1])(minValue));

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
		// safety switch: getBBox fails if not visible
		if (scaleFactor < minScaleFactorForLabelDisplay) return 0;
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
		// safety switch: getBBox fails if not visible
		if (scaleFactor < minScaleFactorForLabelDisplay) return 0;
		var height = this.getBBox()['height'];
		if (isTop(d)) {
			return -8-d.data.metadata.computedTextHeight;
		} else {
			return d.data.metadata.computedTextHeight+height+4;
		}
	}

	wedgeInnerLabels.enter()
	// inner text: for top labels this is the money value, for bottom lables this is the name
	// we determine what's what by virtue of the section's css class
	    .append("text")
		.classed('wedgeLabel', true)
		.classed('inner', true)
		.classed('value', isTop)
		.classed('name', isBottom)
		.text(innerLabelsText)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; })
		.attr("x", labelsX)
		.attr("y", innerLabelsY)
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })

	wedgeInnerLabels//.attr("transform", function (d) {return "translate(" + arc.centroid(d) + ")"; })
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
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
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })

	wedgeOuterLabels
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.text(outerLabelsText)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; })
		.attr("x", labelsX)
		.attr("y", outerLabelsY)

	wedgeOuterLabels.exit().remove();


	// Halo if the whole thing is just too small to see.
	
	var tinyHaloThreshold = 30;
	var tinyHalo = viewObj.svg.selectAll("circle.tinyHalo").data([backdata.pop()].map(viewstate.scaler));
	
	tinyHalo.enter().append('circle').classed('tinyHalo', true)
		.attr('r', tinyHaloThreshold)
		.attr("display", function (d) { return d < tinyHaloThreshold ? null : "none" } )

	tinyHalo.attr("display", function (d) { return d < tinyHaloThreshold ? null : "none" } )


	/***** Relations */
	var revenue, expenses, assets, liabilities;
	var rVeData, aVlData;

	for (var aggregate in data['aggregates']) {
		if (data['aggregates'][aggregate]['metadata']['cssClass'] == 'revenue') {
			revenue = data['aggregates'][aggregate]['periods'][viewObj.period()]['value'];
		} else if (data['aggregates'][aggregate]['metadata']['cssClass'] == 'expenses') {
			expenses = data['aggregates'][aggregate]['periods'][viewObj.period()]['value'];
		} else if (data['aggregates'][aggregate]['metadata']['cssClass'] == 'assets') {
			assets = data['aggregates'][aggregate]['periods'][viewObj.period()]['value'];
		} else if (data['aggregates'][aggregate]['metadata']['cssClass'] == 'liabilities') {
			liabilities = data['aggregates'][aggregate]['periods'][viewObj.period()]['value'];
		}
	}

	if (data['relations']['revenueVexpenses'] && revenue !== undefined && expenses !== undefined) {
		rVeData = revenue - expenses;
	} else {
		rVeData = null;
	}

	if (data['relations']['assetsVliabilities'] && assets !== undefined && liabilities !== undefined) {
		aVlData = assets - liabilities;
	} else {
		aVlData = null;
	}

	var relations = viewObj.svg.select('g.relations');
	if (relations.empty()) relations = viewObj.svg.append('g').classed('relations', true);


	// FIXME: this is going to break lots where d==0
	// every time there is a bipartite test, it needs to be made tripartite

	function relationNameText( d ) {
		if (d.value < 0) {
			return data['relations'][d.relation]['less'].toUpperCase();
		} else if (d.value == 0) {
			return data['relations'][d.relation]['equal'].toUpperCase();
		} else {
			return data['relations'][d.relation]['greater'].toUpperCase();
		}
	}

	function relationsInnerText( d ) {
		if (isProfit(d)) { // value
			return formatDollarValue(d.value);
		} else {
			return relationNameText( d );
		}
	}
	
	function relationsOuterText( d ) {
		if (isLoss(d)) {
			return formatDollarValue(-d.value);
		} else {
			return relationNameText( d );
		}
	}

	function relationInnerY( d ) {
		// safety switch: getBBox fails if not visible
		if (scaleFactor < minScaleFactorForLabelDisplay) return 0;
		var height = this.getBBox()['height'];
		// save the value for the outer label
		d.computedTextHeight = height;
		if (isProfit(d)) {
			return -15;
		} else {
			return (height+10);
		}
	}

	function relationOuterY( d ) {
		// safety switch: getBBox fails if not visible
		if (scaleFactor < minScaleFactorForLabelDisplay) return 0;
		var height = this.getBBox()['height'];
		if (isProfit(d)) {
			return -9-d.computedTextHeight;
		} else {
			return d.computedTextHeight+height+5;
		}
	}


	function labelX(d) {
		if (d.relation == 'revenueVexpenses') {
			return viewstate.scaler((revenue>expenses)?revenue:expenses)/scaleFactor+8;
		} else {
			return -viewstate.scaler((assets>liabilities)?assets:liabilities)/scaleFactor-this.getComputedTextLength()-8;
		}
	}

	function isProfit(d) {
		return d.value>0;
	}
	function isLoss(d) {
		return d.value<0;
	}

	// don't reconstruct the data each time; we'll lose the rendering info stored in it as a side-effect of
	// getting the y value for the inner label. (ergh, side-effects. FIXME.)
	var relationsData = [];
	if (rVeData !== null) relationsData.push({'relation':'revenueVexpenses', 
											  'value':rVeData, 
											  'displayStyle': (rVeData>=0?'revenue':'expenses')});
	if (aVlData !== null) relationsData.push({'relation':'assetsVliabilities', 
											  'value':aVlData,
											  'displayStyle': (aVlData>=0?'assets':'liabilities')});
	

	var innerLabel = relations.selectAll('text.relationLabel.innerLabel').data( relationsData );
		
	var enterer = innerLabel.enter().append('text')
		.text(relationsInnerText)
		.classed('relationLabel', true)
		.classed('innerLabel', true)
		.classed('name', isLoss)
		.classed('value', isProfit)
		.classed('revenue', isProfit)
		.classed('expenses', isLoss)
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.attr("transform", function (d) { return "scale(" + scaleFactor + ")"; })
		.attr('x', labelX )
		.attr('y', relationInnerY);
	
	for (var style in cssStyles) {
		enterer.classed( cssStyles[style], function(d) {return d.displayStyle == cssStyles[style];} )
	}


	var updater = innerLabel.text(relationsInnerText)
		.classed('revenue', isProfit)
		.classed('expenses', isLoss)
		.classed('name', isLoss)
		.classed('value', isProfit)
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.attr("transform", function (d) { return "scale(" + scaleFactor + ")"; })
		.attr('x', labelX )
		.attr('y', relationInnerY)
	
	for (var style in cssStyles) {
		updater.classed( cssStyles[style], function(d) {return d.displayStyle == cssStyles[style];} )
	}

	innerLabel.exit().remove();

	var outerLabel = relations.selectAll('text.relationLabel.outerLabel').data( relationsData );
		
	var enterer = outerLabel.enter().append('text')
		.text(relationsOuterText)
		.classed('relationLabel', true)
		.classed('outerLabel', true)
		.classed('name', isProfit)
		.classed('value', isLoss)
		.classed('revenue', isProfit)
		.classed('expenses', isLoss)
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.attr("transform", function (d) { return "scale(" + scaleFactor + ")"; })
		.attr('x', labelX )
		.attr('y', relationOuterY);
	
	for (var style in cssStyles) {
		enterer.classed( cssStyles[style], function(d) {return d.displayStyle == cssStyles[style];} )
	}

	var updater = outerLabel.text(relationsOuterText)
		.classed('revenue', isProfit)
		.classed('expenses', isLoss)
		.classed('name', isProfit)
		.classed('value', isLoss)
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.attr("transform", function (d) { return "scale(" + scaleFactor + ")"; })
		.attr('x', labelX )
		.attr('y', relationOuterY)

	for (var style in cssStyles) {
		updater.classed( cssStyles[style], function(d) {return d.displayStyle == cssStyles[style];} )
	}


	outerLabel.exit().remove();

}

/************************************************************ Bubble Renderer */
ViewObjRenderers.bubbleRenderer = function (viewObj, renderMode) {

	/***** Constants */
	var minScaleFactorForLabelDisplay = 0.2;

	/***** Pre-process the data */
	var data = JSON.parse(JSON.stringify(viewObj.data()));

	function link( d ) {
		if (d.href) window.open( d.href, d.target );
	}
	
	// create the bubble
	var circle = viewObj.svg.selectAll('circle')
		.data([data], function (d) {return d.name;});

	circle.enter().append("circle")
		.attr( "r", function(d) {return viewstate.scaler(d.value);} )
		.classed( renderMode['cssClass'], true )
		.classed( 'wedge', true )
		.on('click', link)
		.classed('link', function (d) { return d.href });
	
	circle.exit().remove();

	circle.attr( "r", function(d) {return viewstate.scaler(d.value);} )


	/* Create section labels */
	var labelsGroup = viewObj.svg.select("g.labels");
	if (labelsGroup.empty()) labelsGroup=viewObj.svg.append("g").classed('labels',true);

	var scaleFactor=1/(d3.scale.sqrt().domain([0,tril]).range([0,1])(viewstate.scaleMax)/
					   d3.scale.sqrt().domain([0,50*bil]).range([0,1])(data.value));

	var nameLabel = labelsGroup.selectAll('text.wedgeLabel.name').data([data]);
	var valueLabel = labelsGroup.selectAll('text.wedgeLabel.value').data([data]);

	function valueLabelY( d ) {
		// safety switch: getBBox fails if scaled too hard(?)
		if (scaleFactor <= minScaleFactorForLabelDisplay) return 0;
		var h;
		try {
			h = this.getBBox()['height']-10;
		} catch (e) {
			console.log(e);
			console.log(d);
			h = 0;
		}
		return h;
	}

	nameLabel.enter().append("text")
		.text(function (d) {return data.name.toUpperCase();})
		.attr("x", function (d) { return -(this.getComputedTextLength())/2; })
		.attr("y", -10)
		.classed('wedgeLabel', true).classed('name', true)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; })
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.classed('link', function (d) { return d.href })
		.on('click', link);

	nameLabel.text(function (d) {return data.name.toUpperCase();})
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.attr("x", function (d) { return -(this.getComputedTextLength())/2; })
		.attr("y", -10)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; });
		

	valueLabel.enter().append("text")
		.text(function (d) {return formatDollarValue(data.value);})
		.attr("x", function (d) { return -(this.getComputedTextLength())/2; })
		.attr("y", valueLabelY)
		.classed('wedgeLabel', true).classed('value', true)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; })
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.classed('link', function (d) { return d.href })
		.on('click', link);

	valueLabel
		.attr("display",function (d) { return scaleFactor > minScaleFactorForLabelDisplay ? null : "none" })
		.text(function (d) {return formatDollarValue(data.value);})
		.attr("x", function (d) { return -(this.getComputedTextLength())/2; })
		.attr("y", valueLabelY)
		.attr("transform", function (d) {return "scale(" + scaleFactor + ")"; });

}


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