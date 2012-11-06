tour = { 'step': -1 };

tour.steps=[
	
	function () {
		viewstate.centreView();
		document.getElementById('tourCaption').innerHTML = 'Welcome to the tour. Press -&gt;';
	},
	
	function () {
		document.getElementById('tourCaption').innerHTML = 'This is a visualisation of financial data. <br /> \
You can zoom in or out at any time with the links in the right hand side bar.<br /> \
You can scroll around with the arrow keys.';
	},

	function () {
		viewstate.children()[0].period('2011-12');
		viewstate.children()[0].render({'name':'defaultSectorRenderer'});
		document.getElementById('tourCaption').innerHTML = 'Currently, you\'re looking at aggregate financial data for the Commonwealth of Australia, based \
on the 2011-12 Final Budget Outcome. <br /> \
Let\'s investigate it in more detail.';
	},


	function () {
		viewstate.children()[0].render({'name':'defaultSectorRenderer', 'specifiedAggregates':['revenue'] });
		viewstate.children()[0].popIn();
		
		document.getElementById('tourCaption').innerHTML = 'This is just the revenue. You can compare it to the previous year with the drop-down list. Try it!<br /> \
Now, let\'s investigate 2011-12 in more detail.';

		document.getElementById('periodSelector').disabled="";
	},

	function () {
		viewstate.children()[0].period('2011-12');
		viewstate.children()[0].render({'name':'defaultSectorRenderer', 'specifiedAggregates':['revenue']});
		viewstate.children()[0].popOut(0);

		document.getElementById('tourCaption').innerHTML = 'Now we can see the components of government revenue.<br />\
(I\'ve disabled the period selector for now because I haven\'t entered data for 2010-11 yet...)';

		document.getElementById('periodSelector').selectedIndex=1;
		document.getElementById('periodSelector').disabled="disabled";
	},

	function () {
		viewstate.children()[0].render({'name':'defaultSectorRenderer', 'specifiedAggregates':['expenses']});
		viewstate.children()[0].popIn();

		document.getElementById('tourCaption').innerHTML = "Now for government expenditure!<br />\
You can look at different years, or press -&gt; to look at the components.";

		document.getElementById('periodSelector').disabled="";
	},

	function () {
		viewstate.children()[0].period('2011-12');
		viewstate.children()[0].render({'name':'defaultSectorRenderer',  'specifiedAggregates':['expenses']});
		viewstate.children()[0].popOut(1);

		document.getElementById('tourCaption').innerHTML = 'Now we can see the components of government expenses.<br />\
(Again, I\'ve disabled the period selector for now because I haven\'t entered data for 2010-11 yet...)';

		document.getElementById('periodSelector').selectedIndex=1;
		document.getElementById('periodSelector').disabled="disabled";
	},
	
	function () {
		viewstate.children()[0].period('2011-12');
		viewstate.children()[0].render({'name':'defaultSectorRenderer',  'specifiedAggregates':['expenses']});
		viewstate.children()[0].popOut(1);

		document.getElementById('tourCaption').innerHTML = "You'll notice Defence is blue. It's a link to the Department of Defence's website.</br>\
The Other Purposes bubble links to some primitive JavaScript.";

		document.getElementById('periodSelector').selectedIndex=1;
		document.getElementById('periodSelector').disabled="disabled";
	},

	function () {
		viewstate.children()[0].render({'name':'defaultSectorRenderer', 'specifiedAggregates':['revenue','expenses']});
		viewstate.children()[0].popIn();

		document.getElementById('tourCaption').innerHTML = "We can compare revenue and expenses, across years...";

		document.getElementById('periodSelector').disabled="";
	},

	function () {
		viewstate.children()[0].render({'name':'defaultSectorRenderer'});

		document.getElementById('tourCaption').innerHTML = "We can also add assets and liabilities, again across years.";

		document.getElementById('periodSelector').disabled="";
	},

	function () {
		viewstate.children()[0].period('2011-12');
		viewstate.children()[0].render({'name':'defaultSectorRenderer'});

		document.getElementById('tourCaption').innerHTML = "Let's compare the Commonwealth to the state of Western Australia for the 2011-12 FY.<br/>\
Press -&gt;.";

		document.getElementById('periodSelector').disabled="disabled";
		document.getElementById('periodSelector').selectedIndex=1;

		if (viewstate.children()[1]) {
			viewstate.children()[1].remove();
			viewstate.children().pop();
		}
	},

	function () {
		viewstate.children()[0].render({'name':'defaultSectorRenderer'});
		
		if (!viewstate.children()[1]) {
			vo = new ViewObj( wa_fbo, viewstate, [0.75*tril, 0.75*tril] );
			vo.period('2011-12');
			vo.render({'name':'defaultSectorRenderer'});
		}

		document.getElementById('tourCaption').innerHTML = "Try zooming out and moving around...";

	},

	function () {
		
		document.getElementById('tourCaption').innerHTML = "Now, let's add BHP Billiton... (and, for the sake of simplicity, let's assume that 1AU=1US)";

		if (viewstate.children()[2]) {
			viewstate.children()[2].remove();
			viewstate.children().pop();
		}
	},

	function () {
		
		document.getElementById('tourCaption').innerHTML = "BHP is roughly the same size, financially, as the state of WA.<br />\
All these entities can be added in a simple text format; and a web interface is coming soon. <br/>They're extensible to be able to support \
arbitary metadata in the future.";

		if (!viewstate.children()[2]) {
			vo = new ViewObj( bhp, viewstate, [0*tril, 1.5*tril] );
			vo.period('2011-12');
			vo.render({'name':'defaultSectorRenderer'});
		}
	},

	function () {
		
		document.getElementById('tourCaption').innerHTML = "Putting this all in proportion, let's add the US... get ready to zoom out!";

		if (viewstate.children()[3]) {
			viewstate.children()[3].remove();
			viewstate.children().pop();
		}
	},

	function () {
		
		document.getElementById('tourCaption').innerHTML = "The US - massively in debt. (If you can't find it, it's on the left.)";

		if (!viewstate.children()[3]) {
			vo = new ViewObj( usa, viewstate, [-30*tril, 0*tril] );
			vo.period('2010-11');
			vo.render({'name':'defaultSectorRenderer'});
		}
	},

	function () {
		
		document.getElementById('tourCaption').innerHTML = "This completes the tour!";

	},

]

tour.next = function () {
	this.step++;
	this.steps[this.step]();
	tour.setButtonStates();
}

tour.prev = function () {
	this.step--;
	this.steps[this.step]();
	tour.setButtonStates();
}

tour.setButtonStates = function () {
	if (this.step==0) {
		document.getElementById('prevBtn').disabled = "disabled";
	} else {
		document.getElementById('prevBtn').disabled = "";
	}

	if (this.step == this.steps.length-1) {
		document.getElementById('nextBtn').disabled = "disabled";
	} else {
		document.getElementById('nextBtn').disabled = "";
	}
}