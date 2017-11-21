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
	function formatDate (date, dateFormat) {
		if (dateFormat=='long'){
			return moment(date).format('D MMMM YYYY');
		} else if (dateFormat=='short') {
			return moment(date).format('DD/MM/YYYY');
		} else {
			return moment(date).format('MM/DD/YYYY');
		}
	}

	/**
	 * Formats a date
	 * Provides a simpler and more lightweight option than formatDate() above,
	 * but at the cost of robustness and flexibility.
	 * Converts a date string into a Date object first.
	 *
	 * @param {String} date
	 * @param {String} dateFormat
	 * @return {String} Formatted date
*/
	function formatDate2(date, dateFormat) {
		var startDate;
		var eventDayOfMonth;
		var eventMonth;
		var eventYear;
		var displayDate;
		var dayName = new Array("Sunday","Monday","Tuesday","Wednesday", "Thursday",
		  "Friday","Saturday");
		var month = new Array("January", "February", "March", "April", "May", "June",
		  "July", "August", "September", "October", "November", "December");

		startDate = new Date(date);
		eventDayOfMonth = startDate.getDate();
		eventMonth = month[startDate.getMonth()];
		eventYear = startDate.getFullYear();

		if(dateFormat=='long') {
			displayDate = eventDayOfMonth + ' ' + eventMonth + ' ' + eventYear;
		} else if (dateFormat=='short'){
			displayDate = eventDayOfMonth + '/' + startDate.getMonth() + '/' + eventYear;
		} else {
			displayDate = eventDayOfMonth + ' ' + eventMonth + ' ' + eventYear;
		}

		return displayDate;
	}

	// Process returned data, print the HTML (callback function)
	// TO-DO: Create variables that are printed into a separate template?
	// i.e. pull the HTML out of here.
	function processReturnedData (error, data, response){
		html = '<h1>Events</h1>';
		html += '<table><tr><th>Date</th><th>Name</th><th>Location</th></tr>';
		data.data.forEach(function(event){
            var value = event.attributes;
			displayDate = formatDate(value['start'], 'long');
			html += '<tr><td>' + displayDate + '</td>';
			html += '<td><a href="' + value['url'] + '">';
			html += value['title'] + '</a></td>';
			if ((value['city'] !== 'null') && (value['country'] !== 'null')) {
				value['city'] = value['city'] + ', ';
			}
			if(value['city'] === 'null') {
				value['city'] = '';
			}
			if(value['country'] === 'null' ) {
				value['country'] = '';
			}
			html += '<td>' + value['city'] + value['country'] + '</td></tr>';
		})
		html += '</table>';
		html += '<p><a href="' + response.req.url + '">View your results on TeSS</a></p>';
		resultsDiv.innerHTML = html;
	}

	api.eventsGet(processReturnedData);
}()); // End anonymous function
