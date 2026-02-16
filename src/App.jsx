import React, { useState, useEffect, useCallback, useMemo } from 'react';

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
    wallet: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="1" y="5" width="22" height="16" rx="2"/><path d="M1 11h20"/><circle cx="17" cy="15" r="2"/></svg>,
    github: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
};

/* ====== COMPONENTS ====== */
const InputField = ({ label, value, onChange, placeholder = "", type = "text", width = "100%" }) => (
    <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{label}</label>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit" }} />
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit" }}>
            <option value="">Select an option</option>
            {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const Button = ({ label, onClick, style = {}, variant = "primary" }) => {
    const colors = { primary: { bg: "#1F2937", color: "white" }, danger: { bg: "#DC2626", color: "white" }, success: { bg: "#059669", color: "white" } };
    const c = colors[variant] || colors.primary;
    return <button onClick={onClick} style={{ padding: "8px 16px", backgroundColor: c.bg, color: c.color, border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "opacity 0.2s", ...style }} onMouseEnter={(e) => e.target.style.opacity = "0.8"} onMouseLeave={(e) => e.target.style.opacity = "1"}>{label}</button>;
};

const Card = ({ title, children, style = {} }) => (
    <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "16px", ...style }}>
        {title && <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600" }}>{title}</h3>}
        {children}
    </div>
);

const Stat = ({ icon, label, value, trend, trendValue }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "#6b7280" }}>{icon}</div>
            <div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>{label}</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>{value}</div>
            </div>
        </div>
        {trend && <div style={{ display: "flex", alignItems: "center", gap: "4px", color: trend === "up" ? "#059669" : "#dc2626" }}>{trend === "up" ? I.arrowUp() : I.arrowDown()} {trendValue}</div>}
    </div>
);

/* ====== MAIN APP ====== */
const NuOperandi = () => {
    const [items, setItems] = useState(() => load('items', []));
    const [learning, setLearning] = useState(() => load('learning', []));
    const [financial, setFinancial] = useState(() => load('financial', []));
    const [modal, setModal] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [itemName, setItemName] = useState('');
    const [itemValue, setItemValue] = useState('');
    const [itemUnit, setItemUnit] = useState('count');
    const [itemFreq, setItemFreq] = useState('daily');
    const [itemColor, setItemColor] = useState('#3B82F6');
    const [learningTitle, setLearningTitle] = useState('');
    const [learningCategory, setLearningCategory] = useState('');
    const [learningDuration, setLearningDuration] = useState('');
    const [learningLevel, setLearningLevel] = useState('beginner');
    const [financeDesc, setFinanceDesc] = useState('');
    const [financeAmount, setFinanceAmount] = useState('');
    const [financeType, setFinanceType] = useState('income');
    const [financeDate, setFinanceDate] = useState(new Date().toISOString().split('T')[0]);

    const addItem = useCallback(() => {
        if (itemName.trim()) {
            const newItem = { id: newId(), name: itemName, value: parseFloat(itemValue) || 0, unit: itemUnit, freq: itemFreq, color: itemColor, data: [parseFloat(itemValue) || 0], created: Date.now() };
            const updated = [...items, newItem];
            setItems(updated);
            save('items', updated);
            setItemName(''); setItemValue(''); setItemUnit('count'); setItemFreq('daily'); setItemColor('#3B82F6');
        }
    }, [items, itemName, itemValue, itemUnit, itemFreq, itemColor]);

    const updateItem = useCallback((id, updates) => {
        const updated = items.map(item => item.id === id ? { ...item, ...updates } : item);
        setItems(updated);
        save('items', updated);
    }, [items]);

    const deleteItem = useCallback((id) => {
        const updated = items.filter(item => item.id !== id);
        setItems(updated);
        save('items', updated);
    }, [items]);

    const addValueToItem = useCallback((id, value) => {
        const item = items.find(i => i.id === id);
        if (item) {
            const updated = items.map(i => i.id === id ? { ...i, value: i.value + value, data: [...i.data, i.value + value].slice(-14) } : i);
            setItems(updated);
            save('items', updated);
        }
    }, [items]);

    const addLearning = useCallback(() => {
        if (learningTitle.trim() && learningCategory.trim()) {
            const newLearning = { id: newId(), title: learningTitle, category: learningCategory, duration: parseInt(learningDuration) || 0, level: learningLevel, created: Date.now(), updated: Date.now() };
            const updated = [...learning, newLearning];
            setLearning(updated);
            save('learning', updated);
            setLearningTitle(''); setLearningCategory(''); setLearningDuration(''); setLearningLevel('beginner');
        }
    }, [learning, learningTitle, learningCategory, learningDuration, learningLevel]);

    const updateLearning = useCallback((id, updates) => {
        const updated = learning.map(l => l.id === id ? { ...l, ...updates, updated: Date.now() } : l);
        setLearning(updated);
        save('learning', updated);
    }, [learning]);

    const deleteLearning = useCallback((id) => {
        const updated = learning.filter(l => l.id !== id);
        setLearning(updated);
        save('learning', updated);
    }, [learning]);

    const addFinance = useCallback(() => {
        if (financeDesc.trim() && financeAmount) {
            const newEntry = { id: newId(), description: financeDesc, amount: parseFloat(financeAmount), type: financeType, date: financeDate, created: Date.now() };
            const updated = [...financial, newEntry];
            setFinancial(updated);
            save('financial', updated);
            setFinanceDesc(''); setFinanceAmount(''); setFinanceType('income'); setFinanceDate(new Date().toISOString().split('T')[0]);
        }
    }, [financial, financeDesc, financeAmount, financeType, financeDate]);

    const deleteFinance = useCallback((id) => {
        const updated = financial.filter(f => f.id !== id);
        setFinancial(updated);
        save('financial', updated);
    }, [financial]);

    const totalIncome = useMemo(() => financial.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0), [financial]);
    const totalExpense = useMemo(() => financial.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0), [financial]);
    const netBalance = totalIncome - totalExpense;
    const totalItemValue = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);
    const avgLearningDuration = useMemo(() => learning.length > 0 ? (learning.reduce((sum, l) => sum + l.duration, 0) / learning.length).toFixed(1) : 0, [learning]);

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "0", margin: "0" }}>
            {/* HEADER */}
            <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Emblem size={40} />
                    <h1 style={{ margin: "0", fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>NuOperandi</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ padding: "8px 12px", backgroundColor: "#f0fdf4", borderRadius: "6px", fontSize: "13px", fontWeight: "600", color: "#065f46" }}>{getQuote().substring(0, 40)}...</div>
                    <button onClick={() => window.open('https://github.com/tututunmbi/nuoperandi', '_blank')} style={{ padding: "0", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>{I.github()}</button>
                </div>
            </header>

            {/* MODALS */}
            {modal === 'item' && <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" }}><div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }}><h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700" }}>Add Metric</h2><InputField label="Metric Name" value={itemName} onChange={setItemName} placeholder="e.g., Push-ups, Words Written" /><InputField label="Value" value={itemValue} onChange={setItemValue} type="number" /><SelectField label="Unit" value={itemUnit} onChange={setItemUnit} options={['count', 'minutes', 'hours', 'km', 'kg', 'pages', 'words', 'dollars']} /><SelectField label="Frequency" value={itemFreq} onChange={setItemFreq} options={['daily', 'weekly', 'monthly']} /><div style={{ marginBottom: "12px" }}><label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Color</label><div style={{ display: "flex", gap: "8px" }}>{ ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(c => <div key={c} onClick={() => setItemColor(c)} style={{ width: "32px", height: "32px", backgroundColor: c, borderRadius: "6px", cursor: "pointer", border: itemColor === c ? "2px solid #000" : "2px solid #e5e7eb" }} />) }</div></div><div style={{ display: "flex", gap: "8px" }}><Button label="Cancel" onClick={() => { setModal(null); setItemName(''); setItemValue(''); }} /><Button label="Add" variant="success" onClick={addItem} /></div></div>}</n
    {modal === 'learning' && <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" }}><div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }}><h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700" }}>Add Learning</h2><InputField label="Title" value={learningTitle} onChange={setLearningTitle} placeholder="e.g., React Fundamentals" /><InputField label="Category" value={learningCategory} onChange={setLearningCategory} placeholder="e.g., Web Development" /><InputField label="Duration (minutes)" value={learningDuration} onChange={setLearningDuration} type="number" /><SelectField label="Level" value={learningLevel} onChange={setLearningLevel} options={['beginner', 'intermediate', 'advanced']} /><div style={{ display: "flex", gap: "8px" }}><Button label="Cancel" onClick={() => { setModal(null); setLearningTitle(''); setLearningCategory(''); setLearningDuration(''); }} /><Button label="Add" variant="success" onClick={addLearning} /></div></div>}</n
    {modal === 'finance' && <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" }}><div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }}><h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700" }}>Add Finance Entry</h2><InputField label="Description" value={financeDesc} onChange={setFinanceDesc} placeholder="e.g., Salary, Groceries" /><InputField label="Amount" value={financeAmount} onChange={setFinanceAmount} type="number" /><SelectField label="Type" value={financeType} onChange={setFinanceType} options={['income', 'expense']} /><InputField label="Date" value={financeDate} onChange={setFinanceDate} type="date" /><div style={{ display: "flex", gap: "8px" }}><Button label="Cancel" onClick={() => { setModal(null); setFinanceDesc(''); setFinanceAmount(''); }} /><Button label="Add" variant="success" onClick={addFinance} /></div></div>}

    {modal && modal.startsWith('editItem_') && editItem && <EditItemForm item={editItem} idx={parseInt(modal.split('_')[1])} setItems={setItems} onClose={() => { setModal(null); setEditItem(null); }} />}
    {modal && modal.startsWith('editLearning_') && editItem && <EditLearningForm item={editItem} idx={parseInt(modal.split('_')[1])} setLearning={setLearning} onClose={() => { setModal(null); setEditItem(null); }} />}

            {/* MAIN CONTENT */}
            <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                {/* SECTION 1: METRICS */}
                <section>
                    <Card title="Metrics" style={{ marginTop: "0" }}>
                        <div style={{ marginBottom: "16px" }}>
                            <Button label="+ Add Metric" onClick={() => setModal('item')} />
                        </div>
                        {items.map((item, idx) => (
                            <div key={item.id} style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: `2px solid ${item.color}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                                    <div style={{ fontWeight: "600", fontSize: "14px" }}>{item.name}</div>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button onClick={() => { setEditItem(item); setModal(`editItem_${idx}`); }} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", color: "#6b7280", fontSize: "12px" }}>{I.edit()}</button>
                                        <button onClick={() => deleteItem(item.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", color: "#dc2626", fontSize: "12px" }}>{I.trash()}</button>
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <div style={{ fontSize: "18px", fontWeight: "700" }}>{item.value} {item.unit}</div>
                                    <Spark data={item.data} color={item.color} />
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <Button label={`+1 ${item.unit}`} onClick={() => addValueToItem(item.id, 1)} style={{ flex: "1", fontSize: "12px", padding: "6px" }} />
                                    <Button label={`-1 ${item.unit}`} onClick={() => addValueToItem(item.id, -1)} style={{ flex: "1", fontSize: "12px", padding: "6px" }} />
                                </div>
                            </div>
                        ))}
                    </Card>
                </section>

                {/* SECTION 2: LEARNING */}
                <section>
                    <Card title="Learning" style={{ marginTop: "0" }}>
                        <div style={{ marginBottom: "16px" }}>
                            <Button label="+ Add Learning" onClick={() => setModal('learning')} />
                        </div>
                        {learning.map((item, idx) => (
                            <div key={item.id} style={{ marginBottom: "12px", padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "8px", borderLeft: "4px solid #10B981" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div>
                                        <div style={{ fontWeight: "600", fontSize: "14px" }}>{item.title}</div>
                                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{item.category} • {item.duration} min • {item.level}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button onClick={() => { setEditItem(item); setModal(`editLearning_${idx}`); }} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", color: "#6b7280", fontSize: "12px" }}>{I.edit()}</button>
                                        <button onClick={() => deleteLearning(item.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", color: "#dc2626", fontSize: "12px" }}>{I.trash()}</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Card>
                </section>

                {/* SECTION 3: FINANCE */}
                <section>
                    <Card title="Finance" style={{ marginTop: "0" }}>
                        <div style={{ marginBottom: "16px" }}>
                            <Button label="+ Add Entry" onClick={() => setModal('finance')} />
                        </div>
                        <Stat icon={I.dollar()} label="Total Income" value={`$${totalIncome.toFixed(2)}`} />
                        <Stat icon={I.dollar()} label="Total Expense" value={`$${totalExpense.toFixed(2)}`} />
                        <Stat icon={I.zap()} label="Net Balance" value={`$${netBalance.toFixed(2)}`} trend={netBalance >= 0 ? "up" : "down"} trendValue={`${Math.abs(netBalance).toFixed(2)}`} />
                        <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "8px", borderLeft: "4px solid #3B82F6" }}>
                            <div style={{ fontSize: "12px", color: "#1e40af", fontWeight: "600" }}>Recent Entries</div>
                            {financial.slice().reverse().map((entry) => (
                                <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #bfdbfe" }}>
                                    <div style={{ fontSize: "13px" }}>{entry.description}</div>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <div style={{ color: entry.type === 'income' ? '#059669' : '#dc2626", fontWeight: "600" }}>${entry.amount.toFixed(2)}</div>
                                        <button onClick={() => deleteFinance(entry.id)} style={{ padding: "2px 6px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "12px" }}>{I.x()}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
            </main>

            {/* MODALS FOR EDITING ITEMS AND LEARNING */}
            {modal && modal.startsWith('editItem_') && editItem && <EditItemForm item={editItem} idx={parseInt(modal.split('_')[1])} setItems={setItems} onClose={() => { setModal(null); setEditItem(null); }} />}
            {modal && modal.startsWith('editLearning_') && editItem && <EditLearningForm item={editItem} idx={parseInt(modal.split('_')[1])} setLearning={setLearning} onClose={() => { setModal(null); setEditItem(null); }} />}
        </div>
    );
};

const EditItemForm = ({ item, idx, setItems, onClose }) => {
    const [name, setName] = useState(item.name);
    const [value, setValue] = useState(item.value);
    const [unit, setUnit] = useState(item.unit);
    const [color, setColor] = useState(item.color);

    const handleSave = useCallback(() => {
        setItems(items => items.map((i, index) => index === idx ? { ...i, name, value: parseFloat(value) || 0, unit, color } : i));
        save('items', items => items.map((i, index) => index === idx ? { ...i, name, value: parseFloat(value) || 0, unit, color } : i));
        onClose();
    }, [idx, name, value, unit, color, setItems, onClose]);

    return (
        <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1001" }}>
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700" }}>Edit Metric</h2>
                <InputField label="Metric Name" value={name} onChange={setName} />
                <InputField label="Value" value={value} onChange={setValue} type="number" />
                <SelectField label="Unit" value={unit} onChange={setUnit} options={['count', 'minutes', 'hours', 'km', 'kg', 'pages', 'words', 'dollars']} />
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Color</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(c => (
                            <div key={c} onClick={() => setColor(c)} style={{ width: "32px", height: "32px", backgroundColor: c, borderRadius: "6px", cursor: "pointer", border: color === c ? "2px solid #000" : "2px solid #e5e7eb" }} />
                        ))}
                    </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button label="Cancel" onClick={onClose} />
                    <Button label="Save" variant="success" onClick={handleSave} />
                </div>
            </div>
        </div>
    );
};

const EditLearningForm = ({ item, idx, setLearning, onClose }) => {
    const [title, setTitle] = useState(item.title);
    const [category, setCategory] = useState(item.category);
    const [duration, setDuration] = useState(item.duration);
    const [level, setLevel] = useState(item.level);

    const handleSave = useCallback(() => {
        setLearning(learning => learning.map((l, index) => index === idx ? { ...l, title, category, duration: parseInt(duration) || 0, level } : l));
        save('learning', learning => learning.map((l, index) => index === idx ? { ...l, title, category, duration: parseInt(duration) || 0, level } : l));
        onClose();
    }, [idx, title, category, duration, level, setLearning, onClose]);

    return (
        <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1001" }}>
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700" }}>Edit Learning</h2>
                <InputField label="Title" value={title} onChange={setTitle} />
                <InputField label="Category" value={category} onChange={setCategory} />
                <InputField label="Duration (minutes)" value={duration} onChange={setDuration} type="number" />
                <SelectField label="Level" value={level} onChange={setLevel} options={['beginner', 'intermediate', 'advanced']} />
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button label="Cancel" onClick={onClose} />
                    <Button label="Save" variant="success" onClick={handleSave} />
                </div>
            </div>
        </div>
    );
};

export default NuOperandi;
