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
    const pts = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);
        return x + ',' + y;
    }).join(' ');
    return <svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

/* ====== QUOTES ====== */
const quotes = [
    "Resilience is not a personality trait – it is a competitive strategy.",
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
    "Separate business expenses from personal expenses – this is non-negotiable for scaling.",
    "Exchange affirmation for accomplishment. Stop seeking likes and validation. Seek results.",
    "Exchange security for significance. The safe bet will not build a billion-person impact.",
    "Exchange immediate victory for long-term sustainability. Play the 10-year game.",
    "Change your attitude towards uncertainty. VUCA is permanent. Embrace it as your competitive advantage.",
    "Stop being a people pleaser. Be the best at what you do and it will follow.",
    "Stop measuring performance solely in immediate results.",
    "Set up a Personal Advisory Board – people who believe in you, bring fresh energy and fresh direction.",
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

/* ====== EMBEDDED BRIEFING DATA ====== */
const embeddedBriefing = {"date":"2026-02-11","generatedAt":"2026-02-11T06:00:00.000Z","headline":"Revenue on track. Two active projects need attention. Four tasks pending today.","sections":[{"title":"Financial Snapshot","items":["Monthly gross income stands at ₦2.0M across 2 active streams.","Monthly expenses total ₦700K, leaving net income at ₦1.3M — healthy position.","Annual projected income: ₦24.0M gross, ₦15.6M net.","Next incoming payment: Feb 28 — Principal Consultant, Ginger Technologies Limited."]},{"title":"Today's Priorities","items":["Review and advance Ginger Technologies February Strategy Campaign Rollout.","Follow up on Social Media Manager/Coordinator onboarding — agreement, NWBS, and deposit still pending.","MNoB Planners: finalize edits, prepare prototype for print test.","Identify and confirm backup printer for MNoB Notebooks."]},{"title":"Project Status","items":["Ginger Technologies Campaign: 0/3 tasks complete — onboarding is the critical path. Push for signed agreement today.","MNoB Planners: 0/4 tasks complete — planner edits and prototype print are the next milestones."]},{"title":"Strategic Notes","items":["Separate business expenses from personal expenses — this remains non-negotiable for scaling.","Two income streams is a solid foundation. Begin scoping a third stream to diversify revenue risk.","Consider scheduling a quarterly review to assess income growth trajectory against the ₦24M annual target."]}]};

const embeddedNation = {"date":"2026-02-11","generatedAt":"2026-02-11T09:00:00.000Z","docxFile":"Morning Intelligence Briefing - Feb 9 2026.docx","indicators":[{"label":"USD/NGN","value":"₦1,363.84","trend":"up","note":"Parallel: ₦1,455"},{"label":"Brent Crude","value":"$68.18/bbl","trend":"flat","note":"+0.20%"},{"label":"Inflation","value":"15.15%","trend":"up","note":"Dec 2025 • ↓ from 17.33%"},{"label":"NGX ASI","value":"171,727","trend":"up","note":"YTD +10.36%"}],"headlines":["Naira appreciated 4.24% over the past month; FDC fair value at ₦1,256.79 per PPP.","NGX market cap reached ₦110.2T — best weekly performance of 2026 at +3.84%.","Gold hit $5,031/oz, up 72.45% YoY as safe haven demand persists.","91% of Nigerian CEOs expect economic growth in 2026 (PwC).","MPC meeting scheduled Feb 23-24 — rate easing expected."],"sections":[{"title":"Foreign Exchange","emoji":"💱","items":["CBN official (NFEM): ₦1,365.72/USD — appreciated ~6% from ₦1,449 early Feb","Parallel market: ₦1,455/USD — spread narrowing, positive confidence signal","CBN injected ₦1.7T liquidity through cumulative repayments","FDC fair value at ₦1,256.79 per PPP model — Naira still undervalued"]},{"title":"Commodities","emoji":"📊","items":["Brent Crude $68.05 — below $75 budget benchmark, fiscal pressure risk","Gold record $4,931/oz — +25% since 2025, safe haven demand persists","Copper $5.88/lb — +28% YoY, AI data centers need 10x traditional power loads","Cocoa $4,197/t — Nigeria output down 11% YoY to 305,000 MT","Wheat $5.38/bu — Nigeria imports 97% of consumption; price moves hit food costs"]},{"title":"Geopolitical Risk","emoji":"🌍","items":["US-China: 34.7-47.5% tariffs in fragile 1-year truce; China signed $700B+ African contracts","Nigeria-China upgraded to Comprehensive Strategic Partnership; $24.6B BRI investments","Ukraine-Russia: 450 drones + 71 missiles in largest aerial assault of year","35M Nigerians projected to face severe food insecurity in 2026 lean season","US-Iran: Nuclear talks in Oman; IRGC seized two tankers near Farsi Island"]},{"title":"Government Policy","emoji":"🏛️","items":["2026 Budget: ₦58.18T — Defence ₦5.41T | Infrastructure ₦3.56T | Education ₦3.52T | Health ₦2.48T","Tax Reform: 4 new acts effective Jan 1; FIRS transitioning to NRS with AI compliance","Manufacturers can now recover input VAT on ALL purchases including services","Nigeria First procurement mandate; concrete roads replacing asphalt (cement play)","WTO Trade Policy Review reinforces modern investment framework commitment"]},{"title":"Stock Watchlist","emoji":"📈","items":["Tier 1: ZENITHBANK (₦72, +14.89%), TRANSPOWER (~₦1.8T cap), DANGCEM, SEPLAT ($3B plan), MTNN (+13.50%)","Tier 2: GTCO (₦99), BUACEMENT (+640.8% Q3), ARADEL (+16.42%), BUAFOODS, UBA (₦45.20)","Tier 3: GEREGU (~₦2T cap), AIRTELAFRI (~₦8.5T), NESTLE (turnaround ₦72.5B profit), OANDO","Allocation: 40% Financial | 30% Energy/Infra | 20% Consumer/Defensive | 10% Digital/Growth"]},{"title":"AI & Technology","emoji":"🤖","items":["Nigeria ranked #1 globally for AI adoption and optimism","AI market growing 27.08% annually; projected to add $15B to GDP by 2030","17 data centers + 9 under construction; Kasi Cloud Lekki $250M hyperscale nearing completion","Digital economy projected $18.3B revenue in 2026; 5 unicorns","Global AI capex: Amazon, Google, Meta, Microsoft combined ~$650B for 2026"]},{"title":"NGX Market Review","emoji":"🏛️","items":["Close: 171,727.49 | Daily: +1.01% | Weekly: +3.84% | YTD: +10.36%","Market Cap: ₦110.234T (+₦1.1T this week) | Breadth: 60 gainers vs 19 losers","Sector leaders: Oil & Gas +2.47% | Insurance +2.16% | Industrial +1.70%","NGX could reach ₦262T in 2026 through Dangote Refinery & NNPC mega-listings","Rate easing cycle expected to trigger asset reallocation from fixed income to equities"]}]};

/* ====== MODAL COMPONENT ====== */
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-lg card-shadow p-0 max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
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
const btnPrimary = "w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition";
const btnDanger = "px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition";

/* ====== FORM COMPONENTS ====== */
const IncomeForm = ({ item, onClose, setIncomeStreams }) => {
    const [name, setName] = useState(item ? item.name : '');
    const [role, setRole] = useState(item ? (item.role || '') : '');
    const [company, setCompany] = useState(item ? (item.company || '') : '');
    const [type, setType] = useState(item ? item.type : 'Active');
    const [monthly, setMonthly] = useState(item ? String(item.monthly) : '');
    const [status, setStatus] = useState(item ? item.status : 'On Track');
    const [nextPayment, setNextPayment] = useState(item ? (item.nextPayment || '') : '');
    const [paymentCycle, setPaymentCycle] = useState(item ? (item.paymentCycle || 'Monthly') : 'Monthly');
    const [payments, setPayments] = useState(item && item.payments ? item.payments : []);
    const addPaymentMilestone = () => {
        setPayments(prev => [...prev, { id: Date.now(), label: '', amount: '', dueDate: '', paid: false, paidDate: null }]);
    };
    const updateMilestone = (mId, field, value) => {
        setPayments(prev => prev.map(p => p.id === mId ? { ...p, [field]: value } : p));
    };
    const removeMilestone = (mId) => {
        setPayments(prev => prev.filter(p => p.id !== mId));
    };
    const toggleMilestonePaid = (mId) => {
        setPayments(prev => prev.map(p => p.id === mId ? { ...p, paid: !p.paid, paidDate: !p.paid ? new Date().toISOString().split('T')[0] : null } : p));
    };
    const submit = () => {
        if (!name || !monthly) return;
        const val = Number(monthly.replace(/[^0-9.]/g, ''));
        const data = { name, role, company, type, monthly: val, status, nextPayment, paymentCycle, payments: payments.map(p => ({ ...p, amount: Number(String(p.amount).replace(/[^0-9.]/g, '')) || 0 })) };
        if (item) {
            setIncomeStreams(prev => prev.map(s => s.id === item.id ? { ...s, ...data } : s));
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
                <Field label="Monthly Amount (₦)"><input className={inputCls} value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="e.g. 1000000" type="number" /></Field>
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
                <button type="button" onClick={addPaymentMilestone} className="text-xs text-blue-500 hover:text-blue-600 font-medium">+ Add Milestone</button>
              </div>
              {payments.length === 0 && <p className="text-xs text-gray-400 italic mb-2">No milestones yet. Add deposit/balance tracking.</p>}
              {payments.map((pm, pmIdx) => (
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
            <button onClick={() => onChooseDaily(task)} className={"flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition hover:shadow-md " + (task.task_type === "quick" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300")}>
              <span className="text-2xl">📋</span>
              <span className="text-sm font-medium text-gray-900">Daily Tasks</span>
              <span className="text-xs text-gray-500">Add to today's plan</span>
            </button>
            <button onClick={() => onChooseWeekly(task)} className={"flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition hover:shadow-md " + (task.task_type === "weekly" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300")}>
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
            {selectedUser && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">✓</span>}
          </div>
          {showSuggestions && <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
            {suggestions.map(u => <button key={u.id} onClick={() => selectUser(u)} className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2">
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
        {["high","medium","low"].map(p => <button key={p} onClick={() => setPriority(p)} className={"text-xs px-2 py-1 rounded-full transition " + (priority === p ? (p === "high" ? "bg-red-100 text-red-600" : p === "medium" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600") : "bg-gray-100 text-gray-400 hover:bg-gray-200")}>{p}</button>)}
        {taskType === "weekly" && <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1" />}
      </div>
      <button onClick={launch} disabled={!taskText.trim() || !selectedUser || sending} className={"w-full py-2.5 rounded-xl text-sm font-semibold transition " + (taskText.trim() && selectedUser && !sending ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
        {sent ? "✓ Launched!" : sending ? "Launching..." : "🚀 Launch Task"}
      </button>
    </div>
  );
};


const ProjectForm = ({ item, onClose, setProjects, getProjectProgress }) => {
    const [name, setName] = useState(item ? item.name : '');
    const [desc, setDesc] = useState(item ? item.desc : '');
    const [status, setStatus] = useState(item ? item.status : 'Planning');
    const [launch, setLaunch] = useState(item ? item.launch : '');
    const [team, setTeam] = useState(item ? String(item.team) : '1');
    const [next, setNext] = useState(item ? item.next : '');
    const autoProgress = item ? getProjectProgress(item.id) : null;
    const submit = () => {
        if (!name) return;
        if (item) {
            setProjects(prev => prev.map(p => p.id === item.id ? { ...p, name, desc, status, launch, team: Number(team), next } : p));
        } else {
            setProjects(prev => [...prev, { id: newId(), name, desc, progress: 0, status, start: new Date().toISOString().split('T')[0], launch, team: Number(team), next }]);
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Project' : 'Add Project'} onClose={onClose}>
            <Field label="Project Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NuOperandi MVP" /></Field>
            <Field label="Description"><input className={inputCls} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description" /></Field>
            {item && autoProgress !== null && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">Progress auto-calculated from linked tasks: {autoProgress}%</p>
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
    const [subtasks, setSubtasks] = useState(item && item.subtasks ? item.subtasks.map(s => ({...s})) : []);
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
        const { data } = await supabase.from('profiles').select('username, full_name').ilike('username', clean + '%').limit(5);
        setUserSuggestions(data || []);
    };
    const submit = () => {
        if (!task) return;
        const pid = projId ? Number(projId) : null;
        if (item) {
            setWeeklyPlan(prev => prev.map(w => w.id === item.id ? { ...w, task, projectId: pid, subtasks, deadline, delegatedTo } : w));
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
                    {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </Field>
            <Field label="Sub-goals">
                {subtasks.length > 0 && (
                    <div className="space-y-2 mb-3">
                        {subtasks.map(s => (
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
                {userSuggestions.length > 0 && <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">{userSuggestions.map(u => (
                    <div key={u.username} className="px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center gap-2" onClick={() => { setDelegatedTo(u.username); setUserSuggestions([]); }}>
                        <span className="font-medium text-blue-600">@{u.username}</span><span className="text-gray-400">{u.full_name}</span>
                    </div>
                ))}</div>}
            </Field>
            <div className="flex gap-2 mt-6">
                {item && <button className={btnDanger} onClick={() => { setWeeklyPlan(prev => prev.filter(w => w.id !== item.id)); onClose(); }}>Delete</button>}
                <button className={btnPrimary} onClick={submit}>{item ? 'Save Changes' : 'Add Weekly Task'}</button>
            </div>
        </Modal>
    );
};

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
        const { data } = await supabase.from('profiles').select('username, full_name').ilike('username', clean + '%').limit(5);
        setUserSuggestions(data || []);
    };
    const submit = () => {
        if (!task) return;
        const pid = projId ? Number(projId) : null;
        if (item) {
            setQuickTasks(prev => prev.map(t => t.id === item.id ? { ...t, task, priority, due, projectId: pid, delegatedTo } : t));
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
                    {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                {userSuggestions.length > 0 && <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">{userSuggestions.map(u => (
                    <div key={u.username} className="px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center gap-2" onClick={() => { setDelegatedTo(u.username); setUserSuggestions([]); }}>
                        <span className="font-medium text-blue-600">@{u.username}</span><span className="text-gray-400">{u.full_name}</span>
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
            setTimeBlocks(prev => prev.map(b => b.id === item.id ? { ...b, task, time, end, cat } : b));
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
        if (item) { setIdeas(prev => prev.map(i => i.id === item.id ? { ...i, text } : i)); }
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
        if (item) { setLearning(prev => prev.map((l, i) => i === idx ? text : l)); }
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
    const autoInitials = name.trim() ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '';

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
            const profile = { name: name.trim(), username: username.trim().toLowerCase().replace(/\s+/g, ''), initials: autoInitials };
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
                onAuth(data.user, { name: prof.full_name, username: prof.username, initials: prof.initials });
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
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">{autoInitials}</div>
                            <div><p className="text-sm font-medium text-gray-700">{name.trim()}</p><p className="text-xs text-gray-400">@{username}</p></div>
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-500 mt-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button className={btnPrimary + ' mt-6 w-full'} onClick={mode === 'signup' ? handleSignUp : handleLogin} disabled={loading}>
                    {loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Log In')}
                </button>
                <p className="text-xs text-gray-400 mt-4">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-blue-500 hover:underline">{mode === 'login' ? 'Sign up' : 'Log in'}</button></p>
            </div>
        </div>
    );
};

const ProfileEditModal = ({ userProfile, setUserProfile, supaUser, onClose }) => {
    const [name, setName] = useState(userProfile ? userProfile.name : '');
    const [username, setUsername] = useState(userProfile ? userProfile.username : '');
    const [saving, setSaving] = useState(false);
    const autoInitials = name.trim() ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '';
    const handleSignOut = async () => { await supabase.auth.signOut(); window.location.reload(); };
    const submit = async () => {
        if (!name.trim() || !username.trim()) return;
        setSaving(true);
        const profile = { name: name.trim(), username: username.trim().toLowerCase().replace(/\s+/g, ''), initials: autoInitials };
        setUserProfile(profile);
        if (supaUser) {
            await supabase.from('profiles').update({ full_name: profile.name, username: profile.username, initials: profile.initials }).eq('id', supaUser.id);
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
            {autoInitials && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">{autoInitials}</div>
                    <div><p className="text-sm font-medium text-gray-700">{name.trim()}</p><p className="text-xs text-gray-400">@{username.trim().toLowerCase().replace(/\s+/g, '')}</p></div>
                </div>
            )}
            <button className={btnPrimary + ' w-full'} onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
            <button onClick={handleSignOut} className="w-full mt-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition">Sign Out</button>
        </Modal>
    );
};

const NotificationsPanel = ({ notifications, onMarkRead, onClose, delegatedToMe, onAcceptTask, quickTasks, weeklyPlan, setActiveModule, setPlannerTab }) => {
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
    onMarkRead(n.id);
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fixed top-16 right-8 bg-white rounded-xl border border-gray-100 card-shadow w-96 max-h-96 overflow-y-auto z-50" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Notifications</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">{I.x("#9CA3AF")}</button>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">No notifications yet</div>
        ) : notifications.map(n => {
          const found = findTaskInPlanner(n);
          return (
            <div key={n.id} onClick={() => handleNotifClick(n)} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-purple-600">{n.sender_name ? n.sender_name.split(' ').map(w => w[0]).join('').substring(0, 2) : '?'}</span>
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
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>}
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
        const auto = initials || name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        if (item) { setTeamMembers(prev => prev.map(m => m.id === item.id ? { ...m, name, initials: auto, status } : m)); }
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
    ] : activeModule === 'briefing' ? [
        { label: 'Team Member', action: () => { onClose(); setModal('addTeam'); } },
    ] : [
        { label: 'Weekly Task', action: () => { onClose(); setModal('addWeekly'); } },
        { label: 'Daily Task', action: () => { onClose(); setModal('addTask'); } },
        { label: 'Time Block', action: () => { onClose(); setModal('addTimeBlock'); } },
        { label: 'Idea', action: () => { onClose(); setModal('addIdea'); } },
        { label: 'Learning Goal', action: () => { onClose(); setModal('addLearning'); } },
    ];
    return (
        <div className="fixed inset-0 z-40" onClick={onClose}>
            <div className="fixed bottom-24 right-8 bg-white rounded-xl border border-gray-100 card-shadow p-2 min-w-[180px] z-50" onClick={e => e.stopPropagation()}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2">Add New</p>
                {items.map((it, i) => (
                    <button key={i} onClick={it.action} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition flex items-center gap-2">
                        {I.plus("#3B82F6")}
                        {it.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ExpenseForm = ({ item, onClose, setExpenses, incomeStreams }) => {
    const [name, setName] = useState(item ? item.name : '');
    const [amount, setAmount] = useState(item ? String(item.amount) : '');
    const [category, setCategory] = useState(item ? item.category : 'Salary');
    const [frequency, setFrequency] = useState(item ? item.frequency : 'Monthly');
    const [linkedStreamId, setLinkedStreamId] = useState(item ? (item.linkedStreamId || '') : '');
    const [note, setNote] = useState(item ? (item.note || '') : '');
    const [dueDate, setDueDate] = useState(item ? (item.dueDate || '') : '');
    const submit = () => {
        if (!name || !amount) return;
        const val = Number(amount.replace(/[^0-9.]/g, ''));
        const lsid = linkedStreamId ? Number(linkedStreamId) : null;
        const data = { name, amount: val, category, frequency, linkedStreamId: lsid, note, dueDate: dueDate || null };
        if (item) {
            setExpenses(prev => prev.map(e => e.id === item.id ? { ...e, ...data } : e));
        } else {
            setExpenses(prev => [...prev, { id: newId(), ...data }]);
        }
        onClose();
    };
    return (
        <Modal title={item ? 'Edit Expense' : 'Add Expense'} onClose={onClose}>
            <Field label="Expense Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Staff Salaries, Office Rent" /></Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Amount (₦)"><input className={inputCls} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 200000" type="number" /></Field>
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
                    {incomeStreams.map(s => <option key={s.id} value={s.id}>{s.name}{s.company ? ' (' + s.company + ')' : ''}</option>)}
                </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Due Date (optional)"><input className={inputCls} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></Field>
                <Field label="Note (optional)"><input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. 2 staff members" /></Field>
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
    const [plannerTab, setPlannerTab] = useState('weekly');
    const [collapsedProjects, setCollapsedProjects] = useState(() => load('collapsedProjects', {}));
    const [userProfile, setUserProfile] = useState(() => load('profile', null));
    const [supaUser, setSupaUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [delegatedToMe, setDelegatedToMe] = useState([]);
    const [delegatedByMe, setDelegatedByMe] = useState([]);
  const [acceptingTask, setAcceptingTask] = useState(null);

    /* -- Editable Data State -- */
    const [incomeStreams, setIncomeStreams] = useState(() => load('income', defaultIncome));
    const [projects, setProjects] = useState(() => load('projects', defaultProjects));
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
    const [expenses, setExpenses] = useState(() => load('expenses', defaultExpenses));
    const [briefing, setBriefing] = useState(() => load('briefing', embeddedBriefing));
    const [nationBriefing, setNationBriefing] = useState(() => load('nationBriefing', embeddedNation));
    const [taskHistory, setTaskHistory] = useState(() => load('taskHistory', []));
    const [stateLoaded, setStateLoaded] = useState(false);

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
    useEffect(() => { save('briefing', briefing); }, [briefing]);
    useEffect(() => { save('nationBriefing', nationBriefing); }, [nationBriefing]);
    useEffect(() => { save('taskHistory', taskHistory); }, [taskHistory]);
    useEffect(() => { if (userProfile) save('profile', userProfile); }, [userProfile]);

    /* -- Supabase Auth -- */
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setSupaUser(session.user);
                    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    if (prof) setUserProfile({ name: prof.full_name, username: prof.username, initials: prof.initials });
                }
            } catch (e) { console.log('Auth init:', e); }
            setAuthLoading(false);
        };
        initAuth();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) { setSupaUser(session.user); } else { setSupaUser(null); }
        });
        return () => subscription?.unsubscribe();
    }, []);

    /* -- Real-time Notifications -- */
    useEffect(() => {
        if (!supaUser) return;
        const fetchNotifs = async () => {
            const { data } = await supabase.from('notifications').select('*').eq('user_id', supaUser.id).order('created_at', { ascending: false }).limit(20);
            if (data) setNotifications(data);
        };
        fetchNotifs();
        const channel = supabase.channel('notifs-' + supaUser.id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + supaUser.id }, payload => {
            setNotifications(prev => [payload.new, ...prev]);
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supaUser]);

    /* -- Delegated to me -- */
    useEffect(() => {
        if (!supaUser || !userProfile) return;
        const fetchDelegated = async () => {
            const { data } = await supabase.from('delegated_tasks').select('*').eq('recipient_username', userProfile.username).order('created_at', { ascending: false });
            if (data) setDelegatedToMe(data);
        };
        fetchDelegated();
        const fetchDelegatedByMe = async () => {
            const { data } = await supabase.from('delegated_tasks').select('*').eq('delegator_id', supaUser.id).order('created_at', { ascending: false });
            if (data) setDelegatedByMe(data);
        };
        fetchDelegatedByMe();
        const channel = supabase.channel('delegated-' + userProfile.username).on('postgres_changes', { event: '*', schema: 'public', table: 'delegated_tasks', filter: 'recipient_username=eq.' + userProfile.username }, () => { fetchDelegated(); }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supaUser, userProfile]);

    const markNotifRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleAuth = (user, profile) => {
        setSupaUser(user);
        setUserProfile(profile);
        save('profile', profile);
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

    useEffect(() => {
        const liveBriefing = generateLiveBriefing();
        setBriefing(liveBriefing);
    }, []);

    useEffect(() => {
        if (embeddedNation && embeddedNation.generatedAt) {
            const storedN = nationBriefing;
            if (!storedN || !storedN.generatedAt || embeddedNation.generatedAt > storedN.generatedAt) {
                setNationBriefing(embeddedNation);
            }
        }
        fetchLiveNationData();
    }, []);

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
                tasks: completed.map(t => ({
                    ...t,
                    completedAt: new Date().toISOString()
                }))
            };
            setTaskHistory(prev => {
                const existing = prev.find(h => h.date === today);
                if (existing) {
                    return prev.map(h => h.date === today
                        ? { ...h, tasks: [...h.tasks, ...archiveEntry.tasks] }
                        : h
                    );
                }
                return [archiveEntry, ...prev];
            });
            // Remove archived tasks from active list
            const completedIds = completed.map(t => t.id);
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
    const fmtNaira = (v) => '₦' + (Number(v) >= 1000000 ? (Number(v) / 1000000).toFixed(1) + 'M' : Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + 'K' : Number(v).toLocaleString());
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
    setCompletedTasks(p => ({ ...p, [id]: !p[id] }));
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
            if (existing) return ph.map(h => h.date === today ? { ...h, tasks: [...h.tasks, archiveEntry] } : h);
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
    setDelegatedToMe(prev => prev.map(d => d.id === task.id ? {...d, status: 'accepted'} : d));
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
    setDelegatedToMe(prev => prev.map(d => d.id === task.id ? {...d, status: 'accepted'} : d));
    setAcceptingTask(null);
  };
  const toggleWeekly = (id) => {
    const wasCompleted = completedWeekly[id];
    setCompletedWeekly(p => ({ ...p, [id]: !p[id] }));
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
            if (existing) return ph.map(h => h.date === today ? { ...h, tasks: [...h.tasks, archiveEntry] } : h);
            return [{ date: today, tasks: [archiveEntry] }, ...ph];
          });
          return prev.filter(t => t.id !== id);
        });
        setCompletedWeekly(p => { const next = { ...p }; delete next[id]; return next; });
      }, 1500);
    }
  };
  const toggleSubtask = (taskId, subtaskId) => {
    setWeeklyPlan(prev => prev.map(w => {
      if (w.id !== taskId) return w;
      return { ...w, subtasks: (w.subtasks || []).map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) };
    }));
  };
  const archiveCompleted = () => {
        const today = new Date().toISOString().split('T')[0];
        const completed = quickTasks.filter(t => completedTasks[t.id]);
        if (completed.length === 0) return;
        const archiveEntry = {
            date: today,
            tasks: completed.map(t => ({ ...t, completedAt: new Date().toISOString() }))
        };
        setTaskHistory(prev => {
            const existing = prev.find(h => h.date === today);
            if (existing) {
                return prev.map(h => h.date === today ? { ...h, tasks: [...h.tasks, ...archiveEntry.tasks] } : h);
            }
            return [archiveEntry, ...prev];
        });
        const completedIds = completed.map(t => t.id);
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

    const generateLiveBriefing = useCallback(() => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const streamCount = incomeStreams.filter(s => Number(s.monthly || 0) > 0).length;
        const pendingToday = quickTasks.filter(t => !completedTasks[t.id]);
        const activeProjects = projects.filter(p => p.status !== 'Completed');

        const headline = `${streamCount} income stream${streamCount !== 1 ? 's' : ''} active. ${fmtNaira(netMonthly)} net monthly. ${pendingToday.length} task${pendingToday.length !== 1 ? 's' : ''} pending today.`;

        const sections = [];

        sections.push({
            title: "Financial Snapshot",
            items: [
                `Monthly gross income: ${fmtNaira(totalMonthly)} across ${streamCount} active stream${streamCount !== 1 ? 's' : ''}.`,
                `Monthly expenses: ${fmtNaira(totalExpenses)} — net income: ${fmtNaira(netMonthly)}.`,
                `Annual projected: ${fmtNaira(totalMonthly * 12)} gross, ${fmtNaira(netMonthly * 12)} net.`,
                nextPaymentDue ? `Next payment: ${new Date(nextPaymentDue.nextPayment + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} — ${nextPaymentDue.role}, ${nextPaymentDue.name}.` : 'No upcoming payments scheduled.'
            ]
        });

        if (pendingToday.length > 0) {
            sections.push({ title: "Today's Priorities", items: pendingToday.slice(0, 6).map(t => t.task) });
        } else {
            sections.push({ title: "Today's Priorities", items: ["✅ All tasks complete — clear schedule ahead."] });
        }

        // Deadline awareness
        const deadlineTasks = weeklyPlan.filter(w => w.deadline && !completedWeekly[w.id]).sort((a, b) => a.deadline.localeCompare(b.deadline));
        if (deadlineTasks.length > 0) {
            const deadlineItems = deadlineTasks.slice(0, 3).map(w => {
                const d = new Date(w.deadline + 'T00:00:00');
                const today = new Date(); today.setHours(0,0,0,0);
                const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
                const urgency = diff <= 0 ? 'OVERDUE' : diff === 1 ? 'Due tomorrow' : diff <= 3 ? `Due in ${diff} days` : `Due ${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`;
                return `${urgency}: ${w.task}${w.delegatedTo ? ' (delegated to ' + w.delegatedTo + ')' : ''}`;
            });
            sections.push({ title: "Upcoming Deadlines", items: deadlineItems });
        }

        if (activeProjects.length > 0) {
            sections.push({
                title: "Project Status",
                items: activeProjects.slice(0, 5).map(p => {
                    const progress = getProjectProgress(p.id);
                    return `${p.name}: ${progress !== null ? progress + '% complete' : 'No linked tasks'} — ${p.status}`;
                })
            });
        }

        sections.push({
            title: "Strategic Notes",
            items: [
                netMonthly > 0 ? `Positive cash flow of ${fmtNaira(netMonthly)}/month — maintain trajectory.` : `Cash flow gap of ${fmtNaira(Math.abs(netMonthly))}/month — review expenses.`,
                streamCount < 3 ? `${streamCount} income stream${streamCount !== 1 ? 's' : ''} active — consider diversifying to reduce revenue risk.` : `${streamCount} income streams — well-diversified revenue base.`,
                `Annual target: ${fmtNaira(totalMonthly * 12)} gross. Track monthly to stay on course.`
            ]
        });

        return { date: dateStr, generatedAt: today.toISOString(), headline, sections, autoGenerated: true };
    }, [incomeStreams, quickTasks, completedTasks, projects, totalMonthly, totalExpenses, netMonthly, nextPaymentDue, getProjectProgress]);

    const fetchLiveNationData = useCallback(async () => {
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await res.json();
            if (data.result === 'success' && data.rates && data.rates.NGN) {
                const rate = data.rates.NGN;
                const timeStr = new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
                setNationBriefing(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        indicators: prev.indicators.map(ind =>
                            ind.label === 'USD/NGN'
                                ? { ...ind, value: '₦' + rate.toFixed(2), note: 'Live • ' + timeStr, trend: 'up' }
                                : ind
                        ),
                        lastLiveUpdate: new Date().toISOString()
                    };
                });
            }
        } catch (e) { }
    }, []);

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

    const catColors = { amber: 'bg-amber-50 border-amber-200 text-amber-800', blue: 'bg-blue-50 border-blue-200 text-blue-800', purple: 'bg-purple-50 border-purple-200 text-purple-800', green: 'bg-emerald-50 border-emerald-200 text-emerald-800' };
    const catDot = { amber: 'bg-amber-400', blue: 'bg-blue-400', purple: 'bg-purple-400', green: 'bg-emerald-400' };
    const statusColors = { 'On Track': 'bg-emerald-50 text-emerald-700', 'Growing': 'bg-blue-50 text-blue-700', 'At Risk': 'bg-red-50 text-red-700', 'In Progress': 'bg-blue-50 text-blue-700', 'Planning': 'bg-amber-50 text-amber-700', 'Launch Ready': 'bg-emerald-50 text-emerald-700', 'Completed': 'bg-gray-100 text-gray-600' };
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
            {action && <button onClick={action} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition">{I.plus("white")} {actionLabel}</button>}
        </div>
    );

    const Sidebar = () => (
        <div className={'fixed left-0 top-0 h-screen flex flex-col z-10 bg-white border-r border-gray-100 sidebar-shadow transition-all duration-300 ' + (sidebarOpen ? 'w-60' : 'w-16')}>
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
                {sidebarOpen ? (
                    <div className="flex items-center gap-2.5"><Emblem size={34} /><span className="text-base font-semibold text-gray-900 tracking-tight">NuOperandi</span></div>
                ) : (
                    <Emblem size={28} />
                )}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-50">{sidebarOpen ? I.x("#9CA3AF") : I.menu("#9CA3AF")}</button>
            </div>
            <nav className="flex-1 p-2 space-y-0.5 mt-2">
                {[
                    { id: 'command', icon: () => I.command(activeModule === 'command' ? '#3B82F6' : '#6B7280'), label: 'Command Centre' },
                    { id: 'income', icon: () => I.dollar(activeModule === 'income' ? '#3B82F6' : '#6B7280'), label: 'Income & Projects' },
                    { id: 'briefing', icon: () => I.bar(activeModule === 'briefing' ? '#3B82F6' : '#6B7280'), label: 'Morning Briefing' },
                    { id: 'planner', icon: () => I.calendar(activeModule === 'planner' ? '#3B82F6' : '#6B7280'), label: 'Planner' },
                    { id: 'history', icon: () => I.history(activeModule === 'history' ? '#3B82F6' : '#6B7280'), label: 'History' },
                { id: 'boardroom', icon: () => I.bar(activeModule === 'boardroom' ? '#3B82F6' : '#6B7280'), label: 'Boardroom' }
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveModule(item.id)}
                        className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ' + (activeModule === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50')}>
                        {item.icon()}{sidebarOpen && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>
            <div className="p-2 border-t border-gray-50">
                <button onClick={() => setModal('settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition text-sm">{I.settings("#9CA3AF")}{sidebarOpen && <span>Settings</span>}</button>
            </div>
        </div>
    );

    const TopBar = () => {
        const todayTasksTotal = quickTasks.length;
        const todayTasksDone = quickTasks.filter(t => completedTasks[t.id]).length;
        const todayRemaining = todayTasksTotal - todayTasksDone;
        const delegatedActiveCount = delegatedByMe.filter(d => d.status === 'pending' || d.status === 'accepted').length;
        return (
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-gray-900">{greeting()}, <span className="text-blue-500">{userProfile ? userProfile.name.split(' ')[0] : 'User'}</span></h1>
                <p className="text-sm text-gray-400 mt-0.5">{fmtDate(currentTime)}</p>
                <p className="text-xs text-gray-400 mt-2 italic truncate max-w-xl" style={{color:'#B8952C'}}>"{getQuote()}"</p>
            </div>
            <div className="flex items-center gap-5 flex-shrink-0">
                <button onClick={() => { setActiveModule('planner'); setPlannerTab('daily'); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition cursor-pointer group" title="Go to Today's Tasks">
                    {I.clipboard("#6B7280")}
                    <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition">{todayTasksDone}/{todayTasksTotal} tasks</span>
                    {todayRemaining > 0 && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{todayRemaining}</span>}
                    {todayRemaining === 0 && todayTasksTotal > 0 && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Done</span>}
                </button>
              {delegatedActiveCount > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">{delegatedActiveCount} delegated</span>}
                <span className="text-sm text-gray-400 font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-gray-400 hover:text-gray-600 transition">{I.bell("#9CA3AF")}{unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">{unreadCount}</span>}</button>
                <div onClick={() => setModal('settings')} className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-blue-600 transition">{userProfile ? userProfile.initials : 'U'}</div>
            </div>
        </div>
        );
    };

    const MetricCard = ({label, value, sub, trend, icon}) => (
        <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow card-shadow-hover transition-all">
            <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>{icon}</div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {sub && <p className={'text-xs mt-1.5 ' + (trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-400' : 'text-gray-400')}>{sub}</p>}
        </div>
    );

    const CommandCentre = () => {
        const pendingTasks = quickTasks.filter(t => !completedTasks[t.id]);
        const todayDone = quickTasks.length - pendingTasks.length;
        const weeklyDoneCC = (() => { let d = 0, t = 0; weeklyPlan.forEach(w => { if (w.subtasks && w.subtasks.length > 0) { t += w.subtasks.length; d += w.subtasks.filter(s => s.done).length; } else { t += 1; if (completedWeekly[w.id]) d += 1; } }); return { done: d, total: t }; })();
        const upcomingBlocks = timeBlocks.filter(b => !completedTimeBlocks[b.id]);
        const completedBlocks = timeBlocks.filter(b => completedTimeBlocks[b.id]);
        const briefingDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

        return (
        <div className="space-y-6 max-w-6xl">
            <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Net Income" value={fmtNaira(netMonthly)} sub={netMonthly >= 0 ? 'Healthy' : 'Deficit'} trend={netMonthly >= 0 ? 1 : -1} icon={I.wallet(netMonthly >= 0 ? "#10B981" : "#EF4444")} />
                <MetricCard label="Annual Projected" value={fmtNaira(totalMonthly * 12)} sub={fmtNaira(netMonthly * 12) + ' net/yr'} trend={netMonthly >= 0 ? 1 : -1} icon={I.bar("#8B5CF6")} />
                <MetricCard label="Next Payment" value={nextPaymentDue ? new Date(nextPaymentDue.nextPayment).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : '--'} sub={nextPaymentDue ? nextPaymentDue.name : 'No dates set'} trend={0} icon={I.calendar("#3B82F6")} />
                <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow card-shadow-hover transition-all cursor-pointer" onClick={() => { setActiveModule('planner'); setPlannerTab('daily'); }}>
                    <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Today's Tasks</span>{I.clipboard("#F59E0B")}</div>
                    <p className="text-2xl font-semibold text-gray-900">{todayDone}/{quickTasks.length}</p>
                    <p className={'text-xs mt-1.5 ' + (pendingTasks.length === 0 && quickTasks.length > 0 ? 'text-emerald-500' : pendingTasks.length > 0 ? 'text-amber-500' : 'text-gray-400')}>{pendingTasks.length === 0 && quickTasks.length > 0 ? 'All done!' : pendingTasks.length + ' pending'}</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-6">
                <div className="col-span-3 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {I.clock("#3B82F6")}
                                <h3 className="text-sm font-semibold text-gray-900">Today's Schedule</h3>
                                {upcomingBlocks.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{upcomingBlocks.length} remaining</span>}
                            </div>
                            <button onClick={() => setModal('addTimeBlock')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                        </div>
                        {timeBlocks.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm text-gray-400">No time blocks scheduled</p>
                                <button onClick={() => setModal('addTimeBlock')} className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-2">Add your first block</button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {timeBlocks.filter(b => !completedTimeBlocks[b.id]).map(b => (
                                    <div key={b.id} className={'px-5 py-3 flex items-center gap-4 group transition ' + (completedTimeBlocks[b.id] ? 'opacity-40 bg-gray-50/50' : 'hover:bg-gray-50/30')}>
                                        <span className="cursor-pointer flex-shrink-0" onClick={() => toggleBlock(b.id)}>
                                            {completedTimeBlocks[b.id] ? I.check("#10B981") : I.circle("#D1D5DB")}
                                        </span>
                                        <div className={'w-2 h-2 rounded-full flex-shrink-0 ' + (catDot[b.cat] || catDot.blue)}></div>
                                        <span className="text-xs font-medium text-gray-400 w-28 flex-shrink-0">{b.time}{b.end ? ' - ' + b.end : ''}</span>
                                        <span className={'text-sm flex-1 ' + (completedTimeBlocks[b.id] ? 'line-through text-gray-400' : 'text-gray-900')}>{b.task}</span>
                                        <button onClick={() => { setEditItem(b); setModal('editTimeBlock'); }} className="p-1 rounded-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100">{I.edit("#9CA3AF")}</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {timeBlocks.length > 0 && (
                            <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">{completedBlocks.length}/{timeBlocks.length} completed</span>
                                    <button onClick={() => { setActiveModule('planner'); setPlannerTab('schedule'); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium">View full schedule</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {I.zap("#F59E0B")}
                                <h3 className="text-sm font-semibold text-gray-900">Pending Tasks</h3>
                                {pendingTasks.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">{pendingTasks.length}</span>}
                            </div>
                            <button onClick={() => setModal('addTask')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                        </div>
                        {pendingTasks.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-gray-400">{quickTasks.length > 0 ? 'All tasks completed today!' : 'No tasks for today'}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {pendingTasks.slice(0, 6).map(t => {
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
                                <button onClick={() => { setActiveModule('planner'); setPlannerTab('daily'); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium">View all {pendingTasks.length} tasks</button>
                            </div>
                        )}
                    </div>
                    {quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    {I.user("#8B5CF6")}
                                    <h3 className="text-sm font-semibold text-gray-900">Delegated</h3>
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).length}</span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {quickTasks.filter(t => t.delegatedTo && !completedTasks[t.id]).slice(0, 4).map(t => (
                                    <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs flex-shrink-0">{t.delegatedTo.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}</div>
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
                                {delegatedToMe.filter(t => t.status === 'pending').slice(0, 5).map(t => (
                                    <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs flex-shrink-0">{t.delegator_name ? t.delegator_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?'}</div>
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

                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden group hover:shadow-md transition-all">
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white overflow-hidden">
                            <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.3) 11px, rgba(255,255,255,0.3) 12px)'}}></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-6 rounded-full bg-amber-400"></div>
                                        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Intelligence</span>
                                    </div>
                                    {I.newspaper("#B8952C")}
                                </div>
                                <h3 className="text-lg font-bold leading-snug mb-1" style={{fontFamily: 'Georgia, Times New Roman, serif'}}>Morning Briefing</h3>
                                <p className="text-xs text-slate-400 mb-3" style={{fontFamily: 'Georgia, serif'}}>{briefingDate}</p>

                                {briefing ? (
                                    <div>
                                        {briefing.headline && <p className="text-sm font-semibold text-amber-300 mb-3 leading-snug" style={{fontFamily: 'Georgia, serif'}}>{briefing.headline}</p>}

                                        <div className="border-t border-slate-700 pt-3 space-y-3 max-h-64 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent'}}>
                                            {briefing.sections && briefing.sections.map((sec, si) => (
                                                <div key={si}>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/80 mb-1.5">{sec.title}</p>
                                                    <div className="space-y-1">
                                                        {sec.items && sec.items.map((item, ii) => (
                                                            <div key={ii} className="flex gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                                                                <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-700 mt-3 pt-3 flex items-center justify-between">
                                            <p className="text-xs text-slate-500">{briefing.autoGenerated ? <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live</span> : 'Generated ' + (briefing.generatedAt ? new Date(briefing.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '')}</p>
                                            <button onClick={() => setActiveModule('briefing')} className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">Full briefing {I.arrowRight("#D4A843")}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="border-t border-slate-700 pt-3 mb-3 space-y-1.5">
                                            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-600"></div><p className="text-xs text-slate-500">Market intelligence & competitive analysis</p></div>
                                            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-600"></div><p className="text-xs text-slate-500">Revenue & performance summary</p></div>
                                            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-600"></div><p className="text-xs text-slate-500">Strategic priorities & action items</p></div>
                                        </div>
                                        <p className="text-xs text-slate-500 italic">No briefing yet today. Say "morning briefing" in Cowork to generate.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                        <div className="px-5 py-4 bg-emerald-50/50 border-b border-emerald-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                <h3 className="text-sm font-semibold text-gray-900">State of the Nation</h3>
                            </div>
                            <button onClick={() => setActiveModule('briefing')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Full report</button>
                        </div>
                        {nationBriefing ? (
                            <div>
                                <div className="grid grid-cols-2 divide-x divide-gray-50">
                                    {nationBriefing.indicators && nationBriefing.indicators.map((ind, i) => (
                                        <div key={i} className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-xs text-gray-400 mb-0.5">{ind.label}</p>
                                            <p className="text-sm font-semibold text-gray-900">{ind.value}</p>
                                            <p className={'text-xs ' + (ind.trend === 'up' ? 'text-emerald-500' : ind.trend === 'down' ? 'text-red-400' : 'text-gray-400')}>{ind.note}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-3 space-y-2 border-b border-gray-100">
                                    {nationBriefing.headlines && nationBriefing.headlines.slice(0, 4).map((h, i) => (
                                        <div key={i} className="flex gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                                            <p className="text-xs text-gray-600 leading-relaxed">{h}</p>
                                        </div>
                                    ))}
                                </div>
                                {nationBriefing.sections && nationBriefing.sections.length > 0 && (
                                    <div className="px-5 py-3 space-y-3 max-h-72 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: '#A7F3D0 transparent'}}>
                                        {nationBriefing.sections.map((sec, si) => (
                                            <div key={si}>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1.5">{sec.emoji} {sec.title}</p>
                                                <div className="space-y-1">
                                                    {sec.items && sec.items.map((item, ii) => (
                                                        <div key={ii} className="flex gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-300 mt-1.5 flex-shrink-0"></div>
                                                            <p className="text-xs text-gray-500 leading-relaxed">{item}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                    <p className="text-xs text-gray-400">{nationBriefing.lastLiveUpdate ? <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> FX live</span> : ('Data from ' + (nationBriefing.date ? new Date(nationBriefing.date + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : ''))}</p>
                                    {nationBriefing.docxFile && <p className="text-xs text-emerald-500 font-medium">{I.newspaper("#059669")} Report ready</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-sm text-gray-400">No nation briefing yet</p>
                                <p className="text-xs text-gray-400 mt-1">Say "morning briefing" in Cowork to generate</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow">
                        <div className="flex items-center gap-2.5 mb-4">
                            {I.trending("#3B82F6")}
                            <h3 className="text-sm font-semibold text-gray-900">Weekly Progress</h3>
                        </div>
                        <div className="flex items-end gap-3 mb-3">
                            <span className="text-3xl font-semibold text-gray-900">{weeklyDoneCC.done}</span>
                            <span className="text-sm text-gray-400 pb-1">/ {weeklyDoneCC.total} tasks</span>
                        </div>
                        {weeklyDoneCC.total > 0 && (
                            <div>
                                <div className="w-full h-2.5 bg-gray-100 rounded-full">
                                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{width: (weeklyDoneCC.total > 0 ? (weeklyDoneCC.done / weeklyDoneCC.total) * 100 : 0) + '%'}}></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{Math.round((weeklyDoneCC.done / weeklyDoneCC.total) * 100)}% complete this week</p>
                            </div>
                        )}
                        <button onClick={() => { setActiveModule('planner'); setPlannerTab('weekly'); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-3 flex items-center gap-1">View weekly plan {I.arrowRight("#3B82F6")}</button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {I.bulb("#8B5CF6")}
                                <h3 className="text-sm font-semibold text-gray-900">Active Projects</h3>
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{activeProjects.length}</span>
                            </div>
                            <button onClick={() => setActiveModule('income')} className="text-xs text-blue-500 hover:text-blue-600 font-medium">View all</button>
                        </div>
                        {activeProjects.length === 0 ? (
                            <div className="p-6 text-center"><p className="text-sm text-gray-400">No active projects</p></div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {[...activeProjects].sort((a, b) => (getProjectProgress(b.id) || 0) - (getProjectProgress(a.id) || 0)).slice(0, 5).map(p => {
                                    const prog = getProjectProgress(p.id) || 0;
                                    return (
                                    <div key={p.id} className="px-5 py-3 hover:bg-gray-50/30 transition cursor-pointer" onClick={() => { setEditItem(p); setModal('editProject'); }}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{prog}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width: prog + '%'}}></div></div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
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

        const catIcons = { 'Salary': '💰', 'Rent': '🏠', 'Operations': '⚙️', 'Marketing': '📣', 'Software': '💻', 'Transport': '🚗', 'Utilities': '⚡', 'Tax': '📋', 'Other': '📌' };

        return (
        <div className="space-y-8 max-w-6xl">
            <div className="grid grid-cols-5 gap-4">
                <MetricCard label="Monthly Income" value={fmtNaira(totalMonthly)} sub={incomeStreams.length + ' streams'} trend={1} icon={I.trending("#10B981")} />
                <MetricCard label="Monthly Expenses" value={fmtNaira(totalExpenses)} sub={expenses.length + ' items'} trend={-1} icon={I.receipt("#EF4444")} />
                <MetricCard label="Net Income" value={fmtNaira(netMonthly)} sub={netMonthly >= 0 ? 'Healthy' : 'Deficit'} trend={netMonthly >= 0 ? 1 : -1} icon={I.wallet(netMonthly >= 0 ? "#10B981" : "#EF4444")} />
                <MetricCard label="Annual Projected" value={fmtNaira(totalMonthly * 12)} sub={fmtNaira(netMonthly * 12) + ' net/yr'} trend={netMonthly >= 0 ? 1 : -1} icon={I.bar("#8B5CF6")} />
                <MetricCard label="Next Payment" value={nextPaymentDue ? new Date(nextPaymentDue.nextPayment).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : '--'} sub={nextPaymentDue ? nextPaymentDue.name : 'No dates set'} trend={0} icon={I.calendar("#3B82F6")} />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Income Streams</h2>
                    <button onClick={() => setModal('addIncome')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                </div>
                {incomeStreams.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                        <Empty icon={I.dollar("#9CA3AF")} title="No income streams yet" sub="Add your first income stream to start tracking" action={() => setModal('addIncome')} actionLabel="Add Income Stream" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {incomeStreams.map(s => (
                            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-5 card-shadow card-shadow-hover transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedIncome(expandedIncome === s.id ? null : s.id)}>
                                        <div className={'w-2 h-12 rounded-full ' + (s.status === 'Growing' ? 'bg-blue-400' : s.status === 'At Risk' ? 'bg-red-300' : 'bg-emerald-400')}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                                            {(s.role || s.company) && <p className="text-xs text-gray-400 mt-0.5">{s.role}{s.role && s.company ? ' • ' : ''}{s.company}</p>}
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                <span className={'text-xs px-2 py-0.5 rounded-full ' + (s.type === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500')}>{s.type}</span>
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
                                        <button onClick={e => { e.stopPropagation(); setEditItem(s); setModal('editIncome'); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition">{I.edit("#9CA3AF")}</button>
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
                                        {s.payments.map(pm => (
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
                    <button onClick={() => setModal('addExpense')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                </div>
                {expenses.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                        <Empty icon={I.receipt("#9CA3AF")} title="No expenses tracked yet" sub="Add expenses to see your net income" action={() => setModal('addExpense')} actionLabel="Add Expense" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {totalExpenses > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 card-shadow p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Monthly Breakdown</p>
                                    <p className="text-sm font-semibold text-gray-900">{fmtNaira(totalExpenses)}/mo</p>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full flex overflow-hidden mb-3">
                                    {expensesByCategory.map(([cat, amt], i) => {
                                        const colors = ['bg-red-400','bg-orange-400','bg-amber-400','bg-blue-400','bg-purple-400','bg-pink-400','bg-teal-400','bg-indigo-400','bg-gray-400'];
                                        return <div key={cat} className={colors[i % colors.length] + ' h-full'} style={{width: (amt / totalExpenses * 100) + '%'}} title={cat + ': ' + fmtNaira(amt)}></div>;
                                    })}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {expensesByCategory.map(([cat, amt], i) => {
                                        const dots = ['bg-red-400','bg-orange-400','bg-amber-400','bg-blue-400','bg-purple-400','bg-pink-400','bg-teal-400','bg-indigo-400','bg-gray-400'];
                                        return <div key={cat} className="flex items-center gap-1.5"><div className={'w-2 h-2 rounded-full ' + dots[i % dots.length]}></div><span className="text-xs text-gray-500">{cat}</span><span className="text-xs font-medium text-gray-700">{fmtNaira(amt)}</span></div>;
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            {expenses.map(e => {
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
                                                    <span className="text-xs text-gray-300">•</span>
                                                    <span className="text-xs text-gray-400">{e.frequency}</span>
                                                    {linked && <><span className="text-xs text-gray-300">•</span><span className="text-xs text-blue-500">from {linked.name}</span></>}
                                                    {e.dueDate && <><span className="text-xs text-gray-300">•</span><span className={'text-xs font-medium ' + dueColor}>{dueLabel}</span></>}
                                                    {e.note && <><span className="text-xs text-gray-300">•</span><span className="text-xs text-gray-400 italic">{e.note}</span></>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <p className="text-lg font-semibold text-red-600">-{fmtNaira(e.amount)}</p>
                                            <button onClick={() => { setEditItem(e); setModal('editExpense'); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition">{I.edit("#9CA3AF")}</button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Active Projects</h2>
                    <button onClick={() => setModal('addProject')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                </div>
                {projects.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                        <Empty icon={I.bar("#9CA3AF")} title="No projects yet" sub="Add your first project to start tracking progress" action={() => setModal('addProject')} actionLabel="Add Project" />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {projects.map(p => {
                            const autoP = getProjectProgress(p.id);
                            const displayProgress = autoP !== null ? autoP : p.progress;
                            const linkedCount = weeklyPlan.filter(w => w.projectId === p.id).length + quickTasks.filter(t => t.projectId === p.id).length;
                            return (
                            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 card-shadow card-shadow-hover transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <span className={'text-xs px-2 py-0.5 rounded-full ' + (statusColors[p.status] || 'bg-gray-100 text-gray-600')}>{p.status}</span>
                                        <button onClick={() => { setEditItem(p); setModal('editProject'); }} className="p-1 rounded-lg hover:bg-gray-100 transition ml-1">{I.edit("#9CA3AF")}</button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mb-4">{p.desc}</p>
                                <div className="mb-3">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-xs text-gray-400">{displayProgress}%</span>
                                        <span className="text-xs text-gray-400">{linkedCount > 0 ? linkedCount + ' linked tasks' : p.team + ' people'}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className={'h-full rounded-full transition-all ' + (autoP !== null ? 'bg-blue-500' : 'bg-blue-300')} style={{width: displayProgress + '%'}}></div></div>
                                </div>
                                {p.next && <p className="text-xs text-blue-600 font-medium mt-2">Next: {p.next}</p>}
                                {p.launch && <p className="text-xs text-gray-400 mt-1">Launch: {new Date(p.launch).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}</p>}
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        );
    };

    const BoardroomModule = () => {
    const taskHistory = JSON.parse(localStorage.getItem('nuop_taskHistory') || '[]');
    
    // Use delegatedByMe from Supabase (the full list of tasks YOU delegated)
    const allDelegated = delegatedByMe || [];
    
    // Build per-member stats from Supabase data
    const memberMap = {};
    allDelegated.forEach(d => {
      const name = d.recipient_username || 'Unknown';
      const key = name.toLowerCase();
      if (!memberMap[key]) memberMap[key] = { name, assigned: 0, completed: 0, accepted: 0, pending: [], key };
      memberMap[key].assigned++;
      if (d.status === 'completed') memberMap[key].completed++;
      else if (d.status === 'accepted') memberMap[key].accepted++;
      else memberMap[key].pending.push(d);
    });
    
    const memberList = Object.values(memberMap).map(m => ({
      ...m,
      completionRate: m.assigned > 0 ? Math.round((m.completed / m.assigned) * 100) : 0
    })).sort((a, b) => b.completed - a.completed);
    
    const totalAssigned = allDelegated.length;
    const totalCompleted = allDelegated.filter(d => d.status === 'completed').length;
    const totalAccepted = allDelegated.filter(d => d.status === 'accepted').length;
    const totalPending = allDelegated.filter(d => d.status === 'pending').length;
    const avgRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    const topContributor = memberList.find(m => m.completed > 0) || (memberList.length > 0 ? memberList[0] : null);
    
    // All pending tasks sorted by deadline (nearest first)
    const allPendingTasks = allDelegated
      .filter(d => d.status === 'pending' || d.status === 'accepted')
      .sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    
    const maxAssigned = Math.max(...memberList.map(m => m.assigned), 1);
    
    // Unique team members count (combine registered team + delegated-to people)
    const uniqueMembers = new Set();
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
    const maxWeekCount = Math.max(...weeks.map(w => w.count), 1);

    return (<div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-gray-900">Boardroom</h1>
            <p className="text-sm text-gray-500 mt-1">Team productivity overview</p></div></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.user("#6366F1")}<p className="text-xs text-gray-500">Team Members</p></div>
            <p className="text-2xl font-bold text-gray-900">{uniqueMembers.size}</p></div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.trending("#F59E0B")}<p className="text-xs text-gray-500">Top Contributor</p></div>
            <p className="text-lg font-bold text-gray-900 truncate">{topContributor ? topContributor.name : '-'}</p>
            {topContributor && <p className="text-xs text-gray-400">{topContributor.completed} completed</p>}</div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.clipboard("#3B82F6")}<p className="text-xs text-gray-500">Total Delegated</p></div>
            <p className="text-2xl font-bold text-gray-900">{totalAssigned}</p>
            <p className="text-xs text-gray-400">{totalPending} pending, {totalAccepted} accepted, {totalCompleted} done</p></div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">{I.check("#10B981")}<p className="text-xs text-gray-500">Avg Completion Rate</p></div>
            <p className="text-2xl font-bold text-gray-900">{avgRate}%</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Team Overview</h2></div>
          {memberList.length === 0 ? (<div className="p-8 text-center"><p className="text-sm text-gray-400">No delegated tasks yet. Assign tasks to team members to see productivity data.</p></div>
          ) : (<table className="w-full"><thead><tr className="text-xs text-gray-500 border-b border-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Member</th>
                  <th className="text-center px-3 py-3 font-medium">Assigned</th>
                  <th className="text-center px-3 py-3 font-medium">Completed</th>
                  <th className="text-center px-3 py-3 font-medium">Accepted</th>
                  <th className="text-center px-3 py-3 font-medium">Pending</th>
                  <th className="text-left px-3 py-3 font-medium">Completion Rate</th></tr></thead>
              <tbody>{memberList.map((m, i) => (<tr key={m.key} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="px-5 py-3"><div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">{m.name.charAt(0).toUpperCase()}</div>
                        <span className="text-sm font-medium text-gray-800">{m.name}</span></div></td>
                    <td className="text-center px-3 py-3 text-sm text-gray-600">{m.assigned}</td>
                    <td className="text-center px-3 py-3 text-sm text-emerald-600 font-medium">{m.completed}</td>
                    <td className="text-center px-3 py-3 text-sm text-blue-600 font-medium">{m.accepted}</td>
                    <td className="text-center px-3 py-3 text-sm text-amber-600 font-medium">{m.pending.length}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[100px]">
                          <div className="h-2 rounded-full" style={{width: Math.max(m.completionRate, 2) + '%', backgroundColor: m.completionRate >= 70 ? '#10B981' : m.completionRate >= 40 ? '#F59E0B' : '#EF4444'}}></div></div>
                        <span className="text-xs text-gray-500 w-8">{m.completionRate}%</span></div></td></tr>))}</tbody></table>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 card-shadow">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Pending Tasks</h2>
              <span className="text-xs text-gray-400">sorted by deadline</span></div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {allPendingTasks.length === 0 ? (<div className="p-6 text-center"><p className="text-sm text-gray-400">All tasks completed!</p></div>
              ) : allPendingTasks.slice(0, 12).map((d, i) => (<div key={d.id || i} className="px-5 py-3 flex items-center justify-between gap-2">
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
                                setAlertMessage('Reminder sent to ' + d.recipient_username + '!');
                              } else {
                                setAlertMessage('Could not find user ' + d.recipient_username);
                              }
                            } catch (err) {
                              console.log('Reminder error:', err);
                              setAlertMessage('Failed to send reminder');
                            }
                            setTimeout(() => setAlertMessage(''), 3000);
                          }} className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium whitespace-nowrap">Remind</button></div>))}
              {allPendingTasks.length > 12 && <div className="px-5 py-2 text-center"><p className="text-xs text-gray-400">+ {allPendingTasks.length - 12} more tasks</p></div>}</div></div>
          <div className="bg-white rounded-xl border border-gray-100 card-shadow">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Assigned vs Completed</h2></div>
            <div className="p-5">{memberList.length === 0 ? (<div className="text-center py-6"><p className="text-sm text-gray-400">No data yet</p></div>
              ) : (<div className="space-y-3">{memberList.map(m => (<div key={m.key} className="space-y-1">
                      <p className="text-xs text-gray-600">{m.name}</p>
                      <div className="flex items-center gap-2"><div className="flex-1 flex gap-1">
                          <div className="h-5 rounded-l bg-blue-400 flex items-center justify-center" style={{width: Math.max((m.assigned / maxAssigned) * 100, 8) + '%'}}><span className="text-[10px] text-white font-medium">{m.assigned}</span></div>
                          <div className="h-5 rounded-r bg-emerald-400 flex items-center justify-center" style={{width: Math.max((m.completed / maxAssigned) * 100, 8) + '%'}}><span className="text-[10px] text-white font-medium">{m.completed}</span></div></div></div></div>))}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-400"></div><span className="text-xs text-gray-500">Assigned</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-400"></div><span className="text-xs text-gray-500">Completed</span></div></div></div>)}</div></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 card-shadow">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Productivity Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tasks completed per week (last 12 weeks)</p></div>
          <div className="p-5"><div className="flex items-end gap-2">{weeks.map((w, i) => {
                const intensity = w.count > 0 ? Math.max(0.15, w.count / maxWeekCount) : 0;
                return (<div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-md" style={{height: Math.max(w.count > 0 ? 20 : 8, (w.count / maxWeekCount) * 80) + 'px', backgroundColor: w.count > 0 ? 'rgba(59,130,246,' + intensity + ')' : '#F3F4F6'}} title={w.count + ' tasks'}></div>
                    <span className="text-[9px] text-gray-400">{w.label}</span>
                    {w.count > 0 && <span className="text-[10px] text-gray-500 font-medium">{w.count}</span>}</div>);
              })}</div></div></div>
      </div>);
  };

  const BriefingModule = () => (
        <div className="space-y-8 max-w-6xl">
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
                <p className="text-sm text-blue-800 font-medium">Your morning intelligence briefing document is generated separately.</p>
                <p className="text-xs text-blue-600 mt-1">Say "morning briefing" in Cowork to generate today's document with live market data.</p>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Team</h2>
                    <button onClick={() => setModal('addTeam')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                </div>
                {teamMembers.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                        <Empty icon={I.calendar("#9CA3AF")} title="No team members yet" sub="Add your team to track availability" action={() => setModal('addTeam')} actionLabel="Add Team Member" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow flex flex-wrap items-center gap-6">
                        {teamMembers.map((m, i) => (
                            <div key={m.id || i} className="flex items-center gap-3 group cursor-pointer" onClick={() => { setEditItem(m); setModal('editTeam'); }}>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">{m.initials}</div>
                                    <div className={'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ' + (m.status === 'available' ? 'bg-emerald-400' : m.status === 'meeting' ? 'bg-amber-400' : 'bg-gray-300')}></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                                    <p className="text-xs text-gray-400 capitalize">{m.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Snapshot</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow text-center">
                        <p className="text-2xl font-semibold text-gray-900">{incomeStreams.length}</p>
                        <p className="text-xs text-gray-400 mt-1">Income Streams</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow text-center">
                        <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
                        <p className="text-xs text-gray-400 mt-1">Active Projects</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow text-center">
                        <p className="text-2xl font-semibold text-gray-900">{quickTasks.filter(t => !completedTasks[t.id]).length}</p>
                        <p className="text-xs text-gray-400 mt-1">Pending Tasks</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const PlannerModule = () => {
        const weeklyByProject = useMemo(() => {
            const grouped = {};
            const unlinked = [];
            weeklyPlan.forEach(w => {
                if (w.projectId) {
                    if (!grouped[w.projectId]) grouped[w.projectId] = [];
                    grouped[w.projectId].push(w);
                } else {
                    unlinked.push(w);
                }
            });
            return { grouped, unlinked };
        }, [weeklyPlan]);

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

        const WeeklyTaskRow = ({ w, showProject }) => {
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
                            {!completedWeekly[w.id] && !alreadyPushed && (
                                <button onClick={() => pushToDaily(w)} className="p-1.5 rounded-lg hover:bg-blue-50 transition text-blue-500" title="Push to today">
                                    {I.arrowRight("#3B82F6")}
                                </button>
                            )}
                            {alreadyPushed && <span className="text-xs text-emerald-500 px-2">In today</span>}
                            <button onClick={() => { setEditItem(w); setModal('editWeekly'); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition">{I.edit("#9CA3AF")}</button>
                        </div>
                    </div>
                    {w.subtasks && w.subtasks.length > 0 && !completedWeekly[w.id] && (
                        <div className="pl-12 pr-5 pb-3 space-y-1">
                            {w.subtasks.map(s => (
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
                    { id: 'weekly', label: 'Weekly Plan', count: weeklyTotal - weeklyDone },
                    { id: 'daily', label: 'Today', count: dailyTotal - dailyDone },
                    { id: 'schedule', label: 'Schedule', count: timeBlocks.filter(b => !completedTimeBlocks[b.id]).length },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setPlannerTab(tab.id)}
                        className={'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ' + (plannerTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                        {tab.label}
                        {tab.count > 0 && <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (plannerTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500')}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {plannerTab === 'weekly' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">This Week</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{weeklyDone} of {weeklyTotal} tasks completed</p>
                            </div>
                            <button onClick={() => setModal('addWeekly')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add Task</button>
                        </div>
                        {weeklyTotal > 0 && (
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{width: (weeklyTotal > 0 ? (weeklyDone / weeklyTotal) * 100 : 0) + '%'}}></div>
                            </div>
                        )}
                    </div>

                    {weeklyPlan.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                            <Empty icon={I.clipboard("#9CA3AF")} title="No weekly tasks yet" sub="Start by adding your key objectives for the week" action={() => setModal('addWeekly')} actionLabel="Add Weekly Task" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(weeklyByProject.grouped).map(pid => {
                                const proj = projects.find(p => p.id === Number(pid));
                                const tasks = weeklyByProject.grouped[pid];
                                let projTotal = 0, projDone = 0;
                                tasks.forEach(w => {
                                    if (w.subtasks && w.subtasks.length > 0) { projTotal += w.subtasks.length; projDone += w.subtasks.filter(s => s.done).length; }
                                    else { projTotal += 1; if (completedWeekly[w.id]) projDone += 1; }
                                });
                                return (
                                    <div key={pid} className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                                        <div className="px-5 py-3.5 bg-blue-50/50 border-b border-blue-100/50 flex items-center justify-between cursor-pointer select-none hover:bg-blue-50/80 transition" onClick={() => toggleProjectCollapse(pid)}>
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
                                                    <div className="w-20 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width: (getProjectProgress(Number(pid)) || 0) + '%'}}></div></div>
                                                </div>
                                            )}
                                        </div>
                                        {!collapsedProjects[pid] && <div className="divide-y divide-gray-50">
                                            {tasks.map(w => <WeeklyTaskRow key={w.id} w={w} />)}
                                        </div>}
                                    </div>
                                );
                            })}

                            {weeklyByProject.unlinked.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                                    <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3 cursor-pointer select-none hover:bg-gray-50/80 transition" onClick={() => toggleProjectCollapse('general')}>
                                        <span className={'transition-transform duration-200 ' + (collapsedProjects['general'] ? '' : 'rotate-90')}>{I.chevron("#9CA3AF")}</span>
                                        <div className="w-2 h-8 rounded-full bg-gray-300"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">General Tasks</p>
                                            <p className="text-xs text-gray-400">Not linked to a project</p>
                                        </div>
                                    </div>
                                    {!collapsedProjects['general'] && <div className="divide-y divide-gray-50">
                                        {weeklyByProject.unlinked.map(w => <WeeklyTaskRow key={w.id} w={w} />)}
                                    </div>}
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
                                    <button onClick={() => setModal('addTask')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                                </div>
                            </div>
                            {quickTasks.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                                    <Empty icon={I.check("#9CA3AF")} title="No tasks yet" sub="Add tasks or pull from your weekly plan" action={() => setModal('addTask')} actionLabel="Add Task" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Pending tasks first */}
                                    {quickTasks.filter(t => !completedTasks[t.id]).map(t => (
                                        <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 card-shadow card-shadow-hover transition-all flex items-center gap-3">
                                            <span className="cursor-pointer" onClick={() => toggleTask(t.id)}>{I.circle("#D1D5DB")}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{t.task}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-400">{t.due}</span>
                                                    {t.projectId && projectName(t.projectId) && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 truncate max-w-[120px]">{projectName(t.projectId)}</span>
                                                    )}
                                                    {t.delegatedTo && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-500 flex items-center gap-1">{I.user("#8B5CF6")} {t.delegatedTo}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ' + (prioColor[t.priority] || prioColor.medium)}>{prioLabel[t.priority] || 'Med'}</span>
                                            <button onClick={() => { setEditItem(t); setModal('editTask'); }} className="p-1 rounded-lg hover:bg-gray-100 transition flex-shrink-0">{I.edit("#9CA3AF")}</button>
                                        </div>
                                    ))}
                                    {/* Completed tasks (dimmed) */}
                                    {quickTasks.filter(t => completedTasks[t.id]).map(t => (
                                        <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 card-shadow transition-all flex items-center gap-3 opacity-50">
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
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs flex-shrink-0">{t.delegatedTo.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}</div>
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
                                <div className="bg-white rounded-xl border border-gray-100 p-4 card-shadow">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Weekly Progress</p>
                                    <p className="text-2xl font-semibold text-gray-900">{weeklyDone} / {weeklyTotal}</p>
                                    <p className="text-xs text-gray-400">weekly tasks done</p>
                                    {weeklyTotal > 0 && (
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width: ((weeklyDone / weeklyTotal) * 100) + '%'}}></div></div>
                                    )}
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-4 card-shadow">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Today</p>
                                    <p className="text-2xl font-semibold text-gray-900">{dailyDone} / {dailyTotal}</p>
                                    <p className="text-xs text-gray-400">tasks done</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-4 card-shadow">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Schedule</p>
                                    <p className="text-2xl font-semibold text-gray-900">{timeBlocks.filter(b => !completedTimeBlocks[b.id]).length}</p>
                                    <p className="text-xs text-gray-400">blocks remaining</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                        <button onClick={() => setExpandedIdeas(!expandedIdeas)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition rounded-xl">
                            <div className="flex items-center gap-3">{I.bulb("#F59E0B")}<span className="text-base font-semibold text-gray-900">Ideas & Learning</span><span className="text-xs text-gray-400 ml-2">{ideas.length + learning.length} items</span></div>
                            <span className={'transition-transform ' + (expandedIdeas ? 'rotate-90' : '')}>{I.chevron("#9CA3AF")}</span>
                        </button>
                        {expandedIdeas && (
                            <div className="px-5 pb-5 space-y-5">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ideas I Don't Want to Forget</p>
                                        <button onClick={() => setModal('addIdea')} className="text-xs text-blue-500 hover:text-blue-600 font-medium">{I.plus("#3B82F6")}</button>
                                    </div>
                                    {ideas.length === 0 ? <p className="text-sm text-gray-400 italic">No ideas captured yet. Click + to add one.</p> : (
                                        <div className="space-y-2">
                                            {ideas.map(idea => (
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
                                        <button onClick={() => setModal('addLearning')} className="text-xs text-blue-500 hover:text-blue-600 font-medium">{I.plus("#3B82F6")}</button>
                                    </div>
                                    {learning.length === 0 ? <p className="text-sm text-gray-400 italic">No learning goals yet. Click + to add one.</p> : (
                                        <div className="space-y-2">
                                            {learning.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                                    <p className="text-sm text-gray-800 flex-1">{item}</p>
                                                    <button onClick={() => { setEditItem(item); setModal('editLearning_' + i); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-100 transition">{I.edit("#9CA3AF")}</button>
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
                    {delegatedByMe.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No delegated tasks yet. Use the Delegate Launchpad to assign tasks.</p>
                    ) : (
                        <div className="space-y-2">
                            {delegatedByMe.map(d => (
                                <div key={d.id} className={"flex items-center justify-between p-3 rounded-lg border transition " + (d.status === 'completed' ? "bg-gray-50 border-gray-200 opacity-60" : d.status === 'accepted' ? "bg-green-50 border-green-200" : "bg-purple-50 border-purple-200")}>
                                    <div className="flex-1 min-w-0">
                                        <p className={"text-sm font-medium " + (d.status === 'completed' ? "text-gray-400 line-through" : "text-gray-800")}>{d.task_text}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">To: <span className="font-medium">{d.recipient_username}</span> {d.deadline && <span className="ml-2">Due: {new Date(d.deadline).toLocaleDateString()}</span>}</p>
                                    </div>
                                    <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (d.status === 'completed' ? "bg-gray-200 text-gray-600" : d.status === 'accepted' ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700")}>{d.status}</span>
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
                            <button onClick={() => setModal('addTimeBlock')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">{I.plus("#3B82F6")} Add</button>
                        </div>
                        {timeBlocks.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                                <Empty icon={I.calendar("#9CA3AF")} title="No time blocks yet" sub="Plan your day by adding time blocks" action={() => setModal('addTimeBlock')} actionLabel="Add Time Block" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {timeBlocks.map(b => (
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
                    <div className="bg-white rounded-xl border border-gray-100 card-shadow">
                        <Empty icon={I.history("#9CA3AF")} title="No history yet" sub="Completed tasks will automatically move here" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedHistory.map(entry => (
                            <div key={entry.date} className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">
                                <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {I.calendar("#6B7280")}
                                        <p className="text-sm font-semibold text-gray-900">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{entry.tasks.length} task{entry.tasks.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {entry.tasks.map((t, i) => (
                                        <div key={t.id || i} className="px-5 py-3 flex items-center gap-3">
                                            {I.check("#10B981")}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-600">{t.task}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {t.projectId && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-500">{projectName(t.projectId)}</span>}
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

    // MAIN RETURN
    if (authLoading) return <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 z-50 flex items-center justify-center"><Emblem size={48} /><p className="ml-3 text-gray-400">Loading...</p></div>;
    if (!supaUser || !userProfile) return <AuthFlow onAuth={handleAuth} />;
    return (
        <div className="h-screen bg-gray-50 flex">
            <Sidebar />
            <div className={'flex-1 flex flex-col transition-all duration-300 ' + (sidebarOpen ? 'ml-60' : 'ml-16')}>
                <TopBar />
                <main className="flex-1 overflow-auto px-8 py-6">
                    {activeModule === 'command' && CommandCentre()}
                    {activeModule === 'income' && <IncomeModule />}
                    {activeModule === 'briefing' && <BriefingModule />}
                    {activeModule === 'planner' && <PlannerModule />}
                    {activeModule === 'history' && <HistoryModule />}
              {activeModule === 'boardroom' && <BoardroomModule />}
                </main>
            </div>

            {/* Floating + Button */}
            <button onClick={() => setModal(modal === 'addMenu' ? null : 'addMenu')} className={'fixed bottom-8 right-8 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all duration-200 ' + (modal === 'addMenu' ? 'rotate-45' : '')} title="Quick Add">
                {I.plus("white")}
            </button>

            {/* MODALS */}
            {modal === 'addMenu' && <AddMenu onClose={() => setModal(null)} activeModule={activeModule} setModal={setModal} />}
            {modal === 'addIncome' && <IncomeForm setIncomeStreams={setIncomeStreams} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editIncome' && <IncomeForm item={editItem} setIncomeStreams={setIncomeStreams} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addProject' && <ProjectForm setProjects={setProjects} getProjectProgress={getProjectProgress} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editProject' && <ProjectForm item={editItem} setProjects={setProjects} getProjectProgress={getProjectProgress} onClose={() => { setModal(null); setEditItem(null); }} />}
            {acceptingTask && <AcceptTaskModal task={acceptingTask} onChooseDaily={acceptToDaily} onChooseWeekly={acceptToWeekly} onCancel={() => setAcceptingTask(null)} />}
      {modal === 'addWeekly' && <WeeklyTaskForm setWeeklyPlan={setWeeklyPlan} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editWeekly' && <WeeklyTaskForm item={editItem} setWeeklyPlan={setWeeklyPlan} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addTask' && <TaskForm setQuickTasks={setQuickTasks} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editTask' && <TaskForm item={editItem} setQuickTasks={setQuickTasks} activeProjects={activeProjects} onDelegate={handleDelegate} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addTimeBlock' && <TimeBlockForm setTimeBlocks={setTimeBlocks} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editTimeBlock' && <TimeBlockForm item={editItem} setTimeBlocks={setTimeBlocks} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addIdea' && <IdeaForm setIdeas={setIdeas} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editIdea' && <IdeaForm item={editItem} setIdeas={setIdeas} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addTeam' && <TeamForm setTeamMembers={setTeamMembers} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addExpense' && <ExpenseForm setExpenses={setExpenses} incomeStreams={incomeStreams} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editExpense' && <ExpenseForm item={editItem} setExpenses={setExpenses} incomeStreams={incomeStreams} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'editTeam' && <TeamForm item={editItem} setTeamMembers={setTeamMembers} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'addLearning' && <LearningForm setLearning={setLearning} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal && modal.startsWith('editLearning_') && <LearningForm item={editItem} idx={parseInt(modal.split('_')[1])} setLearning={setLearning} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal === 'settings' && <ProfileEditModal userProfile={userProfile} setUserProfile={setUserProfile} supaUser={supaUser} onClose={() => { setModal(null); }} />}
            {notificationsOpen && <NotificationsPanel notifications={notifications} onMarkRead={markNotifRead} onClose={() => setNotificationsOpen(false)} delegatedToMe={delegatedToMe} onAcceptTask={setAcceptingTask} quickTasks={quickTasks} weeklyPlan={weeklyPlan} setActiveModule={setActiveModule} setPlannerTab={setPlannerTab} />}}
        </div>
    );
};

export default NuOperandi;
