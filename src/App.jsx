/* build: 1772120819651 */

// Global error safety net
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
  });
}
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';

/* ====== STORAGE ====== */
const save = (key, data) => { try { localStorage.setItem('nuoperandi_' + key, JSON.stringify(data)); } catch(e) {} };
const load = (key, fallback) => { try { const d = localStorage.getItem('nuoperandi_' + key); return d ? JSON.parse(d) : fallback; } catch(e) { return fallback; } };
let _id = parseInt(localStorage.getItem('nuoperandi_idcount') || '100');
const newId = () => { _id++; localStorage.setItem('nuoperandi_idcount', String(_id)); return _id; };

/* ====== SPARKLINE ====== */
const Spark = ({ data, color = "#3B82F6" }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const w = 64, h = 28, pad = 2;
    const pts = data.filter(Boolean).map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);
        return x + ',' + y;
    }).join(' ');
    return <svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

/* ====== QUOTES ====== */
const quotes = [
    "Resilience is not a personality trait   it is a competitive strategy.",
    "Trust is your currency. Build it relentlessly.",
    "A billionaire is someone who has positively influenced a billion people. Not someone with a billion dollars.",
    "Never say die until the bones are rotten.",
    "Never build without truth. If it cannot survive honesty, it is not from you.",
    "Structure is love. Disorder is not mercy. Clarity is.",
    "No work that requires self-betrayal. Not for money. Not for speed. Not for validation.",
    "Liberation before scale. Do not multiply broken identities.",
    "Authority before visibility. Be rooted before you are seen.",
    "Teach people how to stand, not how to cling. Dependency is not discipleship.",
    "Leave systems behind, not just stories. People must be able to continue without you.",
    "Remember: you are a pen, not the Author. Stay surrendered. Stay dangerous.",
    "Separate business expenses from personal expenses   this is non-negotiable for scaling.",
    "Exchange affirmation for accomplishment. Stop seeking likes and validation. Seek results.",
    "Exchange security for significance. The safe bet will not build a billion-person impact.",
    "Exchange immediate victory for long-term sustainability. Play the 10-year game.",
    "Change your attitude towards uncertainty. VUCA is permanent. Embrace it as your competitive advantage.",
    "Stop being a people pleaser. Be the best at what you do and it will follow.",
    "Stop measuring performance solely in immediate results.",
    "Set up a Personal Advisory Board   people who believe in you, bring fresh energy and fresh direction.",
    "You cannot ask God to guide your steps if you cannot move your feet. Now move your feet."
];
const getQuote = () => quotes[Math.floor(Date.now() / (5 * 60 * 60 * 1000)) % quotes.length];

/* ====== EMBLEM LOGO ====== */
const Emblem = ({ size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle */}
        <circle cx="100" cy="100" r="96" stroke="#B8952C" strokeWidth="3" fill="none"/>
        <circle cx="100" cy="100" r="88" stroke="#B8952C" strokeWidth="2" fill="none"/>
        {/* Eagle */}
        <g transform="translate(100,28)" fill="#B8952C">
            <path d="M0,-8 C-3,-8 -6,-6 -8,-4 L-22,-2 C-24,-1.5 -26,-3 -28,-2 L-24,0 L-28,1 L-24,2.5 L-27,4 L-22,4 C-18,3 -14,1 -10,2 L-6,6 L-3,2 L0,4 L3,2 L6,6 L10,2 C14,1 18,3 22,4 L27,4 L24,2.5 L28,1 L24,0 L28,-2 C26,-3 24,-1.5 22,-2 L8,-4 C6,-6 3,-8 0,-8Z"/>
            <circle cx="0" cy="-4" r="1.5" fill="#8B7320"/>
        </g>
        {/* Laurel wreath left */}
        <g stroke="#B8952C" strokeWidth="1.5" fill="none">
            <path d="M42,70 Q38,80 40,90 Q36,95 38,105 Q34,110 37,120 Q33,125 36,135 Q34,140 38,148"/>
            <path d="M40,72 Q48,76 46,84" /><path d="M38,84 Q46,88 44,96" /><path d="M36,96 Q44,100 42,108" /><path d="M35,108 Q43,112 41,120" /><path d="M34,120 Q42,124 40,132" /><path d="M35,132 Q43,136 41,144" />
            <path d="M40,72 Q32,76 34,84" /><path d="M38,84 Q30,88 32,96" /><path d="M36,96 Q28,100 30,108" /><path d="M35,108 Q27,112 29,120" /><path d="M34,120 Q26,124 28,132" /><path d="M35,132 Q27,136 29,144" />
        </g>
        {/* Laurel wreath right */}
        <g stroke="#B8952C" strokeWidth="1.5" fill="none">
            <path d="M158,70 Q162,80 160,90 Q164,95 162,105 Q166,110 163,120 Q167,125 164,135 Q166,140 162,148"/>
            <path d="M160,72 Q152,76 154,84" /><path d="M162,84 Q154,88 156,96" /><path d="M164,96 Q156,100 158,108" /><path d="M165,108 Q157,112 159,120" /><path d="M166,120 Q158,124 160,132" /><path d="M165,132 Q157,136 159,144" />
            <path d="M160,72 Q168,76 166,84" /><path d="M162,84 Q170,88 168,96" /><path d="M164,96 Q172,100 170,108" /><path d="M165,108 Q173,112 171,120" /><path d="M166,120 Q174,124 172,132" /><path d="M165,132 Q173,136 171,144" />
        </g>
        {/* AA Monogram */}
        <g fill="none" stroke="#B8952C" strokeWidth="3.5" strokeLinecap="round">
            <path d="M78,130 L90,70 Q100,55 110,70 L122,130"/>
            <path d="M82,118 Q100,108 118,118"/>
            <path d="M72,130 L86,76 Q100,50 114,76 L128,130"/>
            <path d="M77,118 Q100,105 123,118"/>
        </g>
        {/* Inner circle around monogram */}
        <circle cx="100" cy="100" r="48" stroke="#B8952C" strokeWidth="1.5" fill="none"/>
        {/* Math symbols */}
        <text x="58" y="58" fill="#B8952C" fontSize="14" fontFamily="serif" fontStyle="italic">e<tspan fontSize="10" baselineShift="super">x</tspan></text>
        <text x="135" y="58" fill="#B8952C" fontSize="18" fontFamily="serif">{'\u03A3'}</text>
        <text x="90" y="162" fill="#B8952C" fontSize="13" fontFamily="serif" fontStyle="italic">n<tspan fontSize="9" baselineShift="super">th</tspan></text>
        {/* Infinity */}
        <text x="92" y="182" fill="#B8952C" fontSize="18" fontFamily="serif">{'\u221E'}</text>
        {/* Wreath tie at bottom */}
        <g stroke="#B8952C" strokeWidth="1.5" fill="none">
            <path d="M90,152 L100,158 L110,152"/>
            <path d="M92,155 L100,162 L108,155"/>
        </g>
    </svg>
);

/* ====== ICONS ====== */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('NuOperandi caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 30%, #F5F3FF 60%, #EEF2FF 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '2rem'
        }
      },
        React.createElement('div', {
          style: {
            background: 'white',
            borderRadius: '1.5rem',
            padding: '3rem',
            maxWidth: '420px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(124,58,237,0.12)'
          }
        },
          React.createElement('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '\u26A0\uFE0F'),
          React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem' } }, 'Something went wrong'),
          React.createElement('p', { style: { color: '#6B7280', marginBottom: '1rem', lineHeight: 1.5 } }, 'NuOperandi ran into an issue. Click below to reload and get back to work.'),
          React.createElement('details', { style: { marginBottom: '1rem', textAlign: 'left', width: '100%' } },
            React.createElement('summary', { style: { cursor: 'pointer', color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '0.5rem' } }, 'Error details (screenshot this for support)'),
            React.createElement('pre', { style: { background: '#F3F4F6', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.7rem', color: '#EF4444', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '120px', overflow: 'auto', textAlign: 'left' } }, this.state.error ? (this.state.error.message + '\n' + (this.state.error.stack || '').split('\n').slice(0, 4).join('\n')) : 'Unknown error')
          ),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            style: {
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.15s'
            },
            onMouseOver: (e) => e.target.style.transform = 'scale(1.04)',
            onMouseOut: (e) => e.target.style.transform = 'scale(1)'
          }, 'Reload NuOperandi')
        )
      );
    }
    return this.props.children;
  }
}


const SafeModule = ({children, name}) => {
  try {
    return children;
  } catch(e) {
    console.error('Module ' + name + ' render error:', e);
    return React.createElement('div', {
      style: { padding: '2rem', textAlign: 'center', color: '#6B7280' }
    }, 'This section encountered an error. Please refresh.');
  }
};

class ModuleBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error, info) {
    console.error('Module error in ' + (this.props.name || 'unknown') + ':', error);
  }
  render() {
    if (this.state.hasError) {
      const self = this;
      return React.createElement('div', {
        style: {
          padding: '2rem',
          textAlign: 'center',
          background: 'white',
          borderRadius: '1rem',
          margin: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }
      },
        React.createElement('p', { style: { color: '#6B7280', marginBottom: '0.5rem' } },
          'This section ran into an issue.'),
        React.createElement('details', { style: { marginBottom: '0.75rem', textAlign: 'left', width: '100%' } },
          React.createElement('summary', { style: { cursor: 'pointer', color: '#9CA3AF', fontSize: '0.7rem' } }, 'Error details'),
          React.createElement('pre', { style: { background: '#F9FAFB', borderRadius: '0.375rem', padding: '0.5rem', fontSize: '0.65rem', color: '#EF4444', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '80px', overflow: 'auto' } }, this.state.errorMsg || 'Unknown')
        ),
        React.createElement('button', {
          onClick: () => self.setState({ hasError: false, errorMsg: '' }),
          style: {
            background: '#7C3AED',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1.25rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }
        }, 'Retry')
      );
    }
    return this.props.children;
  }
}

const safe = (v) => Array.isArray(v) ? v : [];
const I = {
    dollar: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    calendar: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    trending: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    bell: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    plus: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    chevron: (c="currentColor") => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
    bulb: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
    menu: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    x: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    circle: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>,
    arrowUp: (c="currentColor") => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    arrowDown: (c="currentColor") => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
    zap: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    bar: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    settings: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    trash: (c="currentColor") => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    edit: (c="currentColor") => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    arrowRight: (c="currentColor") => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    wallet: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="1" y="5" width="22" height="16" rx="2"/><path d="M1 10h22"/><circle cx="18" cy="15" r="1"/></svg>,
    receipt: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>,
    clipboard: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
    command: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    newspaper: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="10" y1="6" x2="18" y2="6"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    clock: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    history: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,
    user: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

/* ====== DEFAULT DATA ====== */
const defaultIncome = [];
const defaultProjects = [];
const defaultTasks = [];
const defaultTimeBlocks = [];
const defaultIdeas = [];
const defaultLearning = [];
const defaultTeam = [];
const defaultAlerts = [];
const defaultWeeklyPlan = [];
const defaultExpenses = [];

/* ====== MODAL COMPONENT ====== */
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-lg card-shadow p-0 max-h-[85vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition">{I.x("#9CA3AF")}</button>
            </div>
            <div className="px-6 py-5 overflow-auto flex-1">{children}</div>
        </div>
    </div>
);

const Field = ({ label, children }) => (
    <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
        {children}
    </div>
);

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition";
const btnPrimary = "w-full py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition";
const btnDanger = "px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition";

/* ====== FORM COMPONENTS ====== */
const IncomeForm = ({ item, onClose, setIncomeStreams }) => {
    const [name, setName] = useState(item ? item.name : '');
    const [role, setRole] = useState(item ? (item.role || '') : '');
    const [company, setCompany] = useState(item ? (item.company || '') : '');
    const [type, setType] = useState(item ? item.type : 'Active');
    const [monthly, setMonthly] = useState(item ? Number(item.monthly).toLocaleString('en-US') : '');
    const [status, setStatus] = useState(item ? item.status : 'On Track');
    const [nextPayment, setNextPayment] = useState(item ? (item.nextPayment || '') : '');
    const [paymentCycle, setPaymentCycle] = useState(item ? (item.paymentCycle || 'Monthly') : 'Monthly');
    const [payments, setPayments] = useState(item && item.payments ? item.payments : []);
    const addPaymentMilestone = () => {
        setPayments(prev => [...prev, { id: Date.now(), label: '', amount: '', dueDate: '', paid: false, paidDate: null }]);
    };
    const updateMilestone = (mId, field, value) => {
        setPayments(prev => prev.filter(Boolean).map(p => p.id === mId ? { ...p, [field]: value } : p));
    };
    const removeMilestone = (mId) => {
        setPayments(prev => prev.filter(p => p.id !== mId));
    };
    const toggleMilestonePaid = (mId) => {
        setPayments(prev => prev.filter(Boolean).map(p => p.id === mId ? { ...p, paid: !p.paid, paidDate: !p.paid ? new Date().toISOString().split('T')[0] : null } : p));
    };
    const submit = () => {
        if (!name || !monthly) return;
        const val = Number(monthly.replace(/[^0-9.]/g, ''));
        const data = { name, role, company, type, monthly: val, status, nextPayment, paymentCycle, payments: payments.filter(Boolean).map(p => ({ ...p, amount: Number(String(p.amount).replace(/[^0-9.]/g, '')) || 0 })) };
        if (item) {
            setIncomeStreams(prev => prev.filter(Boolean).map(s => s.id === item.id ? { ...s, ...data } : s));
        } else {
            setIncomeStreams(prev => [...prev, { id: newId(), ...data, lastPayment: new Date().toISOString().split('T')[0], trend: [val, val] }]);
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Income Stream' : 'Add Income Stream'} onClose={onClose}>
            <Field label="Client / Source Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ginger Technologies Limited" /></Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Your Role"><input className={inputCls} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Principal Consultant" /></Field>
                <Field label="Your Company"><input className={inputCls} value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Stamfordham" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                    <select className={inputCls} value={type} onChange={e => setType(e.target.value)}>
                        <option value="Active">Active</option><option value="Passive">Passive</option>
                    </select>
                </Field>
                <Field label="Monthly Amount ( ₦)"><input className={inputCls} value={monthly} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); if (!raw) { setMonthly(''); return; } const parts = raw.split('.'); parts[0] = Number(parts[0]).toLocaleString('en-US'); setMonthly(parts.join('.')); }} placeholder="e.g. 1,000,000" type="text" inputMode="numeric" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Next Payment Due"><input className={inputCls} type="date" value={nextPayment} onChange={e => setNextPayment(e.target.value)} /></Field>
                <Field label="Payment Cycle">
                    <select className={inputCls} value={paymentCycle} onChange={e => setPaymentCycle(e.target.value)}>
                        <option value="Weekly">Weekly</option><option value="Bi-weekly">Bi-weekly</option><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Annual">Annual</option><option value="Project-based">Project-based</option>
                    </select>
                </Field>
            </div>
            <Field label="Status">
                <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="On Track">On Track</option><option value="Growing">Growing</option><option value="At Risk">At Risk</option>
                </select>
            </Field>
            {/* Payment Milestones */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Milestones</span>
                <button type="button" onClick={addPaymentMilestone} className="text-xs text-violet-600 hover:text-violet-700 font-medium">+ Add Milestone</button>
              </div>
              {payments.length === 0 && <p className="text-xs text-gray-400 italic mb-2">No milestones yet. Add deposit/balance tracking.</p>}
              {payments.filter(Boolean).map((pm, pmIdx) => (
                <div key={pm.id} className={"mb-2 p-3 rounded-lg border text-sm " + (pm.paid ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200")}>
                  <div className="flex items-center gap-2 mb-2">
                    <button type="button" onClick={() => toggleMilestonePaid(pm.id)} className={"w-5 h-5 rounded border-2 flex items-center justify-center text-xs " + (pm.paid ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-blue-400")}>
                      {pm.paid && "\u2713"}
                    </button>
                    <input className="flex-1 bg-transparent border-b border-gray-200 focus:border-blue-400 outline-none text-sm px-1 py-0.5" placeholder={"Milestone " + (pmIdx + 1) + " (e.g. Deposit, Balance)"} value={pm.label} onChange={e => updateMilestone(pm.id, 'label', e.target.value)}/>
                    <button type="button" onClick={() => removeMilestone(pm.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                  </div>
                  <div className="flex gap-2 ml-7">
                    <input className="w-28 bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:border-blue-400 outline-none" placeholder="Amount" value={pm.amount} onChange={e => updateMilestone(pm.id, 'amount', e.target.value)}/>
                    <input type="date" className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:border-blue-400 outline-none" value={pm.dueDate || ''} onChange={e => updateMilestone(pm.id, 'dueDate', e.target.value)}/>
                  </div>
                  {pm.paid && pm.paidDate && <p className="text-xs text-green-600 ml-7 mt-1">{"Paid on " + pm.paidDate}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
                {item && <button className={btnDanger} onClick={() => { setIncomeStreams(prev => prev.filter(s => s.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save Changes' : 'Add Income Stream'}</button>
            </div>
        </Modal>
    );
};

const AcceptTaskModal = ({ task, onChooseDaily, onChooseWeekly, onCancel }) => {
  const priorityColors = { high: "bg-red-100 text-red-600", medium: "bg-amber-100 text-amber-600", low: "bg-green-100 text-green-600" };
  return (
    <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-md card-shadow p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Where should this go?</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5">
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-900 mb-1">{task.task_text}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-600">from {task.delegator_name}</span>
              {task.priority && <span className={"text-xs px-1.5 py-0.5 rounded-full " + (priorityColors[task.priority] || priorityColors.medium)}>{task.priority}</span>}
              {task.deadline && <span className="text-xs text-gray-400">{task.deadline}</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onChooseDaily(task)} className={"flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition hover:shadow-md " + (task.task_type === "quick" ? "border-blue-400 bg-violet-50" : "border-gray-200 hover:border-blue-300")}>
              <span className="text-2xl">📋</span>
              <span className="text-sm font-medium text-gray-900">Daily Tasks</span>
              <span className="text-xs text-gray-500">Add to today's plan</span>
            </button>
            <button onClick={() => onChooseWeekly(task)} className={"flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition hover:shadow-md " + (task.task_type === "weekly" ? "border-blue-400 bg-violet-50" : "border-gray-200 hover:border-blue-300")}>
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium text-gray-900">Weekly Plan</span>
              <span className="text-xs text-gray-500">Add to this week</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DelegateLaunchpad = ({ supabase, supaUser, userProfile, onDelegate, I }) => {
  const [taskText, setTaskText] = useState("");
  const [recipient, setRecipient] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [taskType, setTaskType] = useState("quick");
  const [deadline, setDeadline] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchUsers = async (query) => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const { data } = await supabase.from("profiles").select("id, username, full_name").or("username.ilike.%" + query + "%,full_name.ilike.%" + query + "%").neq("id", supaUser.id).limit(5);
      setSuggestions(data || []);
      setShowSuggestions((data || []).length > 0);
    } catch (e) { console.log("Search error:", e); }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setRecipient(user.username);
    setShowSuggestions(false);
  };

  const launch = async () => {
    if (!taskText.trim() || !selectedUser) return;
    setSending(true);
    try {
      await onDelegate({
        task_text: taskText.trim(),
        delegated_to: selectedUser.id,
        recipient_username: selectedUser.username,
        recipient_name: selectedUser.full_name || selectedUser.username,
        priority: priority,
        task_type: taskType,
        deadline: taskType === "weekly" ? deadline : null
      });
      setSent(true);
      setTimeout(() => {
        setTaskText(""); setRecipient(""); setSelectedUser(null);
        setPriority("medium"); setTaskType("quick"); setDeadline("");
        setSent(false);
      }, 2000);
    } catch (e) { console.log("Delegate error:", e); }
    setSending(false);
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🚀</span>
        <h3 className="text-sm font-semibold text-purple-900">Delegate Launchpad</h3>
        {sent && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 animate-pulse">Launched!</span>}
      </div>
      <textarea value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="Describe the task..." className="w-full p-3 rounded-xl border border-purple-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 mb-3" rows={2} />
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <div className="flex items-center bg-white rounded-xl border border-purple-200 px-3">
            <span className="text-purple-400 text-sm mr-1">@</span>
            <input value={recipient} onChange={e => { setRecipient(e.target.value); setSelectedUser(null); searchUsers(e.target.value); }} placeholder="username" className="flex-1 py-2 text-sm bg-transparent focus:outline-none" />
            {selectedUser && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">'</span>}
          </div>
          {showSuggestions && <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
            {suggestions.filter(Boolean).map(u => <button key={u.id} onClick={() => selectUser(u)} className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2">
              <span className="font-medium text-gray-900">{u.full_name || u.username}</span>
              <span className="text-xs text-gray-400">@{u.username}</span>
            </button>)}
          </div>}
        </div>
        <div className="flex rounded-xl border border-purple-200 overflow-hidden bg-white">
          <button onClick={() => setTaskType("quick")} className={"px-3 py-2 text-xs font-medium transition " + (taskType === "quick" ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-purple-50")}>Daily</button>
          <button onClick={() => setTaskType("weekly")} className={"px-3 py-2 text-xs font-medium transition " + (taskType === "weekly" ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-purple-50")}>Weekly</button>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">Priority:</span>
        {["high","medium","low"].filter(Boolean).map(p => <button key={p} onClick={() => setPriority(p)} className={"text-xs px-2 py-1 rounded-full transition " + (priority === p ? (p === "high" ? "bg-red-100 text-red-600" : p === "medium" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600") : "bg-gray-100 text-gray-400 hover:bg-gray-200")}>{p}</button>)}
        {taskType === "weekly" && <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1" />}
      </div>
      <button onClick={launch} disabled={!taskText.trim() || !selectedUser || sending} className={"w-full py-2.5 rounded-xl text-sm font-semibold transition " + (taskText.trim() && selectedUser && !sending ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
        {sent ? "' Launched!" : sending ? "Launching..." : "🚀 Launch Task"}
      </button>
    </div>
  );
};


const ProjectForm = ({ item, onClose, setProjects, getProjectProgress, supaUser, weeklyPlan, quickTasks }) => {
    const [name, setName] = useState(item ? item.name : '');
    const [desc, setDesc] = useState(item ? item.desc : '');
    const [status, setStatus] = useState(item ? item.status : 'Planning');
    const [launch, setLaunch] = useState(item ? item.launch : '');
    const [team, setTeam] = useState(item ? String(item.team) : '1');
    const [next, setNext] = useState(item ? item.next : '');
    const [selectedMembers, setSelectedMembers] = useState(item && item.teamMembers ? item.teamMembers : []);
    const [memberSearch, setMemberSearch] = useState('');
    const [memberSuggestions, setMemberSuggestions] = useState([]);
    const searchMembers = async (q) => {
        if (!q || q.length < 1) { setMemberSuggestions([]); return; }
        const clean = q.replace('@', '').toLowerCase();
        const { data } = await supabase.from('profiles').select('id, username, full_name, initials, avatar_url').ilike('username', clean + '%').limit(5);
        setMemberSuggestions((data || []).filter(u => !selectedMembers.includes(u.username)));
    };
    const addMember = (username) => { setSelectedMembers(prev => [...prev, username]); setMemberSearch(''); setMemberSuggestions([]); };
    const removeMember = (username) => { setSelectedMembers(prev => prev.filter(u => u !== username)); };
    const autoProgress = item ? getProjectProgress(item.id) : null;
    const submit = () => {
        if (!name) return;
        if (item) {
            setProjects(prev => prev.filter(Boolean).map(p => p.id === item.id ? { ...p, name, desc, status, launch, team: Number(team), next, teamMembers: selectedMembers } : p));
      // Sync tagged members and project snapshot to Supabase
      (async () => {
            try {
              if (supaUser && selectedMembers && selectedMembers.length > 0) {
                const { data: profiles } = await supabase.from('profiles').select('id, username').in('username', selectedMembers);
                await supabase.from('project_members').delete().eq('project_owner_id', supaUser.id).eq('project_local_id', item.id);
                const rows = (profiles || []).filter(Boolean).map(p => ({
                  project_owner_id: supaUser.id,
                  project_local_id: item.id,
                  project_name: name,
                  member_profile_id: p.id,
                  role: 'member'
                }));
                if (rows.length > 0) await supabase.from('project_members').insert(rows);
              } else if (supaUser) {
                await supabase.from('project_members').delete().eq('project_owner_id', supaUser.id).eq('project_local_id', item.id);
              }
              if (supaUser) {
                const linkedW = weeklyPlan.filter(t => t.projectId === item.id);
                const linkedD = (quickTasks || []).filter(t => t.projectId === item.id);
                const snap = { name, desc, status, progress: item.progress, launch, next, teamMembers: selectedMembers || [] };
                const tasksSnap = [...linkedW.filter(Boolean).map(t => ({ ...t, type: 'weekly' })), ...linkedD.filter(Boolean).map(t => ({ ...t, type: 'daily' }))];
                await supabase.from('shared_project_data').upsert({ project_owner_id: supaUser.id, project_local_id: item.id, project_snapshot: snap, tasks_snapshot: tasksSnap, updated_at: new Date().toISOString() }, { onConflict: 'project_owner_id,project_local_id' });
              }
            } catch (err) { console.error('sync error:', err); }
          })();
        } else {
            setProjects(prev => [...prev, { id: newId(), name, desc, progress: 0, status, start: new Date().toISOString().split('T')[0], launch, team: Number(team), next, teamMembers: selectedMembers }]);
      // Sync new project members
      const newProjId = projects.length > 0 ? Math.max(...projects.filter(Boolean).map(p => p.id)) + 1 : 1;
      (async () => {
            try {
              if (supaUser && selectedMembers && selectedMembers.length > 0) {
                const { data: profiles } = await supabase.from('profiles').select('id, username').in('username', selectedMembers);
                const rows = (profiles || []).filter(Boolean).map(p => ({
                  project_owner_id: supaUser.id,
                  project_local_id: newProjId,
                  project_name: name,
                  member_profile_id: p.id,
                  role: 'member'
                }));
                if (rows.length > 0) await supabase.from('project_members').insert(rows);
              }
              if (supaUser) {
                const linkedW = weeklyPlan.filter(t => t.projectId === newProjId);
                const linkedD = (quickTasks || []).filter(t => t.projectId === newProjId);
                const snap = { name, desc, status: 'Planning', progress: 0, launch, next, teamMembers: selectedMembers || [] };
                const tasksSnap = [...linkedW.filter(Boolean).map(t => ({ ...t, type: 'weekly' })), ...linkedD.filter(Boolean).map(t => ({ ...t, type: 'daily' }))];
                await supabase.from('shared_project_data').upsert({ project_owner_id: supaUser.id, project_local_id: newProjId, project_snapshot: snap, tasks_snapshot: tasksSnap, updated_at: new Date().toISOString() }, { onConflict: 'project_owner_id,project_local_id' });
              }
            } catch (err) { console.error('sync error:', err); }
          })();
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Project' : 'Add Project'} onClose={onClose}>
            <Field label="Project Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NuOperandi MVP" /></Field>
            <Field label="Description"><input className={inputCls} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description" /></Field>
            {item && autoProgress !== null && (
                <div className="mb-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <p className="text-xs text-violet-700 font-medium">Progress auto-calculated from linked tasks: {autoProgress}%</p>
                </div>
            )}
            <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                    <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="Planning">Planning</option><option value="In Progress">In Progress</option><option value="Launch Ready">Launch Ready</option><option value="Completed">Completed</option>
                    </select>
                </Field>
                <Field label="Team Size"><input className={inputCls} type="number" min="1" value={team} onChange={e => setTeam(e.target.value)} /></Field>
            </div>
            <Field label="Team Members">
                <div className="space-y-2">
                    {selectedMembers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedMembers.filter(Boolean).map(u => (
                                <span key={u} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    @{u}
                                    <button type="button" onClick={() => removeMember(u)} className="ml-0.5 hover:text-purple-900">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="relative">
                        <input className={inputCls} value={memberSearch} onChange={e => { setMemberSearch(e.target.value); searchMembers(e.target.value); }} placeholder="Search by username..." />
                        {memberSuggestions.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                {memberSuggestions.filter(Boolean).map(u => (
                                    <button key={u.username} type="button" onClick={() => addMember(u.username)} className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">{u.username[0].toUpperCase()}</span>
                                        <span className="font-medium">{u.full_name || u.username}</span>
                                        <span className="text-gray-400 text-xs">@{u.username}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Field>
            <Field label="Target Launch Date"><input className={inputCls} type="date" value={launch} onChange={e => setLaunch(e.target.value)} /></Field>
            <Field label="Next Action"><input className={inputCls} value={next} onChange={e => setNext(e.target.value)} placeholder="What's the next step?" /></Field>
            <div className="flex gap-2 mt-6">
                {item && <button className={btnDanger} onClick={() => { setProjects(prev => prev.filter(p => p.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save Changes' : 'Add Project'}</button>
            </div>
        </Modal>
    );
};

const WeeklyTaskForm = ({ item, onClose, setWeeklyPlan, activeProjects, onDelegate }) => {
    const [task, setTask] = useState(item ? item.task : '');
    const [projId, setProjId] = useState(item ? (item.projectId || '') : '');
    const [subtasks, setSubtasks] = useState(item && item.subtasks ? item.subtasks.filter(Boolean).map(s => ({...s})) : []);
    const [newSub, setNewSub] = useState('');
    const [deadline, setDeadline] = useState(item ? (item.deadline || '') : '');
    const [delegatedTo, setDelegatedTo] = useState(item ? (item.delegatedTo || '') : '');
    const addSub = () => {
        if (!newSub.trim()) return;
        setSubtasks(prev => [...prev, { id: newId(), text: newSub.trim(), done: false }]);
        setNewSub('');
    };
    const removeSub = (sid) => setSubtasks(prev => prev.filter(s => s.id !== sid));
    const [userSuggestions, setUserSuggestions] = useState([]);
    const searchUsers = async (q) => {
        if (!q || q.length < 2) { setUserSuggestions([]); return; }
        const clean = q.replace('@', '').toLowerCase();
        const { data } = await supabase.from('profiles').select('id, username, full_name, initials, avatar_url').ilike('username', clean + '%').limit(5);
        setUserSuggestions(data || []);
    };
    const submit = () => {
        if (!task) return;
        const pid = projId ? Number(projId) : null;
        if (item) {
            setWeeklyPlan(prev => prev.filter(Boolean).map(w => w.id === item.id ? { ...w, task, projectId: pid, subtasks, deadline, delegatedTo } : w));
        } else {
            setWeeklyPlan(prev => [...prev, { id: newId(), task, projectId: pid, subtasks, deadline, delegatedTo }]);
        }
        if (delegatedTo && onDelegate) {
            onDelegate({ task_text: task, task_type: 'weekly', recipient_username: delegatedTo.replace('@', '').toLowerCase(), deadline });
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Weekly Task' : 'Add Weekly Task'} onClose={onClose}>
            <Field label="Task">
                <input className={inputCls} value={task} onChange={e => setTask(e.target.value)} placeholder="What needs to happen this week?" />
            </Field>
            <Field label="Linked Project (optional)">
                <select className={inputCls} value={projId} onChange={e => setProjId(e.target.value)}>
                    <option value="">No project</option>
                    {activeProjects.filter(Boolean).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </Field>
            <Field label="Sub-goals">
                {subtasks.length > 0 && (
                    <div className="space-y-2 mb-3">
                        {subtasks.filter(Boolean).map(s => (
                            <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg group">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                <span className="text-sm text-gray-700 flex-1">{s.text}</span>
                                <button onClick={() => removeSub(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-0.5">{I.x("#9CA3AF")}</button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <input className={inputCls} value={newSub} onChange={e => setNewSub(e.target.value)} placeholder="Add a sub-goal..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }} />
                    <button type="button" onClick={addSub} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition flex-shrink-0">Add</button>
                </div>
            </Field>
            <Field label="Deadline (optional)">
                <input type="date" className={inputCls} value={deadline} onChange={e => setDeadline(e.target.value)} />
            </Field>
            <Field label="Delegate to (optional)">
                <input type="text" className={inputCls} value={delegatedTo} onChange={e => { setDelegatedTo(e.target.value); searchUsers(e.target.value); }} placeholder="e.g. @username" />
                {userSuggestions.length > 0 && <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">{userSuggestions.filter(Boolean).map(u => (
                    <div key={u.username} className="px-3 py-2 text-xs cursor-pointer hover:bg-violet-50 flex items-center gap-2" onClick={() => { setDelegatedTo(u.username); setUserSuggestions([]); }}>
                        <span className="font-medium text-violet-700">@{u.username}</span><span className="text-gray-400">{u.full_name}</span>
                    </div>
                ))}</div>}
            </Field>
            <div className="flex gap-2 mt-6">
                {item && <button className={btnDanger} onClick={() => { setWeeklyPlan(prev => prev.filter(w => w.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save Changes' : 'Add Weekly Task'}</button>
            </div>
        </Modal>
    );
}

const GoalForm = ({ onClose, setWeeklyPlan, activeProjects, team, supaUser }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [projId, setProjId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [delegatedTo, setDelegatedTo] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [delegateSearch, setDelegateSearch] = useState(item && item.delegatedTo ? item.delegatedTo : '');
  const [showDelegateDrop, setShowDelegateDrop] = useState(false);
  const searchUsers = async (q) => {
    setDelegateSearch(q);
    if (!q || q.length < 1) { setUserSuggestions([]); setShowDelegateDrop(false); return; }
    const { data } = await supabase.from('profiles').select('id, username, full_name').ilike('full_name', '%' + q + '%').limit(8);
    setUserSuggestions(data || []);
    setShowDelegateDrop(true);
  };
  const selectDelegate = (user) => {
    setDelegatedTo(user.full_name || user.username);
    setDelegateSearch(user.full_name || user.username);
    setShowDelegateDrop(false);
  };
  const currentMonth = new Date().toISOString().slice(0, 7);

  const submit = () => {
    if (!title.trim()) return;
    const goalData = { id: newId(), title: title.trim(), text: text.trim(), projectId: projId || null, deadline: deadline || null, delegatedTo: delegatedTo || null, month: currentMonth, subtasks: [] };
    setWeeklyPlan(prev => [...prev.filter(Boolean), goalData]);
    onClose();
  };

  const ap = safe(activeProjects);
  // delegate now uses profile search

  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-gray-800">Add New Goal</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600">{I.x("#9CA3AF")}</button></div>
      <div><label className="block text-sm font-medium text-gray-600 mb-1">Goal Title</label><input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" placeholder="What do you want to achieve?" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div><label className="block text-sm font-medium text-gray-600 mb-1">Description</label><textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none resize-none" rows={3} placeholder="Describe your goal in detail..." value={text} onChange={e => setText(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm font-medium text-gray-600 mb-1">Linked Project</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-violet-300 outline-none" value={projId} onChange={e => setProjId(e.target.value)}><option value="">None</option>{ap.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-600 mb-1">Deadline</label><input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 outline-none" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-1">Delegate To</label>
        <div className="relative">
          <input type="text" value={delegateSearch} onChange={e => searchUsers(e.target.value)} onFocus={() => { if (userSuggestions.length > 0) setShowDelegateDrop(true); }} placeholder="Search by name..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400" />
          {delegatedTo && <button type="button" onClick={() => { setDelegatedTo(''); setDelegateSearch(''); setUserSuggestions([]); }} className="absolute right-2 top-2 text-gray-400 hover:text-red-500 text-xs">clear</button>}
          {showDelegateDrop && userSuggestions.length > 0 && (
            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              <button type="button" onClick={() => { setDelegatedTo(''); setDelegateSearch(''); setShowDelegateDrop(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 text-gray-500 border-b border-gray-100">No one (self)</button>
              {userSuggestions.map(u => (
                <button type="button" key={u.id} onClick={() => selectDelegate(u)} className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 text-gray-800">{u.full_name || u.username}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 pt-2"><button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button><button onClick={submit} className="flex-1 bg-violet-600 text-white rounded-xl py-2 text-sm font-medium hover:bg-violet-700 shadow-sm">Save Goal</button></div>
    </div>
  </div>);
};
;

const TaskForm = ({ item, onClose, setQuickTasks, activeProjects, onDelegate }) => {
    const [task, setTask] = useState(item ? item.task : '');
    const [priority, setPriority] = useState(item ? item.priority : 'medium');
    const [due, setDue] = useState(item ? item.due : 'Today');
    const [projId, setProjId] = useState(item ? (item.projectId || '') : '');
    const [delegatedTo, setDelegatedTo] = useState(item ? (item.delegatedTo || '') : '');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const searchUsers = async (q) => {
        if (!q || q.length < 2) { setUserSuggestions([]); return; }
        const clean = q.replace('@', '').toLowerCase();
        const { data } = await supabase.from('profiles').select('id, username, full_name, initials, avatar_url').ilike('username', clean + '%').limit(5);
        setUserSuggestions(data || []);
    };
    const submit = () => {
        if (!task) return;
        const pid = projId ? Number(projId) : null;
        if (item) {
            setQuickTasks(prev => prev.filter(Boolean).map(t => t.id === item.id ? { ...t, task, priority, due, projectId: pid, delegatedTo } : t));
        } else {
            setQuickTasks(prev => [...prev, { id: newId(), task, priority, due, projectId: pid, delegatedTo }]);
        }
        if (delegatedTo && onDelegate) {
            onDelegate({ task_text: task, task_type: 'quick', recipient_username: delegatedTo.replace('@', '').toLowerCase(), priority });
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Task' : 'Add Task'} onClose={onClose}>
            <Field label="Task"><input className={inputCls} value={task} onChange={e => setTask(e.target.value)} placeholder="What needs to be done?" /></Field>
            <Field label="Linked Project (optional)">
                <select className={inputCls} value={projId} onChange={e => setProjId(e.target.value)}>
                    <option value="">No project</option>
                    {activeProjects.filter(Boolean).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Priority">
                    <select className={inputCls} value={priority} onChange={e => setPriority(e.target.value)}>
                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                    </select>
                </Field>
                <Field label="Due"><input className={inputCls} value={due} onChange={e => setDue(e.target.value)} placeholder="e.g. Today, Feb 12" /></Field>
            </div>
            <Field label="Delegate to (optional)">
                <input type="text" className={inputCls} value={delegatedTo} onChange={e => { setDelegatedTo(e.target.value); searchUsers(e.target.value); }} placeholder="e.g. @username" />
                {userSuggestions.length > 0 && <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">{userSuggestions.filter(Boolean).map(u => (
                    <div key={u.username} className="px-3 py-2 text-xs cursor-pointer hover:bg-violet-50 flex items-center gap-2" onClick={() => { setDelegatedTo(u.username); setUserSuggestions([]); }}>
                        <span className="font-medium text-violet-700">@{u.username}</span><span className="text-gray-400">{u.full_name}</span>
                    </div>
                ))}</div>}
            </Field>
            <div className="flex gap-2 mt-6">
                {item && <button className={btnDanger} onClick={() => { setQuickTasks(prev => prev.filter(t => t.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save Changes' : 'Add Task'}</button>
            </div>
        </Modal>
    );
};

const TimeBlockForm = ({ item, onClose, setTimeBlocks }) => {
    const [task, setTask] = useState(item ? item.task : '');
    const [time, setTime] = useState(item ? item.time : '');
    const [end, setEnd] = useState(item ? item.end : '');
    const [cat, setCat] = useState(item ? item.cat : 'blue');
    const submit = () => {
        if (!task || !time) return;
        if (item) {
            setTimeBlocks(prev => prev.filter(Boolean).map(b => b.id === item.id ? { ...b, task, time, end, cat } : b));
        } else {
            setTimeBlocks(prev => [...prev, { id: newId(), task, time, end, cat }]);
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Time Block' : 'Add Time Block'} onClose={onClose}>
            <Field label="Activity"><input className={inputCls} value={task} onChange={e => setTask(e.target.value)} placeholder="e.g. Deep Work, Client Call" /></Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Start Time"><input className={inputCls} value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 9:00 AM" /></Field>
                <Field label="End Time"><input className={inputCls} value={end} onChange={e => setEnd(e.target.value)} placeholder="e.g. 10:30 AM" /></Field>
            </div>
            <Field label="Category">
                <select className={inputCls} value={cat} onChange={e => setCat(e.target.value)}>
                    <option value="blue">Work</option><option value="purple">Meeting</option><option value="amber">Routine</option><option value="green">Personal</option>
                </select>
            </Field>
            <div className="flex gap-2 mt-6">
                {item && <button className={btnDanger} onClick={() => { setTimeBlocks(prev => prev.filter(b => b.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save Changes' : 'Add Time Block'}</button>
            </div>
        </Modal>
    );
};

const IdeaForm = ({ item, onClose, setIdeas }) => {
    const [text, setText] = useState(item ? item.text : '');
    const submit = () => {
        if (!text) return;
        if (item) { setIdeas(prev => prev.filter(Boolean).map(i => i.id === item.id ? { ...i, text } : i)); }
        else { setIdeas(prev => [...prev, { id: newId(), text, t: 'Just now' }]); }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Idea' : 'Capture an Idea'} onClose={onClose}>
            <Field label="What's on your mind?"><textarea className={inputCls + ' h-24 resize-none'} value={text} onChange={e => setText(e.target.value)} placeholder="An idea you don't want to forget..." /></Field>
            <div className="flex gap-2 mt-4">
                {item && <button className={btnDanger} onClick={() => { setIdeas(prev => prev.filter(i => i.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save' : 'Save Idea'}</button>
            </div>
        </Modal>
    );
};

const LearningForm = ({ item, idx, onClose, setLearning }) => {
    const [text, setText] = useState(item || '');
    const submit = () => {
        if (!text) return;
        if (item) { setLearning(prev => prev.filter(Boolean).map((l, i) => i === idx ? text : l)); }
        else { setLearning(prev => [...prev, text]); }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Learning Goal' : 'Add Learning Goal'} onClose={onClose}>
            <Field label="What do you want to learn?"><input className={inputCls} value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Financial modelling, Mandarin" /></Field>
            <div className="flex gap-2 mt-4">
                {item && <button className={btnDanger} onClick={() => { setLearning(prev => prev.filter((_, i) => i !== idx)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save' : 'Add Goal'}</button>
            </div>
        </Modal>
    );
};

const AuthFlow = ({ onAuth }) => {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState('');
    const autoInitials = name.trim() ? name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '';

    const checkUsername = async (u) => {
        if (!u || u.length < 2) { setUsernameStatus(''); return; }
        const { data } = await supabase.from('profiles').select('id').eq('username', u.toLowerCase()).maybeSingle();
        setUsernameStatus(data ? 'taken' : 'available');
    };

    const handleSignUp = async () => {
        if (!email || !password || !name.trim() || !username.trim()) { setError('All fields are required'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (usernameStatus === 'taken') { setError('Username is already taken'); return; }
        setLoading(true); setError('');
        const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
        if (authErr) { setError(authErr.message); setLoading(false); return; }
        if (authData.user) {
            const profile = { name: name.trim(), username: username.trim().toLowerCase().replace(/\s+/g, ''), initials: autoInitials, avatar_url: avatarUrl || '' };
            const { error: profErr } = await supabase.from('profiles').insert({
                id: authData.user.id, username: profile.username, full_name: profile.name, initials: profile.initials, email
            });
            if (profErr) { setError('Profile error: ' + profErr.message); setLoading(false); return; }
            onAuth(authData.user, profile);
        }
        setLoading(false);
    };

    const handleLogin = async () => {
        if (!email || !password) { setError('Email and password required'); return; }
        setLoading(true); setError('');
        const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) { setError(authErr.message); setLoading(false); return; }
        if (data.user) {
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            if (prof) {
                onAuth(data.user, { name: prof.full_name, username: prof.username, initials: prof.initials, avatar_url: prof.avatar_url || '' });
            }
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md card-shadow p-8 text-center">
                <div className="mb-6"><Emblem size={48} /><h1 className="text-2xl font-bold text-gray-900 mt-3">Welcome to NuOperandi</h1><p className="text-sm text-gray-500 mt-2">Your personal operating system.</p></div>
                <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                    <button onClick={() => { setMode('login'); setError(''); }} className={'flex-1 py-2 text-sm font-medium rounded-md transition ' + (mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}>Log In</button>
                    <button onClick={() => { setMode('signup'); setError(''); }} className={'flex-1 py-2 text-sm font-medium rounded-md transition ' + (mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}>Sign Up</button>
                </div>
                <div className="text-left space-y-3">
                    {mode === 'signup' && (
                        <>
                            <Field label="Full Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tutu Adetunmbi" /></Field>
                            <Field label="Username">
                                <input className={inputCls} value={username} onChange={e => { const v = e.target.value.replace(/\s+/g, '').toLowerCase(); setUsername(v); checkUsername(v); }} placeholder="e.g. tutu" />
                                {usernameStatus === 'available' && <p className="text-xs text-green-500 mt-1">@{username} is available</p>}
                                {usernameStatus === 'taken' && <p className="text-xs text-red-500 mt-1">@{username} is taken</p>}
                            </Field>
                        </>
                    )}
                    <Field label="Email"><input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
                    <Field label="Password"><input type="password" className={inputCls} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'} /></Field>
                    {mode === 'signup' && autoInitials && username && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-semibold text-sm">{autoInitials}</div>
                            <div><p className="text-sm font-medium text-gray-700">{name.trim()}</p><p className="text-xs text-gray-400">@{username}</p></div>
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-500 mt-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button className={btnPrimary + ' mt-6 w-full'} onClick={mode === 'signup' ? handleSignUp : handleLogin} disabled={loading}>
                    {loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Log In')}
                </button>
                <p className="text-xs text-gray-400 mt-4">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-violet-600 hover:underline">{mode === 'login' ? 'Sign up' : 'Log in'}</button></p>
            </div>
        </div>
    );
};

const ProfileEditModal = ({ userProfile, setUserProfile, supaUser, onClose }) => {
    const [name, setName] = useState(userProfile ? userProfile.name : '');
    const [username, setUsername] = useState(userProfile ? userProfile.username : '');
    const [saving, setSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(userProfile ? userProfile.avatar_url : '');
    const [uploading, setUploading] = useState(false);
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !supaUser) return;
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = supaUser.id + '/avatar.' + fileExt;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const url = publicUrl + '?t=' + Date.now();
            setAvatarUrl(url);
            await supabase.from('profiles').update({ avatar_url: url }).eq('id', supaUser.id);
        } catch (err) { console.error('Avatar upload error:', err); }
        setUploading(false);
    };
    const autoInitials = name.trim() ? name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '';
    const handleSignOut = async () => { await supabase.auth.signOut(); window.location.reload(); };
    const submit = async () => {
        if (!name.trim() || !username.trim()) return;
        setSaving(true);
        const profile = { name: name.trim(), username: username.trim().toLowerCase().replace(/\s+/g, ''), initials: autoInitials, avatar_url: avatarUrl || '' };
        setUserProfile(profile);
        if (supaUser) {
            await supabase.from('profiles').update({ full_name: profile.name, username: profile.username, initials: profile.initials, avatar_url: profile.avatar_url || '' }).eq('id', supaUser.id);
        }
        setSaving(false);
        onClose();
    };
    return (
        <Modal title="Profile Settings" onClose={onClose}>
            <Field label="Full Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></Field>
            <Field label="Username">
                <input className={inputCls} value={username} onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))} placeholder="e.g. tutu" />
                <p className="text-xs text-gray-400 mt-1">Others can delegate tasks to you using @{username.trim().toLowerCase().replace(/\s+/g, '') || 'username'}</p>
            </Field>
            <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="relative cursor-pointer group" onClick={() => document.getElementById('avatar-upload').click()}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-2xl group-hover:bg-violet-600 transition">{autoInitials || 'U'}</div>
                    )}
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 group-hover:bg-violet-50 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    {uploading && <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">{name.trim() || 'Your Name'}</p>
                    <p className="text-xs text-gray-400">@{username.trim().toLowerCase().replace(/\s+/g, '') || 'username'}</p>
                    <p className="text-xs text-violet-600 mt-1 cursor-pointer hover:underline" onClick={() => document.getElementById('avatar-upload').click()}>{uploading ? 'Uploading...' : 'Change photo'}</p>
                </div>
            </div>
            <button className={btnPrimary + ' w-full'} onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
            <button onClick={handleSignOut} className="w-full mt-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition">Sign Out</button>
        </Modal>
    );
};

const NotificationsPanel = ({ notifications, onMarkRead, onClose, delegatedToMe, onAcceptTask, quickTasks, weeklyPlan, setActiveModule, setPlannerTab }) => {
    const [expandedNotif, setExpandedNotif] = useState(null);
  const findTaskInPlanner = (notif) => {
    const matchedDelegated = delegatedToMe && delegatedToMe.find(d => 
      notif.related_task_id ? d.id === notif.related_task_id : (notif.message && d.task_text && notif.message.includes(d.task_text.substring(0, 30)))
    );
    if (!matchedDelegated) return null;
    if (matchedDelegated.status === 'pending') return { status: 'pending', task: matchedDelegated };
    const inDaily = quickTasks && quickTasks.find(t => t.delegatedFrom && t.task === matchedDelegated.task_text);
    if (inDaily) return { status: 'accepted', location: 'daily', task: matchedDelegated };
    const inWeekly = weeklyPlan && weeklyPlan.find(w => w.delegatedFrom && w.task === matchedDelegated.task_text);
    if (inWeekly) return { status: 'accepted', location: 'weekly', task: matchedDelegated };
    return { status: 'accepted', location: null, task: matchedDelegated };
  };

  const handleNotifClick = (n) => {
    const found = findTaskInPlanner(n);
    if (found && found.status === 'pending' && onAcceptTask) {
      onAcceptTask(found.task);
      onMarkRead(n.id);
      return;
    }
    if (found && found.status === 'accepted' && found.location) {
      if (setActiveModule) setActiveModule('planner');
      if (setPlannerTab) setPlannerTab(found.location === 'weekly' ? 'weekly' : 'daily');
      onMarkRead(n.id);
      onClose();
      return;
    }
    if (n.title === 'Task completed!') {
      setExpandedNotif(expandedNotif === n.id ? null : n.id);
      onMarkRead(n.id);
      return;
    }
    onMarkRead(n.id);
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fixed top-16 right-8 bg-white rounded-xl border border-violet-100/60 card-shadow w-96 max-h-96 overflow-y-auto z-50" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Notifications</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">{I.x("#9CA3AF")}</button>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">No notifications yet</div>
        ) : notifications.filter(Boolean).map(n => {
          const found = findTaskInPlanner(n);
          return (
            <div key={n.id} onClick={() => handleNotifClick(n)} className="px-4 py-3 border-b border-violet-50 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-purple-600">{n.sender_name ? n.sender_name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2) : '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{n.title}</p>
                <p className="text-xs text-gray-500 truncate">{n.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-300">{new Date(n.created_at).toLocaleDateString()}</span>
                  {found && found.status === 'pending' && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">Tap to accept</span>}
                  {found && found.status === 'accepted' && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-600">In planner</span>}
                </div>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-violet-500 mt-1 flex-shrink-0"></div>}
            {expandedNotif === n.id && n.title === 'Task completed!' && (
              <div className="mt-2 ml-11 p-3 bg-green-50 rounded-lg border border-green-100" onClick={e => e.stopPropagation()}>
                <p className="text-xs font-semibold text-green-800 mb-1">{n.sender_name} completed a task</p>
                <p className="text-sm text-green-700 mb-2">{n.message}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500">{new Date(n.created_at).toLocaleString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); if (setActiveModule) setActiveModule('boardroom'); onClose(); }} className="text-xs px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition">View in Boardroom</button>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TeamForm = ({ item, onClose, setTeamMembers }) => {
    const [name, setName] = useState(item ? item.name : '');
    const [initials, setInitials] = useState(item ? item.initials : '');
    const [status, setStatus] = useState(item ? item.status : 'available');
    const submit = () => {
        if (!name) return;
        const auto = initials || name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
        if (item) { setTeamMembers(prev => prev.filter(Boolean).map(m => m.id === item.id ? { ...m, name, initials: auto, status } : m)); }
        else { setTeamMembers(prev => [...prev, { id: newId(), name, initials: auto, status }]); }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Team Member' : 'Add Team Member'} onClose={onClose}>
            <Field label="Full Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aisha Okonkwo" /></Field>
            <Field label="Initials (auto-generated if blank)"><input className={inputCls} value={initials} onChange={e => setInitials(e.target.value)} placeholder="e.g. AO" maxLength={3} /></Field>
            <Field label="Status">
                <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="available">Available</option><option value="meeting">In Meeting</option><option value="leave">On Leave</option>
                </select>
            </Field>
            <div className="flex gap-2 mt-4">
                {item && <button className={btnDanger} onClick={() => { setTeamMembers(prev => prev.filter(m => m.id !== item.id)); onClose(); }}>Remove</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save' : 'Add Member'}</button>
            </div>
        </Modal>
    );
};

const AddMenu = ({ onClose, activeModule, setModal }) => {
    const items = activeModule === 'command' ? [
        { label: 'Daily Task', action: () => { onClose(); setModal('addTask'); } },
        { label: 'Time Block', action: () => { onClose(); setModal('addTimeBlock'); } },
        { label: 'Income Stream', action: () => { onClose(); setModal('addIncome'); } },
        { label: 'Project', action: () => { onClose(); setModal('addProject'); } },
    ] : activeModule === 'income' ? [
        { label: 'Income Stream', action: () => { onClose(); setModal('addIncome'); } },
        { label: 'Expense', action: () => { onClose(); setModal('addExpense'); } },
        { label: 'Project', action: () => { onClose(); setModal('addProject'); } },
    ] : [
        { label: 'Weekly Task', action: () => { onClose(); setModal('addWeekly'); } },
        { label: 'Daily Task', action: () => { onClose(); setModal('addTask'); } },
        { label: 'Time Block', action: () => { onClose(); setModal('addTimeBlock'); } },
        { label: 'Idea', action: () => { onClose(); setModal('addIdea'); } },
        { label: 'Learning Goal', action: () => { onClose(); setModal('addLearning'); } },
    ];
    return (
        <div className="fixed inset-0 z-40" onClick={onClose}>
            <div className="fixed bottom-24 right-8 bg-white rounded-xl border border-violet-100/60 card-shadow p-2 min-w-[180px] z-50" onClick={e => e.stopPropagation()}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2">Add New</p>
                {items.filter(Boolean).map((it, i) => (
                    <button key={i} onClick={it.action} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition flex items-center gap-2">
                        {I.plus("#3B82F6")}
                        {it.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ExpenseForm = ({ item, onClose, setExpenses, incomeStreams, supaUser, userProfile, paymentTags, setPaymentTags , activeProjects}) => {
    const [name, setName] = useState(item ? item.name : '');
    const [amount, setAmount] = useState(item ? Number(item.amount).toLocaleString('en-US') : '');
    const [category, setCategory] = useState(item ? item.category : 'Salary');
    const [frequency, setFrequency] = useState(item ? item.frequency : 'Monthly');
    const [linkedStreamId, setLinkedStreamId] = useState(item ? (item.linkedStreamId || '') : '');
  const [projectId, setProjectId] = useState(item ? (item.projectId || item.project_id || '') : '');
    const [note, setNote] = useState(item ? (item.note || '') : '');
    const [dueDate, setDueDate] = useState(item ? (item.dueDate || '') : '');
    const [taggedMembers, setTaggedMembers] = useState([]);
    const [showTagSection, setShowTagSection] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState([]);
  const [entries, setEntries] = useState(item && item.entries ? item.entries : []);
  const addEntry = () => setEntries(prev => [...prev, { id: Date.now(), label: '', amount: '', date: '', paid: false }]);
  const updateEntry = (id, field, val) => setEntries(prev => prev.map(en => en.id === id ? { ...en, [field]: val } : en));
  const removeEntry = (id) => setEntries(prev => prev.filter(en => en.id !== id));
  const toggleEntryPaid = (id) => setEntries(prev => prev.map(en => en.id === id ? { ...en, paid: !en.paid, paidDate: !en.paid ? new Date().toISOString().slice(0,10) : null } : en));
    const searchTagUser = async (query) => {
        if (!query || query.length < 2 || !supabase) { setTagSuggestions([]); return; }
        const clean = query.replace('@', '').toLowerCase();
        const { data } = await supabase.from('profiles').select('id, username, full_name, initials, avatar_url').ilike('username', clean + '%').limit(5);
        setTagSuggestions((data || []).filter(u => !taggedMembers.find(t => t.username === u.username) && u.username !== (userProfile ? userProfile.username : '')));
    };
    const addTaggedMember = (user) => {
        setTaggedMembers(prev => [...prev, { username: user.username, fullName: user.full_name, paymentType: 'Salary', amount: '', percentage: '' }]);
        setTagSearch(''); setTagSuggestions([]);
    };
    const updateTaggedMember = (idx, field, value) => {
        setTaggedMembers(prev => prev.filter(Boolean).map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };
    const removeTaggedMember = (idx) => {
        setTaggedMembers(prev => prev.filter((_, i) => i !== idx));
    };
    const linkedStream = linkedStreamId ? incomeStreams.find(s => s.id == linkedStreamId) : null;
    const submit = async () => {
        if (!name || !amount) return;
        const val = Number(amount.replace(/[^0-9.]/g, ''));
        const lsid = linkedStreamId ? Number(linkedStreamId) : null;
        const data = { name, amount: val, category, frequency, linkedStreamId: lsid, note, dueDate: dueDate || null , project_id: projectId || null, entries: entries.filter(Boolean).map(en => ({ ...en, amount: Number(String(en.amount).replace(/[^0-9.]/g, '')) || 0 }))};
        let expenseId;
        if (item) {
            setExpenses(prev => prev.filter(Boolean).map(e => e.id === item.id ? { ...e, ...data } : e));
            expenseId = item.id;
        } else {
            expenseId = newId();
            setExpenses(prev => [...prev, { id: expenseId, ...data }]);
        }
        if (taggedMembers.length > 0 && supabase && supaUser) {
            const senderName = userProfile ? (userProfile.name || userProfile.full_name || userProfile.username) : 'Unknown';
            const companyName = linkedStream ? (linkedStream.company || linkedStream.name) : name;
            for (const member of taggedMembers) {
                const memberAmount = member.paymentType === 'Percentage' && linkedStream ? (Number(member.percentage) / 100) * Number(linkedStream.monthly) : Number(String(member.amount).replace(/[^0-9.]/g, ''));
                if (memberAmount > 0) {
                    await supabase.from('payment_tags').insert({
                        expense_id: String(expenseId),
                        sender_id: supaUser.id,
                        sender_name: senderName,
                        recipient_username: member.username,
                        company_name: companyName,
                        amount: memberAmount,
                        payment_type: member.paymentType.toLowerCase(),
                        percentage: member.paymentType === 'Percentage' ? Number(member.percentage) : null,
                        frequency: frequency,
                        note: note || null,
                        status: 'pending'
                    });
                    await supabase.from('notifications').insert({
                        user_id: supaUser.id,
                        title: 'Payment Tagged',
                        message: senderName + ' tagged @' + member.username + ' in a ' + memberAmount.toLocaleString() + ' ' + member.paymentType + ' payment from ' + companyName,
                        sender_name: senderName,
                        is_read: false,
                        recipient_username: member.username
                    });
                }
            }
            if (setPaymentTags) {
                const { data: tags } = await supabase.from('payment_tags').select('*').eq('sender_id', supaUser.id);
                if (tags) setPaymentTags(tags);
            }
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Expense' : 'Add Expense'} onClose={onClose}>
            <Field label="Expense Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Staff Salaries, Office Rent" /></Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Amount ( ₦)"><input className={inputCls} value={amount} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); if (!raw) { setAmount(''); return; } const parts = raw.split('.'); parts[0] = Number(parts[0]).toLocaleString('en-US'); setAmount(parts.join('.')); }} placeholder="e.g. 200,000" type="text" inputMode="numeric" /></Field>
                <Field label="Frequency">
                    <select className={inputCls} value={frequency} onChange={e => setFrequency(e.target.value)}>
                        <option value="Monthly">Monthly</option><option value="Weekly">Weekly</option><option value="Quarterly">Quarterly</option><option value="Annual">Annual</option><option value="One-time">One-time</option>
                    </select>
                </Field>
            </div>
            <Field label="Category">
                <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Salary">Salary</option><option value="Rent">Rent</option><option value="Operations">Operations</option><option value="Marketing">Marketing</option><option value="Software">Software & Tools</option><option value="Transport">Transport</option><option value="Utilities">Utilities</option><option value="Tax">Tax</option><option value="Other">Other</option>
                </select>
            </Field>
            <Field label="Paid From (optional)">
                <select className={inputCls} value={linkedStreamId} onChange={e => setLinkedStreamId(e.target.value)}>
                    <option value="">General / Personal</option>
                    {incomeStreams.filter(Boolean).map(s => <option key={s.id} value={s.id}>{s.name}{s.company ? ' (' + s.company + ')' : ''}</option>)}
                </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Due Date (optional)"><input className={inputCls} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></Field>
                <Field label="Note (optional)"><input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. 2 staff members" /></Field>
            </div>
      <div><label className="block text-sm font-medium text-gray-600 mb-1">Project</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-violet-300 outline-none" value={projectId} onChange={e => setProjectId(e.target.value)}><option value="">No project</option>{safe(activeProjects).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            {/* Expense Entries / Sub-items */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expense Entries</span>
                <button type="button" onClick={addEntry} className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1">{I.plus("#7c3aed")} Add Entry</button>
              </div>
              {entries.length === 0 && <p className="text-xs text-gray-400 italic mb-2">No entries yet. Track individual costs under this expense.</p>}
              {entries.map((en, idx) => (
                <div key={en.id} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <button type="button" onClick={() => toggleEntryPaid(en.id)} className={"w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 " + (en.paid ? "bg-green-500 border-green-500 text-white" : "border-gray-300")}>{en.paid ? I.check("#fff") : null}</button>
                    <input type="text" placeholder="Entry label (e.g. Oil Change)" value={en.label} onChange={e => updateEntry(en.id, 'label', e.target.value)} className={"flex-1 text-sm border border-gray-200 rounded px-2 py-1 " + (en.paid ? "line-through text-gray-400" : "")} />
                    <button type="button" onClick={() => removeEntry(en.id)} className="text-gray-400 hover:text-red-500">{I.trash("#9ca3af")}</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount" value={en.amount} onChange={e => updateEntry(en.id, 'amount', e.target.value)} className="w-1/2 text-sm border border-gray-200 rounded px-2 py-1" />
                    <input type="date" value={en.date || ''} onChange={e => updateEntry(en.id, 'date', e.target.value)} className="w-1/2 text-sm border border-gray-200 rounded px-2 py-1" />
                  </div>
                </div>
              ))}
              {entries.length > 0 && <div className="text-right text-xs font-semibold text-gray-600 mt-1">Entries Total: {(() => { const t = entries.reduce((s, en) => s + (parseFloat(en.amount) || 0), 0); try { return new Intl.NumberFormat('en-NG', {style:'currency',currency:'NGN'}).format(t); } catch(e) { return t; } })()}</div>}
            </div>
            {/* Tag Team Members Section */}
            <div className="mt-4 border border-violet-100 rounded-lg">
                <button onClick={() => setShowTagSection(!showTagSection)} className="w-full flex items-center justify-between px-4 py-3 bg-violet-50/50 hover:bg-violet-50 transition text-left">
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span className="text-sm font-medium text-violet-700">Tag Team Members</span>
                        {taggedMembers.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">{taggedMembers.length}</span>}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" className={"transition " + (showTagSection ? "rotate-180" : "")}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showTagSection && <div className="px-4 py-3 space-y-3">
                    {taggedMembers.filter(Boolean).map((member, idx) => <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">{(member.fullName || member.username).charAt(0).toUpperCase()}</div>
                                <div><p className="text-sm font-medium text-gray-900">{member.fullName || member.username}</p><p className="text-xs text-gray-400">@{member.username}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select className={inputCls + " !text-xs !py-1.5"} value={member.paymentType} onChange={e => updateTaggedMember(idx, 'paymentType', e.target.value)}>
                                    <option value="Salary">Salary</option><option value="Bonus">Bonus</option><option value="Commission">Commission</option><option value="One-time">One-time</option><option value="Recurring">Recurring</option><option value="Percentage">Percentage</option>
                                </select>
                                {member.paymentType === 'Percentage' ? <div className="flex gap-1 items-center">
                                    <input className={inputCls + " !text-xs !py-1.5 w-16"} type="number" placeholder="%" value={member.percentage} onChange={e => updateTaggedMember(idx, 'percentage', e.target.value)} />
                                    <span className="text-xs text-gray-400">%</span>
                                    {linkedStream && member.percentage && <span className="text-xs text-emerald-600 font-medium ml-1">{String.fromCharCode(8358)}{(Number(member.percentage) / 100 * Number(linkedStream.monthly)).toLocaleString()}</span>}
                                </div> : <input className={inputCls + " !text-xs !py-1.5"} placeholder={"Amount (" + String.fromCharCode(8358) + ")"} value={member.amount} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); if (!raw) { updateTaggedMember(idx, 'amount', ''); return; } const parts = raw.split('.'); parts[0] = Number(parts[0]).toLocaleString('en-US'); updateTaggedMember(idx, 'amount', parts.join('.')); }} />}
                            </div>
                        </div>
                        <button onClick={() => removeTaggedMember(idx)} className="text-gray-300 hover:text-red-400 mt-1 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>)}
                    <div className="relative">
                        <input className={inputCls + " !text-xs"} placeholder="Search @username to add..." value={tagSearch} onChange={e => { setTagSearch(e.target.value); searchTagUser(e.target.value); }} />
                        {tagSuggestions.length > 0 && <div className="mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            {tagSuggestions.filter(Boolean).map(u => <button key={u.username} onClick={() => addTaggedMember(u)} className="w-full text-left px-3 py-2 hover:bg-violet-50 flex items-center gap-2 transition">
                                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">{(u.full_name || u.username).charAt(0).toUpperCase()}</div>
                                <div><p className="text-sm text-gray-900">{u.full_name || u.username}</p><p className="text-xs text-gray-400">@{u.username}</p></div>
                            </button>)}
                        </div>}
                    </div>
                    {taggedMembers.length > 0 && <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Tagged: {taggedMembers.length} {taggedMembers.length === 1 ? 'person' : 'people'}</span>
                        <span className="text-xs font-medium text-violet-700">{String.fromCharCode(8358)}{taggedMembers.reduce((sum, m) => sum + (m.paymentType === 'Percentage' && linkedStream ? (Number(m.percentage || 0) / 100) * Number(linkedStream.monthly) : Number(String(m.amount || '0').replace(/[^0-9.]/g, ''))), 0).toLocaleString()} allocated</span>
                    </div>}
                </div>}
            </div>
            <div className="flex gap-2 mt-6">
                {item && <button className={btnDanger} onClick={() => { setExpenses(prev => prev.filter(e => e.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save Changes' : 'Add Expense'}</button>
            </div>
        </Modal>
    );
};

/* ====== MAIN APP COMPONENT ====== */
const NuOperandi = () => {
    const [activeModule, setActiveModule] = useState('command');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [modal, setModal] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [expandedProject, setExpandedProject] = useState(null);
    const [expandedIncome, setExpandedIncome] = useState(null);
    const [expandedIdeas, setExpandedIdeas] = useState(false);
    const [plannerTab, setPlannerTab] = useState('goals');
    const [collapsedProjects, setCollapsedProjects] = useState(() => load('collapsedProjects', {}));
    const [userProfile, setUserProfile] = useState(() => load('profile', null));
    const [supaUser, setSupaUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [delegatedToMe, setDelegatedToMe] = useState([]);
  const [paymentTags, setPaymentTags] = useState([]);
  const [incomingPayments, setIncomingPayments] = useState([]);
    const [delegatedByMe, setDelegatedByMe] = useState([]);
  const [acceptingTask, setAcceptingTask] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);

    /* -- Editable Data State -- */
    const [incomeStreams, setIncomeStreams] = useState(() => load('income', defaultIncome));
    const [projects, setProjects] = useState(() => load('projects', defaultProjects));
  const [sharedProjects, setSharedProjects] = useState([]);
  const [sharedTaskCompletions, setSharedTaskCompletions] = useState([]);
    const [quickTasks, setQuickTasks] = useState(() => load('tasks', defaultTasks));
    const [timeBlocks, setTimeBlocks] = useState(() => load('timeblocks', defaultTimeBlocks));
    const [ideas, setIdeas] = useState(() => load('ideas', defaultIdeas));
    const [learning, setLearning] = useState(() => load('learning', defaultLearning));
    const [teamMembers, setTeamMembers] = useState(() => load('team', defaultTeam));
    const [alerts, setAlerts] = useState(() => load('alerts', defaultAlerts));
    const [completedTasks, setCompletedTasks] = useState(() => load('completedTasks', {}));
    const [completedTimeBlocks, setCompletedTimeBlocks] = useState(() => load('completedBlocks', {}));
    const [weeklyPlan, setWeeklyPlan] = useState(() => load('weeklyPlan', defaultWeeklyPlan));
    const [completedWeekly, setCompletedWeekly] = useState(() => load('completedWeekly', {}));
    const [showEodReport, setShowEodReport] = useState(false);
    const [eodReminderEnabled, setEodReminderEnabled] = useState(() => load('eodReminderEnabled', true));
    const [eodReminderTime, setEodReminderTime] = useState(() => load('eodReminderTime', '16:30'));
    const [expenses, setExpenses] = useState(() => load('expenses', defaultExpenses));
    const [taskHistory, setTaskHistory] = useState(() => load('taskHistory', []));
    const [stateLoaded, setStateLoaded] = useState(false);
  const [clockInTime, setClockInTime] = useState(load('clockInTime', null));
  const [clockElapsed, setClockElapsed] = useState('');
  useEffect(() => {
    if (!clockInTime) { setClockElapsed(''); return; }
    const cit = Number(clockInTime);
    if (new Date(cit).toDateString() !== new Date().toDateString()) { setClockInTime(null); save('clockInTime', null); return; }
    const tick = () => { const diff = Date.now() - cit; const h = Math.floor(diff/3600000); const m = Math.floor((diff%3600000)/60000); setClockElapsed(h > 0 ? h+'h '+m+'m' : m+'m'); };
    tick();
    const iv = setInterval(tick, 60000);
    return () => clearInterval(iv);
  }, [clockInTime]);
  const handleClockIn = () => { const now = Date.now(); setClockInTime(now); save('clockInTime', now); };
  const handleClockOut = () => { setClockInTime(null); save('clockInTime', null); };

    // Load persisted state from localStorage
    useEffect(() => {
      try {
        const wp = localStorage.getItem('nuop_weeklyPlan');
        const th = localStorage.getItem('nuop_taskHistory');
        const qt = localStorage.getItem('nuop_quickTasks');
        if (wp) setWeeklyPlan(JSON.parse(wp));
        if (th) setTaskHistory(JSON.parse(th));
        if (qt) setQuickTasks(JSON.parse(qt));
      } catch(e) { console.log('Load state error:', e); }
      setStateLoaded(true);
    }, []);

    // Persist weeklyPlan to localStorage
    useEffect(() => {
      if (!stateLoaded) return;
      localStorage.setItem('nuop_weeklyPlan', JSON.stringify(weeklyPlan));
    }, [weeklyPlan, stateLoaded]);

    // Persist taskHistory to localStorage
    useEffect(() => {
      if (!stateLoaded) return;
      localStorage.setItem('nuop_taskHistory', JSON.stringify(taskHistory));
    }, [taskHistory, stateLoaded]);

    // Persist quickTasks to localStorage
    useEffect(() => {
      if (!stateLoaded) return;
      localStorage.setItem('nuop_quickTasks', JSON.stringify(quickTasks));
    }, [quickTasks, stateLoaded]);


    /* -- Auto-save all data -- */
    useEffect(() => { save('income', incomeStreams); }, [incomeStreams]);
    useEffect(() => { save('projects', projects); }, [projects]);
    useEffect(() => { save('tasks', quickTasks); }, [quickTasks]);
    useEffect(() => { save('timeblocks', timeBlocks); }, [timeBlocks]);
    useEffect(() => { save('ideas', ideas); }, [ideas]);
    useEffect(() => { save('learning', learning); }, [learning]);
    useEffect(() => { save('team', teamMembers); }, [teamMembers]);
    useEffect(() => { save('alerts', alerts); }, [alerts]);
    useEffect(() => { save('completedTasks', completedTasks); }, [completedTasks]);
    useEffect(() => { save('completedBlocks', completedTimeBlocks); }, [completedTimeBlocks]);
    useEffect(() => { save('weeklyPlan', weeklyPlan); }, [weeklyPlan]);
    useEffect(() => { save('expenses', expenses); }, [expenses]);
    useEffect(() => { save('completedWeekly', completedWeekly); }, [completedWeekly]);
    useEffect(() => { save('collapsedProjects', collapsedProjects); }, [collapsedProjects]);
    useEffect(() => { save('taskHistory', taskHistory); }, [taskHistory]);
    useEffect(() => { if (userProfile) save('profile', userProfile); }, [userProfile]);

    
    

  /* -- Supabase Cloud Load: Seed local state from cloud on login -- */
  useEffect(() => {
    if (!supaUser) return;
    /* Dedup helper to prevent cloud sync duplicates */
    const dedupByKey = (arr, key) => { const s = new Set(); return arr.filter(i => { const k = i[key]; if (s.has(k)) return false; s.add(k); return true; }); };
    const loadFromCloud = async () => {
      try {
        // Check if user has local data already
        const hasLocalData = incomeStreams.length > 0 || projects.length > 0 || quickTasks.length > 0;
        if (hasLocalData) return; // Owner already has data locally

        // No local data - this is a team member or fresh device. Load from cloud.
        const { data: cloudIncome } = await supabase.from('income_streams').select('*').eq('owner_id', supaUser.id);
        if (cloudIncome && cloudIncome.length > 0) {
          const mapped = cloudIncome.filter(Boolean).map(s => ({ id: s.local_id, name: s.name, type: s.type, monthly: s.monthly, status: s.status, note: s.note, ...(s.extra_data || {}) }));
          setIncomeStreams(dedupByKey(mapped, 'id'));
        }

        const { data: cloudExpenses } = await supabase.from('expenses').select('*');
        if (cloudExpenses && cloudExpenses.length > 0) {
          const mapped = cloudExpenses.filter(Boolean).map(e => ({ id: e.local_id, name: e.name, amount: e.amount, category: e.category, frequency: e.frequency, linkedStreamId: e.linked_stream_id, note: e.note, dueDate: e.due_date, entries: (e.extra_data && e.extra_data.entries) || [], project_id: (e.extra_data && e.extra_data.project_id) || e.project_id || null }));
          setExpenses(mapped);
        }

        const { data: cloudTasks } = await supabase.from('daily_tasks').select('*');
        if (cloudTasks && cloudTasks.length > 0) {
          const mapped = cloudTasks.filter(Boolean).map(tk => ({ id: tk.local_id, task: tk.task_text, priority: tk.priority, due: tk.due, projectId: tk.project_id, weeklySourceId: tk.weekly_source_id }));
          setQuickTasks(mapped);
          const comp = {};
          cloudTasks.forEach(tk => { if (tk.completed) comp[tk.local_id] = true; });
          setCompletedTasks(comp);
        }

        const { data: cloudBlocks } = await supabase.from('time_blocks').select('*');
        if (cloudBlocks && cloudBlocks.length > 0) {
          const mapped = cloudBlocks.filter(Boolean).map(b => ({ id: b.local_id, task: b.task_text, time: b.start_time, end: b.end_time, cat: b.category }));
          setTimeBlocks(mapped);
        }

        const { data: cloudIdeas } = await supabase.from('ideas').select('*');
        if (cloudIdeas && cloudIdeas.length > 0) {
          const mapped = cloudIdeas.filter(Boolean).map(i => ({ id: i.local_id, text: i.text_content }));
          setIdeas(mapped);
        }

        const { data: cloudTeam } = await supabase.from('team_members').select('*');
        if (cloudTeam && cloudTeam.length > 0) {
          const mapped = cloudTeam.filter(Boolean).map(m => ({ id: m.local_id, name: m.name, initials: m.initials, status: m.status }));
          setTeamMembers(mapped);
        }



        const { data: cloudHistory } = await supabase.from('task_history').select('*');
        if (cloudHistory && cloudHistory.length > 0) {
          const mapped = cloudHistory.filter(Boolean).map(h => ({ date: h.date, tasks: h.tasks }));
          setTaskHistory(mapped);
        }

        const { data: cloudProjects } = await supabase.from('projects').select('*');
        if (cloudProjects && cloudProjects.length > 0) {
          const mapped = cloudProjects.filter(Boolean).map(p => ({ id: p.local_id, name: p.name, desc: p.description, progress: p.progress, status: p.status, start: p.start_date, launch: p.launch_date, team: p.team_size, next: p.next_step, teamMembers: p.teamMembers || [] }));
          setProjects(mapped);
        }

        const { data: cloudWeekly } = await supabase.from('weekly_tasks').select('*');
        if (cloudWeekly && cloudWeekly.length > 0) {
          const mapped = cloudWeekly.filter(Boolean).map(tk => ({ id: tk.local_id, task: tk.task_text, projectId: tk.project_local_id, subtasks: tk.subtasks || [], deadline: tk.deadline, delegatedTo: tk.delegated_to, thisWeek: !!tk.this_week }));
          setWeeklyPlan(mapped);
          const comp = {};
          cloudWeekly.forEach(tk => { if (tk.completed) comp[tk.local_id] = true; });
          setCompletedWeekly(comp);
        }

        const { data: cloudSettings } = await supabase.from('user_settings').select('*');
        if (cloudSettings && cloudSettings.length > 0 && cloudSettings[0].profile_data) {
          setUserProfile(cloudSettings[0].profile_data);
        }

      } catch(err) { console.log('Cloud load error:', err); }
    };
    loadFromCloud();
  }, [supaUser]);


  /* -- Supabase Sync: Projects & Tasks to Cloud -- */
    useEffect(() => {
      if (!supaUser) return;
      const timer = setTimeout(async () => {
        try {
          const teamMap = {};
          weeklyPlan.forEach(tk => {
            if (tk.projectId && tk.delegatedTo) {
              if (!teamMap[tk.projectId]) teamMap[tk.projectId] = new Set();
              teamMap[tk.projectId].add(tk.delegatedTo.replace(/^@/, '').toLowerCase());
            }
          });
          await supabase.from('projects').delete().eq('owner_id', supaUser.id);
          const rows = projects.filter(Boolean).map(p => ({
            local_id: p.id,
            owner_id: supaUser.id,
            name: p.name,
            description: p.desc || '',
            progress: p.progress || 0,
            status: p.status || 'Planning',
            start_date: p.start || null,
            launch_date: p.launch || null,
            team_size: typeof p.team === 'number' ? p.team : 0,
            team_members: Array.from(new Set([...(p.teamMembers || []), ...(teamMap[p.id] ? Array.from(teamMap[p.id]) : [])])),
            next_step: p.next || ''
          }));
          if (rows.length > 0) await supabase.from('projects').insert(rows);
        } catch(err) { console.log('Project sync error:', err); }
      }, 2000);
      return () => clearTimeout(timer);
    }, [projects, weeklyPlan, supaUser]);

    useEffect(() => {
      if (!supaUser) return;
      const timer = setTimeout(async () => {
        try {
          await supabase.from('weekly_tasks').delete().eq('owner_id', supaUser.id);
          const rows = weeklyPlan.filter(Boolean).map(tk => ({
            local_id: tk.id,
            owner_id: supaUser.id,
            project_local_id: tk.projectId || null,
            task_text: tk.task,
            subtasks: tk.subtasks || [],
            deadline: tk.deadline || null,
            delegated_to: tk.delegatedTo ? tk.delegatedTo.replace(/^@/, '').toLowerCase() : null,
                    this_week: !!tk.thisWeek,
            completed: !!completedWeekly[tk.id]
          }));
          if (rows.length > 0) await supabase.from('weekly_tasks').insert(rows);
        } catch(err) { console.log('Task sync error:', err); }
      }, 2000);
      return () => clearTimeout(timer);
    }, [weeklyPlan, completedWeekly, supaUser]);

  /* -- Supabase Sync: Income Streams -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('income_streams').delete().eq('owner_id', supaUser.id);
        const rows = incomeStreams.filter(Boolean).map(s => ({
          local_id: s.id, owner_id: supaUser.id, name: s.name,
          type: s.type || 'Active', monthly: s.monthly || 0,
          status: s.status || 'active', note: s.note || '',
          extra_data: { nextPayment: s.nextPayment || '', paymentCycle: s.paymentCycle || '', payments: s.payments || [], role: s.role || '', company: s.company || '' }
        }));
        if (rows.length > 0) await supabase.from('income_streams').insert(rows);
      } catch(err) { console.log('Income sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [incomeStreams, supaUser]);

  /* -- Supabase Sync: Expenses -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('expenses').delete().eq('owner_id', supaUser.id);
        const rows = expenses.filter(Boolean).map(e => ({
          local_id: e.id, owner_id: supaUser.id, name: e.name,
          amount: e.amount || 0, category: e.category || '',
          frequency: e.frequency || 'Monthly',
          linked_stream_id: e.linkedStreamId || null,
          note: e.note || '', due_date: e.dueDate, extra_data: { entries: e.entries || [], project_id: e.project_id || e.projectId || null } || null
        }));
        if (rows.length > 0) await supabase.from('expenses').insert(rows);
      } catch(err) { console.log('Expenses sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [expenses, supaUser]);

  /* -- Supabase Sync: Daily Tasks -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('daily_tasks').delete().eq('owner_id', supaUser.id);
        const rows = quickTasks.filter(Boolean).map(tk => ({
          local_id: tk.id, owner_id: supaUser.id,
          task_text: tk.task, priority: tk.priority || 'medium',
          due: tk.due || 'Today', project_id: tk.projectId || null,
          weekly_source_id: tk.weeklySourceId || null,
          completed: !!completedTasks[tk.id],
          completed_at: completedTasks[tk.id] ? new Date().toISOString() : null
        }));
        if (rows.length > 0) await supabase.from('daily_tasks').insert(rows);
      } catch(err) { console.log('Daily tasks sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [quickTasks, completedTasks, supaUser]);

  /* -- Supabase Sync: Time Blocks -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('time_blocks').delete().eq('owner_id', supaUser.id);
        const rows = timeBlocks.filter(Boolean).map(b => ({
          local_id: b.id, owner_id: supaUser.id,
          task_text: b.task, start_time: b.time || '',
          end_time: b.end || '', category: b.cat || ''
        }));
        if (rows.length > 0) await supabase.from('time_blocks').insert(rows);
      } catch(err) { console.log('Time blocks sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [timeBlocks, supaUser]);

  /* -- Supabase Sync: Ideas -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('ideas').delete().eq('owner_id', supaUser.id);
        const rows = ideas.filter(Boolean).map(i => ({
          local_id: i.id, owner_id: supaUser.id,
          text_content: i.text || ''
        }));
        if (rows.length > 0) await supabase.from('ideas').insert(rows);
      } catch(err) { console.log('Ideas sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [ideas, supaUser]);

  /* -- Supabase Sync: Team Members -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('team_members').delete().eq('owner_id', supaUser.id);
        const rows = teamMembers.filter(Boolean).map(m => ({
          local_id: m.id, owner_id: supaUser.id,
          name: m.name, initials: m.initials || '',
          status: m.status || 'available'
        }));
        if (rows.length > 0) await supabase.from('team_members').insert(rows);
      } catch(err) { console.log('Team sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [teamMembers, supaUser]);



  /* -- Supabase Sync: Task History -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('task_history').delete().eq('owner_id', supaUser.id);
        const rows = taskHistory.filter(Boolean).map(h => ({
          owner_id: supaUser.id, date: h.date, tasks: h.tasks || []
        }));
        if (rows.length > 0) await supabase.from('task_history').insert(rows);
      } catch(err) { console.log('Task history sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [taskHistory, supaUser]);

  /* -- Supabase Sync: User Settings -- */
  useEffect(() => {
    if (!supaUser) return;
    const timer = setTimeout(async () => {
      try {
        await supabase.from('user_settings').upsert({
          owner_id: supaUser.id,
          profile_data: userProfile || {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'owner_id' });
      } catch(err) { console.log('Settings sync error:', err); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [userProfile, supaUser]);



/* -- Supabase Auth -- */
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setSupaUser(session.user);
                    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    if (prof) setUserProfile({ name: prof.full_name, username: prof.username, initials: prof.initials, avatar_url: prof.avatar_url || '' });
                }
            } catch (e) { console.log('Auth init:', e); }
            setAuthLoading(false);
        };
        initAuth();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Auto-refresh session to prevent blank screen on token expiry
        if (event === 'TOKEN_REFRESHED') {
          console.log('NuOperandi: Session token refreshed');
        }
        if (event === 'SIGNED_OUT') {
          console.log('NuOperandi: User signed out, cleaning up');
        }
  
            if (session?.user) { setSupaUser(session.user); } else if (event === "SIGNED_OUT") { setSupaUser(null); }
        });
        return () => subscription?.unsubscribe();
    }, []);

    /* -- Real-time Notifications -- */
    useEffect(() => {
        if (!supaUser) return;
        const fetchNotifs = async () => {
    try {
            const { data } = await supabase.from('notifications').select('*').eq('user_id', supaUser.id).order('created_at', { ascending: false }).limit(20);
            if (data) setNotifications(data || []);
        } catch(_loadErr) { console.error('Data load error:', _loadErr); }};
        fetchNotifs();
        const channel = supabase.channel('notifs-' + supaUser.id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + supaUser.id }, payload => {
 try {
            setNotifications(prev => [payload.new, ...prev]);
        } catch(_e) { console.error('Realtime sync error:', _e); }}).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supaUser]);

    /* -- Delegated to me -- */
    useEffect(() => {
        if (!supaUser || !userProfile) return;
        const fetchDelegated = async () => {
    try {
            const { data } = await supabase.from('delegated_tasks').select('*').eq('recipient_username', userProfile.username).order('created_at', { ascending: false });
            if (data) setDelegatedToMe(data || []);
        } catch(_loadErr) { console.error('Data load error:', _loadErr); }};
        fetchDelegated();
        const fetchDelegatedByMe = async () => {
    try {
            const { data } = await supabase.from('delegated_tasks').select('*').eq('delegator_id', supaUser.id).order('created_at', { ascending: false });
            if (data) setDelegatedByMe(data || []);
        } catch(_loadErr) { console.error('Data load error:', _loadErr); }};
        fetchDelegatedByMe();
    // Fetch all profiles for Team section (excluding current admin user)
    const fetchAllProfiles = async () => {
    try {
      if (!supaUser) return;
      const { data } = await supabase.from('profiles').select('id, username, full_name, initials, avatar_url').neq('id', supaUser.id).order('created_at', { ascending: true });
      if (data) setAllProfiles(data || []);
    } catch(_loadErr) { console.error('Data load error:', _loadErr); }};
    fetchAllProfiles();
        const channel = supabase.channel('delegated-' + userProfile.username).on('postgres_changes', { event: '*', schema: 'public', table: 'delegated_tasks', filter: 'recipient_username=eq.' + userProfile.username }, () => { try { fetchDelegated(); } catch(_re) { console.error('Realtime error:', _re); }}).subscribe();
        // Also subscribe to changes on tasks delegated BY me (so boardroom auto-updates)
        const delegatorChannel = supabase.channel('delegator-' + supaUser.id).on('postgres_changes', { event: '*', schema: 'public', table: 'delegated_tasks', filter: 'delegator_id=eq.' + supaUser.id }, () => { try { fetchDelegatedByMe(); } catch(_re) { console.error('Realtime error:', _re); }}).subscribe();

      const fetchPaymentTags = async () => {
    try {
        const { data } = await supabase.from('payment_tags').select('*').eq('sender_id', supaUser.id);
        if (data) setPaymentTags(data || []);
      } catch(_loadErr) { console.error('Data load error:', _loadErr); }};
      const fetchIncomingPayments = async () => {
    try {
        const { data } = await supabase.from('payment_tags').select('*').eq('recipient_username', userProfile.username);
        if (data) setIncomingPayments(data || []);
      } catch(_loadErr) { console.error('Data load error:', _loadErr); }};
      fetchPaymentTags();
      fetchIncomingPayments();
        
      const paymentSenderChannel = supabase.channel('payment-sender-' + supaUser.id).on('postgres_changes', { event: '*', schema: 'public', table: 'payment_tags', filter: 'sender_id=eq.' + supaUser.id }, () => { try { fetchPaymentTags(); } catch(_re) { console.error('Realtime error:', _re); }}).subscribe();
      const paymentRecipientChannel = supabase.channel('payment-recipient-' + userProfile.username).on('postgres_changes', { event: '*', schema: 'public', table: 'payment_tags', filter: 'recipient_username=eq.' + userProfile.username }, () => { try { fetchIncomingPayments(); } catch(_re) { console.error('Realtime error:', _re); }}).subscribe();

      return () => { supabase.removeChannel(channel); supabase.removeChannel(delegatorChannel); supabase.removeChannel(paymentSenderChannel); supabase.removeChannel(paymentRecipientChannel); };
    }, [supaUser, userProfile]);

    const markNotifRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.filter(Boolean).map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleAuth = (user, profile) => {
        setSupaUser(user);
        setUserProfile(profile);
        save('profile', profile);
    useEffect(() => save('eodReminderEnabled', eodReminderEnabled), [eodReminderEnabled]);
    useEffect(() => save('eodReminderTime', eodReminderTime), [eodReminderTime]);
    // EOD Reminder
    useEffect(() => {
      if (!eodReminderEnabled) return;
      const check = () => {
        const now = new Date();
        const [h, m] = eodReminderTime.split(':').filter(Boolean).map(Number);
        if (now.getHours() === h && now.getMinutes() === m && !window.__eodShown) {
          window.__eodShown = true;
          setShowEodReport(true);
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('NuOperandi', { body: 'Time for your End of Day Report!' });
          }
        } else if (now.getHours() !== h || now.getMinutes() !== m) {
          window.__eodShown = false;
        }
      };
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission();
      const iv = setInterval(check, 30000);
      return () => clearInterval(iv);
    }, [eodReminderEnabled, eodReminderTime]);
    };

    const handleDelegate = async (taskInfo) => {
        if (!supaUser || !userProfile) return;
        try {
            console.log('handleDelegate called with:', JSON.stringify(taskInfo));
            await supabase.from('delegated_tasks').insert({
                delegator_id: supaUser.id,
                recipient_username: taskInfo.recipient_username,
                task_text: taskInfo.task_text,
                task_type: taskInfo.task_type,
                priority: taskInfo.priority || 'medium',
                deadline: taskInfo.deadline || null,
                delegator_name: userProfile.name
            });
            // Create notification for recipient
            let recipientId = taskInfo.delegated_to;
            console.log('recipientId from delegated_to:', recipientId, 'username:', taskInfo.recipient_username);
            if (!recipientId && taskInfo.recipient_username) {
              const { data: rUser } = await supabase.from('profiles').select('id').eq('username', taskInfo.recipient_username).single();
              if (rUser) recipientId = rUser.id;
            }
            if (recipientId) {
              const notifResult = await supabase.from('notifications').insert({
                user_id: recipientId,
                title: 'New task delegated to you',
                message: userProfile.name + ' assigned you: ' + taskInfo.task_text,
                sender_name: userProfile.name,
                is_read: false
              });
              console.log('Notification insert result:', JSON.stringify(notifResult));
            }
        } catch (e) { console.log('Delegation sync error:', e); }
    };

    const markDelegatedDone = async (taskId) => {
        try {
            await supabase.from('delegated_tasks').update({ status: 'completed' }).eq('id', taskId);
            setDelegatedByMe(prev => prev.filter(Boolean).map(d => d.id === taskId ? { ...d, status: 'completed' } : d));
        } catch (e) { console.log('Mark done error:', e); }
    };

    // Recipient marks their accepted task as completed (auto-flows to delegator's boardroom)
    const toggleReceivedTask = async (task) => {
      try {
        await supabase.from('delegated_tasks').update({ status: 'completed' }).eq('id', task.id);
        setDelegatedToMe(prev => prev.filter(Boolean).map(d => d.id === task.id ? { ...d, status: 'completed' } : d));
        // Notify the delegator
        if (newStatus === 'completed' && task.delegator_id) {
          await supabase.from('notifications').insert({
            user_id: task.delegator_id,
            title: 'Task completed!',
            message: (userProfile.name || userProfile.full_name || userProfile.username) + ' completed: ' + task.task_text,
            sender_name: userProfile.name || userProfile.full_name || userProfile.username,
            related_task_id: task.id,
            is_read: false
          });
        }
      } catch (e) { console.log('Toggle received task error:', e); }
    };

  const acceptPaymentTag = async (tag) => {
    try {
      const newId = 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newStream = {
        id: newId,
        name: tag.company_name || tag.sender_name,
        type: tag.payment_type,
        monthly: Number(tag.amount),
        status: 'active',
        note: 'Tagged by ' + tag.sender_name,
        company: tag.company_name || '',
        role: tag.payment_type,
        paymentCycle: tag.frequency,
        nextPayment: '',
        lastPayment: '',
        payments: [],
        trend: 0
      };
      setIncomeStreams(prev => [...prev, newStream]);
      if (supabase) {
        await supabase.from('income_streams').insert({
          local_id: newId,
          owner_id: (await supabase.auth.getUser()).data.user.id,
          name: newStream.name,
          type: newStream.type,
          monthly: newStream.monthly,
          status: 'active',
          note: newStream.note,
          extra_data: { company: newStream.company, role: newStream.role, paymentCycle: newStream.paymentCycle, tagged_by: tag.sender_name, payment_tag_id: tag.id }
        });
        await supabase.from('payment_tags').update({ status: 'accepted' }).eq('id', tag.id);
        await supabase.from('notifications').insert({
          user_id: tag.sender_id,
          title: 'Payment accepted!',
          message: (userProfile.name || userProfile.full_name || userProfile.username) + ' accepted your ' + Number(tag.amount).toLocaleString() + ' ' + tag.payment_type + ' tag',
          sender_name: userProfile.name || userProfile.full_name || userProfile.username,
          is_read: false
        });
      }
      setIncomingPayments(prev => prev.filter(Boolean).map(p => p.id === tag.id ? { ...p, status: 'accepted' } : p));
    } catch (e) { console.log('Accept payment tag error:', e); }
  };

  const declinePaymentTag = async (tag) => {
    try {
      if (supabase) {
        await supabase.from('payment_tags').update({ status: 'declined' }).eq('id', tag.id);
        await supabase.from('notifications').insert({
          user_id: tag.sender_id,
          title: 'Payment declined',
          message: (userProfile.name || userProfile.full_name || userProfile.username) + ' declined your ' + Number(tag.amount).toLocaleString() + ' ' + tag.payment_type + ' tag',
          sender_name: userProfile.name || userProfile.full_name || userProfile.username,
          is_read: false
        });
      }
      setIncomingPayments(prev => prev.filter(Boolean).map(p => p.id === tag.id ? { ...p, status: 'declined' } : p));
    } catch (e) { console.log('Decline payment tag error:', e); }
  };



    useEffect(() => {
        if (modal) return;
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [modal]);

    useEffect(() => {
        const archiveCompletedTasks = () => {
            const today = new Date().toISOString().split('T')[0];
            const completed = quickTasks.filter(t => completedTasks[t.id]);
            if (completed.length === 0) return;
            const archiveEntry = {
                date: today,
                tasks: completed.filter(Boolean).map(t => ({
                    ...t,
                    completedAt: new Date().toISOString()
                }))
            };
            setTaskHistory(prev => {
                const existing = prev.find(h => h.date === today);
                if (existing) {
                    return prev.filter(Boolean).map(h => h.date === today
                        ? { ...h, tasks: [...h.tasks, ...archiveEntry.tasks] }
                        : h
                    );
                }
                return [archiveEntry, ...prev];
            });
            // Remove archived tasks from active list
            const completedIds = completed.filter(Boolean).map(t => t.id);
            setQuickTasks(prev => prev.filter(t => !completedIds.includes(t.id)));
            setCompletedTasks(prev => {
                const next = { ...prev };
                completedIds.forEach(id => delete next[id]);
                return next;
            });
        };

        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = midnight - now;

        const timer = setTimeout(() => {
            archiveCompletedTasks();
            // Then set interval for subsequent days
            const interval = setInterval(archiveCompletedTasks, 24 * 60 * 60 * 1000);
            return () => clearInterval(interval);
        }, msUntilMidnight);

        return () => clearTimeout(timer);
    }, [quickTasks, completedTasks]);

    const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
    const fmtDate = (d) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d);
    const fmtNaira = (v) => String.fromCharCode(8358) + (Number(v) >= 1000000 ? (Number(v) / 1000000).toFixed(1) + 'M' : Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + 'K' : Number(v).toLocaleString());
    const totalMonthly = incomeStreams.reduce((s, i) => s + Number(i.monthly || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => {
        const amt = Number(e.amount || 0);
        if (e.frequency === 'Weekly') return s + amt * 4.33;
        if (e.frequency === 'Quarterly') return s + amt / 3;
        if (e.frequency === 'Annual') return s + amt / 12;
        if (e.frequency === 'One-time') return s;
        return s + amt;
    }, 0);
    const netMonthly = totalMonthly - totalExpenses;
    const nextPaymentDue = useMemo(() => {
        const upcoming = incomeStreams.filter(s => s.nextPayment).sort((a, b) => a.nextPayment.localeCompare(b.nextPayment));
        if (upcoming.length === 0) return null;
        return upcoming[0];
    }, [incomeStreams]);

    const notifyDelegatorOnCompletion = async (task) => {
    if (!task.delegatedFrom || !supabase || !userProfile) return;
    try {
      // Auto-update delegated_tasks status to completed in Supabase
      const { data: matchedTasks } = await supabase.from('delegated_tasks').select('id').eq('task_text', task.task || task.task_text).eq('recipient_username', userProfile.username).neq('status', 'completed').limit(1);
      if (matchedTasks && matchedTasks.length > 0) {
        await supabase.from('delegated_tasks').update({ status: 'completed' }).eq('id', matchedTasks[0].id);
      }
      const { data: delegator } = await supabase.from('profiles').select('id').eq('full_name', task.delegatedFrom).single();
      if (!delegator) {
        const { data: d2 } = await supabase.from('profiles').select('id').eq('username', task.delegatedFrom).single();
        if (d2) {
          await supabase.from('notifications').insert({ user_id: d2.id, title: 'Task completed!', message: (userProfile.name || userProfile.username) + ' completed: ' + (task.task || task.task_text || ''), sender_name: userProfile.name || userProfile.username, is_read: false });
        }
      } else {
        await supabase.from('notifications').insert({ user_id: delegator.id, title: 'Task completed!', message: (userProfile.name || userProfile.username) + ' completed: ' + (task.task || task.task_text || ''), sender_name: userProfile.name || userProfile.username, is_read: false });
      }
    } catch (e) { console.log('Completion notify error:', e); }
  };

  const toggleProjectCollapse = (pid) => {
    setCollapsedProjects(prev => ({ ...prev, [pid]: !prev[pid] }));
  };

  const toggleTask = (id) => {
    const wasCompleted = completedTasks[id];
    setCompletedTasks(p => ({ ...p, [id]: p[id] ? false : Date.now() }));
    if (!wasCompleted) {
      setTimeout(() => {
        const completedTask = quickTasks.find(t => t.id === id);
        if (completedTask && completedTask.delegatedFrom) notifyDelegatorOnCompletion(completedTask);
        setQuickTasks(prev => {
          const task = prev.find(t => t.id === id);
          if (!task) return prev;
          const today = new Date().toISOString().split('T')[0];
          const archiveEntry = { ...task, completedAt: new Date().toISOString() };
          setTaskHistory(ph => {
            const existing = ph.find(h => h.date === today);
            if (existing) return ph.filter(Boolean).map(h => h.date === today ? { ...h, tasks: [...h.tasks, archiveEntry] } : h);
            return [{ date: today, tasks: [archiveEntry] }, ...ph];
          });
          return prev.filter(t => t.id !== id);
        });
        setCompletedTasks(p => { const next = { ...p }; delete next[id]; return next; });
      }, 1500);
    }
  };

  const acceptToDaily = async (task) => {
    setQuickTasks(prev => [...prev, {
      id: newId(),
      task: task.task_text,
      priority: task.priority || 'medium',
      due: 'Today',
      projectId: null,
      delegatedTo: '',
      delegatedFrom: task.delegator_name
    }]);
    try {
      await supabase.from('delegated_tasks').update({ status: 'accepted' }).eq('id', task.id);
    } catch (e) { console.log('Accept sync error:', e); }
    setDelegatedToMe(prev => prev.filter(Boolean).map(d => d.id === task.id ? {...d, status: 'accepted'} : d));
    setAcceptingTask(null);
  };

  const acceptToWeekly = async (task) => {
    setWeeklyPlan(prev => [...prev, {
      id: newId(),
      task: task.task_text,
      projectId: null,
      subtasks: [],
      deadline: task.deadline || new Date().toISOString().split('T')[0],
      delegatedTo: '',
      delegatedFrom: task.delegator_name
    }]);
    try {
      await supabase.from('delegated_tasks').update({ status: 'accepted' }).eq('id', task.id);
    } catch (e) { console.log('Accept sync error:', e); }
    setDelegatedToMe(prev => prev.filter(Boolean).map(d => d.id === task.id ? {...d, status: 'accepted'} : d));
    setAcceptingTask(null);
  };
  const toggleWeekly = (id) => {
    const wasCompleted = completedWeekly[id];
    setCompletedWeekly(p => ({ ...p, [id]: p[id] ? false : Date.now() }));
    if (!wasCompleted) {
      setTimeout(() => {
        const completedWeeklyTask = weeklyPlan.find(t => t.id === id);
        if (completedWeeklyTask && completedWeeklyTask.delegatedFrom) notifyDelegatorOnCompletion(completedWeeklyTask);
        setWeeklyPlan(prev => {
          const task = prev.find(t => t.id === id);
          if (!task) return prev;
          const today = new Date().toISOString().split('T')[0];
          const archiveEntry = { ...task, completedAt: new Date().toISOString(), source: 'weekly' };
          setTaskHistory(ph => {
            const existing = ph.find(h => h.date === today);
            if (existing) return ph.filter(Boolean).map(h => h.date === today ? { ...h, tasks: [...h.tasks, archiveEntry] } : h);
            return [{ date: today, tasks: [archiveEntry] }, ...ph];
          });
          return prev.filter(t => t.id !== id);
        });
        setCompletedWeekly(p => { const next = { ...p }; delete next[id]; return next; });
      }, 1500);
    }
  };
  const toggleSubtask = (taskId, subtaskId) => {
    setWeeklyPlan(prev => prev.filter(Boolean).map(w => {
      if (w.id !== taskId) return w;
      return { ...w, subtasks: (w.subtasks || []).filter(Boolean).map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) };
    }));
  };
  const archiveCompleted = () => {
        const today = new Date().toISOString().split('T')[0];
        const completed = quickTasks.filter(t => completedTasks[t.id]);
        if (completed.length === 0) return;
        const archiveEntry = {
            date: today,
            tasks: completed.filter(Boolean).map(t => ({ ...t, completedAt: new Date().toISOString() }))
        };
        setTaskHistory(prev => {
            const existing = prev.find(h => h.date === today);
            if (existing) {
                return prev.filter(Boolean).map(h => h.date === today ? { ...h, tasks: [...h.tasks, ...archiveEntry.tasks] } : h);
            }
            return [archiveEntry, ...prev];
        });
        const completedIds = completed.filter(Boolean).map(t => t.id);
        setQuickTasks(prev => prev.filter(t => !completedIds.includes(t.id)));
        setCompletedTasks(prev => {
            const next = { ...prev };
            completedIds.forEach(id => delete next[id]);
            return next;
        });
    };
    const getSubProgress = (w) => {
        if (!w.subtasks || w.subtasks.length === 0) return null;
        const done = w.subtasks.filter(s => s.done).length;
        return { done, total: w.subtasks.length, pct: Math.round((done / w.subtasks.length) * 100) };
    };

    const getProjectProgress = useCallback((projectId) => {
        const linkedWeekly = weeklyPlan.filter(w => w.projectId === projectId);
        const linkedTasks = quickTasks.filter(t => t.projectId === projectId);
        if (linkedWeekly.length === 0 && linkedTasks.length === 0) return null;
        let totalUnits = 0, doneUnits = 0;
        linkedWeekly.forEach(w => {
            if (w.subtasks && w.subtasks.length > 0) {
                totalUnits += w.subtasks.length;
                doneUnits += w.subtasks.filter(s => s.done).length;
            } else {
                totalUnits += 1;
                if (completedWeekly[w.id]) doneUnits += 1;
            }
        });
        linkedTasks.forEach(t => {
            totalUnits += 1;
            if (completedTasks[t.id]) doneUnits += 1;
        });
        return totalUnits === 0 ? 0 : Math.round((doneUnits / totalUnits) * 100);
    }, [weeklyPlan, quickTasks, completedWeekly, completedTasks]);

    
  // Sync project members to Supabase when projects change
  async function syncProjectMembers(projectId, projectName, members) {
    if (!supaUser) return;
    try {
      // Delete existing members for this project
      await supabase.from('project_members').delete().eq('project_owner_id', supaUser.id).eq('project_local_id', projectId);
      // Insert new members
      if (members && members.length > 0) {
        const rows = members.filter(m => m.id).map(m => ({
          project_owner_id: supaUser.id,
          project_local_id: projectId,
          project_name: projectName,
          member_profile_id: m.id,
          role: 'member'
        }));
        if (rows.length > 0) await supabase.from('project_members').insert(rows);
      }
    } catch (err) { console.error('syncProjectMembers error:', err); }
  };

  // Sync project snapshot data for shared viewing
  async function syncProjectSnapshot(proj) {
    if (!supaUser) return;
    try {
      const linkedWeekly = weeklyPlan.filter(t => t.projectId === proj.id);
      const linkedDaily = (quickTasks || []).filter(t => t.projectId === proj.id);
      const snapshot = { name: proj.name, desc: proj.desc, status: proj.status, progress: proj.progress, launch: proj.launch, next: proj.next, teamMembers: proj.teamMembers || [] };
      const tasksSnap = [...linkedWeekly.filter(Boolean).map(t => ({ ...t, type: 'weekly' })), ...linkedDaily.filter(Boolean).map(t => ({ ...t, type: 'daily' }))];
      await supabase.from('shared_project_data').upsert({ project_owner_id: supaUser.id, project_local_id: proj.id, project_snapshot: snapshot, tasks_snapshot: tasksSnap, updated_at: new Date().toISOString() }, { onConflict: 'project_owner_id,project_local_id' });
    } catch (err) { console.error('syncProjectSnapshot error:', err); }
  };

  // Fetch projects shared with current user
  async function fetchSharedProjects() {
    if (!supaUser) return;
    try {
      const { data: memberships } = await supabase.from('project_members').select('*').eq('member_profile_id', supaUser.id);
      if (!memberships || memberships.length === 0) { setSharedProjects([]); return; }
      const shared = [];
      for (const m of memberships) {
        const { data: projData } = await supabase.from('shared_project_data').select('*').eq('project_owner_id', m.project_owner_id).eq('project_local_id', m.project_local_id).single();
        if (projData) {
          const { data: ownerProfile } = await supabase.from('profiles').select('full_name, username, avatar_url, initials').eq('id', m.project_owner_id).single();
          const { data: allMembers } = await supabase.from('project_members').select('member_profile_id, role').eq('project_owner_id', m.project_owner_id).eq('project_local_id', m.project_local_id);
          const memberProfiles = [];
          if (allMembers) {
            for (const am of allMembers) {
              const { data: mp } = await supabase.from('profiles').select('id, full_name, username, avatar_url, initials').eq('id', am.member_profile_id).single();
              if (mp) memberProfiles.push(mp);
            }
          }
          const { data: completions } = await supabase.from('shared_task_completions').select('*').eq('project_owner_id', m.project_owner_id).eq('project_local_id', m.project_local_id);
          shared.push({ ...projData, owner: ownerProfile, members: memberProfiles, myRole: m.role, completions: completions || [] });
        }
      }
      setSharedProjects(shared);
      setSharedTaskCompletions(shared.flatMap(s => s.completions || []));
    } catch (err) { console.error('fetchSharedProjects error:', err); }
  };


  // Fetch shared projects when user logs in
  useEffect(() => {
    if (supaUser) { fetchSharedProjects(); }
  }, [supaUser]);

    const sections = [];
    if (sharedProjects && sharedProjects.length > 0) { sections.push({ title: "Shared Projects", items: sharedProjects.filter(Boolean).map(function(sp) { var snap = sp.project_snapshot || {}; var tc = sp.tasks_snapshot ? sp.tasks_snapshot.length : 0; return (snap.name || "Project") + " (" + (snap.status || "Active") + ") - " + tc + " tasks. Owner: " + (sp.owner ? sp.owner.full_name : "Unknown"); }) }); }


    const pushToDaily = (weeklyItem) => {
        const existingTask = quickTasks.find(t => t.weeklySourceId === weeklyItem.id);
        if (existingTask) return;
        setQuickTasks(prev => [...prev, {
            id: newId(),
            task: weeklyItem.task,
            priority: 'medium',
            due: 'Today',
            projectId: weeklyItem.projectId || null,
            weeklySourceId: weeklyItem.id
        }]);
    };

    const catColors = { amber: 'bg-amber-50 border-amber-200 text-amber-800', blue: 'bg-violet-50 border-violet-200 text-blue-800', purple: 'bg-purple-50 border-purple-200 text-purple-800', green: 'bg-emerald-50 border-emerald-200 text-emerald-800' };
    const catDot = { amber: 'bg-amber-400', blue: 'bg-blue-400', purple: 'bg-purple-400', green: 'bg-emerald-400' };
    const statusColors = { 'On Track': 'bg-emerald-50 text-emerald-700', 'Growing': 'bg-violet-50 text-violet-700', 'At Risk': 'bg-red-50 text-red-700', 'In Progress': 'bg-violet-50 text-violet-700', 'Planning': 'bg-amber-50 text-amber-700', 'Launch Ready': 'bg-emerald-50 text-emerald-700', 'Completed': 'bg-gray-100 text-gray-600' };
    const prioColor = { high: 'bg-red-100 text-red-600', medium: 'bg-amber-100 text-amber-600', low: 'bg-emerald-100 text-emerald-600' };
    const prioLabel = { high: 'High', medium: 'Med', low: 'Low' };

    const projectName = (id) => {
        if (!id) return null;
        const p = projects.find(pr => pr.id === id);
        return p ? p.name : null;
    };

    const activeProjects = useMemo(() => projects.filter(p => p.status !== 'Completed'), [projects]);

    const Empty = ({ icon, title, sub, action, actionLabel }) => (
        <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">{icon}</div>
            <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
            <p className="text-xs text-gray-400 mb-5">{sub}</p>
            {action && <button onClick={action} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition">{I.plus("white")} {actionLabel}</button>}
        </div>
    );

    const Sidebar = () => {
    const projectColors = ['#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];
    const sidebarProjects = projects.slice(0, 5);
    return (
      <div className={`fixed left-0 top-0 h-screen flex flex-col z-10 bg-white/90 backdrop-blur-sm border-r border-violet-100/50 sidebar-shadow transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
        {/* Brand + Online Status */}
        <div className="p-4 border-b border-violet-50">
          {sidebarOpen ? (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Emblem size={34} />
                  <span className="text-base font-semibold text-gray-900 tracking-tight">NuOperandi</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-50">
                  {I.x("#9CA3AF")}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 px-1">
                <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
                  {userProfile && userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" /> : (userProfile ? userProfile.initials : 'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{userProfile ? userProfile.name : 'User'}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white"></span>
                    <span className="text-xs text-gray-400">Online</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Emblem size={28} />
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
                  {userProfile && userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : (userProfile ? userProfile.initials : 'U')}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-50 mt-1">
                {I.menu("#9CA3AF")}
              </button>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5 mt-2 overflow-y-auto">
          {[
            {id:'command', icon:I.command(activeModule==='command'?'#7C3AED':'#6B7280'), label:'Command Centre'},
            {id:'income', icon:I.dollar(activeModule==='income'?'#7C3AED':'#6B7280'), label:'Income & Projects'},
            {id:'planner', icon:I.calendar(activeModule==='planner'?'#7C3AED':'#6B7280'), label:'Planner'},
            {id:'history', icon:I.history(activeModule==='history'?'#7C3AED':'#6B7280'), label:'History'},
            {id:'boardroom', icon:I.bar(activeModule==='boardroom'?'#7C3AED':'#6B7280'), label:'Boardroom'}
          ].filter(Boolean).map(item => (
            <button key={item.id} onClick={() => setActiveModule(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${activeModule === item.id ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-violet-50/50'}`}>
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}

          {/* My Projects section */}
          {sidebarOpen && sidebarProjects.length > 0 && (
            <div className="mt-4 pt-3 border-t border-violet-50">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">My Projects</span>
                <button onClick={() => setModal('addProject')} className="text-xs text-violet-500 hover:text-violet-700 font-medium">+ Add</button>
              </div>
              {sidebarProjects.filter(Boolean).map((proj, i) => (
                <button key={proj.id} onClick={() => setActiveModule('project-' + proj.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${activeModule === 'project-' + proj.id ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-violet-50/50'}`}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: projectColors[i % projectColors.length]}}></span>
                  <span className="truncate">{proj.name}</span>
                </button>
              ))}
              {projects.length > 5 && (
                <button onClick={() => setActiveModule('income')} className="w-full px-3 py-1.5 text-xs text-violet-500 hover:text-violet-700 text-left">View all ({projects.length})</button>
              )}
            </div>
          )}
          {!sidebarOpen && sidebarProjects.length > 0 && (
            <div className="mt-4 pt-3 border-t border-violet-50 flex flex-col items-center gap-1">
              {sidebarProjects.slice(0, 3).filter(Boolean).map((proj, i) => (
                <button key={proj.id} onClick={() => setActiveModule('project-' + proj.id)} title={proj.name} className="p-1.5 rounded-lg hover:bg-violet-50/50 transition">
                  <span className="w-3 h-3 rounded-full block" style={{backgroundColor: projectColors[i % projectColors.length]}}></span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Settings */}
        <div className="p-2 border-t border-gray-50">
          <button onClick={() => setModal('settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition text-sm">
            {I.settings("#9CA3AF")}
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </div>
    );
  };

  const TopBar = () => {
    const todayTasksTotal = quickTasks.length;
    const todayTasksDone = quickTasks.filter(t => completedTasks[t.id]).length;
    const delegatedActiveCount = delegatedByMe.filter(d => d.status === 'pending' || d.status === 'accepted').length;
    return (
      <div className="sticky top-0 z-10">
        {/* Utility row */}
        <div className="flex items-center justify-end gap-4 px-8 py-2 bg-white/50 backdrop-blur-sm">
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-gray-400 hover:text-gray-600 transition">
            {I.bell("#9CA3AF")}
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">{unreadCount}</span>}
          </button>
          <div onClick={() => setModal('settings')} className="w-9 h-9 rounded-full cursor-pointer hover:ring-2 hover:ring-violet-400 transition overflow-hidden">
            {userProfile && userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white font-semibold text-sm">{userProfile ? userProfile.initials : 'U'}</div>}
          </div>
        </div>
        {/* Hero greeting */}
        <div className="px-8 pb-6 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hello, <span className="text-violet-600">{userProfile ? userProfile.name.split(' ')[0] : 'User'}</span></h1>
              <p className="text-base text-gray-500 mt-1">{fmtDate(currentTime)}</p>
              <p className="text-sm mt-2 italic truncate max-w-xl" style={{color:'#B8952C'}}>{getQuote()}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 mt-1">
              <button onClick={() => setModal('addGoal')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-medium text-gray-700 hover:bg-violet-50 hover:border-violet-300 shadow-sm transition">{I.circle("#7C3AED")}Add New Goal</button>
              <button onClick={() => { setActiveModule('planner'); setPlannerTab('weekly'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-medium text-gray-700 hover:bg-violet-50 hover:border-violet-300 shadow-sm transition">{I.clipboard("#7C3AED")}Add Weekly Task</button>
              <button onClick={() => setModal('addTimeBlock')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-medium text-gray-700 hover:bg-violet-50 hover:border-violet-300 shadow-sm transition">{I.calendar("#7C3AED")}Schedule</button>
              {clockInTime ? (
                <button onClick={handleClockOut} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-sm font-medium text-emerald-700 hover:bg-emerald-100 shadow-sm transition">{I.clock("#059669")}<span>Clock Out</span>{clockElapsed && <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">{clockElapsed}</span>}</button>
              ) : (
                <button onClick={handleClockIn} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-medium text-gray-700 hover:bg-violet-50 hover:border-violet-300 shadow-sm transition">{I.clock("#7C3AED")}Clock In</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({label, value, sub, trend, icon}) => (
        <div className="bg-white rounded-xl border border-violet-100/60 p-5 card-shadow card-shadow-hover transition-all">
            <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>{icon}</div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {sub && <p className={'text-xs mt-1.5 ' + (trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-400' : 'text-gray-400')}>{sub}</p>}
        </div>
    );

    
    // === END OF DAY REPORT ===
    const generateEodPdf = async () => {
      if (!window.jspdf) {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(s);
        await new Promise(r => { s.onload = r; setTimeout(r, 3000); });
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const userName = userProfile ? (userProfile.name || userProfile.username || 'Team Member') : 'Team Member';
      const allSub = (projects || []).flatMap(p => (p.subtasks || []).filter(Boolean).map(s => ({...s, project: p.name})));
      const done = allSub.filter(s => s.done);
      const notDone = allSub.filter(s => !s.done);
      const delComp = (delegatedByMe || []).filter(d => d.completed || d.status === 'completed');
      const delPend = (delegatedByMe || []).filter(d => !d.completed && d.status !== 'completed');
      const total = allSub.length;
      const rate = total > 0 ? Math.round((done.length / total) * 100) : 0;
      const projCount = [...new Set(done.filter(Boolean).map(s => s.project))].length;
      let y = 20;
      const pw = doc.internal.pageSize.getWidth();
      const mg = 20;
      const cw = pw - mg * 2;
      const chk = () => { if (y > 270) { doc.addPage(); y = 20; } };
      doc.setFillColor(30, 58, 95); doc.rect(0, 0, pw, 40, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
      doc.text('End of Day Report', mg, 26);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(dateStr, pw - mg, 16, { align: 'right' });
      doc.text(userName, pw - mg, 26, { align: 'right' });
      y = 55;
      doc.setFillColor(243, 244, 246); doc.roundedRect(mg, y - 5, cw, 28, 3, 3, 'F');
      doc.setTextColor(30, 58, 95); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      const sts = ['Done: ' + done.length, 'Pending: ' + notDone.length, 'Delegated Done: ' + delComp.length, 'Rate: ' + rate + '%', 'Projects: ' + projCount];
      const sw = cw / sts.length;
      sts.forEach((st, i) => { doc.text(st, mg + 5 + i * sw, y + 10); });
      y += 38;
      const section = (title, items, color, filled) => {
        chk(); doc.setFillColor(...color); doc.rect(mg, y, 4, 10, 'F');
        doc.setTextColor(30, 58, 95); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text(title + ' (' + items.length + ')', mg + 8, y + 8); y += 15;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(55, 65, 81);
        if (items.length === 0) { doc.text('None.', mg + 8, y); y += 8; }
        else items.forEach(t => {
          chk();
          if (filled) { doc.setFillColor(...color); doc.circle(mg + 5, y - 1, 1.5, 'F'); }
          else { doc.setDrawColor(...color); doc.circle(mg + 5, y - 1, 1.5, 'S'); }
          const txt = t.project ? '[' + t.project + '] ' + (t.text || t.task_text || '') : (t.task_text || t.text || '');
          const assignee = t.recipient_username ? ' (@' + t.recipient_username + ')' : '';
          const ln = doc.splitTextToSize(txt + assignee, cw - 15);
          doc.text(ln, mg + 10, y); y += ln.length * 5 + 2;
        });
        y += 6;
      };
      section('Tasks Completed', done, [34, 197, 94], true);
      section('Tasks Pending', notDone, [239, 68, 68], false);
      section('Delegated Tasks Completed', delComp, [59, 130, 246], true);
      section('Delegated Tasks Pending', delPend, [249, 115, 22], false);
      const notesEl = document.getElementById('eod-notes-input');
      const notes = notesEl ? notesEl.value : '';
      if (notes.trim()) {
        chk(); doc.setFillColor(107, 114, 128); doc.rect(mg, y, 4, 10, 'F');
        doc.setTextColor(30, 58, 95); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('Notes', mg + 8, y + 8); y += 15;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(55, 65, 81);
        doc.splitTextToSize(notes, cw - 10).forEach(ln => { chk(); doc.text(ln, mg + 8, y); y += 5; });
      }
      const pc = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pc; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(156, 163, 175); doc.text('NuOperandi - ' + dateStr, mg, 290); doc.text('Page ' + i + '/' + pc, pw - mg, 290, { align: 'right' }); }
      doc.save('EOD_Report_' + userName.replace(/\s+/g, '_') + '_' + today.toISOString().split('T')[0] + '.pdf');
    };

    const EODReportModal = () => {
      if (!showEodReport) return null;
      const allSub = (projects || []).flatMap(p => (p.subtasks || []).filter(Boolean).map(s => ({...s, project: p.name})));
      const done = allSub.filter(s => s.done);
      const notDone = allSub.filter(s => !s.done);
      const delComp = (delegatedByMe || []).filter(d => d.completed || d.status === 'completed');
      const delPend = (delegatedByMe || []).filter(d => !d.completed && d.status !== 'completed');
      const total = allSub.length;
      const rate = total > 0 ? Math.round((done.length / total) * 100) : 0;
      return (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEodReport(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold">End of Day Report</h2>
              <p className="text-blue-200 text-sm mt-1">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
              <button onClick={() => setShowEodReport(false)} className="text-white/70 hover:text-white text-2xl font-light">x</button>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-600">{done.length}</div><div className="text-xs text-green-700">Completed</div></div>
              <div className="bg-red-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-red-500">{notDone.length}</div><div className="text-xs text-red-600">Pending</div></div>
              <div className="bg-violet-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-violet-700">{delComp.length}</div><div className="text-xs text-violet-700">Delegated Done</div></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-gray-700">{rate}%</div><div className="text-xs text-gray-500">Rate</div></div>
            </div>
            {done.length > 0 && <div><h3 className="text-sm font-semibold text-green-700 mb-2">Tasks Completed ({done.length})</h3><div className="space-y-1">{done.filter(Boolean).map((t,i) => <div key={i} className="text-sm text-gray-700 py-1 flex items-start gap-2"><span className="text-green-500 mt-0.5">&#10003;</span><span><span className="text-gray-400 text-xs">[{t.project}]</span> {t.text}</span></div>)}</div></div>}
            {notDone.length > 0 && <div><h3 className="text-sm font-semibold text-red-600 mb-2">Tasks Pending ({notDone.length})</h3><div className="space-y-1">{notDone.filter(Boolean).map((t,i) => <div key={i} className="text-sm text-gray-700 py-1 flex items-start gap-2"><span className="w-3 h-3 rounded-full border-2 border-red-300 mt-1 flex-shrink-0"></span><span><span className="text-gray-400 text-xs">[{t.project}]</span> {t.text}</span></div>)}</div></div>}
            {delComp.length > 0 && <div><h3 className="text-sm font-semibold text-violet-700 mb-2">Delegated Completed ({delComp.length})</h3><div className="space-y-1">{delComp.filter(Boolean).map((d,i) => <div key={i} className="text-sm text-gray-700 py-1 flex items-start gap-2"><span className="text-violet-600 mt-0.5">&#10003;</span><span>{d.task_text} <span className="text-blue-400 text-xs">@{d.recipient_username || 'team'}</span></span></div>)}</div></div>}
            {delPend.length > 0 && <div><h3 className="text-sm font-semibold text-orange-600 mb-2">Delegated Pending ({delPend.length})</h3><div className="space-y-1">{delPend.filter(Boolean).map((d,i) => <div key={i} className="text-sm text-gray-700 py-1 flex items-start gap-2"><span className="w-3 h-3 rounded-full border-2 border-orange-300 mt-1 flex-shrink-0"></span><span>{d.task_text} <span className="text-orange-400 text-xs">@{d.recipient_username || 'team'}</span></span></div>)}</div></div>}
            <div><label className="text-sm font-semibold text-gray-600 mb-2 block">Notes</label><textarea id="eod-notes-input" className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" rows="3" placeholder="Add notes for your report..."></textarea></div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-gray-600">Daily Reminder</span>
              <button onClick={() => setEodReminderEnabled(!eodReminderEnabled)} className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (eodReminderEnabled ? "bg-violet-500" : "bg-gray-300")}><span className={"inline-block h-4 w-4 transform rounded-full bg-white transition " + (eodReminderEnabled ? "translate-x-6" : "translate-x-1")}></span></button></div>
              {eodReminderEnabled && <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Remind at</span><input type="time" value={eodReminderTime} onChange={e => setEodReminderTime(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" /><span className="text-xs text-gray-500">daily</span></div>}
            </div>
            <div className="flex gap-3">
              <button onClick={generateEodPdf} className="flex-1 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white py-3 rounded-xl font-medium text-sm hover:opacity-90 transition">Download PDF Report</button>
              <button onClick={() => setShowEodReport(false)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      </div>);
    };

    const CommandCentre = () => {
        const pendingTasks = quickTasks.filter(t => !completedTasks[t.id]);
        const todayDone = quickTasks.length - pendingTasks.length;
        const weeklyDoneCC = (() => { let d = 0, t = 0; weeklyPlan.forEach(w => { if (w.subtasks && w.subtasks.length > 0) { t += w.subtasks.length; d += w.subtasks.filter(s => s.done).length; } else { t += 1; if (completedWeekly[w.id]) d += 1; } }); return { done: d, total: t }; })();
        const upcomingBlocks = timeBlocks.filter(b => !completedTimeBlocks[b.id]);
        const completedBlocks = timeBlocks.filter(b => completedTimeBlocks[b.id]);

        return (
        <div className="space-y-6 max-w-6xl">
            <div className="space-y-5">
          {/* Row 1: Balance + Right Stack */}
          <div className="grid grid-cols-3 gap-5">
            {/* Balance Card - Large */}
            <div className="col-span-2 bg-white rounded-2xl border border-violet-100/60 p-6 card-shadow">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-500">Balance</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Last 6 months</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">{fmtNaira(netMonthly)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${netMonthly >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{netMonthly >= 0 ? '+' : ''}{totalMonthly > 0 ? Math.round((netMonthly/totalMonthly)*100) : 0}%</span>
              </div>
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>Income <span className="font-medium text-gray-700">{fmtNaira(totalMonthly)}</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-200"></span>Expenses <span className="font-medium text-gray-700">{fmtNaira(totalExpenses)}</span></span>
              </div>
              {/* Mini Bar Chart */}
              <div className="flex items-end gap-1.5 h-24 mt-2">
                {[...Array(6)].filter(Boolean).map((_, i) => {
                  const months = ['Jul','Aug','Sep','Oct','Nov','Dec'];
                  const vals = [netMonthly*0.7, netMonthly*0.4, netMonthly*1.1, netMonthly*0.9, netMonthly*0.6, netMonthly];
                  const maxVal = Math.max(...vals.filter(Boolean).map(Math.abs), 1);
                  const h = Math.abs(vals[i]) / maxVal * 80;
                  const isPos = vals[i] >= 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center justify-end" style={{height:'80px'}}>
                        {isPos && <div className="w-full rounded-t" style={{height: h+'px', background: 'linear-gradient(180deg, #8B5CF6 0%, #A78BFA 100%)'}}></div>}
                        {!isPos && <div className="w-full rounded-b bg-violet-200" style={{height: h+'px'}}></div>}
                      </div>
                      <span className="text-xs text-gray-400">{months[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Stack */}
            <div className="col-span-1 flex flex-col gap-5">
              {/* Most Spending */}
              <div className="bg-white rounded-2xl border border-violet-100/60 p-5 card-shadow flex-1">
                <span className="text-sm font-medium text-gray-500">Most Spending</span>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {expenses.slice(0, 2).filter(Boolean).map((exp, i) => (
                    <div key={i} className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-2">
                        {i === 0 ? I.receipt("#7C3AED") : I.receipt("#7C3AED")}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{exp.name}</p>
                      <p className="text-sm font-bold text-gray-900">{fmtNaira(Number(exp.amount) || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Net Worth / Saving */}
              <div className="bg-white rounded-2xl border border-violet-100/60 p-5 card-shadow flex-1">
                <span className="text-sm font-medium text-gray-500">Net Worth</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-bold text-gray-900">{fmtNaira(netMonthly * 12)}</span>
                  <div className="w-14 h-14 rounded-full" style={{background: `conic-gradient(#7C3AED ${Math.min(100, Math.max(0, totalMonthly > 0 ? (netMonthly/totalMonthly)*100 : 0)) * 3.6}deg, #EDE9FE 0deg)`}}>
                    <div className="w-10 h-10 rounded-full bg-white m-2 flex items-center justify-center text-xs font-bold text-violet-600">{totalMonthly > 0 ? Math.round((netMonthly/totalMonthly)*100) : 0}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Income + Expenses + Tasks */}
          <div className="grid grid-cols-3 gap-5">
            {/* Income Card */}
            <div className="bg-white rounded-2xl border border-violet-100/60 p-5 card-shadow">
              <span className="text-sm font-medium text-gray-500">Income</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold text-gray-900">{fmtNaira(totalMonthly)}</span>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition" onClick={() => setActiveModule('income')}>
                  {I.arrowUp("#6B7280")}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Target {fmtNaira(totalMonthly * 1.2)}</p>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{width: Math.min(100, 83) + '%'}}></div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">83%</span>
            </div>
            {/* Expenses Card */}
            <div className="bg-white rounded-2xl border border-violet-100/60 p-5 card-shadow">
              <span className="text-sm font-medium text-gray-500">Expenses</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold text-gray-900">{fmtNaira(totalExpenses)}</span>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition" onClick={() => setActiveModule('income')}>
                  {I.arrowUp("#6B7280")}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Max {fmtNaira(totalMonthly * 0.8)}</p>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-violet-400" style={{width: Math.min(100, totalMonthly > 0 ? Math.round((totalExpenses/(totalMonthly*0.8))*100) : 0) + '%'}}></div>
              </div>
              <span className="text-xs font-semibold text-violet-600 mt-1 inline-block">{totalMonthly > 0 ? Math.round((totalExpenses/(totalMonthly*0.8))*100) : 0}%</span>
            </div>
            {/* Today's Tasks Card */}
            <div className="bg-white rounded-2xl border border-violet-100/60 p-5 card-shadow card-shadow-hover transition-all cursor-pointer" onClick={() => { setActiveModule('planner'); setPlannerTab('daily'); }}>
              <span className="text-sm font-medium text-gray-500">Today's Tasks</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todayDone}/{quickTasks.length}</p>
              <p className={`text-xs mt-1 ${pendingTasks.length === 0 && quickTasks.length > 0 ? 'text-emerald-500' : pendingTasks.length > 0 ? 'text-amber-500' : 'text-gray-400'}`}>{pendingTasks.length === 0 && quickTasks.length > 0 ? 'All done!' : pendingTasks.length + ' pending'}</p>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full rounded-full bg-violet-500" style={{width: (quickTasks.length > 0 ? Math.round((todayDone/quickTasks.length)*100) : 0) + '%'}}></div>
              </div>
              <span className="text-xs font-semibold text-violet-600 mt-1 inline-block">{quickTasks.length > 0 ? Math.round((todayDone/quickTasks.length)*100) : 0}%</span>
            </div>
          </div>
        </div>

          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Tasks & Delegate */}
            <div className="col-span-2 space-y-6">
              
                    <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-violet-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {I.clock("#3B82F6")}
                                <h3 className="text-sm font-semibold text-gray-900">Today's Schedule</h3>
                                {upcomingBlocks.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">{upcomingBlocks.length} remaining</span>}
                            </div>
                            <button onClick={() => setModal('addTimeBlock')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                        </div>
                        {timeBlocks.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm text-gray-400">No time blocks scheduled</p>
                                <button onClick={() => setModal('addTimeBlock')} className="text-xs text-violet-600 hover:text-violet-700 font-medium mt-2">Add your first block</button>
                            </div>
                        ) : (
                            <div className="divide-y divide-violet-50/50">
                                {timeBlocks.filter(b => !completedTimeBlocks[b.id]).map(b => (
                                    <div key={b.id} className={'px-5 py-3 flex items-center gap-4 group transition ' + (completedTimeBlocks[b.id] ? 'opacity-40 bg-gray-50/50' : 'hover:bg-gray-50/30')}>
                                        <span className="cursor-pointer flex-shrink-0" onClick={() => toggleBlock(b.id)}>
                                            {completedTimeBlocks[b.id] ? I.check("#10B981") : I.circle("#D1D5DB")}
                                        </span>
                                        <div className={'w-2 h-2 rounded-full flex-shrink-0 ' + (catDot[b.cat] || catDot.blue)}></div>
                                        <span className="text-xs font-medium text-gray-400 w-28 flex-shrink-0">{b.time}{b.end ? ' - ' + b.end : ''}</span>
                                        <span className={'text-sm flex-1 ' + (completedTimeBlocks[b.id] ? 'line-through text-gray-400' : 'text-gray-900')}>{b.task}</span>
                                        <button onClick={() => { setEditItem(b); setModal('editTimeBlock'); }} className="p-1 rounded-lg hover:bg-violet-50 transition opacity-0 group-hover:opacity-100">{I.edit("#9CA3AF")}</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {timeBlocks.length > 0 && (
                            <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">{completedBlocks.length}/{timeBlocks.length} completed</span>
                                    <button onClick={() => { setActiveModule('planner'); setPlannerTab('schedule'); }} className="text-xs text-violet-600 hover:text-violet-700 font-medium">View full schedule</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-violet-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {I.zap("#F59E0B")}
                                <h3 className="text-sm font-semibold text-gray-900">Pending Tasks</h3>
                                {pendingTasks.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">{pendingTasks.length}</span>}
                            </div>
                            <button onClick={() => setModal('addTask')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                        </div>
                        {pendingTasks.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-gray-400">{quickTasks.length > 0 ? 'All tasks completed today!' : 'No tasks for today'}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-violet-50/50">
                                {pendingTasks.slice(0, 6).filter(Boolean).map(t => {
                                    const proj = t.projectId ? projects.find(p => p.id === t.projectId) : null;
                                    return (
                                    <div key={t.id} className="px-5 py-3 flex items-center gap-3 group hover:bg-gray-50/30 transition">
                                        <span className="cursor-pointer flex-shrink-0" onClick={() => toggleTask(t.id)}>
                                            {I.circle("#D1D5DB")}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 truncate">{t.task}</p>
                                            {proj && <p className="text-xs text-gray-400 truncate">{proj.name}</p>}
                                            {t.delegatedFrom && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 font-medium">from {t.delegatedFrom}</span>}
                                        </div>
                                        {t.priority === 'high' && <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-medium flex-shrink-0">High</span>}
                                        {t.due && <span className="text-xs text-gray-400 flex-shrink-0">{t.due}</span>}
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                        {pendingTasks.length > 6 && (
                            <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/30 text-center">
                                <button onClick={() => { setActiveModule('planner'); setPlannerTab('daily'); }} className="text-xs text-violet-600 hover:text-violet-700 font-medium">View all {pendingTasks.length} tasks</button>
                            </div>
                        )}
                    </div>
                    {quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).length > 0 && (
                        <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                            <div className="px-5 py-4 border-b border-violet-50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    {I.user("#8B5CF6")}
                                    <h3 className="text-sm font-semibold text-gray-900">Delegated</h3>
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).length}</span>
                                </div>
                            </div>
                            <div className="divide-y divide-violet-50/50">
                                {quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).slice(0, 4).filter(Boolean).map(t => (
                                    <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs flex-shrink-0">{t.delegatedTo.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0,2)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 truncate">{t.task}</p>
                                            <p className="text-xs text-purple-500">{t.delegatedTo}</p>
                                        </div>
                                        {t.due && <span className="text-xs text-gray-400 flex-shrink-0">{t.due}</span>}
                        {t.delegatedFrom && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">from {t.delegatedFrom}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <DelegateLaunchpad supabase={supabase} supaUser={supaUser} userProfile={userProfile} onDelegate={handleDelegate} I={I} />
          {delegatedToMe.filter(t => t.status === 'pending').length > 0 && (
                        <div className="bg-white rounded-xl border border-purple-200 card-shadow overflow-hidden">
                            <div className="px-5 py-4 border-b border-purple-50 flex items-center justify-between bg-purple-50/30">
                                <div className="flex items-center gap-2.5">
                                    {I.inbox ? I.inbox("#8B5CF6") : I.user("#8B5CF6")}
                                    <h3 className="text-sm font-semibold text-purple-900">Assigned to Me</h3>
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{delegatedToMe.filter(t => t.status === 'pending').length}</span>
                                </div>
                            </div>
                            <div className="divide-y divide-purple-50">
                                {delegatedToMe.filter(t => t.status === 'pending').slice(0, 5).filter(Boolean).map(t => (
                                    <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs flex-shrink-0">{t.delegator_name ? t.delegator_name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0,2) : '?'}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 truncate">{t.task_text}</p>
                                            <p className="text-xs text-purple-500">from {t.delegator_name}</p>
                                        </div>
                                        <button onClick={() => setAcceptingTask(t)} className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition">Accept</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                
            </div>
            {/* Right Column - Projects, Calendar, Goals, Reminders */}
            <div className="col-span-1 space-y-5">
              <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-violet-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {I.bulb("#8B5CF6")}
                                <h3 className="text-sm font-semibold text-gray-900">Active Projects</h3>
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{activeProjects.length}</span>
                            </div>
                            <button onClick={() => setActiveModule('income')} className="text-xs text-violet-600 hover:text-violet-700 font-medium">View all</button>
                        </div>
                        {activeProjects.length === 0 ? (
                            <div className="p-6 text-center"><p className="text-sm text-gray-400">No active projects</p></div>
                        ) : (
                            <div className="divide-y divide-violet-50/50">
                                {[...activeProjects].sort((a, b) => (getProjectProgress(b.id) || 0) - (getProjectProgress(a.id) || 0)).slice(0, 5).filter(Boolean).map(p => {
                                    const prog = getProjectProgress(p.id) || 0;
                                    return (
                                    <div key={p.id} className="px-5 py-3 hover:bg-gray-50/30 transition cursor-pointer" onClick={() => { setEditItem(p); setModal('editProject'); }}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{prog}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-violet-500 rounded-full transition-all" style={{width: prog + '%'}}></div></div>
                                        {(() => { const pExp = safe(expenses).filter(e => (e.project_id || e.projectId) === p.id); const total = pExp.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0); return total > 0 ? <div className="flex items-center justify-between mt-1"><span className="text-xs text-gray-400">Expenses</span><span className="text-xs font-medium text-red-500">{I.receipt("#EF4444")} {fmt(total)}</span></div> : null; })()}
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-violet-100/60 card-shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-violet-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {I.calendar("#7C3AED")}
                    <h3 className="text-sm font-semibold text-gray-900">Calendar</h3>
                  </div>
                  <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', {month:'short', year:'numeric'})}</span>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1 mb-3">
                    {(() => { const today = new Date(); const dow = today.getDay(); const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; return days.filter(Boolean).map((d, i) => { const dt = new Date(today); dt.setDate(today.getDate() - dow + i); const isT = dt.toDateString() === today.toDateString(); const hasE = timeBlocks.some(b => b.date === dt.toISOString().split('T')[0]); return (<div key={i} className={`flex-1 flex flex-col items-center py-1.5 rounded-lg ${isT ? 'bg-violet-500 text-white' : 'hover:bg-gray-50'}`}><span className={`text-xs ${isT ? 'text-violet-200' : 'text-gray-400'}`}>{d.substring(0,2)}</span><span className={`text-sm font-medium ${isT ? 'text-white' : 'text-gray-700'}`}>{dt.getDate()}</span>{hasE && !isT && <span className="w-1 h-1 rounded-full bg-violet-400 mt-0.5"></span>}</div>); }); })()}
                  </div>
                  {timeBlocks.filter(b => b.date === new Date().toISOString().split('T')[0]).slice(0, 2).filter(Boolean).map((b, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-t border-gray-50">
                      <div className="w-1 h-8 rounded-full bg-violet-400"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{b.title}</p>
                        <p className="text-xs text-gray-400">{b.startTime} - {b.endTime}</p>
                      </div>
                    </div>
                  ))}
                  {timeBlocks.filter(b => b.date === new Date().toISOString().split('T')[0]).length === 0 && <p className="text-xs text-gray-400 text-center py-2">No appointments today</p>}
                </div>
              </div>
              {/* My Goals */}
              <div className="bg-white rounded-2xl border border-violet-100/60 card-shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-violet-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {I.bulb("#7C3AED")}
                    <h3 className="font-semibold text-gray-800 text-sm">My Goals</h3>
                    <span className="text-xs text-gray-400 ml-1">{(() => { const d = new Date(); return d.toLocaleString('default', { month: 'long', year: 'numeric' }); })()}</span>
                  </div>
                  <button onClick={() => setModal('addGoal')} className="text-xs text-violet-500 hover:text-violet-700 font-medium">+ Add</button>
                </div>
                <div className="px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
                  {safe(weeklyPlan).length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">No goals yet. Tap + Add to set your first goal.</div>
                  ) : safe(weeklyPlan).filter(Boolean).map((goal, i) => {
                    const isDone = completedWeekly[goal.id];
                    const proj = safe(activeProjects).find(p => p.id === goal.projectId);
                    return (<div key={goal.id || i} className={"flex items-start gap-3 p-2 rounded-xl hover:bg-violet-50/40 transition-colors " + (isDone ? "opacity-60" : "")}>
                      <button onClick={() => setCompletedWeekly(prev => ({...prev, [goal.id]: !prev[goal.id]}))} className={"mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 " + (isDone ? "bg-violet-500 border-violet-500" : "border-gray-300 hover:border-violet-400")}>
                        {isDone && I.check("#fff")}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={"text-sm font-medium " + (isDone ? "line-through text-gray-400" : "text-gray-800")}>{goal.title || goal.task || goal.text}</p>
                        {goal.text && goal.title && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{goal.text}</p>}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {proj && <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{proj.name}</span>}
                          {goal.deadline && <span className="text-xs text-gray-400">{I.calendar("#9CA3AF")} {goal.deadline}</span>}
                          {goal.delegatedTo && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{goal.delegatedTo}</span>}
                        </div>
                      </div>
                      <button onClick={() => { setEditItem(goal); setModal('editWeekly'); }} className="text-gray-300 hover:text-violet-500 flex-shrink-0 mt-1">{I.edit("#D1D5DB")}</button>
                    </div>);
                  })}
                </div>
              </div>
              {/* Reminders */}
              <div className="bg-white rounded-2xl border border-violet-100/60 card-shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-violet-50 flex items-center gap-2">
                  {I.bell("#7C3AED")}
                  <h3 className="text-sm font-semibold text-gray-900">Reminders</h3>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {quickTasks.filter(t => !completedTasks[t.id]).slice(0, 3).filter(Boolean).map((task, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <p className="text-sm text-gray-700 truncate flex-1">{task.text}</p>
                      {task.due && <span className="text-xs text-gray-400">{task.due}</span>}
                    </div>
                  ))}
                  {quickTasks.filter(t => !completedTasks[t.id]).length === 0 && <p className="text-xs text-gray-400 text-center py-2">All caught up!</p>}
                </div>
              </div>
            </div>
          </div>
          {/* End of Day Report */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-violet-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center text-white text-lg font-bold">R</div>
                    <div><h3 className="text-sm font-semibold text-gray-800">End of Day Report</h3><p className="text-xs text-gray-500">Review progress and download PDF</p></div>
                </div>
                <button onClick={() => setShowEodReport(true)} className="px-4 py-2 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white text-sm font-medium rounded-lg hover:opacity-90 transition">Generate Report</button>
            </div>
        </div>
      );
    };

  const IncomeModule = () => {
        const expensesByCategory = useMemo(() => {
            const cats = {};
            expenses.forEach(e => {
                const monthly = e.frequency === 'Weekly' ? e.amount * 4.33 : e.frequency === 'Quarterly' ? e.amount / 3 : e.frequency === 'Annual' ? e.amount / 12 : e.frequency === 'One-time' ? 0 : e.amount;
                cats[e.category] = (cats[e.category] || 0) + monthly;
            });
            return Object.entries(cats).sort((a, b) => b[1] - a[1]);
        }, [expenses]);

        const expensesByStream = useMemo(() => {
            const map = {};
            expenses.forEach(e => {
                if (e.linkedStreamId) {
                    if (!map[e.linkedStreamId]) map[e.linkedStreamId] = [];
                    map[e.linkedStreamId].push(e);
                }
            });
            return map;
        }, [expenses]);

        const catIcons = { 'Salary': '💰', 'Rent': '🏠', 'Operations': '&₦️', 'Marketing': '📣', 'Software': '💻', 'Transport': '🚗', 'Utilities': '&₦', 'Tax': '📋', 'Other': '📌' };

        return (
        <div className="space-y-8 max-w-6xl">
            <div className="grid grid-cols-5 gap-4">
                <MetricCard label="Monthly Income" value={fmtNaira(totalMonthly)} sub={incomeStreams.length + ' streams'} trend={1} icon={I.trending("#10B981")} />
                <MetricCard label="Monthly Expenses" value={fmtNaira(totalExpenses)} sub={expenses.length + ' items'} trend={-1} icon={I.receipt("#EF4444")} />
                <MetricCard label="Net Income" value={fmtNaira(netMonthly)} sub={netMonthly >= 0 ? 'Healthy' : 'Deficit'} trend={netMonthly >= 0 ? 1 : -1} icon={I.wallet(netMonthly >= 0 ? "#10B981" : "#EF4444")} />
                <MetricCard label="Annual Projected" value={fmtNaira(totalMonthly * 12)} sub={fmtNaira(netMonthly * 12) + ' net/yr'} trend={netMonthly >= 0 ? 1 : -1} icon={I.bar("#8B5CF6")} />
                <MetricCard label="Next Payment" value={nextPaymentDue ? new Date(nextPaymentDue.nextPayment).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : '--'} sub={nextPaymentDue ? nextPaymentDue.name : 'No dates set'} trend={0} icon={I.calendar("#3B82F6")} />
            </div>

            {/* Incoming Payments */}
            {incomingPayments.filter(p => p.status === 'pending').length > 0 && <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <h3 className="text-sm font-semibold text-amber-900">Incoming Payments</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{incomingPayments.filter(p => p.status === 'pending').length} pending</span>
                </div>
                <div className="divide-y divide-amber-100">
                    {incomingPayments.filter(p => p.status === 'pending').map(tag => <div key={tag.id} className="px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-sm font-bold text-amber-700">{(tag.sender_name || '?').charAt(0).toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{tag.sender_name} tagged you</p>
                            <p className="text-xs text-gray-500">{String.fromCharCode(8358)}{Number(tag.amount).toLocaleString()} {String.fromCharCode(183)} {tag.payment_type} {String.fromCharCode(183)} {tag.frequency}{tag.company_name ? ' ' + String.fromCharCode(183) + ' ' + tag.company_name : ''}</p>
                            {tag.note && <p className="text-xs text-gray-400 mt-0.5">{tag.note}</p>}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => acceptPaymentTag(tag)} className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">Accept</button>
                            <button onClick={() => declinePaymentTag(tag)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition">Decline</button>
                        </div>
                    </div>)}
                </div>
            </div>}

            {/* Accepted Payments */}
            {incomingPayments.filter(p => p.status === 'accepted').length > 0 && <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 mb-2">
                <p className="text-xs font-medium text-emerald-600 mb-2">Recently Accepted Payments</p>
                <div className="space-y-2">
                    {incomingPayments.filter(p => p.status === 'accepted').slice(0, 3).filter(Boolean).map(tag => <div key={tag.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>{String.fromCharCode(8358)}{Number(tag.amount).toLocaleString()} {tag.payment_type} from {tag.sender_name}</span>
                    </div>)}
                </div>
            </div>}

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Income Streams</h2>
                    <button onClick={() => setModal('addIncome')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                </div>
                {incomeStreams.length === 0 ? (
                    <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                        <Empty icon={I.dollar("#9CA3AF")} title="No income streams yet" sub="Add your first income stream to start tracking" action={() => setModal('addIncome')} actionLabel="Add Income Stream" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {incomeStreams.filter(Boolean).map(s => (
                            <div key={s.id} className="bg-white rounded-xl border border-violet-100/60 p-5 card-shadow card-shadow-hover transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedIncome(expandedIncome === s.id ? null : s.id)}>
                                        <div className={'w-2 h-12 rounded-full ' + (s.status === 'Growing' ? 'bg-blue-400' : s.status === 'At Risk' ? 'bg-red-300' : 'bg-emerald-400')}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                                            {(s.role || s.company) && <p className="text-xs text-gray-400 mt-0.5">{s.role}{s.role && s.company ? '  " ' : ''}{s.company}</p>}
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                <span className={'text-xs px-2 py-0.5 rounded-full ' + (s.type === 'Active' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-500')}>{s.type}</span>
                                                <span className={'text-xs px-2 py-0.5 rounded-full ' + (statusColors[s.status] || 'bg-gray-100 text-gray-600')}>{s.status}</span>
                                                {s.paymentCycle && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s.paymentCycle}</span>}
                                                {s.nextPayment && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Due {new Date(s.nextPayment).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {s.trend && <Spark data={s.trend} />}
                                        <div className="text-right">
                                            <p className="text-xl font-semibold text-gray-900">{fmtNaira(s.monthly)}</p>
                                            {expensesByStream[s.id] && <p className="text-xs text-red-500 mt-0.5">-{fmtNaira(expensesByStream[s.id].reduce((t,e) => t + e.amount, 0))} expenses</p>}
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); setEditItem(s); setModal('editIncome'); }} className="p-1.5 rounded-lg hover:bg-violet-50 transition">{I.edit("#9CA3AF")}</button>
                                    </div>
                                </div>
                            {s.payments && s.payments.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Payment Progress</span>
                                        <span className="text-xs text-gray-500">{s.payments.filter(p => p.paid).length}/{s.payments.length} paid</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                        <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{width: Math.round(s.payments.filter(p => p.paid).length / s.payments.length * 100) + '%'}}></div>
                                    </div>
                                    <div className="space-y-1">
                                        {s.payments.filter(Boolean).map(pm => (
                                            <div key={pm.id} className={"flex items-center justify-between text-xs px-2 py-1 rounded " + (pm.paid ? "text-green-700 bg-green-50" : "text-gray-600 bg-gray-50")}>
                                                <div className="flex items-center gap-2">
                                                    <span>{pm.paid ? "\u2713" : "\u25CB"}</span>
                                                    <span className={pm.paid ? "line-through" : ""}>{pm.label || 'Payment'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {pm.amount > 0 && <span className="font-medium">{fmtNaira(pm.amount)}</span>}
                                                    {pm.dueDate && !pm.paid && <span className="text-amber-600">Due {new Date(pm.dueDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
                                                    {pm.paid && pm.paidDate && <span className="text-green-600">Paid {new Date(pm.paidDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {s.payments.some(p => !p.paid) && (
                                        <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 rounded px-2 py-1">
                                            Balance remaining: {fmtNaira(s.payments.filter(p => !p.paid).reduce((t, p) => t + (p.amount || 0), 0))}
                                        </div>
                                    )}
                                </div>
                            )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Expenses</h2>
                    <button onClick={() => setModal('addExpense')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                </div>
                {expenses.length === 0 ? (
                    <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                        <Empty icon={I.receipt("#9CA3AF")} title="No expenses tracked yet" sub="Add expenses to see your net income" action={() => setModal('addExpense')} actionLabel="Add Expense" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {totalExpenses > 0 && (
                            <div className="bg-white rounded-xl border border-violet-100/60 card-shadow p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Monthly Breakdown</p>
                                    <p className="text-sm font-semibold text-gray-900">{fmtNaira(totalExpenses)}/mo</p>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full flex overflow-hidden mb-3">
                                    {expensesByCategory.filter(Boolean).map(([cat, amt], i) => {
                                        const colors = ['bg-red-400','bg-orange-400','bg-amber-400','bg-blue-400','bg-purple-400','bg-pink-400','bg-teal-400','bg-indigo-400','bg-gray-400'];
                                        return <div key={cat} className={colors[i % colors.length] + ' h-full'} style={{width: (amt / totalExpenses * 100) + '%'}} title={cat + ': ' + fmtNaira(amt)}></div>;
                                    })}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {expensesByCategory.filter(Boolean).map(([cat, amt], i) => {
                                        const dots = ['bg-red-400','bg-orange-400','bg-amber-400','bg-blue-400','bg-purple-400','bg-pink-400','bg-teal-400','bg-indigo-400','bg-gray-400'];
                                        return <div key={cat} className="flex items-center gap-1.5"><div className={'w-2 h-2 rounded-full ' + dots[i % dots.length]}></div><span className="text-xs text-gray-500">{cat}</span><span className="text-xs font-medium text-gray-700">{fmtNaira(amt)}</span></div>;
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            {expenses.filter(Boolean).map(e => {
                                const linked = e.linkedStreamId ? incomeStreams.find(s => s.id === e.linkedStreamId) : null;
                                const dueDateObj = e.dueDate ? new Date(e.dueDate + 'T00:00:00') : null;
                                const today = new Date(); today.setHours(0,0,0,0);
                                const daysUntilDue = dueDateObj ? Math.ceil((dueDateObj - today) / 86400000) : null;
                                const dueColor = daysUntilDue !== null ? (daysUntilDue < 0 ? 'text-red-500' : daysUntilDue <= 3 ? 'text-amber-500' : 'text-gray-400') : '';
                                const dueLabel = daysUntilDue !== null ? (daysUntilDue < 0 ? 'Overdue' : daysUntilDue === 0 ? 'Due today' : daysUntilDue === 1 ? 'Due tomorrow' : daysUntilDue <= 7 ? 'Due in ' + daysUntilDue + ' days' : dueDateObj.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})) : '';
                                return (
                                <div key={e.id} className={'bg-white rounded-xl border px-5 py-4 card-shadow card-shadow-hover transition-all ' + (daysUntilDue !== null && daysUntilDue < 0 ? 'border-red-200' : daysUntilDue !== null && daysUntilDue <= 3 ? 'border-amber-200' : 'border-gray-100')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-lg flex-shrink-0" role="img">{catIcons[e.category] || '📌'}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{e.name}</p>
                                                <div className="flex gap-2 mt-0.5 flex-wrap">
                                                    <span className="text-xs text-gray-400">{e.category}</span>
                                                    <span className="text-xs text-gray-300"> "</span>
                                                    <span className="text-xs text-gray-400">{e.frequency}</span>
                                                    {linked && <><span className="text-xs text-gray-300"> "</span><span className="text-xs text-violet-600">from {linked.name}</span></>}
                                                    {e.dueDate && <><span className="text-xs text-gray-300"> "</span><span className={'text-xs font-medium ' + dueColor}>{dueLabel}</span></>}
                                                    {e.note && <><span className="text-xs text-gray-300"> "</span><span className="text-xs text-gray-400 italic">{e.note}</span></>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <p className="text-lg font-semibold text-red-600">-{fmtNaira(e.amount)}</p>
                                            <button onClick={() => { setEditItem(e); setModal('editExpense'); }} className="p-1.5 rounded-lg hover:bg-violet-50 transition">{I.edit("#9CA3AF")}</button>
                                        </div>
                                    </div>
                                        {/* Payment Tag Badges */}
                                        {paymentTags.filter(t => t.expense_id === String(e.id)).length > 0 && <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-50">
                                            <span className="text-xs text-gray-400 mr-1">Tagged:</span>
                                            {paymentTags.filter(t => t.expense_id === String(e.id)).filter(Boolean).map(t => <span key={t.id} className={"text-xs px-2 py-0.5 rounded-full font-medium " + (t.status === 'accepted' ? "bg-emerald-50 text-emerald-600" : t.status === 'declined' ? "bg-gray-100 text-gray-400 line-through" : "bg-amber-50 text-amber-600")}>{t.status === 'accepted' ? String.fromCharCode(10003) : t.status === 'declined' ? String.fromCharCode(10007) : String.fromCharCode(9203)} @{t.recipient_username}</span>)}
                                        </div>}
                                
                                  {e.entries && e.entries.length > 0 && (
                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{e.entries.length} {e.entries.length === 1 ? 'Entry' : 'Entries'}</span>
                                        <span className="text-xs font-bold text-gray-700">{(() => { try { return new Intl.NumberFormat('en-NG', {style:'currency',currency:'NGN'}).format(e.entries.reduce((s,en) => s + (parseFloat(en.amount)||0), 0)); } catch(err) { return e.entries.reduce((s,en) => s + (parseFloat(en.amount)||0), 0); } })()}</span>
                                      </div>
                                      {e.entries.map((en, idx) => (
                                        <div key={en.id || idx} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                          <div className="flex items-center gap-2">
                                            <span className={"w-2 h-2 rounded-full flex-shrink-0 " + (en.paid ? "bg-green-400" : "bg-orange-400")}></span>
                                            <span className={"text-xs " + (en.paid ? "line-through text-gray-400" : "text-gray-700")}>{en.label || 'Untitled'}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {en.date && <span className="text-xs text-gray-400">{en.date}</span>}
                                            <span className={"text-xs font-medium " + (en.paid ? "text-gray-400" : "text-gray-700")}>{(() => { try { return new Intl.NumberFormat('en-NG', {style:'currency',currency:'NGN'}).format(parseFloat(en.amount)||0); } catch(err) { return en.amount; } })()}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}</div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Active Projects</h2>
                    <button onClick={() => setModal('addProject')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                </div>
                {projects.length === 0 ? (
                    <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                        <Empty icon={I.bar("#9CA3AF")} title="No projects yet" sub="Add your first project to start tracking progress" action={() => setModal('addProject')} actionLabel="Add Project" />
                    </div>
                ) : (<>
                    {sharedProjects.length > 0 && <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Projects Shared With You</h3>
              <div className="grid grid-cols-3 gap-4">
                {sharedProjects.filter(Boolean).map(function(sp, si) {
                  var snap = sp.project_snapshot || {};
                  var tasksArr = sp.tasks_snapshot || [];
                  var myTasks = tasksArr.filter(function(t) { return t.delegatedTo && userProfile && t.delegatedTo.toLowerCase().includes(userProfile.username); });
                  var completedIds = (sp.completions || []).filter(Boolean).map(function(tc) { return tc.task_id; });
                  var statusColor = snap.status === 'In Progress' ? 'text-violet-700 bg-violet-50' : snap.status === 'Planning' ? 'text-yellow-600 bg-yellow-50' : snap.status === 'Completed' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
                  return <div key={si} className="bg-white rounded-xl border border-indigo-100 p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{snap.name || 'Project'}</h4>
                      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + statusColor}>{snap.status || 'Active'}</span>
                    </div>
                    {snap.desc && <p className="text-xs text-gray-500 mb-2">{snap.desc.substring(0, 100)}</p>}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{width: (snap.progress || 0) + '%'}}></div></div>
                      <span className="text-xs text-gray-400 font-medium">{snap.progress || 0}%</span>
                    </div>
                    {sp.owner && <p className="text-xs text-gray-400 mb-2">Owner: {sp.owner.full_name}</p>}
                    {sp.members && sp.members.length > 0 && <div className="flex -space-x-1 mb-3">{sp.members.slice(0, 6).filter(Boolean).map(function(mem, mi) { return mem.avatar_url ? <img key={mi} src={mem.avatar_url} className="w-6 h-6 rounded-full border-2 border-white object-cover" title={mem.full_name} /> : <div key={mi} className="w-6 h-6 rounded-full bg-indigo-400 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white" title={mem.full_name}>{mem.initials || '?'}</div>; })}</div>}
                    {myTasks.length > 0 && <div className="border-t pt-2 mt-2"><p className="text-xs font-semibold text-indigo-600 mb-1">Your Tasks ({myTasks.length})</p>{myTasks.slice(0, 4).filter(Boolean).map(function(t, ti) { var taskKey = (t.type || 'task') + '_' + (t.id || ti); var isDone = completedIds.includes(taskKey); return <div key={ti} className="flex items-center gap-2 py-0.5"><button onClick={function() { if (isDone) return; supabase.from('shared_task_completions').insert({ project_owner_id: sp.project_owner_id, project_local_id: sp.project_local_id, task_id: taskKey, completed_by: supaUser.id }).then(function() { fetchSharedProjects(); }); }} className={"w-4 h-4 rounded border flex items-center justify-center text-xs " + (isDone ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-indigo-400 cursor-pointer")}>{isDone && '\u2713'}</button><span className={"text-xs " + (isDone ? "text-gray-400 line-through" : "text-gray-700")}>{t.task || t.task_text || 'Task'}</span></div>; })}</div>}
                    {myTasks.length === 0 && <p className="text-xs text-gray-400 italic">No tasks assigned to you yet</p>}
                  </div>;
                })}
              </div>
            </div>}
            <div className="grid grid-cols-3 gap-4">
                        {[...projects].sort((a, b) => { const getLatest = (proj) => { const wIds = weeklyPlan.filter(w => w.projectId === proj.id).map(w => w.id); const tIds = quickTasks.filter(t => t.projectId === proj.id).map(t => t.id); let latest = 0; wIds.forEach(id => { const v = completedWeekly[id]; if (v && typeof v === "number" && v > latest) latest = v; else if (v === true && latest === 0) latest = 1; }); tIds.forEach(id => { const v = completedTasks[id]; if (v && typeof v === "number" && v > latest) latest = v; else if (v === true && latest === 0) latest = 1; }); return latest; }; return getLatest(b) - getLatest(a); }).filter(Boolean).map(p => {
                            const autoP = getProjectProgress(p.id);
                            const displayProgress = autoP !== null ? autoP : p.progress;
                            const linkedCount = weeklyPlan.filter(w => w.projectId === p.id).length + quickTasks.filter(t => t.projectId === p.id).length;
                            return (
                            <div key={p.id} className="bg-white rounded-xl border border-violet-100/60 p-5 card-shadow card-shadow-hover transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <span className={'text-xs px-2 py-0.5 rounded-full ' + (statusColors[p.status] || 'bg-gray-100 text-gray-600')}>{p.status}</span>
                                        <button onClick={() => { setEditItem(p); setModal('editProject'); }} className="p-1 rounded-lg hover:bg-violet-50 transition ml-1">{I.edit("#9CA3AF")}</button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mb-4">{p.desc}</p>
                                <div className="mb-3">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-xs text-gray-400">{displayProgress}%</span>
                                        <span className="text-xs text-gray-400">{linkedCount > 0 ? linkedCount + ' linked tasks' : p.team + ' people'}</span>

                    {p.teamMembers && p.teamMembers.length > 0 && (() => { const resolved = p.teamMembers.filter(Boolean).map(tm => { if (typeof tm === "object") return tm; const prof = allProfiles.find(pr => pr.username && pr.username.toLowerCase() === (tm || "").toLowerCase()); return prof ? { avatar_url: prof.avatar_url, full_name: prof.full_name || prof.username, initials: prof.initials || (prof.full_name || prof.username || "?").split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0,2) } : { avatar_url: null, full_name: tm, initials: (tm || "?").slice(0,2).toUpperCase() }; }); return <div className="flex -space-x-1 mt-2">{resolved.slice(0, 5).filter(Boolean).map(function(m, ti) { return m.avatar_url ? <img key={ti} src={m.avatar_url} className="w-6 h-6 rounded-full border-2 border-white object-cover" title={m.full_name} /> : <div key={ti} className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white" title={m.full_name}>{m.initials}</div>; })}{resolved.length > 5 && <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-[10px] font-bold border-2 border-white">+{resolved.length - 5}</div>}</div>; })()}                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className={'h-full rounded-full transition-all ' + (autoP !== null ? 'bg-violet-500' : 'bg-blue-300')} style={{width: displayProgress + '%'}}></div></div>
                                </div>
                                {(() => {
                                  const linked = [...(weeklyPlan || []).filter(t => t.project === p.id && !completedWeekly[t.id]), ...(quickTasks || []).filter(t => t.project === p.id && !completedTasks[t.id])];
                                  linked.sort((a, b) => {
                                    if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
                                    if (a.deadline) return -1;
                                    if (b.deadline) return 1;
                                    return (b.important ? 1 : 0) - (a.important ? 1 : 0);
                                  });
                                  const next = linked[0];
                                  return next ? <p className="text-xs text-violet-700 font-medium mt-2">Next: {next.text || next.task}{next.deadline ? ' (' + new Date(next.deadline).toLocaleDateString() + ')' : ''}</p> : null;
                                })()}
                                {p.launch && <p className="text-xs text-gray-400 mt-1">Launch: {new Date(p.launch).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}</p>}
                            </div>
                            );
                        })}
                    </div>
                </>)}
            </div>
        </div>
        );
    };

    const BoardroomModule = () => {
    const [reminderMsg, setReminderMsg] = useState(null);

    const taskHistory = JSON.parse(localStorage.getItem('nuop_taskHistory') || '[]');
    
    // Use delegatedByMe from Supabase (the full list of tasks YOU delegated)
    const allDelegated = delegatedByMe || [];
    
    // Build memberList from ALL profiles (auto-populated from Supabase)
    const memberList = allProfiles.filter(Boolean).map(prof => {
      const key = prof.username.toLowerCase();
      const memberTasks = allDelegated.filter(d => (d.recipient_username || '').toLowerCase() === key);
      const assigned = memberTasks.length;
      const completed = memberTasks.filter(d => d.status === 'completed').length;
      const accepted = memberTasks.filter(d => d.status === 'accepted').length;
      const pending = memberTasks.filter(d => d.status === 'pending');
      const memberProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.includes(prof.username));
      return {
        name: prof.full_name || prof.username,
        key,
        avatar_url: prof.avatar_url,
        assigned,
        completed,
        accepted,
        pending,
        projectCount: memberProjects.length,
        completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0
      };
    }).sort((a, b) => b.completed - a.completed || b.assigned - a.assigned);

    const [leaderboardProject, setLeaderboardProject] = useState('all');
    const [eomDismissed, setEomDismissed] = useState(false);

    const eomNow = new Date();
    const monthStart = new Date(eomNow.getFullYear(), eomNow.getMonth(), 1).toISOString();
    const monthlyDelegated = allDelegated.filter(d => d.status === 'completed' && d.created_at >= monthStart);
    const monthlyStats = allProfiles.filter(Boolean).map(prof => {
      const key = prof.username.toLowerCase();
      const monthTasks = monthlyDelegated.filter(d => (d.recipient_username || '').toLowerCase() === key);
      return { name: prof.full_name || prof.username, key, avatar_url: prof.avatar_url, initials: prof.initials || (prof.full_name || prof.username).split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2), completed: monthTasks.length };
    }).filter(m => m.completed > 0).sort((a, b) => b.completed - a.completed);
    const employeeOfMonth = monthlyStats.length > 0 ? monthlyStats[0] : null;

    const projectsWithMembers = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.length > 0);

    const leaderboardList = leaderboardProject === 'all' ? memberList.filter(m => m.completed > 0 || m.assigned > 0) : memberList.filter(m => {
      const proj = projects.find(p => String(p.id) === String(leaderboardProject));
      return proj && Array.isArray(proj.teamMembers) && proj.teamMembers.includes(m.key);
    });
    
    const totalAssigned = allDelegated.length;
    const totalCompleted = allDelegated.filter(d => d.status === 'completed').length;
    const totalPending = allDelegated.filter(d => d.status !== 'completed').length;
    const totalAccepted = allDelegated.filter(d => d.status === 'accepted').length;
    const avgRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    const topContributor = memberList.find(m => m.completed > 0) || (memberList.length > 0 ? memberList[0] : null);
    
    // All pending tasks sorted by deadline (nearest first)
    const allPendingTasks = allDelegated.filter(d => d.status !== 'completed').sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
    
    const maxAssigned = Math.max(...memberList.filter(Boolean).map(m => m.assigned), 1);
    
    // Unique team members count - use allProfiles directly
    const uniqueMembers = new Set();
    allProfiles.forEach(p => uniqueMembers.add(p.username));
    teamMembers.forEach(tm => uniqueMembers.add(tm.name.trim().toLowerCase()));
    memberList.forEach(m => uniqueMembers.add(m.key));
    // Activity heatmap: last 12 weeks
    const weeks = [];
    const now = new Date();
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7));
      const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      let count = 0;
      taskHistory.forEach(day => {
        const d = new Date(day.date);
        const diff = Math.floor((weekStart - d) / 86400000);
        if (diff >= 0 && diff < 7) count += (day.tasks ? day.tasks.length : 0);
      });
      weeks.push({ label: weekLabel, count });
    }
    const maxWeekCount = Math.max(...weeks.filter(Boolean).map(w => w.count), 1);


    // Determine if current user is admin (has local projects) or team member
    const isAdmin = projects.length > 0;
    
    // Team member view: personal dashboard
    if (!isAdmin) {
        const myTasks = delegatedToMe || [];
        const myPending = myTasks.filter(t => t.status === 'pending');
        const myAccepted = myTasks.filter(t => t.status === 'accepted');
        const myCompleted = myTasks.filter(t => t.status === 'completed');
        const myTotal = myTasks.length;
        const myRate = myTotal > 0 ? Math.round((myCompleted.length / myTotal) * 100) : 0;
        
        return (<div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Your personal productivity overview</p></div>
                <button onClick={() => setShowEodReport(true)} className="px-4 py-2 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white text-sm font-medium rounded-xl hover:opacity-90 transition">EOD Report</button></div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
                    <div className="flex items-center gap-2 mb-2">{I.clipboard("#3B82F6")}<p className="text-xs text-gray-500">Total Assigned</p></div>
                    <p className="text-2xl font-bold text-gray-900">{myTotal}</p>
                    <p className="text-xs text-gray-400">{myPending.length} pending, {myAccepted.length} active</p></div>
                <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
                    <div className="flex items-center gap-2 mb-2">{I.check("#10B981")}<p className="text-xs text-gray-500">Completed</p></div>
                    <p className="text-2xl font-bold text-emerald-600">{myCompleted.length}</p></div>
                <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
                    <div className="flex items-center gap-2 mb-2">{I.trending("#F59E0B")}<p className="text-xs text-gray-500">Completion Rate</p></div>
                    <p className="text-2xl font-bold text-gray-900">{myRate}%</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2"><div className="bg-emerald-500 h-2 rounded-full transition-all" style={{width: myRate + '%'}}></div></div></div>
                <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
                    <div className="flex items-center gap-2 mb-2">{I.clock("#8B5CF6")}<p className="text-xs text-gray-500">Active Tasks</p></div>
                    <p className="text-2xl font-bold text-purple-600">{myAccepted.length}</p></div>
            </div>
            
            {myAccepted.length > 0 && (
            <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Active Tasks</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tasks you have accepted and are working on</p></div>
                <div className="divide-y divide-violet-50/50">{myAccepted.filter(Boolean).map((d, i) => (
                    <div key={d.id || i} className="px-5 py-3 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{d.task_text}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">From: {d.delegator_name}</span>
                                {d.deadline && <span className="text-xs text-gray-400">Due: {new Date(d.deadline).toLocaleDateString()}</span>}
                            </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">accepted</span>
                    </div>
                ))}</div>
            </div>)}
            
            {myPending.length > 0 && (
            <div className="bg-white rounded-xl border border-purple-200 card-shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-purple-50 bg-purple-50/30"><h2 className="text-base font-semibold text-purple-900">Pending Acceptance</h2>
                <p className="text-xs text-purple-400 mt-0.5">Tasks waiting for you to accept</p></div>
                <div className="divide-y divide-purple-50">{myPending.filter(Boolean).map((d, i) => (
                    <div key={d.id || i} className="px-5 py-3 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{d.task_text}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">From: {d.delegator_name}</span>
                                {d.deadline && <span className="text-xs text-gray-400">Due: {new Date(d.deadline).toLocaleDateString()}</span>}
                            </div>
                        </div>
                        <button onClick={() => setAcceptingTask(d)} className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium">Accept</button>
                    </div>
                ))}</div>
            </div>)}
            
            {myCompleted.length > 0 && (
            <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Completed</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tasks you have finished</p></div>
                <div className="divide-y divide-violet-50/50">{myCompleted.slice(0, 10).filter(Boolean).map((d, i) => (
                    <div key={d.id || i} className="px-5 py-3 flex items-center gap-3 opacity-70">
                        {I.check("#10B981")}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 line-through">{d.task_text}</p>
                            <span className="text-xs text-gray-400">From: {d.delegator_name}</span>
                        </div>
                    </div>
                ))}</div>
            </div>)}
        </div>);
    }
    
    // Admin view below
    return (<div className="space-y-6 max-w-5xl">
        {reminderMsg && <div style={{position:'fixed',top:20,right:20,zIndex:9999,background:'#10b981',color:'white',padding:'12px 24px',borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.15)',fontWeight:500,fontSize:14,animation:'fadeIn 0.3s'}}>{reminderMsg}</div>}

        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-gray-900">Boardroom</h1>
            <p className="text-sm text-gray-500 mt-1">Team productivity overview</p></div></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.user("#6366F1")}<p className="text-xs text-gray-500">Team Members</p></div>
            <p className="text-2xl font-bold text-gray-900">{uniqueMembers.size}</p></div>
          <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.trending("#F59E0B")}<p className="text-xs text-gray-500">Top Contributor</p></div>
            <p className="text-lg font-bold text-gray-900 truncate">{topContributor ? topContributor.name : '-'}</p>
            {topContributor && <p className="text-xs text-gray-400">{topContributor.completed} completed</p>}</div>
          <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.clipboard("#3B82F6")}<p className="text-xs text-gray-500">Total Delegated</p></div>
            <p className="text-2xl font-bold text-gray-900">{totalAssigned}</p>
            <p className="text-xs text-gray-400">{totalPending} pending, {totalAccepted} accepted, {totalCompleted} done</p></div>
          <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.check("#10B981")}<p className="text-xs text-gray-500">Avg Completion Rate</p></div>
            <p className="text-2xl font-bold text-gray-900">{avgRate}%</p></div>
        </div>
        {employeeOfMonth && !eomDismissed && (
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl border border-amber-200 p-6 card-shadow relative overflow-hidden">
            <button onClick={() => setEomDismissed(true)} className="absolute top-3 right-3 text-amber-400 hover:text-amber-600 text-sm">Dismiss</button>
            <div className="flex items-center gap-4">
              <div className="relative">
                {employeeOfMonth.avatar_url ? <img src={employeeOfMonth.avatar_url} className="w-20 h-20 rounded-full object-cover border-4 border-amber-300 shadow-lg" /> : <div className="w-20 h-20 rounded-full bg-amber-200 flex items-center justify-center text-2xl font-bold text-amber-700 border-4 border-amber-300">{employeeOfMonth.initials}</div>}
                <span className="absolute -top-2 -right-2 text-2xl">👑</span>
              </div>
              <div>
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Employee of the Month</p>
                <p className="text-xl font-bold text-amber-900">{employeeOfMonth.name}</p>
                <p className="text-sm text-amber-700 mt-1">{employeeOfMonth.completed} task{employeeOfMonth.completed !== 1 ? 's' : ''} completed this month</p>
                <p className="text-xs text-amber-500 mt-2 italic">Updates dynamically throughout the month</p>
              </div>
            </div>
            {monthlyStats.length > 1 && (
              <div className="mt-4 pt-3 border-t border-amber-200">
                <p className="text-xs text-amber-600 font-semibold mb-2">Runners Up</p>
                <div className="flex gap-3">
                  {monthlyStats.slice(1, 4).filter(Boolean).map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1.5">
                      {m.avatar_url ? <img src={m.avatar_url} className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">{m.initials}</div>}
                      <span className="text-xs text-amber-800">{m.name}</span>
                      <span className="text-xs text-amber-500">{m.completed}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Project Leaderboard</h2>
            <select value={leaderboardProject} onChange={e => setLeaderboardProject(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white">
              <option value="all">All Members</option>
              {projectsWithMembers.filter(Boolean).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="p-4">
            {leaderboardList.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No members to rank</p> : (
              <div className="space-y-2">
                {leaderboardList.filter(Boolean).map((m, i) => {
                  const medal = i === 0 ? '\uD83E\uDD47' : i === 1 ? '\uD83E\uDD48' : i === 2 ? '\uD83E\uDD49' : (i + 1);
                  const medalBg = i === 0 ? 'bg-amber-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50' : 'bg-white';
                  return (
                    <div key={m.key} className={"flex items-center gap-3 px-3 py-2 rounded-lg " + medalBg}>
                      <span className="text-lg w-8 text-center">{medal}</span>
                      {m.avatar_url ? <img src={m.avatar_url} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-700 font-semibold text-sm">{m.name.charAt(0).toUpperCase()}</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.assigned} assigned · {m.completed} completed</p>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{m.completionRate}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Team Overview</h2></div>
          {memberList.length === 0 ? (<div className="p-8 text-center"><p className="text-sm text-gray-400">No delegated tasks yet. Assign tasks to team members to see productivity data.</p></div>
          ) : (<table className="w-full"><thead><tr className="text-xs text-gray-500 border-b border-violet-50">
                  <th className="text-left px-5 py-3 font-medium">Member</th>
                  <th className="text-center px-3 py-3 font-medium">Assigned</th>
                  <th className="text-center px-3 py-3 font-medium">Completed</th>
                  <th className="text-center px-3 py-3 font-medium">Accepted</th>
                  <th className="text-center px-3 py-3 font-medium">Pending</th>
                  <th className="text-left px-3 py-3 font-medium">Completion Rate</th></tr></thead>
              <tbody>{memberList.filter(Boolean).map((m, i) => (<tr key={m.key} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="px-5 py-3"><div className="flex items-center gap-2">
                        {m.avatar_url ? <img src={m.avatar_url} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-700 font-semibold text-sm">{m.name.charAt(0).toUpperCase()}</div>}
                        <span className="text-sm font-medium text-gray-800">{m.name}</span></div></td>
                    <td className="text-center px-3 py-3 text-sm text-gray-600">{m.assigned}</td>
                    <td className="text-center px-3 py-3 text-sm text-emerald-600 font-medium">{m.completed}</td>
                    <td className="text-center px-3 py-3 text-sm text-violet-700 font-medium">{m.accepted}</td>
                    <td className="text-center px-3 py-3 text-sm text-amber-600 font-medium">{m.pending.length}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[100px]">
                          <div className="h-2 rounded-full" style={{width: Math.max(m.completionRate, 2) + '%', backgroundColor: m.completionRate >= 70 ? '#10B981' : m.completionRate >= 40 ? '#F59E0B' : '#EF4444'}}></div></div>
                        <span className="text-xs text-gray-500 w-8">{m.completionRate}%</span></div></td></tr>))}</tbody></table>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Pending Tasks</h2>
              <span className="text-xs text-gray-400">sorted by deadline</span></div>
            <div className="divide-y divide-violet-50/50 max-h-80 overflow-y-auto">
              {allPendingTasks.length === 0 ? (<div className="p-6 text-center"><p className="text-sm text-gray-400">All tasks completed!</p></div>
              ) : allPendingTasks.slice(0, 12).filter(Boolean).map((d, i) => (<div key={d.id || i} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{d.task_text}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">To: {d.recipient_username}</p>
                      {d.deadline && <p className="text-xs text-gray-400">Due: {new Date(d.deadline).toLocaleDateString()}</p>}
                      <span className={"text-xs px-1.5 py-0.5 rounded font-medium " + (d.status === 'accepted' ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600")}>{d.status}</span>
                    </div></div>
                  <button onClick={async () => {
                            try {
                              const { data: rUser } = await supabase.from('profiles').select('id').eq('username', d.recipient_username).single();
                              if (rUser) {
                                await supabase.from('notifications').insert({
                                  user_id: rUser.id,
                                  title: 'Task Reminder',
                                  message: userProfile.name + ' reminded you about: ' + d.task_text,
                                  sender_name: userProfile.name,
                                  is_read: false
                                });
                                setReminderMsg('Reminder sent to ' + d.recipient_username + '!');
                              } else {
                                setReminderMsg('Could not find user ' + d.recipient_username);
                              }
                            } catch (err) {
                              console.log('Reminder error:', err);
                              setReminderMsg('Failed to send reminder');
                            }
                            setTimeout(() => setReminderMsg(''), 3000);
                          }} className="text-xs px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 font-medium whitespace-nowrap">Remind</button>
<button onClick={() => markDelegatedDone(d.id)} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium whitespace-nowrap" title="Mark as completed">Done</button></div>))}
              {allPendingTasks.length > 12 && <div className="px-5 py-2 text-center"><p className="text-xs text-gray-400">+ {allPendingTasks.length - 12} more tasks</p></div>}</div></div>
          <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Assigned vs Completed</h2></div>
            <div className="p-5">{memberList.length === 0 ? (<div className="text-center py-6"><p className="text-sm text-gray-400">No data yet</p></div>
              ) : (<div className="space-y-3">{memberList.filter(Boolean).map(m => (<div key={m.key} className="space-y-1">
                      <p className="text-xs text-gray-600">{m.name}</p>
                      <div className="flex items-center gap-2"><div className="flex-1 flex gap-1">
                          <div className="h-5 rounded-l bg-blue-400 flex items-center justify-center" style={{width: Math.max((m.assigned / maxAssigned) * 100, 8) + '%'}}><span className="text-[10px] text-white font-medium">{m.assigned}</span></div>
                          <div className="h-5 rounded-r bg-emerald-400 flex items-center justify-center" style={{width: Math.max((m.completed / maxAssigned) * 100, 8) + '%'}}><span className="text-[10px] text-white font-medium">{m.completed}</span></div></div></div></div>))}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-400"></div><span className="text-xs text-gray-500">Assigned</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-400"></div><span className="text-xs text-gray-500">Completed</span></div></div></div>)}</div></div>
        </div>
        <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Productivity Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tasks completed per week (last 12 weeks)</p></div>
          <div className="p-5"><div className="flex items-end gap-2">{weeks.filter(Boolean).map((w, i) => {
                const intensity = w.count > 0 ? Math.max(0.15, w.count / maxWeekCount) : 0;
                return (<div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-md" style={{height: Math.max(w.count > 0 ? 20 : 8, (w.count / maxWeekCount) * 80) + 'px', backgroundColor: w.count > 0 ? 'rgba(59,130,246,' + intensity + ')' : '#F3F4F6'}} title={w.count + ' tasks'}></div>
                    <span className="text-[9px] text-gray-400">{w.label}</span>
                    {w.count > 0 && <span className="text-[10px] text-gray-500 font-medium">{w.count}</span>}</div>);
              })}</div></div></div>
      </div>);
  };

  
  const ProjectStatusBoard = () => {
    const [expandedProject, setExpandedProject] = useState(null);
    const [addedTasks, setAddedTasks] = useState({});
    const [cloudProjects, setCloudProjects] = useState([]);
    const [cloudTasks, setCloudTasks] = useState([]);

    useEffect(() => {
      if (!supaUser) return;
      const fetchCloud = async () => {
        try {
          const { data: sp } = await supabase.from('projects').select('*');
          const { data: st } = await supabase.from('weekly_tasks').select('*');
          if (sp) setCloudProjects(sp);
          if (st) setCloudTasks(st);
        } catch(e) { console.log('Cloud fetch error:', e); }
      };
      fetchCloud();
    }, [supaUser]);

    const isOwner = projects.length > 0;
    const activeProjects = isOwner ? projects : cloudProjects.filter(Boolean).map(sp => ({
      id: sp.local_id, name: sp.name, desc: sp.description, progress: sp.progress,
      status: sp.status, start: sp.start_date, launch: sp.launch_date,
      team: sp.team_size, next: sp.next_step, teamMembers: sp.teamMembers
    }));
    const activeTasks = isOwner ? weeklyPlan : cloudTasks.filter(Boolean).map(st => ({
      id: st.local_id, task: st.task_text, projectId: st.project_local_id,
      subtasks: st.subtasks || [], deadline: st.deadline,
      delegatedTo: st.delegated_to, completed: st.completed
    }));
    const activeCompleted = isOwner ? completedWeekly : (() => {
      const c = {}; cloudTasks.forEach(st => { if (st.completed) c[st.local_id] = true; }); return c;
    })();

    const addToMyPlan = (task) => {
      const newTask = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        task: task.task, projectId: task.projectId,
        deadline: task.deadline || null,
        subtasks: task.subtasks ? task.subtasks.filter(Boolean).map(s => ({...s, id: Date.now() + Math.floor(Math.random() * 10000)})) : []
      };
      setWeeklyPlan(prev => [...prev, newTask]);
      setAddedTasks(prev => ({...prev, [task.id]: true}));
    };

    const projectStatusData = activeProjects.filter(Boolean).map(p => {
      const pTasks = activeTasks.filter(w => w.projectId === p.id);
      const completedCount = pTasks.filter(w => activeCompleted[w.id]).length;
      const delegatedTasks = pTasks.filter(w => w.delegatedTo);
      const pendingTasks = pTasks.filter(w => !activeCompleted[w.id]);
      return { ...p, tasks: pTasks, completedCount, totalTasks: pTasks.length, delegatedTasks, pendingTasks, progressPct: pTasks.length > 0 ? Math.round((completedCount / pTasks.length) * 100) : 0 };
    }).filter(p => p.totalTasks > 0 || p.status === 'In Progress');

    if (projectStatusData.length === 0) return null;

    return (
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Project Status Board</h2>
        <div className="space-y-3">
          {projectStatusData.filter(Boolean).map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedProject(expandedProject === p.id ? null : p.id)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={"w-2.5 h-2.5 rounded-full flex-shrink-0 " + (p.status === 'Planning' ? 'bg-yellow-400' : p.status === 'In Progress' ? 'bg-violet-500' : 'bg-green-500')} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={"text-xs font-medium " + (p.status === 'Planning' ? 'text-yellow-600' : p.status === 'In Progress' ? 'text-violet-700' : 'text-green-600')}>{p.status}</span>
                      <span className="text-xs text-gray-400">{p.completedCount}/{p.totalTasks} tasks done</span>
                      {p.delegatedTasks.length > 0 && <span className="text-xs text-purple-500">{p.delegatedTasks.length} delegated</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all" style={{width: p.progressPct + '%'}} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{p.progressPct}%</span>
                  <svg className={"w-4 h-4 text-gray-400 transition-transform " + (expandedProject === p.id ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {expandedProject === p.id && (
                <div className="border-t border-gray-100">
                  <div className="divide-y divide-violet-50/50">
                    {p.tasks.filter(Boolean).map(tk => (
                      <div key={tk.id} className={"px-5 py-3 flex items-center justify-between " + (activeCompleted[tk.id] ? "opacity-50" : "")}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={"w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center " + (activeCompleted[tk.id] ? "bg-green-100 border-green-400" : "border-gray-300")}>
                            {activeCompleted[tk.id] && <div className="w-2 h-2 rounded-full bg-green-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className={"text-sm truncate " + (activeCompleted[tk.id] ? "line-through text-gray-400" : "text-gray-800")}>{tk.task}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {tk.delegatedTo && <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">@{tk.delegatedTo}</span>}
                              {tk.deadline && <span className={"text-xs " + (new Date(tk.deadline) < new Date() && !activeCompleted[tk.id] ? "text-red-500" : "text-gray-400")}>{new Date(tk.deadline).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
                              {tk.subtasks && tk.subtasks.length > 0 && <span className="text-xs text-gray-400">{tk.subtasks.filter(s=>s.done).length}/{tk.subtasks.length} subtasks</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {!activeCompleted[tk.id] && !addedTasks[tk.id] && (
                            <button onClick={(e) => { e.stopPropagation(); addToMyPlan(tk); }} className="text-xs px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 font-medium whitespace-nowrap">+ Add to Plan</button>
                          )}
                          {addedTasks[tk.id] && <span className="text-xs text-green-600 font-medium">Added!</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

    const PlannerModule = () => {
        const groupTasksByProject = (tasks) => {
            const grouped = {};
            const unlinked = [];
            tasks.forEach(w => {
                if (w.projectId) {
                    if (!grouped[w.projectId]) grouped[w.projectId] = [];
                    grouped[w.projectId].push(w);
                } else {
                    unlinked.push(w);
                }
            });
            return { grouped, unlinked };
        };
        const goalsOnly = useMemo(() => weeklyPlan.filter(w => !w.thisWeek), [weeklyPlan]);
        const thisWeekOnly = useMemo(() => weeklyPlan.filter(w => w.thisWeek), [weeklyPlan]);
        const weeklyByProject = useMemo(() => groupTasksByProject(goalsOnly), [goalsOnly]);
        const thisWeekByProject = useMemo(() => groupTasksByProject(thisWeekOnly), [thisWeekOnly]);

        const { weeklyDone, weeklyTotal } = useMemo(() => {
            let done = 0, total = 0;
            weeklyPlan.forEach(w => {
                if (w.subtasks && w.subtasks.length > 0) {
                    total += w.subtasks.length;
                    done += w.subtasks.filter(s => s.done).length;
                } else {
                    total += 1;
                    if (completedWeekly[w.id]) done += 1;
                }
            });
            return { weeklyDone: done, weeklyTotal: total };
        }, [weeklyPlan, completedWeekly]);
        const dailyDone = quickTasks.filter(t => completedTasks[t.id]).length;
        const dailyTotal = quickTasks.length;

        const WeeklyTaskRow = ({ w, showProject, context }) => {
            const alreadyPushed = quickTasks.some(t => t.weeklySourceId === w.id);
            const sp = getSubProgress(w);
            return (
                <div>
                    <div className={'px-5 py-3.5 flex items-center gap-3 group ' + (completedWeekly[w.id] ? 'opacity-50' : '')}>
                        <span className="cursor-pointer flex-shrink-0" onClick={() => toggleWeekly(w.id)}>
                            {completedWeekly[w.id] ? I.check("#10B981") : I.circle("#D1D5DB")}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className={'text-sm ' + (completedWeekly[w.id] ? 'line-through text-gray-400' : 'text-gray-900')}>{w.task}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                {sp && <p className="text-xs text-gray-400">{sp.done}/{sp.total} sub-goals done</p>}
                                {w.delegatedFrom && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 font-medium">from {w.delegatedFrom}</span>}
                                {w.deadline && <span className={'text-xs px-1.5 py-0.5 rounded ' + (new Date(w.deadline) < new Date() ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600')}>{new Date(w.deadline + 'T00:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
                                {w.delegatedTo && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-500 flex items-center gap-1">{I.user("#8B5CF6")} {w.delegatedTo}</span>}
                      {w.delegatedFrom && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">from {w.delegatedFrom}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                            {!completedWeekly[w.id] && context === 'goals' && (
                                <button onClick={() => setWeeklyPlan(prev => prev.filter(Boolean).map(t => t.id === w.id ? {...t, thisWeek: true} : t))} className="p-1.5 rounded-lg hover:bg-amber-50 transition text-amber-500" title="Move to This Week">
                                    {I.arrowRight("#F59E0B")}
                                </button>
                            )}
                            {!completedWeekly[w.id] && context === 'thisWeek' && !alreadyPushed && (
                                <button onClick={() => pushToDaily(w)} className="p-1.5 rounded-lg hover:bg-violet-50 transition text-violet-600" title="Push to Today">
                                    {I.arrowRight("#3B82F6")}
                                </button>
                            )}
                            {!completedWeekly[w.id] && context === 'thisWeek' && (
                                <button onClick={() => setWeeklyPlan(prev => prev.filter(Boolean).map(t => t.id === w.id ? {...t, thisWeek: false} : t))} className="p-1.5 rounded-lg hover:bg-violet-50 transition text-gray-400" title="Back to Goals">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                            )}
                            {alreadyPushed && <span className="text-xs text-emerald-500 px-2">In today</span>}
                            <button onClick={() => { setEditItem(w); setModal('editWeekly'); }} className="p-1.5 rounded-lg hover:bg-violet-50 transition">{I.edit("#9CA3AF")}</button>
                        </div>
                    </div>
                    {w.subtasks && w.subtasks.length > 0 && !completedWeekly[w.id] && (
                        <div className="pl-12 pr-5 pb-3 space-y-1">
                            {w.subtasks.filter(Boolean).map(s => (
                                <div key={s.id} className="flex items-center gap-2.5 py-1 cursor-pointer group/sub" onClick={() => toggleSubtask(w.id, s.id)}>
                                    <div className={'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition ' + (s.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover/sub:border-blue-400')}>
                                        {s.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span className={'text-xs ' + (s.done ? 'line-through text-gray-400' : 'text-gray-600')}>{s.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        };

        return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                {[
                    { id: 'goals', label: 'Goals & Intentions', count: weeklyPlan.filter(w => !w.thisWeek && !completedWeekly[w.id]).length },
                    { id: 'weekly', label: 'This Week', count: weeklyPlan.filter(w => w.thisWeek && !completedWeekly[w.id]).length },
                    { id: 'daily', label: 'Today', count: dailyTotal - dailyDone },
                    { id: 'schedule', label: 'Schedule', count: timeBlocks.filter(b => !completedTimeBlocks[b.id]).length },
                ].filter(Boolean).map(tab => (
                    <button key={tab.id} onClick={() => setPlannerTab(tab.id)}
                        className={'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ' + (plannerTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                        {tab.label}
                        {tab.count > 0 && <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (plannerTab === tab.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 text-gray-500')}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {plannerTab === 'goals' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-violet-100/60 p-5 card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Goals & Intentions</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Your master plan   move tasks to This Week when ready</p>
                            </div>
                            <div className="flex items-center gap-2">
                                    {weeklyPlan.some(w => completedWeekly[w.id]) && (
                                        <button onClick={() => { setWeeklyPlan(prev => prev.filter(w => !completedWeekly[w.id])); setCompletedWeekly({}); }} className="text-xs text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1">{I.history("#9CA3AF")} Clear done</button>
                                    )}
                                    <button onClick={() => setModal('addWeekly')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add Goal</button>
                                </div>
                        </div>
                        {weeklyTotal > 0 && (
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div className="h-full bg-violet-500 rounded-full transition-all" style={{width: (weeklyTotal > 0 ? (weeklyDone / weeklyTotal) * 100 : 0) + '%'}}></div>
                            </div>
                        )}
                    </div>

                    {weeklyPlan.length === 0 ? (
                        <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                            <Empty icon={I.clipboard("#9CA3AF")} title="No weekly tasks yet" sub="Start by adding your key objectives for the week" action={() => setModal('addWeekly')} actionLabel="Add Weekly Task" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(weeklyByProject.grouped).filter(Boolean).map(pid => {
                                const proj = projects.find(p => p.id === Number(pid));
                                const tasks = weeklyByProject.grouped[pid];
                                let projTotal = 0, projDone = 0;
                                tasks.forEach(w => {
                                    if (w.subtasks && w.subtasks.length > 0) { projTotal += w.subtasks.length; projDone += w.subtasks.filter(s => s.done).length; }
                                    else { projTotal += 1; if (completedWeekly[w.id]) projDone += 1; }
                                });
                                return (
                                    <div key={pid} className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                                        <div className="px-5 py-3.5 bg-violet-50/50 border-b border-violet-100/50 flex items-center justify-between cursor-pointer select-none hover:bg-violet-50/80 transition" onClick={() => toggleProjectCollapse(pid)}>
                                            <div className="flex items-center gap-3">
                                                <span className={'transition-transform duration-200 ' + (collapsedProjects[pid] ? '' : 'rotate-90')}>{I.chevron("#9CA3AF")}</span>
                                                <div className="w-2 h-8 rounded-full bg-blue-400"></div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{proj ? proj.name : 'Unknown Project'}</p>
                                                    <p className="text-xs text-gray-400">{projDone}/{projTotal} done</p>
                                                </div>
                                            </div>
                                            {proj && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">{getProjectProgress(Number(pid)) || 0}%</span>
                                                    <div className="w-20 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-violet-500 rounded-full transition-all" style={{width: (getProjectProgress(Number(pid)) || 0) + '%'}}></div></div>
                                                </div>
                                            )}
                                        </div>
                                        {!collapsedProjects[pid] && <div className="divide-y divide-violet-50/50">
                                            {tasks.filter(w => !completedWeekly[w.id]).map(w => <WeeklyTaskRow key={w.id} w={w} context="goals" />)}
                                        </div>}
                                    </div>
                                );
                            })}

                            {weeklyByProject.unlinked.length > 0 && (
                                <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                                    <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3 cursor-pointer select-none hover:bg-gray-50/80 transition" onClick={() => toggleProjectCollapse('general')}>
                                        <span className={'transition-transform duration-200 ' + (collapsedProjects['general'] ? '' : 'rotate-90')}>{I.chevron("#9CA3AF")}</span>
                                        <div className="w-2 h-8 rounded-full bg-gray-300"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">General Tasks</p>
                                            <p className="text-xs text-gray-400">Not linked to a project</p>
                                        </div>
                                    </div>
                                    {!collapsedProjects['general'] && <div className="divide-y divide-violet-50/50">
                                        {weeklyByProject.unlinked.filter(w => !completedWeekly[w.id]).map(w => <WeeklyTaskRow key={w.id} w={w} context="goals" />)}
                                    </div>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {plannerTab === 'weekly' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-violet-100/60 p-5 card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">This Week</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{thisWeekOnly.filter(w => completedWeekly[w.id]).length} of {thisWeekOnly.length} tasks done this week</p>
                            </div>
                        </div>
                        {thisWeekOnly.length > 0 && (
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width: (() => { const t = thisWeekOnly.length; const d = thisWeekOnly.filter(w => completedWeekly[w.id]).length; return t > 0 ? (d / t) * 100 : 0; })() + '%'}}></div>
                            </div>
                        )}
                    </div>

                    {thisWeekOnly.length === 0 ? (
                        <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                            <Empty icon={I.clipboard("#9CA3AF")} title="No tasks for this week yet" sub="Move tasks from Goals & Intentions to focus on them this week" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(thisWeekByProject.grouped).filter(Boolean).map(pid => {
                                const proj = projects.find(p => p.id === Number(pid));
                                const tasks = thisWeekByProject.grouped[pid];
                                const activeTasks = tasks.filter(w => !completedWeekly[w.id]);
                                const doneTasks = tasks.filter(w => completedWeekly[w.id]);
                                return (
                                    <div key={pid} className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                                        <div className="px-5 py-3.5 bg-emerald-50/50 border-b border-emerald-100/50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 rounded-full bg-emerald-400"></div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{proj ? proj.name : 'Unknown Project'}</p>
                                                    <p className="text-xs text-gray-400">{doneTasks.length}/{tasks.length} done</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-violet-50/50">
                                            {activeTasks.filter(Boolean).map(w => <WeeklyTaskRow key={w.id} w={w} context="thisWeek" />)}
                                        </div>
                                    </div>
                                );
                            })}

                            {thisWeekByProject.unlinked.filter(w => !completedWeekly[w.id]).length > 0 && (
                                <div className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                                    <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                                        <div className="w-2 h-8 rounded-full bg-gray-300"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">General Tasks</p>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-violet-50/50">
                                        {thisWeekByProject.unlinked.filter(w => !completedWeekly[w.id]).map(w => <WeeklyTaskRow key={w.id} w={w} context="thisWeek" />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

                        {plannerTab === 'daily' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-gray-900">Today's Tasks</h2>
                                <div className="flex items-center gap-2">
                                    {quickTasks.some(t => completedTasks[t.id]) && (
                                        <button onClick={archiveCompleted} className="text-xs text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1">{I.history("#9CA3AF")} Archive done</button>
                                    )}
                                    <button onClick={() => setModal('addTask')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                                </div>
                            </div>
                            {quickTasks.length === 0 ? (
                                <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                                    <Empty icon={I.check("#9CA3AF")} title="No tasks yet" sub="Add tasks or pull from your weekly plan" action={() => setModal('addTask')} actionLabel="Add Task" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Pending tasks first */}
                                    {quickTasks.filter(t => !completedTasks[t.id]).map(t => (
                                        <div key={t.id} className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow card-shadow-hover transition-all flex items-center gap-3">
                                            <span className="cursor-pointer" onClick={() => toggleTask(t.id)}>{I.circle("#D1D5DB")}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{t.task}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-400">{t.due}</span>
                                                    {t.projectId && projectName(t.projectId) && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 truncate max-w-[120px]">{projectName(t.projectId)}</span>
                                                    )}
                                                    {t.delegatedTo && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-500 flex items-center gap-1">{I.user("#8B5CF6")} {t.delegatedTo}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ' + (prioColor[t.priority] || prioColor.medium)}>{prioLabel[t.priority] || 'Med'}</span>
                                            <button onClick={() => { setEditItem(t); setModal('editTask'); }} className="p-1 rounded-lg hover:bg-violet-50 transition flex-shrink-0">{I.edit("#9CA3AF")}</button>
                                        </div>
                                    ))}
                                    {/* Completed tasks (dimmed) */}
                                    {quickTasks.filter(t => completedTasks[t.id]).map(t => (
                                        <div key={t.id} className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow transition-all flex items-center gap-3 opacity-50">
                                            <span className="cursor-pointer" onClick={() => toggleTask(t.id)}>{I.check("#10B981")}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-400 line-through">{t.task}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Delegated section */}
                            {quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).length > 0 && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        {I.user("#8B5CF6")}
                                        <h3 className="text-sm font-semibold text-gray-900">Delegated</h3>
                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).map(t => (
                                            <div key={'del-'+t.id} className="bg-purple-50/50 rounded-xl border border-purple-100 p-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs flex-shrink-0">{t.delegatedTo.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0,2)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">{t.task}</p>
                                                    <p className="text-xs text-purple-500 mt-0.5">Assigned to {t.delegatedTo}</p>
                                                </div>
                                                <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (prioColor[t.priority] || prioColor.medium)}>{prioLabel[t.priority] || 'Med'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-gray-900 mb-4">At a Glance</h2>
                            <div className="space-y-3">
                                <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Weekly Progress</p>
                                    <p className="text-2xl font-semibold text-gray-900">{weeklyDone} / {weeklyTotal}</p>
                                    <p className="text-xs text-gray-400">weekly tasks done</p>
                                    {weeklyTotal > 0 && (
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2"><div className="h-full bg-violet-500 rounded-full transition-all" style={{width: ((weeklyDone / weeklyTotal) * 100) + '%'}}></div></div>
                                    )}
                                </div>
                                <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Today</p>
                                    <p className="text-2xl font-semibold text-gray-900">{dailyDone} / {dailyTotal}</p>
                                    <p className="text-xs text-gray-400">tasks done</p>
                                </div>
                                <div className="bg-white rounded-xl border border-violet-100/60 p-4 card-shadow">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Schedule</p>
                                    <p className="text-2xl font-semibold text-gray-900">{timeBlocks.filter(b => !completedTimeBlocks[b.id]).length}</p>
                                    <p className="text-xs text-gray-400">blocks remaining</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                        <button onClick={() => setExpandedIdeas(!expandedIdeas)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition rounded-xl">
                            <div className="flex items-center gap-3">{I.bulb("#F59E0B")}<span className="text-base font-semibold text-gray-900">Ideas & Learning</span><span className="text-xs text-gray-400 ml-2">{ideas.length + learning.length} items</span></div>
                            <span className={'transition-transform ' + (expandedIdeas ? 'rotate-90' : '')}>{I.chevron("#9CA3AF")}</span>
                        </button>
                        {expandedIdeas && (
                            <div className="px-5 pb-5 space-y-5">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ideas I Don't Want to Forget</p>
                                        <button onClick={() => setModal('addIdea')} className="text-xs text-violet-600 hover:text-violet-700 font-medium">{I.plus("#3B82F6")}</button>
                                    </div>
                                    {ideas.length === 0 ? <p className="text-sm text-gray-400 italic">No ideas captured yet. Click + to add one.</p> : (
                                        <div className="space-y-2">
                                            {ideas.filter(Boolean).map(idea => (
                                                <div key={idea.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                                                    <div className="flex-1"><p className="text-sm text-gray-800">{idea.text}</p><p className="text-xs text-gray-400 mt-0.5">{idea.t}</p></div>
                                                    <button onClick={() => { setEditItem(idea); setModal('editIdea'); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-amber-100 transition">{I.edit("#9CA3AF")}</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Things I Said I'd Learn</p>
                                        <button onClick={() => setModal('addLearning')} className="text-xs text-violet-600 hover:text-violet-700 font-medium">{I.plus("#3B82F6")}</button>
                                    </div>
                                    {learning.length === 0 ? <p className="text-sm text-gray-400 italic">No learning goals yet. Click + to add one.</p> : (
                                        <div className="space-y-2">
                                            {learning.filter(Boolean).map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                                    <p className="text-sm text-gray-800 flex-1">{item}</p>
                                                    <button onClick={() => { setEditItem(item); setModal('editLearning_' + i); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-violet-100 transition">{I.edit("#9CA3AF")}</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                
                {/* Delegated by You */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Delegated by You</h3>
                    {delegatedByMe.filter(d => d.status !== 'completed').length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No delegated tasks yet. Use the Delegate Launchpad to assign tasks.</p>
                    ) : (
                        <div className="space-y-2">
                    {delegatedByMe.filter(d => d.status !== 'completed').map(d => (
                        <div key={d.id} className={"flex items-center justify-between p-3 rounded-lg border transition " + (d.status === 'accepted' ? "bg-green-50 border-green-200" : "bg-purple-50 border-purple-200")}>
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{d.task_text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">To: <span className="font-medium">{d.recipient_username}</span> {d.deadline && <span className="ml-2">Due: {new Date(d.deadline).toLocaleDateString()}</span>}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (d.status === 'accepted' ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700")}>{d.status}</span>
                        <button onClick={() => markDelegatedDone(d.id)} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium transition" title="Mark as done">Done</button>
                        </div>
                        </div>
                    ))}
                        </div>
                    )}
                </div>
</div>
            )}

            {plannerTab === 'schedule' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-900">Today's Schedule</h2>
                            <button onClick={() => setModal('addTimeBlock')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                        </div>
                        {timeBlocks.length === 0 ? (
                            <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                                <Empty icon={I.calendar("#9CA3AF")} title="No time blocks yet" sub="Plan your day by adding time blocks" action={() => setModal('addTimeBlock')} actionLabel="Add Time Block" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {timeBlocks.filter(Boolean).map(b => (
                                    <div key={b.id} className={(catColors[b.cat] || catColors.blue) + ' border rounded-xl px-5 py-3.5 transition-all hover:shadow-sm ' + (completedTimeBlocks[b.id] ? 'opacity-50' : '')}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleBlock(b.id)}>
                                                <div className={'w-2 h-2 rounded-full ' + (catDot[b.cat] || catDot.blue)}></div>
                                                <span className="text-xs font-medium opacity-70 w-32">{b.time}{b.end ? ' - ' + b.end : ''}</span>
                                                <span className={'text-sm font-medium ' + (completedTimeBlocks[b.id] ? 'line-through opacity-60' : '')}>{b.task}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditItem(b); setModal('editTimeBlock'); }} className="p-1 rounded-lg hover:bg-white/50 transition">{I.edit("#9CA3AF")}</button>
                                                {completedTimeBlocks[b.id] ? I.check("#10B981") : <span className="cursor-pointer" onClick={() => toggleBlock(b.id)}>{I.circle("#D1D5DB")}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        );
    };

    const HistoryModule = () => {
        const sortedHistory = [...taskHistory].sort((a, b) => b.date.localeCompare(a.date));
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Task History</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Completed tasks archived by date</p>
                    </div>
                </div>
                {sortedHistory.length === 0 ? (
                    <div className="bg-white rounded-xl border border-violet-100/60 card-shadow">
                        <Empty icon={I.history("#9CA3AF")} title="No history yet" sub="Completed tasks will automatically move here" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedHistory.filter(Boolean).map(entry => (
                            <div key={entry.date} className="bg-white rounded-xl border border-violet-100/60 card-shadow overflow-hidden">
                                <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {I.calendar("#6B7280")}
                                        <p className="text-sm font-semibold text-gray-900">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{entry.tasks.length} task{entry.tasks.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="divide-y divide-violet-50/50">
                                    {entry.tasks.filter(Boolean).map((t, i) => (
                                        <div key={t.id || i} className="px-5 py-3 flex items-center gap-3">
                                            {I.check("#10B981")}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-600">{t.task}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {t.projectId && <span className="text-xs px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">{projectName(t.projectId)}</span>}
                                                    {t.delegatedTo && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-500">{I.user("#8B5CF6")} {t.delegatedTo}</span>}
                                                </div>
                                            </div>
                                            {t.completedAt && <span className="text-xs text-gray-400">{new Date(t.completedAt).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

  // PROJECT DASHBOARD
  const ProjectDashboard = () => { const projectId = activeProjectId;
    const project = projects.find(p => String(p.id) === String(projectId));
    if (!project) return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <button onClick={() => setActiveModule('command')} className="mt-3 text-violet-600 hover:text-violet-700 text-sm font-medium">Back to Command Centre</button>
      </div>
    );
    const projectTasks = quickTasks.filter(t => t.project === project.name || t.projectId === project.id);
    const projectDone = projectTasks.filter(t => completedTasks[t.id]).length;
    const projectDelegated = delegatedByMe.filter(d => d.projectId === project.id || d.project === project.name);
    const projectIncome = incomeStreams.filter(s => s.projectId === project.id || s.project === project.name);
    const projectExpenses = expenses.filter(e => e.projectId === project.id || e.project === project.name);
    const totalProjIncome = projectIncome.reduce((s, i) => s + Number(i.monthly || 0), 0);
    const totalProjExpenses = projectExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const pct = projectTasks.length > 0 ? Math.round((projectDone/projectTasks.length)*100) : 0;

    return (
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveModule('command')} className="w-9 h-9 rounded-xl bg-white border border-violet-100/60 flex items-center justify-center hover:bg-violet-50 transition card-shadow">
            {I.arrowRight("#7C3AED")}
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            {project.description && <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 font-medium">{pct}% complete</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-violet-100/60 p-4 card-shadow">
            <span className="text-xs text-gray-500">Tasks</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{projectTasks.length}</p>
            <p className="text-xs text-emerald-500">{projectDone} completed</p>
          </div>
          <div className="bg-white rounded-2xl border border-violet-100/60 p-4 card-shadow">
            <span className="text-xs text-gray-500">Delegated</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{projectDelegated.length}</p>
            <p className="text-xs text-violet-500">{projectDelegated.filter(d => d.status === 'accepted').length} active</p>
          </div>
          <div className="bg-white rounded-2xl border border-violet-100/60 p-4 card-shadow">
            <span className="text-xs text-gray-500">Income</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{fmtNaira(totalProjIncome)}</p>
            <p className="text-xs text-gray-400">monthly</p>
          </div>
          <div className="bg-white rounded-2xl border border-violet-100/60 p-4 card-shadow">
            <span className="text-xs text-gray-500">Expenses</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{fmtNaira(totalProjExpenses)}</p>
            <p className="text-xs text-gray-400">monthly</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-violet-100/60 p-5 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-violet-600">{pct}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all" style={{width: pct+'%'}}></div>
          </div>
        </div>

        {/* Tasks and Team */}
        <div className="grid grid-cols-2 gap-6">
          {/* Tasks list */}
          <div className="bg-white rounded-2xl border border-violet-100/60 card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-violet-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
              <span className="text-xs text-gray-400">{projectDone}/{projectTasks.length}</span>
            </div>
            <div className="divide-y divide-violet-50/50 max-h-64 overflow-y-auto">
              {projectTasks.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">No tasks for this project</p>}
              {projectTasks.filter(Boolean).map((task, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-violet-50/30 transition">
                  <button onClick={() => { const nc = {...completedTasks}; nc[task.id] ? delete nc[task.id] : nc[task.id] = true; setCompletedTasks(nc); save('completedTasks', nc); }} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${completedTasks[task.id] ? 'bg-violet-500 border-violet-500' : 'border-gray-300 hover:border-violet-400'}`}>
                    {completedTasks[task.id] && I.check("#fff")}
                  </button>
                  <span className={`text-sm flex-1 ${completedTasks[task.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
                  {task.priority && <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-600' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{task.priority}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Team members */}
          <div className="bg-white rounded-2xl border border-violet-100/60 card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-violet-50">
              <h3 className="text-sm font-semibold text-gray-900">Team Members</h3>
            </div>
            <div className="p-5 space-y-3">
              {project.members && project.members.length > 0 ? project.members.filter(Boolean).map((member, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-semibold">{(member.name || member).substring(0,2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{member.name || member}</p>
                    {member.role && <p className="text-xs text-gray-400">{member.role}</p>}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
              )) : <p className="text-sm text-gray-400 text-center">No team members added</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const activeProjectId = activeModule.startsWith('project-') ? activeModule.slice(8) : null;

    // MAIN RETURN
    if (authLoading) return <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 z-50 flex items-center justify-center"><Emblem size={48} /><p className="ml-3 text-gray-400">Loading...</p></div>;
    if (!supaUser || !userProfile) return <AuthFlow onAuth={handleAuth} />;
    return (
        <div className="h-screen bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-100 flex">
            <Sidebar />
            <div className={'flex-1 flex flex-col transition-all duration-300 ' + (sidebarOpen ? 'ml-60' : 'ml-16')}>
                <TopBar />
                <main className="flex-1 overflow-auto px-8 py-6">
                {EODReportModal()}
                    {activeModule === 'command' && CommandCentre()}
                    {activeModule === 'income' && <ModuleBoundary name='income'><IncomeModule /></ModuleBoundary>}
                    {activeModule === 'planner' && <ModuleBoundary name='planner'><PlannerModule /></ModuleBoundary>}
                    {activeModule === 'history' && <ModuleBoundary name='history'><HistoryModule /></ModuleBoundary>}
              {activeModule === 'boardroom' && <ModuleBoundary name='boardroom'><BoardroomModule /></ModuleBoundary>}
              {activeProjectId && <ModuleBoundary name='project'><ProjectDashboard /></ModuleBoundary>}
                </main>
            </div>

            {/* Floating + Button */}
            <button onClick={() => setModal(modal === 'addMenu' ? null : 'addMenu')} className={'fixed bottom-8 right-8 w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-violet-600 transition-all duration-200 ' + (modal === 'addMenu' ? 'rotate-45' : '')} title="Quick Add">
                {I.plus("white")}
            </button>

            {/* MODALS */}
            {modal === 'addMenu' && <AddMenu onClose={() => setModal(null)} activeModule={activeModule} setModal={setModal} />}
            {modal === 'addIncome' && <IncomeForm setIncomeStreams={setIncomeStreams} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editIncome' && <IncomeForm item={editItem} setIncomeStreams={setIncomeStreams} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addProject' && <ProjectForm setProjects={setProjects} getProjectProgress={getProjectProgress} onClose={() => { setModal(null); setEditItem(null); }}  supaUser={supaUser} weeklyPlan={weeklyPlan} quickTasks={quickTasks}/>}
            {modal === 'editProject' && <ProjectForm item={editItem} setProjects={setProjects} getProjectProgress={getProjectProgress} onClose={() => { setModal(null); setEditItem(null); }}  supaUser={supaUser} weeklyPlan={weeklyPlan} quickTasks={quickTasks}/>}
            {acceptingTask && <AcceptTaskModal task={acceptingTask} onChooseDaily={acceptToDaily} onChooseWeekly={acceptToWeekly} onCancel={() => setAcceptingTask(null)}             />}
      {modal === 'addGoal' && <GoalForm setWeeklyPlan={setWeeklyPlan} activeProjects={activeProjects} team={teamMembers} supaUser={supaUser} onClose={() => { setModal(null); setEditItem(null); }} />}
      {modal === 'addWeekly' && <WeeklyTaskForm setWeeklyPlan={setWeeklyPlan} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editWeekly' && <WeeklyTaskForm item={editItem} setWeeklyPlan={setWeeklyPlan} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addTask' && <TaskForm setQuickTasks={setQuickTasks} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editTask' && <TaskForm item={editItem} setQuickTasks={setQuickTasks} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addTimeBlock' && <TimeBlockForm setTimeBlocks={setTimeBlocks} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editTimeBlock' && <TimeBlockForm item={editItem} setTimeBlocks={setTimeBlocks} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addIdea' && <IdeaForm setIdeas={setIdeas} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editIdea' && <IdeaForm item={editItem} setIdeas={setIdeas} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addTeam' && <TeamForm setTeamMembers={setTeamMembers} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addExpense' && <ExpenseForm setExpenses={setExpenses} incomeStreams={incomeStreams} supaUser={supaUser} userProfile={userProfile} paymentTags={paymentTags} setPaymentTags={setPaymentTags} onClose={() => { setModal(null); setEditItem(null); }}  activeProjects={activeProjects}/>}
            {modal === 'editExpense' && <ExpenseForm item={editItem} setExpenses={setExpenses} incomeStreams={incomeStreams} supaUser={supaUser} userProfile={userProfile} paymentTags={paymentTags} setPaymentTags={setPaymentTags} onClose={() => { setModal(null); setEditItem(null); }}  activeProjects={activeProjects}/>}
            {modal === 'editTeam' && <TeamForm item={editItem} setTeamMembers={setTeamMembers} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addLearning' && <LearningForm setLearning={setLearning} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal && modal.startsWith('editLearning_') && <LearningForm item={editItem} idx={parseInt(modal.split('_')[1])} setLearning={setLearning} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'settings' && <ProfileEditModal userProfile={userProfile} setUserProfile={setUserProfile} supaUser={supaUser} onClose={() => { setModal(null); }} />}
            {notificationsOpen && <NotificationsPanel notifications={notifications} onMarkRead={markNotifRead} onClose={() => setNotificationsOpen(false)} delegatedToMe={delegatedToMe} onAcceptTask={setAcceptingTask} quickTasks={quickTasks} weeklyPlan={weeklyPlan} setActiveModule={setActiveModule} setPlannerTab={setPlannerTab} />}}
        </div>
    );
};

function NuOperandiWithBoundary(props) {
  return React.createElement(ErrorBoundary, null, React.createElement(NuOperandi, props));
}
export default NuOperandiWithBoundary;
