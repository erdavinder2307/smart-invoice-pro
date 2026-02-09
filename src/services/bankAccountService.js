import axios from 'axios';
import { createApiUrl } from '../config/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getBankAccounts = async () => {
    try {
        const response = await axios.get(
            createApiUrl('/api/bank-accounts'),
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        throw error;
    }
};

export const createBankAccount = async (accountData) => {
    try {
        const response = await axios.post(
            createApiUrl('/api/bank-accounts'),
            accountData,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating bank account:', error);
        throw error;
    }
};

export const getBankAccountById = async (id) => {
    try {
        const response = await axios.get(
            createApiUrl(`/api/bank-accounts/${id}`),
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bank account details:', error);
        throw error;
    }
};
