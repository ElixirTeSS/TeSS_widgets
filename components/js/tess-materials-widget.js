'use strict';
const TessApi = require('tess_json_api');
const TessWidget = require('./tess-widget.js');
const availableRenderers = {
    FacetedTable: require('./renderers/faceted-table-renderer.js'),
    SimpleList: require('./renderers/simple-list-renderer.js'),
    DropdownTable: require('./renderers/dropdown-table-renderer.js')
};

/**
 * A TeSS materials widget.
 *
 * @constructor
 * @param {Object} element - The HTML element to contain the widget
 * @param {defaultRenderers|Object} renderer - The renderer that determines how the widget is displayed.
 *                                             The following pre-defined renderers are available:
 *                                             "FacetedTable", "DropdownTable", "SimpleList", "GoogleMap"
 * @param {Object} options
 * @param {Object} options.opts - Options to pass through to the renderer.
 * @param {Object} options.params - Pre-applied filters to the set of materials from TeSS.
 */
class TessMaterialsWidget extends TessWidget {

    constructor (element, renderer, options) {
        super(new TessApi.MaterialsApi(), 'materialsGet', element, renderer, options);
    }

    static defaultRenderers() {
        return availableRenderers;
    }

}

module.exports = TessMaterialsWidget;
