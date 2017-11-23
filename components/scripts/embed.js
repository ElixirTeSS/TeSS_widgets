var TessWidget = require('./tess-widget.js');
var FacetedTableRenderer = require('./renderers/faceted-table-renderer.js');
var SimpleListRenderer = require('./renderers/simple-list-renderer.js');

var tableWidget = new TessWidget(
    document.getElementById('tess-widget-table'),
    FacetedTableRenderer,
    {
        queryParameters: {
            q: "Python",
            facets: { "country[]": ["Belgium",  "United Kingdom"] }
        }
    });

tableWidget.initialize();

var listWidget = new TessWidget(
    document.getElementById('tess-widget-list'),
    SimpleListRenderer,
    {
        queryParameters: {
            pageSize: 5,
            q: "Python",
            facets: { "country[]": ["Belgium",  "United Kingdom"] }
        }
    });

listWidget.initialize();
