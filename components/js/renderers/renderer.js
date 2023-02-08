'use strict';

class Renderer {

    constructor(widget, element, options) {
        this.widget = widget;
        this.container = element;
        this.options = options || {};
        this.elements = {};
        this.renderers = {};
    }

    initialize () {
        this.eachRenderer(([key, value]) => { value.initialize() });
    };

    render (errors, data, response) {
        this.eachRenderer(([key, value]) => { value.render(errors, data, response) });
    };

    eachRenderer (f) {
        Object.entries(this.renderers).forEach(f);
    }

    static clear(el) {
        while (el.firstChild) { el.removeChild(el.firstChild); }
    }

}

module.exports = Renderer;
