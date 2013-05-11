function reset() {
    while (viewstate.children().length) {
        viewstate.children()[0].remove();
    }
}

function assertNearlyEqual(a, b, epsilon, message) {
    ok((Math.abs(a - b) < epsilon), message);
}

var packingEffTestData = {
  'name': 'Test Data for packingEfficiency',
  'aggregates': [
    {
      'name': 'Revenue',
      'periods': {
        '2011-12': {
          'value': 5
        },
      },
      'category': 'revenue',
      'items': [
        {
          'name': 'A',
          'items': [
            {
              'name': 'Aa',
              'periods': {
                '2011-12': {
                  'value': 3
                }
              }
            }
          ],
          'periods': {
            '2011-12': {
              'value': 3
            }
          }
        },
        {
          'name': 'B',
          'items': [
            {
              'name': 'Ba',
              'periods': {
                '2011-12': {
                  'value': 1
                }
              }
            },
            {
              'name': 'Ba',
              'periods': {
                '2011-12': {
                  'value': 1
                }
              }
            }
          ],
          'periods': {
            '2011-12': {
              'value': 2
            }
          }
        },
      ]
    }
  ]
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