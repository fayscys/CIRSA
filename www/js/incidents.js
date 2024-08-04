const postsContainer = document.getElementById('recent-reports');
const apiUrl = 'https://api.jsonbin.io/v3/b/66ae379ce41b4d34e41b2202';
const apiKey = '$2a$10$Pjo.Uw6T477fr03n1GUrveeCl.0Q6Au6vcfp6gHXUfaJLTFcD9EOO'; // Replace with your actual API key

const incidentDetailsSection = document.getElementById('incident-details');
const backToListButton = incidentDetailsSection.querySelector('#back-to-list');

// Function to fetch and display incidents
function fetchAndDisplayIncidents() {
    fetch(`${apiUrl}/latest`, {
        headers: {
            'X-Master-Key': apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        postsContainer.innerHTML = ''; // Clear previous posts

        if (data.record && data.record.record && data.record.record.posts && Array.isArray(data.record.record.posts)) {
            data.record.record.posts.forEach(incident => {
                displayIncident(incident);
            });
        } else {
            console.error('Invalid data structure:', JSON.stringify(data, null, 2));
        }
    })
    .catch(error => {
        console.error('Error fetching incidents:', error);
    });
}

// Function to display a single incident
function displayIncident(incident) {
    const reportElement = document.createElement('div');
    reportElement.classList.add('report-item');
    reportElement.innerHTML = `
        <h3>${incident.title}</h3>
        <p>${incident.description}</p>
        <p><strong>Category:</strong> ${incident.category}</p>
        <p><strong>Location:</strong> ${incident.location}</p>
        ${incident.fileUrl ? `<img src="${incident.fileUrl}" alt="Incident Image" />` : ''}
        <a href="#" class="view-details-link" data-incident='${JSON.stringify(incident)}'>View Details</a>
    `;
    postsContainer.appendChild(reportElement);

    // Add event listener for view details link
    reportElement.querySelector('.view-details-link').addEventListener('click', (event) => {
        event.preventDefault();
        const incidentData = JSON.parse(event.currentTarget.getAttribute('data-incident'));
        displayIncidentDetails(incidentData);
    });
}

// Function to display the full details of a single incident
function displayIncidentDetails(incident) {
    // Hide other sections and show the incident details section
    document.querySelectorAll('section').forEach(section => section.style.display = 'none');
    incidentDetailsSection.style.display = 'block';

    // Populate incident details
    incidentDetailsSection.querySelector('h3').innerText = incident.title;
    incidentDetailsSection.querySelectorAll('p')[0].innerText = incident.description;
    incidentDetailsSection.querySelectorAll('p')[1].innerHTML = `<strong>Category:</strong> ${incident.category}`;
    incidentDetailsSection.querySelectorAll('p')[2].innerHTML = `<strong>Location:</strong> ${incident.location}`;
    incidentDetailsSection.querySelector('img').src = incident.fileUrl || '';

    // Add event listener for back to list button
    backToListButton.addEventListener('click', () => {
        incidentDetailsSection.style.display = 'none';
        document.getElementById('home').style.display = 'block';
        fetchAndDisplayIncidents();
    });
}

// Function to handle form submission
async function submitIncidentForm(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    console.log('Form data:', { title, description, category, location, file });

    fetch(`${apiUrl}/latest`, {
        headers: {
            'X-Master-Key': apiKey
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error fetching latest data');
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched data:', data);

        const newIncident = {
            id: (data.record.record.posts.length + 1).toString(),
            title: title,
            description: description,
            category: category,
            location: location,
            fileUrl: file ? URL.createObjectURL(file) : null,
            timestamp: new Date()
        };

        data.record.record.posts.push(newIncident);

        console.log('Updated data:', data);

        return fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify({ record: data.record.record })
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit incident');
        }
        return response.json();
    })
    .then(() => {
        fetchAndDisplayIncidents();
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('category').value = '';
        document.getElementById('location').value = '';
        fileInput.value = ''; // Clear file input
        alert('Incident submitted successfully');
    })
    .catch(error => {
        console.error('Error submitting incident:', error);
        alert('Error submitting incident');
    });
}

// Add event listener to the form
document.querySelector('#incidentform form').addEventListener('submit', submitIncidentForm);

// Call fetchAndDisplayIncidents when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayIncidents);


