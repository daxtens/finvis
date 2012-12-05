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
};

var usa = {
	'name': 'United States Government Statements of Operations and Changes in Net Position',
//lie about the period... FIXME
	'aggregates': [
		{
			'name': 'Receipts',
			'periods': {
				'2011-12': {
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
				'2011-12': {
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
				'2011-12': {
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
				'2011-12': {
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
};

var abudhabi = {
	'name': 'Abu Dhabi Investment Authority',
	'aggregates': [
		{
			'name': 'Assets',
			'periods': {
				'2011-12': {
					'value': 627*bil
				}
			},
			'metadata': {
				'cssClass': 'assets'
			}
		}
	],
	'relations': {}
};

var futurefund = {
	'name': 'Future Fund',
	'aggregates': [
		{
			'name': 'Assets',
			'periods': {
				'2011-12': {
					'value': 73*bil
				}
			},
			'metadata': {
				'cssClass': 'assets'
			}
		}
	],
	'relations': {}
};

var submarines = {
	'name': 'Submarines',
	'aggregates': [
		{
			'name': 'Expense',
			'periods': {
				'2011-12': {
					'value': 80*bil
				}
			},
			'metadata': {
				'cssClass': 'expenses'
			}
		}
	],
	'relations': {}
};

var australiansuper = {
	'name': 'Australian Super Funds',
	'aggregates': [
		{
			'name': 'Assets',
			'periods': {
				'2011-12': {
					'value': 1277*bil
				}
			},
			'metadata': {
				'cssClass': 'revenue'
			}
		}
	],
	'relations': {}
};



var electioninitatives = {
'name': 'United States Government Statements of Operations and Changes in Net Position',
//lie about the period... FIXME
	'aggregates': [
		{
			'name': 'Receipts',
			'periods': {
				'2011-12': {
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
				'2011-12': {
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
				'2011-12': {
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
				'2011-12': {
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
		}
	}
};

var greens_budget = {
    'name': 'Greens Budget Initatives',
    'aggregates': [
	{ 'name': 'Revenue',
	  'periods': {
	      '2011-12': {// this is a lie
		  'value':  25487*mil,//125*bil,
		  'items': [ 
		      { 'name':'Revised MRRT',
			'value': 6000*mil
		      },
		      { 'name':'Tax measure 1',
			'value': 235*mil
		      },
		      { 'name':'Tax measure 2',
			'value': 2600*mil
		      },
		      { 'name':'Tax measure 3',
			'value': 2500*mil
		      },
		      { 'name':'Tax measure 4',
			'value': 600*mil
		      },
		      { 'name':'Tax measure 5',
			'value': 200*mil
		      },
		      { 'name':'Tax measure 6',
			'value': 2500*mil
		      },
		      { 'name':'Tax measure 7',
			'value': 900*mil
		      },
		      { 'name':'Tax measure 8',
			'value': 1250*mil
		      },
		      { 'name':'Tax measure 9',
			'value': 150*mil
		      },
		      { 'name':'Tax measure 10',
			'value': 1170*mil
		      },
		      { 'name':'Tax measure 11',
			'value': 1000*mil
		      },
		      { 'name':'Tax measure 12',
			'value': 172*mil
		      },
		      { 'name':'Tax measure 13',
			'value': 260*mil
		      },
		      { 'name':'Tax measure 14',
			'value': 100*mil
		      },
		      { 'name':'Tax measure 15',
			'value': 4500*mil
		      },
		      { 'name':'Tax measure 16',
			'value': 1200*mil
		      },
		      { 'name':'Tax measure 17',
			'value': 150*mil
		      }
		  ]
	      }
	  },
	  'metadata': {
	      'cssClass': 'revenue'
	  }
	},
	{ 'name': 'Expenses',

	  'periods': {
	      '2011-12': { //lie

		  'value': 23943.3*mil,//117*bil,//23943.3
		  'items': [
		      { 'name':'Environment',
			'value': 380*mil,
			'items': [
			    { 'name':'Environment expenditure 1',
			      'value': 95*mil
			    },
			    { 'name':'Environment expenditure 2',
			      'value': 30*mil
			    },
			    { 'name':'Environment expenditure 3',
			      'value': 71*mil
			    },
			    { 'name':'Environment expenditure 4',
			      'value': 58*mil
			    },
			    { 'name':'Environment expenditure 5',
			      'value': 10*mil
			    },
			    { 'name':'Environment expenditure 6',
			      'value': 50*mil
			    },
			    { 'name':'Environment expenditure 7',
			      'value': 26*mil
			    },
			    { 'name':'Environment expenditure 8',
			      'value': 40*mil
			    }]
		      },
		      
		      {'name': 'Climate change and energy',
		       'value': 77.3*mil,
		       'items': [
			   { 'name':'Climate expenditure 1',
			     'value': 0*mil
			   },
			   { 'name':'Climate expenditure 2',
			     'value': 0*mil
			   },
			   { 'name':'Climate expenditure 3	-1',
			     'value': 7*mil
			   },
			   { 'name':'Climate expenditure 4',
			     'value': -1*mil
			   },
			   { 'name':'Climate 1',
			     'value': 	20*mil
			   },
			   { 'name':'Climate 2',
			     'value': 60*mil
			   }]
		      },
		      
		      
		      
		      {'name': 'Education science and industry',
		       'value': 2135*mil,
		       'items': [
			   { 'name':'Education expenditure 1',
			     'value': 700*mil
			   },
			   { 'name':'Education expenditure 2',
			     'value': 300*mil
			   },
			   { 'name':'Education expenditure 3',
			     'value': 190*mil
			   },
			   { 'name':'Education expenditure 4',
			     'value': 350*mil
			   },
			   { 'name':'Education expenditure 5',
			     'value': 35*mil
			   },
			   { 'name':'Education expenditure 6',
			     'value': 20*mil
			   },
			   { 'name':'Education expenditure 7',
			     'value': 300*mil
			   },
			   { 'name':'Education expenditure 8',
			     'value': 38*mil
			   },
			   { 'name':'Education expenditure 9',
			     'value': 33*mil
			   },
			   { 'name':'Education expenditure 10',
			     'value': 169*mil
			   }]
		      },
		      
		      
		      {'name': 'Care for people',
		       'value': 4488*mil,
		       'items': [
			   { 'name':'Denticare',
			     'value': 656*mil
			   },
			   { 'name':'People expenditure 1',
			     'value': 1200*mil
			   },
			   { 'name':'People expenditure 2',
			     'value': 1458*mil
			   },
			   { 'name':'People expenditure 3',
			     'value': 400*mil
			   },
			   { 'name':'People expenditure 4',
			     'value': 180*mil
			   },
			   { 'name':'People expenditure 5',
			     'value': 160*mil
			   },
			   { 'name':'People expenditure 6',
			     'value': 330*mil
			   },
			   { 'name':'People expenditure 7',
			     'value': 20*mil
			   },
			   { 'name':'People expenditure 8',
			     'value': 84*mil
			   }]
		      },
		      
		      
		      {'name': 'Housing and sustainable cities',
		       'value': 8960*mil,
		       'items': [
			   { 'name':'Housing expenditure 1',
			     'value': 5400*mil
			   },
			   { 'name':'Housing expenditure 2',
			     'value': 1300*mil
			   },
			   { 'name':'Housing expenditure 3',
			     'value': 500*mil
			   },
			   { 'name':'Housing expenditure 4',
			     'value': 300*mil
			   },
			   { 'name':'Housing expenditure 5',
			     'value': 1000*mil
			   },
			   { 'name':'Housing expenditure 6',
			     'value': 210*mil
			   },
			   { 'name':'Housing expenditure 7',
			     'value': 250*mil
			   }]
		      },
		      
		      
		      {'name': 'Transport',
		       'value': 2166*mil,
		       'items': [
			   { 'name':'Bike paths national',
			     'value': 80*mil
			   },
			   { 'name':'Transport expenditure 1',
			     'value': 275*mil
			   },
			   { 'name':'Transport expenditure 2',
			     'value': 250*mil
			   },
			   { 'name':'Transport expenditure 3',
			     'value': 30*mil
			   },
			   { 'name':'Transport expenditure 4',
			     'value': 300*mil
			   },
			   { 'name':'Transport expenditure 5',
			     'value': 12*mil
			   },
			   { 'name':'Transport expenditure 6',
			     'value': 100*mil
			   },
			   { 'name':'Transport expenditure 7',
			     'value': 144*mil
			   },
			   { 'name':'Transport expenditure 8',
			     'value': 444*mil
			   },
			   { 'name':'Transport expenditure 9',
			     'value': 531*mil
			   }]
		      },
		      
		      
		      {'name': 'Other',
		       'value': 5737*mil,
		       'items': [
			   { 'name':'Foreign aid',
			     'value': 2000*mil
			   },
			   { 'name':'Other 1',
			     'value': 1000*mil
			   },
			   { 'name':'Other 2',
			     'value': 7*mil
			   },
			   { 'name':'Other 3',
			     'value': 90*mil
			   },
			   { 'name':'Other 4',
			     'value': 0*mil
			   },
			   { 'name':'Other 5',
			     'value': 0*mil
			   },
			   { 'name':'Other 6',
			     'value': 20*mil
			   },
			   { 'name':'Other 7',
			     'value': 29*mil
			   },
			   { 'name':'Other 8',
			     'value': 5*mil
			   },
			   { 'name':'Other 9',
			     'value': 12*mil
			   },
			   { 'name':'Other 10',
			     'value': 124*mil
			   },
			   { 'name':'Other 11',
			     'value': 12*mil
			   },
			   { 'name':'Other 12',
			     'value': 5*mil
			   },
			   { 'name':'Other 13',
			     'value': 34*mil
			   },
			   { 'name':'Other 14',
			     'value': 2354*mil
			   },
			   { 'name':'Other 15',
			     'value': 12*mil
			   },
			   { 'name':'Other 16',
			     'value': 33*mil
			   }
		       ]
		      }
		  ]
	      }
	  },

	  'metadata': {
	      'cssClass': 'expenses'
	  }
	}	
    ],
    'relations': {
	'revenueVexpenses': {
	    'greater': 'Budget Surplus',
	    'equal': 'Balanced Budget',
	    'less': 'Budget Deficit'
	}
    }
}


var entities = [ cth_fbo, wa_fbo, bhp, usa, abudhabi, futurefund, submarines, greens_budget ];

