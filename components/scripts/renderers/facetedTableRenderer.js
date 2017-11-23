function FacetedTableRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
    this.elements = {};
    this.renderers = {};
}

FacetedTableRenderer.prototype.initialize = function () {
    this.elements.facetsContainer = document.createElement('div');
    this.elements.facetsContainer.className = 'tess-facets';

    this.elements.wrapper = document.createElement('div');
    this.elements.wrapper.className = 'tess-wrapper';

    this.elements.resultsContainer = document.createElement('div');
    this.elements.resultsContainer.className = 'tess-results';

    this.elements.activeFacetsContainer = document.createElement('div');
    this.elements.activeFacetsContainer.className = 'tess-active-facets';

    var widget = this.widget;
    this.container.addEventListener('click', function (event) {
        if (event.target.hasAttribute('data-tess-facet-key')) {
            var f = event.target.getAttribute('data-tess-facet-active') === 'true' ? widget.removeFacet : widget.applyFacet;
            f.bind(widget)(event.target.getAttribute('data-tess-facet-key'), event.target.getAttribute('data-tess-facet-value'));
        }
    });

    this.elements.wrapper.appendChild(this.elements.activeFacetsContainer);
    this.elements.wrapper.appendChild(this.elements.resultsContainer);
    this.container.appendChild(this.elements.facetsContainer);
    this.container.appendChild(this.elements.wrapper);
    
    this.renderers.facets = new FacetsSidebarRenderer(this.widget, this.elements.facetsContainer);
    this.renderers.activeFacets = new ActiveFacetsRenderer(this.widget, this.elements.activeFacetsContainer);
    this.renderers.table = new TableRenderer(this.widget, this.elements.resultsContainer);
    
    this.renderers.facets.initialize();
    this.renderers.activeFacets.initialize();
    this.renderers.table.initialize();
};

FacetedTableRenderer.prototype.render = function (errors, data, response) {
    this.renderers.facets.render(errors, data, response);
    this.renderers.activeFacets.render(errors, data, response);
    this.renderers.table.render(errors, data, response);
};
