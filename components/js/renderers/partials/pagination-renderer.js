'use strict';
const Renderer = require('../renderer.js');
const Util = require('../../util.js');
const n = Util.makeElement;

class PaginationRenderer extends Renderer {

    initialize () {
        const widget = this.widget;
        this.container.addEventListener('click', function (event) {
            event.preventDefault();
            if (event.target.hasAttribute('data-tess-page')) {
                widget.setPage(event.target.getAttribute('data-tess-page'));
            }
        });
    }

    render (errors, data, response) {
        Renderer.clear(this.container);

        if (data.links.first || data.links.prev || data.links.next || data.links.last)
            this.container.appendChild(document.createTextNode('Page: '));

        if (data.links.first)
            this.container.appendChild(this.pageLink('First', data.links.first));
        if (data.links.prev)
            this.container.appendChild(this.pageLink('Previous', data.links.prev));
        if (data.links.next)
            this.container.appendChild(this.pageLink('Next', data.links.next));
        if (data.links.last)
            this.container.appendChild(this.pageLink('Last', data.links.last));
    }

    pageLink (title, path) {
        // Strip the actual page number out from the path
        const page = (path.match(/page%5Bnumber%5D=([0-9]+)/) || path.match(/page_number=([0-9]+)/))[1];
        return n('a', { href: '#', className: 'tess-pagination-link', data: { 'tess-page' : page } }, title);
    }

}

module.exports = PaginationRenderer;
