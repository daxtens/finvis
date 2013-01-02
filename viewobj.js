'use strict';

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
function ViewObj(data, parent, position) {

    this._data = data;

    this.ParentingObject = ParentingObject;
    this.ParentingObject();

    this.parent = parent;
    this.parent.addChild(this);

    this.position = position;

    /* getter and setter for data
     */
    this.data = function() {
        if (arguments.length == 0) return this._data;

        this._data = arguments[0];
    };

    /* getter and setter for year/time period
     */
    this.period = function() {
        if (arguments.length == 0) return this._period;

        if (this._period != arguments[0]) {
            this._period = arguments[0];
            var thePeriod = arguments[0];
            this.children().map(function(child) { child.period( thePeriod ); });
            if (this.poppedOut) {
                this.popIn();
                this.popOut(this.poppedOutAggregate);
            }
        }
    };

    /* Rendering

       svg is the context to draw stuff into.

       renderMode choses a renderer, render() kicks the process off,
       the heavy lifting is done by the renderers stored in the ViewObjRenders
       array.
    */
    this.svg = this.parent.svg.append('g');

    if (this.data().metadata && this.data().metadata.renderMode) {
        this.renderMode = this.data().metadata.renderMode;
    } else {
        this.renderMode = {'name': 'defaultSectorRenderer'};
    }

    /* Event handling */
    // dragging is set up here. context menu is set up in render - icky, I know.
    this.mouseData = {};
    this.mouseData.isDrag = false;
    this.mouseData.startX = 0;
    this.mouseData.startY = 0;

    /* we have to attach these to things with substance 
       like wedges, not the overall group
       
       these functions manufacture a suitable function for that. */
    this.onmousedownMaker = function() {
        var that = this;
        return function(d) {
            d3.event.stopPropagation();

            // make sure this is a left click, otherwise pass it through
            if (d3.event.button != 0) return true;

            // ergh, protection from when the mouse 'escapes' is messy
            viewstate.mouseData.isInObjDrag = true;
            viewstate.mouseData.objMoveHandler = that.onmousemoveMaker();
            viewstate.mouseData.objUpHandler = that.onmouseupMaker();

            that.mouseData.isDrag = true;
            that.mouseData.startX = d3.event.clientX;
            that.mouseData.startY = d3.event.clientY;

            return false;
        };
    };

    this.onmouseupMaker = function() {
        var that = this;
        return function(d) {
            that.mouseData.isDrag = false;
            viewstate.mouseData.isInObjDrag = false;
        };
    };

    this.onmousemoveMaker = function(e) {
        var that = this;
        return function(d) {
            if (d instanceof MouseEvent) e = d;
            else e = d3.event;

            if (!that.mouseData.isDrag) return true;

            that.position = that.position.map(viewstate.scaler);
            that.position[0] -= (that.mouseData.startX - e.clientX);
            that.position[1] -= (that.mouseData.startY - e.clientY);
            that.position = that.position.map(viewstate.scaler.invert);

            that.svg.attr('transform', 'translate( ' + that.position.map(viewstate.scaler).join(',') + ' )');

            that.mouseData.startX = e.clientX;
            that.mouseData.startY = e.clientY;
        }
    };

    this.ondblclickMaker = function(e) {
        var that = this;
        return function(d) {
            d3.event.stopPropagation();
            if ('aggregates' in that.data()) {
                // an entity
                if (that.data().aggregates.length == 4 &&
                    (that.renderMode.specifiedAggregates == undefined ||
                     that.renderMode.specifiedAggregates.length == 4)) {
                    // full entity: go down to relation
                    if (d.data.metadata.cssClass == 'revenue' || d.data.metadata.cssClass == 'expenses') {
                        that.renderMode.specifiedAggregates = ['revenue', 'expenses'];
                    } else {
                        that.renderMode.specifiedAggregates = ['assets', 'liabilities'];
                    }
                    that.render();
                } else if ((that.data().aggregates.length == 2 && that.renderMode.specifiedAggregates == undefined) ||
                           (that.data().aggregates.length == 4 && that.renderMode.specifiedAggregates.length == 2)) {
                    // a relation: go down to a single
                    that.renderMode.specifiedAggregates = [d.data.metadata.cssClass];
                    that.render();
                } else {
                    // a single: pop in/out
                    if (that.poppedOut) that.popIn();
                    else {
                        for (var idx in that.data().aggregates) {
                            if (that.data().aggregates[idx].metadata.cssClass == d.data.metadata.cssClass) {
                                that.popOut(idx);
                                break;
                            }
                        }
                    }
                }
            } else {
                // a bubble: pop in/out
                if (that.poppedOut) that.popIn();
                else that.popOut();
            }
        };
    };
}

//units are dollars
ViewObj.prototype.moveTo = function(position) {
    if (arguments.length == 2) position = arguments;
    this.position = position;
    this.svg.attr('transform', 'translate(' + this.position.map(viewstate.scaler).join(',') + ')');
};

ViewObj.prototype.remove = function() {
    this.svg.remove();
    this.parent.removeChild(this);
};

ViewObj.prototype.popIn = function() {
    this.children().map(function(child) { if (child.poppedOut) child.popIn(); });
    // this naive approach skips every second one due to progressive renumbering
    //this.children().map( function (child) { child.remove(); } );
    // this doesn't
    for (var i = this.children().length; i >= 0; i--) {
        if (this.children()[i]) this.children()[i].remove();
    }
    this.poppedOut = false;
    this.reposition();
    var obj = this;
    while (obj.parent instanceof ViewObj) obj = obj.parent;
    obj.render();
};

ViewObj.prototype.popOut = function(aggregate) {
    this.poppedOutAggregate = aggregate;
    this.poppedOut = true;

    if ('aggregates' in this.data()) {
        var items = this.data()['aggregates'][aggregate]['items'];
        var cssClass = this.data()['aggregates'][aggregate]['metadata']['cssClass'];
    } else {
        var items = this.data().items;
        var cssClass = this.renderMode.cssClass;
    }
    if (!items) return;
    items = JSON.parse(JSON.stringify(items));
    var that = this;
    items.sort(function(a, b) { return b['periods'][that.period()]['value'] - a['periods'][that.period()]['value']; });

    var numChildren = items.length;

    for (var item in items) {
        // it it's non-zero, create it.
        if (items[item]['periods'][this.period()]['value'] <= 0) continue;
        var itemObj = new ViewObj(items[item], this, [0, 0]);
        itemObj.period( this.period() );
        itemObj.render({'name': 'bubbleRenderer', 'cssClass': cssClass });
    }

    this.reposition();
    var obj = this;
    while (obj.parent instanceof ViewObj) obj = obj.parent;
    obj.render();
};

ViewObj.prototype.canPopOut = function(aggregate) {
    if ('aggregates' in this.data()) {
        return this.data()['aggregates'][aggregate]['items'].length;
    } else {
        return this.data()['items'] && this.data()['items'].length;
    }
};

ViewObj.prototype.reposition = function() {
    // calling reposition on anything in the chain causes the whole thing to be rejigged
    var obj = this;
    while (obj.parent instanceof ViewObj) obj = obj.parent;

    obj._reposition();
};

//todo: make me private/protected/something
ViewObj.prototype._reposition = function() {
    // having bubbled up to the top, now descend to get correct sizes, then position on the way back up.
    // we set _dollarRadius in each viewobj; the bubble renderer sadly depends upon it atm.
    // (fixme)

    var items = this.children();
    if (items.length) {
        for (var item=0; item<items.length; item++) {
            items[item]._reposition();
        }

        var prevType = '';
        var lists = [];

        // if we want to pop out two aggregates ... then this mess is the result.
        // todo: refactor with a better way of publishing my type than a cssClass
        //console.log(items);
        for (var item=0; item<items.length; item++) {
            if (items[item].renderMode.cssClass != prevType) {
                prevType = items[item].renderMode.cssClass;
                if (lists.length) lists[lists.length - 1].push(item);
                lists.push([item]);
            }
        }
        lists[lists.length - 1].push(items.length);
        //console.log(lists);


        this._dollarRadius = ViewObjRenderers[this.renderMode['name']].dollarRadiusWhenRendered(this, this.renderMode);
        var innerRadius = this._dollarRadius;
        if (lists.length > 1) {
            // todo: a little bit of angular padding

            // have 2 cracks at it.
            for (var list in lists) {
                //var itemIdxs = [0, this.children().length];
                var newValues = this.repositionItemsGivenParameters(lists[list], Math.PI + (2 * Math.PI * list) / lists.length * 1.05, (2 * Math.PI) / lists.length * 0.9,
                                                                    innerRadius);

                if (newValues[1] > innerRadius) {
                    innerRadius = newValues[1];
                }

            }

            for (var list in lists) {
                this.repositionItemsGivenParameters(lists[list], Math.PI + (2 * Math.PI * list) / lists.length * 1.05, (2 * Math.PI) / lists.length * 0.9,
                                                    innerRadius);
                if (newValues[0] > this._dollarRadius) {
                    this._dollarRadius = newValues[0];
                }
            }
        } else {
            this._dollarRadius = this.repositionItemsGivenParameters(lists[0], Math.PI, (2 * Math.PI),
                                                                     innerRadius)[0];
        }
    } else {
        this._dollarRadius = ViewObjRenderers[this.renderMode['name']].dollarRadiusWhenRendered(this, this.renderMode);
    }
};

/**
 * Actually do the work of repositioning items.
 * Based on:
 * http://math.stackexchange.com/questions/251399/what-is-the-smallest-circle-such-that-an-arbitrary-set-of-circles-can-be-placed 
 * Assumes the items are presorted.
 *
 * @private
 * @param {Array.<number>} itemIdxs The item indexes to consider: [first, last)
 * @returns {Array.<number>} the resultant [outer, inner] radius
 */  

ViewObj.prototype.repositionItemsGivenParameters = function(
    itemIdxs, angleOffset, angleSpan, initialRadius) {

    var items = this.children();

    var numChildren = itemIdxs[1] - itemIdxs[0];

    /* do maths to figure out how to position and space the bubbles

       NB: We can't add dollar values to get the new radius due to sqrt scaling.
    */
    var sectorPtRadius = viewstate.scaler(initialRadius);
    var bubblePtRadii = [];
    var bubbleAngles = [];
    var count = 0;  
  
    var phi = function(R,i) {
        var i1 = (i+1 == itemIdxs[1]) ? itemIdxs[0] : (i+1);
        var ri = bubblePtRadii[i], ri1 = bubblePtRadii[i1];
        return Math.acos((R*R + R*ri + R*ri1 - ri*ri1) /
                         ((R+ri)*(R+ri1)));
    }
        
    var f = function(R) {
        var sum = 0;
        for (var i = itemIdxs[0]; i < itemIdxs[1]; i++) {
            sum += phi(R,i);
        }
        return angleSpan - sum;
    }
    
    var dPhidR = function(R,i) {
        var i1 = (i+1 == itemIdxs[1]) ? itemIdxs[0] : (i+1);
        var ri = bubblePtRadii[i], ri1 = bubblePtRadii[i1];
        var radicand = (R*ri*ri1*(R+ri+ri1))/
            (Math.pow((R+ri)*(R+ri1),2))
        var numerator = Math.sqrt(radicand)*(2*R + ri + ri1);
        return - numerator / (R*(R+ri+ri1));
    }
    
    var dFdR = function(R) {
        var sum = 0;
        for (var i = itemIdxs[0]; i < itemIdxs[1]; i++) {
            sum += dPhidR(R,i);
        }
        return -sum;
    }
    
    var bubbleAnglesSum = function() {
        return angleSpan - f(sectorPtRadius);
    }
    
    for (var item = itemIdxs[0]; item < itemIdxs[1]; item++) {
        var itemRadius = items[item]._dollarRadius; 
        bubblePtRadii[item] = viewstate.scaler(itemRadius);
    }

    if (bubbleAnglesSum() > angleSpan) {
   
        var Rn = sectorPtRadius;
        var Rn1 = Rn - f(Rn)/dFdR(Rn);
        
        while (Math.abs((Rn-Rn1)/Rn) > 0.01 || f(Rn1) < 0) {
            Rn = Rn1;
            Rn1 = Rn - f(Rn)/dFdR(Rn);
        }
        sectorPtRadius = Rn1;
    }

    var angleScaler = d3.scale.linear()
        .domain([0, bubbleAnglesSum()])
        .range([0, angleSpan]);

    var angle = angleOffset;

    for (var item = itemIdxs[0]; item < itemIdxs[1]; item++) {
        var itemPosition = [
            (sectorPtRadius + bubblePtRadii[item]) * Math.cos(angle),
            (sectorPtRadius + bubblePtRadii[item]) * Math.sin(angle)
        ].map(viewstate.scaler.invert);
        angle += angleScaler(phi(sectorPtRadius,item));

        items[item].moveTo(itemPosition);
    }

    return [viewstate.scaler.invert(sectorPtRadius + 2 * bubblePtRadii[0]), 
            viewstate.scaler.invert(sectorPtRadius)];
};

ViewObj.prototype.render = function(mode) {

    this.svg.attr('transform', 
                  'translate( ' + this.position.map(viewstate.scaler).join(',') 
                  + ' )');

    // this is a pretty naive way of handling the transition.
    // we probably need an 'unrender'/destroy method in the renderers
    if (mode != null) this.renderMode = mode;
    ViewObjRenderers[this.renderMode['name']](this, this.renderMode);

    // as much as it irks me to do context menus this way, better to include
    // jQuery than try to write my own context menus!
    // ... do this before children so they can do their own.
    var that = this;

    var bindings = { 'bindings': { 'deleteMenuItem' : function() { that.remove() },
                                   'centreViewMenuItem' : function() { viewstate.centreViewOn(that) },
                                   //'duplicateMenuItem' : function() {alert("not yet implemented");},
                                   'resetMenuItem' : function() { that.renderMode.specifiedAggregates = undefined; that.popIn(); that.render(); },
                                   'popBothMenuItem': function() { that.popIn(); that.popOut(0); that.popOut(1); }
                                 }
                   };


    if (this.data().aggregates && 
        ((this.data().aggregates.length == 2 &&
          this.renderMode.specifiedAggregates == undefined) ||
         (this.data().aggregates.length == 4 &&
          this.renderMode.specifiedAggregates &&
          this.renderMode.specifiedAggregates.length == 2))) {

        jQuery(this.svg[0][0]).find('.wedge')
            .contextMenu('wedge2Menu', bindings);
    } else {
        jQuery(this.svg[0][0]).find('.wedge').contextMenu('wedgeMenu', bindings);
    }
    jQuery(this.svg[0][0]).find('.tinyHalo').contextMenu('wedgeMenu', bindings);

    // render all children
    this.children().map(function(child) { child.render(); });

};

/* Renderers go here.

   This is *not* the way to design a totally new way of rendering data, because
   there's really tight linkage to the viewObj in event handling (what happens
   when you click or drag something). If you want to draw something totally new,
   create a subclass or new sort of ViewObj.

   This *is* the place to put interesting variants on the same way of showing
   data. For example, to display the amount of carbon emmitted by a sector of
   the economy, write another renderer. Use the same conventions for classes
   and such so the event management works.

   Every renderer must also provide a dollarRadiusWhenRendered method,
   simply returning the radius (or a close-ish guess; not too fussed about
   minor text overlaps atm.) of the object when rendered in a given mode.

*/

var ViewObjRenderers = {};

/**
 * Scale factor below which no labels will be displayed.
 * Setting this too low leads to getBBox throwing errors.
 *
 * A renderer should use the scaling factor as a transform on every text tag.
 * @const 
 * @type {number} 
 */
ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY = 0.3;


/**
 * Determine the scaling factor given a dollar value size.
 *
 * The idea is that using the minimum dollar size of your entity should render
 * a scaling factor that fits reasonable sizes of text reasonably.
 *
 * @param {number} minValue The minimum value to fit the text into.
 * @param {number} naturalValue The value at which the text should (window size
                                permitting) be it's natural size.
 * @return {number} The scale factor.
 */
ViewObjRenderers.scaleFactor = function (minValue, naturalValue) {
    // this is full of magic numbers. le sigh.
    // [0,tril] sets a default scaling factor for the size of the window
    return 1 /
        (d3.scale.sqrt().domain([0, tril]).range([0, 1])(viewstate.scaleMax) /
         d3.scale.sqrt().domain([0, naturalValue]).range([0, 1])(minValue));
}

ViewObjRenderers.defaultSectorRenderer = function(viewObj, renderMode) {

    /***** Pre-process the data */
    var data = JSON.parse(JSON.stringify(viewObj.data()));

    // which aggregates are we interested in?
    if (renderMode['specifiedAggregates']) {
        data['aggregates'] = data['aggregates'].filter(function(aggregate ) {
            for (var specAgg in renderMode['specifiedAggregates']) {
                if (aggregate.metadata.cssClass == renderMode['specifiedAggregates'][specAgg])
                    return true;
            }
            return false;
        });
    }

    data['aggregates']
        .sort(function(a, b) {
            var ref = { 'assets': 0,
                        'revenue': 1,
                        'expenses': 2,
                        'liabilities': 3 };
            return ref[a.metadata.cssClass] - ref[b.metadata.cssClass];
        });

    /***** Calculate ranges etc */
    var maxValue = -1;
    var minValue = tril * tril;
    for (var d in data['aggregates']) {
        if (data['aggregates'][d]['periods'][viewObj.period()].value > maxValue) {
            maxValue = data['aggregates'][d]['periods'][viewObj.period()].value;
        }
        if (data['aggregates'][d]['periods'][viewObj.period()].value < minValue) {
            minValue = data['aggregates'][d]['periods'][viewObj.period()].value;
        }

    }
    var exponent = Math.floor(Math.log(maxValue) / Math.LN10);
    var niceMaxValue = Math.ceil(maxValue / Math.pow(10, exponent)) *
        Math.pow(10, exponent);

    //var centreOffset = viewstate.scaler(niceMaxValue);

    var scaleFactor = ViewObjRenderers.scaleFactor( minValue, 400 * bil );

    /***** Start laying things out */
    // create the scale background
    var backdata = d3.range(1, 9).map(function(d) { 
        return d * Math.pow(10, exponent - 1);
    });
    
    var backdata2 = d3.range(1, Math.ceil(maxValue / Math.pow(10, exponent)) + 1)
        .map(function(d) { return d * Math.pow(10, exponent); });

    //console.log( backdata )
    //console.log(backdata2)

    backdata = backdata.concat(backdata2);

    var backGroup = viewObj.svg.select('g.back');
    if (backGroup.empty()) {
        backGroup = viewObj.svg.append('g').classed('back', true);
    }


    var circles = backGroup.selectAll('circle.axis_circle')
        .data(backdata);

    circles
        .enter().append('circle')
        .classed('axis_circle', true)
        .attr('r', function(d) { return viewstate.scaler(d); });

    circles
        .attr('r', function(d) { return viewstate.scaler(d); });

    circles.exit().remove();

    // label them!

    // only draw labels if they're supposed to be visible
    if (scaleFactor <= ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) {
        var backdata2 = [];
    }

    var labels = backGroup.selectAll('text.axis_label').data(backdata2);

    labels.enter().append('text')
        .text(formatDollarValue)
        .classed('axis_label', true)
        .attr('transform', function(d) {
            return 'translate('+ 0 + ','+ (0 - viewstate.scaler(d)) + ')'
        })
        .attr('dy', '1em')
        .attr('dx', function(d) { return -safeGetBBox(this)['width'] / 2 });

    labels
        .attr('transform', 
              function(d) {
                  return 'translate('+ 0 + ','+ (0 - viewstate.scaler(d)) + ')';
              });

    labels.exit().remove();

    /***** Create the wedges/sectors */
    var sectorsGroup = viewObj.svg.select('g.sections');
    if (sectorsGroup.empty()) {
        sectorsGroup = viewObj.svg.append('g').classed('sections', true);
    }


    var donut = d3.layout.pie()
        .value(function() {return 1;})
        .startAngle(-Math.PI / 2)
        .endAngle(3 * Math.PI / 2);

    var arc = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(function(d) {
            return viewstate.scaler(d.data['periods'][viewObj.period()]['value']);
        });

    var paths = sectorsGroup.selectAll('path.wedge')
        .data(donut(data['aggregates']));

    var enterer = paths.enter().append('path')
        .classed('wedge', true)
        .attr('d', arc)
        .on('mousedown', viewObj.onmousedownMaker())
        .on('mousemove', viewObj.onmousemoveMaker())
        .on('mouseup', viewObj.onmouseupMaker())
        .on('dblclick', viewObj.ondblclickMaker());

    // d3 does not seem to provide a nice way to set dynamic styles...
    for (var style in cssStyles) {
        enterer.classed(cssStyles[style],
                        function(d) {
                            return d.data.metadata.cssClass == cssStyles[style];
                        });
    }

    paths.exit().remove();

    // update arcs, ergh
    var updater = paths
        .attr('d', arc);

    // d3 does not seem to provide a nice way to set dynamic styles...
    for (var style in cssStyles) {
        updater.classed(cssStyles[style],
                        function(d) {
                            return d.data.metadata.cssClass == cssStyles[style];
                        });
    }


    /***** Create section labels */
    var labelsGroup = viewObj.svg.select('g.labels');
    if (labelsGroup.empty()) {
        labelsGroup = viewObj.svg.append('g').classed('labels', true);
    }

    // General Case
    // ... utility functions
    function isTop(d ) {
        if (d.data.metadata.cssClass == 'revenue' ||
            d.data.metadata.cssClass == 'assets') {
            return true;
        } else {
            return false;
        }
    }

    function isBottom(d) {return !isTop(d);}

    function horizSide(d) {
        if (data['aggregates'].length == 2) {
            return 'middle';
        } else {
            if (d.data.metadata.cssClass == 'revenue' ||
                d.data.metadata.cssClass == 'expenses') {
                return 'right';
            } else {
                return 'left';
            }
        }
    }

    function donutKey(d) {
        return d.data.name;
    }

    // only draw labels if they're visible
    if (scaleFactor <= ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) {
        var labelData = [];
    } else {
        var labelData = donut(data['aggregates']);
    }

    var wedgeInnerLabels = labelsGroup
        .selectAll('text.wedgeLabel.inner')
        .data(labelData, donutKey);

    var wedgeOuterLabels = labelsGroup
        .selectAll('text.wedgeLabel.outer')
        .data(labelData, donutKey);

    function innerLabelsText(d) {
        if (!isTop(d)) {
            return d.data.name.toUpperCase();
        } else {
            return formatDollarValue(d.data['periods'][viewObj.period()]['value']);
        }
    }

    function outerLabelsText(d) {
        if (isTop(d)) {
            return d.data['name'].toUpperCase();
        } else {
            return formatDollarValue(d.data['periods'][viewObj.period()]['value']);
        }
    }

    function labelsX(d) {
        var horiz = horizSide(d);
        if (horiz == 'left') {
            return -(safeGetBBox(this)['width'] + 15);
        } else if (horiz == 'middle') {
            return -safeGetBBox(this)['width'] / 2;
        } else { // assume right
            return 15;
        }
    }

    function innerLabelsY(d) {
        // safety switch: getBBox fails if not visible
        if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) return 0;
        var height = safeGetBBox(this)['height'];
        // save the value for the outer label
        d.data.metadata.computedTextHeight = height;
        if (isTop(d)) {
            return -15;
        } else {
            return (height + 10);
        }
    }

    function outerLabelsY(d) {
        // safety switch: getBBox fails if not visible
        if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) return 0;
        var height = safeGetBBox(this)['height'];
        if (isTop(d)) {
            return -8 - d.data.metadata.computedTextHeight;
        } else {
            return d.data.metadata.computedTextHeight + height + 4;
        }
    }

    // inner text: for top labels this is the money value,
    //             for bottom labels this is the name
    // we determine what's what by virtue of the section's css class
    wedgeInnerLabels.enter()
        .append('text')
        .classed('wedgeLabel', true)
        .classed('inner', true)
        .classed('value', isTop)
        .classed('name', isBottom)
        .text(innerLabelsText)
        .attr('x', labelsX)
        .attr('y', innerLabelsY)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; });

    wedgeInnerLabels
        .text(innerLabelsText)
        .attr('x', labelsX)
    //.attr("y", innerLabelsY): x may change with period, y will not.
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; });

    wedgeInnerLabels.exit().remove();

    // outer text: vice versa
    wedgeOuterLabels.enter()
        .append('text')
        .classed('wedgeLabel', true)
        .classed('outer', true)
        .classed('value', isBottom)
        .classed('name', isTop)
        .text(outerLabelsText)
        .attr('x', labelsX)
        .attr('y', outerLabelsY)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; });

    wedgeOuterLabels
        .text(outerLabelsText)
        .attr('x', labelsX)
    //.attr("y", outerLabelsY)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; });

    wedgeOuterLabels.exit().remove();

    // entity name
    var entitylabel = labelsGroup
        .selectAll('text.entityLabel.name')
        .data([viewObj.name]);

    entitylabel.enter()
        .append('text')
        .classed('entityLabel', true).classed('name', true)
        .text(viewObj.data().name)
        .attr('x', function(d) { return -safeGetBBox(this)['width'] / 2; })
        .attr('y', 20)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; });

    entitylabel
        .attr('x', function(d) { return -safeGetBBox(this)['width'] / 2; })
        .attr('y', 80)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; });

    entitylabel.exit().remove();

    // Halo if the whole thing is just too small to see.

    var tinyHaloThreshold = 30;
    var tinyHalo = viewObj.svg
        .selectAll('circle.tinyHalo')
        .data([backdata.pop()].map(viewstate.scaler));

    tinyHalo.enter().append('circle').classed('tinyHalo', true)
        .attr('r', tinyHaloThreshold)
        .attr('display', 
              function(d) { return d < tinyHaloThreshold ? null : 'none' });

    tinyHalo.attr('display', 
                  function(d) { return d < tinyHaloThreshold ? null : 'none' });


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

    if (data['relations'] && data['relations']['revenueVexpenses'] &&
        revenue !== undefined && expenses !== undefined) {

        rVeData = revenue - expenses;
    } else {
        rVeData = null;
    }

    if (data['relations'] && data['relations']['assetsVliabilities'] &&
        assets !== undefined && liabilities !== undefined) {

        aVlData = assets - liabilities;
    } else {
        aVlData = null;
    }

    var relations = viewObj.svg.select('g.relations');
    if (relations.empty()) {
        relations = viewObj.svg.append('g').classed('relations', true);
    }

    relations.attr('transform',
                   function(d) { return 'scale(' + scaleFactor + ')'; });

    // FIXME: this is going to break lots where d==0
    // every time there is a bipartite test, it needs to be made tripartite

    function relationNameText(d) {
        if (d.value < 0) {
            return data['relations'][d.relation]['less'].toUpperCase();
        } else if (d.value == 0) {
            return data['relations'][d.relation]['equal'].toUpperCase();
        } else {
            return data['relations'][d.relation]['greater'].toUpperCase();
        }
    }

    function relationsInnerText(d) {
        if (isProfit(d)) { // value
            return formatDollarValue(d.value);
        } else {
            return relationNameText(d);
        }
    }

    function relationsOuterText(d) {
        if (isLoss(d)) {
            return formatDollarValue(-d.value);
        } else {
            return relationNameText(d);
        }
    }

    function relationInnerY(d) {
        // safety switch: getBBox fails if not visible
        if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) return 0;
        var height = safeGetBBox(this)['height'];
        // save the value for the outer label
        d.computedTextHeight = height;
        if (isProfit(d)) {
            return -15;
        } else {
            return (height + 10);
        }
    }

    function relationOuterY(d) {
        // safety switch: getBBox fails if not visible
        if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) return 0;
        var height = safeGetBBox(this)['height'];
        if (isProfit(d)) {
            return -9 - d.computedTextHeight;
        } else {
            return d.computedTextHeight + height + 5;
        }
    }


    function labelX(d) {
        if (d.relation == 'revenueVexpenses') {
            return viewstate.scaler((revenue > expenses) ? revenue : expenses) / scaleFactor + 8;
        } else {
            return -viewstate.scaler((assets > liabilities) ? assets : liabilities) / scaleFactor - safeGetBBox(this)['width'] - 8;
        }
    }

    function isProfit(d) {
        return d.value > 0;
    }
    function isLoss(d) {
        return d.value < 0;
    }

    // don't reconstruct the data each time; we'll lose the rendering info stored in it as a side-effect of
    // getting the y value for the inner label. (ergh, side-effects. FIXME.)
    var relationsData = [];
    if (rVeData !== null) relationsData.push({'relation': 'revenueVexpenses',
                                              'value': rVeData,
                                              'displayStyle': (rVeData >= 0 ? 'revenue' : 'expenses')});
    if (aVlData !== null) relationsData.push({'relation': 'assetsVliabilities',
                                              'value': aVlData,
                                              'displayStyle': (aVlData >= 0 ? 'assets' : 'liabilities')});


    // don't display labels if they're too small
    if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) relationsData = [];

    var innerLabel = relations
        .selectAll('text.relationLabel.innerLabel')
        .data(relationsData);

    var enterer = innerLabel.enter().append('text')
        .text(relationsInnerText)
        .classed('relationLabel', true)
        .classed('innerLabel', true)
        .classed('name', isLoss)
        .classed('value', isProfit)
        .classed('revenue', isProfit)
        .classed('expenses', isLoss)
        .attr('x', labelX)
        .attr('y', relationInnerY);

    for (var style in cssStyles) {
        enterer.classed(cssStyles[style],
                        function(d) {
                            return d.displayStyle == cssStyles[style];
                        });
    }


    var updater = innerLabel.text(relationsInnerText)
        .classed('revenue', isProfit)
        .classed('expenses', isLoss)
        .classed('name', isLoss)
        .classed('value', isProfit)
        .attr('x', labelX)
        .attr('y', relationInnerY);

    for (var style in cssStyles) {
        updater.classed(cssStyles[style],
                        function(d) {
                            return d.displayStyle == cssStyles[style];
                        });
    }

    innerLabel.exit().remove();

    var outerLabel = relations
        .selectAll('text.relationLabel.outerLabel')
        .data(relationsData);

    var enterer = outerLabel.enter().append('text')
        .text(relationsOuterText)
        .classed('relationLabel', true)
        .classed('outerLabel', true)
        .classed('name', isProfit)
        .classed('value', isLoss)
        .classed('revenue', isProfit)
        .classed('expenses', isLoss)
        .attr('x', labelX)
        .attr('y', relationOuterY);

    for (var style in cssStyles) {
        enterer.classed(cssStyles[style],
                        function(d) {
                            return d.displayStyle == cssStyles[style];
                        });
    }

    var updater = outerLabel.text(relationsOuterText)
        .classed('revenue', isProfit)
        .classed('expenses', isLoss)
        .classed('name', isProfit)
        .classed('value', isLoss)
        .attr('x', labelX)
        .attr('y', relationOuterY);

    for (var style in cssStyles) {
        updater.classed(cssStyles[style],
                        function(d) {
                            return d.displayStyle == cssStyles[style];
                        });
    }


    outerLabel.exit().remove();

};

ViewObjRenderers.defaultSectorRenderer.dollarRadiusWhenRendered = function(
    viewObj, renderMode) {

    var data = JSON.parse(JSON.stringify(viewObj.data()));

    // which aggregates are we interested in?
    if (renderMode['specifiedAggregates']) {
        data['aggregates'] = data['aggregates'].filter(function(aggregate) {
            for (var specAgg in renderMode['specifiedAggregates']) {
                if (aggregate.metadata.cssClass == renderMode['specifiedAggregates'][specAgg])
                    return true;
            }
            return false;
        });
    }

    /***** Calculate ranges etc */
    var maxValue = -1;
    for (var d in data['aggregates']) {
        if (data['aggregates'][d]['periods'][viewObj.period()]['value'] > maxValue) {
            maxValue = data['aggregates'][d]['periods'][viewObj.period()]['value'];
        }
    }

    var exponent = Math.floor(Math.log(maxValue) / Math.LN10);

    var niceMaxValue = Math.ceil(maxValue / Math.pow(10, exponent)) *
        Math.pow(10, exponent);

    return niceMaxValue;
};

/************************************************************ Bubble Renderer */
ViewObjRenderers.bubbleRenderer = function(viewObj, renderMode) {
    
    // don't display a valueless circle
    if (viewObj.data()['periods'][viewObj.period()]['value'] <= 0) {
        return;
    }

    function link(d) {
        if (d.href) window.open(d.href, d.target);
    }

    // create the bubble
    var circleGroup = viewObj.svg.select('g.circle');
    if (circleGroup.empty()) {
        circleGroup = viewObj.svg
            .append('g')
            .classed('circle', true);
    }

    var data = viewObj.data()

    var circle = circleGroup.selectAll('circle')
        .data([data], function(d) {return d['name'];});

    circle.enter().append('circle')
        .attr('r', function(d) {return viewstate.scaler(d['periods'][viewObj.period()]['value']);})
        .classed(renderMode['cssClass'], true)
        .classed('wedge', true)
        .on('mousedown', viewObj.onmousedownMaker())
        .on('mousemove', viewObj.onmousemoveMaker())
        .on('mouseup', viewObj.onmouseupMaker())
        .on('dblclick', viewObj.ondblclickMaker())
        .classed('link', function(d) { return d.href })
        .classed('cannotPopOut', function() {return !viewObj.canPopOut();});

    circle.exit().remove();

    circle.attr('r', function(d) {return viewstate.scaler(d['periods'][viewObj.period()]['value']);})

    /* Create section labels */
    var labelsGroup = viewObj.svg.select('g.labels');
    if (labelsGroup.empty()) {
        labelsGroup = viewObj.svg
            .append('g')
            .classed('labels', true);
    }

    var scaleFactor = ViewObjRenderers.scaleFactor(data['periods'][viewObj.period()]['value'], 50 * bil);

    if (scaleFactor <= ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) {
        var labelData = [];
    } else {
        var labelData = [data];
    }

    var nameLabel = labelsGroup
        .selectAll('text.wedgeLabel.name')
        .data(labelData);

    var valueLabel = labelsGroup
        .selectAll('text.wedgeLabel.value')
        .data(labelData);

    labelsGroup.attr('transform',
                     function(d) {return 'scale(' + scaleFactor + ')'; });

    function valueLabelY(d) {
        // safety switch: getBBox fails if scaled too hard(?)
        if (scaleFactor <= ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY) return 0;
        return safeGetBBox(this)['height'] - 10;
    }

    function centredTextLabelX(d) { return -(safeGetBBox(this)['width']) / 2; };

    nameLabel.enter().append('text')
        .text(function(d) {return d['name'].toUpperCase();})
        .classed('wedgeLabel', true).classed('name', true)
        .attr('x', centredTextLabelX)
        .attr('y', -10)
        .classed('link', function(d) { return d.href })
        .on('click', link);


    nameLabel.exit().remove();

    valueLabel.enter().append('text')
        .text(function(d) {return formatDollarValue(d['periods'][viewObj.period()]['value']);})
        .classed('wedgeLabel', true).classed('value', true)
        .attr('x', centredTextLabelX)
        .attr('y', valueLabelY)
        .classed('link', function(d) { return d.href })
        .on('click', link);

    valueLabel.exit().remove();

    /* If I have children, draw a little circle around us all to indicate that
       we go together */

    var enclosingCircleGroup = viewObj.svg.select('g.enclosingCircle');
    if (enclosingCircleGroup.empty()) {
        enclosingCircleGroup = viewObj.svg
            .append('g')
            .classed('enclosingCircle', true);
    }

    var enclosingCircleData =
        (viewObj.children().length ? [viewObj._dollarRadius] : []);

    var enclosingCircle = enclosingCircleGroup
        .selectAll('circle.axis_circle')
        .data(enclosingCircleData);

    enclosingCircle.enter().append('circle')
        .classed('axis_circle', true)
        .attr('r', viewstate.scaler);

    enclosingCircle
        .attr('r', viewstate.scaler);

    enclosingCircle.exit().remove();

};

ViewObjRenderers.bubbleRenderer.dollarRadiusWhenRendered =
    function(viewObj, renderMode) {
        return viewObj.data()['periods'][viewObj.period()]['value'];
    };

function formatDollarValue(d) {
    if (d >= 1000000000000) {
        return (d / 1000000000000).toFixed(1) + 'T';
    } else if (d >= 1000000000) {
        return (d / 1000000000).toFixed(1) + 'B';
    } else if (d >= 1000000) {
        return (d / 1000000).toFixed(1) + 'M';
    } else if (d >= 1000) {
        return (d / 1000).toFixed(1) + 'K';
    } else {
        return d.toFixed(1);
    }
}

function safeGetBBox(svg) {
    //    try {
    var bbox = svg.getBBox();
    //    } catch (e) {
    //        var bbox = { 'height':0, 'width':0, 'x':0, 'y':0 };
    //        console.log(svg);
    //    }
    return bbox;
}
