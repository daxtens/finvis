var epsilon = 0.1;

// #20
var data = {
  'name': 'Test Data for dollar position invariance',
  'aggregates': [
    {
      'name': 'Revenue',
      'periods': {
        '2011-12': {
          'value': 1
        },
      },
      'items': [
        {
          'name': 'A',
          'periods': {
            '2011-12': {
              'value': 1
            },
          }
        }
      ],
      'category': 'revenue'
    }
  ]
};

test('viewstate zoom basics', function() {

  // reset. TODO port to use a fixture.
  reset();
  viewstate.calculateSize(20);

  var vo = new ViewObj(data, viewstate, [0, 0]);
  vo.period('2011-12');
  vo.render();

  var size = vo.svg[0][0].getBBox();

  viewstate.zoom(2, [viewstate.width / 2, viewstate.height / 2], true);
  var newsize = vo.svg[0][0].getBBox();
  
  // this is worryingly inexact
  assertNearlyEqual(newsize.height, Math.sqrt(2) * size.height, epsilon,
                    'Upscaled height OK?');
  // due to caption being bigger than entity, cannot test width sensibly.

  viewstate.zoom(1 / 4, [viewstate.width / 2, viewstate.height / 2], true);
  newsize = vo.svg[0][0].getBBox();
  assertNearlyEqual(Math.sqrt(2) * newsize.height, size.height, epsilon,
                    'Downscaled height OK?');
  vo.remove();
});

test('viewstate: dollar positions remain invariant upon scaling', function() {
  viewstate.calculateSize(8);

  var vo1 = new ViewObj(data, viewstate, [0, -1]);
  vo1.period('2011-12');
  vo1.render();

  var vo2 = new ViewObj(data, viewstate, [0, 1]);
  vo2.period('2011-12');
  vo2.render();
  
  function isTouching() {
    var re = "translate\\\(([-0-9.]+),[ ]?([-0-9.]+)"
    var vo1height = vo1._svg[0][0].getBBox()['height'];
    var vo1y = vo1._svg.attr('transform').match(re)[2]*1;
    var vo2y = vo2._svg.attr('transform').match(re)[2]*1;
    
    return (Math.abs((vo1y + vo1height) - vo2y) < epsilon);
  }

  ok(isTouching(), 'Do entities start off tangential?');

  viewstate.zoom(2, [viewstate.width / 2, viewstate.height / 2], true);
  ok(isTouching(), 'Do entities remain tangential after zooming in?');

  viewstate.zoom(1/4, [viewstate.width / 2, viewstate.height / 2], true);
  ok(isTouching(), 'Do entities remain tangential after zooming out?');

  vo2.remove();

  viewstate.calculateSize(tril);

  vo1.remove();
});

test('viewstate.centreViewOn()', function () {
  viewstate.calculateSize(tril);
  viewstate.zoom(1, [viewstate.width / 2, viewstate.height / 2], true);

  var vo = new ViewObj(abudhabi, viewstate, [0, 0]);
  vo.period('2011-12');
  vo.reposition();
  vo.render();

  viewstate.centreViewOn(vo);

  var bbox = vo._svg[0][0].getBBox()
  console.log(bbox, viewstate.width, viewstate.height);
  ok(bbox['width'] == viewstate.width ||
     bbox['height'] == viewstate.height,
     'Zoom large object up to full size.');

  vo.remove();

  viewstate.centreView();

  vo = new ViewObj(packingEffTestData, viewstate, [0, 0]);
  vo.period('2011-12');
  vo.reposition();
  vo.render();

  viewstate.centreViewOn(vo);

  bbox = vo._svg[0][0].getBBox()
  console.log(bbox, viewstate.width, viewstate.height);
  ok(bbox['width'] == viewstate.width ||
     bbox['height'] == viewstate.height,
     'Zoom tiny object up to full size.');

  vo.remove();
  viewstate.centreView();
});