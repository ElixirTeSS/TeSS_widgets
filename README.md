# TeSS widget

A javascript widget you that can embed in a website and display events from [tess.elixir-europe.org](tess.elixir-europe.org).

## Background
TeSS is a portal for bioinformatics events, training courses and training materials. It is part of the [ELIXIR infrastructure](https://www.elixir-europe.org/), and gathers events from all around Europe.

The idea for the widget came from a need to share events across ELIXIR (see the [Plan for sharing events across ELIXIR](https://docs.google.com/document/d/1cKjLSinbYq35vShikS7xZjLefHikN1ZvPFoPPbvWq54/edit)).

## Status
Work started on the widget in October 2017 and we are aiming to follow the [specification](https://docs.google.com/document/d/1nrEY2UlY5VHF4EPY_SdnwUNY2XyozMXErtQEyWPkzZY/edit) written a while ago for the widget. The goal will be to present a simple 'copy and paste' version for people who are less familiar with coding websites, and a customisable version for developers.

The code makes use of the [TeSS JSON-API client](https://github.com/ElixirTeSS/tess-json-api-client).

## Usage
First you'll need npm installed.

`git clone https://github.com/ElixirTeSS/list_widget.git`

`npm install`

`gulp`
