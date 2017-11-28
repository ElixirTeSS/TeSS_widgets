// A standalone file that exposes a single function to create an initialize a TessWidget object.
var TessWidgetObj = require('./tess-widget.js');

function TessWidget(element, renderer, options) {
    var widget = new TessWidgetObj(element, renderer, options);
    widget.initialize();
}

module.exports = TessWidget;
