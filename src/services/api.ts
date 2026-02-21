import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchSentiments = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sentiments`, { params });
    return response.data;
  } catch (error) {
    console.error('获取舆情数据失败:', error);
    throw error;
  }
};

export const fetchStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics`);
    return response.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw error;
  }
};

export const fetchHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('健康检查失败:', error);
    throw error;
  }
};
