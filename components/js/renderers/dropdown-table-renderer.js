'use strict';
const Renderer = require('./renderer.js');
const FacetDropdownsRenderer = require('./partials/facet-dropdowns-renderer.js');
const TableRenderer = require('./partials/table-renderer.js');
const SearchRenderer = require('./partials/search-renderer.js');
const PaginationRenderer = require('./partials/pagination-renderer.js');
const n = require('../util.js').makeElement;

/**
 * A list of resources in a table, with dropdown lists to filter across various categories.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 * @param {Object} options - Options for the renderer.
 * @param {Object[]} options.columns - A list of columns that the table should display.
 * @param {Object[]} options.columns[].name - The label to display at the top of the column.
 * @param {Object[]} options.columns[].field - The resource field to use.
 * @param {Object[]} options.dropdowns - A list of dropdown menus should appear above the table.
 * @param {Object[]} options.dropdowns[].name - The label to display next to the menu.
 * @param {Object[]} options.dropdowns[].field - The resource field to filter by.
 * @param {Object[]} options.descriptionSizeLimit - The maximum size (in px) before descriptions are hidden behind a "Show more" button.
 */
class DropdownTableRenderer extends Renderer {

    initialize () {
        // Top drop-down menus above the table and search bar
        this.elements.search = n('div', { className: 'tess-search' },
            n('div', { className: 'tess-facet-title' }, 'Search'));
        this.elements.controls = n('div', { className: 'tess-controls' });

        // Main table view with pagination
        this.elements.results = n('div', { className: 'tess-results' });
        this.elements.pagination = n('div', { className: 'tess-pagination' });
        this.elements.tessLink = n('div');
        this.elements.wrapper = n('div', { className: 'tess-wrapper' },
            this.elements.controls,
            this.elements.results,
            this.elements.pagination,
            this.elements.tessLink
        );

        this.container.appendChild(this.elements.wrapper);

        this.renderers.facetDropdowns = new FacetDropdownsRenderer(this.widget, this.elements.controls,
            { dropdowns: this.options.dropdowns });
        this.renderers.table = new TableRenderer(this.widget, this.elements.results,
            { columns: this.options.columns, descriptionSizeLimit: this.options.descriptionSizeLimit });
        this.renderers.search = new SearchRenderer(this.widget, this.elements.search);
        this.renderers.pagination = new PaginationRenderer(this.widget, this.elements.pagination);

        super.initialize();
        this.elements.controls.appendChild(this.elements.search); // Append search after the dropdowns have been added
    }


    render (errors, data, response) {
        super.render(errors, data, response);

        // TeSS link
        Renderer.clear(this.elements.tessLink);
        this.elements.tessLink.appendChild(n('p',
            n('a', { href: response.req.url, target: '_blank' },
                'View your results on TeSS')));
    }

}

module.exports = DropdownTableRenderer;
