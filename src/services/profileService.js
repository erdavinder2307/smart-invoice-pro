import axios from 'axios';
import { createApiUrl } from '../config/api';

// Get user profile
export const getProfile = async () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await axios.get(createApiUrl('/api/profile/me'), {
            headers: {
                'X-User-Id': user.id,
                'X-Username': user.username
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

// Update user profile
export const updateProfile = async (profileData) => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await axios.post(createApiUrl('/api/profile/update'), profileData, {
            headers: {
                'X-User-Id': user.id,
                'X-Username': user.username
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};
