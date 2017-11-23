function TableRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
    this.elements = {};
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

    // Date
    var dateCell = eventRow.insertCell();
    dateCell.appendChild(document.createTextNode(this.widget.formatDate(event.attributes['start'])));

    // Name
    var nameCell = eventRow.insertCell();
    var link = document.createElement('a');
    var redirectUrl = (event.links['self'] + '/redirect?widget=' + this.widget.name); // TODO: Fix me when 'redirect' link is available through API
    link.href = this.widget.buildUrl(redirectUrl);

    link.target = '_blank';
    link.appendChild(document.createTextNode(event.attributes['title']));
    nameCell.appendChild(link);

    // Location
    var locCell = eventRow.insertCell();
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
    locCell.appendChild(document.createTextNode(city + country));
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
    ['Date', 'Name', 'Location'].forEach(function (heading) {
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
