import React, { useState } from 'react';
import { portfolioStore, usePortfolioData } from '../../data/portfolioStore';
import { Mail, Phone, MapPin, Copy, Check, Send, Linkedin, Github, Globe } from 'lucide-react';
import { playAccessGrantedSound } from '../../utils/audioFX';

export default function ContactSection() {
  const { data } = usePortfolioData();
  const personalInfo = data.personalInfo || {};
  const [copiedField, setCopiedField] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    portfolioStore.addMessage(formData);
    playAccessGrantedSound();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="section-container">
      <div className="section-title">
        <Mail color="var(--cyan)" size={32} />
        <h2>Contact & Connection Nexus</h2>
      </div>
      <p className="section-subtitle">
        Get in touch for Software Engineering, Cyber Security, Network Engineering, or AI Engineering opportunities.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '28px' }}>
        {/* Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 243, 255, 0.1)', border: '1px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail color="var(--cyan)" size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{personalInfo.email}</div>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(personalInfo.email, 'email')}
              style={{ background: 'transparent', border: 'none', color: copiedField === 'email' ? 'var(--emerald)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}
              title="Copy Email"
            >
              {copiedField === 'email' ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {/* Phone */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone color="var(--emerald)" size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone Number</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{personalInfo.phone}</div>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(personalInfo.phone, 'phone')}
              style={{ background: 'transparent', border: 'none', color: copiedField === 'phone' ? 'var(--emerald)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}
              title="Copy Phone"
            >
              {copiedField === 'phone' ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {/* Location */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(157, 78, 221, 0.1)', border: '1px solid var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin color="var(--purple)" size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Location</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{personalInfo.location}</div>
            </div>
          </div>

          {/* Social Badges */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="cyber-btn cyber-btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              <Linkedin size={16} /> LinkedIn
            </a>
            <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="cyber-btn cyber-btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              <Github size={16} /> GitHub
            </a>
            <a href={personalInfo.orcid} target="_blank" rel="noopener noreferrer" className="cyber-btn cyber-btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              <Globe size={16} /> ORCID
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Send Direct Message</h3>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Your Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Mercer"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Your Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@company.com"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Message</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Discussing job opportunity or project collaboration..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="cyber-btn" style={{ width: '100%', justifyContent: 'center' }}>
            <Send size={16} /> {submitted ? 'Message Sent Successfully!' : 'Dispatch Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
