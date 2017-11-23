// At least temporarily, wrap in self-invoking function to keep variables
// in local scope.
(function () {
    'use strict';

    // Variables
    var tessApi = require('tess_json_api');
    var api = new tessApi.DefaultApi();
    var locale;

    if (navigator.languages !== undefined)
        locale = navigator.languages[0];
    else if (navigator.language !== undefined)
        locale = navigator.language;
    else
        locale = 'en-GB';

    var dateFormat = { year: 'numeric', month: 'long', day: 'numeric' };

    function TessWidget(element, renderer, options) {
        this.name = 'ElixirTess_list_widget';
        this.renderer = new renderer(this, element);
        this.render = this.renderer.render.bind(this.renderer);
        this.options = options || {};
        this.queryParameters = this.options.queryParameters || {};
    }

    TessWidget.prototype.initialize = function () {
        this.renderer.initialize();
        this.getEvents();
    };

    /**
     * Formats a date.
     *
     * @param {String or Date object} date
     * @return {String} Formatted date
     */
    TessWidget.prototype.formatDate = function (date) {
        var parsedDate = new Date(date);

        return parsedDate.toLocaleDateString(locale, dateFormat);
    };

    /**
     * Turns a JSON key-like string into a humanize version.
     *
     * @param {string} Computerized string
     * @return {String} Humanized string
     */
    TessWidget.prototype.humanize = function (string) {
        var stripped = string.toLowerCase().replace(/[_-]/, ' ');
        // Replace first character, and any character occurring after whitespace, with a capitalized version.
        return stripped.replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });
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

    TessWidget.prototype.getEvents = function () {
        api.eventsGet(this.queryParameters, this.render);
    };

    var widget = new TessWidget(document.getElementById('tess-list-widget'),
        FacetedTableRenderer,
        {
            queryParameters: {
                q: "Python",
                facets: { "country[]": ["Belgium",  "United Kingdom"] }
        }});

    widget.initialize();
}()); // End anonymous function
