'use strict';
var Util = require('../../util.js');

function TableRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
    this.options.columns = this.options.columns ||
        [{ name: 'Date', field: 'start' },
         { name: 'Name', field: 'title' },
         { name: 'Location', field: 'location' }]
}

TableRenderer.prototype.initialize = function () { };

TableRenderer.prototype.render = function (errors, data, response) {
    // Render results
    this.renderResources(this.container, data.data);
};

TableRenderer.prototype.renderResource = function (container, resource) {
    var resourceRow = container.insertRow();

    var widget = this.widget;
    this.options.columns.forEach(function (fieldPair) {
        var field = fieldPair.field;
        var value = resource.attributes[field];
        var valueNode;

        if (Util.fieldRenderers.hasOwnProperty(field)) {
            value = Util.fieldRenderers[field](resource);
            valueNode = document.createTextNode(value);
        } else if (value instanceof Date) {
            valueNode = document.createTextNode(Util.formatDate(value));
        } else if (field === 'title') {
            valueNode = document.createElement('a');
            var url;
            if (resource.type === 'events') {
                url = widget.buildUrl(resource.links['self'] + '/redirect?widget=' + widget.identifier); // TODO: Fix me when 'redirect' link is available through API
            } else {
                url = resource.attributes['url'];
            }
            valueNode.href = url;
            valueNode.target = '_blank';
            valueNode.appendChild(document.createTextNode(value));
        } else if (value === null || value === 'null') {
            valueNode = document.createTextNode('');
        } else {
            valueNode = document.createTextNode(value);
        }

        var cell = resourceRow.insertCell();
        cell.appendChild(valueNode);
    });
};

TableRenderer.prototype.renderResources = function (container, resources) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    var table = document.createElement('table');
    var head = document.createElement('thead');
    var body = document.createElement('tbody');
    table.appendChild(head);
    table.appendChild(body);
    container.appendChild(table);

    // Headings
    var headingRow = head.insertRow();
    this.options.columns.forEach(function (fieldPair) {
        var heading = fieldPair.name;
        var cell = document.createElement('th');
        cell.appendChild(document.createTextNode(heading));
        headingRow.appendChild(cell);
    });

    // Resources
    var self = this;
    resources.forEach(function (resource) {
        self.renderResource(body, resource);
    });
};

module.exports = TableRenderer;
