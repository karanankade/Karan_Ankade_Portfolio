import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Shield, CornerDownLeft, Circle, Sparkles } from 'lucide-react';
import { personalInfo, projects, skills, certifications } from '../../data/portfolioData';
import { playTerminalKeySound, playClickSound } from '../../utils/audioFX';
import MatrixRain from './MatrixRain';

export default function LinuxTerminal() {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { text: 'Linux Interactive Shell v2.4 (RHEL 10 Simulator)', type: 'system' },
    { text: 'Type "help" or tap the command chips below to inspect skills, projects, and credentials.', type: 'info' },
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const processCommand = (cmdString) => {
    const cmd = cmdString.trim().toLowerCase();
    const newHistory = [...history, { text: `karan@rhel-host:~$ ${cmdString}`, type: 'input' }];

    if (!cmd) {
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    switch (cmd) {
      case 'help':
        newHistory.push({
          text: `AVAILABLE BASH COMMANDS:
- help       : Show this menu
- whoami     : Display developer summary
- ls         : List virtual directory contents
- cat skills : Output technical skill matrix
- projects   : List live portfolio projects
- certs      : Show CCNA & IIT Bombay credentials
- ping       : Ping developer network latency
- sudo get-resume : Download official PDF resume
- clear      : Clear terminal screen`,
          type: 'output'
        });
        break;

      case 'whoami':
        newHistory.push({
          text: `${personalInfo.name}
${personalInfo.tagline}
Location: ${personalInfo.location} | Education: SPPU B.E. Computer Engineering (Cyber Security Honours)`,
          type: 'output'
        });
        break;

      case 'ls':
        newHistory.push({
          text: `drwxr-xr-x 2 karan security 4096 Jul 30 12:00 projects/
-rw-r--r-- 1 karan security 1024 Jul 30 12:00 skills.txt
-rw-r--r-- 1 karan security 2048 Jul 30 12:00 certifications.txt
-rwxr-xr-x 1 karan security 4096 Jul 30 12:00 resume.pdf*`,
          type: 'output'
        });
        break;

      case 'cat skills':
      case 'skills':
        newHistory.push({
          text: `NETWORKING: IPv4/v6, Subnetting, OSPF, RIP, EIGRP, VLANs, ACL, Wireshark, Cisco Packet Tracer
SECURITY  : Cyber Security, Penetration Testing, Email SPF/DKIM, Digital Forensics
MERN STACK: React.js, Node.js, Express.js, MongoDB, REST APIs, Tailwind CSS
AI / DATA : ARIMA Sales Forecasting, K-Means Clustering, PCA, Statsmodels, Scikit-learn
SYSTEMS   : RHEL, Ubuntu Linux, Kali Linux, System Hardware Admin`,
          type: 'output'
        });
        break;

      case 'projects':
        newHistory.push({
          text: projects.map((p, i) => `[${i + 1}] ${p.title} (${p.category}) -> ${p.live || p.github}`).join('\n'),
          type: 'output'
        });
        break;

      case 'certs':
        newHistory.push({
          text: certifications.map(c => `• ${c.title} - ${c.issuer} (${c.date})`).join('\n'),
          type: 'output'
        });
        break;

      case 'ping':
      case 'ping karan':
        newHistory.push({
          text: `PING karan.ankade (192.168.1.100) 56(84) bytes of data.
64 bytes from karan.ankade: icmp_seq=1 ttl=64 time=0.042 ms
64 bytes from karan.ankade: icmp_seq=2 ttl=64 time=0.038 ms
--- karan.ankade ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms`,
          type: 'output'
        });
        break;

      case 'sudo get-resume':
      case 'get-resume':
        window.open(personalInfo.portfolio, '_blank');
        newHistory.push({
          text: `[AUTH SUCCESS] Triggering resume fetch... Opening ${personalInfo.portfolio}`,
          type: 'output'
        });
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        newHistory.push({
          text: `bash: command not found: "${cmd}". Type "help" for a list of commands.`,
          type: 'error'
        });
        break;
    }

    setHistory(newHistory);
    setInputVal('');
  };

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      playClickSound();
      processCommand(inputVal);
    }
  };

  const quickCommands = ['help', 'whoami', 'cat skills', 'projects', 'certs', 'ping', 'clear'];

  return (
    <section id="terminal" className="section-container">
      <div className="section-title">
        <Terminal color="var(--cyan)" size={32} />
        <h2>Interactive Linux Terminal Simulator</h2>
      </div>
      <p className="section-subtitle">
        Tribute to my <b>Linux Web Book (RHEL 10)</b> project. Test live bash commands or tap quick-chips below.
      </p>

      {/* Terminal Window */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            background: 'rgba(5, 8, 20, 0.95)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Circle size={11} fill="#ff5f56" color="#ff5f56" />
            <Circle size={11} fill="#ffbd2e" color="#ffbd2e" />
            <Circle size={11} fill="#27c93f" color="#27c93f" />
            <span
              style={{
                marginLeft: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}
            >
              karan@rhel10-core:~
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
            ● ONLINE 100Mbps
          </div>
        </div>

        {/* Quick Command Chips (Mobile Friendly) */}
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(10, 14, 30, 0.8)',
            borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Sparkles size={13} /> Quick:
          </span>
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                playClickSound();
                processCommand(cmd);
              }}
              style={{
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.25)',
                color: 'var(--text-main)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 243, 255, 0.2)';
                e.target.style.borderColor = 'var(--cyan)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 243, 255, 0.08)';
                e.target.style.borderColor = 'rgba(0, 243, 255, 0.25)';
              }}
            >
              ${cmd}
            </button>
          ))}
        </div>

        {/* Terminal Body */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            position: 'relative',
            padding: '18px',
            minHeight: '280px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.88rem',
            lineHeight: 1.55,
            background: 'rgba(7, 9, 19, 0.96)'
          }}
        >
          {/* Digital Matrix Rain Animation Stream */}
          <MatrixRain />
          {history.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color:
                  item.type === 'input'
                    ? 'var(--cyan)'
                    : item.type === 'error'
                    ? '#ff4d4d'
                    : item.type === 'system'
                    ? 'var(--emerald)'
                    : 'var(--text-main)'
              }}
            >
              {item.text}
            </div>
          ))}

          {/* Active Input Line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ color: 'var(--emerald)', fontWeight: 'bold', fontSize: '0.85rem' }}>karan@rhel-host:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => {
                playTerminalKeySound();
                setInputVal(e.target.value);
              }}
              onKeyDown={handleCommand}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                flex: 1,
                minWidth: '60px'
              }}
              placeholder="type 'help' or tap chips..."
            />
            <CornerDownLeft size={15} color="var(--text-muted)" />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </section>
  );
}
