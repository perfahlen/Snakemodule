
function LoadMap() {
    let map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(60.3, 17.3),
        zoom: 6,
        mapTypeId: Microsoft.Maps.MapTypeId.grayscale
    });

    Microsoft.Maps.registerModule("Snakeline", "/src/SnakelineModule.js");

    Microsoft.Maps.loadModule(['Microsoft.Maps.SpatialMath', 'Microsoft.Maps.GeoJson', 'Snakeline'], () => {
        fetch("/path.json").then(function(res) {
            return res.json();
        }).then(function (json){
            let coordinates = json.coordinates.map(c => {
                var location = new Microsoft.Maps.Location(c[1], c[0]);
                return location;
            });

            let snakeOptions = []; 

            snakeOptions.push({
                strokeColor: "blue",
                strokeThickness: 3
            }, {
                    strokeColor: new Microsoft.Maps.Color(0.25, 0, 0, 255),
                    strokeThickness: 14
                }
            );

            new Snakeline().draw(map, coordinates, 1000, snakeOptions);

        });
    });
};
