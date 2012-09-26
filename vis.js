


var width = window.innerWidth-300,
    height = window.innerHeight*0.9,
    maxOuterRadius = Math.min(width, height) / 2,
    innerRadius = 0,
    donut = d3.layout.pie().value( function(d) { return d.internal.wedgeSize; } ).startAngle(-Math.PI/2).endAngle(3*Math.PI/2)

var vis = d3.select("body")
  .append("svg")
    .data([data_aus_real])
    .attr("width", width)
    .attr("height", height);

var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius( function(d) {return scaler(d.data.value); } );

/* not very necessary, and not very d3...? */
var circles_group = vis.select("g.axis_circles");
if (circles_group.empty()) circles_group=vis.append("g").classed('axis_circles',true);

var circle_labels_group = vis.select("g.axis_circle_labels");
if (circle_labels_group.empty()) circles_lables_group=vis.append("g").classed('axis_circle_labels',true);

function updateBacking( ) {
	maxValue=-1;
	for (d in data) {
		if (data[d].value>maxValue) maxValue = data[d].value;
	}

	var exponent = Math.floor(Math.log(maxValue)/Math.LN10);

	niceMaxValue = Math.ceil(maxValue/Math.pow(10, exponent))*Math.pow(10, exponent);

	scaler = d3.scale.sqrt().domain([0,niceMaxValue]).range([0,maxOuterRadius]);

	// create the scale background
	backdata = d3.range( 1, 9 ).map( function (d) { return d*Math.pow(10, exponent - 1); } );
	backdata2 = d3.range( 1, Math.ceil(maxValue/Math.pow(10, exponent))+1 ).
					 map(function (d) { return d*Math.pow(10, exponent); } );

	//console.log( backdata )
	//console.log(backdata2)

	backdata = backdata.concat( backdata2 );

	var circles = circles_group.selectAll("circle")
		.data(backdata);

	circles
		.enter().append("circle")
		.attr('class', 'scale')
		.attr("r",function(d) { return scaler(d); } )
		.attr("transform", "translate(" + maxOuterRadius + "," + maxOuterRadius + ")")

	circles.attr("r",function(d) { return scaler(d); } );

	circles.exit().remove();

	// label them!
	var lables=circle_labels_group.selectAll("text").data(backdata2);

	lables.enter().append("text")
		.text(formatDollarValue)
		.attr("class","label")
		.attr("transform", function(d) {return "translate("+maxOuterRadius+","+(maxOuterRadius-scaler(d))+")"} )
		.attr("dy","1em")

	lables
		.text(formatDollarValue)
		.attr("transform", function(d) {return "translate("+maxOuterRadius+","+(maxOuterRadius-scaler(d))+")"} );

	lables.exit().remove();
}

// create the wedges
var arcs_group = vis.append("g").attr("class","arc")
function updateWedges() {

	paths = arcs_group.selectAll("path").data(donut(data));

	paths.enter().append("path")
		.attr("class", "wedge")
		.attr("id", function(d) {return d.data.internal.cssId;} )
		.attr("transform", "translate(" + maxOuterRadius + "," + maxOuterRadius + ")")
		.attr("d", arc);

	paths.exit().remove();

	// update arcs, ergh
	paths
		.attr("d", arc)
		.attr("id", function(d) {return d.data.internal.cssId;} );

/*arcs.append("text")
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("display", function(d) { return d.value > .15 ? null : "none"; })
    .text(function(d, i) { return d.data.label; });*/
}

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


/**************************************** Controller */
update(data_aus_real);

function update( toData ) {
	data= JSON.parse(JSON.stringify(toData));

	if (data.length == 1) {
		d3.selectAll('input[name=revenue]')[0][0].value=data[0].value;
		d3.selectAll('input[name=expenditure]')[0][0].value='';
		d3.selectAll('input[name=assets]')[0][0].value='';
		d3.selectAll('input[name=liabilities]')[0][0].value='';
	}

	if (data.length == 2) {
		d3.selectAll('input[name=revenue]')[0][0].value=data[0].value;
		d3.selectAll('input[name=expenditure]')[0][0].value=data[1].value;
		d3.selectAll('input[name=assets]')[0][0].value='';
		d3.selectAll('input[name=liabilities]')[0][0].value='';
	}

	if (data.length == 4) {
		d3.selectAll('input[name=revenue]')[0][0].value=data[1].value;
		d3.selectAll('input[name=expenditure]')[0][0].value=data[2].value;
		d3.selectAll('input[name=assets]')[0][0].value=data[0].value;
		d3.selectAll('input[name=liabilities]')[0][0].value=data[3].value;
	}

	updateBacking();
	updateWedges();

}

function updateFromFields() {

	if (data.length == 1) {
		data[0].value=Number(d3.selectAll('input[name=revenue]')[0][0].value);
	}

	if (data.length == 2) {
		data[0].value=Number(d3.selectAll('input[name=revenue]')[0][0].value);
		data[1].value=Number(d3.selectAll('input[name=expenditure]')[0][0].value);
	}

	if (data.length == 4) {
		data[1].value=Number(d3.selectAll('input[name=revenue]')[0][0].value);
		data[2].value=Number(d3.selectAll('input[name=expenditure]')[0][0].value);
		data[0].value=Number(d3.selectAll('input[name=assets]')[0][0].value);
		data[3].value=Number(d3.selectAll('input[name=liabilities]')[0][0].value);
	}

	update( data );
	
}

update( data_aus_real );