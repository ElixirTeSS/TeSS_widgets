'use strict';
var Util = require('../util.js');

var fieldRenderers = {
    location: function (event) {
        var city = event.attributes['city'];
        var country = event.attributes['country'];

        if ((event.attributes['city'] !== 'null') && (event.attributes['country'] !== 'null')) {
            city = event.attributes['city'] + ', ';
        }
        if (event.attributes['city'] === 'null') {
            city = '';
        }
        if (event.attributes['country'] === 'null' ) {
            country = '';
        }

        return city + country;
    }
};

function TableRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
    this.options.fields = this.options.fields ||
        [{ name: 'Date', field: 'start' },
            { name: 'Name', field: 'title' },
            // { name: 'Organizer', field: 'organizer' },
            { name: 'Location', field: 'location' }]
}

TableRenderer.prototype.initialize = function () { };

TableRenderer.prototype.render = function (errors, data, response) {
    // Render results
    this.renderEvents(this.container, data.data);

    // Render TeSS link
    var tessLinkContainer = document.createElement('p');
    var tessLink = document.createElement('a');
    tessLink.href = response.req.url;
    tessLink.appendChild(document.createTextNode('View your results on TeSS'));
    tessLinkContainer.appendChild(tessLink);
    this.container.appendChild(tessLinkContainer);
};

TableRenderer.prototype.renderEvent = function (container, event) {
    var eventRow = container.insertRow();

    var widget = this.widget;
    this.options.fields.forEach(function (fieldPair) {
        var field = fieldPair.field;
        var value = event.attributes[field];
        var valueNode;

        if (fieldRenderers.hasOwnProperty(field)) {
            value = fieldRenderers[field](event);
            valueNode = document.createTextNode(value);
        } else if (value instanceof Date) {
            valueNode = document.createTextNode(Util.formatDate(value));
        } else if (field === 'title') {
            valueNode = document.createElement('a');
            var redirectUrl = (event.links['self'] + '/redirect?widget=' + widget.name); // TODO: Fix me when 'redirect' link is available through API
            valueNode.href = widget.buildUrl(redirectUrl);
            valueNode.target = '_blank';
            valueNode.appendChild(document.createTextNode(value));
        } else if (value === null || value === 'null') {
            valueNode = document.createTextNode('');
        } else {
            valueNode = document.createTextNode(value);
        }

        var cell = eventRow.insertCell();
        cell.appendChild(valueNode);
    });
};

TableRenderer.prototype.renderEvents = function (container, events) {
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
    this.options.fields.forEach(function (fieldPair) {
        var heading = fieldPair.name;
        var cell = document.createElement('th');
        cell.appendChild(document.createTextNode(heading));
        headingRow.appendChild(cell);
    });

    // Events
    var self = this;
    events.forEach(function (event) {
        self.renderEvent(body, event);
    });
};

module.exports = TableRenderer;
