# TeSS widget
A JavaScript widget that can be embedded in a website to display events from [TeSS](https://tess.elixir-europe.org) 
in various forms.

The code makes use of the [TeSS JSON-API client](https://github.com/ElixirTeSS/tess-json-api-client).

## Usage
Live examples of the widget being used in various modes can be viewed here: https://elixirtess.github.io/TeSS_widgets/

## Background
TeSS is a portal for bioinformatics events, training courses and training materials. It is part of the [ELIXIR infrastructure](https://www.elixir-europe.org/), and gathers events from all around Europe.

The idea for the widget came from a need to share events across ELIXIR (see the [Plan for sharing events across ELIXIR](https://docs.google.com/document/d/1cKjLSinbYq35vShikS7xZjLefHikN1ZvPFoPPbvWq54/edit)).

Work started on the widget in October 2017 and we are aiming to follow the [specification](https://docs.google.com/document/d/1nrEY2UlY5VHF4EPY_SdnwUNY2XyozMXErtQEyWPkzZY/edit) written a while ago for the widget. The goal will be to present a simple 'copy and paste' version for people who are less familiar with coding websites, and a customisable version for developers.

## Development

### Install and run
First you'll need npm installed.

`git clone https://github.com/ElixirTeSS/TeSS_widgets.git`

`npm install`

`gulp`

### Renderers
Each TeSS widget has a renderer which controls how the widget is rendered as HTML, i.e. how the events/materials are
formatted, what controls are available to the user etc.

Several renderers are built-in, but a custom renderer can be defined by implementing the constructor and 2 functions defined below.

#### Constructor
A renderer must have a constructor that takes 3 arguments, `(widget, element, options)`:
 * `widget` is a reference to the TeSS widget object.
 * `element` is the HTML element into which the widget HTML should be rendered.
 * `options` is a set of renderer-specific options that allows the user to customize how the renderer behaves.

#### initialize()
A renderer must define an `initialize` function that takes 0 arguments. This function is called once when the Widget is
first loaded, but no data has been retrieved yet. 
Its intent is to create the static structure of the widget (tables, lists etc.).

#### render()
The `render` function is used to render new events/materials after data is fetched from the TeSS API. 
It takes 3 arguments, `(errors, data, response)`:
 * `errors` any errors that occurred.
 * `data` the JSON-API response document from TeSS.
 * `response` the response object.

### Example:
An example of a simple renderer to render a `<ul>` list of event titles:

```javascript
class MyCustomRenderer {
  constructor (widget, element, options) {
    this.widget = widget;
    this.element = element;
  }

  initialize () {
    const title = document.createElement('h1');
    title.innerText = "TeSS Events:"
    this.element.appendChild(title);
    this.list = document.createElement('ul');
    this.element.appendChild(this.list);
  }

  render (errors, data, response) {
    this.list.innerHTML = ''; // Clear out old events.
    data.data.forEach((event) => {
        const eventElement = document.createElement('li');
        eventElement.appendChild(document.createTextNode(event.attributes['title']));
        this.list.appendChild(eventElement);
    });
  }
}

TessWidget.Events(document.getElementById('my-container'), MyCustomRenderer, {});
```
