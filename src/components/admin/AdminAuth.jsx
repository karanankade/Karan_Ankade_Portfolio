import React, { useState } from 'react';
import { Shield, Mail, KeyRound, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { playAccessGrantedSound, playErrorSound, playClickSound } from '../../utils/audioFX';

export default function AdminAuth({ onAuthenticated, onClose }) {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [email, setEmail] = useState('karanankade12@gmail.com');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim();

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { error: `Server returned status ${res.status}` };
      }

      setLoading(false);

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'OTP verification code sent to your email! Please check your inbox.');
        setStep(2);
      } else {
        playErrorSound();
        setError(data.error || 'Failed to send OTP email. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      playErrorSound();
      console.error('OTP send error:', err);
      setError('Unable to reach backend server. If using Render free tier, please wait 30 seconds for the server to wake up and try again.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { error: `Server returned status ${res.status}` };
      }

      setLoading(false);

      if (res.ok && data.success) {
        playAccessGrantedSound();
        onAuthenticated();
      } else {
        playErrorSound();
        setError(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setLoading(false);
      playErrorSound();
      console.error('OTP verify error:', err);
      setError('Server authentication error. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 20, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: '24px',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 243, 255, 0.15)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}

        {/* Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(0,243,255,0.2) 0%, rgba(157,78,221,0.2) 100%)',
              border: '1px solid var(--cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0,243,255,0.3)'
            }}
          >
            <Shield color="var(--cyan)" size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
            Email OTP Admin Portal
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {step === 1 ? 'Enter your registered Admin Email to receive a 6-digit verification code.' : `Enter the 6-digit OTP code sent to ${email}`}
          </p>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: 'var(--emerald)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Message Banner */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 77, 77, 0.1)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              color: '#ff6b6b',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Admin Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    background: 'rgba(5, 8, 20, 0.9)',
                    border: '1px solid rgba(0, 243, 255, 0.25)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '0.95rem'
              }}
            >
              {loading ? (
                'Generating OTP Code...'
              ) : (
                <>
                  Send OTP Code <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                6-Digit Security OTP Code
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    background: 'rgba(5, 8, 20, 0.9)',
                    border: '1px solid rgba(0, 243, 255, 0.25)',
                    color: 'var(--cyan)',
                    fontSize: '1.2rem',
                    letterSpacing: '4px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="cyber-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '0.95rem'
              }}
            >
              {loading ? (
                'Verifying OTP...'
              ) : (
                <>
                  Verify OTP & Access Portal <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cyan)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} /> Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
