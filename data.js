var mil  = 1000000;
var bil  = 1000*mil;
var tril = 1000*bil;

var cssStyles=['revenue','expenses','assets','liabilities'];

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
							'value': 231.238*bil,
                            'items': [
                                {
                                    'name': 'Individuals\' and other withholding taxation',
                                    'value': 151.433*bil
                                },
                                {
                                    'name': 'Fringe benefits tax',
                                    'value': 3.964*bil
                                },
                                {
                                    'name': 'Company tax',
                                    'value': 66.726*bil
                                },
                                {
                                    'name': 'Superannuation funds',
                                    'value': 7.852*bil
                                },
                                {
                                    'name': 'Petroleum resource rent tax',
                                    'value': 1.293*bil
                                }
                            ]
						},
						{
							'name': 'Indirect Tax',
							'value': 85.511*bil,
                            'items': [
                                {
                                    'name': 'Sales taxes',
                                    'value': 50.004*bil
                                },
                                {
                                    'name': 'Excise duty',
                                    'value': 25.480*bil
                                },
                                {
                                    'name': 'Customs duty',
                                    'value': 7.105*bil
                                },
                                {
                                    'name': 'Other',
                                    'value': 29.222*bil
                                }
                            ]
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
							'value': 21.692*bil,
							'href': 'http://defence.gov.au/',
							'target': '_blank'
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
							'value': 70.253*bil,
							'href': 'javascript:alert("This item reflects mostly intergovernmental transfers.")',
							'target': '_self',
                            'items': [
                                { 'name': 'Public debt interest',
                                  'value': 11.421*bil
                                },
                                { 'name': 'Nominal superannuation interest',
                                  'value': 7.376*bil
                                },
                                { 'name': 'General purpose inter-governmental transactions',
                                  'value': 49.940*bil
                                },
                                { 'name': 'Natural disaster relief',
                                  'value': 1.516*bil
                                }
                            ]
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

	'relations': {
		'revenueVexpenses': {
		  'greater': 'Budget Surplus',
		  'equal': 'Balanced Budget',
		  'less': 'Budget Deficit'
		},
		'assetsVliabilities': {
			'greater': 'Net Position',
			'equal': 'No net debt',
			'less': 'Net Debt'
		}
	}
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

	'relations': {
		'revenueVexpenses': {
		  'greater': 'Budget Surplus',
		  'equal': 'Balanced Budget',
		  'less': 'Budget Deficit'
		},
		'assetsVliabilities': {
			'greater': 'Net Position',
			'equal': 'No net debt',
			'less': 'Net Debt'
		}
	}
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
	],

	'relations': {
		'revenueVexpenses': {
		  'greater': 'Net Profit after Tax',
		  'equal': 'No Profit or Loss',
		  'less': 'Net Loss after Tax'
		}
	}
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
	],
	'relations': {
		'revenueVexpenses': {
		  'greater': 'Budget Surplus',
		  'equal': 'Balanced Budget',
		  'less': 'Budget Deficit'
		},
		'assetsVliabilities': {
			'greater': 'Net Position',
			'equal': 'No net debt',
			'less': 'Net Debt'
		}
	}
}

var entities = [ cth_fbo, wa_fbo, bhp, usa ];

