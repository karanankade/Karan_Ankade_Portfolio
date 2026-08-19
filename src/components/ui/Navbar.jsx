import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Network, Code2, BrainCircuit, Download, Menu, X, Lock } from 'lucide-react';
import { usePortfolioData } from '../../data/portfolioStore';
import { playHoverSound, playClickSound } from '../../utils/audioFX';

export default function Navbar({ activeRole, setActiveRole, onOpenAdmin }) {
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
    <>
      <nav
        style={{
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: '1280px',
          zIndex: 100,
          background: scrolled ? 'rgba(7, 9, 19, 0.92)' : 'rgba(14, 18, 36, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 243, 255, 0.25)',
          borderRadius: '16px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.85)' : '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Brand & Status */}
        <a
          href="#"
          onClick={() => playClickSound()}
          onMouseEnter={() => playHoverSound()}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0,243,255,0.2) 0%, rgba(157,78,221,0.2) 100%)',
              border: '1px solid var(--cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--cyan)'
            }}
          >
            KA
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.2 }}>
              {personalInfo.name ? personalInfo.name.split(' ')[0] + ' Ankade' : 'Karan Ankade'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="status-dot"></span> Available
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
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
                fontSize: '0.88rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Admin Portal Button */}
          <button
            onClick={() => {
              playClickSound();
              if (onOpenAdmin) onOpenAdmin();
              else window.location.hash = '#admin';
            }}
            title="Admin Portal"
            style={{
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: 'var(--cyan)',
              padding: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Lock size={14} />
            <span className="desktop-only-text">Admin</span>
          </button>

          {/* Resume Button */}
          <a
            href={personalInfo.portfolio || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            onMouseEnter={() => playHoverSound()}
            className="cyber-btn desktop-only-btn"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Download size={14} /> Resume
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle navigation menu"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              borderRadius: '8px',
              padding: '8px',
              color: 'var(--cyan)',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer glass-panel"
          style={{
            position: 'fixed',
            top: '74px',
            left: '12px',
            right: '12px',
            zIndex: 99,
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(7, 10, 24, 0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 243, 255, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => {
                  playClickSound();
                  setMobileMenuOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <a
              href={personalInfo.portfolio || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="cyber-btn"
              style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
            >
              <Download size={15} /> Resume
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAdmin) onOpenAdmin();
                else window.location.hash = '#admin';
              }}
              style={{
                flex: 1,
                background: 'rgba(0, 243, 255, 0.1)',
                border: '1px solid var(--cyan)',
                borderRadius: '8px',
                color: 'var(--cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Lock size={15} /> Admin Portal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
