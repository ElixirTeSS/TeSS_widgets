'use strict';
const Renderer = require('../renderer.js');
const Util = require('../../util.js');
const n = Util.makeElement;

class ActiveFacetsRenderer extends Renderer {

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
            }
        });
    };

    render (errors, data, response) {
        Renderer.clear(this.container);

        this.container.appendChild(document.createTextNode('' + data.meta['results-count'] + ' results found'));

        const activeFacets = data.meta['facets'];
        for (const key in activeFacets) {
            if (activeFacets.hasOwnProperty(key)) {
                if (!this.options.allowedFacets || (this.options.allowedFacets.indexOf(key) !== -1)) {
                    this.container.appendChild(this.renderActiveFacet(key, activeFacets[key]));
                }
            }
        }
    }

    renderActiveFacet (key, value) {
        const af = n('div', { className: 'tess-active-facet' },
            n('strong', Util.humanize(key) + ': '));

        const values = Array.isArray(value) ? value : [value];
        values.forEach(function (value, index) {
            const afVal = n('a', { href: '#', className: 'tess-facet-row active', data: {
                    'tess-facet-key' : key,
                    'tess-facet-value' : value,
                    'tess-facet-active' : true
                }
            }, value);

            af.appendChild(afVal);
            if (index < (values.length - 1))
                af.appendChild(document.createTextNode(' or '));
        });

        return af;
    }

}

module.exports = ActiveFacetsRenderer;
