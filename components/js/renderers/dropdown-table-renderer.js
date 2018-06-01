var FacetDropdownsRenderer = require('./partials/facet-dropdowns-renderer.js');
var TableRenderer = require('./partials/table-renderer.js');
var SearchRenderer = require('./partials/search-renderer.js');
var PaginationRenderer = require('./partials/pagination-renderer.js');

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
 */
function DropdownTableRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
    this.elements = {};
    this.renderers = {};
}

DropdownTableRenderer.prototype.initialize = function () {
    this.elements.facetDropdowns = document.createElement('div');
    this.elements.facetDropdowns.className = 'tess-facet-dropdowns';

    this.elements.wrapper = document.createElement('div');
    this.elements.wrapper.className = 'tess-wrapper';

    this.elements.results = document.createElement('div');
    this.elements.results.className = 'tess-results';

    this.elements.controls = document.createElement('div');
    this.elements.controls.className = 'tess-controls';

    this.elements.search = document.createElement('div');
    this.elements.search.className = 'tess-search';
    var searchTitle = document.createElement('div');
    searchTitle.className = 'tess-facet-title';
    searchTitle.appendChild(document.createTextNode('Search'));
    this.elements.search.appendChild(searchTitle);

    this.elements.pagination = document.createElement('div');
    this.elements.pagination.className = 'tess-pagination';

    this.elements.tessLink = document.createElement('div');

    this.elements.controls.appendChild(this.elements.facetDropdowns);
    this.elements.controls.appendChild(this.elements.search);
    this.elements.wrapper.appendChild(this.elements.controls);
    this.elements.wrapper.appendChild(this.elements.results);
    this.elements.wrapper.appendChild(this.elements.pagination);
    this.elements.wrapper.appendChild(this.elements.tessLink);
    this.container.appendChild(this.elements.wrapper);

    this.renderers.facetDropdowns = new FacetDropdownsRenderer(this.widget, this.elements.facetDropdowns,
        { dropdowns: this.options.dropdowns });
    this.renderers.table = new TableRenderer(this.widget, this.elements.results,
        { columns: this.options.columns });
    this.renderers.search = new SearchRenderer(this.widget, this.elements.search);
    this.renderers.pagination = new PaginationRenderer(this.widget, this.elements.pagination);

    this.renderers.facetDropdowns.initialize();
    this.renderers.table.initialize();
    this.renderers.search.initialize();
    this.renderers.pagination.initialize();
};

DropdownTableRenderer.prototype.render = function (errors, data, response) {
    this.renderers.facetDropdowns.render(errors, data, response);
    this.renderers.table.render(errors, data, response);
    this.renderers.search.render(errors, data, response);
    this.renderers.pagination.render(errors, data, response);

    // Render TeSS link
    while (this.elements.tessLink.firstChild) {
        this.elements.tessLink.removeChild(this.elements.tessLink.firstChild);
    }

    var tessLinkContainer = document.createElement('p');
    var tessLink = document.createElement('a');
    tessLink.href = response.req.url;
    tessLink.appendChild(document.createTextNode('View your results on TeSS'));
    tessLinkContainer.appendChild(tessLink);
    this.elements.tessLink.appendChild(tessLinkContainer);
};

module.exports = DropdownTableRenderer;
