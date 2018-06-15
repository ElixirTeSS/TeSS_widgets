'use strict';
var Util = require('../util.js');
var SearchRenderer = require('./partials/search-renderer.js');

/**
 * Materials displayed in a simple bulletted list.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 */
function SimpleListRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.options.truncateLength = this.options.truncateLength || 160;
    this.container = element;
    this.elements = {};
    this.renderers = {};
}

SimpleListRenderer.prototype.initialize = function () {
    if (this.options.enableSearch) {
        this.elements.controls = document.createElement('div');
        this.elements.controls.className = 'tess-controls';
        this.elements.search = document.createElement('div');
        this.elements.search.className = 'tess-search';
        this.container.appendChild(this.elements.controls);
        this.elements.controls.appendChild(this.elements.search);

        this.renderers.search = new SearchRenderer(this.widget, this.elements.search);
        this.renderers.search.initialize();
    }

    this.elements.list = document.createElement('ul');
    this.container.appendChild(this.elements.list);
};

SimpleListRenderer.prototype.render = function (errors, data, response) {
    if (this.options.enableSearch)
        this.renderers.search.render(errors, data, response);

    // Clean up
    while (this.elements.list.firstChild) {
        this.elements.list.removeChild(this.elements.list.firstChild);
    }

    var self = this;
    data.data.forEach(function (item) {
        var li;
        if (item.type == 'events') {
            li = self.renderEvent(item);
        } else {
            li = self.renderMaterial(item);
        }

        self.elements.list.appendChild(li);
    });
};

SimpleListRenderer.prototype.renderEvent = function (event) {
    var li = document.createElement('li');

    var link = document.createElement('a');
    var redirectUrl = (event.links['self'] + '/redirect?widget=' + this.widget.identifier); // TODO: Fix me when 'redirect' link is available through API
    link.href = this.widget.buildUrl(redirectUrl);
    link.target = '_blank';
    link.appendChild(document.createTextNode(event.attributes['title']));

    li.appendChild(link);
    li.appendChild(document.createElement('br'));
    li.appendChild(document.createTextNode(Util.formatDate(event.attributes['start'])));

    return li;
};

SimpleListRenderer.prototype.renderMaterial = function (material) {
    var li = document.createElement('li');

    var link = document.createElement('a');
    link.href = material.attributes['url'];
    link.target = '_blank';
    link.appendChild(document.createTextNode(material.attributes['title']));

    li.appendChild(link);
    var descNode = document.createElement('div');
    var desc = material.attributes['short-description'];
    if (desc.length > this.options.truncateLength)
        desc = desc.substr(0, this.options.truncateLength - 1) + '&hellip;';

    descNode.innerHTML = desc;
    li.appendChild(descNode);

    return li;
};

module.exports = SimpleListRenderer;