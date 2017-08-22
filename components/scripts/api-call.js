
var app = require("biojs-rest-tessapi");
var api = new app.EventsApi(); // Allocate the API class we're going to use.

api.eventsJsonGet(
	{
		"q": "RNA-SEQ",
		"country[]": ["United Kingdom", "Belgium"]
	}, //see lib/api/EventsApi.js for full params options
	function(error, data, response){
		console.log(data)
	}
)
