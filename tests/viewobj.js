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

test('viewObj basic render tests', function() {
  // reset. TODO port to use a fixture.
  reset();

  var vo = new ViewObj(packingEffTestData, viewstate, [0, 0]);
  vo.period('2011-12');
  vo.render();



  // hasClass is misbehaving for some reason?
  ok(jQuery('path.wedge').attr("class").indexOf("poppedOut") == -1,
     "Un-popped out has no poppedOut class.");

  vo.popOut(0);
  vo.reposition();
  vo.render();
  ok(jQuery('path.wedge').attr("class").indexOf("poppedOut") != -1,
     "Popping out adds poppedOut class.");
  
  vo.popIn();
  vo.reposition();
  vo.render();
  ok(jQuery('path.wedge').attr("class").indexOf("poppedOut") == -1,
     "Popping in removes poppedOut class.");

  vo.remove();

  for (x in cssStyles) {
    data = jQuery.extend({}, packingEffTestData);
    data.aggregates[0].category=cssStyles[x];
    vo = new ViewObj(data, viewstate, [0, 0]);
    vo.period('2011-12');
    vo.render();
    //console.log(jQuery('path.wedge').attr("class"))
    ok(jQuery('path.wedge').attr("class").indexOf(cssStyles[x]) != -1, 
       "Category " + cssStyles[x] + " ends up as a class.");
    vo.remove();
  }

  vo = new ViewObj(abudhabi, viewstate, [0, 0]);
  vo.period('2011-12');
  vo.render();
  ok(jQuery('circle').attr('class').indexOf('assets') != -1,
     "Categories for single bubbles work.");
  vo.remove();
});

test('viewObj packingEfficiency tests', function() {

  // reset. TODO port to use a fixture.
  reset();

  var vo = new ViewObj(packingEffTestData, viewstate, [0, 0]);
  vo.period('2011-12');
  vo.render();

  viewstate.calculateSize(20);

  ok(packingEfficiency(vo) == 1, 'Unexpanded DSR has efficiency 1');
  
  vo.popOut(0);
  vo.reposition();
  vo.render();
  ok(packingEfficiency(vo) == 1, 'Expanded DSR has efficiency 1');

  vo.children()[0].popOut(0);
  vo.reposition();
  vo.render();
  assertNearlyEqual(packingEfficiency(vo.children()[0]), 0.5, 0.00001,
                    'Packing efficiency of two identical items is 0.5');
  vo.popIn();
  

  window.packing = 'default';
  vo.popOut(0);
  vo.children()[1].popOut();
  vo.reposition();
  vo.render();
  assertNearlyEqual(packingEfficiency(vo.children()[1]), 
                    4 / ((Math.sqrt(2) + 2) * (Math.sqrt(2) + 2)), 0.00001,
                    'Packing efficiency of 2=1+1 in old packing model is ' +
                    '4 / (sqrt(2) + 2)^2');
  vo.popIn();
  

  window.packing = 'dendritic';
  vo.popOut(0);
  vo.children()[1].popOut();
  vo.reposition();
  vo.render();
  assertNearlyEqual(packingEfficiency(vo.children()[1]), 0.5, 0.00001,
                    'Packing efficiency of 2=1+1 in symmetric packing model' +
                    'is 0.5. TODO: Properly verify...')

  vo.remove();

});