'use strict';
const Renderer = require('./renderer.js');
const FacetsSidebarRenderer = require('./partials/facets-sidebar-renderer.js');
const ActiveFacetsRenderer = require('./partials/active-facets-renderer.js');
const TableRenderer = require('./partials/table-renderer.js');
const SearchRenderer = require('./partials/search-renderer.js');
const PaginationRenderer = require('./partials/pagination-renderer.js');
const n = require('../util.js').makeElement;

/**
 * A list of resources in a table, with a sidebar containing various filters.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 * @param {Object} options - Options for the renderer.
 * @param {Object[]} options.columns - A list of columns that the table should display.
 * @param {Object[]} options.columns[].name - The label to display at the top of the column.
 * @param {Object[]} options.columns[].field - The resource field to use.
 * @param {string[]} options.allowedFacets - A list of possible facets (filters) to display in the sidebar.
 */
class FacetedTableRenderer extends Renderer {

    initialize () {
        // Left-hand facets sidebar
        this.elements.facets = n('div', { className: 'tess-facets' });

        // Top search bar and active facets display
        this.elements.search = n('div', { className: 'tess-search' });
        this.elements.activeFacets = n('div', { className: 'tess-active-facets' });
        this.elements.controls = n('div', { className: 'tess-controls' },
            this.elements.activeFacets,
            this.elements.search
        );

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

        this.container.appendChild(this.elements.facets);
        this.container.appendChild(this.elements.wrapper);

        this.renderers.facets = new FacetsSidebarRenderer(this.widget, this.elements.facets,
            { allowedFacets: this.options.allowedFacets });
        this.renderers.activeFacets = new ActiveFacetsRenderer(this.widget, this.elements.activeFacets,
            { allowedFacets: this.options.allowedFacets });
        this.renderers.table = new TableRenderer(this.widget, this.elements.results,
            { columns: this.options.columns });
        this.renderers.search = new SearchRenderer(this.widget, this.elements.search);
        this.renderers.pagination = new PaginationRenderer(this.widget, this.elements.pagination);

        super.initialize();
    };

    render (errors, data, response) {
        super.render(errors, data, response);

        // TeSS link
        Renderer.clear(this.elements.tessLink);
        this.elements.tessLink.appendChild(n('p', n('a', { href: response.req.url }, 'View your results on TeSS')));
    }

}

module.exports = FacetedTableRenderer;
