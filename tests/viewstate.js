var epsilon = 0.1;

test('viewstate zoom basics', function() {

    // reset. TODO port to use a fixture.
    reset();

    var vo = new ViewObj(openbudget, viewstate, [0, 0]);
    vo.period('2011-12');
    vo.render();

    var size = vo.svg[0][0].getBBox();

    viewstate.zoom(2, [viewstate.width / 2, viewstate.height / 2], true);
    var newsize = vo.svg[0][0].getBBox();
    console.log(size, newsize);
    // these are worrying inexact
    assertNearlyEqual(newsize.width, Math.sqrt(2) * size.width, epsilon,
                      'Upscaled width OK?');
    assertNearlyEqual(newsize.height, Math.sqrt(2) * size.height, epsilon,
                      'Upscaled height OK?');


    viewstate.zoom(1 / 4, [viewstate.width / 2, viewstate.height / 2], true);
    newsize = vo.svg[0][0].getBBox();
    assertNearlyEqual(Math.sqrt(2) * newsize.width, size.width, epsilon,
                      'Downscaled width OK?');
    assertNearlyEqual(Math.sqrt(2) * newsize.height, size.height, epsilon,
                      'Downscaled height OK?');

    vo.remove();
});

test('viewstate: dollar positions remain invariant upon scaling', function() {
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

    viewstate.calculateSize(8);

    var vo1 = new ViewObj(data, viewstate, [-1, 0]);
    vo1.period('2011-12');
    vo1.render();

    var vo2 = new ViewObj(data, viewstate, [1, 0]);
    vo2.period('2011-12');
    vo2.render();
    
    function isTouching() {
        var re = "translate\\\(([-0-9.]+),"
        var vo1width = vo1.svg[0][0].getBBox()['width'];
        var vo1x = vo1.svg.attr('transform').match(re)[1]*1;
        var vo2x = vo2.svg.attr('transform').match(re)[1]*1;
        console.log(vo1width, vo1x, vo2x, vo1x+vo1width);

        return (Math.abs((vo1x + vo1width) - vo2x) < epsilon);
    }

    ok(isTouching(), 'Do entities start off tangential?');

    viewstate.zoom(2, [viewstate.width / 2, viewstate.height / 2], true);
    ok(isTouching(), 'Do entities remain tangential after zooming in?');

    viewstate.zoom(1/4, [viewstate.width / 2, viewstate.height / 2], true);
    ok(isTouching(), 'Do entities remain tangential after zooming out?');

    vo2.remove();
    viewstate.calculateSize(8);

    vo1.popOut(0);
    vo1.reposition();
    vo1.render();
    vo2 = vo1.children()[0];

    function isChildTouching() {
        var parentWidth = vo1.svg[0][0].getBBox()['width'];
        var childWidth = vo2.svg[0][0].getBBox()['width'];

        return (Math.abs(parentWidth - 2 * childWidth) < epsilon);
    }


    ok(isChildTouching(), 'Does child entity start off tangential?');

    viewstate.zoom(2, [viewstate.width / 2, viewstate.height / 2], true);
    ok(isChildTouching(), 'Do child entity remain tangential after zooming in?');

    viewstate.zoom(1/4, [viewstate.width / 2, viewstate.height / 2], true);
    ok(isChildTouching(), 'Do entities remain tangential after zooming out?');


    viewstate.calculateSize(tril);

    vo1.remove();
});