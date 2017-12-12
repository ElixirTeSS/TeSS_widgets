var FacetsSidebarRenderer = require('./facets-sidebar-renderer.js');
var ActiveFacetsRenderer = require('./active-facets-renderer.js');
var TableRenderer = require('./table-renderer.js');
var SearchRenderer = require('./search-renderer.js');
var PaginationRenderer = require('./pagination-renderer.js');

function FacetedTableRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
    this.elements = {};
    this.renderers = {};
}

FacetedTableRenderer.prototype.initialize = function () {
    this.elements.facets = document.createElement('div');
    this.elements.facets.className = 'tess-facets';

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

    this.elements.activeFacets = document.createElement('div');
    this.elements.activeFacets.className = 'tess-active-facets';

    this.elements.pagination = document.createElement('div');
    this.elements.pagination.className = 'tess-pagination';

    this.elements.tessLink = document.createElement('div');

    this.elements.controls.appendChild(this.elements.activeFacets);
    this.elements.controls.appendChild(this.elements.search);
    this.elements.wrapper.appendChild(title);
    this.elements.wrapper.appendChild(this.elements.controls);
    this.elements.wrapper.appendChild(this.elements.results);
    this.elements.wrapper.appendChild(this.elements.pagination);
    this.elements.wrapper.appendChild(this.elements.tessLink);
    this.container.appendChild(this.elements.facets);
    this.container.appendChild(this.elements.wrapper);

    this.renderers.facets = new FacetsSidebarRenderer(this.widget, this.elements.facets,
        { allowedFacets: this.options.allowedFacets });
    this.renderers.activeFacets = new ActiveFacetsRenderer(this.widget, this.elements.activeFacets);
    this.renderers.table = new TableRenderer(this.widget, this.elements.results);
    this.renderers.search = new SearchRenderer(this.widget, this.elements.search);
    this.renderers.pagination = new PaginationRenderer(this.widget, this.elements.pagination);

    this.renderers.facets.initialize();
    this.renderers.activeFacets.initialize();
    this.renderers.table.initialize();
    this.renderers.search.initialize();
    this.renderers.pagination.initialize();
};

FacetedTableRenderer.prototype.render = function (errors, data, response) {
    this.renderers.facets.render(errors, data, response);
    this.renderers.activeFacets.render(errors, data, response);
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

module.exports = FacetedTableRenderer;
