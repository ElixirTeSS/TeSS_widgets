var FacetDropdownsRenderer = require('./facet-dropdowns-renderer.js');
var TableRenderer = require('./table-renderer.js');
var SearchRenderer = require('./search-renderer.js');
var PaginationRenderer = require('./pagination-renderer.js');

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

    var title = document.createElement('h2');
    title.innerText = 'Events';

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
    this.elements.wrapper.appendChild(title);
    this.elements.wrapper.appendChild(this.elements.controls);
    this.elements.wrapper.appendChild(this.elements.results);
    this.elements.wrapper.appendChild(this.elements.pagination);
    this.elements.wrapper.appendChild(this.elements.tessLink);
    this.container.appendChild(this.elements.wrapper);

    this.renderers.facetDropdowns = new FacetDropdownsRenderer(this.widget, this.elements.facetDropdowns,
        { allowedFacets: this.options.allowedFacets });
    this.renderers.table = new TableRenderer(this.widget, this.elements.results);
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
