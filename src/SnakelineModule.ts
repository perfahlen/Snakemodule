/// <reference path="./../../Bing-Maps-V8-TypeScript-Definitions/types/MicrosoftMaps/Microsoft.Maps.All.d.ts" />

function Snakeline(): void {

    let locations: Array<Microsoft.Maps.Location>;
    let map: Microsoft.Maps.Map;
    let duration: number;
    let styles: Array<Microsoft.Maps.IPolylineOptions>;

    let animationTime = 600;
    let frameDuration = 10;
    let frames = animationTime / frameDuration;

    this.draw = function (m: Microsoft.Maps.Map, l: Array<Microsoft.Maps.Location>, d = 500, s?: Array<Microsoft.Maps.IPolylineOptions>): void {
        map = m;
        locations = l;
        duration = d;
        styles = s;

        if (Microsoft.Maps.SpatialMath) {
            let snakeLocations = preparePolyline();
            processResult(snakeLocations);
        }
        else {
            Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', () => {
                let snakeLocations = preparePolyline();
                processResult(snakeLocations);
            });
        }
    }

    function preparePolyline(): Array<Microsoft.Maps.Location> {
        const snakeLocations = new Array<Microsoft.Maps.Location>();
        const distance = Microsoft.Maps.SpatialMath.getDistanceTo(locations[0], locations[locations.length - 1]);
        const frameDistance = Math.ceil(distance / frames);

        for (let i = 0; i < locations.length - 1; i++) {
            snakeLocations.push(locations[i]);

            let segmentLength = Microsoft.Maps.SpatialMath.getDistanceTo(locations[i], locations[i + 1]);
            let noOfNewLocations = Math.floor(segmentLength / frameDistance);
            for (let j = 1; j < noOfNewLocations; j++) {
                let from = locations[i];
                let to = locations[i + 1];
                let fraction = (frameDistance * j) / segmentLength;
                let intersectedLocation = Microsoft.Maps.SpatialMath.interpolate(from, to, fraction);
                snakeLocations.push(intersectedLocation);
            }
        }

        return snakeLocations;
    }

    function processResult(locations: Microsoft.Maps.Location[]): void {
        var locationsPerFrame = Math.ceil(locations.length / frames);
        let frameLocations = new Array<Microsoft.Maps.Location>();

        const intervalId = setInterval(() => {
            map.entities.clear();

            if (locationsPerFrame < locations.length) {
                let verticesInFrame = locations.splice(0, locationsPerFrame);
                frameLocations.push(...verticesInFrame);

                plotPolyline(frameLocations, styles);
            }
            else {
                frameLocations.push(...locations);
                plotPolyline(frameLocations, styles);
                clearInterval(intervalId);
            }
        }, frameDuration);
    }

    function plotPolyline(locations: Microsoft.Maps.Location[], styles: Array<Microsoft.Maps.IPolylineOptions>) {
        let polylines = styles.map((style: Microsoft.Maps.IPolylineOptions) => {
            const polyline = new Microsoft.Maps.Polyline(locations, style);
            return polyline;
        });
        map.entities.add(polylines);
    }
}

Microsoft.Maps.moduleLoaded("Snakeline");