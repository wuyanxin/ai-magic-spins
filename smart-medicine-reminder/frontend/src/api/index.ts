import axios from 'axios';
import { FamilyMember, Medicine, Reminder } from '../types';

const API_BASE_URL = '/api';

export const familyApi = {
  getAll: async (): Promise<FamilyMember[]> => {
    const response = await axios.get(`${API_BASE_URL}/family`);
    return response.data;
  },
  getById: async (id: string): Promise<FamilyMember> => {
    const response = await axios.get(`${API_BASE_URL}/family/${id}`);
    return response.data;
  },
  create: async (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember> => {
    const response = await axios.post(`${API_BASE_URL}/family`, member);
    return response.data;
  },
  update: async (id: string, member: Partial<FamilyMember>): Promise<FamilyMember> => {
    const response = await axios.put(`${API_BASE_URL}/family/${id}`, member);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/family/${id}`);
  },
};

export const medicineApi = {
  getAll: async (): Promise<Medicine[]> => {
    const response = await axios.get(`${API_BASE_URL}/medicine`);
    return response.data;
  },
  getById: async (id: string): Promise<Medicine> => {
    const response = await axios.get(`${API_BASE_URL}/medicine/${id}`);
    return response.data;
  },
  create: async (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> => {
    const response = await axios.post(`${API_BASE_URL}/medicine`, medicine);
    return response.data;
  },
  smartAdd: async (data: { imageData?: string; textData?: string }): Promise<Medicine> => {
    const response = await axios.post(`${API_BASE_URL}/medicine/smart-add`, data);
    return response.data;
  },
  update: async (id: string, medicine: Partial<Medicine>): Promise<Medicine> => {
    const response = await axios.put(`${API_BASE_URL}/medicine/${id}`, medicine);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/medicine/${id}`);
  },
};

export const reminderApi = {
  getAll: async (): Promise<Reminder[]> => {
    const response = await axios.get(`${API_BASE_URL}/reminder`);
    return response.data;
  },
  getById: async (id: string): Promise<Reminder> => {
    const response = await axios.get(`${API_BASE_URL}/reminder/${id}`);
    return response.data;
  },
  create: async (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder> => {
    const response = await axios.post(`${API_BASE_URL}/reminder`, reminder);
    return response.data;
  },
  trigger: async (id: string): Promise<{ message: string; reminder: Reminder }> => {
    const response = await axios.post(`${API_BASE_URL}/reminder/trigger/${id}`);
    return response.data;
  },
  update: async (id: string, reminder: Partial<Reminder>): Promise<Reminder> => {
    const response = await axios.put(`${API_BASE_URL}/reminder/${id}`, reminder);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/reminder/${id}`);
  },
};
