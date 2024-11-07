// A standalone file that globally exposes a single function to create and initialize a TessWidget object.
// Allows it to run in a browser without having to `require` anything.
const TessEventsWidget = require('./tess-events-widget.js');
const TessMaterialsWidget = require('./tess-materials-widget.js');
const renderers = {
    partials: {
        ActiveFacets: require('./renderers/partials/active-facets-renderer.js'),
        FacetDropdowns: require('./renderers/partials/facet-dropdowns-renderer.js'),
        FacetsSidebar: require('./renderers/partials/facets-sidebar-renderer.js'),
        Pagination: require('./renderers/partials/pagination-renderer.js'),
        Search: require('./renderers/partials/search-renderer.js'),
        Table: require('./renderers/partials/table-renderer.js'),
    },
    DropdownTable: require('./renderers/dropdown-table-renderer.js'),
    FacetedTable: require('./renderers/faceted-table-renderer.js'),
    GoogleMap: require('./renderers/google-map-renderer.js'),
    Renderer: require('./renderers/renderer.js'),
    SimpleList: require('./renderers/simple-list-renderer.js')
}
function CreateTessEventsWidget(element, renderer, options) {
    new TessEventsWidget(element, renderer, options).initialize();
}

function CreateTessMaterialsWidget(element, renderer, options) {
    new TessMaterialsWidget(element, renderer, options).initialize();
}

module.exports = { Events: CreateTessEventsWidget, Materials: CreateTessMaterialsWidget, Renderers: renderers };
