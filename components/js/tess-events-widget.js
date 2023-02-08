'use strict';
const TessWidget = require('./tess-widget.js');
const availableRenderers = {
    FacetedTable: require('./renderers/faceted-table-renderer.js'),
    SimpleList: require('./renderers/simple-list-renderer.js'),
    DropdownTable: require('./renderers/dropdown-table-renderer.js'),
    GoogleMap: require('./renderers/google-map-renderer.js')
};

/**
 * A TeSS events widget.
 *
 * @constructor
 * @param {Object} element - The HTML element to contain the widget
 * @param {defaultRenderers|Object} renderer - The renderer that determines how the widget is displayed.
 *                                             The following pre-defined renderers are available:
 *                                             "FacetedTable", "DropdownTable", "SimpleList", "GoogleMap"
 * @param {Object} options
 * @param {Object} options.opts - Options to pass through to the renderer.
 * @param {Object} options.params - Pre-applied filters to the set of events from TeSS.
 * @param {Object} options.baseUrl - URL to the TeSS instance the widget should use. Defaults to https://tess.elixir-europe.org
 */
class TessEventsWidget extends TessWidget {

    constructor (element, renderer, options) {
        super('eventsGet', element, renderer, options);
    }

    static defaultRenderers() {
        return availableRenderers;
    }

}

module.exports = TessEventsWidget;
