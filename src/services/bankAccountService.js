import axios from 'axios';
import { createApiUrl } from '../config/api';

const getUserHeaders = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id ? { 'X-User-Id': user.id, 'X-Username': user.username || '' } : {};
    } catch {
        return {};
    }
};

// Accepts an optional userId to override localStorage (for use with AuthContext)
export const getBankAccounts = async (userId) => {
    try {
        const headers = userId
            ? { 'X-User-Id': userId }
            : getUserHeaders();
        const response = await axios.get(
            createApiUrl('/api/bank-accounts'),
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        throw error;
    }
};

export const createBankAccount = async (accountData, userId) => {
    try {
        const headers = userId
            ? { 'X-User-Id': userId }
            : getUserHeaders();
        const response = await axios.post(
            createApiUrl('/api/bank-accounts'),
            accountData,
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating bank account:', error);
        throw error;
    }
};

export const getBankAccountById = async (id, userId) => {
    try {
        const headers = userId
            ? { 'X-User-Id': userId }
            : getUserHeaders();
        const response = await axios.get(
            createApiUrl(`/api/bank-accounts/${id}`),
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bank account details:', error);
        throw error;
    }
};

export const updateBankAccount = async (id, accountData, userId) => {
    try {
        const headers = userId ? { 'X-User-Id': userId } : getUserHeaders();
        const response = await axios.put(
            createApiUrl(`/api/bank-accounts/${id}`),
            accountData,
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating bank account:', error);
        throw error;
    }
};

export const deleteBankAccount = async (id, userId) => {
    try {
        const headers = userId ? { 'X-User-Id': userId } : getUserHeaders();
        const response = await axios.delete(
            createApiUrl(`/api/bank-accounts/${id}`),
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting bank account:', error);
        throw error;
    }
};
