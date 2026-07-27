import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1500,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class API {
  static async getTopics() {
    try {
      const response = await api.get('/topics');
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, using fallback.");
      return null;
    }
  }

  static async getTimeline() {
    try {
      const response = await api.get('/timeline');
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, using fallback.");
      return null;
    }
  }

  static async uploadAssignment(formData) {
    try {
      const response = await api.post('/assignments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return { success: true };
    }
  }
}

export default api;