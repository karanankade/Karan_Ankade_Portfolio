import React, { useState } from 'react';
import {
  Shield, User, FolderGit2, Wrench, Award, Briefcase, Mail, Settings,
  LogOut, Plus, Trash2, Edit3, Check, X, RefreshCw, Download, Upload,
  Search, Eye, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, Lock
} from 'lucide-react';
import { portfolioStore, usePortfolioData } from '../../data/portfolioStore';

export default function AdminDashboard({ onClose }) {
  const { data, messages } = usePortfolioData();
  const [activeTab, setActiveTab] = useState('overview');

  // Form states for inline editing
  const [profileForm, setProfileForm] = useState(data.personalInfo);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Project Modal / Edit State
  const [editingProject, setEditingProject] = useState(null); // null or project obj
  const [projectForm, setProjectForm] = useState({
    title: '', category: 'MERN Stack', tech: '', live: '', github: '', highlights: '', featured: false
  });

  // Skill Form State
  const [skillCategory, setSkillCategory] = useState('networking');
  const [skillForm, setSkillForm] = useState({ name: '', level: 85 });
  const [newCatName, setNewCatName] = useState('');

  // Cert Form State
  const [certForm, setCertForm] = useState({
    title: '', issuer: '', date: '', category: 'Networking', badgeColor: '#00f3ff', details: ''
  });

  // Exp Form State
  const [expForm, setExpForm] = useState({
    role: '', company: '', period: '', type: 'Internship', points: ''
  });

  // Security Passcode Form State
  const [passcodeForm, setPasscodeForm] = useState({ current: '', next: '', confirm: '' });
  const [passcodeMsg, setPasscodeMsg] = useState({ type: '', text: '' });

  // Filter messages
  const [messageFilter, setMessageFilter] = useState('all'); // all, unread, read
  const unreadCount = messages.filter((m) => !m.read).length;

  const handleProfileSave = (e) => {
    e.preventDefault();
    portfolioStore.updatePersonalInfo(profileForm);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleAddOrUpdateProject = (e) => {
    e.preventDefault();
    const techArray = typeof projectForm.tech === 'string'
      ? projectForm.tech.split(',').map((t) => t.trim()).filter(Boolean)
      : projectForm.tech;
    const highlightsArray = typeof projectForm.highlights === 'string'
      ? projectForm.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
      : projectForm.highlights;

    const payload = {
      ...projectForm,
      tech: techArray,
      highlights: highlightsArray
    };

    if (editingProject) {
      portfolioStore.updateProject(editingProject.id, payload);
    } else {
      portfolioStore.addProject(payload);
    }

    setEditingProject(null);
    setProjectForm({ title: '', category: 'MERN Stack', tech: '', live: '', github: '', highlights: '', featured: false });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillForm.name) return;
    portfolioStore.addSkill(skillCategory, skillForm.name, skillForm.level);
    setSkillForm({ name: '', level: 85 });
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!certForm.title) return;
    portfolioStore.addCertification(certForm);
    setCertForm({ title: '', issuer: '', date: '', category: 'Networking', badgeColor: '#00f3ff', details: '' });
  };

  const handleAddExp = (e) => {
    e.preventDefault();
    if (!expForm.role) return;
    const pointsArr = typeof expForm.points === 'string'
      ? expForm.points.split('\n').map((p) => p.trim()).filter(Boolean)
      : expForm.points;
    portfolioStore.addExperience({ ...expForm, points: pointsArr });
    setExpForm({ role: '', company: '', period: '', type: 'Internship', points: '' });
  };

  const handleChangePasscode = (e) => {
    e.preventDefault();
    const currentActual = portfolioStore.getPasscode();
    if (passcodeForm.current !== currentActual) {
      setPasscodeMsg({ type: 'error', text: 'Current passcode is incorrect!' });
      return;
    }
    if (passcodeForm.next.length < 4) {
      setPasscodeMsg({ type: 'error', text: 'New passcode must be at least 4 characters long.' });
      return;
    }
    if (passcodeForm.next !== passcodeForm.confirm) {
      setPasscodeMsg({ type: 'error', text: 'New passcodes do not match!' });
      return;
    }

    portfolioStore.setPasscode(passcodeForm.next);
    setPasscodeMsg({ type: 'success', text: 'Security Passcode changed successfully!' });
    setPasscodeForm({ current: '', next: '', confirm: '' });
  };

  const handleExportJSON = () => {
    const jsonStr = portfolioStore.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = portfolioStore.importJSON(event.target.result);
      if (res.success) {
        alert('Data imported successfully!');
      } else {
        alert('Error importing data: ' + res.error);
      }
    };
    reader.readAsText(file);
  };

  const filteredMessages = messages.filter((m) => {
    if (messageFilter === 'unread') return !m.read;
    if (messageFilter === 'read') return m.read;
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: '#070913',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Dashboard Top Navbar */}
      <header
        style={{
          padding: '16px 28px',
          background: 'rgba(14, 18, 36, 0.95)',
          borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0,243,255,0.2) 0%, rgba(157,78,221,0.2) 100%)',
              border: '1px solid var(--cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield color="var(--cyan)" size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>
                Portfolio Admin Center
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 136, 0.15)',
                  color: 'var(--emerald)',
                  border: '1px solid var(--emerald)',
                  fontWeight: 600
                }}
              >
                LIVE SYNC ACTIVE
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Logged in as <strong style={{ color: '#fff' }}>Karan Ankade</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportJSON}
            className="cyber-btn cyber-btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            title="Download JSON Data Backup"
          >
            <Download size={15} /> Backup Data
          </button>

          <button
            onClick={onClose}
            className="cyber-btn"
            style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'rgba(255, 77, 77, 0.2)', border: '1px solid #ff4d4d' }}
          >
            <LogOut size={15} /> Lock Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <aside
          style={{
            width: '260px',
            background: 'rgba(10, 14, 28, 0.95)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 12px 10px', letterSpacing: '1px', fontWeight: 600 }}>
            Control Modules
          </div>

          {[
            { id: 'overview', label: 'System Overview', icon: Shield },
            { id: 'profile', label: 'Profile & Data', icon: User },
            { id: 'projects', label: 'Projects Manager', icon: FolderGit2, count: data.projects?.length },
            { id: 'skills', label: 'Skills Matrix', icon: Wrench },
            { id: 'certs_exp', label: 'Certs & Experience', icon: Award },
            { id: 'messages', label: 'Messages Inbox', icon: Mail, badge: unreadCount },
            { id: 'settings', label: 'Security & Backup', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid var(--cyan)' : '1px solid transparent',
                  background: isActive ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
                  color: isActive ? 'var(--cyan)' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 ? (
                  <span style={{ background: 'var(--cyan)', color: '#000', padding: '2px 7px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {item.badge}
                  </span>
                ) : item.count !== undefined ? (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', background: 'rgba(5, 8, 20, 0.5)' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>System Overview & Quick Stats</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Monitor your live portfolio status, projects, skills count, and visitor messages.
                </p>
              </div>

              {/* Metrics Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Featured Projects</span>
                    <FolderGit2 color="var(--cyan)" size={20} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{data.projects?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', marginTop: '4px' }}>
                    {data.projects?.filter((p) => p.featured).length} Featured on Homepage
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Skills Registered</span>
                    <Wrench color="var(--emerald)" size={20} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                    {Object.values(data.skills || {}).reduce((acc, cat) => acc + cat.length, 0)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '4px' }}>
                    Across {Object.keys(data.skills || {}).length} Specialization Areas
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(157, 78, 221, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Messages Received</span>
                    <Mail color="var(--purple)" size={20} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{messages.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--purple)', marginTop: '4px' }}>
                    {unreadCount} Unread Inbox Message{unreadCount === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 0, 127, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Certifications</span>
                    <Award color="#ff007f" size={20} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{data.certifications?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ff007f', marginTop: '4px' }}>
                    CCNA, Azure AI, Oracle AI & IIT
                  </div>
                </div>
              </div>

              {/* Profile Card & Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} color="var(--cyan)" /> Profile Overview
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Full Name:</span> {data.personalInfo?.name}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {data.personalInfo?.email}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {data.personalInfo?.phone}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> {data.personalInfo?.location}</div>
                    <div style={{ marginTop: '8px' }}>
                      <button onClick={() => setActiveTab('profile')} className="cyber-btn cyber-btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                        Edit Profile Details
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="var(--emerald)" /> Quick Control Actions
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button onClick={() => setActiveTab('projects')} className="cyber-btn" style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                      <Plus size={15} /> Add New Project
                    </button>
                    <button onClick={() => setActiveTab('skills')} className="cyber-btn" style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                      <Plus size={15} /> Add New Skill
                    </button>
                    <button onClick={() => setActiveTab('messages')} className="cyber-btn cyber-btn-outline" style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                      <Mail size={15} /> Check Messages ({unreadCount})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE EDITOR */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>Profile & Personal Information</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Update your contact details, bio, links, and degree info.
                </p>
              </div>

              {saveSuccessMsg && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0, 255, 136, 0.15)', border: '1px solid var(--emerald)', color: 'var(--emerald)', marginBottom: '20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} /> {saveSuccessMsg}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="glass-panel" style={{ padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Location</label>
                    <input
                      type="text"
                      value={profileForm.location || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Professional Tagline</label>
                  <input
                    type="text"
                    value={profileForm.tagline || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Bio / Summary</label>
                  <textarea
                    rows={4}
                    value={profileForm.bio || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>GitHub Profile URL</label>
                    <input
                      type="url"
                      value={profileForm.github || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={profileForm.linkedin || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <button type="submit" className="cyber-btn" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PROJECTS MANAGER */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>Projects Manager</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Add new portfolio projects, edit details, or remove existing ones.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setProjectForm({ title: '', category: 'MERN Stack', tech: '', live: '', github: '', highlights: '', featured: true });
                  }}
                  className="cyber-btn"
                  style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add New Project
                </button>
              </div>

              {/* Add / Edit Project Form */}
              <form onSubmit={handleAddOrUpdateProject} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--cyan)' }}>
                  {editingProject ? `Edit Project: ${editingProject.title}` : 'Add New Project'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Project Title</label>
                    <input
                      type="text"
                      required
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      placeholder="e.g. AI Threat Detection Dashboard"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
                    <select
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      <option value="AI / ML Analytics">AI / ML Analytics</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Networking">Networking</option>
                      <option value="MERN Stack">MERN Stack</option>
                      <option value="Systems & Linux">Systems & Linux</option>
                      <option value="Frontend Web">Frontend Web</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Tech Stack (Comma-separated)</label>
                    <input
                      type="text"
                      value={typeof projectForm.tech === 'string' ? projectForm.tech : projectForm.tech?.join(', ')}
                      onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                      placeholder="React, Node.js, Python, Flask"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Live Demo Link</label>
                    <input
                      type="url"
                      value={projectForm.live || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, live: e.target.value })}
                      placeholder="https://my-app.vercel.app"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>GitHub Repo Link</label>
                    <input
                      type="url"
                      value={projectForm.github || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                      placeholder="https://github.com/karanankade/repo"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Highlights / Key Features (One per line)</label>
                  <textarea
                    rows={3}
                    value={typeof projectForm.highlights === 'string' ? projectForm.highlights : projectForm.highlights?.join('\n')}
                    onChange={(e) => setProjectForm({ ...projectForm, highlights: e.target.value })}
                    placeholder="Built responsive REST API&#10;Integrated Machine Learning models"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    />
                    Featured on Main Homepage
                  </label>

                  <button type="submit" className="cyber-btn" style={{ padding: '10px 20px' }}>
                    {editingProject ? 'Update Project' : 'Save New Project'}
                  </button>

                  {editingProject && (
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="cyber-btn cyber-btn-outline"
                      style={{ padding: '10px 16px' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              {/* Projects List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {data.projects?.map((proj) => (
                  <div key={proj.id} className="glass-panel" style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0, 243, 255, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(0, 243, 255, 0.3)' }}>
                          {proj.category}
                        </span>
                        {proj.featured && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600 }}>★ FEATURED</span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '8px' }}>{proj.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Tech: {proj.tech?.join(', ')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setProjectForm({
                            title: proj.title,
                            category: proj.category,
                            tech: proj.tech || [],
                            live: proj.live || '',
                            github: proj.github || '',
                            highlights: proj.highlights || [],
                            featured: !!proj.featured
                          });
                        }}
                        style={{ background: 'rgba(0,243,255,0.1)', border: '1px solid var(--cyan)', color: 'var(--cyan)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete project "${proj.title}"?`)) {
                            portfolioStore.deleteProject(proj.id);
                          }
                        }}
                        style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS MATRIX */}
          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>Skills & Technical Proficiency</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Add new technical skills, update proficiency levels (0-100%), or remove skills.
                </p>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--emerald)' }}>Add New Skill</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Skill Category</label>
                    <select
                      value={skillCategory}
                      onChange={(e) => setSkillCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      {Object.keys(data.skills || {}).map((cat) => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Skill Name</label>
                    <input
                      type="text"
                      required
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g. Kubernetes, Penetration Testing"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Proficiency Level ({skillForm.level}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={skillForm.level}
                      onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}
                      style={{ width: '100%', marginTop: '8px' }}
                    />
                  </div>
                </div>

                <button type="submit" className="cyber-btn" style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
                  <Plus size={16} /> Add Skill to {skillCategory.toUpperCase()}
                </button>
              </form>

              {/* Skills by Categories Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {Object.entries(data.skills || {}).map(([catKey, skillList]) => (
                  <div key={catKey} className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                      {catKey} ({skillList.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {skillList.map((sk, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                          <div style={{ flex: 1, marginRight: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span>{sk.name}</span>
                              <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{sk.level}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${sk.level}%`, background: 'linear-gradient(90deg, var(--cyan), var(--emerald))' }} />
                            </div>
                          </div>
                          <button
                            onClick={() => portfolioStore.deleteSkill(catKey, idx)}
                            style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '4px' }}
                            title="Remove Skill"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CERTS & EXPERIENCE */}
          {activeTab === 'certs_exp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>Certifications & Work Experience</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Add or delete certifications and work/academic experience timeline items.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {/* Certifications Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <form onSubmit={handleAddCert} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: '#ff007f' }}>Add Certification</h3>
                    <input
                      type="text"
                      required
                      placeholder="Title e.g. AWS Solutions Architect"
                      value={certForm.title}
                      onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Issuer e.g. Cisco / Microsoft / AWS"
                      value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <input
                      type="text"
                      placeholder="Date e.g. May 2026"
                      value={certForm.date}
                      onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <textarea
                      rows={2}
                      placeholder="Details / Modules covered..."
                      value={certForm.details}
                      onChange={(e) => setCertForm({ ...certForm, details: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <button type="submit" className="cyber-btn" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                      <Plus size={15} /> Add Certification
                    </button>
                  </form>

                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>Current Certifications</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {data.certifications?.map((c, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.issuer} • {c.date}</div>
                          </div>
                          <button onClick={() => portfolioStore.deleteCertification(idx)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experience Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <form onSubmit={handleAddExp} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--purple)' }}>Add Experience</h3>
                    <input
                      type="text"
                      required
                      placeholder="Role e.g. Cybersecurity Engineer"
                      value={expForm.role}
                      onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Company / Lab Name"
                      value={expForm.company}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <input
                      type="text"
                      placeholder="Period e.g. Jan 2026 – Present"
                      value={expForm.period}
                      onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <textarea
                      rows={2}
                      placeholder="Key achievements (one per line)..."
                      value={expForm.points}
                      onChange={(e) => setExpForm({ ...expForm, points: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <button type="submit" className="cyber-btn" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                      <Plus size={15} /> Add Experience Item
                    </button>
                  </form>

                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>Experience Timeline</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {data.experience?.map((exp, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{exp.role}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exp.company} ({exp.period})</div>
                          </div>
                          <button onClick={() => portfolioStore.deleteExperience(idx)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MESSAGES INBOX */}
          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>Visitor Messages Inbox ({messages.length})</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Read and manage messages sent from the Contact form on your website.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {['all', 'unread', 'read'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setMessageFilter(f)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize',
                        background: messageFilter === f ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
                        color: messageFilter === f ? '#000' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {f}
                    </button>
                  ))}
                  {messages.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Clear all messages from inbox?')) portfolioStore.clearAllMessages();
                      }}
                      className="cyber-btn cyber-btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ff4d4d', borderColor: '#ff4d4d' }}
                    >
                      Clear Inbox
                    </button>
                  )}
                </div>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px', color: 'var(--text-muted)' }}>
                  <Mail size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>No messages match the current filter.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="glass-panel"
                      style={{
                        padding: '20px',
                        borderRadius: '14px',
                        border: msg.read ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--cyan)',
                        background: msg.read ? 'rgba(10, 14, 28, 0.6)' : 'rgba(0, 243, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>{msg.name}</h4>
                            <a href={`mailto:${msg.email}`} style={{ fontSize: '0.82rem', color: 'var(--cyan)', textDecoration: 'none' }}>
                              ({msg.email})
                            </a>
                            {!msg.read && (
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--cyan)', color: '#000', fontWeight: 700 }}>
                                NEW
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Subject: {msg.subject} • Received {new Date(msg.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => portfolioStore.toggleMessageRead(msg.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                            title={msg.read ? 'Mark Unread' : 'Mark Read'}
                          >
                            {msg.read ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="cyber-btn"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          >
                            Reply <ArrowUpRight size={14} />
                          </a>
                          <button
                            onClick={() => portfolioStore.deleteMessage(msg.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(5, 8, 20, 0.6)', padding: '14px', borderRadius: '8px', fontSize: '0.9rem', color: '#e0e0e0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SECURITY & BACKUP */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>Security & Backup Settings</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Change your admin passcode, create data backups, or restore defaults.
                </p>
              </div>

              {/* Change Passcode Card */}
              <form onSubmit={handleChangePasscode} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} /> Update Security Passcode
                </h3>

                {passcodeMsg.text && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: passcodeMsg.type === 'error' ? 'rgba(255,77,77,0.15)' : 'rgba(0,255,136,0.15)', color: passcodeMsg.type === 'error' ? '#ff4d4d' : 'var(--emerald)', fontSize: '0.85rem' }}>
                    {passcodeMsg.text}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Current Passcode</label>
                  <input
                    type="password"
                    required
                    value={passcodeForm.current}
                    onChange={(e) => setPasscodeForm({ ...passcodeForm, current: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>New Passcode</label>
                    <input
                      type="password"
                      required
                      value={passcodeForm.next}
                      onChange={(e) => setPasscodeForm({ ...passcodeForm, next: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Confirm New Passcode</label>
                    <input
                      type="password"
                      required
                      value={passcodeForm.confirm}
                      onChange={(e) => setPasscodeForm({ ...passcodeForm, confirm: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <button type="submit" className="cyber-btn" style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
                  Change Security Passcode
                </button>
              </form>

              {/* Data Import / Export / Reset Card */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Data Management & Backups</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button onClick={handleExportJSON} className="cyber-btn" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                    <Download size={16} /> Export Portfolio Backup JSON
                  </button>

                  <label className="cyber-btn cyber-btn-outline" style={{ padding: '10px 16px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <Upload size={16} /> Import Data from JSON File
                    <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
                  </label>

                  <button
                    onClick={() => {
                      if (confirm('WARNING: Reset all portfolio data and messages to default static values? This action cannot be undone.')) {
                        portfolioStore.resetToDefaults();
                        alert('Portfolio data reset to default successfully!');
                      }
                    }}
                    className="cyber-btn cyber-btn-outline"
                    style={{ padding: '10px 16px', fontSize: '0.85rem', color: '#ff4d4d', borderColor: '#ff4d4d' }}
                  >
                    <RefreshCw size={16} /> Reset to Default Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
