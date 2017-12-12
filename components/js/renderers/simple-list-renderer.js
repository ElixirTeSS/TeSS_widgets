'use strict';
var Util = require('../util.js');

function SimpleListRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
}

SimpleListRenderer.prototype.initialize = function () {
    this.list = document.createElement('ul');
    this.container.appendChild(this.list);
};

SimpleListRenderer.prototype.render = function (errors, data, response) {
    // Clean up
    while (this.list.firstChild) {
        this.list.removeChild(this.list.firstChild);
    }

    var self = this;
    data.data.forEach(function (event) {
        var li = document.createElement('li');

        var link = document.createElement('a');
        var redirectUrl = (event.links['self'] + '/redirect?widget=' + self.widget.name); // TODO: Fix me when 'redirect' link is available through API
        link.href = self.widget.buildUrl(redirectUrl);
        link.target = '_blank';
        link.appendChild(document.createTextNode(event.attributes['title']));

        li.appendChild(link);
        li.appendChild(document.createElement('br'));
        li.appendChild(document.createTextNode(Util.formatDate(event.attributes['start'])));

        self.list.appendChild(li);
    });
};

module.exports = SimpleListRenderer;