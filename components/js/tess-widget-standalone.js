// A standalone file that globally exposes a single function to create and initialize a TessWidget object.
// Allows it to run in a browser without having to `require` anything.
var TessEventsWidgetObj = require('./tess-events-widget.js');
var TessMaterialsWidgetObj = require('./tess-materials-widget.js');

function TessEventsWidget(element, renderer, options) {
    var widget = new TessEventsWidgetObj(element, renderer, options);
    widget.initialize();
}

function TessMaterialsWidget(element, renderer, options) {
    var widget = new TessMaterialsWidgetObj(element, renderer, options);
    widget.initialize();
}

module.exports = { Events: TessEventsWidget, Materials: TessMaterialsWidget };
