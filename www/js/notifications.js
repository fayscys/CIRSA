export class NotificationManager {
  constructor() {
    this.notifications = [];
    this.notificationSection = document.getElementById('notification');
  }

  displayNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <h3>${title}</h3>
      <p>${message}</p>
      <button class="close-notification">x</button>
    `;

    this.notificationSection.appendChild(notification);

    notification.querySelector('.close-notification').addEventListener('click', () => {
      this.removeNotification(notification);
    });

    this.notifications.push(notification);
  }

  removeNotification(notification) {
    this.notificationSection.removeChild(notification);
    this.notifications = this.notifications.filter((n) => n !== notification);
  }

  updateNotificationList() {
    this.notifications.forEach((notification) => {
      // Update notification logic here
    });
  }

  clearNotifications() {
    this.notifications.forEach((notification) => {
      this.removeNotification(notification);
    });
  }
}

const notificationManager = new NotificationManager();

export function displayNotification(title, message, type) {
notificationManager.displayNotification(title, message, type);
}

export function removeNotification(notification) {
notificationManager.removeNotification(notification);
}

export function updateNotificationList() {
notificationManager.updateNotificationList();
}

export function clearNotifications() {
notificationManager.clearNotifications();
}


