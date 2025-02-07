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
                    const countryName = feature.properties.name;
                    fetchCountryData(countryName);
                });
            },
        }).addTo(map);
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));

// Function to fetch data for a country
function fetchCountryData(countryName) {
    const countryCode = countryName.replace(/\s+/g, ''); // Remove spaces for the JSON file name
    fetch(`https://raw.githubusercontent.com/SolutionsAsService/CountryData/main/${countryCode}.json`)
        .then(response => response.json())
        .then(data => {
            const country = data[countryName];
            if (country) {
                document.getElementById('info').innerHTML = `
                    <h2>${country.Name.Common}</h2>
                    <p><strong>Official Name:</strong> ${country.Name.Official}</p>
                    <p><strong>Capital:</strong> ${country.Location.Capital}</p>
                    <p><strong>Region:</strong> ${country.Location.Region}</p>
                    <p><strong>Borders:</strong> ${country.Location.Borders.join(', ')}</p>
                    <p><strong>Population:</strong> ${country.Population['2023 Estimate']}</p>
                    <p><strong>Area:</strong> ${country.Geography['Total Area']} km²</p>
                    <p><strong>Languages:</strong> ${country['Languages and Ethnic Groups']['Official Languages'].join(', ')}</p>
                    <p><strong>Ethnic Groups:</strong> ${Object.entries(country['Languages and Ethnic Groups']['Ethnic Groups (2019 estimates)'])
                        .map(([group, percentage]) => `${group}: ${percentage}`).join(', ')}</p>
                    <p><strong>Religion:</strong> ${country.Religion.Primary}</p>
                    <p><strong>Government:</strong> ${country.Government.Type}</p>
                    <p><strong>Economy:</strong> GDP (PPP): ${country.Economy['GDP (PPP) 2020 Estimate'].Total}, GDP per Capita (PPP): ${country.Economy['GDP (PPP) 2020 Estimate']['Per Capita']}</p>
                `;
            } else {
                document.getElementById('info').innerHTML = 'Country data not found.';
            }
        })
        .catch(error => {
            console.error('Error fetching country data:', error);
            document.getElementById('info').innerHTML = 'Country data not found.';
        });
}
