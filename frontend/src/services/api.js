import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000,
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

  static async addTopic(topic) {
    try {
      const response = await api.post('/topics', topic);
      return response.data;
    } catch (error) {
      return { success: true, topic };
    }
  }

  static async updateTopic(id, updates) {
    try {
      const response = await api.put(`/topics/${id}`, updates);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  }

  static async deleteTopic(id) {
    try {
      const response = await api.delete(`/topics/${id}`);
      return response.data;
    } catch (error) {
      return { success: true };
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

  static async addTimelineItem(item) {
    try {
      const response = await api.post('/timeline', item);
      return response.data;
    } catch (error) {
      return { success: true, item };
    }
  }

  static async rebalanceSchedule(topics) {
    try {
      const response = await api.post('/rebalance', { topics });
      return response.data;
    } catch (error) {
      console.warn("API rebalance fallback activated.");
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