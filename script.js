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
            // Check if the fetched data has the expected structure
            if (data[countryName]) {
                const country = data[countryName];
                displayCountryData(country);
            } else {
                throw new Error('Country data structure is not as expected');
            }
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
        <canvas id="ethnic-chart" width="400" height="400"></canvas>
        <canvas id="religion-chart" width="400" height="400"></canvas>
    `;

    // Generate pie charts for ethnic groups and religious demographics
    generatePieChart(
        'ethnic-chart',
        'Ethnic Groups (2019 estimates)',
        country['Languages and Ethnic Groups']['Ethnic Groups (2019 estimates)']
    );

    generatePieChart(
        'religion-chart',
        'Religious Demographics',
        {
            'Primary': country.Religion.Primary,
            'Minorities': country.Religion.Minorities
        }
    );
}

// Function to generate a pie chart
function generatePieChart(elementId, title, data) {
    const ctx = document.getElementById(elementId).getContext('2d');
    const labels = Object.keys(data);
    const values = Object.values(data).map(v => parseFloat(v));

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: title
            }
        }
    });
}
