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
    const nativeName = country.Name?.Native || null;
    const capitalCity = country.Geography?.Capital?.Name || null;
    const largestCity = country.Geography?.LargestCity || null;
    const majorCities = country.Geography?.MajorCities ? country.Geography.MajorCities.join(', ') : null;
    const area = country.Geography?.Area?.Total || null;
    const population = country.Demographics?.Population?.["2023 Estimate"] || country.Demographics?.Population?.["2022 Estimate"] || null;
    const populationDensity = country.Demographics?.Population?.Density || null;
    const ethnicGroups = country.Demographics?.EthnicGroups ? Object.entries(country.Demographics.EthnicGroups).map(([key, value]) => `${key}: ${value}`).join(', ') : null;
    const languages = country.Demographics?.Languages ? country.Demographics.Languages.join(', ') : null;
    const religion = country.Demographics?.Religion ? Object.entries(country.Demographics.Religion).map(([key, value]) => `${key}: ${value}`).join(', ') : null;
    const governmentType = country.Government?.Type || null;
    const president = country.Government?.Leaders?.President || null;
    const primeMinister = country.Government?.Leaders?.PrimeMinister || null;
    const upperHouse = country.Government?.Legislature?.UpperHouse || null;
    const lowerHouse = country.Government?.Legislature?.LowerHouse || null;
    const independenceHistory = country.Government?.IndependenceHistory ? Object.entries(country.Government.IndependenceHistory).map(([key, value]) => `${key}: ${value}`).join(', ') : null;
    const gdpPPP = country.Economy?.["GDP (PPP 2023)"]?.Total || null;
    const gdpNominal = country.Economy?.["GDP (Nominal 2023)"]?.Total || null;
    const gdpPerCapitaPPP = country.Economy?.["GDP (PPP 2023)"]?.["Per Capita"] || null;
    const gdpPerCapitaNominal = country.Economy?.["GDP (Nominal 2023)"]?.["Per Capita"] || null;
    const naturalResources = country.Economy?.NaturalResources ? country.Economy.NaturalResources.join(', ') : null;
    const currency = country.Economy?.Currency || country.Miscellaneous?.Currency || null;
    const hdi = country.Miscellaneous?.["Human Development Index (2021)"] || null;
    const callingCode = country.Miscellaneous?.["Calling Code"] || null;
    const internetTLD = Array.isArray(country.Miscellaneous?.["Internet TLD"]) ? country.Miscellaneous["Internet TLD"].join(', ') : null;
    const unescoSites = country.Miscellaneous?.["UNESCO World Heritage Sites"] || null;
    const publicHolidays = country.Miscellaneous?.["Public Holidays"] ? country.Miscellaneous["Public Holidays"].join(', ') : null;
    const internationalAffiliations = country.InternationalRelations?.Membership ? country.InternationalRelations.Membership.join(', ') : null;

    let infoHtml = `<h2>${name || "Unknown"}</h2>`;
    if (officialName) infoHtml += `<p><strong>Official Name:</strong> ${officialName}</p>`;
    if (nativeName) infoHtml += `<p><strong>Native Name:</strong> ${Object.entries(nativeName).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>`;
    if (capitalCity) infoHtml += `<p><strong>Capital City:</strong> ${capitalCity}</p>`;
    if (largestCity) infoHtml += `<p><strong>Largest City:</strong> ${largestCity}</p>`;
    if (majorCities) infoHtml += `<p><strong>Major Cities:</strong> ${majorCities}</p>`;
    if (area) infoHtml += `<p><strong>Area:</strong> ${area} km²</p>`;
    if (population) infoHtml += `<p><strong>Population (2023 Estimate):</strong> ${population}</p>`;
    if (populationDensity) infoHtml += `<p><strong>Population Density:</strong> ${populationDensity} per km²</p>`;
    if (ethnicGroups) infoHtml += `<p><strong>Ethnic Groups:</strong> ${ethnicGroups}</p>`;
    if (languages) infoHtml += `<p><strong>Languages:</strong> ${languages}</p>`;
    if (religion) infoHtml += `<p><strong>Religion:</strong> ${religion}</p>`;
    if (governmentType) infoHtml += `<p><strong>Government Type:</strong> ${governmentType}</p>`;
    if (president) infoHtml += `<p><strong>President:</strong> ${president}</p>`;
    if (primeMinister) infoHtml += `<p><strong>Prime Minister:</strong> ${primeMinister}</p>`;
    if (upperHouse) infoHtml += `<p><strong>Upper House:</strong> ${upperHouse}</p>`;
    if (lowerHouse) infoHtml += `<p><strong>Lower House:</strong> ${lowerHouse}</p>`;
    if (independenceHistory) infoHtml += `<p><strong>Independence History:</strong> ${independenceHistory}</p>`;
    if (gdpPPP) infoHtml += `<p><strong>GDP (PPP 2023):</strong> ${gdpPPP} USD</p>`;
    if (gdpNominal) infoHtml += `<p><strong>GDP (Nominal 2023):</strong> ${gdpNominal} USD</p>`;
    if (gdpPerCapitaPPP) infoHtml += `<p><strong>GDP per Capita (PPP):</strong> ${gdpPerCapitaPPP} USD</p>`;
    if (gdpPerCapitaNominal) infoHtml += `<p><strong>GDP per Capita (Nominal):</strong> ${gdpPerCapitaNominal} USD</p>`;
    if (naturalResources) infoHtml += `<p><strong>Natural Resources:</strong> ${naturalResources}</p>`;
    if (currency) infoHtml += `<p><strong>Currency:</strong> ${currency}</p>`;
    if (hdi) infoHtml += `<p><strong>Human Development Index (2021):</strong> ${hdi}</p>`;
    if (callingCode) infoHtml += `<p><strong>Calling Code:</strong> ${callingCode}</p>`;
    if (internetTLD) infoHtml += `<p><strong>Internet TLD:</strong> ${internetTLD}</p>`;
    if (unescoSites) infoHtml += `<p><strong>UNESCO World Heritage Sites:</strong> ${unescoSites}</p>`;
    if (publicHolidays) infoHtml += `<p><strong>Public Holidays:</strong> ${publicHolidays}</p>`;
    if (internationalAffiliations) infoHtml += `<p><strong>International Affiliations:</strong> ${internationalAffiliations}</p>`;

    document.getElementById('info').innerHTML = infoHtml;
}
