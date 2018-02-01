'use strict';
var Util = require('../util.js');

function GoogleMapRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
}

GoogleMapRenderer.prototype.initialize = function () {
    this.mapContainer = document.createElement('div');
    this.mapContainer.className = 'tess-google-map';
    this.container.appendChild(this.mapContainer);

    var googleMapScript = document.createElement('script');
    googleMapScript.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.options.apiKey;
    var self = this;
    googleMapScript.onload = function () {
        self.map = new google.maps.Map(self.mapContainer, {
            zoom: self.options.zoom,
            center: { lat: self.options.lat, lng: self.options.lon },
            styles: [{
                'featureType': 'poi',
                'elementType': 'all'
            }]
        });
        self.infoWindow = new google.maps.InfoWindow({content: ""});
    };

    document.head.appendChild(googleMapScript);
};

GoogleMapRenderer.prototype.render = function (errors, data, response) {
    // Render results
    this.renderEvents(this.container, data.data);
};

GoogleMapRenderer.prototype.renderEvent = function (event) {
    var marker = new google.maps.Marker({
        map: this.map,
        position: { lat: parseFloat(event.attributes['latitude']),
                    lng: parseFloat(event.attributes['longitude']) },
        title: event.attributes['title']
    });
    var self = this;
    var info = '<div><strong>Date:</strong> ' + Util.formatDate(event.attributes['start']) +
            '<br/><strong>Location:</strong> ' + Util.fieldRenderers['location'](event) +
        '<br/><strong>Organizer:</strong> ' + event.attributes['organizer'];
    google.maps.event.addListener(marker, 'click', function () {
        self.infoWindow.setContent(info);
        self.infoWindow.open(self.map, marker);
    });
};

GoogleMapRenderer.prototype.renderEvents = function (container, events) {
    // Events
    var self = this;
    events.forEach(function (event) {
        self.renderEvent(event);
    });
};

module.exports = GoogleMapRenderer;
