'use strict';
const Renderer = require('../renderer.js');
const Util = require('../../util.js');
const n = Util.makeElement;

class FacetsSidebarRenderer extends Renderer {

    initialize () {
        const widget = this.widget;
        this.container.addEventListener('click', function (event) {
            event.preventDefault();
            if (event.target.hasAttribute('data-tess-facet-key')) {
                const key = event.target.getAttribute('data-tess-facet-key');
                const value = event.target.getAttribute('data-tess-facet-value');

                if (event.target.getAttribute('data-tess-facet-active') === 'true') {
                    widget.removeFacet(key, value);
                } else {
                    widget.addFacet(key, value);
                }
            } else if (event.target.classList.contains('tess-facet-expander')) {
                const facet = event.target.closest('.tess-facet');
                if (facet.classList.contains('tess-facet-expanded')) {
                    event.target.innerText = 'More...';
                    facet.classList.remove('tess-facet-expanded');
                } else {
                    event.target.innerText = 'Less';
                    facet.classList.add('tess-facet-expanded');
                }
            }
        });
    };

    render (errors, data, response) {
        Renderer.clear(this.container);

        let anyFacets = false;
        for (const key in data.meta['available-facets']) {
            if (data.meta['available-facets'].hasOwnProperty(key)) {
                if (!this.options.allowedFacets || (this.options.allowedFacets.indexOf(key) !== -1)) {
                    if (data.meta['available-facets'][key].length) {
                        anyFacets = true;
                        this.renderFacet(this.container, key, data.meta['available-facets'][key], (data.meta['facets'][key] || []));
                    }
                }
            }
        }

        if (!anyFacets) {
            this.container.appendChild(n('span', 'No filters available'));
        }
    }

    renderFacetRow (container, active, key, value, count, hidden) {
        const row = n('a',
            { href: '#',
                className: 'tess-facet-row' + (active ? ' active' : ''),
                title:  (active ? 'Remove' : 'Add') + ' filter for ' + value,
                data: {
                    'tess-facet-key' : key,
                    'tess-facet-value' : value,
                    'tess-facet-active' : active
                }
            },
            n('span', { className: 'tess-facet-row-value' }, value));

        if (!active) {
            row.appendChild(n('span', { className: 'tess-facet-row-count' }, count));
        }

        container.appendChild(n('li', {  className: (hidden ? 'hidden' : '') }, row));
    }

    renderFacet (container, key, availableFacets, activeFacets) {
        const list = n('ul');
        // Render the active facets first so they appear at the top.
        activeFacets.forEach((val) => {
            this.renderFacetRow(list, true, key, val);
        });
        const facetOptionLimit = this.options.facetOptionLimit || 10000;
        let facetOptionCount = 0;
        availableFacets.forEach((row) => {
            // Don't render active facets twice, or blank values
            if (!activeFacets.includes(row.value) && row.value) {
                this.renderFacetRow(list, false, key, row.value, row.count, (facetOptionCount++ >= facetOptionLimit));
            }
        });

        if (facetOptionCount > facetOptionLimit) {
            list.appendChild(n('li', n('a', { href: '#', className: 'tess-facet-expander' }, 'More...')));
        }

        container.appendChild(
            n('div', { className: 'tess-facet', data: { 'tess-facet-key' : key } },
                n('div', { className: 'tess-facet-title' }, Util.humanize(key)),
                list
            )
        );
    }

}

module.exports = FacetsSidebarRenderer;
