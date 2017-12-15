'use strict';
var Util = require('../util.js');

function FacetDropdowns(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.options.dropdowns = this.options.dropdowns ||
        [{ name: 'Event Type', field: 'event-types' },
         { name: 'Country', field: 'country' }];

    this.container = element;
}

FacetDropdowns.prototype.initialize = function () {
    var widget = this.widget;

    this.dropdowns = {};
    
    var self = this;
    this.options.dropdowns.forEach(function (pair) {
        // wrapper
        var category = document.createElement('div');
        category.className = 'tess-facet';

        // title
        var title = document.createElement('div');
        title.className = 'tess-facet-title';
        title.appendChild(document.createTextNode(pair.name));
        category.appendChild(title);

        // dropdown
        var list = document.createElement('select');
        list.setAttribute('data-tess-facet-key', pair.field);
        category.appendChild(list); 
        list.addEventListener('change', function () {
            if (this.value) {
                widget.setFacet(list.getAttribute('data-tess-facet-key'), this.value);
            } else {
                widget.clearFacet(list.getAttribute('data-tess-facet-key'));
            }
        });
        self.dropdowns[pair.field] = list;

        self.container.appendChild(category);
    });
};

FacetDropdowns.prototype.render = function (errors, data, response) {
    for (var key in data.meta['available-facets']) {
        if (data.meta['available-facets'].hasOwnProperty(key) && this.dropdowns.hasOwnProperty(key)) {
            this.renderFacet(this.container, key, data.meta['available-facets'][key], (data.meta['facets'][key] || []));
        }
    }
};

FacetDropdowns.prototype.renderFacetOption = function (container, active, key, value, count) {
    var option = document.createElement('option');
    var text = value || '(any)';

    if (!active && count) {
        text += ' (' + count + ')';
    }

    option.className = 'tess-facet-option' + (active ? ' active' : '');
    option.value = value;
    option.appendChild(document.createTextNode(text));

    container.appendChild(option);
};

FacetDropdowns.prototype.renderFacet = function (container, key, availableFacets, activeFacets) {
    var list = this.dropdowns[key];
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    var self = this;
    // Render a blank option.
    self.renderFacetOption(list, !activeFacets.length, '', '');
    list.value = ''; // Select the blank option to begin with

    // Render the active facets first so they appear at the top.
    activeFacets.forEach(function (val) {
        self.renderFacetOption(list, true, key, val);
        list.value = val; // Select the facet in the dropdown
    });
    availableFacets.forEach(function (row) {
        // Don't render active facets twice, or blank values
        if (!activeFacets.includes(row.value) && row.value) {
            self.renderFacetOption(list, false, key, row.value, row.count);
        }
    });
};

module.exports = FacetDropdowns;
