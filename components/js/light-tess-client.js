const Util = require('./util.js');

const mimeType = 'application/vnd.api+json';
const dateRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;

class LightTessClient {
    constructor (baseUrl) {
        this.baseUrl = baseUrl;
    }

    buildUrl (path) {
        return this.baseUrl + path;
    }

    eventsGet (params, callback) {
        return this.get('/events', params, callback);
    };

    materialsGet (params, callback) {
        return this.get('/materials', params, callback);
    };

    get (path, params, callback) {
        const xhr = new XMLHttpRequest(); // Not using fetch because it bloats bundle with polyfills
        const actualParams = Object.assign(params, params.facets || {});

        let firstParam = true;
        for (const param in actualParams) {
            if (actualParams.hasOwnProperty(param) && param !== 'facets') {
                let key = Util.snakeize(param);
                let p = actualParams[param];
                const addParam = (value) => {
                    path += firstParam ? '?' : '&';
                    path += (key + '=' + encodeURIComponent(value));
                    firstParam = false;
                }

                if (Array.isArray(p)) {
                    key = key + '[]';
                    p.forEach(addParam);
                } else {
                    addParam(p)
                }
              }
        }
        xhr.open('GET', this.buildUrl(path));
        xhr.setRequestHeader('Accept', mimeType);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = () => {
            const data = this.convertDates(JSON.parse(xhr.responseText));
            if (xhr.status === 200) {

                callback({}, data, xhr.responseText);
            } else {
                callback(data, {}, xhr.responseText);
            }
        };
        xhr.send();
    }

    convertDates (value) {
        if ((typeof value === 'string') && value.match(dateRegex)) {
            return new Date(value);
        } else if (Array.isArray(value)) {
            return value.map((v) => this.convertDates(v));
        } else if (typeof value === 'object' && value !== null) {
            const obj = {};
            for (const [k, v] of Object.entries(value)) {
                obj[k] = this.convertDates(v);
            }
            return obj;
        } else {
            return value
        }
    }
}

module.exports = LightTessClient;
