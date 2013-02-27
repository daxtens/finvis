function nearlyEqual(a, b, epsilon, message) {
    ok((Math.abs(a - b) < epsilon), message);
}

test('viewstate zoom basics', function() {
    var epsilon = 0.1;
    var size = viewstate.children()[0].svg[0][0].getBBox();

    viewstate.zoom(2, [viewstate.width / 2, viewstate.height / 2], true);
    var newsize = viewstate.children()[0].svg[0][0].getBBox();
    // these are worrying inexact
    nearlyEqual(newsize.width, Math.sqrt(2) * size.width, epsilon,
                'Upscaled width OK');
    nearlyEqual(newsize.height, Math.sqrt(2) * size.height, epsilon,
                'Upscaled height OK');


    viewstate.zoom(1 / 4, [viewstate.width / 2, viewstate.height / 2], true);
    newsize = viewstate.children()[0].svg[0][0].getBBox();
    nearlyEqual(Math.sqrt(2) * newsize.width, size.width, epsilon,
                'Downscaled width OK');
    nearlyEqual(Math.sqrt(2) * newsize.height, size.height, epsilon,
                'Downscaled height OK');

});
