// script.js

// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Global variables
let geoJsonLayer = null;

// Fetch GeoJSON data for country borders
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(response => response.json())
    .then(data => {
        geoJsonLayer = L.geoJSON(data, {
            style: {
                color: '#555',
                weight: 1,
                fillColor: '#aaa',
                fillOpacity: 0.5,
            },
            onEachFeature: (feature, layer) => {
                layer.on('click', () => {
                    const countryName = feature.properties.name.replace(/ /g, '');
                    fetchCountryData(countryName);
                });
            },
        }).addTo(map);
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));

// Function to fetch data for a country
function fetchCountryData(countryName) {
    fetch(`https://raw.githubusercontent.com/SolutionsAsService/CountryData/main/${countryName}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayCountryData(data);
        })
        .catch(error => {
            console.error('Error fetching country data:', error);
            document.getElementById('info').innerHTML = 'Country data not found or data structure is incorrect.';
        });
}

// Function to display country data
function displayCountryData(country) {
    document.getElementById('info').innerHTML = `
        <h2>${country.Name.Common}</h2>
        <p><strong>Official Name:</strong> ${country.Name.Official}</p>
        <p><strong>Capital City:</strong> ${country.Geography["Capital City"]}</p>
        <p><strong>Largest City:</strong> ${country.Geography["Largest City"]}</p>
        <p><strong>Major Cities:</strong> ${country.Geography["Major Cities"] ? country.Geography["Major Cities"].join(', ') : 'N/A'}</p>
        <p><strong>Area:</strong> ${country.Geography.Area["Total (km2)"]} km²</p>
        <p><strong>Population (2022 Estimate):</strong> ${country.Demographics.Population["2022 Estimate"] || country.Demographics.Population["2023 Estimate"]}</p>
        <p><strong>Government Type:</strong> ${country.Government.Type}</p>
        <p><strong>President:</strong> ${country.Government.President}</p>
        <p><strong>Prime Minister:</strong> ${country.Government["Prime Minister"] || 'N/A'}</p>
        <p><strong>Upper House:</strong> ${country.Government.Legislature["Upper House"]}</p>
        <p><strong>Lower House:</strong> ${country.Government.Legislature["Lower House"]}</p>
        <p><strong>GDP (PPP 2023):</strong> ${country.Economy["GDP (PPP 2023) Total (Trillion USD)"] || country.Economy["GDP (PPP 2023)"].Total} Trillion USD</p>
        <p><strong>GDP (Nominal 2023):</strong> ${country.Economy["GDP (Nominal 2023) Total (Trillion USD)"] || country.Economy["GDP (Nominal 2023)"].Total} Trillion USD</p>
        <p><strong>GDP per Capita (PPP USD):</strong> ${country.Economy["GDP per Capita (PPP USD)"] || country.Economy["GDP (PPP 2023)"].Per Capita}</p>
        <p><strong>GDP per Capita (Nominal USD):</strong> ${country.Economy["GDP per Capita (Nominal USD)"] || country.Economy["GDP (Nominal 2023)"].Per Capita}</p>
        <p><strong>Primary Religion:</strong> ${country.Demographics.Religion.Primary || country.Demographics.Religion.Christianity}</p>
        <p><strong>Other Religions:</strong> ${country.Demographics.Religion.Minorities ? Object.entries(country.Demographics.Religion.Minorities).map(([key, value]) => `${key}: ${value}`).join(', ') : 'N/A'}</p>
        <p><strong>Human Development Index (2021):</strong> ${country.Miscellaneous["Human Development Index (2021)"]}</p>
        <p><strong>Currency:</strong> ${country.Miscellaneous.Currency}</p>
        <p><strong>Calling Code:</strong> ${country.Miscellaneous["Calling Code"]}</p>
        <p><strong>Internet TLD:</strong> ${country.Miscellaneous["Internet TLD"].join(', ')}</p>
        <p><strong>UNESCO World Heritage Sites:</strong> ${country.Miscellaneous["UNESCO World Heritage Sites"]}</p>
    `;
}
