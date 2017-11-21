// At least temporarily, wrap in self-invoking function to keep variables
// in local scope.
(function () {

	'use strict';

	// Variables
	var tessApi = require('tess_json_api');
	var api = new tessApi.DefaultApi();
	var moment = require('moment');
	var resultsDiv = document.getElementById('results');
	var displayDate;
	var html;

	// Capture the query parameters
	// See lib/api/EventsApi.js for full params options.
	// TO-DO: Put default query parameters into a 'settings' file?
	var queryParameters = {
		"q": "Python",
		"country[]": ["Belgium"]
	}

	/**
	 * Formats a date using moment.js
	 * Notice that moment.js can deal with dates as strings
	 * and dates as Javascript Date objects.
	 *
	 * @param {String or Date object} date
	 * @param {String} dateFormat
	 * @return {String} Formatted date
	 */
	function formatDate(date, dateFormat) {
		if (dateFormat=='long'){
			return moment(date).format('D MMMM YYYY');
		} else if (dateFormat=='short') {
			return moment(date).format('DD/MM/YYYY');
		} else {
			return moment(date).format('MM/DD/YYYY');
		}
	}

    function humanize(string) {
        var stripped = string.toLowerCase().replace('-', ' ');
        // Replace first character, and any character occurring after whitespace, with a capitalized version.
        return stripped.replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });
    }

	// Process returned data, print the HTML (callback function)
	// TO-DO: Create variables that are printed into a separate template?
	// i.e. pull the HTML out of here.
	function processReturnedData(error, data, response){
        console.log(data);

        var html = '<div class="tess-list-widget">';
        html += '<div class="tess-facets">';

        for (var key in data.meta['available-facets']) {
            html += '<div class="tess-facet">';
            html += '<h3>' + humanize(key) + '</h3>';
            html += '<ul>';
            data.meta['available-facets'][key].forEach(function (facet) {
                html += '<li>' + facet.value + ' (' + facet.count + ')</li>';
            });
            html += '</div>';
        }
        html += '</div>';
        html += '<div class="tess-results">';
        html += '<h1>Events</h1>';
		html += '<table><tr><th>Date</th><th>Name</th><th>Location</th></tr>';
		data.data.forEach(function(event){
            var attributes = event.attributes;
			displayDate = formatDate(attributes['start'], 'long');
			html += '<tr><td>' + displayDate + '</td>';
			html += '<td><a href="' + event.links.redirect + '">';
			html += attributes['title'] + '</a></td>';
			if ((attributes['city'] !== 'null') && (attributes['country'] !== 'null')) {
				attributes['city'] = attributes['city'] + ', ';
			}
			if(attributes['city'] === 'null') {
				attributes['city'] = '';
			}
			if(attributes['country'] === 'null' ) {
				attributes['country'] = '';
			}
			html += '<td>' + attributes['city'] + attributes['country'] + '</td></tr>';
		});
		html += '</table>';
		html += '<p><a href="' + response.req.url + '">View your results on TeSS</a></p>';
        html += '</div>';
		resultsDiv.innerHTML = html;
	}

	api.eventsGet({ q: 'python' }, processReturnedData);

    //

}()); // End anonymous function
