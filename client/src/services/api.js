/**
 * Urban Fleet Operations - API Service Layer
 */

const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('ufo_token') || null;
    this.activeUser = JSON.parse(localStorage.getItem('ufo_active_user') || 'null');
  }

  setAuth(user, token) {
    this.activeUser = user;
    this.token = token;
    if (user) {
      localStorage.setItem('ufo_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ufo_active_user');
    }
    if (token) {
      localStorage.setItem('ufo_token', token);
    } else {
      localStorage.removeItem('ufo_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.activeUser) {
      headers['x-user-id'] = this.activeUser._id;
      headers['x-user-role'] = this.activeUser.role;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth & Personas
  async getUsers() {
    return this.request('/auth/users');
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Vehicles
  async getVehicles() {
    return this.request('/vehicles');
  }

  async createVehicle(payload) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Service Requests (Case Management)
  async getServiceRequests() {
    return this.request('/services');
  }

  async getServiceRequestById(id) {
    return this.request(`/services/${id}`);
  }

  async createServiceRequest(payload) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateStageStatus(id, payload) {
    return this.request(`/services/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async assignTechnician(id, payload) {
    return this.request(`/services/${id}/assign-technician`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTechnicianProgress(id, payload) {
    return this.request(`/services/${id}/technician-progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async completeService(id, payload = {}) {
    return this.request(`/services/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createVideoConsultation(id, payload = {}) {
    return this.request(`/services/${id}/video-consultation`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async endVideoConsultation(id) {
    return this.request(`/services/${id}/video-consultation/end`, {
      method: 'POST',
    });
  }

  async getStats() {
    return this.request('/services/stats/summary');
  }

  async getServiceCenters() {
    return this.request('/services/centers');
  }

  // Inspections
  async createInspection(payload) {
    return this.request('/inspections', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getInspection(id) {
    return this.request(`/inspections/${id}`);
  }

  // Estimates
  async createEstimate(payload) {
    return this.request('/estimates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitEstimateDecision(id, payload) {
    return this.request(`/estimates/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }
}

export const api = new ApiService();
export default api;
