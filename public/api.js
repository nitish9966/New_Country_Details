document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logout-button");
    const mapContainer = document.getElementById("map");

    logoutButton.addEventListener("click", () => {
        console.log("Logout button clicked"); // Optional: Check if this log appears in the console
        window.location.href = "/index.html"; // Adjust path as necessary
    });

    // Initialize Leaflet map
    const map = L.map(mapContainer).setView([51.505, -0.09], 3); // Default view

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let currentMarker = null; // Variable to hold the current marker

    // Function to add marker and bind popup with country details
    function addMarkerAndPopup(lat, lng, country) {
        // Extract currencies and languages from the country object
        const currencies = Object.values(country.currencies).map(currency => currency.name).join(", ");
        const languages = Object.values(country.languages).join(", ");

        const popupContent = `
            <h3>${country.name.common}</h3>
            <p>Capital: ${country.capital}</p>
            <p>Population: ${country.population}</p>
            <p>Region: ${country.region}</p>
            <p>Currencies: ${currencies}</p>
            <p>Languages: ${languages}</p>
            <!-- Add more details as needed -->
        `;

        // Remove previous marker if exists
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Add new marker and bind popup
        currentMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup(popupContent)
            .openPopup();
    }

    // Event listener for search button
    const searchButton = document.getElementById("search-button");
    searchButton.addEventListener("click", async () => {
        const countryInput = document.getElementById("country-input");
        const countryName = countryInput.value.trim();

        if (countryName !== "") {
            try {
                const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
                if (!response.ok) {
                    throw new Error("Country not found");
                }
                const data = await response.json();
                const country = data[0]; // Assuming first result is the desired country

                // Add marker and bind popup for the country
                addMarkerAndPopup(country.latlng[0], country.latlng[1], country);

                // Center map on the country
                map.setView([country.latlng[0], country.latlng[1]], 5); // Adjust zoom level as needed
            } catch (error) {
                console.error(error);
                alert("Error fetching country data. Please try again.");
            }
        }
    });

});
