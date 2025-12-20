const API = {
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    key: 'c4422cf35f4cbed9fd9c8471c0432992'
};

const GITHUB_API = {
    owner: 'shivam123-dev',
    repo: 'weather-app-oss'
};

const search = document.getElementById('submit');
const searchCity = document.getElementById('searchCity');

search.addEventListener('click', (event) => {
    let cityName = searchCity.value;
    event.preventDefault();
    
    fetch(`${API.baseUrl}?q=${cityName}&appid=${API.key}&units=metric`)
        .then(response => {
            return response.json();
        })
        .then(showReport);
});

function showReport(weatherData) {
    // Display city name and country
    let cityElement = document.getElementById('city');
    cityElement.innerText = `${weatherData.name}, ${weatherData.sys.country}`;
    
    // Display temperature
    let tempElement = document.getElementById('main');
    tempElement.innerHTML = `${Math.round(weatherData.main.temp)} &deg;C`;
    
    // Display weather description
    let weatherTextElement = document.getElementById('weather-text');
    weatherTextElement.innerHTML = weatherData.weather[0].main;
}

// Fetch and display collaborators
function fetchCollaborators() {
    const collaboratorsUrl = `https://api.github.com/repos/${GITHUB_API.owner}/${GITHUB_API.repo}/collaborators`;
    
    fetch(collaboratorsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch collaborators');
            }
            return response.json();
        })
        .then(displayCollaborators)
        .catch(error => {
            const collaboratorsList = document.getElementById('collaborators-list');
            collaboratorsList.innerHTML = '<p>Unable to load collaborators at this time.</p>';
            console.error('Error fetching collaborators:', error);
        });
}

function displayCollaborators(collaborators) {
    const collaboratorsList = document.getElementById('collaborators-list');
    
    if (collaborators.length === 0) {
        collaboratorsList.innerHTML = '<p>No collaborators found.</p>';
        return;
    }
    
    collaboratorsList.innerHTML = '';
    
    collaborators.forEach(collaborator => {
        const card = document.createElement('div');
        card.className = 'collaborator-card';
        
        card.innerHTML = `
            <img src="${collaborator.avatar_url}" alt="${collaborator.login}" class="collaborator-avatar">
            <div class="collaborator-name">${collaborator.login}</div>
            <a href="${collaborator.html_url}" target="_blank" class="collaborator-link">View Profile</a>
        `;
        
        collaboratorsList.appendChild(card);
    });
}

// Load collaborators when page loads
document.addEventListener('DOMContentLoaded', fetchCollaborators);
