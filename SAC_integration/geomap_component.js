(function() {
    let template = document.createElement("template");
    var gPassedServiceType; // holds passed in guarantee of service - set in onCustomWidgetBeforeUpdate()
    var gPassedPortalURL; //ESRI Portal URL
    var gPassedAPIkey; //ESRI JS api key
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
        </style>
        <div id='mapview'></div>
        <div id='timeSlider'></div>
    `;
    
    // this function takes the passed in servicelevel and issues a definition query
    // to filter service location geometries
    //
    // A definition query filters what was first retrieved from the SPL feature service
    function applyDefinitionQuery() {
        var svcLyr = gMyWebmap.findLayerById( '18cd907be56-layer-2' ); 
        console.log( "Layer is");
        console.log( svcLyr);

        // make layers visible
        svcLyr.visible = true;
        
        // run the query 
        processDefinitionQuery();

        // only execute when the sublayer is loaded. Note this is asynchronous
        // so it may be skipped over during execution and be executed after exiting this function
        
        svcLyr.when(function() {
            gMyLyr = svcLyr.findSublayerById(9);    // store in global variable
            console.log("Sublayer loaded...");
            console.log( "Sublayer is");
            console.log( gMyLyr);

            // force sublayer visible
            gMyLyr.visible = true;

            // run the query
            processDefinitionQuery();
        });



    // NEU ____________________________________________
    function applyDefinitionQueryByServiceLevel(serviceLevel) {
        // Call the widget API and pass the variable
        geoMap_1.setServiceLevel(serviceLevel);

        // Find the SPL sublayer so a query is issued
        applyDefinitionQuery();
    }

    // Add this function to dynamically select the layer based on service level
    function selectLayerByServiceLevel(serviceLevel) {
        // Replace this logic with your actual layer selection based on service level
        switch (serviceLevel) {
            case 1:
                return "18cd907c4fb-layer-9"; // Example ID for Service Level 1
            case 2:
                return "18cd907c4fd-layer-10"; // Example ID for Service Level 2
            case 3:
                return "18cd907c4fd-layer-12"; // Example ID for Service Level 2
            case 4:
                return "18cd907c4fd-layer-19"; // Example ID for Service Level 2
            case 5:
                return "18cd907c4fd-layer-20"; // Example ID for Service Level 2
            // Add more cases as needed
            default:
                return "18cd907be56-layer-2"; // Default ID
        }
    }
    //______________________________________________________________________




        // Warten Sie auf das Laden der Web-Karte
        webmap.load().then(function () {
            // Rufen Sie alle Layer in der Web-Karte ab
            var allLayers = webmap.layers.toArray();
            console.log("allLayers in der Web Karte")
            console.log(allLayers)

            // Durchlaufen Sie alle Layer und sammeln Sie die IDs
            var layerIDs = allLayers.map(function (layer) {
            console.log("alle layerIDs in der Web Karte")

            console.log(layerIDs)
            return layer.id;
            });
        });

        // Hier haben Sie jetzt eine Liste aller IDs Ihrer Feature-Layer
        console.log(layerIDs);

    };

    // process the definition query on the passed in SPL feature sublayer
    function processDefinitionQuery()
    {
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
                "esri/tasks/RouteTask",
                "esri/tasks/support/RouteParameters",
                "esri/tasks/support/FeatureSet",
                "esri/tasks/support/Query",
                "esri/layers/support/Sublayer",
                "esri/Graphic",
                "esri/views/ui/UI",
                "esri/views/ui/DefaultUI", 
                "esri/layers/Layer"
            ], function(esriConfig, WebMap, MapView, BasemapToggle, FeatureLayer, TimeSlider, Expand, RouteTask, RouteParameters, FeatureSet, Query, Sublayer, Graphic) {
        
                // set portal and API Key
                esriConfig.portalUrl = gPassedPortalURL

                //  set esri api Key 
                esriConfig.apiKey = gPassedAPIkey
        
                        
                // replace the ID below with the ID to your web map
                const webmap = new WebMap ({
                    portalItem: {
                        id: "df5498b9a1c24846b1d88e4171de0f42" //"17932d0a9d8141039fb3ece5f86ec03f" eedbcdc058d9466d989487747d984ea5 df5498b9a1c24846b1d88e4171de0f42
                    }
                });

                gMyWebmap = webmap;  // save to global variable

                const view = new MapView({
                    container: "mapview",
                    map: webmap
                });
        
               
                view.when(function () {
                    view.popup.autoOpenEnabled = true; //disable popups
                    gWebmapInstantiated = 1; // used in onCustomWidgetAfterUpdate
        
                    // Create the basemap toggle
                    var basemapToggle = new BasemapToggle({
                        view:view,
                        nextBasemap: "satellite"
                    });

        
                    // Add the toggle to the bottom-right of the view
                    view.ui.add( basemapToggle, "bottom-right");
        
                    // should have been set in onCustomWidgetBeforeUpdate()
                    console.log( gPassedServiceType);

                    // find the SPL sublayer so a query is issued
                    applyDefinitionQuery();
                });

            }); // end of require()
        } // end of constructor()    

        getSelection() {
            return this._currentSelection;
        }

        onCustomWidgetBeforeUpdate(changedProperties)
        {
            this._props = { ...this._props, ...changedProperties };
            console.log(["Service Level",changedProperties["servicelevel"]]);

        }
        

        onCustomWidgetAfterUpdate(changedProperties) 
        {
            if ("servicelevel" in changedProperties) {
                this.$servicelevel = changedProperties["servicelevel"];
                gPassedServiceType = this.$servicelevel; // Legen Sie den übergebenen Wert in die globale Variable
    
                // Versuchen Sie nur, die angezeigten Servicestandorte zu filtern, wenn die Webkarte initialisiert ist
                if (gWebmapInstantiated === 1) {
                    // Wählen Sie den Layer basierend auf dem Service-Level dynamisch aus
                    var selectedLayerId = selectLayerByServiceLevel(gPassedServiceType);
                    
                    // Wenden Sie die Definition Query basierend auf dem ausgewählten Layer und Service-Level an
                    applyDefinitionQueryByServiceLevel(gPassedServiceType, selectedLayerId);
                }
            }

            if ("servicelevel" in changedProperties) {
                this.$servicelevel = changedProperties["servicelevel"];
            }
            gPassedServiceType = this.$servicelevel; // place passed in value into global

            if ("portalurl" in changedProperties) {
                this.$portalurl = changedProperties["portalurl"];
            }
            gPassedPortalURL = this.$portalurl; // place passed in value into global

            if ("apikey" in changedProperties) {
                this.$apikey = changedProperties["apikey"];
            }
            gPassedAPIkey = this.$apikey; // place passed in value into global

            // only attempt to filter displayed service locations if the webmap is initialized
           if (gWebmapInstantiated === 1) {
                applyDefinitionQuery();
            }
        }
    } // end of class




    let scriptSrc = "https://js.arcgis.com/4.18/"
    let onScriptLoaded = function() {
        customElements.define("com-sap-custom-geomap", Map);
    }

    //SHARED FUNCTION: reuse between widgets
    //function(src, callback) {
    let customElementScripts = window.sessionStorage.getItem("customElementScripts") || [];
    let scriptStatus = customElementScripts.find(function(element) {
        return element.src == scriptSrc;
    });

    if (scriptStatus) {
        if(scriptStatus.status == "ready") {
            onScriptLoaded();
        } else {
            scriptStatus.callbacks.push(onScriptLoaded);
        }
    } else {
        let scriptObject = {
            "src": scriptSrc,
            "status": "loading",
            "callbacks": [onScriptLoaded]
        }
        customElementScripts.push(scriptObject);
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = scriptSrc;
        script.onload = function(){
            scriptObject.status = "ready";
            scriptObject.callbacks.forEach((callbackFn) => callbackFn.call());
        };
        document.head.appendChild(script);
    }

//END SHARED FUNCTION
})(); // end of class
