$(document).ready(function () {
    $.getJSON("data.json", function (data) {
        var topSpots = data.topSpots;

        // San Diego coordinates
        var sanDiegoLat = 32.7157;
        var sanDiegoLng = -117.1611;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;

                // Calculate distance for each spot
                topSpots.forEach(function (spot) {
                    var spotLat = spot.location[0];
                    var spotLng = spot.location[1];
                    spot.distance = calculateDistance(userLat, userLng, spotLat, spotLng);
                });

                // Sort the spots based on the distance
                topSpots.sort(function (a, b) {
                    return a.distance - b.distance;
                }); 

                // Append the sorted data to the table
                topSpots.forEach(function (spot) {
                    var directionsLink = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${spot.location[0]},${spot.location[1]}&travelmode=driving`;

                    // Create table row with data
                    var row = `<tr>
                        <td>${spot.name}</td>
                        <td>${spot.description}</td>
                        <td><a href="${directionsLink}" target="_blank">Get Directions</a></td>
                        <td>${spot.distance.toFixed(2)} miles</td>
                    </tr>`;
                    
                    // Append the row to the table body
                    $("#top-spots-table-body").append(row);
                });

                // Initialize the map
                initMap(sanDiegoLat, sanDiegoLng, topSpots);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    // Function to calculate the distance between two points using the Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        var p = Math.PI / 180;
        var c = Math.cos;
        var a = 0.5 - c((lat2 - lat1) * p) / 2 + 
                c(lat1 * p) * c(lat2 * p) * 
                (1 - c((lon2 - lon1) * p)) / 2;

        return 7917.5 * Math.asin(Math.sqrt(a)); 
    }

    // Function to initialize the map with markers
    function initMap(userLat, userLng, topSpots) {
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: userLat, lng: userLng },
            zoom: 12,
        });

        topSpots.forEach(function (spot) {
            const spotLat = spot.location[0];
            const spotLng = spot.location[1];

            const marker = new google.maps.Marker({
                position: { lat: spotLat, lng: spotLng },
                map: map,
                title: spot.description,
            });

            const infowindow = new google.maps.InfoWindow({
                content: `<p>${spot.name}</p><p>${spot.description}</p>`
            });

            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
        });
    }
});
