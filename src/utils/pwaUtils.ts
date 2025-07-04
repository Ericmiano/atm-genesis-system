
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Show update available notification
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const showUpdateNotification = () => {
  if (Notification.permission === 'granted') {
    new Notification('App Update Available', {
      body: 'A new version of ATM Genesis is available. Refresh to update.',
      icon: '/icon-192x192.png',
      tag: 'app-update'
    });
  }
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

export const checkInstallPrompt = () => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    showInstallButton(deferredPrompt);
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
};

const showInstallButton = (deferredPrompt: any) => {
  // Create install button
  const installButton = document.createElement('button');
  installButton.textContent = 'Install App';
  installButton.className = 'fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      installButton.remove();
    }
  });
  
  document.body.appendChild(installButton);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (installButton.parentNode) {
      installButton.remove();
    }
  }, 10000);
};

export const getStorageUsage = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      usageDetails: estimate.usageDetails
    };
  }
  return null;
};

export const isOffline = () => !navigator.onLine;

export const onConnectionChange = (callback: (isOnline: boolean) => void) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

export const enableBackgroundSync = (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(tag);
    }).catch((error) => {
      console.log('Background sync registration failed:', error);
    });
  }
};
