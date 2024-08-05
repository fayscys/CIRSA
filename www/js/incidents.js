import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const apiUrl = 'https://api.jsonbin.io/v3/b/66ae379ce41b4d34e41b2202';
const apiKey = '$2a$10$Pjo.Uw6T477fr03n1GUrveeCl.0Q6Au6vcfp6gHXUfaJLTFcD9EOO';

const storage = getStorage();

async function uploadImage(file) {
    const storageRef = ref(storage, 'images/' + file.name);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

const recentReports = document.getElementById('recent-reports');

// Function to fetch and display incidents
function fetchAndDisplayIncidents() {
    fetch(`${apiUrl}/latest`, {
        headers: {
            'X-Master-Key': apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        recentReports.innerHTML = ''; // Clear previous posts

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
    const user = auth.currentUser;
    const isOwner = user && user.uid === incident.userId;

    const reportElement = document.createElement('div');
    reportElement.classList.add('report-item');
    reportElement.innerHTML = `
        <h3>${incident.title}</h3>
        <p>${incident.description}</p>
        <p><strong>Category:</strong> ${incident.category}</p>
        <p><strong>Location:</strong> ${incident.location}</p>
        ${incident.fileUrl ? `<img src="${incident.fileUrl}" alt="Incident Image" />` : ''}
        <a href="#" class="view-details-link" data-incident='${JSON.stringify(incident)}'>View Details</a>
        ${isOwner ? `<button class="edit-post" data-incident='${JSON.stringify(incident)}'>Edit</button>` : ''}
        ${isOwner ? `<button class="delete-post" data-id="${incident.id}">Delete</button>` : ''}
    `;
    recentReports.appendChild(reportElement);

    // Add event listeners for view details, edit, and delete buttons
    reportElement.querySelector('.view-details-link').addEventListener('click', (event) => {
        event.preventDefault();
        const incidentData = JSON.parse(event.currentTarget.getAttribute('data-incident'));
        displayIncidentDetails(incidentData);
    });

    if (isOwner) {
        reportElement.querySelector('.edit-post').addEventListener('click', (event) => {
            event.preventDefault();
            const incidentData = JSON.parse(event.currentTarget.getAttribute('data-incident'));
            populateFormFields(incidentData);
            showIncidentForm();
        });

        reportElement.querySelector('.delete-post').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this incident?')) {
                deleteIncident(incident.id);
            }
        });
    }
}

// Function to display the full details of a single incident
function displayIncidentDetails(incident) {
    const incidentDetails = document.getElementById('incident-details');
    incidentDetails.innerHTML = `
        <h3>${incident.title}</h3>
        <p>${incident.description}</p>
        <p><strong>Category:</strong> ${incident.category}</p>
        <p><strong>Location:</strong> ${incident.location}</p>
        ${incident.fileUrl ? `<img src="${incident.fileUrl}" alt="Incident Image" />` : ''}
        <button id="back-to-list">Back to List</button>
    `;

    incidentDetails.style.display = 'block';
    recentReports.style.display = 'none';

    document.getElementById('back-to-list').addEventListener('click', () => {
        incidentDetails.style.display = 'none';
        recentReports.style.display = 'block';
    });
}

// Function to handle form submission
async function submitIncidentForm(event) {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert('You need to be logged in to submit an incident.');
        return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    let fileUrl = '';
    if (file) {
        fileUrl = await uploadImage(file);
    }

    fetch(`${apiUrl}/latest`, {
        headers: {
            'X-Master-Key': apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        const newIncident = {
            id: (data.record.record.posts.length + 1).toString(),
            title,
            description,
            category,
            location,
            fileUrl,
            timestamp: new Date(),
            userId: user.uid // Store the user's ID with the incident
        };

        data.record.record.posts.push(newIncident);

        return fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify({ record: data.record.record })
        });
    })
    .then(response => response.json())
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

// Function to edit an incident
function editIncident(incident) {
    document.getElementById('title').value = incident.title;
    document.getElementById('description').value = incident.description;
    document.getElementById('category').value = incident.category;
    document.getElementById('location').value = incident.location;
    document.getElementById('file').value = ''; // Clear file input

    const submitButton = document.querySelector('form button[type="submit"]');
    submitButton.textContent = 'Update';
    submitButton.removeEventListener('click', submitIncidentForm);

    submitButton.addEventListener('click', function updateIncident(event) {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;
        const location = document.getElementById('location').value;
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        let fileUrl = incident.fileUrl;
        if (file) {
            fileUrl = URL.createObjectURL(file);
        }

        fetch(`${apiUrl}/latest`, {
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const updatedIncident = {
                ...incident,
                title,
                description,
                category,
                location,
                fileUrl
            };

            const index = data.record.record.posts.findIndex(post => post.id === incident.id);
            data.record.record.posts[index] = updatedIncident;

            return fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify({ record: data.record.record })
            });
        })
        .then(response => response.json())
        .then(() => {
            fetchAndDisplayIncidents();
            submitButton.textContent = 'Submit';
            submitButton.removeEventListener('click', updateIncident);
            submitButton.addEventListener('click', submitIncidentForm);
            alert('Incident updated successfully');
        })
        .catch(error => {
            console.error('Error updating incident:', error);
            alert('Error updating incident');
        });
    });
}

// Function to delete an incident
function deleteIncident(incidentId) {
    fetch(`${apiUrl}/latest`, {
        headers: {
            'X-Master-Key': apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        data.record.record.posts = data.record.record.posts.filter(post => post.id !== incidentId);

        return fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify({ record: data.record.record })
        });
    })
    .then(response => response.json())
    .then(() => {
        fetchAndDisplayIncidents();
        alert('Incident deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting incident:', error);
        alert('Error deleting incident');
    });
}

// Add event listener to the form
document.querySelector('#incidentform form').addEventListener('submit', submitIncidentForm);

// Call fetchAndDisplayIncidents when the page loads
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchAndDisplayIncidents();
        } else {
            alert('You need to be logged in to view incidents.');
        }
    });
};

// Function to populate form fields with incident data
function populateFormFields(incident) {
    document.getElementById('title').value = incident.title;
    document.getElementById('description').value = incident.description;
    document.getElementById('category').value = incident.category;
    document.getElementById('location').value = incident.location;
}

// Function to show the incident form
function showIncidentForm() {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('incidentform').style.display = 'block';
}
