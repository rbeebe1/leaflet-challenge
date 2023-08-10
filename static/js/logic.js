const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

d3.json(url).then(function(data) {
    console.log(data)

    data.features.forEach(function(feature) {
        let mag = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];
    });
    createFeatures(data.features);

});
    
function depthColor(depth) {
    if (depth < 15) return "#00FF00";   // Light Green
    if (depth < 30) return "#008000";   // Green
    if (depth < 45) return "#006400";   // Dark Green
    if (depth < 60) return "#FFFF00";   // Light Yellow
    if (depth < 75) return "#FFD700";   // Yellow
    if (depth < 90) return "#FFD000";   // Dark Gold
    if (depth < 100) return "#FF8C00";  // Dark Orange
    if (depth < 150) return "#FFA500";  // Orange
    if (depth < 200) return "#FF4500";  // Orange Red
    if (depth < 250) return "#FF69B4";  // Hot Pink
    if (depth < 300) return "#FF6347";  // Light Red
    if (depth < 350) return "#FF0000";  // Dark Red
    return "#8B0000";                  // Red
}
function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3>
                            <hr>
                            <p>${new Date(feature.properties.time)}</p>
                            <p><strong>Magnitude: <strong>${feature.properties.mag}<p>
                            <p><strong>Depth: </strong>${feature.geometry.coordinates[2]}</p>`);
    }
    
    function pointToLayer(feature, latlng) {
        // Calculate marker size based on magnitude
        let markerSize = feature.properties.mag * 3;

        // Calculate marker color based on depth
        let depth = feature.geometry.coordinates[2];
        let color = depthColor(depth);

        // Create and style the marker
        return L.circleMarker(latlng, {
            radius: markerSize,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create base layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlayMaps object
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create the map and add layers and controls
    let myMap = L.map("map", {
        center: [32.71533, -117.15726],
        zoom: 5,
        layers: [street, earthquakes]  
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    let legend = L.control({ position: "bottomleft" });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create("div", "info legend");
        let grades = [-10, 15, 30, 45, 60, 75, 90, 100, 150, 200, 250, 300, 350];
        let labels = [];
        
        div.innerHTML = '<div><strong>Depth Legend (Km)</strong></div>';

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap);
};
