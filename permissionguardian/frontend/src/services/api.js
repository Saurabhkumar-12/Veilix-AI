import axios from 'axios';

// Use the product service endpoint.
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial: Send HttpOnly auth cookies with requests
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

/**
 * Analyzes Google Play Store app permissions given a URL
 * @param {string} url - Google Play Store URL or Package ID
 * @returns {Promise<Object>} Analyzed app data
 */
export async function analyzeAppPermissions(url) {
  try {
    const response = await apiClient.post('/analyze', { url });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Analysis request timed out while fetching Play Store data. Please try again.');
    } else if (error.request) {
      throw new Error('Unable to reach the analysis service. Please try again shortly.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while analyzing the app.');
    }
  }
}

export async function analyzeApplicationUrl(url, playStore = false) {
  try { return (await apiClient.post(playStore ? '/analyze/playstore' : '/analyze/url', { url })).data; }
  catch (error) { throw new Error(error.response?.data?.message || 'Unable to analyze this application URL.'); }
}

export async function analyzeApkFile(file, category = 'Utility') {
  try {
    return (await apiClient.post('/analyze/apk', file, { headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': file.name, 'X-App-Category': category }, timeout: 60000 })).data;
  } catch (error) { throw new Error(error.response?.data?.message || 'Unable to analyze this APK.'); }
}

export async function compareAnalyses(beforeAnalysisId, afterAnalysisId) {
  try { return (await apiClient.post('/compare', { beforeAnalysisId, afterAnalysisId })).data; }
  catch (error) { throw new Error(error.response?.data?.message || 'Unable to compare these analyses.'); }
}

export async function askSecurityAssistant(analysisId, question, history = []) {
  try { return (await apiClient.post(`/analysis/${analysisId}/assistant`, { question, history })).data; }
  catch (error) { throw new Error(error.response?.data?.message || 'The Security Assistant is unavailable.'); }
}

// FEATURE 1: Attack Simulator API Call
export async function simulatePrivacyImpactApi(payload) {
  try {
    if (typeof payload === 'string') {
      return (await apiClient.get(`/analysis/${payload}/attack-simulation`)).data;
    }
    return (await apiClient.post('/simulate/privacy-impact', payload)).data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to generate Privacy Impact Simulation.');
  }
}

// FEATURE 2: Time Machine API Call
export async function compareVersionsApi(before, after) {
  try {
    const payload = typeof before === 'string' && typeof after === 'string'
      ? { beforeAnalysisId: before, afterAnalysisId: after }
      : { before, after };
    return (await apiClient.post('/compare/versions', payload)).data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to run Time Machine version comparison.');
  }
}

// AUTHENTICATION API CALLS

export async function loginApi(email, password, rememberMe = false) {
  try {
    const response = await apiClient.post('/auth/login', { email, password, rememberMe });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the security server.');
    }
    throw new Error('Unable to complete request.');
  }
}

export async function registerApi(name, email, password, confirmPassword) {
  try {
    const response = await apiClient.post('/auth/register', { name, email, password, confirmPassword });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the security server.');
    }
    throw new Error('Unable to complete request.');
  }
}

export async function logoutApi() {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw new Error('Unable to complete logout request.');
  }
}

export async function getMeApi() {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  } catch (error) {
    return null;
  }
}

export async function forgotPasswordApi(email) {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to complete request.');
  }
}

export async function resetPasswordApi(email, token, newPassword, confirmPassword) {
  try {
    const response = await apiClient.post('/auth/reset-password', { email, token, newPassword, confirmPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to complete request.');
  }
}
