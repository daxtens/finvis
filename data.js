var mil = 1000000;
var bil = 1000 * mil;
var tril = 1000 * bil;

var cssStyles = ['revenue', 'expenses', 'assets', 'liabilities'];

var cth_fbo = {
    'name': 'Commonwealth Final Budget Outcome',
    'aggregates': [
        {
            'name': 'Revenue',
            'periods': {
                '2011-12': {
                    'value': 338100000000
                },
                '2010-11': {
                    'value': 309900000000
                }
            },
            'category': 'revenue',
            'items': [
                {
                    'name': 'Income Tax',
                    'items': [
                        {
                            'name': "Individuals' and other withholding taxation",
                            'periods': {
                                '2011-12': {
                                    'value': 151433000000
                                }
                            }
                        },
                        {
                            'name': 'Fringe benefits tax',
                            'periods': {
                                '2011-12': {
                                    'value': 3964000000
                                }
                            }
                        },
                        {
                            'name': 'Company tax',
                            'periods': {
                                '2011-12': {
                                    'value': 66726000000
                                }
                            }
                        },
                        {
                            'name': 'Superannuation funds',
                            'periods': {
                                '2011-12': {
                                    'value': 7852000000
                                }
                            }
                        },
                        {
                            'name': 'Petroleum resource rent tax',
                            'periods': {
                                '2011-12': {
                                    'value': 1293000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 231238000000
                        }
                    }
                },
                {
                    'name': 'Indirect Tax',
                    'items': [
                        {
                            'name': 'Sales taxes',
                            'periods': {
                                '2011-12': {
                                    'value': 50004000000
                                }
                            }
                        },
                        {
                            'name': 'Excise duty',
                            'periods': {
                                '2011-12': {
                                    'value': 25480000000
                                }
                            }
                        },
                        {
                            'name': 'Customs duty',
                            'periods': {
                                '2011-12': {
                                    'value': 7105000000
                                }
                            }
                        },
                        {
                            'name': 'Other',
                            'periods': {
                                '2011-12': {
                                    'value': 29222000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 85511000000
                        }
                    }
                },
                {
                    'name': 'Non-taxation revenue',
                    'periods': {
                        '2011-12': {
                            'value': 21330000000
                        }
                    }
                }
            ]
        },
        {
            'name': 'Expenses',
            'periods': {
                '2011-12': {
                    'value': 377700000000
                },
                '2010-11': {
                    'value': 356100000000
                }
            },
            'category': 'expenses',
            'items': [
                {
                    'name': 'General public services',
                    'periods': {
                        '2011-12': {
                            'value': 23153000000
                        }
                    }
                },
                {
                    'name': 'Defence',
                    'metadata': {'link': 'http://defence.gov.au/'},
                    'periods': {
                        '2011-12': {
                            'value': 21692000000
                        }
                    }
                },
                {
                    'name': 'Public order and safety',
                    'periods': {
                        '2011-12': {
                            'value': 3999000000
                        }
                    }
                },
                {
                    'name': 'Education',
                    'periods': {
                        '2011-12': {
                            'value': 29050000000
                        }
                    }
                },
                {
                    'name': 'Health',
                    'periods': {
                        '2011-12': {
                            'value': 62012000000
                        }
                    }
                },
                {
                    'name': 'Social security and welfare',
                    'periods': {
                        '2011-12': {
                            'value': 126747000000
                        }
                    }
                },
                {
                    'name': 'Housing',
                    'periods': {
                        '2011-12': {
                            'value': 6180000000
                        }
                    }
                },
                {
                    'name': 'Recreation and culture',
                    'periods': {
                        '2011-12': {
                            'value': 3809000000
                        }
                    }
                },
                {
                    'name': 'Fuel and energy',
                    'periods': {
                        '2011-12': {
                            'value': 6464000000
                        }
                    }
                },
                {
                    'name': 'Agriculture, forestry and fishing',
                    'periods': {
                        '2011-12': {
                            'value': 2953000000
                        }
                    }
                },
                {
                    'name': 'Mining, manufacturing and construction',
                    'periods': {
                        '2011-12': {
                            'value': 2245000000
                        }
                    }
                },
                {
                    'name': 'Transport and communication',
                    'periods': {
                        '2011-12': {
                            'value': 9129000000
                        }
                    }
                },
                {
                    'name': 'Other economic affairs',
                    'periods': {
                        '2011-12': {
                            'value': 10054000000
                        }
                    }
                },
                {
                    'name': 'Other purposes',
                    'metadata': {
                        'link': 'javascript:alert(\"This item reflects mostly intergovernmental transfers.\")',
                        'target': '_self'
                    },
                    'target': '_self',
                    'items': [
                        {
                            'name': 'Public debt interest',
                            'periods': {
                                '2011-12': {
                                    'value': 11421000000
                                }
                            }
                        },
                        {
                            'name': 'Nominal superannuation interest',
                            'periods': {
                                '2011-12': {
                                    'value': 7376000000
                                }
                            }
                        },
                        {
                            'name': 'General purpose inter-governmental transactions',
                            'periods': {
                                '2011-12': {
                                    'value': 49940000000
                                }
                            }
                        },
                        {
                            'name': 'Natural disaster relief',
                            'periods': {
                                '2011-12': {
                                    'value': 1516000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 70253000000
                        }
                    }
                }
            ]
        },
        {
            'name': 'Assets',
            'periods': {
                '2011-12': {
                    'value': 332400000000
                },
                '2010-11': {
                    'value': 320400000000
                }
            },
            'category': 'assets'
        },
        {
            'name': 'Liabilities',
            'periods': {
                '2011-12': {
                    'value': 579600000000
                },
                '2010-11': {
                    'value': 415800000000
                }
            },
            'category': 'liabilities'
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
                    'value': 25.233 * bil
                },
                '2010-11': {
                    'value': 23.764 * bil
                }
            },
            'category': 'revenue'
        },
        {
            'name': 'Expenses',
            'periods': {
                '2011-12': {
                    'value': 24.791 * bil
                },
                '2010-11': {
                    'value': 22.98 * bil
                }
            },
            'category': 'expenses'
        },
        {
            'name': 'Assets',
            'periods': {
                '2011-12': {
                    'value': 135 * bil
                },
                '2010-11': {
                    'value': 129.116 * bil
                }
            },
            'category': 'assets'
        },
        {
            'name': 'Liabilities',
            'periods': {
                '2011-12': {
                    'value': 21.039 * bil
                },
                '2010-11': {
                    'value': 17.851 * bil
                }
            },
            'category': 'liabilities'
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
                    'value': 72226 * mil
                }
            },
            'category': 'revenue'
        },
        {
            'name': 'Expenses',
            'periods': {
                '2011-12': {
                    'value': 57600 * mil
                }
            },
            'category': 'expenses'
        },
        {
            'name': 'Assets',
            'periods': {
                '2011-12': {
                    'value': 129273 * mil
                }
            },
            'category': 'assets'
        },
        {
            'name': 'Liabilities',
            'periods': {
                '2011-12': {
                    'value': 62188 * mil
                }
            },
            'category': 'liabilities'
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

var abudhabi = {
    'name': 'Abu Dhabi Investment Auth.',
    'username': 'System',
    'public': true,
    'units': 1000000000,
    'category': 'assets',
    'item': {
        'name': 'Abu Dhabi Investment Auth.',
        // TODO FIXME: check date
        'periods': {
            '2011-12': {
                'value': 627 * bil
            }
        }
    }
};

var futurefund = {
    'name': 'Future Fund',
    'username': 'System',
    'public': true,
    'units': 1000000000,
    'item': {
        'name': 'Future Fund',
        // TODO FIXME: check date
        'periods': {
            '2011-12': {
                'value': 73 * bil
            }
        }
    },
    'category': 'assets'
};

var submarines = {
    'name': 'Submarines',
    'username': 'System',
    'public': true,
    'units': 1000000000,
    // TODO FIXME: check date
    'item': {
        'name': 'Submarines',
        'periods': {
            '2011-12': {
                'value': 40 * bil
            }
        }
    },
    'category': 'expenses'
};

var australiansuper = {
    'name': 'Aus Super Funds',
    'item': {
        'name': 'Aus Super Funds',
        // TODO FIXME: check date
        'periods': {
            '2011-12': {
                'value': 1277 * bil
            }
        }
    },
    'category': 'revenue',
    'username': 'System',
    'public': true,
    'units': 1000000000
};



var usa = {
    'name': 'United States Government Statements of Operations and Changes in Net Position',
    //lie about the period... FIXME
    'aggregates': [
        {
            'name': 'Receipts',
            'periods': {
                '2011-12': {
                    'value': 2363.8 * bil
                }
            },
            'category': 'revenue'
        },
        {
            'name': 'Outlays',
            'periods': {
                '2011-12': {
                    'value': 3660.8 * bil
                }
            },
            'category': 'expenses'
        },
        {
            'name': 'Assets',
            'periods': {
                '2011-12': {
                    'value': 2707.3 * bil
                }
            },
            'category': 'assets'
        },
        {
            'name': 'Liabilities',
            'periods': {
                '2011-12': {
                    'value': 17492.7 * bil
                }
            },
            'category': 'liabilities'
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

// TODO FIXME: proper periods
var greens_budget = {
    'name': 'Greens Budget Initatives',
    'aggregates': [
        {
            'name': 'Revenue',
            'periods': {
                '2011-12': {
                    'value': 25487000000
                }
            },
            'category': 'revenue',
            'items': [
                {
                    'name': 'Revised MRRT',
                    'metadata': {
                        'link': 'http://greensmps.org.au/content/news-stories/economy-serves-people-and-nature-not-other-way-around'
                    },
                    'periods': {
                        '2011-12': {
                            'value': 6000000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 1',
                    'periods': {
                        '2011-12': {
                            'value': 235000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 2',
                    'periods': {
                        '2011-12': {
                            'value': 2600000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 3',
                    'periods': {
                        '2011-12': {
                            'value': 2500000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 4',
                    'periods': {
                        '2011-12': {
                            'value': 600000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 5',
                    'periods': {
                        '2011-12': {
                            'value': 200000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 6',
                    'periods': {
                        '2011-12': {
                            'value': 2500000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 7',
                    'periods': {
                        '2011-12': {
                            'value': 900000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 8',
                    'periods': {
                        '2011-12': {
                            'value': 1250000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 9',
                    'periods': {
                        '2011-12': {
                            'value': 150000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 10',
                    'periods': {
                        '2011-12': {
                            'value': 1170000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 11',
                    'periods': {
                        '2011-12': {
                            'value': 1000000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 12',
                    'periods': {
                        '2011-12': {
                            'value': 172000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 13',
                    'periods': {
                        '2011-12': {
                            'value': 260000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 14',
                    'periods': {
                        '2011-12': {
                            'value': 100000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 15',
                    'periods': {
                        '2011-12': {
                            'value': 4500000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 16',
                    'periods': {
                        '2011-12': {
                            'value': 1200000000
                        }
                    }
                },
                {
                    'name': 'Tax measure 17',
                    'periods': {
                        '2011-12': {
                            'value': 150000000
                        }
                    }
                }
            ]
        },
        {
            'name': 'Expenses',
            'periods': {
                '2011-12': {
                    'value': 23943300000
                }
            },
            'category': 'expenses',
            'items': [
                {
                    'name': 'Environment',
                    'items': [
                        {
                            'name': 'Environment expenditure 1',
                            'periods': {
                                '2011-12': {
                                    'value': 95000000
                                }
                            }
                        },
                        {
                            'name': 'Environment expenditure 2',
                            'periods': {
                                '2011-12': {
                                    'value': 30000000
                                }
                            }
                        },
                        {
                            'name': 'Environment expenditure 3',
                            'periods': {
                                '2011-12': {
                                    'value': 71000000
                                }
                            }
                        },
                        {
                            'name': 'Environment expenditure 4',
                            'periods': {
                                '2011-12': {
                                    'value': 58000000
                                }
                            }
                        },
                        {
                            'name': 'Environment expenditure 5',
                            'periods': {
                                '2011-12': {
                                    'value': 10000000
                                }
                            }
                        },
                        {
                            'name': 'Environment expenditure 6',
                            'periods': {
                                '2011-12': {
                                    'value': 50000000
                                }
                            }
                        },
                        {
                            'name': 'Environment expenditure 7',
                            'periods': {
                                '2011-12': {
                                    'value': 26000000
                                }
                            }
                        },
                        {
                            'name': 'Environment expenditure 8',
                            'periods': {
                                '2011-12': {
                                    'value': 40000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 380000000
                        }
                    }
                },
                {
                    'name': 'Climate change and energy',
                    'items': [
                        {
                            'name': 'Climate expenditure 1',
                            'periods': {
                                '2011-12': {
                                    'value': 0
                                }
                            }
                        },
                        {
                            'name': 'Climate expenditure 2',
                            'periods': {
                                '2011-12': {
                                    'value': 0
                                }
                            }
                        },
                        {
                            'name': 'Climate expenditure 3',
                            'periods': {
                                '2011-12': {
                                    'value': -1700000
                                }
                            }
                        },
                        {
                            'name': 'Climate expenditure 4',
                            'periods': {
                                '2011-12': {
                                    'value': -1000000
                                }
                            }
                        },
                        {
                            'name': 'Climate 1',
                            'periods': {
                                '2011-12': {
                                    'value': 20000000
                                }
                            }
                        },
                        {
                            'name': 'Climate 2',
                            'periods': {
                                '2011-12': {
                                    'value': 60000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 77300000
                        }
                    }
                },
                {
                    'name': 'Education science and industry',
                    'items': [
                        {
                            'name': 'Education expenditure 1',
                            'periods': {
                                '2011-12': {
                                    'value': 700000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 2',
                            'periods': {
                                '2011-12': {
                                    'value': 300000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 3',
                            'periods': {
                                '2011-12': {
                                    'value': 190000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 4',
                            'periods': {
                                '2011-12': {
                                    'value': 350000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 5',
                            'periods': {
                                '2011-12': {
                                    'value': 35000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 6',
                            'periods': {
                                '2011-12': {
                                    'value': 20000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 7',
                            'periods': {
                                '2011-12': {
                                    'value': 300000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 8',
                            'periods': {
                                '2011-12': {
                                    'value': 38000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 9',
                            'periods': {
                                '2011-12': {
                                    'value': 33000000
                                }
                            }
                        },
                        {
                            'name': 'Education expenditure 10',
                            'periods': {
                                '2011-12': {
                                    'value': 169000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 2135000000
                        }
                    }
                },
                {
                    'name': 'Care for people',
                    'items': [
                        {
                            'name': 'Denticare',
                            'periods': {
                                '2011-12': {
                                    'value': 656000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 1',
                            'periods': {
                                '2011-12': {
                                    'value': 1200000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 2',
                            'periods': {
                                '2011-12': {
                                    'value': 1458000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 3',
                            'periods': {
                                '2011-12': {
                                    'value': 400000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 4',
                            'periods': {
                                '2011-12': {
                                    'value': 180000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 5',
                            'periods': {
                                '2011-12': {
                                    'value': 160000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 6',
                            'periods': {
                                '2011-12': {
                                    'value': 330000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 7',
                            'periods': {
                                '2011-12': {
                                    'value': 20000000
                                }
                            }
                        },
                        {
                            'name': 'People expenditure 8',
                            'periods': {
                                '2011-12': {
                                    'value': 84000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 4488000000
                        }
                    }
                },
                {
                    'name': 'Housing and sustainable cities',
                    'items': [
                        {
                            'name': 'Housing expenditure 1',
                            'periods': {
                                '2011-12': {
                                    'value': 5400000000
                                }
                            }
                        },
                        {
                            'name': 'Housing expenditure 2',
                            'periods': {
                                '2011-12': {
                                    'value': 1300000000
                                }
                            }
                        },
                        {
                            'name': 'Housing expenditure 3',
                            'periods': {
                                '2011-12': {
                                    'value': 500000000
                                }
                            }
                        },
                        {
                            'name': 'Housing expenditure 4',
                            'periods': {
                                '2011-12': {
                                    'value': 300000000
                                }
                            }
                        },
                        {
                            'name': 'Housing expenditure 5',
                            'periods': {
                                '2011-12': {
                                    'value': 1000000000
                                }
                            }
                        },
                        {
                            'name': 'Housing expenditure 6',
                            'periods': {
                                '2011-12': {
                                    'value': 210000000
                                }
                            }
                        },
                        {
                            'name': 'Housing expenditure 7',
                            'periods': {
                                '2011-12': {
                                    'value': 250000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 8960000000
                        }
                    }
                },
                {
                    'name': 'Transport',
                    'items': [
                        {
                            'name': 'Bike paths national',
                            'periods': {
                                '2011-12': {
                                    'value': 80000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 1',
                            'periods': {
                                '2011-12': {
                                    'value': 275000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 2',
                            'periods': {
                                '2011-12': {
                                    'value': 250000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 3',
                            'periods': {
                                '2011-12': {
                                    'value': 30000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 4',
                            'periods': {
                                '2011-12': {
                                    'value': 300000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 5',
                            'periods': {
                                '2011-12': {
                                    'value': 12000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 6',
                            'periods': {
                                '2011-12': {
                                    'value': 100000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 7',
                            'periods': {
                                '2011-12': {
                                    'value': 144000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 8',
                            'periods': {
                                '2011-12': {
                                    'value': 444000000
                                }
                            }
                        },
                        {
                            'name': 'Transport expenditure 9',
                            'periods': {
                                '2011-12': {
                                    'value': 531000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 2166000000
                        }
                    }
                },
                {
                    'name': 'Other',
                    'items': [
                        {
                            'name': 'Foreign aid',
                            'periods': {
                                '2011-12': {
                                    'value': 2000000000
                                }
                            }
                        },
                        {
                            'name': 'Other 1',
                            'periods': {
                                '2011-12': {
                                    'value': 1000000000
                                }
                            }
                        },
                        {
                            'name': 'Other 2',
                            'periods': {
                                '2011-12': {
                                    'value': 7000000
                                }
                            }
                        },
                        {
                            'name': 'Other 3',
                            'periods': {
                                '2011-12': {
                                    'value': 90000000
                                }
                            }
                        },
                        {
                            'name': 'Other 4',
                            'periods': {
                                '2011-12': {
                                    'value': 0
                                }
                            }
                        },
                        {
                            'name': 'Other 5',
                            'periods': {
                                '2011-12': {
                                    'value': 0
                                }
                            }
                        },
                        {
                            'name': 'Other 6',
                            'periods': {
                                '2011-12': {
                                    'value': 20000000
                                }
                            }
                        },
                        {
                            'name': 'Other 7',
                            'periods': {
                                '2011-12': {
                                    'value': 29000000
                                }
                            }
                        },
                        {
                            'name': 'Other 8',
                            'periods': {
                                '2011-12': {
                                    'value': 5000000
                                }
                            }
                        },
                        {
                            'name': 'Other 9',
                            'periods': {
                                '2011-12': {
                                    'value': 12000000
                                }
                            }
                        },
                        {
                            'name': 'Other 10',
                            'periods': {
                                '2011-12': {
                                    'value': 124000000
                                }
                            }
                        },
                        {
                            'name': 'Other 11',
                            'periods': {
                                '2011-12': {
                                    'value': 12000000
                                }
                            }
                        },
                        {
                            'name': 'Other 12',
                            'periods': {
                                '2011-12': {
                                    'value': 5000000
                                }
                            }
                        },
                        {
                            'name': 'Other 13',
                            'periods': {
                                '2011-12': {
                                    'value': 34000000
                                }
                            }
                        },
                        {
                            'name': 'Other 14',
                            'periods': {
                                '2011-12': {
                                    'value': 2354000000
                                }
                            }
                        },
                        {
                            'name': 'Other 15',
                            'periods': {
                                '2011-12': {
                                    'value': 12000000
                                }
                            }
                        },
                        {
                            'name': 'Other 16',
                            'periods': {
                                '2011-12': {
                                    'value': 33000000
                                }
                            }
                        }
                    ],
                    'periods': {
                        '2011-12': {
                            'value': 5737000000
                        }
                    }
                }
            ]
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


var entities = [cth_fbo, wa_fbo, bhp, usa, abudhabi, futurefund, australiansuper, submarines, greens_budget];

