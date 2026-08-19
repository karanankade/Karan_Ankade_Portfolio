import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Network, Code2, BrainCircuit, Download, Menu, X, Volume2, VolumeX, Lock } from 'lucide-react';
import { usePortfolioData } from '../../data/portfolioStore';
import { playHoverSound, playClickSound } from '../../utils/audioFX';

export default function Navbar({ activeRole, setActiveRole, soundEnabled, setSoundEnabled, onOpenAdmin }) {
  const { data } = usePortfolioData();
  const personalInfo = data.personalInfo || {};
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Terminal', href: '#terminal' },
    { name: 'Network Labs', href: '#network-labs' },
    { name: 'AI Sandbox', href: '#ai-sandbox' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Certs', href: '#certifications' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '1280px',
        zIndex: 100,
        background: scrolled ? 'rgba(7, 9, 19, 0.85)' : 'rgba(14, 18, 36, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 243, 255, 0.2)',
        borderRadius: '16px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.8)' : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Brand & Status */}
      <a
        href="#"
        onClick={() => playClickSound()}
        onMouseEnter={() => playHoverSound()}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#fff' }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(0,243,255,0.2) 0%, rgba(157,78,221,0.2) 100%)',
            border: '1px solid var(--cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--cyan)'
          }}
        >
          KA
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
            {personalInfo.name ? personalInfo.name.split(' ')[0] + ' Ankade' : 'Karan Ankade'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot"></span> Available for Hire
          </div>
        </div>
      </a>

      {/* Desktop Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={() => playClickSound()}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--cyan)';
              playHoverSound();
            }}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
            style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s ease',
            }}
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href={personalInfo.portfolio || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClickSound()}
          onMouseEnter={() => playHoverSound()}
          className="cyber-btn"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Download size={15} /> Resume
        </a>
      </div>
    </nav>
  );
}
