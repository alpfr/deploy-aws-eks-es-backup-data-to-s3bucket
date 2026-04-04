/**
 * API Context for AI Compliance Platform
 */

import React, { createContext, useContext } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export function useApi() {
  return useContext(ApiContext);
}

// Create dedicated resilient instance
const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function ApiProvider({ children }) {
  // Organizations API
  const getOrganizations = async () => {
    try {
      const response = await apiClient.get('/organizations');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch organizations' };
    }
  };

  const createOrganization = async (orgData) => {
    try {
      const response = await apiClient.post('/organizations', orgData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create organization' };
    }
  };

  // Assessments API
  const getAssessments = async () => {
    try {
      const response = await apiClient.get('/assessments');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch assessments' };
    }
  };

  const createAssessment = async (assessmentData) => {
    try {
      const response = await apiClient.post('/assessments', assessmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create assessment' };
    }
  };

  const updateAssessment = async (assessmentId, assessmentData) => {
    try {
      const response = await apiClient.put(`/assessments/${assessmentId}`, assessmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to update assessment' };
    }
  };

  // Guardrails API
  const getGuardrails = async () => {
    try {
      const response = await apiClient.get('/guardrails');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch guardrails' };
    }
  };

  const createGuardrail = async (guardrailData) => {
    try {
      const response = await apiClient.post('/guardrails', guardrailData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create guardrail' };
    }
  };

  const filterContent = async (content, context = {}, industryProfile = 'financial_services', jurisdiction = 'US') => {
    try {
      const response = await apiClient.post('/guardrails/filter', {
        content,
        context,
        industry_profile: industryProfile,
        jurisdiction
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to filter content' };
    }
  };

  // Dashboard API
  const getDashboardData = async () => {
    try {
      const response = await apiClient.get('/compliance/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch dashboard data' };
    }
  };

  // Audit Trail API
  const getAuditTrail = async (limit = 100) => {
    try {
      const response = await apiClient.get(`/audit-trail?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch audit trail' };
    }
  };

  // Admin API
  const getPendingUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users/pending');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch pending users' };
    }
  };

  const approveUser = async (userId) => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to approve user' };
    }
  };

  const apiCall = async (url, method = 'GET', data = null) => {
    try {
      const response = await apiClient({
        method,
        url,
        data
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message || 'API call failed' };
    }
  };

  const value = {
    // Organizations
    getOrganizations,
    createOrganization,
    
    // Assessments
    getAssessments,
    createAssessment,
    updateAssessment,
    
    // Guardrails
    getGuardrails,
    createGuardrail,
    filterContent,
    
    // Dashboard
    getDashboardData,
    
    // Audit Trail
    getAuditTrail,

    // Admin
    getPendingUsers,
    approveUser,
    
    // Generic
    apiCall
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}