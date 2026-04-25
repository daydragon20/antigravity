// Firebase Cloud Messaging Service Worker
// This file handles background push notifications.
// Requires Firebase to be set up in the project.
// See src/lib/fcm.ts for initialization code.

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config will be injected at runtime via a separate endpoint.
// For now, this SW handles background messages once Firebase is configured.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const app = firebase.initializeApp(event.data.config);
    const messaging = firebase.messaging(app);

    messaging.onBackgroundMessage((payload) => {
      const { title, body, icon } = payload.notification || {};
      self.registration.showNotification(title || 'Flow State', {
        body: body || '',
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data,
        actions: payload.data?.actions ? JSON.parse(payload.data.actions) : [],
      });
    });
  }
});
