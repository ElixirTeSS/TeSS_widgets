'use strict';
var Util = require('../util.js');

function ActiveFacetsRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
}

ActiveFacetsRenderer.prototype.initialize = function () { };

ActiveFacetsRenderer.prototype.render = function (errors, data, response) {
    this.renderActiveFacets(this.container, data.meta['facets']);
};

ActiveFacetsRenderer.prototype.renderActiveFacets = function (container, activeFacets) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    for (var key in activeFacets) {
        container.appendChild(this.generateActiveFacet(key, activeFacets[key]));
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
