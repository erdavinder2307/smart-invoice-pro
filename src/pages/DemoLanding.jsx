import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  isDemoHost,
  openInteractiveWorkspace,
} from '../utils/demoMode';

const ROLE_ICONS = {
  Sales: '📈',
  Manager: '🎯',
  Accountant: '📊',
  Purchaser: '🛒',
};

const DemoLanding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loadingRole, setLoadingRole] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isDemoHost()) {
      openInteractiveWorkspace('/');
      return;
    }

    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    axios
      .get(createApiUrl('/api/auth/demo-roles'))
      .then((res) => setRoles(res.data?.roles || []))
      .catch(() => {
        setRoles([
          { role: 'Sales', title: 'Sales', description: 'Quotes, customers, invoices' },
          { role: 'Manager', title: 'Manager', description: 'Overview and approvals' },
          { role: 'Accountant', title: 'Accountant', description: 'Bills, expenses, reports' },
          { role: 'Purchaser', title: 'Purchaser', description: 'Vendors and purchase orders' },
        ]);
      });
  }, [isAuthenticated, navigate]);

  const handleStart = async (role) => {
    setError('');
    setLoadingRole(role);
    try {
      await demoLogin({ role });
      if (isDemoHost()) {
        navigate('/dashboard', { replace: true });
      } else {
        openInteractiveWorkspace('/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to start demo session. Please try again.';
      setError(msg);
    } finally {
      setLoadingRole('');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0b1324 0%, #132040 45%, #1e3a8a 100%)',
        color: '#f8fafc',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ letterSpacing: 2, textTransform: 'uppercase', opacity: 0.75, fontSize: 13 }}>
            Interactive Workspace
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '12px 0' }}>
            Explore Solidev Books
          </h1>
          <p style={{ maxWidth: 640, margin: '0 auto', opacity: 0.85, lineHeight: 1.6 }}>
            Choose a business role to enter a live workspace with realistic B2B data. No signup,
            no password, no sales call.
          </p>
        </header>

        {error && (
          <div
            style={{
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(220,38,38,0.35)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {roles.map(({ role, title, description }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleStart(role)}
              disabled={Boolean(loadingRole)}
              style={{
                textAlign: 'left',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                padding: 24,
                color: 'inherit',
                cursor: loadingRole ? 'wait' : 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{ROLE_ICONS[role] || '✨'}</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{title || role}</div>
              <div style={{ opacity: 0.8, fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
                {description}
              </div>
              <div style={{ fontWeight: 600, color: '#93c5fd' }}>
                {loadingRole === role ? 'Starting…' : 'Open workspace →'}
              </div>
            </button>
          ))}
        </div>

        <footer style={{ textAlign: 'center', marginTop: 48, opacity: 0.65, fontSize: 14 }}>
          <p>Workspace data resets periodically. Production app:{' '}
            <a href="https://www.solidevbooks.com/login" style={{ color: '#93c5fd' }}>
              sign in here
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DemoLanding;
