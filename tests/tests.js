function reset() {
    while (viewstate.children().length) {
        viewstate.children()[0].remove();
    }
}

function assertNearlyEqual(a, b, epsilon, message) {
    ok((Math.abs(a - b) < epsilon), message);
}