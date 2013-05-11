'use strict';

/* A view object handles the display of a single 'object'; be it a quadrant
   diagram, a simple bubble, or a more complex bubble (e.g. embedded media)

   Views nest sub-views.

   The idea is that you deal directly with the view object, and it handles
   mapping everything out to d3.

   It's not a 'view' object in the traditional MVC sense; it includes logic on
   what happens when it is clicked, for example.

*/



/** @constructor
 *
 *  @param {Object} data an entity or item.
 *  @param {Object} parent a viewObj, or at the root level, a viewstate.
 *  @param {Array.<number>} position an (x$, y$) pair.
 *  @param {string=} category The category to give the item. This forms an
*                             inconsistent mess around where category is stored.
 */
function ViewObj(data, parent, position, category) {
  this.ParentingObject = ParentingObject;
  this.ParentingObject();

  this.parent = parent;
  this.parent.addChild(this);

  /* getter and setter for data
     */
  // todo: properly hide ._data
  this.data = function() {
    if (arguments.length == 0) return this._data;

    this._data = arguments[0];

    /* Category */
    if (this._data['category']) this['category'] = this._data['category'];

    /* Extract item from Item Entity */
    if (this._data['item']) this._data = this._data['item'];

  };


  this.data(data);
  // potentially override category.
  if (category) this['category'] = category;

  /* getter and setter for year/time period
       guaranteed to always return a period for which we have data
       if a period is set for which we have no data, .isInvalidPeriod is set.
     */
  // todo: properly hide ._period
  this.period = function() {
    if (arguments.length == 0) {
      if (!this.isInvalidPeriod) return this._period;
      else return this._oldPeriod;
    }

    if (this._period != arguments[0]) {
      var oldPeriod = this._period;
      var newPeriod = arguments[0];
      this._period = newPeriod;

      var periods = ('periods' in this.data()) ? this.data()['periods'] :
          this.data()['aggregates'][0]['periods'];

      if (newPeriod in periods) {
        this.isInvalidPeriod = false;
      } else {
        if (oldPeriod) this._oldPeriod = oldPeriod;
        else this._oldPeriod = Object.keys(periods)[0];
        this.isInvalidPeriod = true;
      }
      this.children().map(function(child) { child.period(newPeriod); });
    }
  };

  /* Rendering

       svg is the context to draw stuff into. It's position is affected by the
       bounding circle's cx and cy.

       _svg is the context that moves the viewObj and children as a whole.

       renderMode choses a renderer, render() kicks the process off,
       the heavy lifting is done by the renderers stored in the ViewObjRenders
       array.
    */
  this._svg = this.parent.svg.append('g');
  this.svg = this._svg.append('g');

  if (this.data().metadata && this.data().metadata.renderMode) {
    this.renderMode = this.data().metadata.renderMode;
  } else {
    if ('aggregates' in this.data()) {
      this.renderMode = {'name': 'defaultSectorRenderer'};
    } else {
      this.renderMode = {'name': 'bubbleRenderer'};
    }
  }
  this.boundingCircle = {};

  /* Position */
  this.moveTo(position);

  /* Event handling */
  var that = this;
  this.mouseData = {};
  // this is working really weirdly... but see viewstate.js
  // where it works fine.
  this.dragHandler = d3.behavior.drag()
      .origin(function(d) {
        // needed, not sure why.
        return {x: 0, y: 0};
      })
      .on('drag', function(d) {
        if (d3.event.sourceEvent.touches &&
            d3.event.sourceEvent.touches.length > 1) {
          return;
        }
        that.position = that.position.map(viewstate.scaler);
        that.position[0] += d3.event.x;
        that.position[1] += d3.event.y;
        that.position = that.position.map(viewstate.scaler.invert);
        that.moveTo(that.position);
        // on touch devices, a drag should prevent the context menu (taphold)
        try {
          window.clearTimeout(that.mouseData.tapholdTimer);
        } catch (e) {}
      });


  // context menu is set up in render.

  // double tap & long-touch context menu
  /** Return the handler for a touchstart event.
      @return {function} touchstart event handler. */
  this.ontouchstartMaker = function() {
    return function(d) {
      var t2 = d3.event.timeStamp;
      var t1 = that.mouseData.lastTouch || t2;
      var dt = t2 - t1;
      var fingers = d3.event.touches.length;
      that.mouseData.lastTouch = t2;

      // set infobox
      viewstate.updateInfobox(that, d);

      if (!dt || dt > 500 || fingers > 1) {
        // not double-tap
        // set up timer for long tap
        if (fingers == 1) {
          that.mouseData.event = d3.event;
          that.mouseData.tapholdTimer = window.setTimeout(function() {
            that.taphold(d);
          }, 600);
        } else {
          // another touch has started such that we no longer have two fingers
          // abort the timer.
          try {
            window.clearTimeout(that.mouseData.tapholdTimer);
          } catch (e) {}
        }
        return;
      }

      d3.event.preventDefault(); // double tap - prevent the zoom
      // FIXME horrible hack
      that.ondblclickMaker()(d);
    };
  };

  /** Return the handler for a touchend event
   @return {function} a touchend handler. */
  this.ontouchendMaker = function() {
    return function(d) {
      try {
        window.clearTimeout(that.mouseData.tapholdTimer);
      } catch (e) {}
    };
  };

  /** Event 'handler' for a taphold: a tap held for more than 600 ms.
      600 is a magic constant in ontouchstartMaker.
      This is truly shameful code. */
  this.taphold = function() {
    var e = that.mouseData.event;
    var e2 = {
      type: 'contextmenu',
      pageX: e.pageX,
      pageY: e.pageY
    };
    jQuery(e.target).trigger(e2);
  };

  /** Return the handler for a double click event
      @return {function} Double-click handler.
  */
  this.ondblclickMaker = function() {
    return function(d) {
      d3.event.stopPropagation();
      if ('aggregates' in that.data()) {
        // an entity
        if (that.data().aggregates.length == 4 &&
            (that.renderMode.specifiedAggregates == undefined ||
            that.renderMode.specifiedAggregates.length == 4)) {
          // full entity: go down to relation
          if (d.data['category'] == 'revenue' ||
              d.data['category'] == 'expenses') {
            that.renderMode.specifiedAggregates = ['revenue',
              'expenses'];
          } else {
            that.renderMode.specifiedAggregates = ['assets',
              'liabilities'];
          }
          that.render();
        } else if ((that.data().aggregates.length == 2 &&
            that.renderMode.specifiedAggregates == undefined) ||
            (that.data().aggregates.length == 4 &&
            that.renderMode.specifiedAggregates.length == 2)) {
          // a relation: go down to a single
          that.renderMode.specifiedAggregates =
              [d.data['category']];
          that.render();
        } else {
          // a single: pop in/out
          if (that.poppedOut) {
            that.popIn();
            that.render();
          } else {
            for (var idx in that.data().aggregates) {
              if (that.data().aggregates[idx]['category'] ==
                  d.data['category']) {

                that.popOut(idx);
                that.reposition();
                that.render();
                break;
              }
            }
          }
        }
      } else {
        // a bubble: pop in/out
        if (that.poppedOut) {
          that.popIn();
        } else {
          that.popOut();
        }
        that.reposition();
        var o = that;
        while (o.parent instanceof ViewObj) o = o.parent;
        o.render();
      }
    };
  };

  this._determineSizes = function() {
    /* having bubbled up to the top, now descend to get correct sizes,
           then position and bound on the way back up.
        */
    var innerRadius = ViewObjRenderers[this.renderMode['name']]
            .dollarRadiusWhenRendered(this);

    this.boundingCircle = {cx: 0, cy: 0,
      radius: innerRadius,
      innerRadius: innerRadius};

    var items = this.children();
    if (!items.length) return;

    for (var item = 0; item < items.length; item++) {
      items[item]._determineSizes();
    }

    var prevType = '';
    var list2Start = -1;

    // mess to pop out 2 aggregates at once.
    prevType = items[0]['category'];
    for (var item = 1; item < items.length; item++) {
      if (items[item]['category'] != prevType) {
        list2Start = item;
        break;
      }
    }
    this.boundingCircle =
        this.determineSizeGivenParameters(list2Start, innerRadius);
  };

  this._repositionTopDown = function(animate) {

    var innerRadius = ViewObjRenderers[this.renderMode['name']]
            .dollarRadiusWhenRendered(this);

    var items = this.children();
    if (!items.length) return;

    var prevType = '';
    var list2Start = -1;

    // mess to pop out 2 aggregates at once.
    prevType = items[0]['category'];
    for (var item = 1; item < items.length; item++) {
      if (items[item]['category'] != prevType) {
        list2Start = item;
        break;
      }
    }
    this.boundingCircle =
        this.repositionItemsGivenParameters(list2Start, innerRadius,
        animate);

    for (var item = 0; item < items.length; item++) {
      items[item]._repositionTopDown(animate);
    }
  };

  var that = this;
  /* The calculations for positioning stuff
     * Based on:
     * http://math.stackexchange.com/questions/251399/what-is-the-smallest-circle-such-that-an-arbitrary-set-of-circles-can-be-placed
     * Massively complicated by the thought of handling 2 lists:
     * - each must fit completely in the pi radians their sector traces out
     * -- this requires tangent to the perpendicular padding at each end
     * -- a big list cannot squeeze out a small list: angle = max(pi, sum)
     * -- hence derivatives get reeeeeeally messy.
     */
  var calcs = {
    // translate [lowerbound, upperbound) to a sorted list, optionally
    // reordering it dendritically.
    boundsToList: function(items, lowerbound, upperbound, dendritic) {
      var itemIdxs = [];
      // create a sorting map
      // TODO extend to pick up data from excel
      // sort based on last period
      // todo cache this or something?
      var periods = Object.keys(items[lowerbound].data()['periods']);
      periods.sort();
      var p = periods.pop();
      var map = [];
      for (var i = 0; i < upperbound - lowerbound; i++) {
        var d = items[lowerbound + i].data();
        map.push({'index': lowerbound + i,
          'value': d['periods'][p]['value']
        });
      }
      map.sort(function(a, b) {
        return b['value'] - a['value'];
      });

      if (dendritic) {
        // sort the items so that the biggest is in the middle
        // then they reduce in size alternately on either side.
        // e.g. 1 2 3 4 5 6 7 8 9
        // ---> 9 7 5 3 1 2 4 6 8
        for (var i = 0; i < upperbound - lowerbound; i += 2) {
          itemIdxs.push(map[i].index);
        }
        for (var i = 1; i < upperbound - lowerbound; i += 2) {
          itemIdxs.unshift(map[i].index);
        }
      } else {
        for (var item = 0; item < upperbound - lowerbound; item++) {
          itemIdxs.push(map[item].index);
        }
      }
      return itemIdxs;
    },

    phi: function(R, ri, ri1) {
      return Math.acos((R * R + R * ri + R * ri1 - ri * ri1) /
          ((R + ri) * (R + ri1)));
    },

    // this is the function for tangent padding
    psi: function(R, r) {
      return Math.asin(r / (r + R));
    },

    _WrapNoOverlap: function(R, list, bubblePtRadii) {
      var sum;
      var angles = [];
      var angle;
      // for each possible gap length
      var maxGap = Math.min(list.length / 2, 2);
      for (var i = 1; i <= maxGap; i++) {
        // for each pair
        for (var j = 0; j < list.length; j++) {
          // evaluate directly
          var idx2 = (j + i) % list.length;
          //console.log(j, idx2)
          angle = calcs.phi(R, bubblePtRadii[list[j]],
                            bubblePtRadii[list[idx2]]);
          if (i == 1) angles[j] = angle;
          // compare to sum
          sum = 0;
          for (var k = 0; k < i; k++) {
            var idx2 = (j + k) % list.length;
            //console.log(idx2, list[idx2])
            sum += angles[idx2];
          }
          // replace saved sum if smaller
          if (sum < angle) {
            var idx2 = (j + i) % list.length;
            //console.log('drop between ' + j + ' (' + list[j] + ')  and ' +
            // (idx2) + ' (' + list[idx2] + ') at gap ' + i + '. Was ' +
            // sum + ' now ' + angle);
            // FIXME: This only works for maxGap = 2
            angles[j + i - 1] = angle - angles[j];
            // skip it
            j++;
          }
        }
      }
      // calculate final sum
      sum = 0;
      for (var i = 0; i < list.length; i++) {
        sum += angles[i];
      }
      return [sum, angles];
    },

    sumPhiWrapNoOverlap: function(R, list, bubblePtRadii) {
      return calcs._WrapNoOverlap(R, list, bubblePtRadii)[0];
    },

    anglesWrapNoOverlap: function(R, list, bubblePtRadii) {
      return calcs._WrapNoOverlap(R, list, bubblePtRadii)[1];
    },

    _NoWrapNoOverlap: function(R, list, bubblePtRadii) {
      var sum;
      var angles = [];
      var angle;
      // for each possible gap length
      var maxGap = Math.min(list.length / 2, 2);
      for (var i = 1; i <= maxGap; i++) {
        // for each pair
        for (var j = 0; j < list.length - i; j++) {
          // evaluate directly
          var idx2 = (j + i);
          //console.log(j, idx2)
          angle = calcs.phi(R, bubblePtRadii[list[j]],
                            bubblePtRadii[list[idx2]]);
          if (i == 1) angles[j] = angle;
          // compare to sum
          sum = 0;
          for (var k = 0; k < i; k++) {
            var idx2 = (j + k);
            //console.log(j, idx2)
            sum += angles[idx2];
          }
          // replace saved sum if smaller
          if (sum < angle) {
            //console.log('drop between ' + j + ' (' + list[j] + ')  and ' +
            // (j + i) + ' (' + list[j + i] + ') at gap ' + i + '. Was ' +
            // sum + ' now ' + angle);
            // FIXME: This only works for maxGap = 2
            angles[j + i - 1] = angle - angles[j];
            // skip it
            j++;
          }
        }
      }
      // calculate final sum
      sum = calcs.psi(R, bubblePtRadii[list[0]]);
      for (var i = 0; i < list.length - 1; i++) {
        sum += angles[i];
      }
      sum += calcs.psi(R, bubblePtRadii[list[list.length - 1]]);
      return [sum, angles];
    },

    sumPhiNoWrapNoOverlap: function(R, list, bubblePtRadii) {
      return calcs._NoWrapNoOverlap(R, list, bubblePtRadii)[0];
    },

    anglesNoWrapNoOverlap: function(R, list, bubblePtRadii) {
      return calcs._NoWrapNoOverlap(R, list, bubblePtRadii)[1];
    },

    f: function(R, list1, list2, bubblePtRadii) {
      var sum = 0;
      if (!(list2 && list2.length)) {
        sum += calcs.sumPhiWrapNoOverlap(R, list1, bubblePtRadii);
      } else {
        /* for each list:
                   - tangent to the perpendicular padding on each end.
                   - angle is max( pi, sum ): don't allow it to be squeezed out
                */
        var subangle;
        subangle = calcs.sumPhiNoWrapNoOverlap(R, list1, bubblePtRadii);
        sum += Math.max(Math.PI, subangle);
        subangle = calcs.sumPhiNoWrapNoOverlap(R, list2, bubblePtRadii);
        sum += Math.max(Math.PI, subangle);
      }
      return 2 * Math.PI - sum;
    },

    bubbleAnglesSum: function(sectorPtRadius, list1, list2, bubblePtRadii) {
      return 2 * Math.PI - calcs.f(sectorPtRadius, list1, list2, bubblePtRadii);
    }
  };

  /**
     * Actually do the work of repositioning items.
     * @this {Object} current instance of object.
     * @param {number} list2Start The index at which list 2 begins,
     *                            or -1 if there's only 1 list.
     * @param {number} initialRadius the inner radius of the object.
     * @param {boolean} animate animate the transition?
     * @return {Object} the resultant bounding circle.
     */
  this.repositionItemsGivenParameters = function(
      list2Start, initialRadius, animate) {

    var dendritic = (window.packing == 'dendritic' &&
                         this.parent instanceof ViewObj);


    var items = this.children();

    if (list2Start == -1) {
      var list1 = calcs.boundsToList(items, 0, items.length, dendritic);
      var list2 = [];
    } else {
      var list1 = calcs.boundsToList(items, 0, list2Start, false);
      var list2 = calcs.boundsToList(items, list2Start, items.length, false);
    }

    /* do maths to figure out how to position and space the bubbles

           NB: We can't add dollar values to get the new radius due to sqrt
           scaling.
        */
    var sectorPtRadius = viewstate.scaler(this.boundingCircle.innerRadius);
    var bubblePtRadii = [];
    var bubbleAngles = [];
    var count = 0;

    for (var item = 0; item < items.length; item++) {
      var itemRadius = items[item].boundingCircle.radius;
      bubblePtRadii[item] = viewstate.scaler(itemRadius);
    }

    if ('treeAngle' in this) {
      var treeAngle = this.treeAngle;
    } else {
      var treeAngle = 0;
    }
    var that = this;
    var actuallyPosition = function(itemIdxs, domain, range, angleOffset,
                                        tangentPad) {

      var angleScaler = d3.scale.linear()
                .domain([0, domain])
                .range([0, (dendritic ? domain : range)]);
      if (dendritic) {
        var angle = treeAngle - domain / 2;
      } else {
        var angle = angleOffset;
      }
      if (tangentPad) {
        angle += angleScaler(calcs.psi(sectorPtRadius,
                                       bubblePtRadii[itemIdxs[0]]));
        var angles = calcs.anglesNoWrapNoOverlap(sectorPtRadius, itemIdxs,
                                                  bubblePtRadii);

      } else {
        var angles = calcs.anglesWrapNoOverlap(sectorPtRadius, itemIdxs,
                                               bubblePtRadii);
      }

      for (var i = 0; i < itemIdxs.length; i++) {
        var item = itemIdxs[i];
        var itemPosition = [
          (sectorPtRadius + bubblePtRadii[item]) * Math.cos(angle),
          (sectorPtRadius + bubblePtRadii[item]) * Math.sin(angle)
        ].map(viewstate.scaler.invert);
        items[item].treeAngle = angle;
        angle += angleScaler(angles[i]);
        items[item].moveTo(itemPosition, animate);

      }
    };

    if (list2.length == 0) {
      actuallyPosition(list1,
          calcs.bubbleAnglesSum(sectorPtRadius, list1, list2, bubblePtRadii),
          2 * Math.PI, Math.PI, false);
    } else {
      actuallyPosition(list1,
          calcs.sumPhiNoWrapNoOverlap(sectorPtRadius, list1, bubblePtRadii),
          Math.PI, Math.PI, true);
      actuallyPosition(list2,
          calcs.sumPhiNoWrapNoOverlap(sectorPtRadius, list2, bubblePtRadii),
          Math.PI, 0, true);
    }

    var result = {cx: 0, cy: 0, radius: sectorPtRadius};

    var circles = items.map(function(child) {
      var circle = child.boundingCircle;
      return {cx: viewstate.scaler(child.position[0]),
        cy: viewstate.scaler(child.position[1]),
        radius: viewstate.scaler(circle.radius) };
    });
    circles.push({cx: 0, cy: 0, radius: viewstate.scaler(initialRadius)});

    if (dendritic && 'treeAngle' in this) {
      var tangentPt = [-sectorPtRadius * Math.cos(treeAngle),
            -sectorPtRadius * Math.sin(treeAngle)];
      result = optimisedDendriticBoundingCircleForCircles(
          circles, tangentPt, [0, 0]);
    } else {
      result = minimumBoundingCircleForCircles(circles);
    }
    result.radius = viewstate.scaler.invert(result.radius);
    result.cx = viewstate.scaler.invert(result.cx);
    result.cy = viewstate.scaler.invert(result.cy);
    return result;
  };

  /**
     * Determine my inner and outer radius.
     *
     * @this {Object} current instance of object.
     * @param {number} list2Start The index at which list 2 begins,
     *                            or -1 if there's only 1 list.
     * @param {number} initialRadius the inner radius of the object.
     * @return {Object} the resultant partial bounding circle.
     */
  this.determineSizeGivenParameters = function(
      list2Start, initialRadius) {

    var dendritic = (window.packing == 'dendritic' &&
                         this.parent instanceof ViewObj);


    var items = this.children();

    if (list2Start == -1) {
      var list1 = calcs.boundsToList(items, 0, items.length, dendritic);
      var list2 = [];
    } else {
      var list1 = calcs.boundsToList(items, 0, list2Start, false);
      var list2 = calcs.boundsToList(items, list2Start, items.length, false);
    }

    /* do maths to figure out how to position and space the bubbles

           NB: We can't add dollar values to get the new radius due to sqrt
           scaling.
        */
    var sectorPtRadius = viewstate.scaler(initialRadius);
    var bubblePtRadii = [];
    var bubbleAngles = [];
    var count = 0;

    for (var item = 0; item < items.length; item++) {
      var itemRadius = items[item].boundingCircle.radius;
      bubblePtRadii[item] = viewstate.scaler(itemRadius);
    }

    // Binary Search
    if (calcs.bubbleAnglesSum(sectorPtRadius, list1, list2,
        bubblePtRadii) > 2 * Math.PI) {

      var Rn = sectorPtRadius;
      var Rn1 = 3 * sectorPtRadius;

      var result = calcs.f((Rn1 + Rn) / 2, list1, list2, bubblePtRadii);
      while (result == 0 || result < -0.001) {
        //console.log(Rn, Rn1, result);
        if (result == 0) {
          // too big
          Rn1 = (Rn1 + Rn) / 2;
        } else {
          // too small
          Rn = (Rn1 + Rn) / 2;
        }
        result = calcs.f((Rn1 + Rn) / 2, list1, list2, bubblePtRadii);
      }
      //console.log(Rn, Rn1, (Rn + Rn1) / 2, result);
      sectorPtRadius = (Rn + Rn1) / 2;
    }


    var treeAngle = this.treeAngle;
    var generatePositions = function(itemIdxs, domain, range, angleOffset,
                                        tangentPad) {

      var angleScaler = d3.scale.linear()
                .domain([0, domain])
                .range([0, (dendritic ? domain : range)]);
      if (treeAngle && dendritic) {
        var angle = 0 - domain / 2;
      } else {
        var angle = angleOffset;
      }
      if (tangentPad) {
        angle += angleScaler(calcs.psi(sectorPtRadius,
                                       bubblePtRadii[itemIdxs[0]]));

        var angles = calcs.anglesNoWrapNoOverlap(sectorPtRadius, itemIdxs,
                                                 bubblePtRadii);
      } else {
        var angles = calcs.anglesWrapNoOverlap(sectorPtRadius, itemIdxs,
                                               bubblePtRadii);
      }

      circles = [];
      for (var i = 0; i < itemIdxs.length; i++) {
        var item = itemIdxs[i];
        var itemPosition = [
          (sectorPtRadius + bubblePtRadii[item]) * Math.cos(angle),
          (sectorPtRadius + bubblePtRadii[item]) * Math.sin(angle)
        ];
        if (i + 1 < itemIdxs.length) {
          angle += angleScaler(angles[i]);
        }
        circles.push({'cx': itemPosition[0],
          'cy': itemPosition[1],
          'radius': viewstate.scaler(items[item].boundingCircle.radius)});
      }
      return circles;
    };

    if (list2.length == 0) {
      var circles = generatePositions(
          list1,
          calcs.bubbleAnglesSum(sectorPtRadius, list1, list2, bubblePtRadii),
          2 * Math.PI, Math.PI, false);
    } else {
      var circles = generatePositions(
          list1,
          calcs.sumPhiNoWrapNoOverlap(sectorPtRadius, list1, bubblePtRadii),
          Math.PI, Math.PI, true);
      var circles = generatePositions(
          list2,
          calcs.sumPhiNoWrapNoOverlap(sectorPtRadius, list1, bubblePtRadii),
          Math.PI, 0, true);
    }

    circles.push({cx: 0, cy: 0, radius: viewstate.scaler(initialRadius)});

    //console.log(circles);
    if (dendritic) {
      //console.log(sectorPtRadius, initialRadius);
      var tangentPt = [-sectorPtRadius, 0];
      var result = optimisedDendriticBoundingCircleForCircles(
          circles, tangentPt, [0, 0]);
    } else {
      var result = minimumBoundingCircleForCircles(circles);
    }
    result.radius = viewstate.scaler.invert(result.radius);
    result.innerRadius = viewstate.scaler.invert(sectorPtRadius);
    return result;
  };


}


/**
 * Move myself to the given position.
 * units are dollars
 * @param {Array.<number>} position New position.
 * @param {boolean=} animate Should the movement be animated?
 */
ViewObj.prototype.moveTo = function(position, animate) {
  this.position = position;
  var updater;
  if (animate) updater = this._svg.transition().duration(1000);
  else updater = this._svg;
  updater.attr('transform',
      'translate(' +
      this.position.map(viewstate.scaler).join(',') +
      ')');
};


/**
 * Removes current object from svg.
 * Also remove current object from parent.
 */
ViewObj.prototype.remove = function() {
  this.svg.remove();
  this.parent.removeChild(this);
};


/**
 * Pops-in popped-out children.
 * Finds the first parent object that is not a ViewObj and calls its render
 * method.
 */
ViewObj.prototype.popIn = function() {
  this.children().map(
      function(child) { if (child.poppedOut) child.popIn(); }
  );
  // this naive approach skips every second one due to progressive renumbering
  //this.children().map( function (child) { child.remove(); } );
  // this doesn't
  for (var i = this.children().length; i >= 0; i--) {
    if (this.children()[i]) this.children()[i].remove();
  }
  this.poppedOut = false;
};


/**
 * Select items and category of instance data()
 *  or of its aggregates if aggregates are present
 * Create a new ViewObj for every item with a value > 0
 *    and render it with bubbleRenderer
 * @param {number=} aggregate The index of the aggregate
 *                  (revenue/expenditure/assets/liabilites) to pop out.
 *                  Ignored if not a sector based object.
 *
 */
ViewObj.prototype.popOut = function(aggregate) {
  if ('aggregates' in this.data()) {
    var items = this.data()['aggregates'][aggregate]['items'];
    var category = this.data()['aggregates'][aggregate]['category'];
  } else {
    var items = this.data()['items'];
    var category = this['category'];
  }
  if (!items || items.length < 1) return;

  this.poppedOutAggregate = aggregate;
  this.poppedOut = true;

  var numChildren = items.length;

  for (var item in items) {
    // it it's non-zero, create it.
    if (items[item]['periods'][this.period()]['value'] <= 0) continue;
    var itemObj = new ViewObj(items[item], this, [0, 0], category);
    itemObj.period(this.period());
    itemObj._oldPeriod = this._oldPeriod;
    itemObj.isInvalidPeriod = this.isInvalidPeriod;
    itemObj.renderMode = {'name': 'bubbleRenderer'};
  }
};


/**
 * canPopOut
 * @param {number=} opt_aggregate Aggregate to query, if applicable.
 * @return {Boolean} can this aggregate/entity be popped out?
 */
ViewObj.prototype.canPopOut = function(opt_aggregate) {
  if ('aggregates' in this.data()) {
    return this.data()['aggregates'][opt_aggregate]['items'].length > 0;
  } else {
    return ('items' in this.data()) && (this.data()['items'].length > 0);
  }
};


/**
 * What periods are available to display?
 * (Assumes uniformity throughout the data.)
 * @return {Array.<string>} Available periods.
 */
ViewObj.prototype.availablePeriods = function() {
  if ('aggregates' in this.data()) {
    return Object.keys(this.data()['aggregates'][0]['periods']);
  } else {
    return Object.keys(this.data()['periods']);
  }
};


/** Turn myself in infobox filler.
 * @param {Object} callback_data The callback data we set - a d3 datum.
 * @return {string} What should go in the infobox.
 */
ViewObj.prototype.info = function(callback_data) {
  var p = this.period();
  var d = callback_data;

  // the object d3 provides for aggregates wraps the data. This unwrapps it.
  if ('data' in d) {
    d = d['data'];
  }

  var text = '<h2>' + d['name'] + '</h2><h3>';
  if (this.isInvalidPeriod) {
    text = text + 'No data for this period.</h3>';
  } else {
    text = text + '$' + formatDollarValue(d['periods'][p]['value']);
    text = text + '</h3><p>';
    if ('metadata' in d['periods'][p] &&
        'info' in d['periods'][p]['metadata']) {
      text = text + htmlEscape(d['periods'][p]['metadata']['info']);
    } else if ('metadata' in d && 'info' in d['metadata']) {
      text = text + htmlEscape(d['metadata']['info']);
    }
    text = text + '</p><p>';
    if ('metadata' in d['periods'][p] &&
        'link' in d['periods'][p]['metadata']) {
      text = text + '<a href="' + d['periods'][p]['metadata']['link'] + '" ';
      text = text + 'target="_blank">';
      text = text + 'More...</a>';
    } else if ('metadata' in d && 'link' in d['metadata']) {
      text = text + '<a href="' + d['metadata']['link'] + '" target="_blank">';
      text = text + 'More...</a>';
    }
    text = text + '</p>';
  }
  return text;
};


/**
 * Recalculate all the children positions. As this depends on positions
 * throughout the entire tree, this will ascend to the top level and work down,
 * regardless of where in the tree it is called.
 * @param {boolean=} animate Animate the movements?
 */
ViewObj.prototype.reposition = function(animate) {
  // calling reposition on anything in the chain causes the whole thing to be
  // rejigged
  var obj = this;
  while (obj.parent instanceof ViewObj) {
    obj = obj.parent;
  }
  /* to fix the tree-angle bug (#15), we really need to do the following:
       - descend to get signs accurate (bottom-up)
       - place things now we know precise sizes and therefore angles (top-down)
       this requires 2 runs through the tree. Short of using SVG rotate, this
       at least afaict, is going to need two passes through the *entire* tree.
    */
  obj._determineSizes();
  obj._repositionTopDown(animate);
  var recenterChild = function(child) {
    child.svg.attr('transform', 'translate(' +
                       -viewstate.scaler(child.boundingCircle.cx) + ',' +
                       -viewstate.scaler(child.boundingCircle.cy) + ')');
    child.children().map(recenterChild);
  };
  // don't apply circle movement to top level, otherwise it bounces around.
  // just apply it to children.
  obj.children().map(recenterChild);

  recalcPackingEfficiency();
};


/**
 * Render
 * @param {boolean=} animate Should the transition be animated?
 */
ViewObj.prototype.render = function(animate) {

  // as much as it irks me to do context menus this way, better to include
  // jQuery than try to write my own context menus!
  // ... do this before children so they can do their own.
  ViewObjRenderers[this.renderMode['name']](this, animate);

  var that = this;

  var bindings = { 'deleteMenuItem' : function() {
    that.remove();
    updatePeriodSelector();
    viewstate.updateInfobox(null, null);
  },
  'centreViewMenuItem' : function() {
    viewstate.centreViewOn(that);
  },
  'resetMenuItem' : function() {
    that.renderMode.specifiedAggregates = undefined;
    that.popIn();
    that.render();
  },
  'popBothMenuItem': function() {
    that.popIn();
    var aggregates = that.data()['aggregates'];
    if (that.renderMode.specifiedAggregates) {
      var targets = that.renderMode.specifiedAggregates;
      for (var i = 0; i < aggregates.length; i++) {
        if (aggregates[i].category == targets[0] ||
            aggregates[i].category == targets[1]) {
          that.popOut(i);
        }
      }
    } else {
      that.popOut(0);
      that.popOut(1);
    }
    that.reposition();
    that.render();
  }
  };

  bindings = {'bindings': bindings};


  if (this.data().aggregates &&
      ((this.data().aggregates.length == 2 &&
          this.renderMode.specifiedAggregates == undefined) ||
      (this.data().aggregates.length == 4 &&
          this.renderMode.specifiedAggregates &&
          this.renderMode.specifiedAggregates.length == 2))) {

    jQuery(this.svg[0][0]).find('.wedge')
            .contextMenu('wedge2Menu', bindings);
  } else {
    jQuery(this.svg[0][0]).find('.wedge')
        .contextMenu('wedgeMenu', bindings);
  }
  jQuery(this.svg[0][0]).find('.tinyHalo').contextMenu('wedgeMenu', bindings);



  // render all children
  this.children().map(function(child) { child.render(animate); });

};


/** Renderers go here.

    This is *not* the way to design a totally new way of rendering data, because
    there's really tight linkage to the viewObj in event handling (what happens
    when you click or drag something). If you want to draw something totally
    new, create a subclass or new sort of ViewObj.

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
 * permitting) be it's natural size.
 * @return {number} The scale factor.
 */
ViewObjRenderers.scaleFactor = function(minValue, naturalValue) {
  // this is full of magic numbers. le sigh.
  // [0,tril] sets a default scaling factor for the size of the window
  return 1 /
      (d3.scale.sqrt().domain([0, tril]).range([0, 1])(viewstate.scaleMax) /
         d3.scale.sqrt().domain([0, naturalValue]).range([0, 1])(minValue));
};


/**
 * The default sector renderer.
 *
 * Draws either 4, 2 or 1 sectors, depending on the data and metadata.
 * Draws scale rings.
 * @param {ViewObj} viewObj The viewObj to render.
 */
ViewObjRenderers.defaultSectorRenderer = function(viewObj) {

  var p = viewObj.period();
  var renderMode = viewObj.renderMode;

  var _info = function(d) {
    viewstate.updateInfobox(viewObj, d);
  };

  /***** Pre-process the data */
  var data = JSON.parse(JSON.stringify(viewObj.data()));

  // which aggregates are we interested in?
  if (renderMode['specifiedAggregates']) {
    data['aggregates'] = data['aggregates'].filter(function(aggregate) {
      for (var specAgg in renderMode['specifiedAggregates']) {
        if (aggregate.category ==
            renderMode['specifiedAggregates'][specAgg]) {
          return true;
        }
      }
      return false;
    });
  }

  data['aggregates']
        .sort(function(a, b) {
        var ref = { 'liabilities': 0,
          'expenses': 1,
          'revenue': 2,
          'assets': 3 };
        return ref[a.category] - ref[b.category];
      });

  /***** Calculate ranges etc */
  var maxValue = -1;
  var minValue = tril * tril;
  for (var d in data['aggregates']) {
    if (data['aggregates'][d]['periods'][p].value > maxValue) {
      maxValue = data['aggregates'][d]['periods'][p].value;
    }
    if (data['aggregates'][d]['periods'][p].value < minValue) {
      minValue = data['aggregates'][d]['periods'][p].value;
    }

  }
  var exponent = Math.floor(Math.log(maxValue) / Math.LN10);
  var niceMaxValue = Math.ceil(maxValue / Math.pow(10, exponent)) *
      Math.pow(10, exponent);

  //var centreOffset = viewstate.scaler(niceMaxValue);

  var scaleFactor = ViewObjRenderers.scaleFactor(minValue, 400 * bil);

  /***** Start laying things out */
  // create the scale background
  var backdata = d3.range(1, 9).map(function(d) {
    return d * Math.pow(10, exponent - 1);
  });

  var backdata2 = d3.range(1,
      Math.ceil(maxValue / Math.pow(10, exponent)) + 1)
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
            return 'translate(' + 0 + ',' + (0 - viewstate.scaler(d)) + ')';
      })
        .attr('dy', '1em')
        .attr('dx', function(d) { return -safeGetBBox(this)['width'] / 2 });

  labels
        .attr('transform',
              function(d) {
        return 'translate(0,' + (0 - viewstate.scaler(d)) + ')';
              })
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

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
            return viewstate.scaler(d.data['periods'][p]['value']);
      });

  var paths = sectorsGroup.selectAll('path.wedge')
        .data(donut(data['aggregates']));

  var enterer = paths.enter().append('path')
      .classed('wedge', true)
      .classed('poppedOut', viewObj.poppedOut)
      .classed('invalidPeriod', viewObj.isInvalidPeriod)
      .attr('d', arc)
      .call(viewObj.dragHandler)
      .on('dblclick', viewObj.ondblclickMaker())
      .on('touchstart', viewObj.ontouchstartMaker())
      .on('touchend', viewObj.ontouchendMaker())
      .on('click', _info);

  // d3 does not seem to provide a nice way to set dynamic styles...
  for (var style in cssStyles) {
    enterer.classed(cssStyles[style],
        function(d) {
          return d.data['category'] == cssStyles[style];
        });
  }

  paths.exit().remove();

  // update arcs, ergh
  var updater = paths
        .attr('d', arc)
        .classed('poppedOut', viewObj.poppedOut)
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

  // d3 does not seem to provide a nice way to set dynamic styles...
  for (var style in cssStyles) {
    updater.classed(cssStyles[style],
        function(d) {
          return d.data.category == cssStyles[style];
        });
  }


  /***** Create section labels */
  var labelsGroup = viewObj.svg.select('g.labels');
  if (labelsGroup.empty()) {
    labelsGroup = viewObj.svg.append('g').classed('labels', true);
  }

  // General Case
  // ... utility functions
  function isTop(d) {
    if (d.data['category'] == 'expenses' ||
            d.data['category'] == 'liabilities') {
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
      if (d.data['category'] == 'revenue' ||
          d.data['category'] == 'expenses') {
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
      return formatDollarValue(d.data['periods'][p]['value']);
    }
  }

  function outerLabelsText(d) {
    if (isTop(d)) {
      return d.data['name'].toUpperCase();
    } else {
      return formatDollarValue(d.data['periods'][p]['value']);
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
    if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY)
      return 0;
    var height = safeGetBBox(this)['height'];
    // save the value for the outer label
    if (!('metadata' in d.data)) d.data.metadata = {};
    d.data.metadata.computedTextHeight = height;
    if (isTop(d)) {
      return -15;
    } else {
      return (height + 10);
    }
  }

  function outerLabelsY(d) {
    // safety switch: getBBox fails if not visible
    if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY)
      return 0;
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
        .call(viewObj.dragHandler)
        .text(innerLabelsText)
        .attr('x', labelsX)
        .attr('y', innerLabelsY)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; })
        .on('click', _info)
        .on('touchstart', _info);

  wedgeInnerLabels
        .text(innerLabelsText)
        .attr('x', labelsX)
      //.attr("y", innerLabelsY): x may change with period, y will not.
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; })
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

  wedgeInnerLabels.exit().remove();

  // outer text: vice versa
  wedgeOuterLabels.enter()
        .append('text')
        .classed('wedgeLabel', true)
        .classed('outer', true)
        .classed('value', isBottom)
        .classed('name', isTop)
        .call(viewObj.dragHandler)
        .text(outerLabelsText)
        .attr('x', labelsX)
        .attr('y', outerLabelsY)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; })
        .on('click', _info)
        .on('touchstart', _info);

  wedgeOuterLabels
        .text(outerLabelsText)
        .attr('x', labelsX)
      //.attr("y", outerLabelsY)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; })
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

  wedgeOuterLabels.exit().remove();

  // entity name
  var entitylabel = labelsGroup
      .selectAll('text.entityLabel.name');

  if (entitylabel.empty()) {
    entitylabel = labelsGroup.append('text')
        .classed('entityLabel', true).classed('name', true)
        .call(viewObj.dragHandler)
        .text(viewObj.data()['name'])
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; });
  }

  entitylabel
        .attr('x', function(d) { return -safeGetBBox(this)['width'] / 2; })
        .attr('y', 120)
        .attr('transform', function(d) {return 'scale(' + scaleFactor + ')'; })
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

  // Halo if the whole thing is just too small to see.

  var tinyHaloThreshold = 30;
  var tinyHalo = viewObj.svg
        .selectAll('circle.tinyHalo')
        .data([backdata.pop()].map(viewstate.scaler));

  tinyHalo.enter().append('circle').classed('tinyHalo', true)
        .call(viewObj.dragHandler)
        .attr('r', tinyHaloThreshold)
        .attr('display',
              function(d) { return d < tinyHaloThreshold ? null : 'none' })
        .on('click', _info)
        .on('touchstart', _info);

  tinyHalo.attr('display',
      function(d) { return d < tinyHaloThreshold ? null : 'none' })
      .classed('invalidPeriod', viewObj.isInvalidPeriod);


  /***** Relations */
  var revenue, expenses, assets, liabilities;
  var rVeData, aVlData;

  for (var aggregate in data['aggregates']) {
    if (data['aggregates'][aggregate]['category'] == 'revenue') {
      revenue = data['aggregates'][aggregate]['periods'][p]['value'];
    } else if (data['aggregates'][aggregate]['category'] == 'expenses') {
      expenses = data['aggregates'][aggregate]['periods'][p]['value'];
    } else if (data['aggregates'][aggregate]['category'] == 'assets') {
      assets = data['aggregates'][aggregate]['periods'][p]['value'];
    } else if (data['aggregates'][aggregate]['category'] == 'liabilities') {
      liabilities = data['aggregates'][aggregate]['periods'][p]['value'];
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
    if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY)
      return 0;
    var height = safeGetBBox(this)['height'];
    // save the value for the outer label
    d.computedTextHeight = height;
    if (isLoss(d)) {
      return -15;
    } else {
      return (height + 10);
    }
  }

  function relationOuterY(d) {
    // safety switch: getBBox fails if not visible
    if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY)
      return 0;
    var height = safeGetBBox(this)['height'];
    if (isLoss(d)) {
      return -15 - d.computedTextHeight;
    } else {
      return d.computedTextHeight + height + 5;
    }
  }


  function labelX(d) {
    if (d.relation == 'revenueVexpenses') {
      return viewstate.scaler((revenue > expenses) ? revenue : expenses) /
          scaleFactor + 8;
    } else {
      return -viewstate.scaler(
          (assets > liabilities) ? assets : liabilities) /
          scaleFactor - safeGetBBox(this)['width'] - 8;
    }
  }

  function isProfit(d) {
    return d.value > 0;
  }
  function isLoss(d) {
    return d.value < 0;
  }

  // don't reconstruct the data each time; we'll lose the rendering info
  // stored in it as a side-effect of
  // getting the y value for the inner label. (ergh, side-effects. FIXME.)
  var relationsData = [];
  if (rVeData !== null) {
    relationsData.push(
        {'relation': 'revenueVexpenses',
          'value': rVeData,
          'displayStyle': (rVeData >= 0 ? 'revenue' : 'expenses')
        });
  }
  if (aVlData !== null) {
    relationsData.push(
        {'relation': 'assetsVliabilities',
          'value': aVlData,
          'displayStyle': (aVlData >= 0 ? 'assets' : 'liabilities')
        });
  }


  // don't display labels if they're too small
  if (scaleFactor < ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY)
    relationsData = [];

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
        .call(viewObj.dragHandler)
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
        .attr('y', relationInnerY)
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

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
        .call(viewObj.dragHandler)
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
        .attr('y', relationOuterY)
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

  for (var style in cssStyles) {
    updater.classed(cssStyles[style],
        function(d) {
          return d.displayStyle == cssStyles[style];
        });
  }


  outerLabel.exit().remove();

};


/**
 * The default sector renderer for dollar Radius
 *
 * @param {ViewObj} viewObj The viewObj to render.
 * @return {Boolean} false.
 */
ViewObjRenderers.defaultSectorRenderer.dollarRadiusWhenRendered = function(
    viewObj) {

  var data = JSON.parse(JSON.stringify(viewObj.data()));
  var renderMode = viewObj.renderMode;

  // which aggregates are we interested in?
  if (renderMode['specifiedAggregates']) {
    data['aggregates'] = data['aggregates'].filter(function(aggregate) {
      for (var specAgg in renderMode['specifiedAggregates']) {
        if (aggregate['category'] ==
            renderMode['specifiedAggregates'][specAgg])
          return true;
      }
      return false;
    });
  }

  /***** Calculate ranges etc */
  var p = viewObj.period();
  var maxValue = -1;
  for (var d in data['aggregates']) {
    if (data['aggregates'][d]['periods'][p]['value'] > maxValue) {
      maxValue = data['aggregates'][d]['periods'][p]['value'];
    }
  }

  var exponent = Math.floor(Math.log(maxValue) / Math.LN10);

  var niceMaxValue = Math.ceil(maxValue / Math.pow(10, exponent)) *
      Math.pow(10, exponent);

  return niceMaxValue;
};


/**
 * Bubble renderer
 *
 * @param {ViewObj} viewObj The viewObj to render.
 * @param {Boolean} animate whether to animate or not.
 */
ViewObjRenderers.bubbleRenderer = function(viewObj, animate) {

  var p = viewObj.period();
  var category = viewObj['category'];

  var _info = function(d) {
    viewstate.updateInfobox(viewObj, d);
  };

  // create the bubble
  var circleGroup = viewObj.svg.select('g.circle');
  if (circleGroup.empty()) {
    circleGroup = viewObj.svg
            .append('g')
            .classed('circle', true);
  }

  var data = viewObj.data();

  var circle = circleGroup.selectAll('circle')
        .data([data], function(d) {return d['name'];});

  circle.enter().append('circle')
      .attr('r', function(d) {
        return viewstate.scaler(d['periods'][p]['value']);
      })
      .classed(category, true)
      .classed('wedge', true)
      .classed('poppedOut', function() {return viewObj.poppedOut;})
      .classed('invalidPeriod', viewObj.isInvalidPeriod)
      .call(viewObj.dragHandler)
      .on('dblclick', viewObj.ondblclickMaker())
      .on('touchstart', viewObj.ontouchstartMaker())
      .on('touchend', viewObj.ontouchendMaker())
      .on('click', _info)
      .classed('cannotPopOut', function() {return !viewObj.canPopOut();});

  circle.exit().remove();

  var updater = circle;
  if (animate) updater = circle.transition().duration(1000);
  updater.attr('r', function(d) {
    return viewstate.scaler(d['periods'][p]['value']);
  });

  circle
        .classed('poppedOut', viewObj.poppedOut)
        .classed('invalidPeriod', viewObj.isInvalidPeriod);

  /* Create section labels */
  var labelsGroup = viewObj.svg.select('g.labels');
  if (labelsGroup.empty()) {
    labelsGroup = viewObj.svg
            .append('g')
            .classed('labels', true);
  }

  var scaleFactor = ViewObjRenderers.scaleFactor(data['periods'][p]['value'],
      50 * bil);

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

  var updater = labelsGroup;
  if (animate) updater = labelsGroup.transition().duration(1000);
  updater.attr('transform',
      function(d) {return 'scale(' + scaleFactor + ')'; });

  function valueLabelY(d) {
    // safety switch: getBBox fails if scaled too hard(?)
    if (scaleFactor <= ViewObjRenderers.MIN_SCALE_FACTOR_FOR_LABEL_DISPLAY)
      return 0;
    return safeGetBBox(this)['height'] - 10;
  }

  function centredTextLabelX(d) { return -(safeGetBBox(this)['width']) / 2; };

  nameLabel.enter().append('text')
        .text(function(d) {return d['name'].toUpperCase();})
        .classed('wedgeLabel', true).classed('name', true)
        .call(viewObj.dragHandler)
        .attr('x', centredTextLabelX)
        .attr('y', -10)
        .on('touchstart', _info)
        .on('click', _info);

  var updater = nameLabel
      .classed('invalidPeriod', viewObj.isInvalidPeriod);
  if (animate) updater = updater.transition().duration(1000);
  updater
      .attr('x', centredTextLabelX);


  nameLabel.exit().remove();

  valueLabel.enter().append('text')
        .text(function(d) {return formatDollarValue(d['periods'][p]['value']);})
        .classed('wedgeLabel', true).classed('value', true)
        .attr('x', centredTextLabelX)
        .attr('y', valueLabelY)
        .call(viewObj.dragHandler)
        .on('touchstart', _info)
        .on('click', _info);

  valueLabel
      .text(function(d) {return formatDollarValue(d['periods'][p]['value']);})
      .classed('invalidPeriod', viewObj.isInvalidPeriod);

  var updater = valueLabel;
  if (animate) updater = valueLabel.transition().duration(1000);
  updater
        .attr('x', centredTextLabelX)
        .attr('y', valueLabelY);


  valueLabel.exit().remove();

  /* If I have children, draw a little circle around us all to indicate that
       we go together */

  var enclosingCircleData = [];

  if (viewObj.children().length && false) {
    //console.log(viewObj.boundingCircle);
    enclosingCircleData.push(viewObj.boundingCircle);
  }

  var enclosingCircleGroup = viewObj.svg
        .select('g.enclosingCircle');
  if (enclosingCircleGroup.empty()) {
    enclosingCircleGroup = viewObj.svg.append('g')
            .classed('enclosingCircle', true);
  }

  var enclosingCircle = enclosingCircleGroup
        .selectAll('circle.axis_circle')
        .data(enclosingCircleData);

  enclosingCircle.enter().append('circle')
        .classed('axis_circle', true)
        .attr('r', function(d) { return viewstate.scaler(d.radius); })
        .attr('cx', function(d) { return viewstate.scaler(d.cx); })
        .attr('cy', function(d) { return viewstate.scaler(d.cy); });


  var updater = enclosingCircle;
  if (animate) updater = enclosingCircle.transition().duration(1000);
  updater
        .attr('r', function(d) { return viewstate.scaler(d.radius); })
        .attr('cx', function(d) { return viewstate.scaler(d.cx); })
        .attr('cy', function(d) { return viewstate.scaler(d.cy); });

  enclosingCircle.exit().remove();


};


/**
 * Bubble renderer dollar radius when rendered
 *
 * @param {ViewObj} viewObj The viewObj to render.
 * @return {Integer} the value of the period of the periods of the data
 *                   of the supplied viewObj.
 */
ViewObjRenderers.bubbleRenderer.dollarRadiusWhenRendered =
    function(viewObj) {
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


/**
 * Evaluate the packing efficiency, defined as used space / total space.
 *
 * @param {ViewObj} viewObj The view object to evaluate the packing efficency
 *                          for.
 * @return {number} The packing efficiency (in [0, 1]).
 */
function packingEfficiency(viewObj) {
  if (!viewObj.children().length) {
    return 1;
  }

  var sum = 0;

  //console.log(viewObj);

  if (viewObj.renderMode['name'] == 'defaultSectorRenderer') {
    // dsr doesn't grow with internals, so it's efficiency is the
    // average of any children.
    for (var i = 0; i < viewObj.children().length; i++) {
      var child = viewObj.children()[i];
      var childRadius = viewstate.scaler(child.boundingCircle.radius);
      sum += packingEfficiency(child);
    }
    return (sum) / (viewObj.children().length);
  }

  for (var i = 0; i < viewObj.children().length; i++) {
    var child = viewObj.children()[i];
    var childRadius = viewstate.scaler(child.boundingCircle.radius);
    //console.log(packingEfficiency(child), childRadius);
    sum += packingEfficiency(child) * childRadius * childRadius;
  }

  var innerRadius = viewstate.scaler(
      ViewObjRenderers[viewObj.renderMode['name']]
        .dollarRadiusWhenRendered(viewObj));
  var outerRadius = viewstate.scaler(viewObj.boundingCircle.radius);

  return (sum + innerRadius * innerRadius) /
      (outerRadius * outerRadius);
}
