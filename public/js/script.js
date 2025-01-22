const socket = io(); // Connect to the Socket.IO server

console.log('hey'); // Debugging log

// Check if geolocation is supported by the browser
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Emit the user's location to the server
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true, // Use high accuracy mode
            timeout: 10000, // Increase timeout to 10 seconds
            maximumAge: 0, // Do not use cached positions
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// Initialize the map with a default view
const map = L.map("map").setView([0, 0], 2); // Default view set to zoom level 2

// Add OpenStreetMap tiles to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, // Set maximum zoom level
    attribution: '© OpenStreetMap contributors', // Add attribution
}).addTo(map);

// Object to store markers for each user
const markers = {};

// Listen for location updates from other users
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Update the map view to the received location
    map.setView([latitude, longitude], 16);

    // Update or create a marker for the user
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); // Update existing marker
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map); // Create new marker
    }
});

// Listen for user disconnection events
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove the marker from the map
        delete markers[id]; // Delete the marker from the markers object
    }
});