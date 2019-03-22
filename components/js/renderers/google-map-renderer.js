'use strict';
const Renderer = require('./renderer.js');
const Util = require('../util.js');
const n = Util.makeElement;

/**
 * Events displayed on a Google Map.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 * @param {Object} options - Options for the renderer.
 * @param {Object[]} options.apiKey - The Google Maps API key.
 */
class GoogleMapRenderer extends Renderer {

    constructor (widget, element, options) {
        super(widget, element, options);
        this.markers = [];
    }

    initialize () {
        this.mapContainer = n('div', { className: 'tess-google-map' });
        this.container.appendChild(this.mapContainer);

        const googleMapScript = n('script', {
            src: 'https://maps.googleapis.com/maps/api/js?key=' + this.options.apiKey,
            onload: () => {
                this.map = new google.maps.Map(this.mapContainer, {
                    maxZoom: 12,
                    styles: [{
                        'featureType': 'poi',
                        'elementType': 'all'
                    }]
                });
                this.infoWindow = new google.maps.InfoWindow({ content: '' });
                if (this.queuedRender) {
                    this.queuedRender();
                }
            }
        });

        document.head.appendChild(googleMapScript);
    }

    render (errors, data, response) {
        // Queue render if map has not loaded yet
        if (!this.map) {
            this.queuedRender = () => { this.render(errors, data, response) };

            return;
        }
        // Clear bounds
        this.bounds = new google.maps.LatLngBounds();
        // Clear markers
        this.markers.forEach(function (marker) {
            marker.setMap(null);
        });
        this.markers = [];

        // Render events
        data.data.forEach((event) => { this.renderEvent(event) });

        this.map.fitBounds(this.bounds);
    }


    renderEvent (event) {
        const marker = new google.maps.Marker({
            map: this.map,
            position: {
                lat: parseFloat(event.attributes['latitude']),
                lng: parseFloat(event.attributes['longitude']) },
            title: event.attributes['title']
        });

        const redirectUrl = (event.links['self'] + '/redirect?widget=' + this.widget.identifier); // TODO: Fix me when 'redirect' link is available through API
        const info = n('div',
            n('a', { href: redirectUrl, target: '_blank' }, event.attributes['title']),
            n('br'), n('strong', 'Date:'),  Util.formatDate(event.attributes['start']),
            n('br'), n('strong', 'Location:'),  Util.fieldRenderers['location'](event),
            n('br'), n('strong', 'Organizer:'),  event.attributes['organizer']
        );

        google.maps.event.addListener(marker, 'click', () => {
            this.infoWindow.setContent(info);
            this.infoWindow.open(this.map, marker);
        });

        this.bounds.extend(marker.position);
        this.markers.push(marker);
    }

}

module.exports = GoogleMapRenderer;
