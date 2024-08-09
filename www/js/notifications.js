export class NotificationManager {
    constructor() {
        this.notifications = [];
        this.allNotificationsSection = document.getElementById('all-notifications');
        this.recentNotificationsSection = document.getElementById('recent-notifications');

        // Initialize viewed notifications
        this.allViewedNotifications = JSON.parse(localStorage.getItem('allViewedNotifications')) || [];
        this.recentlyViewedNotifications = JSON.parse(localStorage.getItem('recentlyViewedNotifications')) || [];
        this.updateNotificationList();
    }

    displayNotification(title, message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now().toString(),
            title,
            message,
            type,
            timestamp: new Date().toISOString()
        };

        this.notifications.push(notification);
        this.showPopupNotification(notification, duration);

        // Save notification to viewed lists after displaying
        setTimeout(() => {
            this.saveViewedNotification(notification);
            this.updateNotificationList();
        }, duration);
    }

    showPopupNotification(notification, duration) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `popup-notification ${notification.type}`;
        notificationElement.innerHTML = `
            <h3>${notification.title}</h3>
            <p>${notification.message}</p>
            <button class="btn close-notification">OK</button>
        `;
        document.body.appendChild(notificationElement);

        notificationElement.querySelector('.close-notification').addEventListener('click', () => {
            this.removeNotification(notificationElement);
        });

        // Auto-remove the popup after the duration
        setTimeout(() => {
            this.removeNotification(notificationElement);
        }, duration);
    }

    removeNotification(notificationElement) {
        document.body.removeChild(notificationElement);
        this.notifications = this.notifications.filter(n => n !== notificationElement);
    }

    saveViewedNotification(notification) {
        // Add to "All Notifications"
        if (!this.allViewedNotifications.some(n => n.id === notification.id)) {
            this.allViewedNotifications.push(notification);
        }

        // Add to "Recent Notifications" and limit to the 5 most recent
        this.recentlyViewedNotifications.unshift(notification);
        this.recentlyViewedNotifications = this.recentlyViewedNotifications.slice(0, 5);

        // Save to localStorage
        localStorage.setItem('allViewedNotifications', JSON.stringify(this.allViewedNotifications));
        localStorage.setItem('recentlyViewedNotifications', JSON.stringify(this.recentlyViewedNotifications));
    }

    updateNotificationList() {
        this.allNotificationsSection.innerHTML = '';
        this.recentNotificationsSection.innerHTML = '';

        // Display all notifications
        this.allViewedNotifications.forEach(notification => {
            const notificationElement = this.createNotificationElement(notification);
            this.allNotificationsSection.appendChild(notificationElement);
        });

        // Display recent notifications
        this.recentlyViewedNotifications.forEach(notification => {
            const notificationElement = this.createNotificationElement(notification);
            this.recentNotificationsSection.appendChild(notificationElement);
        });
    }

    createNotificationElement(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification-item';
        notificationElement.innerHTML = `
            <h3>${notification.title}</h3>
            <p>${notification.message}</p>
            <a href="#" class="view-details-link" data-notification='${JSON.stringify(notification)}'>View Details</a>
            <button class="delete-notification">Delete</button>
        `;

        notificationElement.querySelector('.view-details-link').addEventListener('click', (event) => {
            event.preventDefault();
            this.displayNotificationDetails(notification);
        });

        notificationElement.querySelector('.delete-notification').addEventListener('click', () => {
            this.deleteNotification(notification.id);
        });

        return notificationElement;
    }

    displayNotificationDetails(notification) {
        const modal = document.createElement('div');
        modal.className = 'popup-notification';
        modal.style.position = 'fixed';
        modal.style.top = '30%'; // Adjusted to move it down
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '1001';
        modal.innerHTML = `
            <h3>${notification.title}</h3>
            <p>${notification.message}</p>
            <button class="btn close-popup">Close</button>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-popup').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    deleteNotification(notificationId) {
        // Remove from localStorage
        this.allViewedNotifications = this.allViewedNotifications.filter(n => n.id !== notificationId);
        this.recentlyViewedNotifications = this.recentlyViewedNotifications.filter(n => n.id !== notificationId);

        localStorage.setItem('allViewedNotifications', JSON.stringify(this.allViewedNotifications));
        localStorage.setItem('recentlyViewedNotifications', JSON.stringify(this.recentlyViewedNotifications));

        // Update the notification lists
        this.updateNotificationList();
    }

    clearNotificationsAfterTime(timeout = 60000) {
        setTimeout(() => {
            this.clearNotifications();
        }, timeout);
    }

    clearNotifications() {
        this.allViewedNotifications = [];
        this.recentlyViewedNotifications = [];
        localStorage.removeItem('allViewedNotifications');
        localStorage.removeItem('recentlyViewedNotifications');
        this.updateNotificationList();
    }
}

const notificationManager = new NotificationManager();

export function displayNotification(title, message, type) {
    notificationManager.displayNotification(title, message, type);
}

export function clearNotificationsAfterTime(timeout) {
    notificationManager.clearNotificationsAfterTime(timeout);
}
