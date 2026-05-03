export const API_OVERRIDE_STORAGE_KEY = 'HEALTH_AI_BACKEND_URL';

export const isAndroidPlatform = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator?.userAgent?.toLowerCase() || '';
  return /android/i.test(userAgent);
};

export const isCapacitorWebView = () => {
  if (typeof window === 'undefined') return false;
  const protocol = window.location.protocol || '';
  return protocol.startsWith('capacitor') || protocol.startsWith('ionic') || protocol === 'file:';
};

const getApiBaseUrl = () => {
  // 1. Build-time environment variable (highest priority)
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== 'http://10.0.2.2:5000') {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Runtime override from localStorage
  const storedOverride = typeof window !== 'undefined' ? localStorage.getItem(API_OVERRIDE_STORAGE_KEY) : null;
  if (storedOverride) return storedOverride;

  if (typeof window === 'undefined') return 'http://localhost:5000';

  const hostname = window.location.hostname;
  const isAndroid = isAndroidPlatform();

  // 3. Production: deployed on Vercel or any non-local host
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('10.') && !hostname.startsWith('192.168.')) {
    return 'https://backend-intership-health-risk-predication.onrender.com';
  }

  // 4. Android emulator
  if (hostname === '10.0.2.2') return 'http://10.0.2.2:5000';

  // 5. Android device on local network
  if (isAndroid) {
    return 'http://10.75.149.30:5000';
  }

  // 6. Default local development
  return 'http://localhost:5000';
};

export default getApiBaseUrl;
