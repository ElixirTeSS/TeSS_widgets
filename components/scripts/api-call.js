// At least temporarily, wrap in self-invoking function to keep variables
// in local scope.
(function () {
    'use strict';

    // Variables
    var tessApi = require('tess_json_api');
    var api = new tessApi.DefaultApi();
    var locale = getLocale();
    var dateFormat = { year: 'numeric', month: 'long', day: 'numeric' };

    // Elements
    var container = document.getElementById('tess-list-widget');

    var facetsContainer = document.createElement('div');
    facetsContainer.className = 'tess-facets';

    var wrapper = document.createElement('div');
    wrapper.className = 'tess-wrapper';

    var widgetTitle = document.createElement('h1');
    widgetTitle.appendChild(document.createTextNode('Events'));

    var resultsContainer = document.createElement('div');
    resultsContainer.className = 'tess-results';

    var activeFacetsContainer = document.createElement('div');
    activeFacetsContainer.className = 'tess-active-facets';

    wrapper.appendChild(widgetTitle);
    wrapper.appendChild(activeFacetsContainer);
    wrapper.appendChild(resultsContainer);
    container.appendChild(facetsContainer);
    container.appendChild(wrapper);


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

    function renderEvent(container, event) {
        var eventRow = container.insertRow();

        // Date
        var dateCell = eventRow.insertCell();
        dateCell.appendChild(document.createTextNode(formatDate(event.attributes['start'])));

        // Name
        var nameCell = eventRow.insertCell();
        var link = document.createElement('a');
        link.href = event.links['redirect'];
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
    }

    function renderEvents(container, events) {
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
        events.forEach(function (event) {
            renderEvent(body, event);
        });
    }

    function renderFacetRow(container, active, value, count) {
        var row = document.createElement('li');
        row.className = 'tess-facet-row' + (active ? ' active' : '');
        row.appendChild(document.createTextNode(value + (active ? '' : ' (' + count + ')')));
        row.setAttribute('data-tess-facet-value', value);
        row.setAttribute('data-tess-facet-active', active);

        container.appendChild(row);
    }

    function renderFacet(container, key, availableFacets, activeFacets) {
        var category = document.createElement('div');
        category.className = 'tess-facet';
        category.setAttribute('data-tess-facet-key', key);

        var title = document.createElement('h3');
        title.appendChild(document.createTextNode(humanize(key)));
        category.appendChild(title);

        var list = document.createElement('ul');
        category.appendChild(list);

        // Render the active facets first so they appear at the top.
        activeFacets.forEach(function (val) {
            renderFacetRow(list, true, val);
        });
        availableFacets.forEach(function (row) {
            // Don't render active facets twice!
            if (!activeFacets.includes(row.value)) {
                renderFacetRow(list, false, row.value, row.count);
            }
        });

        category.addEventListener('click', function (event) {
            var f = event.target.getAttribute('data-tess-facet-active') === 'true' ? removeFacet : applyFacet;
            f(this.getAttribute('data-tess-facet-key'), event.target.getAttribute('data-tess-facet-value'));
        });

        container.appendChild(category);
    }

    function renderActiveFacets(container, activeFacets, searchQuery) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        var generateActiveFacet = function (key, value) {
            var af = document.createElement('div');
            af.className = 'tess-active-facet';
            var afKey = document.createElement('strong');
            afKey.appendChild(document.createTextNode(humanize(key) + ': '));

            af.appendChild(afKey);

            var values = Array.isArray(value) ? value : [value];
            values.forEach(function (value, index) {
                var afVal = document.createElement('span');
                afVal.className = 'tess-active-facet-value';
                afVal.appendChild(document.createTextNode(value));
                af.appendChild(afVal);
                if (index < (values.length - 1))
                    af.appendChild(document.createTextNode(' or '));
            });

            return af;
        };

        if (searchQuery && searchQuery !== '') {
            container.appendChild(generateActiveFacet('Search Query', searchQuery));
        }

        for (var key in activeFacets) {
            container.appendChild(generateActiveFacet(key, activeFacets[key]));
        }
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
    function processReturnedData(error, data, response) {
        // Render facet sidebar
        while (facetsContainer.firstChild) {
            facetsContainer.removeChild(facetsContainer.firstChild);
        }
        for (var key in data.meta['available-facets']) {
            if (data.meta['available-facets'][key].length) {
                renderFacet(facetsContainer, key, data.meta['available-facets'][key], (data.meta['facets'][key] || []));
            }
        }

        // Render active facet bar
        renderActiveFacets(activeFacetsContainer, data.meta['facets'], data.meta['query']);

        // Render results
        renderEvents(resultsContainer, data.data);

        // Render TeSS link
        var tessLinkContainer = document.createElement('p');
        var tessLink = document.createElement('a');
        tessLink.href = response.req.url;
        tessLink.appendChild(document.createTextNode('View your results on TeSS'));
        tessLinkContainer.appendChild(tessLink);
        resultsContainer.appendChild(tessLinkContainer);
    }

    function getEvents(queryParameters) {
        api.eventsGet(queryParameters, processReturnedData);
    }

    getEvents(queryParameters);
}()); // End anonymous function
