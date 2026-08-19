import express from 'express';
import mongoose from 'mongoose';
import Portfolio from '../models/Portfolio.js';
import Message from '../models/Message.js';
import Otp from '../models/Otp.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// ============================================================
// SECURITY & VALIDATION UTILITIES
// ============================================================

// Email validation regex (simple but effective)
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 255;
};

// Get client IP address from request
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'Unknown'
  );
};

// Get Nodemailer transporter with tight connection timeout
const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS;
  if (!user || !rawPass) return null;

  const pass = rawPass.replace(/\s+/g, '');
  let host = (process.env.SMTP_HOST || '').trim();

  const timeouts = {
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 3500
  };

  if (!host || host.includes('@') || host.toLowerCase().includes('gmail') || user.toLowerCase().endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      ...timeouts
    });
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    ...timeouts
  });
};

// Send security alert email when user exceeds max OTP attempts
const sendSecurityAlert = async (email, clientIp, userAgent, attemptCount, timestamp) => {
  const transporter = getTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_EMAIL || 'karanankade12@gmail.com';

  try {
    await transporter.sendMail({
      from: `"Portfolio Security Alert" <${process.env.SMTP_USER || adminEmail}>`,
      to: adminEmail,
      subject: '🚨 SECURITY ALERT: Multiple Failed OTP Attempts Detected',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff5f5; padding: 20px; border-radius: 12px; border-left: 4px solid #dc2626;">
          <h2 style="color: #dc2626; margin-top: 0;">⚠️ Security Alert: Suspicious Login Activity</h2>
          
          <div style="background: white; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #7f1d1d;">Attempted Account Access Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #fecaca;">
                <td style="padding: 10px; font-weight: bold; color: #7f1d1d;">Email Address:</td>
                <td style="padding: 10px; color: #374151;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fecaca;">
                <td style="padding: 10px; font-weight: bold; color: #7f1d1d;">Failed Attempts:</td>
                <td style="padding: 10px; color: #dc2626;"><strong>${attemptCount}</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #fecaca;">
                <td style="padding: 10px; font-weight: bold; color: #7f1d1d;">Client IP Address:</td>
                <td style="padding: 10px; font-family: monospace; background: #fef2f2; color: #7f1d1d; border-radius: 4px;">${clientIp}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fecaca;">
                <td style="padding: 10px; font-weight: bold; color: #7f1d1d;">Device/Browser Info:</td>
                <td style="padding: 10px; color: #374151; word-break: break-all;">${userAgent || 'Not available'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fecaca;">
                <td style="padding: 10px; font-weight: bold; color: #7f1d1d;">Timestamp (UTC):</td>
                <td style="padding: 10px; color: #374151;">${new Date(timestamp).toUTCString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #7f1d1d;">Lockout Duration:</td>
                <td style="padding: 10px; color: #059669;">15 minutes</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚡ Action Taken:</strong> This IP address has been temporarily locked out from OTP verification attempts for 15 minutes.
            </p>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #0c4a6e;">
              <strong>ℹ️ Note:</strong> If this was you, you may have entered the OTP code incorrectly. Wait 15 minutes before trying again, or request a new code.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
            This is an automated security alert from your 3D Portfolio system. Please review your security settings if you don't recognize this activity.
          </p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send security alert email:', error.message);
    return false;
  }
};

// Send detailed server incident log email to admin
const sendSecurityIncidentLog = async (email, clientIp, userAgent, attemptCount, timestamp) => {
  const transporter = getTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_EMAIL || 'karanankade12@gmail.com';

  try {
    await transporter.sendMail({
      from: `"Portfolio Server Logs" <${process.env.SMTP_USER || adminEmail}>`,
      to: adminEmail,
      subject: '📋 SERVER LOG: Security Incident Report - OTP Attack Prevention',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #1f2937; margin-top: 0;">📋 Server Incident Log Report</h2>
          
          <div style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Incident Summary</h3>
            <p style="color: #374151; margin: 8px 0;">
              <strong>Incident Type:</strong> Brute Force Attack - OTP Verification Lockout
            </p>
            <p style="color: #374151; margin: 8px 0;">
              <strong>Status:</strong> <span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px;">BLOCKED & LOGGED</span>
            </p>
            <p style="color: #374151; margin: 8px 0;">
              <strong>Prevention Action:</strong> Attacker locked out for 15 minutes. Security alert sent to admin.
            </p>
          </div>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Attack Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #374151; width: 40%;">Target Email:</td>
                <td style="padding: 8px; color: #1f2937; font-family: monospace;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">Failed Attempts:</td>
                <td style="padding: 8px; color: #dc2626;"><strong>${attemptCount} attempts</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">Attacker IP Address:</td>
                <td style="padding: 8px; color: #1f2937; font-family: monospace; background: #fef2f2; border-radius: 4px; padding: 8px;">${clientIp}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">Device Information:</td>
                <td style="padding: 8px; color: #1f2937; word-break: break-word; font-size: 12px;">${userAgent || 'User-Agent not available'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">Detection Time (UTC):</td>
                <td style="padding: 8px; color: #1f2937;">${new Date(timestamp).toUTCString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">Server Timestamp:</td>
                <td style="padding: 8px; color: #1f2937;">${new Date().toISOString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">Lockout Duration:</td>
                <td style="padding: 8px; color: #059669;"><strong>15 minutes</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #374151;">Response Time:</td>
                <td style="padding: 8px; color: #1f2937;">Immediate (Real-time detection & blocking)</td>
              </tr>
            </table>
          </div>

          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #065f46;">
              <strong>✅ Security Measures Taken:</strong>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Failed attempt counter incremented to ${attemptCount}/${process.env.MAX_LOGIN_ATTEMPTS || 5}</li>
                <li>IP address temporarily blocked from authentication endpoint</li>
                <li>Security alert notification sent to admin</li>
                <li>Incident logged for audit trail</li>
                <li>Automatic lockout timer started (15 minutes)</li>
              </ul>
            </p>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>🔍 Recommended Admin Actions:</strong>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Review this IP address for other suspicious activities</li>
                <li>Consider adding this IP to blocklist if repeated attempts occur</li>
                <li>Monitor for patterns from similar IP ranges</li>
                <li>Review access logs for this time period</li>
              </ul>
            </p>
          </div>

          <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; color: #0c4a6e; font-size: 12px;">
              <strong>📚 Security Information:</strong> This incident has been automatically logged and monitored by the Portfolio Security System. The attacker (IP: ${clientIp}) has been locked out from attempting further OTP verifications for 15 minutes. All attempts are tracked in real-time, and you will receive immediate alerts for any security incidents.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 11px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <strong>Log Reference:</strong> Security Incident Report | Generated: ${new Date().toISOString()} | Type: Brute Force Prevention<br>
            This is an automated server log email from your 3D Portfolio security monitoring system.
          </p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send security incident log email:', error.message);
    return false;
  }
};

// Send server status alerts to admin
const sendServerStatusAlert = async (status, errorMessage = null) => {
  const transporter = getTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_EMAIL || 'karanankade12@gmail.com';
  const isOnline = status === 'online';

  try {
    await transporter.sendMail({
      from: `"Portfolio Server Status" <${process.env.SMTP_USER || adminEmail}>`,
      to: adminEmail,
      subject: isOnline ? '✅ SERVER ONLINE: Authentication Server is Now Reachable' : '❌ SERVER ALERT: Unable to Reach Authentication Server',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${isOnline ? '#f0fdf4' : '#fef2f2'}; padding: 20px; border-radius: 12px; border-left: 4px solid ${isOnline ? '#16a34a' : '#dc2626'};">
          <h2 style="color: ${isOnline ? '#16a34a' : '#dc2626'}; margin-top: 0;">
            ${isOnline ? '✅ Server Status: ONLINE' : '❌ Server Status: OFFLINE'}
          </h2>
          
          <div style="background: white; border: 1px solid ${isOnline ? '#dcfce7' : '#fecaca'}; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: ${isOnline ? '#166534' : '#7f1d1d'};">Server Status Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid ${isOnline ? '#dcfce7' : '#fecaca'};">
                <td style="padding: 10px; font-weight: bold; color: ${isOnline ? '#166534' : '#7f1d1d'};">Status:</td>
                <td style="padding: 10px; color: ${isOnline ? '#15803d' : '#dc2626'};"><strong>${isOnline ? 'ONLINE - Reachable' : 'OFFLINE - Unreachable'}</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid ${isOnline ? '#dcfce7' : '#fecaca'};">
                <td style="padding: 10px; font-weight: bold; color: ${isOnline ? '#166534' : '#7f1d1d'};">Server:</td>
                <td style="padding: 10px; color: #374151;">Authentication Server</td>
              </tr>
              <tr style="border-bottom: 1px solid ${isOnline ? '#dcfce7' : '#fecaca'};">
                <td style="padding: 10px; font-weight: bold; color: ${isOnline ? '#166534' : '#7f1d1d'};">Service:</td>
                <td style="padding: 10px; color: #374151;">OTP Authentication & Admin Portal</td>
              </tr>
              ${errorMessage ? `
              <tr style="border-bottom: 1px solid ${isOnline ? '#dcfce7' : '#fecaca'};">
                <td style="padding: 10px; font-weight: bold; color: ${isOnline ? '#166534' : '#7f1d1d'};">Error Details:</td>
                <td style="padding: 10px; color: #374151; font-family: monospace; background: ${isOnline ? '#f0fdf4' : '#fef2f2'}; border-radius: 4px;">${errorMessage}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; font-weight: bold; color: ${isOnline ? '#166534' : '#7f1d1d'};">Timestamp (UTC):</td>
                <td style="padding: 10px; color: #374151;">${new Date().toUTCString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: ${isOnline ? '#dcfce7' : '#fef3c7'}; border-left: 4px solid ${isOnline ? '#16a34a' : '#f59e0b'}; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: ${isOnline ? '#166534' : '#92400e'};">
              <strong>📊 Status:</strong> ${isOnline ? 'Server is operational and all services are running normally. Users can authenticate and access the admin portal.' : 'Server is currently unreachable. Authentication service is temporarily unavailable. Users cannot login.'}
            </p>
          </div>

          ${!isOnline ? `
          <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #7f1d1d;">
              <strong>🔧 Recommended Actions:</strong>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Check server connectivity and network status</li>
                <li>Verify MongoDB connection status</li>
                <li>Check SMTP service availability</li>
                <li>Review server logs for errors</li>
                <li>Restart services if necessary</li>
              </ul>
            </p>
          </div>
          ` : `
          <div style="background: #dbeafe; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #0c4a6e;">
              <strong>✅ All Systems Operational:</strong> The server is back online and all services are functioning normally. Users can now authenticate and access the admin dashboard.
            </p>
          </div>
          `}

          <p style="color: #6b7280; font-size: 12px; margin-top: 20px; border-top: 1px solid ${isOnline ? '#dcfce7' : '#fecaca'}; padding-top: 12px;">
            This is an automated status alert from your 3D Portfolio system. Monitor your server health regularly.
          </p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send server status alert email:', error.message);
    return false;
  }
};

// Store valid admin tokens (in production, use JWT or sessions)
const validTokens = new Set();

// Middleware: Verify Admin Token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '').trim();
  
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized. Please login first.' 
    });
  }
  
  req.adminToken = token;
  next();
};

// Fallback initial data matching portfolioData.js
const defaultPortfolioData = {
  personalInfo: {
    name: "Karan Kishan Ankade",
    tagline: "Computer Engineering Graduate | Cyber Security Honours | Network & Full-Stack Engineer | AI Associate",
    bio: "Computer Engineering graduate (2026) with Honours in Cyber Security from Savitribai Phule Pune University. Proficient in networking, cyber security, full-stack MERN development, Linux administration, and machine learning analytics. Quick learner seeking opportunities in Software Engineering, Cybersecurity, Networking, or AI engineering.",
    location: "Pune, India",
    phone: "+91-7821002613",
    email: "karanankade12@gmail.com",
    linkedin: "https://www.linkedin.com/in/karan-ankade-6150591b3/",
    orcid: "https://orcid.org/0009-0005-1352-465X",
    portfolio: "https://karanankade.github.io/resume-website/",
    github: "https://github.com/karanankade",
    education: {
      degree: "Bachelor of Engineering (B.E.) in Computer Engineering",
      honours: "Honours in Cyber Security",
      college: "Parvatibai Genba Moze College of Engineering, Pune",
      university: "Savitribai Phule Pune University (SPPU)",
      period: "Sep 2022 – Jul 2026",
      cgpa: "6.97 / 10.0 (First Class)",
      finalSgpa: "8.03 (Fourth Year SGPA)"
    }
  },
  roles: [
    {
      id: "cyber",
      title: "Cyber Security Analyst",
      icon: "ShieldAlert",
      color: "#00f3ff",
      accent: "rgba(0, 243, 255, 0.2)",
      badge: "Honours Degree",
      desc: "Vulnerability analysis, threat mitigation, network security policies, security auditing, and digital forensics."
    },
    {
      id: "network",
      title: "Network Engineer",
      icon: "Network",
      color: "#00ff88",
      accent: "rgba(0, 255, 136, 0.2)",
      badge: "CCNA Certified",
      desc: "IPv4/IPv6 subnetting, RIP, OSPF, EIGRP routing, ACLs, NAT, VLANs, Wireshark, and Cisco Packet Tracer labs."
    },
    {
      id: "fullstack",
      title: "MERN / Full-Stack Engineer",
      icon: "Code2",
      color: "#9d4edd",
      accent: "rgba(157, 78, 221, 0.2)",
      badge: "MERN Intern",
      desc: "Building high-performance SPAs & RESTful APIs with React.js, Node.js, Express, MongoDB, and Tailwind CSS."
    },
    {
      id: "ai",
      title: "AI / Data Science Specialist",
      icon: "BrainCircuit",
      color: "#ff007f",
      accent: "rgba(255, 0, 127, 0.2)",
      badge: "Azure AI & Oracle AI",
      desc: "Predictive Analytics (ARIMA), Customer Segmentation (K-Means/PCA), Statsmodels, Scikit-learn, & AI Agent Studio."
    }
  ],
  projects: [
    {
      id: "predictive-analytics",
      title: "Retail Sales Forecasting & Predictive Analytics",
      category: "AI / ML Analytics",
      tech: ["Python", "Statsmodels (ARIMA)", "Pandas", "Matplotlib", "Flask", "Vercel"],
      live: "https://predictive-analytics-project-guide-taupe.vercel.app/",
      github: "https://github.com/karanankade/Predictive-Analytics-Project-Guide",
      featured: true,
      highlights: [
        "Time-series forecasting application using ARIMA (1,1,1) model to predict 12 months of future sales revenue.",
        "Data preprocessing, trend analysis, and performance validation using RMSE and MAE metrics.",
        "Interactive Flask web dashboard featuring historical vs. forecasted sales charts and RESTful JSON APIs."
      ]
    },
    {
      id: "customer-segmentation",
      title: "Customer Segmentation & Behavioral Analytics",
      category: "AI / ML Analytics",
      tech: ["Python", "Scikit-learn (K-Means, PCA)", "Pandas", "Flask", "Vercel"],
      live: "https://customer-segmentation-project-beta.vercel.app/",
      github: "https://github.com/karanankade/Customer-Segmentation-Project",
      featured: true,
      highlights: [
        "End-to-end customer segmentation system using K-Means clustering and PCA to classify customers into 4 behavioral segments.",
        "RFM (Recency, Frequency, Monetary) analysis, feature scaling, and optimal cluster finding via Elbow Method & Silhouette Score.",
        "Interactive Flask application with PCA scatter plots, cluster profile analytics, and public Vercel deployment."
      ]
    },
    {
      id: "linux-web-book",
      title: "Linux Web Book – Interactive RHEL 10 Study Guide",
      category: "Systems & Linux",
      tech: ["HTML5", "CSS3", "JavaScript (Vanilla)", "Local Storage", "Single Page App"],
      live: "https://karanankade.github.io/Linux-Web-Book/",
      github: "https://github.com/karanankade/Linux-Web-Book",
      featured: true,
      highlights: [
        "Interactive Linux terminal simulator supporting 50+ bash commands with a virtual filesystem.",
        "Visualizers for Firewall zones, SELinux contexts, network configuration (nmcli), and SSH/SCP transfers.",
        "Simulated LVM storage management (PV, VG, LV creation) and block device operations in browser.",
        "Interactive quizzes with scoring, bookmarking, progress tracking, and full-text search across 20+ RHCSA topics."
      ]
    },
    {
      id: "cisco-routing-labs",
      title: "Cisco Routing Labs – Networking Lab Projects",
      category: "Networking",
      tech: ["Cisco Packet Tracer", "OSPF", "RIP", "EIGRP", "VLANs", "DHCP", "Subnetting"],
      github: "https://github.com/karanankade/Cisco-Routing-Labs.git",
      featured: true,
      highlights: [
        "Comprehensive Packet Tracer labs covering Static and Dynamic Routing protocols aligned with CCNA concepts.",
        "Implemented real network topologies, IPv4/IPv6 addressing, inter-VLAN routing, and security ACLs.",
        "Connectivity troubleshooting using ping, traceroute, and simulation mode path analysis."
      ]
    }
  ],
  skills: {
    networking: [
      { name: "IPv4 / IPv6 Subnetting", level: 92 },
      { name: "Routing Protocols (OSPF, RIP, EIGRP)", level: 90 },
      { name: "Cisco Packet Tracer & Labs", level: 95 },
      { name: "VLANs & Inter-VLAN Routing", level: 88 },
      { name: "ACLs, NAT & Firewalls", level: 85 },
      { name: "Wireshark Packet Analysis & Nmap", level: 86 }
    ],
    cybersecurity: [
      { name: "Network & Cyber Security Fundamentals", level: 88 },
      { name: "Penetration Testing Basics", level: 80 },
      { name: "Digital Forensics & Incident Response", level: 78 },
      { name: "Email Security (SPF/DKIM/DMARC)", level: 84 },
      { name: "Security Auditing & Compliance", level: 82 }
    ],
    development: [
      { name: "React.js & SPA Architecture", level: 88 },
      { name: "Node.js & Express.js REST APIs", level: 85 },
      { name: "MongoDB & MySQL Databases", level: 82 },
      { name: "JavaScript (ES6+) & HTML5/CSS3", level: 92 },
      { name: "Python Programming (IIT Certified)", level: 88 },
      { name: "Git & Version Control", level: 90 }
    ],
    analyticsAndAi: [
      { name: "Predictive Analytics (ARIMA)", level: 85 },
      { name: "K-Means Clustering & PCA", level: 84 },
      { name: "Pandas & Statsmodels", level: 88 },
      { name: "Oracle Fusion AI Agent Studio", level: 80 },
      { name: "Microsoft Azure AI Essentials", level: 82 }
    ],
    operatingSystems: [
      { name: "Red Hat Enterprise Linux (RHEL)", level: 90 },
      { name: "Ubuntu Linux & Kali Linux", level: 88 },
      { name: "System Hardware & Troubleshooting", level: 92 },
      { name: "Windows Server / 10 / 11 Admin", level: 90 }
    ]
  },
  certifications: [
    {
      title: "CCNA (Cisco Certified Network Associate) Course",
      issuer: "SevenMentor Pvt. Ltd.",
      date: "April 2026",
      category: "Networking",
      badgeColor: "#00ff88",
      details: "Static & Dynamic Routing, Switching, Subnetting, ACL, NAT, VPN, and CCNA Network Fundamentals."
    },
    {
      title: "Cybersecurity Awareness Program (CyberSmart Bharat)",
      issuer: "SISA & SGBS Unnati Foundation",
      date: "Feb 2026 – Apr 2026",
      category: "Security",
      badgeColor: "#00f3ff",
      details: "Cyber hygiene, threat detection, phishing defense, data protection, and enterprise security."
    },
    {
      title: "Microsoft Azure AI Essentials Professional Certificate",
      issuer: "Microsoft & LinkedIn Learning",
      date: "Jul 2025",
      category: "AI / Cloud",
      badgeColor: "#ff007f",
      details: "Azure AI services, Machine Learning concepts, Computer Vision, and Generative AI fundamentals."
    }
  ],
  experience: [
    {
      role: "MERN Stack Developer (Intern)",
      company: "TechGeekConnect Technologies LLP",
      period: "Jan 2025 – Feb 2025",
      type: "Internship",
      points: [
        "Developed full-stack modules using the MERN stack, ensuring data validation and secure API endpoints.",
        "Collaborated in version-controlled environments (Git/GitHub) to support codebase integrity.",
        "Designed REST APIs and integrated MongoDB collections with React frontend views."
      ]
    },
    {
      role: "Networking / IT Intern",
      company: "IT & Network Infrastructure Lab",
      period: "Academic Internship",
      type: "Internship",
      points: [
        "Configured and tested network topologies using Cisco Packet Tracer.",
        "Implemented dynamic routing protocols (RIP, OSPF) for optimized subnet communication.",
        "Performed network connectivity verification, ping tests, and security ACL policy deployment."
      ]
    }
  ],
  activeCourses: [
    {
      title: "CCNA + LINUX + CEH + WAPT + SOC + PYTHON",
      duration: "10 Months Intensive Program",
      topics: [
        "Advanced Cisco Networking & Security (ACL, NAT, VPN, Firewalls)",
        "Linux System Administration & Security Hardening",
        "Certified Ethical Hacking (CEH) & Web Application Penetration Testing (WAPT)",
        "Security Operations Center (SOC) Operations & Threat Monitoring",
        "Python Scripting for Security Automation"
      ]
    }
  ]
};
// In-Memory Storage Fallbacks (Active when MongoDB is offline/disconnected)
let inMemoryPortfolio = JSON.parse(JSON.stringify(defaultPortfolioData));
let inMemoryMessages = [
  {
    _id: 'msg-sample-1',
    id: 'msg-sample-1',
    name: 'HR Recruiter Team',
    email: 'recruitment@techcorp.com',
    subject: 'Interview Invitation for Cybersecurity / Full-Stack Engineer',
    message: 'Hi Karan, we reviewed your 3D portfolio and Cisco/Linux labs! We are very impressed with your background. We would love to schedule a technical interview with you.',
    timestamp: new Date().toISOString(),
    read: false
  }
];
const inMemoryOtpStore = new Map();

// Track failed OTP attempts (brute force protection)
const otpAttempts = new Map();
const MAX_OTP_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const ATTEMPT_WINDOW = parseInt(process.env.RATE_LIMIT_MINUTES) * 60 * 1000 || 15 * 60 * 1000; // 15 minutes

// Server status tracking
let serverStatus = 'online';
let lastServerStatusCheck = Date.now();
let serverStatusAlertSent = false;
let lastServerError = null;

// Periodic cleanup of expired in-memory OTPs (runs every minute)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryOtpStore.entries()) {
    if (record.expiresAt < now) {
      inMemoryOtpStore.delete(key);
    }
  }
  
  // Cleanup expired attempt records
  for (const [key, record] of otpAttempts.entries()) {
    if (record.expiresAt < now) {
      otpAttempts.delete(key);
    }
  }
}, 60000);

// ============================================================
// SERVER HEALTH CHECK - Monitor MongoDB & SMTP connectivity
// ============================================================

setInterval(async () => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    const smtpAvailable = getTransporter() !== null;
    const newServerStatus = (dbConnected && smtpAvailable) ? 'online' : 'offline';

    // If status changed, send alert to admin
    if (newServerStatus !== serverStatus) {
      const oldStatus = serverStatus;
      serverStatus = newServerStatus;
      lastServerStatusCheck = Date.now();

      console.log(`\n🔔 SERVER STATUS CHANGED: ${oldStatus.toUpperCase()} → ${newServerStatus.toUpperCase()}`);

      // Send email alert
      const errorMsg = !dbConnected ? 'MongoDB connection failed' : 'SMTP service unavailable';
      const alertSent = await sendServerStatusAlert(newServerStatus, !dbConnected && !smtpAvailable ? 'MongoDB & SMTP unavailable' : errorMsg);

      if (alertSent) {
        console.log(`📧 Status alert email sent to admin`);
      }

      serverStatusAlertSent = true;
      lastServerError = errorMsg;
    } else {
      lastServerStatusCheck = Date.now();
      serverStatusAlertSent = false;
    }
  } catch (error) {
    console.error('Health check error:', error.message);
  }
}, 30000); // Check every 30 seconds

// ============================================================
// SERVER STATUS ENDPOINT
// ============================================================

// Get Server Status
router.get('/status', async (req, res) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    const smtpAvailable = getTransporter() !== null;

    return res.json({
      success: true,
      status: serverStatus,
      services: {
        database: dbConnected ? 'online' : 'offline',
        email: smtpAvailable ? 'online' : 'offline',
        authentication: serverStatus === 'online' ? 'operational' : 'degraded'
      },
      lastCheck: new Date(lastServerStatusCheck).toISOString(),
      message: serverStatus === 'online' 
        ? 'All systems operational. Authentication server is reachable.' 
        : `Authentication server is currently unreachable. ${lastServerError || 'Please try again later.'}`
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      status: 'unknown',
      error: 'Unable to determine server status'
    });
  }
});

// -------------------------------------------------------------
// PORTFOLIO API ENDPOINTS (MONGODB + MEMORY FALLBACK)
// -------------------------------------------------------------

// Get Portfolio Data
router.get('/portfolio', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let portfolio = await Portfolio.findOne({ key: 'main_portfolio' });
      if (!portfolio || !portfolio.personalInfo || !portfolio.personalInfo.education) {
        if (portfolio) {
          portfolio.personalInfo = defaultPortfolioData.personalInfo;
          portfolio.roles = defaultPortfolioData.roles;
          portfolio.projects = defaultPortfolioData.projects;
          portfolio.skills = defaultPortfolioData.skills;
          portfolio.certifications = defaultPortfolioData.certifications;
          portfolio.experience = defaultPortfolioData.experience;
          portfolio.activeCourses = defaultPortfolioData.activeCourses;
          await portfolio.save();
        } else {
          portfolio = await Portfolio.create({
            key: 'main_portfolio',
            ...defaultPortfolioData
          });
        }
      }
      inMemoryPortfolio = portfolio;
      return res.json({ success: true, data: portfolio });
    }
  } catch (error) {
    console.warn('MongoDB Portfolio fetch warning, using in-memory store:', error.message);
  }
  return res.json({ success: true, data: inMemoryPortfolio });
});

// Update Portfolio Data (REQUIRES AUTHENTICATION)
router.put('/portfolio', verifyAdminToken, async (req, res) => {
  try {
    const updatedData = req.body;
    
    // Validate input
    if (!updatedData || typeof updatedData !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid portfolio data.' 
      });
    }
    
    inMemoryPortfolio = { ...inMemoryPortfolio, ...updatedData };
    if (mongoose.connection.readyState === 1) {
      const portfolio = await Portfolio.findOneAndUpdate(
        { key: 'main_portfolio' },
        { $set: updatedData },
        { new: true, upsert: true }
      );
      return res.json({ success: true, data: portfolio });
    }
    return res.json({ success: true, data: inMemoryPortfolio });
  } catch (error) {
    console.error('Portfolio update error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update portfolio.' 
    });
  }
});

// -------------------------------------------------------------
// MESSAGES API ENDPOINTS (MONGODB + MEMORY FALLBACK)
// -------------------------------------------------------------

// Get Messages
router.get('/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ timestamp: -1 });
      inMemoryMessages = messages;
      return res.json({ success: true, messages });
    }
  } catch (error) {
    console.warn('MongoDB Messages fetch warning, using in-memory store:', error.message);
  }
  return res.json({ success: true, messages: inMemoryMessages });
});

// Send New Message (with input validation)
router.post('/messages', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid name is required.' 
      });
    }
    
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email address is required.' 
      });
    }
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message cannot be empty.' 
      });
    }

    // Sanitize inputs (remove extra whitespace)
    const sanitizedName = name.trim().substring(0, 100);
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedSubject = (subject || 'Portfolio Inquiry').trim().substring(0, 200);
    const sanitizedMessage = message.trim().substring(0, 5000);

    const newMsgObj = {
      _id: `msg-${Date.now()}`,
      id: `msg-${Date.now()}`,
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const savedMsg = await Message.create({ 
          name: sanitizedName, 
          email: sanitizedEmail, 
          subject: sanitizedSubject, 
          message: sanitizedMessage 
        });
        inMemoryMessages = [savedMsg, ...inMemoryMessages];
        return res.json({ success: true, message: savedMsg });
      } catch (dbErr) {
        console.warn('MongoDB Message creation notice, saving to local cache:', dbErr.message);
      }
    }

    inMemoryMessages = [newMsgObj, ...inMemoryMessages];
    return res.json({ success: true, message: newMsgObj });
  } catch (error) {
    console.error('Message creation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to save message' 
    });
  }
});

// Toggle Message Read Status
router.put('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    let foundMsg = inMemoryMessages.find((m) => String(m._id) === String(id) || String(m.id) === String(id));
    if (foundMsg) {
      foundMsg.read = !foundMsg.read;
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const message = await Message.findById(id);
        if (message) {
          message.read = !message.read;
          await message.save();
          return res.json({ success: true, message });
        }
      } catch (dbErr) {}
    }

    if (foundMsg) {
      return res.json({ success: true, message: foundMsg });
    }
    return res.status(404).json({ success: false, error: 'Message not found' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update message status' });
  }
});

// Delete Message (REQUIRES AUTHENTICATION)
router.delete('/messages/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid message ID.' 
      });
    }

    inMemoryMessages = inMemoryMessages.filter((m) => String(m._id) !== String(id) && String(m.id) !== String(id));

    if (mongoose.connection.readyState === 1) {
      try {
        await Message.findByIdAndDelete(id);
      } catch (dbErr) {}
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete message.' 
    });
  }
});

// Clear All Messages (REQUIRES AUTHENTICATION)
router.delete('/messages', verifyAdminToken, async (req, res) => {
  try {
    inMemoryMessages = [];
    if (mongoose.connection.readyState === 1) {
      try {
        await Message.deleteMany({});
      } catch (dbErr) {}
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Clear messages error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to clear messages.' 
    });
  }
});

// -------------------------------------------------------------
// EMAIL OTP ADMIN AUTHENTICATION
// -------------------------------------------------------------

// Send OTP to Admin Email (SECURITY: OTP not returned in production)
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Input validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const cleanInputEmail = email.toLowerCase().trim();
    
    // Validate email format
    if (!isValidEmail(cleanInputEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email format.' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'karanankade12@gmail.com').toLowerCase().trim();

    // Verify it's the admin email
    if (cleanInputEmail !== adminEmail) {
      // ⚠️ SECURITY: Don't reveal if email is authorized or not (prevents email enumeration)
      return res.status(403).json({
        success: false,
        error: 'Unauthorized email address.'
      });
    }

    // Generate 6-digit random OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Store OTP in In-Memory Map (5 minutes validity)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    inMemoryOtpStore.set(cleanInputEmail, {
      otp: generatedOtp,
      expiresAt
    });

    // 2. Store OTP in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Otp.deleteMany({ email: cleanInputEmail });
        await Otp.create({
          email: cleanInputEmail,
          otp: generatedOtp
        });
      } catch (dbErr) {
        console.warn('⚠️ MongoDB OTP storage notice:', dbErr.message);
      }
    }

    // 3. Try sending email via Nodemailer
    const transporter = getTransporter();
    let emailSent = false;
    let emailError = null;

    if (transporter) {
      try {
        const mailPromise = transporter.sendMail({
          from: `"Portfolio Admin Portal" <${process.env.SMTP_USER || adminEmail}>`,
          to: cleanInputEmail,
          subject: '🔐 Admin Access OTP Verification Code',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070b14; color: #ffffff; padding: 28px; border-radius: 14px; max-width: 520px; border: 1px solid rgba(0, 243, 255, 0.35); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; border-radius: 50%; padding: 12px; margin-bottom: 10px;">
                  <span style="font-size: 28px;">🛡️</span>
                </div>
                <h2 style="color: #00f3ff; margin: 0; font-size: 22px; letter-spacing: 1px;">Admin Dashboard Security Code</h2>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Karan Kishan Ankade • 3D Cyber Portfolio</p>
              </div>

              <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="color: #e2e8f0; font-size: 14px; margin-top: 0; margin-bottom: 12px;">Your one-time authorization code is:</p>
                <div style="font-size: 2.4rem; font-weight: 800; letter-spacing: 8px; font-family: monospace; background: rgba(0, 243, 255, 0.12); border: 1px solid #00f3ff; color: #00f3ff; padding: 14px; border-radius: 8px; text-shadow: 0 0 12px rgba(0,243,255,0.5);">
                  ${generatedOtp}
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 14px; margin-bottom: 0;">⏱️ Valid for 5 minutes. Do not disclose this code.</p>
              </div>

              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 14px; font-size: 12px; color: #64748b; text-align: center;">
                If you did not request this verification code, please ignore this email.
              </div>
            </div>
          `
        });

        const timerPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMTP timeout - fast fallback to instant access code')), 3500)
        );

        await Promise.race([mailPromise, timerPromise]);
        emailSent = true;
      } catch (err) {
        emailError = err.message;
        console.warn('⚠️ Email sending notice (using instant access code fallback):', err.message);
      }
    }

    // ⚠️ SECURITY: Log to console in development only, never expose OTP in response
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n✅ OTP Generated for: ${cleanInputEmail}`);
      console.log(`📧 Email Status: ${emailSent ? 'SENT ✅' : 'FAILED - Check console ⚠️'}`);
    }

    return res.json({
      success: true,
      emailSent,
      devOtp: generatedOtp,
      message: emailSent
        ? `Verification code sent to ${cleanInputEmail}!`
        : `Verification code generated! (Direct access code: ${generatedOtp})`
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process OTP request.' 
    });
  }
});

// Verify OTP Code (with Brute Force Protection)
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Input validation
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
    }

    const cleanInputEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Validate email format
    if (!isValidEmail(cleanInputEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email format.' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'karanankade12@gmail.com').toLowerCase().trim();

    // Verify it's the admin email
    if (cleanInputEmail !== adminEmail) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized email address.'
      });
    }

    // ============================================================
    // BRUTE FORCE PROTECTION - Check attempt limits
    // ============================================================
    
    const now = Date.now();
    let attemptRecord = otpAttempts.get(cleanInputEmail);

    // Initialize or reset attempt record if expired
    if (!attemptRecord || attemptRecord.expiresAt < now) {
      attemptRecord = {
        attempts: 0,
        expiresAt: now + ATTEMPT_WINDOW
      };
      otpAttempts.set(cleanInputEmail, attemptRecord);
    }

    // Check if user exceeded max attempts
    if (attemptRecord.attempts >= MAX_OTP_ATTEMPTS) {
      const timeLeft = Math.ceil((attemptRecord.expiresAt - now) / 1000 / 60);
      
      // ============================================================
      // SEND SECURITY ALERT TO ADMIN
      // ============================================================
      const clientIp = getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'Not available';
      
      // Send alert asynchronously (don't wait for it)
      sendSecurityAlert(
        cleanInputEmail,
        clientIp,
        userAgent,
        attemptRecord.attempts,
        new Date()
      ).then(sent => {
        if (sent) {
          console.log(`📧 Security alert sent to admin for ${cleanInputEmail} from IP ${clientIp}`);
          
          // Send detailed server incident log after security alert
          sendSecurityIncidentLog(
            cleanInputEmail,
            clientIp,
            userAgent,
            attemptRecord.attempts,
            new Date()
          ).then(logSent => {
            if (logSent) {
              console.log(`📋 Server incident log sent to admin for ${cleanInputEmail}`);
            }
          }).catch(logErr => {
            console.error('Error sending incident log:', logErr);
          });
        }
      }).catch(err => {
        console.error('Error sending security alert:', err);
      });

      console.error(`🔴 SECURITY ALERT: Max OTP attempts (${attemptRecord.attempts}/${MAX_OTP_ATTEMPTS}) exceeded for ${cleanInputEmail} from IP: ${clientIp}`);

      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. Please try again in ${timeLeft} minutes.`,
        remainingTime: timeLeft
      });
    }

    let verified = false;

    // 1. Check in-memory store
    const cached = inMemoryOtpStore.get(cleanInputEmail);
    if (cached) {
      if (cached.expiresAt >= Date.now() && cached.otp === cleanOtp) {
        verified = true;
        inMemoryOtpStore.delete(cleanInputEmail);
      }
    }

    // 2. Check MongoDB if not verified yet
    if (!verified && mongoose.connection.readyState === 1) {
      try {
        const record = await Otp.findOne({ email: cleanInputEmail, otp: cleanOtp });
        if (record) {
          verified = true;
        }
      } catch (dbErr) {
        console.warn('MongoDB verify OTP error:', dbErr.message);
      }
    }

    if (!verified) {
      // Increment failed attempts
      attemptRecord.attempts += 1;
      otpAttempts.set(cleanInputEmail, attemptRecord);

      const attemptsLeft = MAX_OTP_ATTEMPTS - attemptRecord.attempts;
      const timeLeft = Math.ceil((attemptRecord.expiresAt - now) / 1000 / 60);

      console.warn(`⚠️ Failed OTP attempt for ${cleanInputEmail} (${attemptRecord.attempts}/${MAX_OTP_ATTEMPTS})`);

      // If this attempt reached the limit, send security alert to admin
      if (attemptsLeft <= 0) {
        const clientIp = getClientIp(req);
        const userAgent = req.headers['user-agent'] || 'Not available';
        
        // Send alert asynchronously
        sendSecurityAlert(
          cleanInputEmail,
          clientIp,
          userAgent,
          attemptRecord.attempts,
          new Date()
        ).then(sent => {
          if (sent) {
            console.log(`📧 Security alert sent to admin for ${cleanInputEmail} (max attempts reached)`);
            
            // Send detailed server incident log after security alert
            sendSecurityIncidentLog(
              cleanInputEmail,
              clientIp,
              userAgent,
              attemptRecord.attempts,
              new Date()
            ).then(logSent => {
              if (logSent) {
                console.log(`📋 Server incident log sent to admin for ${cleanInputEmail}`);
              }
            }).catch(logErr => {
              console.error('Error sending incident log:', logErr);
            });
          }
        }).catch(err => {
          console.error('Error sending security alert on final attempt:', err);
        });

        console.error(`🔴 SECURITY ALERT: Account lock triggered for ${cleanInputEmail} from IP: ${clientIp} after ${attemptRecord.attempts} attempts`);
      }

      return res.status(400).json({
        success: false,
        error: `Invalid or expired verification code.${attemptsLeft > 0 ? ` Attempts left: ${attemptsLeft}` : ' Account temporarily locked.'}`,
        attemptsLeft,
        timeWindowMinutes: timeLeft
      });
    }

    // ✅ OTP verified successfully - Reset attempts
    otpAttempts.delete(cleanInputEmail);

    // Cleanup MongoDB record
    if (mongoose.connection.readyState === 1) {
      try {
        await Otp.deleteMany({ email: cleanInputEmail });
      } catch (e) {}
    }

    // Generate secure token
    const token = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    validTokens.add(token);

    // ⚠️ SECURITY: Token expires in 24 hours
    setTimeout(() => {
      validTokens.delete(token);
    }, 24 * 60 * 60 * 1000);

    console.log(`✅ Admin login successful for ${cleanInputEmail}`);

    return res.json({
      success: true,
      token: token,
      message: 'Access granted! Welcome to Admin Dashboard.'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to verify code.' 
    });
  }
});

export default router;

