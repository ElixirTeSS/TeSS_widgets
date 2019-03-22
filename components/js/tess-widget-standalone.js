// A standalone file that globally exposes a single function to create and initialize a TessWidget object.
// Allows it to run in a browser without having to `require` anything.
const TessEventsWidget = require('./tess-events-widget.js');
const TessMaterialsWidget = require('./tess-materials-widget.js');

function CreateTessEventsWidget(element, renderer, options) {
    new TessEventsWidget(element, renderer, options).initialize();
}

function CreateTessMaterialsWidget(element, renderer, options) {
    new TessMaterialsWidget(element, renderer, options).initialize();
}

module.exports = { Events: CreateTessEventsWidget, Materials: CreateTessMaterialsWidget };
