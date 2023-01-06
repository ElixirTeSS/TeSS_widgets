'use strict';
const Marked = require('marked');

module.exports = {
    locale: function () {
        if (this._locale)
            return this._locale;

        if (navigator.languages !== undefined)
            this._locale = navigator.languages[0];
        else if (navigator.language !== undefined)
            this._locale = navigator.language;
        else
            this._locale = 'en-GB';

        return this._locale;
    },

    dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },

    /**
     * Formats a date.
     *
     * @param {String|Date} date
     * @param {Object} dateFormat
     * @return {String} Formatted date
     */
    formatDate: function (date, dateFormat) {
        return new Date(date).toLocaleDateString(this.locale(), dateFormat || this.dateFormat);
    },

    /**
     * Turns a JSON key-like string into a humanize version.
     *
     * @param {string} string - Computerized string
     * @return {String} Humanized string
     */
    humanize: function (string) {
        const stripped = string.toLowerCase().replace(/[_-]/, ' ');
        // Replace first character, and any character occurring after whitespace, with a capitalized version.
        return stripped.replace(/(^| )(\w)/g, function (x) {
            return x.toUpperCase();
        })
    },

    camelize: function (key) {
        return key.replace(/-/g, '_').
        replace('[]', '').
        replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
    },

    snakeize: function (key) {
        return key.replace(/-/g, '_').
        replace('[]', '').
        replace(/([a-z][A-Z])/g, function (g) { return g[0] + '-' + g[1].toLowerCase(); });
    },

    fieldRenderers: {
        location: function (event) {
            let city = event.attributes['city'];
            let country = event.attributes['country'];

            if ((event.attributes['city'] !== null) && (event.attributes['country'] !== null)) {
                city = event.attributes['city'] + ', ';
            }
            if (event.attributes['city'] === null) {
                city = '';
            }
            if (event.attributes['country'] === null ) {
                country = '';
            }

            return document.createTextNode(city + country);
        },
        description: function (event) {
            const container = document.createElement('div')
            container.className = 'tess-markdown';
            container.innerHTML = Marked.parse(event.attributes['description'])
            return container;
        }
    },

    makeElement: function (type, htmlPropsOrFirstChild, ...children) {
        const element = document.createElement(type);

        if (htmlPropsOrFirstChild) {
            if (htmlPropsOrFirstChild.constructor === Object) {
                if (htmlPropsOrFirstChild.data) {
                    Object.entries(htmlPropsOrFirstChild.data).forEach(
                        ([key, value]) => {
                            element.setAttribute(('data-' + key), value)
                        }
                    );
                }

                Object.assign(element, htmlPropsOrFirstChild);
            } else {
                children.unshift(htmlPropsOrFirstChild);
            }
        }

        children.forEach((child) => {
            element.appendChild((child instanceof HTMLElement) ? child : document.createTextNode(child));
        });

        return element;
    }
};
