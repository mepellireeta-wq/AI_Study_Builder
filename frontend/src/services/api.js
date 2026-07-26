import axios from 'axios';

const API_BASE_URL = '/api';

export const fetchStudyPlan = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/study-plan`, { timeout: 3000 });
    return response.data;
  } catch (error) {
    console.warn('Backend API unavailable. Using default study plan data.', error?.message);
    return {
      "Maths": "2 Hours",
      "DBMS": "1 Hour",
      "Python": "1.5 Hours",
      "Break": "30 Minutes"
    };
  }
};

export const fetchProjectStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, { timeout: 3000 });
    return response.data;
  } catch (error) {
    return {
      "Project": "AI Study Builder",
      "Status": "Demo Mode (Offline)"
    };
  }
};
