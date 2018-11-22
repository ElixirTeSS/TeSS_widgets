'use strict';

function PaginationRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
}

PaginationRenderer.prototype.initialize = function () {
    var widget = this.widget;
    this.container.addEventListener('click', function (event) {
        event.preventDefault();
        if (event.target.hasAttribute('data-tess-page')) {
            widget.setPage(event.target.getAttribute('data-tess-page'));
        }
    });
};

PaginationRenderer.prototype.render = function (errors, data, response) {
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }

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
};

PaginationRenderer.prototype.pageLink = function (title, path) {
    // Strip the actual page number out from the path
    var page = (path.match(/page%5Bnumber%5D=([0-9]+)/) || path.match(/page_number=([0-9]+)/))[1];
    var link = document.createElement('a');
    link.className = 'tess-pagination-link';
    link.href = '#';
    link.setAttribute('data-tess-page', page);
    link.appendChild(document.createTextNode(title));

    return link;
};

module.exports = PaginationRenderer;
