(function() {
    let template = document.createElement("template");
    var gPassedServiceType; // holds passed in guarantee of service - set in onCustomWidgetBeforeUpdate()
    var gPassedPortalURL; // ESRI Portal URL
    var gPassedAPIkey; // ESRI JS api key
    var gWebmapInstantiated = 0; // a global used in applying definition query
    var gMyLyr; // for sublayer
    var gMyWebmap; // needs to be global for async call to onCustomWidgetAfterUpdate()

    template.innerHTML = `
        <link rel="stylesheet" href="https://js.arcgis.com/4.18/esri/themes/light/main.css">
        <style>
        #mapview {
            width: 100%;
            height: 100%;
        }
        #timeSlider {
            position: absolute;
            left: 5%;
            right: 15%;
            bottom: 20px;
        }
        </style>
        <div id='mapview'></div>
        <div id='timeSlider'></div>
    `;

    // this function takes the passed in servicelevel and issues a definition query
    // to filter service location geometries
    //
    // A definition query filters what was first retrieved from the SPL feature service
    function applyDefinitionQuery() {
        var svcLyr = gMyWebmap.findLayerById('0');
        console.log("Layer is");
        console.log(svcLyr);

        // make layers visible
        svcLyr.visible = true;

        // only execute when the sublayer is loaded. Note this is asynchronous
        // so it may be skipped over during execution and be executed after exiting this function
        svcLyr.when(function() {
            gMyLyr = svcLyr.findSublayerById(0);    // store in global variable
            console.log("Sublayer loaded...");
            console.log("Sublayer is");
            console.log(gMyLyr);

            // force sublayer visible
            gMyLyr.visible = true;

            // run the query
            processDefinitionQuery();
        });
    };

    // process the definition query on the passed in SPL feature sublayer
    function processDefinitionQuery() {
        // values of passedServiceType
        // 0, 1 - no service levels. Only show service locations without a guarantee of service (GoS)
        //     Note that 0 is passed in when the widget is initialized and 1 on subsequent times
        // 2 - return any service location with a GoS = 1
        // 3 - GoS = 2
        // 4 - GoS = 3
        // 5 - GoS = 4
        // 6 - GoS = 5
        // 7 - GoS = 6
        // 8 (default) - return all service levels
        if (gPassedServiceType <= 1) { // display all service locations
            gMyLyr.definitionExpression = "1 = 1"
        } else if (gPassedServiceType === 2) { // display GoS = 1
            gMyLyr.definitionExpression = "NODISCONCT = '1'";
        } else if (gPassedServiceType === 3) { // display GoS = 2
            gMyLyr.definitionExpression = "NODISCONCT = '2'";
        } else if (gPassedServiceType === 4) { // display GoS = 3
            gMyLyr.definitionExpression = "NODISCONCT = '3'";
        } else if (gPassedServiceType === 5) { // display GoS = 4
            gMyLyr.definitionExpression = "NODISCONCT = '4'";
        } else if (gPassedServiceType === 6) { // display GoS = 5
            gMyLyr.definitionExpression = "NODISCONCT = '5'";
        } else if (gPassedServiceType === 7) { // display GoS = 6
            gMyLyr.definitionExpression = "NODISCONCT = '6'";
        } else { // default is to only display service locations with a set GoS
            gMyLyr.definitionExpression = "NODISCONCT IN ('1', '2', '3', '4', '5', '6')";
        }
    }

    class Map extends HTMLElement {
        constructor() {
            super();
            
            //this._shadowRoot = this.attachShadow({mode: "open"});
            this.appendChild(template.content.cloneNode(true));
            this._props = {};
            let that = this;

            require([
                "esri/config",
                "esri/WebMap",
                "esri/views/MapView",
                "esri/widgets/BasemapToggle",
                "esri/layers/FeatureLayer",
                "esri/widgets/TimeSlider",
                "esri/widgets/Expand",
                "esri/Graphic",
                "esri/views/ui/UI",
                "esri/views/ui/DefaultUI" 
            ], function(esriConfig, WebMap, MapView, BasemapToggle, FeatureLayer, TimeSlider, Expand, Graphic) {
        
                // set portal and API Key
                esriConfig.portalUrl = gPassedPortalURL

                //  set esri api Key 
                esriConfig.apiKey = gPassedAPIkey;

                // replace the ID below with the ID to your web map
                const webmap = new WebMap({
                    portalItem: {
                        id: "eedbcdc058d9466d989487747d984ea5" //"a17e134c51f74252bca8db3c66ef032e"
                    }
                });

                gMyWebmap = webmap;  // save to global variable

                const view = new MapView({
                    container: "mapview",
                    map: webmap
                });

                // time slider widget initialization
                const timeSlider = new TimeSlider({
                    container: "timeSlider",
                    view: view
                });

                // set on click for directions
                view.on("click", addStop);

                function addGraphic(type, point) {
                    var graphic = new Graphic({
                        symbol: {
                            type: "simple-marker",
                            color: type === "start" ? "white" : "black",
                            size: "8px"
                        },
                        geometry: point
                    });

                    view.graphics.add(graphic);
                }

                function addStop(event) {
                    // no code here
                    // here neither
                    if (view.graphics.length === 0) {
                        addGraphic("start", event.mapPoint);
                    } else if (view.graphics.length === 1) {
                        addGraphic("finish", event.map

