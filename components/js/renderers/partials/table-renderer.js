'use strict';
const Renderer = require('../renderer.js');
const Util = require('../../util.js');
const n = Util.makeElement;

class TableRenderer extends Renderer {

    constructor (widget, element, options) {
        super(widget, element, options);
        this.options.columns = this.options.columns ||
            [{ name: 'Date', field: 'start' },
                { name: 'Name', field: 'title' },
                { name: 'Location', field: 'location' }]
        this.options.descriptionSizeLimit = this.options.descriptionSizeLimit || 120;
    }

    render (errors, data, response) {
        Renderer.clear(this.container);

        // Headings
        const head = n('thead');
        const headingRow = head.insertRow();
        this.options.columns.forEach(function (fieldPair) {
            headingRow.appendChild(n('th', fieldPair.name));
        });

        // Resources
        const body = n('tbody');
        data.data.forEach((resource) => { this.renderResource(body, resource) });

        this.container.appendChild(n('table', head, body));
        Util.bindExpandables(this.container, this.options.descriptionSizeLimit); // Needs to be called after all expandable elements are in the DOM.
    }

    renderResource (container, resource) {
        const row = container.insertRow();

        const widget = this.widget;
        this.options.columns.forEach(function (fieldPair) {
            const field = fieldPair.field;
            let value = resource.attributes[field];
            let valueNode;

            if (Util.fieldRenderers.hasOwnProperty(field)) {
                valueNode = Util.fieldRenderers[field](resource);
            } else if (value instanceof Date) {
                valueNode = document.createTextNode(Util.formatDate(value));
            } else if (field === 'title') {
                let url;
                if (resource.type === 'events') {
                    url = widget.buildUrl(resource.links['self'] + '/redirect?widget=' + widget.identifier); // TODO: Fix me when 'redirect' link is available through API
                } else {
                    url = resource.attributes['url'];
                }
                valueNode = n('a', { href: url, target: '_blank' }, value);
            } else if (value === null || value === 'null') {
                valueNode = document.createTextNode('');
            } else {
                valueNode = document.createTextNode(value);
            }

            row.insertCell().appendChild(valueNode);
        });
    }

}

module.exports = TableRenderer;
