mil  = 1000000;
bil  = 1000*mil;
tril = 1000*bil;

var cssStyles=['revenue','expenses','assets','liabilities'];

var entities = [ cth_fbo ];

var cth_fbo = {
	'name': 'Commonwealth Final Budget Outcome',

	'aggregates': [
		{
			'name': 'Revenue',
			'periods': {
				'2011-12': {
				  'value': 338.1*bil
				},
				'2010-11': {
				  'value': 309.9*bil
				}
			},
			'metadata': {
				'cssClass': 'revenue',
			}
		},
		{ 
			'name': 'Expenses',
			'periods': {
				'2011-12': {
				  'value': 377.7*bil
				},
				'2010-11': {
				  'value': 356.1*bil
				}
			},
			'metadata': {
				'cssClass': 'expenses',
			}
		},
		{
			'name': 'Assets',
			'periods': {
				'2011-12': {
				  'value': 332.4*bil
				},
				'2010-11': {
				  'value': 320.4*bil
				}
			},
			'metadata': {
				'cssClass': 'assets',
			}
		},
		{
			'name': 'Liabilities',
			'periods': {
				'2011-12': {
				  'value': 579.6*bil
				},
				'2010-11': {
				  'value': 415.8*bil
				}
			},
			'metadata': {
				'cssClass': 'liabilities',
			}
		}
	],

	'relations':{}
};

var wa_fbo = {
	'name': 'WA Final Budget Outcome',

	'aggregates': [
		{
			'name': 'Revenue',
			'periods': {
				'2011-12': {
				  'value': 25.233*bil
				},
				'2010-11': {
				  'value': 23.764*bil
				}
			},
			'metadata': {
				'cssClass': 'revenue',
			}
		},
		{ 
			'name': 'Expenses',
			'periods': {
				'2011-12': {
				  'value': 24.791*bil
				},
				'2010-11': {
				  'value': 22.98*bil
				}
			},
			'metadata': {
				'cssClass': 'expenses',
			}
		},
		{
			'name': 'Assets',
			'periods': {
				'2011-12': {
				  'value': 135*bil
				},
				'2010-11': {
				  'value': 129.116*bil
				}
			},
			'metadata': {
				'cssClass': 'assets',
			}
		},
		{
			'name': 'Liabilities',
			'periods': {
				'2011-12': {
				  'value': 21.039*bil
				},
				'2010-11': {
				  'value': 17.851*bil
				}
			},
			'metadata': {
				'cssClass': 'liabilities',
			}
		}
	],

	'relations':{}
};