'use strict';
const TessApi = require('tess_json_api');
const Util = require('./util.js');

// Swagger's generated API client breaks dates in Safari & IE. This hack fixes that.
TessApi.ApiClient.parseDate = function(str) {
    return new Date(str);
};

/**
 * A TeSS widget.
 *
 * @constructor
 * @param {Object} apiClass - The TeSS API class being used by the widget (Events/Materials).
 * @param {Object} endpoint - The specific API endpoint to call when fetching.
 * @param {Object} element - The HTML element to contain the widget
 * @param {defaultRenderers|Object} renderer - The renderer that determines how the widget is displayed.
 *                                             The following pre-defined renderers are available:
 *                                             "FacetedTable", "DropdownTable", "SimpleList", "GoogleMap"
 * @param {Object} options
 * @param {Object} options.opts - Options to pass through to the renderer.
 * @param {Object} options.params - Pre-applied filters to the set of events from TeSS.
 * @param {Object} options.baseUrl - URL to the TeSS instance the widget should use. Defaults to https://tess.elixir-europe.org
 * @param {Object} options.instanceName - name of the TeSS instance the widget should use. Defaults to "TeSS"
 * @param {Object} options.emptyText - Text to display if no resources are found. Defaults to "Nothing found"
 */
class TessWidget {

    constructor (apiClass, endpoint, element, renderer, options) {
        this.endpoint = endpoint;
        this.options = options || {};
        this.identifier = this.options.identifier || 'TeSS-Widget';

        this.element = element;
        this.renderer = this.buildRenderer(renderer, options.opts);
        this.queryParameters = this.options.params || {};
        this.baseUrl = (this.options.baseUrl || 'https://tess.elixir-europe.org').replace(/\/+$/, '');
        this.instanceName = (this.options.instanceName || 'TeSS');
        this.emptyText = (this.options.emptyText || 'Nothing found');
        const client = new TessApi.ApiClient();
        client.basePath = this.baseUrl;
        this.api = new apiClass(client);
    }

    buildRenderer (renderer, rendererOptions) {
        if (!renderer)
            renderer = 'FacetedTable';

        let rendererClass;
        if (typeof renderer === 'string' || renderer instanceof String) {
            rendererClass = this.constructor.defaultRenderers()[renderer];
        } else {
            rendererClass = renderer;
        }

        return new rendererClass(this, this.element, rendererOptions || {});
    }

    static defaultRenderers() {
        return {};
    }

    initialize () {
        this.renderer.initialize();
        this.refresh();
    }

    /**
     * Build an absolute URL to the TeSS API from a given path.
     *
     * @param {string} path - Relative path
     * @return {String} Absolute URL
     */
    buildUrl (path) {
        return this.api.apiClient.buildUrl(path);
    }

    /**
     * Apply the given facet to the current set of resources. Will apply as a union with any existing facet values.
     *
     * @param {string} key - The facet field.
     * @param {string} value - The facet value to apply.
     */
    addFacet (key, value) {
        const actualKey = Util.camelize(key);

        if (!this.queryParameters[actualKey]) {
            this.queryParameters[actualKey] = [];
        }

        if (!this.queryParameters[actualKey].includes(value)) {
            this.queryParameters[actualKey].push(value);
        }

        delete this.queryParameters['pageNumber'];

        this.refresh();
    }

    /**
     * Remove the given facet from the current set of resources.
     *
     * @param {string} key - The facet field.
     * @param {string} value - The facet value to remove.
     */
    removeFacet (key, value) {
        const actualKey = Util.camelize(key);

        if (!this.queryParameters[actualKey])
            return;

        const index = this.queryParameters[actualKey].indexOf(value);

        if (index !== -1) {
            this.queryParameters[actualKey].splice(index, 1);
        }

        if (!this.queryParameters[actualKey].length) {
            delete this.queryParameters[actualKey];
        }

        delete this.queryParameters['pageNumber'];

        this.refresh();
    }

    /**
     * Set the given facet to the given value. Replaces any existing values for the given facet.
     *
     * @param {string} key - The facet field.
     * @param {string} value - The facet value to set.
     */
    setFacet (key, value) {
        const actualKey = Util.camelize(key);

        this.queryParameters[actualKey] = [value];

        delete this.queryParameters['pageNumber'];

        this.refresh();
    }

    /**
     * Clear the given facet of any values.
     *
     * @param {string} key - The facet field.
     */
    clearFacet (key) {
        const actualKey = Util.camelize(key);

        delete this.queryParameters[actualKey];

        delete this.queryParameters['pageNumber'];

        this.refresh();
    }

    /**
     * Set the page for the current resource collection.
     *
     * @param {string|number} page - The facet field.
     */
    setPage (page) {
        this.queryParameters['pageNumber'] = page;

        this.refresh();
    }

    /**
     * Apply a search query over the current set of resources.
     *
     * @param {string} query - The search query.
     */
    search (query) {
        this.queryParameters.q = query;

        delete this.queryParameters['pageNumber'];

        this.refresh();
    }

    /**
     * Perform an API request to fetch a set of resources matching the applied facets/search query/page number.
     */
    refresh () {
        this.element.classList.add('tess-loader-large');

        const widget = this;
        this.api[this.endpoint](this.queryParameters, function (errors, data, response) {
            widget.renderer.render.apply(widget.renderer, [errors, data, response]);
            widget.element.classList.remove('tess-loader-large');
        });
    }

}

module.exports = TessWidget;
