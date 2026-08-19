import React from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { ShieldAlert, Network, Code2, BrainCircuit, Terminal, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import HeroCanvas from '../3d/HeroCanvas';
import ThreatRadarVisualizer from './ThreatRadarVisualizer';
import AnimatedCounter from './AnimatedCounter';

const iconMap = {
  ShieldAlert: ShieldAlert,
  Network: Network,
  Code2: Code2,
  BrainCircuit: BrainCircuit
};

export default function Hero({ activeRole, setActiveRole }) {
  const { data } = usePortfolioData();
  const personalInfo = data.personalInfo || {};
  const roles = data.roles || [];
  const currentRoleObj = roles.find((r) => r.id === activeRole) || roles[0] || {};

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '120px',
        paddingBottom: '60px',
        overflow: 'hidden'
      }}
    >
      {/* 3D WebGL Background Scene */}
      <HeroCanvas activeColor={currentRoleObj.color} />

      {/* Main Content Overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          width: '100%',
          padding: '0 24px',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        {/* Top Announcement Pill */}
        <div style={{ pointerEvents: 'auto', display: 'inline-block', marginBottom: '24px' }}>
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '30px',
              background: 'rgba(0, 243, 255, 0.08)',
              border: `1px solid ${currentRoleObj.color}`,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: currentRoleObj.color,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: `0 0 15px ${currentRoleObj.accent}`
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentRoleObj.color }}></span>
            SPPU B.E. Computer Engineering (2026) SGPA <AnimatedCounter end={8.03} decimals={2} /> • {currentRoleObj.badge}
          </div>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.8rem)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.1,
            marginBottom: '20px',
            pointerEvents: 'auto'
          }}
        >
          Architecting Secure Networks & <br />
          <span style={{ color: currentRoleObj.color, transition: 'color 0.3s ease' }}>
            {currentRoleObj.title}
          </span>
        </h1>

        {/* Subtitle / Bio */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: '780px',
            margin: '0 auto 36px auto',
            pointerEvents: 'auto',
            lineHeight: 1.6
          }}
        >
          {currentRoleObj.desc}
        </p>

        {/* Role Matrix Switcher */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}
        >
          {roles.map((role) => {
            const Icon = iconMap[role.icon];
            const isActive = role.id === activeRole;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                style={{
                  background: isActive ? role.accent : 'rgba(14, 18, 36, 0.7)',
                  border: `1px solid ${isActive ? role.color : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-main)',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 0 20px ${role.accent}` : 'none'
                }}
              >
                <Icon size={16} color={isActive ? role.color : 'var(--text-muted)'} />
                {role.title}
              </button>
            );
          })}
        </div>

        {/* CTA Action Buttons */}
        <div style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a href="#terminal" className="cyber-btn" style={{ borderColor: currentRoleObj.color }}>
            <Terminal size={18} /> Launch Terminal Simulator
          </a>
          <a href="#projects" className="cyber-btn cyber-btn-outline">
            View Projects <ArrowRight size={18} />
          </a>
        </div>

        {/* Quick Social Badges */}
        <div
          style={{
            pointerEvents: 'auto',
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--cyan)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            <Linkedin size={20} />
          </a>
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--cyan)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            <Github size={20} />
          </a>
          <a
            href={`mailto:${personalInfo.email}`}
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--cyan)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            <Mail size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
