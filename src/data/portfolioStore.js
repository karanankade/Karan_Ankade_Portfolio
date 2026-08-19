import { useState, useEffect } from 'react';
import {
  personalInfo as initialPersonalInfo,
  roles as initialRoles,
  projects as initialProjects,
  skills as initialSkills,
  certifications as initialCertifications,
  experience as initialExperience,
  activeCourses as initialActiveCourses
} from './portfolioData';

const STORAGE_KEY_DATA = 'karan_portfolio_data_v1';
const STORAGE_KEY_MESSAGES = 'karan_portfolio_messages_v1';

// Initial local fallback data
const fallbackData = {
  personalInfo: initialPersonalInfo,
  roles: initialRoles,
  projects: initialProjects,
  skills: initialSkills,
  certifications: initialCertifications,
  experience: initialExperience,
  activeCourses: initialActiveCourses
};

const fallbackMessages = [
  {
    _id: 'msg-sample-1',
    id: 'msg-sample-1',
    name: 'HR Recruiter Team',
    email: 'recruitment@techcorp.com',
    subject: 'Interview Invitation for Cybersecurity / Full-Stack Engineer',
    message: 'Hi Karan, we reviewed your 3D portfolio and Cisco/Linux labs! We are very impressed with your background. We would love to schedule a technical interview with you.',
    timestamp: new Date().toISOString(),
    read: false
  }
];

let currentData = fallbackData;
let currentMessages = fallbackMessages;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener({ data: currentData, messages: currentMessages }));
};

// Fetch Initial Data from MongoDB REST API
const initStoreFromBackend = async () => {
  try {
    const [resPortfolio, resMessages] = await Promise.all([
      fetch('/api/portfolio').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/messages').then((res) => (res.ok ? res.json() : null))
    ]);

    if (resPortfolio && resPortfolio.success && resPortfolio.data) {
      const dbData = resPortfolio.data;
      currentData = {
        personalInfo: dbData.personalInfo || fallbackData.personalInfo,
        roles: dbData.roles && dbData.roles.length ? dbData.roles : fallbackData.roles,
        projects: dbData.projects || fallbackData.projects,
        skills: dbData.skills && Object.keys(dbData.skills).length ? dbData.skills : fallbackData.skills,
        certifications: dbData.certifications || fallbackData.certifications,
        experience: dbData.experience || fallbackData.experience,
        activeCourses: dbData.activeCourses || fallbackData.activeCourses
      };
    }

    if (resMessages && resMessages.success && resMessages.messages) {
      currentMessages = resMessages.messages;
    }

    notifyListeners();
  } catch (error) {
    console.warn('Backend API connection warning - using local cache:', error.message);
  }
};

// Auto-trigger initialization
initStoreFromBackend();

// Helper to push updated portfolio state to MongoDB API
const syncPortfolioToMongoDB = async (newData) => {
  currentData = newData;
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(newData));
  notifyListeners();

  try {
    await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });
  } catch (e) {
    console.error('Failed to sync portfolio update to MongoDB backend:', e);
  }
};

// Custom React Hook to consume live portfolio data
export function usePortfolioData() {
  const [state, setState] = useState({ data: currentData, messages: currentMessages });

  useEffect(() => {
    const handleChange = (newState) => setState(newState);
    listeners.add(handleChange);
    return () => listeners.delete(handleChange);
  }, []);

  return state;
}

// Portfolio Store API
export const portfolioStore = {
  getData: () => currentData,
  getMessages: () => currentMessages,

  // Profile Update API
  updatePersonalInfo: (updatedInfo) => {
    const newData = { ...currentData, personalInfo: { ...currentData.personalInfo, ...updatedInfo } };
    syncPortfolioToMongoDB(newData);
  },

  // Projects CRUD API
  addProject: (project) => {
    const newProject = {
      ...project,
      id: project.id || `proj-${Date.now()}`
    };
    const newData = { ...currentData, projects: [newProject, ...currentData.projects] };
    syncPortfolioToMongoDB(newData);
  },

  updateProject: (id, updatedFields) => {
    const newProjects = currentData.projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    const newData = { ...currentData, projects: newProjects };
    syncPortfolioToMongoDB(newData);
  },

  deleteProject: (id) => {
    const newProjects = currentData.projects.filter((p) => p.id !== id);
    const newData = { ...currentData, projects: newProjects };
    syncPortfolioToMongoDB(newData);
  },

  // Skills CRUD API
  addSkill: (categoryKey, name, level = 85) => {
    const catSkills = currentData.skills[categoryKey] || [];
    const updatedCat = [...catSkills, { name, level: Number(level) }];
    const newData = {
      ...currentData,
      skills: { ...currentData.skills, [categoryKey]: updatedCat }
    };
    syncPortfolioToMongoDB(newData);
  },

  updateSkill: (categoryKey, skillIndex, updatedFields) => {
    const catSkills = [...(currentData.skills[categoryKey] || [])];
    if (catSkills[skillIndex]) {
      catSkills[skillIndex] = { ...catSkills[skillIndex], ...updatedFields };
      const newData = {
        ...currentData,
        skills: { ...currentData.skills, [categoryKey]: catSkills }
      };
      syncPortfolioToMongoDB(newData);
    }
  },

  deleteSkill: (categoryKey, skillIndex) => {
    const catSkills = (currentData.skills[categoryKey] || []).filter((_, idx) => idx !== skillIndex);
    const newData = {
      ...currentData,
      skills: { ...currentData.skills, [categoryKey]: catSkills }
    };
    syncPortfolioToMongoDB(newData);
  },

  addSkillCategory: (categoryKey, categoryName) => {
    if (!currentData.skills[categoryKey]) {
      const newData = {
        ...currentData,
        skills: { ...currentData.skills, [categoryKey]: [] }
      };
      syncPortfolioToMongoDB(newData);
    }
  },

  // Certifications CRUD API
  addCertification: (cert) => {
    const newData = { ...currentData, certifications: [cert, ...currentData.certifications] };
    syncPortfolioToMongoDB(newData);
  },

  deleteCertification: (index) => {
    const newCerts = currentData.certifications.filter((_, idx) => idx !== index);
    const newData = { ...currentData, certifications: newCerts };
    syncPortfolioToMongoDB(newData);
  },

  // Experience CRUD API
  addExperience: (exp) => {
    const newData = { ...currentData, experience: [exp, ...currentData.experience] };
    syncPortfolioToMongoDB(newData);
  },

  deleteExperience: (index) => {
    const newExp = currentData.experience.filter((_, idx) => idx !== index);
    const newData = { ...currentData, experience: newExp };
    syncPortfolioToMongoDB(newData);
  },

  // Messages API (MongoDB)
  addMessage: async (msg) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      const result = await res.json();
      if (result.success && result.message) {
        currentMessages = [result.message, ...currentMessages];
        notifyListeners();
        return result;
      }
    } catch (e) {
      console.error('MongoDB add message failed, saving locally:', e);
    }

    const localMsg = {
      _id: `msg-${Date.now()}`,
      id: `msg-${Date.now()}`,
      name: msg.name || 'Anonymous',
      email: msg.email || '',
      subject: msg.subject || 'Portfolio Inquiry',
      message: msg.message || '',
      timestamp: new Date().toISOString(),
      read: false
    };
    currentMessages = [localMsg, ...currentMessages];
    notifyListeners();
    return { success: true, message: localMsg };
  },

  toggleMessageRead: async (id) => {
    currentMessages = currentMessages.map((m) => (m._id === id || m.id === id ? { ...m, read: !m.read } : m));
    notifyListeners();

    try {
      await fetch(`/api/messages/${id}/read`, { method: 'PUT' });
    } catch (e) {
      console.error('Failed to update message read status in MongoDB:', e);
    }
  },

  deleteMessage: async (id) => {
    currentMessages = currentMessages.filter((m) => m._id !== id && m.id !== id);
    notifyListeners();

    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete message in MongoDB:', e);
    }
  },

  clearAllMessages: async () => {
    currentMessages = [];
    notifyListeners();

    try {
      await fetch('/api/messages', { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to clear messages in MongoDB:', e);
    }
  },

  // Backup & Reset API
  resetToDefaults: async () => {
    currentData = fallbackData;
    currentMessages = fallbackMessages;
    notifyListeners();
    syncPortfolioToMongoDB(fallbackData);
  },

  exportJSON: () => {
    return JSON.stringify({ data: currentData, messages: currentMessages }, null, 2);
  },

  importJSON: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.data) syncPortfolioToMongoDB(parsed.data);
      if (parsed.messages) currentMessages = parsed.messages;
      notifyListeners();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
