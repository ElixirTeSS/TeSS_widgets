var mimeType = 'application/vnd.api+json';

function LightTessClient(baseUrl) {
    this.baseUrl = baseUrl;    
}

LightTessClient.prototype.buildUrl = function (path) {
    return this.baseUrl + path; 
};

LightTessClient.prototype.eventsGet = function (params, callback) {
    var xhr = new XMLHttpRequest();
    var path = '/events';
    var firstParam = true;
    var actualParams = Object.assign(params, params.facets || {});

    for (param in actualParams) {
        if (actualParams.hasOwnProperty(param) && param !== 'facets') {
            var p = Array.isArray(actualParams[param]) ? actualParams[param] : [actualParams[param]];
            p.forEach(function (value) {
                path += firstParam ? '?' : '&';
                path += (param + '=' + value);
                firstParam = false;
            });
        }
    }
    xhr.open('GET', this.buildUrl(path));
    xhr.setRequestHeader('Accept', mimeType);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log(xhr.responseText);
            callback({}, JSON.parse(xhr.responseText), xhr.responseText);
        } else {
            callback(JSON.parse(xhr.responseText), {}, xhr.responseText);
        }
    };
    xhr.send();
};


module.exports = LightTessClient;
