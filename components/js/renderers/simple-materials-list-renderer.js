'use strict';
var Util = require('../util.js');

/**
 * Materials displayed in a simple bulletted list.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 */
function SimpleMaterialsListRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.options.truncateLength = this.options.truncateLength || 160;
    this.container = element;
}

SimpleMaterialsListRenderer.prototype.initialize = function () {
    this.list = document.createElement('ul');
    this.container.appendChild(this.list);
};

SimpleMaterialsListRenderer.prototype.render = function (errors, data, response) {
    // Clean up
    while (this.list.firstChild) {
        this.list.removeChild(this.list.firstChild);
    }

    var self = this;
    data.data.forEach(function (material) {
        var li = document.createElement('li');

        var link = document.createElement('a');
        link.href = material.attributes['url'];
        link.target = '_blank';
        link.appendChild(document.createTextNode(material.attributes['title']));

        li.appendChild(link);
        var descNode = document.createElement('div');
        var desc = material.attributes['short-description'];
        if (desc.length > self.options.truncateLength)
            desc = desc.substr(0, self.options.truncateLength - 1) + '&hellip;';

        descNode.innerHTML = desc;
        li.appendChild(descNode);

        self.list.appendChild(li);
    });
};

module.exports = SimpleMaterialsListRenderer;