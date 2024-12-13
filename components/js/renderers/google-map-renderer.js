'use strict';
const Renderer = require('./renderer.js');
const Util = require('../util.js');
const n = Util.makeElement;
const MarkerClusterer = require("@googlemaps/markerclusterer").MarkerClusterer;

/**
 * Events displayed on a Google Map.
 *
 * @constructor
 * @param {Object} widget - The TeSS widget.
 * @param {Object} element - The element to contain the rendered table.
 * @param {Object} options - Options for the renderer.
 * @param {Object[]} options.apiKey - The Google Maps API key.
 * @param {Object[]} options.cluster - Whether to use marker cluster or not.
 * @param {Object[]} options.maxZoom - Maximum zoom level of the map.
 */
class GoogleMapRenderer extends Renderer {

    constructor (widget, element, options) {
        super(widget, element, options);
        this.options.maxZoom = this.options.maxZoom || 18;
        this.markers = [];
    }

    initialize () {
        this.mapContainer = n('div', { className: 'tess-google-map' });
        this.container.appendChild(this.mapContainer);

        const googleMapScript = n('script', {
            src: 'https://maps.googleapis.com/maps/api/js?key=' + this.options.apiKey,
            onload: () => {
                this.map = new google.maps.Map(this.mapContainer, {
                    maxZoom: this.options.maxZoom,
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
        this.markerSet = {};

        // Render events
        data.data.forEach((event) => { this.renderEvent(event) });

        this.markers.forEach((marker) => {
            google.maps.event.addListener(marker, 'click', (event) => {
                this.infoWindow.setContent(marker['content']);
                this.infoWindow.open(this.map, marker);
            });
        });

        this.map.fitBounds(this.bounds);

        if (this.options.cluster) {
            // Add a marker cluster to manage the markers
            const markerCluster = new MarkerClusterer({
                map: this.map,
                markers: this.markers,
                maxZoom: this.options.maxZoom
            });
        }
    }


    renderEvent (event) {
        const lat = parseFloat(event.attributes['latitude']);
        const lng = parseFloat(event.attributes['longitude'])

        if (!lat || !lng) { // Discard events with no location
            return;
        }
        const key = '' + lat + ',' + lng;
        if (!this.markerSet[key]) {
            this.markerSet[key] = new google.maps.Marker({
                map: this.map,
                position: { lat: lat, lng: lng },
                title: event.attributes['title'],
                content: ''
            })

            this.bounds.extend(this.markerSet[key].position);
            this.markers.push(this.markerSet[key]);
        }

        const redirectUrl = this.widget.buildUrl(event.links['self'] + '/redirect?widget=' + this.widget.identifier); // TODO: Fix me when 'redirect' link is available through API
        const info = n('div', { className: 'tess-map-info' },
            n('a', { href: redirectUrl, target: '_blank' }, event.attributes['title']));
        if (event.attributes['start']) {
            info.appendChild(
                n('div',
                    n('strong', 'Date: '),
                    Util.formatDate(event.attributes['start'])
                )
            );
        }

        if (event.attributes['city'] || event.attributes['country']) {
            info.appendChild(
                n('div',
                    n('strong', 'Location: '),
                    Util.fieldRenderers['location'](event)
                )
            );
        }

        if (event.attributes['organizer']) {
            info.appendChild(
                n('div',
                    n('strong', 'Organizer: '),
                    event.attributes['organizer']
                )
            );
        }

        this.markerSet[key]['content'] = this.markerSet[key]['content'] + info.outerHTML;
    }

}

module.exports = GoogleMapRenderer;
