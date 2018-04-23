function Snakeline() {
    var locations;
    var map;
    var duration;
    var styles;
    var animationTime = 600;
    var frameDuration = 10;
    var frames = animationTime / frameDuration;
    this.draw = function (m, l, d, s) {
        if (d === void 0) { d = 500; }
        map = m;
        locations = l;
        duration = d;
        styles = s;
        if (Microsoft.Maps.SpatialMath) {
            var snakeLocations = preparePolyline();
            processResult(snakeLocations);
        }
        else {
            Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', function () {
                var snakeLocations = preparePolyline();
                processResult(snakeLocations);
            });
        }
    };
    function preparePolyline() {
        var snakeLocations = new Array();
        var distance = Microsoft.Maps.SpatialMath.getDistanceTo(locations[0], locations[locations.length - 1]);
        var frameDistance = Math.ceil(distance / frames);
        for (var i = 0; i < locations.length - 1; i++) {
            snakeLocations.push(locations[i]);
            var segmentLength = Microsoft.Maps.SpatialMath.getDistanceTo(locations[i], locations[i + 1]);
            var noOfNewLocations = Math.floor(segmentLength / frameDistance);
            for (var j = 1; j < noOfNewLocations; j++) {
                var from = locations[i];
                var to = locations[i + 1];
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
        var intervalId = setInterval(function () {
            map.entities.clear();
            if (locationsPerFrame < locations.length) {
                var verticesInFrame = locations.splice(0, locationsPerFrame);
                frameLocations.push.apply(frameLocations, verticesInFrame);
                plotPolyline(frameLocations, styles);
            }
            else {
                frameLocations.push.apply(frameLocations, locations);
                plotPolyline(frameLocations, styles);
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
}
Microsoft.Maps.moduleLoaded("Snakeline");
//# sourceMappingURL=SnakelineModule.js.map