'use strict';

var TessApi = require('tess_json_api');
var Util = require('./util.js');
// Swagger's generated API client breaks dates in Safari & IE. This hack fixes that.
TessApi.ApiClient.parseDate = function(str) {
    return new Date(str);
};

/**
 * A TeSS widget.
 *
 * @constructor
 * @param {Object} element - The HTML element to contain the widget
 * @param {defaultRenderers|Object} renderer - The renderer that determines how the widget is displayed.
 *                                             The following pre-defined renderers are available:
 *                                             "FacetedTable", "DropdownTable", "SimpleList", "GoogleMap"
 * @param {Object} options
 * @param {Object} options.opts - Options to pass through to the renderer.
 * @param {Object} options.params - Pre-applied filters to the set of events from TeSS.
 */
function TessWidget(element, renderer, options) {
    this.options = options || {};
    this.identifier = this.options.identifier || 'TeSS-Widget';

    this.element = element;
    this.renderer = new renderer(this, element, options.opts || {});
    this.queryParameters = this.options.params || {};
}

TessWidget.prototype.initialize = function () {
    this.renderer.initialize();
    this.refresh();
};

/**
 * Build an absolute URL to the TeSS API from a given path.
 *
 * @param {string} path - Relative path
 * @return {String} Absolute URL
 */
TessWidget.prototype.buildUrl = function (path) {
    return this.api.apiClient.buildUrl(path);
};

/**
 * Apply the given facet to the current set of resources. Will apply as a union with any existing facet values.
 *
 * @param {string} key - The facet field.
 * @param {string} value - The facet value to apply.
 */
TessWidget.prototype.addFacet = function (key, value) {
    var actualKey = Util.camelize(key);

    if (!this.queryParameters[actualKey]) {
        this.queryParameters[actualKey] = [];
    }

    if (!this.queryParameters[actualKey].includes(value)) {
        this.queryParameters[actualKey].push(value);
    }

    delete this.queryParameters['pageNumber'];

    this.refresh();
};

/**
 * Remove the given facet from the current set of resources.
 *
 * @param {string} key - The facet field.
 * @param {string} value - The facet value to remove.
 */
TessWidget.prototype.removeFacet = function (key, value) {
    var actualKey = Util.camelize(key);

    if (!this.queryParameters[actualKey])
        return;

    var index = this.queryParameters[actualKey].indexOf(value);

    if (index !== -1) {
        this.queryParameters[actualKey].splice(index, 1);
    }

    if (!this.queryParameters[actualKey].length) {
        delete this.queryParameters[actualKey];
    }

    delete this.queryParameters['pageNumber'];

    this.refresh();
};

/**
 * Set the given facet to the given value. Replaces any existing values for the given facet.
 *
 * @param {string} key - The facet field.
 * @param {string} value - The facet value to set.
 */
TessWidget.prototype.setFacet = function (key, value) {
    var actualKey = Util.camelize(key);

    this.queryParameters[actualKey] = [value];

    delete this.queryParameters['pageNumber'];

    this.refresh();
};

/**
 * Clear the given facet of any values.
 *
 * @param {string} key - The facet field.
 */
TessWidget.prototype.clearFacet = function (key) {
    var actualKey = Util.camelize(key);

    delete this.queryParameters[actualKey];

    delete this.queryParameters['pageNumber'];

    this.refresh();
};

/**
 * Set the page for the current resource collection.
 *
 * @param {string|integer} page - The facet field.
 */
TessWidget.prototype.setPage = function (page) {
    this.queryParameters['pageNumber'] = page;

    this.refresh();
};

/**
 * Apply a search query over the current set of resources.
 *
 * @param {string} query - The search query.
 */
TessWidget.prototype.search = function (query) {
    this.queryParameters.q = query;

    delete this.queryParameters['pageNumber'];

    this.refresh();
};

/**
 * Perform an API request to fetch a set of resources matching the applied facets/search query/page number.
 */
TessWidget.prototype.refresh = function () {
    this.element.classList.add('tess-loader-large');

    var widget = this;
    this.api[this.endpoint](this.queryParameters, function (errors, data, response) {
        widget.renderer.render.apply(widget.renderer, [errors, data, response]);
        widget.element.classList.remove('tess-loader-large');
    });
};

module.exports = TessWidget;
