define("Map", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var map;
    var directionsManager;
    var animationTime = 600;
    var frameDuration = 20;
    var frames = animationTime / frameDuration;
    console.log(frames);
    exports.default = new function LoadMap() {
        map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
            center: new Microsoft.Maps.Location(60.3, 17.3),
            zoom: 6,
            mapTypeId: Microsoft.Maps.MapTypeId.grayscale
        });
        Microsoft.Maps.loadModule(['Microsoft.Maps.SpatialMath', 'Microsoft.Maps.GeoJson'], function () {
            fetch("/path.json").then(function (res) {
                return res.json();
            }).then(function (json) {
                var coordinates = json.coordinates.map(function (c) {
                    var location = new Microsoft.Maps.Location(c[1], c[0]);
                    return location;
                });
                var polyline = new Microsoft.Maps.Polyline(coordinates);
                var distance = Microsoft.Maps.SpatialMath.Geometry.calculateLength(polyline, Microsoft.Maps.SpatialMath.DistanceUnits.Meters);
                var distancePerFrame = distance / frames;
                var locations = preparePolyline(polyline, distancePerFrame);
                processResult(coordinates);
            });
        });
    }();
    function preparePolyline(polyLine, frameDistance) {
        var snakeLocations = new Array();
        var loops = 0;
        for (var i = 0; i < polyLine.getLocations().length - 1; i++) {
            loops += 1;
            snakeLocations.push(polyLine.getLocations()[i]);
            var segmentLength = Microsoft.Maps.SpatialMath.getDistanceTo(polyLine.getLocations()[i], polyLine.getLocations()[i + 1]);
            var noOfNewLocations = Math.floor(segmentLength / frameDistance);
            for (var j = 1; j < noOfNewLocations; j++) {
                loops += 1;
                var from = polyLine.getLocations()[i];
                var to = polyLine.getLocations()[i + 1];
                var fraction = (frameDistance * j) / segmentLength;
                var intersectedLocation = Microsoft.Maps.SpatialMath.interpolate(from, to, fraction);
                snakeLocations.push(intersectedLocation);
            }
        }
        return snakeLocations;
    }
    function processResult(locations) {
        var locationsPerFrame = Math.ceil(locations.length / frames);
        var frameLocations = new Array();
        var snakeOptions = [];
        snakeOptions.push({
            strokeColor: "red",
            strokeThickness: 3
        }, {
            strokeColor: new Microsoft.Maps.Color(0.25, 255, 0, 0),
            strokeThickness: 14
        });
        var intervalId = setInterval(function () {
            map.entities.clear();
            if (locationsPerFrame < locations.length) {
                var verticesInFrame = locations.splice(0, locationsPerFrame);
                frameLocations.push.apply(frameLocations, verticesInFrame);
                plotPolyline(frameLocations, snakeOptions);
            }
            else {
                frameLocations.push.apply(frameLocations, locations);
                plotPolyline(frameLocations, snakeOptions);
                clearInterval(intervalId);
            }
        }, frameDuration);
    }
    function plotPolyline(locations, styles) {
        var polylines = styles.map(function (style) {
            var polyline = new Microsoft.Maps.Polyline(locations, style);
            return polyline;
        });
        map.entities.add(polylines);
    }
});
//# sourceMappingURL=app.js.map