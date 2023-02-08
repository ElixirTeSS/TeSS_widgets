'use strict';
const Renderer = require('../renderer.js');
const Util = require('../../util.js');
const n = Util.makeElement;

class FacetDropdownsRenderer extends Renderer {

    constructor (widget, element, options) {
        super(widget, element, options);
        this.options.dropdowns = this.options.dropdowns || [
            { name: 'Event Type', field: 'event-types' },
            { name: 'Country', field: 'country' } ];
    }

    initialize () {
        const widget = this.widget;
        this.dropdowns = {};

        // Create empty <select>s for each category.
        this.options.dropdowns.forEach((pair) => {
            // dropdown
            const list = n('select', { data: { 'tess-facet-key' : pair.field }});
            list.addEventListener('change', function () {
                if (this.value) {
                    widget.setFacet(list.getAttribute('data-tess-facet-key'), this.value);
                } else {
                    widget.clearFacet(list.getAttribute('data-tess-facet-key'));
                }
            });
            this.dropdowns[pair.field] = list;

            this.container.appendChild(
                n('div', { className: 'tess-facet' },
                    n('div', { className: 'tess-facet-title' }, pair.name),
                    list
                )
            );
        });
    }

    render (errors, data, response) {
        for (const key in data.meta['available-facets']) {
            if (data.meta['available-facets'].hasOwnProperty(key) && this.dropdowns.hasOwnProperty(key)) {
                this.renderFacet(this.container, key, data.meta['available-facets'][key], (data.meta['facets'][key] || []));
            }
        }
    };

    renderFacetOption (container, active, key, value, count) {
        let text = value || '(any)';
        if (!active && count) {
            text += ' (' + count + ')';
        }

        container.appendChild(
            n('option', { value: value, className: 'tess-facet-option' + (active ? ' active' : '') }, text)
        );
    }

    renderFacet (container, key, availableFacets, activeFacets) {
        const list = this.dropdowns[key];
        Renderer.clear(list);

        // Render a blank option.
        this.renderFacetOption(list, !activeFacets.length, '', '');
        list.value = ''; // Select the blank option to begin with

        // Render the active facets first so they appear at the top.
        activeFacets.forEach((val) => {
            this.renderFacetOption(list, true, key, val);
            list.value = val; // Select the facet in the dropdown
        });

        availableFacets.forEach((row) => {
            // Don't render active facets twice, or blank values
            if (!activeFacets.includes(row.value) && row.value) {
                this.renderFacetOption(list, false, key, row.value, row.count);
            }
        });
    }

}

module.exports = FacetDropdownsRenderer;
