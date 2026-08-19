import React from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { Briefcase, GraduationCap, Clock, CheckCircle2 } from 'lucide-react';

export default function ExperienceTimeline() {
  const { data } = usePortfolioData();
  const experience = data.experience || [];
  const activeCourses = data.activeCourses || [];
  const personalInfo = data.personalInfo || {};
  return (
    <section id="experience" className="section-container">
      <div className="section-title">
        <Briefcase color="var(--cyan)" size={32} />
        <h2>Work Experience & Education</h2>
      </div>
      <p className="section-subtitle">
        Internships, academic milestones, and ongoing professional development programs.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px' }}>
        {/* Left Column: Work Experience */}
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--cyan)' }}>
            <Briefcase size={20} /> Professional Experience
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {experience.map((exp, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{exp.role}</h4>
                    <div style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '0.9rem' }}>{exp.company}</div>
                  </div>
                  <span className="tech-tag" style={{ fontSize: '0.75rem' }}>{exp.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '14px' }}>
                  {exp.points.map((pt, i) => (
                    <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="var(--emerald)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Education & Course in Progress */}
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--purple)' }}>
            <GraduationCap size={20} /> Education & Specializations
          </h3>

          {/* Education Card */}
          {personalInfo.education && (
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <span className="tech-tag" style={{ marginBottom: '12px', background: 'rgba(157, 78, 221, 0.15)', color: 'var(--purple)', borderColor: 'var(--purple)' }}>
                {personalInfo.education.period || 'Sep 2022 – Jul 2026'}
              </span>
              <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginTop: '8px', marginBottom: '4px' }}>
                {personalInfo.education.degree || 'Bachelor of Engineering (B.E.) in Computer Engineering'}
              </h4>
              <div style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                {personalInfo.education.college || 'Parvatibai Genba Moze College of Engineering, Pune'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {personalInfo.education.university || 'Savitribai Phule Pune University (SPPU)'}
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--emerald)', color: 'var(--emerald)' }}>
                  {personalInfo.education.cgpa || '6.97 / 10.0 (First Class)'}
                </div>
                <div style={{ background: 'rgba(0, 243, 255, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>
                  {personalInfo.education.finalSgpa || '8.03 (Fourth Year SGPA)'}
                </div>
              </div>
            </div>
          )}

          {/* Course In Progress Card */}
          {activeCourses.map((c, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--magenta)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--magenta)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                <Clock size={16} /> PROGRAM IN PROGRESS ({c.duration})
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '12px' }}>
                {c.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {c.topics.map((tp, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--magenta)' }} />
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
