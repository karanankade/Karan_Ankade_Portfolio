import React from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { Award, ShieldCheck, CheckCircle, ExternalLink } from 'lucide-react';
import HoloCardTilt from './HoloCardTilt';

export default function Certifications() {
  const { data } = usePortfolioData();
  const certifications = data.certifications || [];
  return (
    <section id="certifications" className="section-container">
      <div className="section-title">
        <Award color="var(--amber)" size={32} />
        <h2>Industry Certifications & Credentials</h2>
      </div>
      <p className="section-subtitle">
        Professional credentials from Cisco, IIT Bombay, Microsoft, Oracle, SISA, and SevenMentor.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {certifications.map((cert, idx) => (
          <HoloCardTilt
            key={idx}
            className="glass-panel"
            style={{
              padding: '24px',
              borderLeft: `4px solid ${cert.badgeColor}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: cert.badgeColor + '22',
                    color: cert.badgeColor,
                    border: `1px solid ${cert.badgeColor}`
                  }}
                >
                  {cert.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cert.date}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#ffffff' }}>
                {cert.title}
              </h3>

              <div style={{ fontSize: '0.9rem', color: 'var(--cyan)', fontWeight: 600, marginBottom: '12px' }}>
                {cert.issuer}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {cert.details}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--emerald)', marginTop: '16px' }}>
              <CheckCircle size={15} /> Verified Credential
            </div>
          </HoloCardTilt>
        ))}
      </div>
    </section>
  );
}
