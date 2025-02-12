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
    const name = country.Name?.Common || null;
    const officialName = country.Name?.Official || null;
    const capitalCity = country.Geography?.["Capital City"] || null;
    const largestCity = country.Geography?.["Largest City"] || null;
    const majorCities = country.Geography?.["Major Cities"] ? country.Geography["Major Cities"].join(', ') : null;
    const area = country.Geography?.Area?.["Total (km2)"] || null;
    const population = country.Demographics?.Population?.["2022 Estimate"] || country.Demographics?.Population?.["2023 Estimate"] || null;
    const governmentType = country.Government?.Type || null;
    const president = country.Government?.President || null;
    const primeMinister = country.Government?.["Prime Minister"] || null;
    const upperHouse = country.Government?.Legislature?.["Upper House"] || null;
    const lowerHouse = country.Government?.Legislature?.["Lower House"] || null;
    const gdpPPP = country.Economy?.["GDP (PPP 2023) Total (Trillion USD)"] || country.Economy?.["GDP (PPP 2023)"]?.Total || null;
    const gdpNominal = country.Economy?.["GDP (Nominal 2023) Total (Trillion USD)"] || country.Economy?.["GDP (Nominal 2023)"]?.Total || null;
    const gdpPerCapitaPPP = country.Economy?.["GDP per Capita (PPP USD)"] || country.Economy?.["GDP (PPP 2023)"]?.["Per Capita"] || null;
    const gdpPerCapitaNominal = country.Economy?.["GDP per Capita (Nominal USD)"] || country.Economy?.["GDP (Nominal 2023)"]?.["Per Capita"] || null;
    const primaryReligion = country.Demographics?.Religion?.Primary || country.Demographics?.Religion?.Christianity || null;
    const otherReligions = country.Demographics?.Religion?.Minorities
        ? Object.entries(country.Demographics.Religion.Minorities).map(([key, value]) => `${key}: ${value}`).join(', ')
        : null;
    const hdi = country.Miscellaneous?.["Human Development Index (2021)"] || null;
    const currency = country.Miscellaneous?.Currency || null;
    const callingCode = country.Miscellaneous?.["Calling Code"] || null;
    const internetTLD = Array.isArray(country.Miscellaneous?.["Internet TLD"]) ? country.Miscellaneous["Internet TLD"].join(', ') : null;
    const unescoSites = country.Miscellaneous?.["UNESCO World Heritage Sites"] || null;

    let infoHtml = `<h2>${name || "Unknown"}</h2>`;
    if (officialName) infoHtml += `<p><strong>Official Name:</strong> ${officialName}</p>`;
    if (capitalCity) infoHtml += `<p><strong>Capital City:</strong> ${capitalCity}</p>`;
    if (largestCity) infoHtml += `<p><strong>Largest City:</strong> ${largestCity}</p>`;
    if (majorCities) infoHtml += `<p><strong>Major Cities:</strong> ${majorCities}</p>`;
    if (area) infoHtml += `<p><strong>Area:</strong> ${area} km²</p>`;
    if (population) infoHtml += `<p><strong>Population (2022 Estimate):</strong> ${population}</p>`;
    if (governmentType) infoHtml += `<p><strong>Government Type:</strong> ${governmentType}</p>`;
    if (president) infoHtml += `<p><strong>President:</strong> ${president}</p>`;
    if (primeMinister) infoHtml += `<p><strong>Prime Minister:</strong> ${primeMinister}</p>`;
    if (upperHouse) infoHtml += `<p><strong>Upper House:</strong> ${upperHouse}</p>`;
    if (lowerHouse) infoHtml += `<p><strong>Lower House:</strong> ${lowerHouse}</p>`;
    if (gdpPPP) infoHtml += `<p><strong>GDP (PPP 2023):</strong> ${gdpPPP} Trillion USD</p>`;
    if (gdpNominal) infoHtml += `<p><strong>GDP (Nominal 2023):</strong> ${gdpNominal} Trillion USD</p>`;
    if (gdpPerCapitaPPP) infoHtml += `<p><strong>GDP per Capita (PPP USD):</strong> ${gdpPerCapitaPPP}</p>`;
    if (gdpPerCapitaNominal) infoHtml += `<p><strong>GDP per Capita (Nominal USD):</strong> ${gdpPerCapitaNominal}</p>`;
    if (primaryReligion) infoHtml += `<p><strong>Primary Religion:</strong> ${primaryReligion}</p>`;
    if (otherReligions) infoHtml += `<p><strong>Other Religions:</strong> ${otherReligions}</p>`;
    if (hdi) infoHtml += `<p><strong>Human Development Index (2021):</strong> ${hdi}</p>`;
    if (currency) infoHtml += `<p><strong>Currency:</strong> ${currency}</p>`;
    if (callingCode) infoHtml += `<p><strong>Calling Code:</strong> ${callingCode}</p>`;
    if (internetTLD) infoHtml += `<p><strong>Internet TLD:</strong> ${internetTLD}</p>`;
    if (unescoSites) infoHtml += `<p><strong>UNESCO World Heritage Sites:</strong> ${unescoSites}</p>`;

    document.getElementById('info').innerHTML = infoHtml;
}
