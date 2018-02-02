'use strict';
var Util = require('../../util.js');

function ActiveFacetsRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
}

ActiveFacetsRenderer.prototype.initialize = function () {
    var widget = this.widget;
    this.container.addEventListener('click', function (event) {
        if (event.target.hasAttribute('data-tess-facet-key')) {
            var f = event.target.getAttribute('data-tess-facet-active') === 'true' ? widget.removeFacet : widget.addFacet;
            f.bind(widget)(event.target.getAttribute('data-tess-facet-key'), event.target.getAttribute('data-tess-facet-value'));
        }
    });
};

ActiveFacetsRenderer.prototype.render = function (errors, data, response) {
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }

    this.container.appendChild(document.createTextNode('' + data.meta['results-count'] + ' events found'));
    this.renderActiveFacets(this.container, data.meta['facets']);
};

ActiveFacetsRenderer.prototype.renderActiveFacets = function (container, activeFacets) {
    for (var key in activeFacets) {
        if (activeFacets.hasOwnProperty(key)) {
            if (!this.options.allowedFacets || (this.options.allowedFacets.indexOf(key) !== -1)) {
                container.appendChild(this.generateActiveFacet(key, activeFacets[key]));
            }
        }
    }
};

ActiveFacetsRenderer.prototype.generateActiveFacet = function (key, value) {
    var af = document.createElement('div');
    af.className = 'tess-active-facet';
    var afKey = document.createElement('strong');
    afKey.appendChild(document.createTextNode(Util.humanize(key) + ': '));

    af.appendChild(afKey);

    var values = Array.isArray(value) ? value : [value];
    values.forEach(function (value, index) {
        var afVal = document.createElement('a');
        afVal.href = '#';
        afVal.className = 'tess-facet-row active';

        afVal.appendChild(document.createTextNode(value));
        afVal.setAttribute('data-tess-facet-key', key);
        afVal.setAttribute('data-tess-facet-value', value);
        afVal.setAttribute('data-tess-facet-active', true);

        af.appendChild(afVal);
        if (index < (values.length - 1))
            af.appendChild(document.createTextNode(' or '));
    });

    return af;
};

module.exports = ActiveFacetsRenderer;
