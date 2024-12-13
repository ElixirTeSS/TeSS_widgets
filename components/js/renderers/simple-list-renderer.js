'use strict';
const Util = require('../util.js');
const n = Util.makeElement;
const Renderer = require('./renderer.js');
const SearchRenderer = require('./partials/search-renderer.js');

/**
 * Events/Materials displayed in a simple bulletted list.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 * @param {Object} options - Options for the renderer.
 * @param {boolean} options.enableSearch - Display a search field above the list.
 * @param {number} options.truncateLength - Truncate Material descriptions to this length.
 */
class SimpleListRenderer extends Renderer {

    constructor(widget, element, options) {
        super(widget, element, options);
        if (!this.options.truncateLength && this.options.truncateLength !== 0)
            this.options.truncateLength = 160;
    }

    initialize () {
        if (this.options.enableSearch) {
            const search = n('div', { className: 'tess-search' });
            const controls = n('div', { className: 'tess-controls' }, search);

            this.container.appendChild(controls);
            this.renderers.search = new SearchRenderer(this.widget, search);
        }

        this.elements.list = n('ul');
        this.container.appendChild(this.elements.list);

        super.initialize();
    };

    render (errors, data, response) {
        super.render(errors, data, response);

        Renderer.clear(this.elements.list);

        data.data.forEach((item) => {
            this.elements.list.appendChild((item.type === 'events') ? this.renderEvent(item) : this.renderMaterial(item))
        });
    };

    renderEvent (event) {
        const redirectUrl = this.widget.buildUrl(event.links['self'] + '/redirect?widget=' + this.widget.identifier); // TODO: Fix me when 'redirect' link is available through API

        return n('li',
            n('a', { href: redirectUrl, target: '_blank' }, event.attributes['title']),
            n('br'),
            Util.formatDate(event.attributes['start'])
        );
    };

    renderMaterial (material) {
        let desc = material.attributes['description'];
        if (this.options.truncateLength === 0) {
            desc = '';
        } else if (desc.length > this.options.truncateLength) {
            desc = desc.substr(0, this.options.truncateLength - 1) + '\u2026';
        }

        return n('li',
            n('a', { href: material.attributes['url'], target: '_blank' }, material.attributes['title']),
            n('div', desc)
        );
    };

}

module.exports = SimpleListRenderer;
