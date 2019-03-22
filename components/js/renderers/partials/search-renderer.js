'use strict';
const Renderer = require('../renderer.js');
const Util = require('../../util.js');
const n = Util.makeElement;

class SearchRenderer extends Renderer {

    initialize () {
        this.field = n('input', { type: 'text' });

        const widget = this.widget;
        const field = this.field;

        this.field.addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {
                widget.search(this.value);
            }
        });

        this.button = n('button', 'Search');
        this.button.addEventListener('click', function (event) {
            event.preventDefault();
            widget.search(field.value);
            return false;
        });

        this.container.appendChild(this.field);
        this.container.appendChild(this.button);
    }

    render (errors, data, response) {
        this.field.value = data.meta.query;
    }

}

module.exports = SearchRenderer;
