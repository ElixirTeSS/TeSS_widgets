// A standalone file that globally exposes a single function to create and initialize a TessWidget object.
// Allows it to run in a browser without having to `require` anything.
var TessWidgetObj = require('./tess-widget.js');

function TessWidget(element, renderer, options) {
    var widget = new TessWidgetObj(element, renderer, options);
    widget.initialize();
}

module.exports = TessWidget;
