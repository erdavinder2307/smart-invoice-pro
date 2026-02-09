import axios from 'axios';
import API_CONFIG from '../config/api';

export const contactService = {
    sendMessage: async (data) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/api/contact`, data);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
};
