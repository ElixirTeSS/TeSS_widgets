'use strict';
var Util = require('../util.js');

function SearchRenderer(widget, element, options) {
    this.widget = widget;
    this.options = options || {};
    this.container = element;
}

SearchRenderer.prototype.initialize = function () {
    this.field = document.createElement('input');
    this.field.type = 'text';

    // Closures!
    var field = this.field;
    var widget = this.widget;
    var performSearch = function () {
        widget.queryParameters.q = field.value;
        widget.getEvents();
    };

    this.field.addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            performSearch();
        }
    });

    this.button = document.createElement('button');
    this.button.innerText = 'Search';
    this.button.addEventListener('click', function (event) {
        event.preventDefault();
        performSearch();
        return false;
    });

    this.container.appendChild(this.field);
    this.container.appendChild(this.button);
};

SearchRenderer.prototype.render = function (errors, data, response) {
    this.field.value = data.meta.query;
};

module.exports = SearchRenderer;
