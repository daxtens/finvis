mil  = 1000000;
bil  = 1000*mil;
tril = 1000*bil;

var cssStyles=['revenue','expenses','assets','liabilities'];

var entities = [ cth_fbo, wa_fbo, bhp ];

var cth_fbo = {
	'name': 'Commonwealth Final Budget Outcome',

	'aggregates': [
		{
			'name': 'Revenue',
			'periods': {
				'2011-12': {
					'value': 338.1*bil,
					'items': [
						{
							'name': 'Income Tax',
							'value': 231.238*bil
						},
						{
							'name': 'Indirect Tax',
							'value': 85.511*bil
						},
						{
							'name': 'Non-taxation revenue',
							'value': 21.330*bil
						}
					]
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
					'value': 377.7*bil,
					'items': [
						{
							'name': 'General public services',
							'value': 23.153*bil
						},
						{
							'name': 'Defence',
							'value': 21.692*bil
						},
						{
							'name': 'Public order and safety',
							'value': 3.999*bil
						},
						{
							'name': 'Education',
							'value': 29.050*bil
						},
						{
							'name': 'Health',
							'value': 62.012*bil
						},
						{
							'name': 'Social security and welfare',
							'value': 126.747*bil
						},
						{
							'name': 'Housing',
							'value': 6.180*bil
						},
						{
							'name': 'Recreation and culture',
							'value': 6.464*bil
						},
						{
							'name': 'Fuel and energy',
							'value': 6.464*bil
						},
						{
							'name': 'Agriculture, forestry and fishing',
							'value': 2.953*bil
						},
						{
							'name': 'Mining, manufacturing and construction',
							'value': 2.245*bil
						},
						{
							'name': 'Transport and communication',
							'value': 9.129*bil
						},
						{
							'name': 'Other economic affairs',
							'value': 10.054*bil
						},
						{
							'name': 'Other purposes',
							'value': 70.253*bil
						}
					]
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

var bhp = {
	'name': 'BHP Billiton',

	'aggregates': [
		{
			'name': 'Revenue',
			'periods': {
				'2011-12': {
					'value': 72226*mil
				}
			},
			'metadata': {
				'cssClass': 'revenue'
			}
		},
		{
			'name': 'Expenses',
			'periods': {
				'2011-12': {
					'value': 57600*mil
				}
			},
			'metadata': {
				'cssClass': 'expenses'
			}
		},
		{
			'name': 'Assets',
			'periods': {
				'2011-12': {
					'value': 129273*mil
				}
			},
			'metadata': {
				'cssClass': 'assets'
			}
		},
		{
			'name': 'Liabilities',
			'periods': {
				'2011-12': {
					'value': 62188*mil
				}
			},
			'metadata': {
				'cssClass': 'liabilities'
			}
		}
	]
}

var usa = {
	'name': 'United States Government Statements of Operations and Changes in Net Position',

	'aggregates': [
		{
			'name': 'Receipts',
			'periods': {
				'2010-11': {
					'value': 2363.8*bil
				}
			},
			'metadata': {
				'cssClass': 'revenue'
			}
		},
		{
			'name': 'Outlays',
			'periods': {
				'2010-11': {
					'value': 3660.8*bil
				}
			},
			'metadata': {
				'cssClass': 'expenses'
			}
		},
		{
			'name': 'Assets',
			'periods': {
				'2010-11': {
					'value': 2707.3*bil
				}
			},
			'metadata': {
				'cssClass': 'assets'
			}
		},
		{
			'name': 'Liabilities',
			'periods': {
				'2010-11': {
					'value': 17492.7*bil
				}
			},
			'metadata': {
				'cssClass': 'liabilities'
			}
		}
	]
}