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
    const name = country.Name?.Common || "Unknown";
    const officialName = country.Name?.Official || "Unknown";
    const capitalCity = country.Geography?.["Capital City"] || "Unknown";
    const largestCity = country.Geography?.["Largest City"] || "Unknown";
    const majorCities = country.Geography?.["Major Cities"] ? country.Geography["Major Cities"].join(', ') : "N/A";
    const area = country.Geography?.Area?.["Total (km2)"] || "Unknown";
    const population = country.Demographics?.Population?.["2022 Estimate"] || country.Demographics?.Population?.["2023 Estimate"] || "Unknown";
    const governmentType = country.Government?.Type || "Unknown";
    const president = country.Government?.President || "Unknown";
    const primeMinister = country.Government?.["Prime Minister"] || "N/A";
    const upperHouse = country.Government?.Legislature?.["Upper House"] || "Unknown";
    const lowerHouse = country.Government?.Legislature?.["Lower House"] || "Unknown";
    const gdpPPP = country.Economy?.["GDP (PPP 2023) Total (Trillion USD)"] || country.Economy?.["GDP (PPP 2023)"]?.Total || "Unknown";
    const gdpNominal = country.Economy?.["GDP (Nominal 2023) Total (Trillion USD)"] || country.Economy?.["GDP (Nominal 2023)"]?.Total || "Unknown";
    const gdpPerCapitaPPP = country.Economy?.["GDP per Capita (PPP USD)"] || country.Economy?.["GDP (PPP 2023)"]?.["Per Capita"] || "Unknown";
    const gdpPerCapitaNominal = country.Economy?.["GDP per Capita (Nominal USD)"] || country.Economy?.["GDP (Nominal 2023)"]?.["Per Capita"] || "Unknown";
    const primaryReligion = country.Demographics?.Religion?.Primary || country.Demographics?.Religion?.Christianity || "Unknown";
    const otherReligions = country.Demographics?.Religion?.Minorities
        ? Object.entries(country.Demographics.Religion.Minorities).map(([key, value]) => `${key}: ${value}`).join(', ')
        : "N/A";
    const hdi = country.Miscellaneous?.["Human Development Index (2021)"] || "Unknown";
    const currency = country.Miscellaneous?.Currency || "Unknown";
    const callingCode = country.Miscellaneous?.["Calling Code"] || "Unknown";
    const internetTLD = country.Miscellaneous?.["Internet TLD"] ? country.Miscellaneous["Internet TLD"].join(', ') : "Unknown";
    const unescoSites = country.Miscellaneous?.["UNESCO World Heritage Sites"] || "Unknown";

    document.getElementById('info').innerHTML = `
        <h2>${name}</h2>
        <p><strong>Official Name:</strong> ${officialName}</p>
        <p><strong>Capital City:</strong> ${capitalCity}</p>
        <p><strong>Largest City:</strong> ${largestCity}</p>
        <p><strong>Major Cities:</strong> ${majorCities}</p>
        <p><strong>Area:</strong> ${area} km²</p>
        <p><strong>Population (2022 Estimate):</strong> ${population}</p>
        <p><strong>Government Type:</strong> ${governmentType}</p>
        <p><strong>President:</strong> ${president}</p>
        <p><strong>Prime Minister:</strong> ${primeMinister}</p>
        <p><strong>Upper House:</strong> ${upperHouse}</p>
        <p><strong>Lower House:</strong> ${lowerHouse}</p>
        <p><strong>GDP (PPP 2023):</strong> ${gdpPPP} Trillion USD</p>
        <p><strong>GDP (Nominal 2023):</strong> ${gdpNominal} Trillion USD</p>
        <p><strong>GDP per Capita (PPP USD):</strong> ${gdpPerCapitaPPP}</p>
        <p><strong>GDP per Capita (Nominal USD):</strong> ${gdpPerCapitaNominal}</p>
        <p><strong>Primary Religion:</strong> ${primaryReligion}</p>
        <p><strong>Other Religions:</strong> ${otherReligions}</p>
        <p><strong>Human Development Index (2021):</strong> ${hdi}</p>
        <p><strong>Currency:</strong> ${currency}</p>
        <p><strong>Calling Code:</strong> ${callingCode}</p>
        <p><strong>Internet TLD:</strong> ${internetTLD}</p>
        <p><strong>UNESCO World Heritage Sites:</strong> ${unescoSites}</p>
    `;
}
