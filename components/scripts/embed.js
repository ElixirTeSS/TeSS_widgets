var TessWidget = require('./tess-widget.js');
var FacetedTableRenderer = require('./renderers/faceted-table-renderer.js');

var widget = new TessWidget(
    document.getElementById('tess-list-widget'),
    FacetedTableRenderer,
    {
        queryParameters: {
            q: "Python",
            facets: { "country[]": ["Belgium",  "United Kingdom"] }
        }
    });

widget.initialize();
