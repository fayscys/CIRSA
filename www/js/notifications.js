export class NotificationManager {
  constructor() {
    this.notifications = [];
    this.notificationSection = document.getElementById('notification');
  }

  displayNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `popup-notification ${type}`;
    notification.innerHTML = `
      <p>${message}</p>
      <button class="btn close-notification">OK</button>
    `;

    document.body.appendChild(notification);

    notification.querySelector('.close-notification').addEventListener('click', () => {
      this.removeNotification(notification);
    });

    this.notifications.push(notification);
  }

  removeNotification(notification) {
    document.body.removeChild(notification);
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

export function displayNotification(message, type) {
  notificationManager.displayNotification(message, type);
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



