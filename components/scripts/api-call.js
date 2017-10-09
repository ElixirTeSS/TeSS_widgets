
var app = require("biojs-rest-tessapi");
var api = new app.EventsApi(); // Allocate the API class we're going to use.
var resultsDiv = document.getElementById('results');
var startDate;
var eventDayOfMonth;
var eventMonth;
var eventYear;
var displayDate;
var dayName = new Array("Sunday","Monday","Tuesday","Wednesday", "Thursday",
  "Friday","Saturday");
var month = new Array("January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December");

api.eventsJsonGet (
	{
    "q": "RNA-SEQ",
		"country[]": ["United Kingdom"]
	}, //see lib/api/EventsApi.js for full params options
	function(error, data, response){
    html = '<h1>Events</h1>';
    html += '<table><tr><th>Date</th><th>Name</th><th>Location</th></tr>';
    data.forEach(function(value){
      // Refactor date conversion into a function/method
      // or use moment.js
      startDate = new Date(value['start']);
      eventDayOfMonth = startDate.getDay();
      eventMonth = month[startDate.getMonth()];
      eventYear = startDate.getFullYear();
      displayDate = eventDayOfMonth + ' ' + eventMonth + ' ' + eventYear;
      //eventDay = dayName[startDate.getDay()];
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
)
