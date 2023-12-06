(function(){
    //calculate inline position of a right element 
    function rightPosition(){
        document.querySelectorAll('.right').forEach(div =>{
            var children = div.parentNode.childNodes,
                containsLeft;

            //calculate if positioned next to a .left element
            for (child of children){
                if(child.classList){
                    containsLeft = child.classList.contains("left");
                    if (containsLeft){
                        div.classList.remove('right')
                        div.classList.add('right-inline')
                        break;
                    }
                }
            }
        });

        //full width element
        document.querySelectorAll('.full-width').forEach(div =>{
            div.parentNode.style.padding = 0;
        });
    }
    //center title horizontally and vertically within page
    function positionTitle(){
        if (document.querySelector('.title')){
            var children = document.querySelector('.title').childNodes,
                tHeight = document.querySelector('.title').clientHeight,
                cHeight = 0;

            for (child of children){
                if (child.clientHeight)
                    cHeight += child.clientHeight;
            }

            document.querySelector('.title').firstElementChild.style.marginTop = (tHeight - cHeight)/2 + "px";
        }
    }
    //center element vertically within the page
    function vertCenter(){
        document.querySelectorAll('.vert-center').forEach(div =>{
            var height = div.clientHeight,
                pHeight = div.parentNode.clientHeight;
                
            div.style.marginTop = (pHeight/2) - (height/2) + "px";
        });
    }
    //resize background elements
    function resizeBackround(){
        var width = document.documentElement.clientWidth;

        document.querySelectorAll('.container').forEach(div =>{
            div.width = width + 'px !important';
        });
    }
    //function for a smooth transition between background elements
    function backgroundTransition(){
        document.querySelectorAll(".scroll-container").forEach(function(scrollContainer){
            let foreground = scrollContainer.children[1],
                background = scrollContainer.children[0],
                foregroundItems = [];
            //add individual foreground items to the array
            foreground.childNodes.forEach(function(child){
                if (child.nodeName == "DIV"){
                    foregroundItems.push(child);
                }
            })
            //if there is more than one background item, activate scroll listener
            if(background.children.length > 1){
                background.childNodes.forEach(function(child){
                    //if the element is not a "text" element
                    if (child.nodeName != "#text" && child.nodeName != "#comment"){
                        //retrieve data-slide value to get the foreground item
                        console.log(child)
                        let id = child.dataset.slide ? child.dataset.slide : 0;
                        //activate listener for each background item
                        document.addEventListener("scroll",function(){
                            //position at the bottom of the screen
                            let scrollPos = window.scrollY + (window.innerHeight) - foregroundItems[id].clientHeight,
                            //position of the select foreground item
                                foreGroundOffset = foregroundItems[id].offsetParent.offsetTop + foregroundItems[id].offsetTop;
                            //if the current scroll position is greater than the bottom position of the foreground element
                            if (scrollPos > foreGroundOffset){
                                if (child.previousElementSibling)
                                    child.previousElementSibling.classList.add("hidden");
                                if (child.nextElementSibling)
                                    child.nextElementSibling.classList.add("hidden");
                                child.classList.remove("hidden");
                                vertCenter();
                            }  
                        })
                    }
                })
            }
        })
    }
    //functions to fire on resize
    function resize(){
        rightPosition();
        vertCenter();
        positionTitle();
        resizeBackround();
        backgroundTransition();
    }

    document.addEventListener('DOMContentLoaded', resize);
    document.addEventListener('scroll', vertCenter);
    window.addEventListener('resize', resize);

    //initilize map and set center of map with coordinates
var map= L.map('mapid', {
    center: [43.065421,-89.370140],
    zoom: 11,
    scrollWheelZoom:false
});

// Define the bounding box for map panning constraints
var southWest = L.latLng(42.9, -89.6),
    northEast = L.latLng(43.2, -89.1),
    bounds = L.latLngBounds(southWest, northEast);

        


//adding tileset layer
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);

var Stadia_StamenTerrain = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.setMaxBounds(bounds);
    map.on('drag', function () {
        map.panInsideBounds(bounds, { animate: false });
    });



/* Map of GeoJSON city data from map.geojson */
//declare map var in global scope
//function to instantiate Leaflet map
function createMap(){
    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);

    
    

    //call getData function
    getData();
    getSecondData(); // Call the function to load the second GeoJSON layer
};


//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
     var attributesToShow = ["Lake","Chloride"];

        // Loop through the selected attributes and add them to the popup
        for (var i = 0; i < attributesToShow.length; i++) {
            var attribute = attributesToShow[i];
            if (feature.properties[attribute]) {
                popupContent += "<p>" + attribute + ": " + feature.properties[attribute] + "</p>";
            }
        }
        layer.bindPopup(popupContent);
};

function onEachFeatureSecond(feature, layer) {
    var popupContent = "";
     var attributesToShow = ["Well","Sodium"];

        // Loop through the selected attributes and add them to the popup
        for (var i = 0; i < attributesToShow.length; i++) {
            var attribute = attributesToShow[i];
            if (feature.properties[attribute]) {
                popupContent += "<p>" + attribute + ": " + feature.properties[attribute] + "</p>";
            }
        }
        layer.bindPopup(popupContent);
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("lib/output/lakesEdited.json")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                style: function (feature) {
                    // Customize the style based on feature properties
                    var chlorideValue = feature.properties.Chloride_C;
        
                    // Example: Set color based on chloride value using HSL
                    return {
                        fillColor: getHSLColor(chlorideValue),
                        color: 'white',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8,
                    };
                },
                onEachFeature:onEachFeature
            }).addTo(map);
            
        })
};

// Example getHSLColor function for setting fill color based on chloride value
function getHSLColor(chlorideValue) {
    // Adjust the hue value (0-360) based on your preference
    var hue = 181; // For example, setting it to 120 for a greenish hue
    var saturation = 31; // 0-100
    var lightness = 68; // 0-100

    // Customize this function based on your specific requirements
    return 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
}

//function to retrieve the data and place it on the map
//function to retrieve the data and place it on the map
//function to retrieve the data and place it on the map
//function to retrieve the data and place it on the map
function getSecondData() {
    //load the data
    fetch("lib/output/wellEdited.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                style: function (feature) {
                    var chlorideValue = feature.properties.Chloride;

                    
                    // Conditionally set the fillColor based on a property (e.g., Sodium)
if (
    String(feature.properties.Sodium) === '63' ||
    String(feature.properties.Sodium) === '20' ||
    String(feature.properties.Sodium) === '27' ||
    String(feature.properties.Sodium) === '29' ||
    String(feature.properties.Sodium) === '37' ||
    String(feature.properties.Sodium) === '31'
) {
    return {
        radius: 8,
        fillColor: '#b5903e',
        color: 'white',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
} else {
    return {
        radius: 8, 
        fillColor: '#b2aca1',
        color: 'white',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

                },
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng);
                },
                onEachFeature: onEachFeatureSecond
            }).addTo(map);
        });
}



// Example getHSLColor function for setting fill color based on chloride value
function getHSLColor2(chlorideValue) {
    // Adjust the hue value (0-360) based on your preference
    var hue = 1; // For example, setting it to 120 for a greenish hue
    var saturation = 31; // 0-100
    var lightness = 68; // 0-100

    // Customize this function based on your specific requirements
    return 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
}

document.addEventListener('DOMContentLoaded',createMap)

})();

