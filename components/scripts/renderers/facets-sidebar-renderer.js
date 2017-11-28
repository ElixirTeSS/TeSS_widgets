'use strict';
var Util = require('../util.js');

function FacetsSidebarRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
}

FacetsSidebarRenderer.prototype.initialize = function () { };

FacetsSidebarRenderer.prototype.render = function (errors, data, response) {
    // Render facet sidebar
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }

    var title = document.createElement('h2');
    title.innerText = 'Filters';
    this.container.appendChild(title);

    var anyFacets = false;
    for (var key in data.meta['available-facets']) {
        if (data.meta['available-facets'][key].length) {
            anyFacets = true;
            this.renderFacet(this.container, key, data.meta['available-facets'][key], (data.meta['facets'][key] || []));
        }
    }

    if (!anyFacets) {
        var notice = document.createElement('span');
        notice.innerText = 'No filters available';
        this.container.appendChild(notice);
    }
};

FacetsSidebarRenderer.prototype.renderFacetRow = function (container, active, key, value, count) {
    var li = document.createElement('li');

    var row = document.createElement('a');
    row.href = '#';
    row.className = 'tess-facet-row' + (active ? ' active' : '');
    row.title = (active ? 'Remove' : 'Add') + ' filter for ' + value;

    var valueSpan = document.createElement('span');
    valueSpan.className = 'tess-facet-row-value';
    valueSpan.innerText = value;
    row.appendChild(valueSpan);

    if (!active) {
        var countSpan = document.createElement('span');
        countSpan.className = 'tess-facet-row-count';
        countSpan.innerText = count;
        row.appendChild(countSpan);
    }

    row.setAttribute('data-tess-facet-key', key);
    row.setAttribute('data-tess-facet-value', value);
    row.setAttribute('data-tess-facet-active', active);

    li.appendChild(row);
    container.appendChild(li);
};

FacetsSidebarRenderer.prototype.renderFacet = function (container, key, availableFacets, activeFacets) {
    var category = document.createElement('div');
    category.className = 'tess-facet';
    category.setAttribute('data-tess-facet-key', key);

    var title = document.createElement('div');
    title.className = 'tess-facet-title';
    title.appendChild(document.createTextNode(Util.humanize(key)));
    category.appendChild(title);

    var list = document.createElement('ul');
    category.appendChild(list);

    var self = this;
    // Render the active facets first so they appear at the top.
    activeFacets.forEach(function (val) {
        self.renderFacetRow(list, true, key, val);
    });
    availableFacets.forEach(function (row) {
        // Don't render active facets twice, or blank values
        if (!activeFacets.includes(row.value) && row.value) {
            self.renderFacetRow(list, false, key, row.value, row.count);
        }
    });

    container.appendChild(category);
};

module.exports = FacetsSidebarRenderer;
