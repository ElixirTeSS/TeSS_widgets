'use strict';
const Marked = require('marked');

const Util = {
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
            container.className = 'tess-markdown tess-expandable';
            container.innerHTML = Marked.parse(event.attributes['description'])
            return container;
        }
    },

    bindExpandables: function (root, limit) {
        limit = limit || 200;
        const toggleExpand = function () {
            const div = this.parentElement.querySelector('.tess-expandable');
            if (this.innerHTML === '(Show more)') {
                div.classList.add('tess-expandable-open');
                div.classList.remove('tess-expandable-closed');
                div.style.maxHeight = '' + (parseInt(div.dataset.origHeight) + 80) + 'px';
                this.innerHTML = '(Show less)';
            } else {
                div.classList.remove('tess-expandable-open');
                div.classList.add('tess-expandable-closed');
                div.style.maxHeight = '' + limit + 'px';
                this.innerHTML = '(Show more)';
            }

            return false;
        }
        root.querySelectorAll('.tess-expandable').forEach((element) => {
            if (element.clientHeight > limit) {
                element.dataset.origHeight = element.clientHeight;
                element.style.maxHeight = '' + limit + 'px';
                element.classList.add('tess-expandable-closed');
                const btn = Util.makeElement('a', { className: 'tess-expandable-btn' }, '(Show more)');
                btn.addEventListener('click', toggleExpand);
                element.parentElement.appendChild(btn);
            }
        })
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
            element.appendChild((child instanceof Node) ? child : document.createTextNode(child));
        });

        return element;
    }
};

module.exports = Util;
