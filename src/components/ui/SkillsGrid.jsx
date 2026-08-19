import React, { useState } from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { Cpu, Network, ShieldCheck, Code, BrainCircuit, TerminalSquare } from 'lucide-react';
import HoloSkillSphere from '../3d/HoloSkillSphere';

export default function SkillsGrid() {
  const { data } = usePortfolioData();
  const skills = data.skills || {};
  const [activeTab, setActiveTab] = useState('networking');

  const tabOptions = [
    { id: 'networking', name: 'Networking & Protocols', icon: Network, color: '#00ff88' },
    { id: 'cybersecurity', name: 'Cyber Security', icon: ShieldCheck, color: '#00f3ff' },
    { id: 'development', name: 'MERN Stack & Dev', icon: Code, color: '#9d4edd' },
    { id: 'analyticsAndAi', name: 'AI & Data Science', icon: BrainCircuit, color: '#ff007f' },
    { id: 'operatingSystems', name: 'RHEL & Linux Admin', icon: TerminalSquare, color: '#ffaa00' },
  ];

  const currentSkills = skills[activeTab] || [];
  const currentTabObj = tabOptions.find(t => t.id === activeTab) || tabOptions[0];

  return (
    <section id="skills" className="section-container">
      <div className="section-title">
        <Cpu color="var(--purple)" size={32} />
        <h2>Technical Expertise & Skill Matrix</h2>
      </div>
      <p className="section-subtitle">
        Validated technical capabilities spanning computer networking, cybersecurity, full-stack software development, and AI engineering.
      </p>

      {/* 3D Holographic Interactive Skill Tag Sphere */}
      <div style={{ marginBottom: '40px' }}>
        <HoloSkillSphere />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {tabOptions.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isSelected ? tab.color + '22' : 'rgba(14, 18, 36, 0.7)',
                border: `1px solid ${isSelected ? tab.color : 'rgba(255, 255, 255, 0.1)'}`,
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={18} color={isSelected ? tab.color : 'var(--text-muted)'} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Skill Items Grid */}
      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {currentSkills.map((skill, index) => (
            <div key={index} style={{ background: 'rgba(5, 8, 20, 0.6)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                <span>{skill.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: currentTabObj.color }}>
                  {skill.level}%
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${skill.level}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, rgba(255,255,255,0.4), ${currentTabObj.color})`,
                    borderRadius: '4px',
                    boxShadow: `0 0 10px ${currentTabObj.color}`,
                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
