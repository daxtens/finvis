test('viewstate zoom basics', function() {
    var epsilon = 0.1;

    // reset. TODO port to use a fixture.
    reset();

    var vo = new ViewObj(openbudget, viewstate, [0, 0]);
    vo.period('2011-12');
    vo.render();

    var size = vo.svg[0][0].getBBox();

    viewstate.zoom(2, [viewstate.width / 2, viewstate.height / 2], true);
    var newsize = vo.svg[0][0].getBBox();
    // these are worrying inexact
    assertNearlyEqual(newsize.width, Math.sqrt(2) * size.width, epsilon,
                      'Upscaled width OK');
    assertNearlyEqual(newsize.height, Math.sqrt(2) * size.height, epsilon,
                      'Upscaled height OK');


    viewstate.zoom(1 / 4, [viewstate.width / 2, viewstate.height / 2], true);
    newsize = vo.svg[0][0].getBBox();
    assertNearlyEqual(Math.sqrt(2) * newsize.width, size.width, epsilon,
                      'Downscaled width OK');
    assertNearlyEqual(Math.sqrt(2) * newsize.height, size.height, epsilon,
                      'Downscaled height OK');

    vo.remove();
});
