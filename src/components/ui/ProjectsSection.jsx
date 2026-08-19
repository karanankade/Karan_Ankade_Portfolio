import React, { useState } from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { FolderGit2, ExternalLink, Github, Sparkles, CheckCircle2 } from 'lucide-react';
import HoloCardTilt from './HoloCardTilt';

export default function ProjectsSection() {
  const { data } = usePortfolioData();
  const projects = data.projects || [];
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'AI / ML Analytics', 'Systems & Linux', 'Networking', 'MERN Stack', 'Cyber Security', 'Frontend Web'];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category?.toLowerCase().includes(activeFilter.toLowerCase()) || (activeFilter === 'MERN Stack' && p.category?.includes('MERN')));

  return (
    <section id="projects" className="section-container">
      <div className="section-title">
        <FolderGit2 color="var(--cyan)" size={32} />
        <h2>Featured Technical Projects</h2>
      </div>
      <p className="section-subtitle">
        Hands-on systems, networking labs, full-stack web applications, and AI analytics projects.
      </p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: activeFilter === cat ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
              color: activeFilter === cat ? '#000000' : 'var(--text-muted)',
              border: activeFilter === cat ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid with 3D HoloCardTilt */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredProjects.map((project) => (
          <HoloCardTilt
            key={project.id}
            className="glass-panel"
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Row: Category Tag & Links */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="tech-tag">{project.category}</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--cyan)')}
                      onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
                      title="GitHub Repository"
                    >
                      <Github size={18} />
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--cyan)')}
                      onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
                      title="Live Demo"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#ffffff' }}>
                {project.title}
              </h3>

              {/* Highlights */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
                {project.highlights.map((point, i) => (
                  <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={15} color="var(--emerald)" style={{ marginTop: '3px', flexShrink: 0 }} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Tech Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {project.tech.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: 'rgba(0, 243, 255, 0.06)',
                    color: 'var(--cyan)',
                    border: '1px solid rgba(0, 243, 255, 0.15)'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </HoloCardTilt>
        ))}
      </div>
    </section>
  );
}
