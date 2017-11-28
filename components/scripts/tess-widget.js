'use strict';

var TessApi = require('tess_json_api');

var defaultRenderers = {
    FacetedTableRenderer: require('./renderers/faceted-table-renderer.js'),
    SimpleListRenderer: require('./renderers/simple-list-renderer.js')
};

var api = new TessApi.EventsApi();

function TessWidget(element, renderer, options) {
    this.name = 'ElixirTess_list_widget';
    if (!renderer)
        renderer = 'FacetedTableRenderer';

    if (typeof renderer === 'string' || renderer instanceof String)
        renderer = defaultRenderers[renderer];

    this.renderer = new renderer(this, element, options.rendererOptions || {});
    this.render = this.renderer.render.bind(this.renderer);
    this.options = options || {};
    this.queryParameters = this.options.queryParameters || {};
}

TessWidget.prototype.initialize = function () {
    this.renderer.initialize();
    this.getEvents();
};

/**
 * Build an absolute URL to the TeSS API from a given path.
 *
 * @param {string} Relative path
 * @return {String} Absolute URL
 */
TessWidget.prototype.buildUrl = function (path) {
    return api.apiClient.buildUrl(path);
};

TessWidget.prototype.applyFacet = function (key, value) {
    var actualKey = key.replace(/-/g, '_') + '[]';

    if (!this.queryParameters.facets[actualKey]) {
        this.queryParameters.facets[actualKey] = [];
    }

    if (!this.queryParameters.facets[actualKey].includes(value)) {
        this.queryParameters.facets[actualKey].push(value);
    }

    this.getEvents();
};

TessWidget.prototype.removeFacet = function (key, value) {
    var actualKey = key.replace(/-/g, '_') + '[]';

    if (!this.queryParameters.facets[actualKey])
        return;

    var index = this.queryParameters.facets[actualKey].indexOf(value);

    if (index !== -1) {
        this.queryParameters.facets[actualKey].splice(index, 1);
    }

    if (!this.queryParameters.facets[actualKey].length) {
        delete this.queryParameters.facets[actualKey];
    }

    this.getEvents();
};

TessWidget.prototype.setPage = function (page) {
    this.queryParameters['pageNumber'] = page;
    this.getEvents();
};

TessWidget.prototype.getEvents = function () {
    api.eventsGet(this.queryParameters, this.render);
};

module.exports = TessWidget;
