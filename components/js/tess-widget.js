'use strict';

var TessApi = require('tess_json_api');

var defaultRenderers = {
    FacetedTable: require('./renderers/faceted-table-renderer.js'),
    SimpleList: require('./renderers/simple-list-renderer.js'),
    DropdownTable: require('./renderers/dropdown-table-renderer.js')
};

var api = new TessApi.EventsApi();

function formatKey(key) {
    return key.replace(/-/g, '_').replace('[]', '') + '[]';
}

function TessWidget(element, renderer, options) {
    this.name = 'ElixirTess_list_widget';
    if (!renderer)
        renderer = 'FacetedTable';

    if (typeof renderer === 'string' || renderer instanceof String)
        renderer = defaultRenderers[renderer];

    this.renderer = new renderer(this, element, options.opts || {});
    this.render = this.renderer.render.bind(this.renderer);
    this.options = options || {};
    this.queryParameters = this.options.params || {};
    if (this.queryParameters.facets) {
        var actualFacets = {};
        for (var key in this.queryParameters.facets) {
            if (this.queryParameters.facets.hasOwnProperty(key)) {
                actualFacets[formatKey(key)] = this.queryParameters.facets[key];
            }
        }
        this.queryParameters.facets = actualFacets;
    }
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

TessWidget.prototype.addFacet = function (key, value) {
    var actualKey = formatKey(key);

    if (!this.queryParameters.facets[actualKey]) {
        this.queryParameters.facets[actualKey] = [];
    }

    if (!this.queryParameters.facets[actualKey].includes(value)) {
        this.queryParameters.facets[actualKey].push(value);
    }

    delete this.queryParameters['pageNumber'];

    this.getEvents();
};

TessWidget.prototype.removeFacet = function (key, value) {
    var actualKey = formatKey(key);

    if (!this.queryParameters.facets[actualKey])
        return;

    var index = this.queryParameters.facets[actualKey].indexOf(value);

    if (index !== -1) {
        this.queryParameters.facets[actualKey].splice(index, 1);
    }

    if (!this.queryParameters.facets[actualKey].length) {
        delete this.queryParameters.facets[actualKey];
    }

    delete this.queryParameters['pageNumber'];

    this.getEvents();
};

TessWidget.prototype.setFacet = function (key, value) {
    var actualKey = formatKey(key);

    this.queryParameters.facets[actualKey] = [value];

    delete this.queryParameters['pageNumber'];

    this.getEvents();
};

TessWidget.prototype.clearFacet = function (key) {
    var actualKey = formatKey(key);

    delete this.queryParameters.facets[actualKey];

    delete this.queryParameters['pageNumber'];

    this.getEvents();
};

TessWidget.prototype.setPage = function (page) {
    this.queryParameters['pageNumber'] = page;
    this.getEvents();
};

TessWidget.prototype.search = function (query) {
    this.queryParameters.q = query;

    delete this.queryParameters['pageNumber'];

    this.getEvents();
};

TessWidget.prototype.getEvents = function () {
    api.eventsGet(this.queryParameters, this.render);
};

module.exports = TessWidget;
