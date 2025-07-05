
// PWA utilities for service worker and offline functionality

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.log('Error requesting notification permission:', error);
      return false;
    }
  }
  return false;
};

export const checkInstallPrompt = () => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or prompt
    console.log('PWA install prompt available');
  });

  return {
    showInstallPrompt: async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
      }
    }
  };
};

export const onConnectionChange = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial call
  callback(navigator.onLine);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export const isOnline = () => navigator.onLine;

export const showOfflineToast = () => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  toast.textContent = 'You are now offline. Some features may be limited.';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 5000);
};

export const showOnlineToast = () => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  toast.textContent = 'Connection restored. All features are available.';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
};
