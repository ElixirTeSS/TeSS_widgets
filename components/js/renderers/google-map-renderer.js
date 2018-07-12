'use strict';
var Util = require('../util.js');

/**
 * Events displayed on a Google Map.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 * @param {Object} options - Options for the renderer.
 * @param {Object[]} options.apiKey - The Google Maps API key.
 */
function GoogleMapRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
    this.markers = [];
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
            maxZoom: 12,
            styles: [{
                'featureType': 'poi',
                'elementType': 'all'
            }]
        });
        self.infoWindow = new google.maps.InfoWindow({content: ""});
        if (self.queuedRender) {
            self.queuedRender();
        }
    };

    document.head.appendChild(googleMapScript);
};

GoogleMapRenderer.prototype.render = function (errors, data, response) {
    // Queue render if map has not loaded yet
    if (!this.map) {
        this.queuedRender = function () {
            GoogleMapRenderer.prototype.render(errors, data, response);
        };

        return;
    }
    // Clear bounds
    this.bounds = new google.maps.LatLngBounds();
    // Clear markers
    this.markers.forEach(function (marker) {
        marker.setMap(null);
    });
    this.markers = [];

    // Events
    var events = data.data;
    var self = this;
    events.forEach(function (event) {
        self.renderEvent(event);
    });

    this.map.fitBounds(this.bounds);
};

GoogleMapRenderer.prototype.renderEvent = function (event) {
    var marker = new google.maps.Marker({
        map: this.map,
        position: { lat: parseFloat(event.attributes['latitude']),
                    lng: parseFloat(event.attributes['longitude']) },
        title: event.attributes['title']
    });

    var redirectUrl = (event.links['self'] + '/redirect?widget=' + this.widget.identifier); // TODO: Fix me when 'redirect' link is available through API
    var info = '<div>' +
        '<a href="'+ this.widget.buildUrl(redirectUrl) +'" target="_blank">' + event.attributes['title'] + '</a>' +
        '<br/><strong>Date:</strong> ' + Util.formatDate(event.attributes['start']) +
        '<br/><strong>Location:</strong> ' + Util.fieldRenderers['location'](event) +
        '<br/><strong>Organizer:</strong> ' + event.attributes['organizer'] + '</div>';

    var self = this;
    google.maps.event.addListener(marker, 'click', function () {
        self.infoWindow.setContent(info);
        self.infoWindow.open(self.map, marker);
    });

    this.bounds.extend(marker.position);
    this.markers.push(marker);
};

module.exports = GoogleMapRenderer;
