'use strict';

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
     * @param {String or Date object} date
     * @return {String} Formatted date
     */
    formatDate: function (date, dateFormat) {
        var parsedDate = new Date(date);

        return parsedDate.toLocaleDateString(locale, dateFormat || this.dateFormat);
    },

    /**
     * Turns a JSON key-like string into a humanize version.
     *
     * @param {string} Computerized string
     * @return {String} Humanized string
     */
    humanize: function (string) {
        var stripped = string.toLowerCase().replace(/[_-]/, ' ');
        // Replace first character, and any character occurring after whitespace, with a capitalized version.
        return stripped.replace(/(^| )(\w)/g, function (x) {
            return x.toUpperCase();
        })
    }
};
