import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js';
import { displayNotification } from './notifications.js';

const apiUrl = 'https://api.jsonbin.io/v3/b/66ae379ce41b4d34e41b2202';
const apiKey = '$2a$10$Pjo.Uw6T477fr03n1GUrveeCl.0Q6Au6vcfp6gHXUfaJLTFcD9EOO';

const storage = getStorage();
const recentReports = document.getElementById('recent-reports');
const allViewedContainer = document.getElementById('all-viewed');
const recentlyViewedContainer = document.getElementById('recently-viewed');
const incidentDetails = document.getElementById('incident-details');

// Function to upload an image to Firebase Storage
async function uploadImage(file) {
    const storageRef = ref(storage, 'images/' + file.name);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// Function to truncate description
function truncateDescription(description, maxLength = 100) {
    return description.length > maxLength
        ? description.substring(0, maxLength) + '...'
        : description;
}

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
        allViewedContainer.innerHTML = ''; // Clear all viewed container
        recentlyViewedContainer.innerHTML = ''; // Clear recently viewed container

        if (data.record && data.record.record && data.record.record.posts && Array.isArray(data.record.record.posts)) {
            // Sort the incidents by timestamp in descending order
            data.record.record.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            data.record.record.posts.forEach(incident => {
                displayIncident(incident);
                displayViewedReports(incident);
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
    reportElement.setAttribute('data-category', incident.category);
    reportElement.innerHTML = `
        <h3>${incident.title}</h3>
        <p class="description">${truncateDescription(incident.description)}</p>
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
        displayIncidentDetailsInSeparateSection(incidentData);
    });

    if (isOwner) {
        reportElement.querySelector('.edit-post').addEventListener('click', (event) => {
            event.preventDefault();
            const incidentData = JSON.parse(event.currentTarget.getAttribute('data-incident'));
            editIncident(incidentData);
            showIncidentForm();
            updateSubmitButtonText('Update'); // Change button text to 'Update'
        });

        reportElement.querySelector('.delete-post').addEventListener('click', () => {
            showConfirmationModal(incident.id);
        });
    }
}

// Function to display incidents in the "Viewed Reports" section
function displayViewedReports(incident) {
    // Check if the incident already exists in the viewed reports section
    const existingReport = allViewedContainer.querySelector(`[data-id="${incident.id}"]`);

    if (!existingReport) {
        const reportElement = document.createElement('div');
        reportElement.classList.add('report-item');
        reportElement.setAttribute('data-id', incident.id);
        reportElement.innerHTML = `
            <h3>${incident.title}</h3>
            <p>${truncateDescription(incident.description)}</p>
            <p><strong>Category:</strong> ${incident.category}</p>
            <p><strong>Location:</strong> ${incident.location}</p>
            ${incident.fileUrl ? `<img src="${incident.fileUrl}" alt="Incident Image" />` : ''}
            <a href="#" class="view-details-link" data-incident='${JSON.stringify(incident)}'>View Details</a>
        `;

        // Append to All Viewed section
        allViewedContainer.appendChild(reportElement);

        // Append to Recently Viewed section (limit to 5 recent incidents)
        if (recentlyViewedContainer.childElementCount < 5) {
            recentlyViewedContainer.appendChild(reportElement.cloneNode(true));
        }

        // Add event listener for view details
        reportElement.querySelector('.view-details-link').addEventListener('click', (event) => {
            event.preventDefault();
            const incidentData = JSON.parse(event.currentTarget.getAttribute('data-incident'));
            displayViewedReportDetails(incidentData);
        });
    }
}

// Function to display the full details of a viewed report
function displayViewedReportDetails(incident) {
    incidentDetails.innerHTML = `
        <h3>${incident.title}</h3>
        <p>${incident.description}</p>
        <p><strong>Category:</strong> ${incident.category}</p>
        <p><strong>Location:</strong> ${incident.location}</p>
        ${incident.fileUrl ? `<img src="${incident.fileUrl}" alt="Incident Image" />` : ''}
        <button id="back-to-list">Back to List</button>
    `;

    // Display the details on the right half of the screen
    incidentDetails.style.display = 'block';

    // Adjust the layout if needed
    allViewedContainer.style.height = '100vh'; // Extend to the full height
    allViewedContainer.style.width = '48%'; // Left side (viewed reports)
    incidentDetails.style.width = '48%'; // Right side (incident details)
    incidentDetails.style.position = 'absolute';
    incidentDetails.style.right = '0'; // Align to the right half

    // Add event listener for the back-to-list button
    document.getElementById('back-to-list').addEventListener('click', () => {
        incidentDetails.style.display = 'none'; // Hide the incident details
    });
}

// Function to display the full details of a single incident in a separate section
function displayIncidentDetailsInSeparateSection(incident) {
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
        displayNotification('You need to be logged in to submit an incident.', 'error');
        return;
    }
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    let fileUrl = '';
    if (file) {
        fileUrl = await uploadImage(file);
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const incidentData = {
            title,
            description,
            category,
            location: `${latitude}, ${longitude}`,
            fileUrl,
            latitude,
            longitude,
            timestamp: new Date(), // Include timestamp
            userId: user.uid
        };
        // Submit the incident data to the API
        fetch(`${apiUrl}/latest`, {
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const newIncident = {
                id: (data.record.record.posts.length + 1).toString(),
                ...incidentData
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
            fileInput.value = '';
            updateSubmitButtonText('Submit'); // Change button text to 'Submit'
            displayNotification('Incident submitted successfully', 'success');
        })
        .catch(error => {
            console.error('Error submitting incident:', error);
            displayNotification('Error submitting incident', 'error');
        });
    }, (error) => {
        console.error('Geolocation error:', error);
    });
}

// Function to edit an incident
function editIncident(incident) {
    populateFormFields(incident);
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
                fileUrl,
                timestamp: new Date() // Update timestamp
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
            displayNotification('Incident updated successfully', 'success');
        })
        .catch(error => {
            console.error('Error updating incident:', error);
            displayNotification('Error updating incident', 'error');
        });
    });
}

// Function to delete an incident with confirmation modal
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
        displayNotification('Incident deleted successfully', 'success');
    })
    .catch(error => {
        console.error('Error deleting incident:', error);
        displayNotification('Error deleting incident', 'error');
    });
}

// Function to populate form fields with incident data
function populateFormFields(incident) {
    document.getElementById('title').value = incident.title;
    document.getElementById('description').value = incident.description;
    document.getElementById('category').value = incident.category;
}

// Function to show the incident form
function showIncidentForm() {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('incidentform').style.display = 'block';
}

// Function to update the submit button text
function updateSubmitButtonText(text) {
    const submitButton = document.querySelector('#incidentform button[type="submit"]');
    submitButton.textContent = text;
}

// Function to handle navigation and refresh
function setupNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-menu-item');

    sidebarItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const target = event.currentTarget.getAttribute('data-target');
            showSection(target);
            if (target === 'home') {
                fetchAndDisplayIncidents(); // Refresh incidents on home click
            }
        });
    });
}

// Function to show the appropriate section
function showSection(target) {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(target).style.display = 'block';
}

// Add event listener to the form
document.querySelector('#incidentform form').addEventListener('submit', submitIncidentForm);

// Call fetchAndDisplayIncidents and setupNavigation when the page loads
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchAndDisplayIncidents();
        } else {
            displayNotification('You need to be logged in to view incidents.', 'error');
        }
    });
    setupNavigation();
};

// Function to show confirmation modal
function showConfirmationModal(incidentId) {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'block';

    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    confirmDeleteButton.onclick = () => {
        deleteIncident(incidentId);
        modal.style.display = 'none';
    };

    cancelDeleteButton.onclick = () => {
        modal.style.display = 'none';
    };
}
