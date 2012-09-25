bil = 1000000000
mil = 1000000


data_aus_real = [ 
	{ 'label': 'Assets',
      'value': 320.4*bil,
	  //'value': 100,
      'internal': { 'wedgeSize': 90,
				    'cssId': 'assets' }},
    
	{ 'label': 'Revenue',
	  'value': 309.9*bil,
	  //'value': 200,
	  'internal': { 'wedgeSize': 90,
				    'cssId': 'revenue' }},


    { 'label': 'Expenses',
	  'value': 361.4*bil,
	  //'value': 300,
	  'internal': { 'wedgeSize': 90,
				    'cssId': 'expenses' }},

    { 'label': 'Liabilities',
	  //'value': 400,
	  'value': 415.8*bil,
	  'internal': { 'wedgeSize': 90,
				    'cssId': 'liabilities' }} 
];

data_aus_revenue = [
	{ 'label': 'Revenue',
	  'value': 309.9*bil,
	  //'value': 200,
	  'internal': { 'wedgeSize': 360,
				    'cssId': 'revenue' }}

];

data_aus_rev_exp = [ 
    
	{ 'label': 'Revenue',
	  'value': 309.9*bil,
	  //'value': 200,
	  'internal': { 'wedgeSize': 90,
				    'cssId': 'revenue' }},

    { 'label': 'Expenses',
	  'value': 361.4*bil,
	  //'value': 300,
	  'internal': { 'wedgeSize': 90,
				    'cssId': 'expenses' }}
];