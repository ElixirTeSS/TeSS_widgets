// At least temporarily, wrap in self-invoking function to keep variables
// in local scope.
(function () {

    'use strict';

    // Variables
    var tessApi = require('tess_json_api');
    var api = new tessApi.DefaultApi();
    var container = document.getElementById('tess-list-widget');
    var facetsContainer = document.createElement('div');
    facetsContainer.className = 'tess-facets';
    var wrapper = document.createElement('div');
    wrapper.className = 'tess-wrapper';
    wrapper.innerHTML = '<h1>Events</h1>';
    var resultsContainer = document.createElement('div');
    resultsContainer.className = 'tess-results';
    var activeFacetsContainer = document.createElement('div');
    activeFacetsContainer.className = 'tess-active-facets';
    resultsContainer.appendChild(activeFacetsContainer);
    wrapper.appendChild(resultsContainer);
    container.appendChild(facetsContainer);
    container.appendChild(wrapper);

    var locale = getLocale();
    var dateFormat = { year: 'numeric', month: 'long', day: 'numeric' };

    // Capture the query parameters
    // See lib/api/EventsApi.js for full params options.
    // TO-DO: Put default query parameters into a 'settings' file?
    var queryParameters = {
        "q": "Python",
        facets: { "country[]": ["Belgium",  "United Kingdom"] }
    };

    function getLocale() {
        if (navigator.languages !== undefined)
            return navigator.languages[0];
        else if (navigator.language !== undefined)
            return navigator.language;
        else
            return 'en-GB';
    }

    /**
     * Formats a date.
     *
     * @param {String or Date object} date
     * @return {String} Formatted date
     */
    function formatDate(date) {
        var parsedDate = new Date(date);

        return parsedDate.toLocaleDateString(locale, dateFormat);
    }

    function humanize(string) {
        var stripped = string.toLowerCase().replace('-', ' ');
        // Replace first character, and any character occurring after whitespace, with a capitalized version.
        return stripped.replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });
    }

    function renderFacetRow(container, active, value, count) {
        var row = document.createElement('li');
        row.className = 'tess-facet-row' + (active ? ' active' : '');
        row.innerHTML = value + (active ? '' : ' (' + count + ')');
        row.setAttribute('data-tess-facet-value', value);
        row.setAttribute('data-tess-facet-active', active);

        container.appendChild(row);
    }

    function renderFacet(container, key, available, active) {
        var category = document.createElement('div');
        category.className = 'tess-facet';
        category.innerHTML = '<h3>' + humanize(key) + '</h3>';
        category.setAttribute('data-tess-facet-key', key);
        var list = document.createElement('ul');
        category.appendChild(list);

        // Render the active facets first so they appear at the top.
        active.forEach(function (val) {
            renderFacetRow(list, true, val);
        });
        available.forEach(function (row) {
            // Don't render active facets twice!
            if (!active.includes(row.value)) {
                renderFacetRow(list, false, row.value, row.count);
            }
        });

        category.addEventListener('click', function (event) {
            var f = event.target.getAttribute('data-tess-facet-active') === 'true' ? removeFacet : applyFacet;
            f(this.getAttribute('data-tess-facet-key'), event.target.getAttribute('data-tess-facet-value'));
        });

        container.appendChild(category);
    }

    function applyFacet(key, value) {
        var actualKey = key.replace(/-/g, '_') + '[]';

        if (!queryParameters.facets[actualKey]) {
            queryParameters.facets[actualKey] = [];
        }

        if (!queryParameters.facets[actualKey].includes(value)) {
            queryParameters.facets[actualKey].push(value);
        }

        getEvents(queryParameters);
    }

    function removeFacet(key, value) {
        console.log("Removing: ", key, value);
        var actualKey = key.replace(/-/g, '_') + '[]';

        if (!queryParameters.facets[actualKey])
            return;

        var index = queryParameters.facets[actualKey].indexOf(value);

        if (index !== -1) {
            queryParameters.facets[actualKey].splice(index, 1);
        }

        if (!queryParameters.facets[actualKey].length) {
            delete queryParameters.facets[actualKey];
        }

        getEvents(queryParameters);
    }

    // Process returned data, print the HTML (callback function)
    // TO-DO: Create variables that are printed into a separate template?
    // i.e. pull the HTML out of here.
    function processReturnedData(error, data, response){
        facetsContainer.innerHTML = '';

        for (var key in data.meta['available-facets']) {
            if (data.meta['available-facets'][key].length) {
                renderFacet(facetsContainer, key, data.meta['available-facets'][key], (data.meta['facets'][key] || []));
            }
        }

        var html = '';
        if (data.meta['query'] && data.meta['query'] !== '') {
            html += '<strong>Search terms:</strong> "' + data.meta['query'] + '"<br/>';
        }

        for (var key in data.meta['facets']) {
            html += '<strong>' + humanize(key) + ':</strong> ';
            (data.meta['facets'][key] || []).forEach(function (activeFacet, index) {
                html += '"' + activeFacet + '"';
                if (index !== (data.meta['facets'][key].length - 1))
                    html += ' or ';
            });
            html += '</br>';
        }

        activeFacetsContainer.innerHTML = html;

        html = '';
        html += '<table><tr><th>Date</th><th>Name</th><th>Location</th></tr>';
        data.data.forEach(function(event){
            var attributes = event.attributes;
            html += '<tr><td>' + formatDate(attributes['start']) + '</td>';
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
        resultsContainer.innerHTML = html;
    }

    function getEvents(queryParameters) {
        api.eventsGet(queryParameters, processReturnedData);
    }

    getEvents(queryParameters);
}()); // End anonymous function
