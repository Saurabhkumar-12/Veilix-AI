import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Download,
  Tag,
  Smartphone,
  Shield,
  ExternalLink,
  Info,
  BookOpen,
  Bot,
  Send,
  Sparkles,
  Clock,
  Sword,
} from 'lucide-react';
import { askSecurityAssistant, simulatePrivacyImpactApi, analyzeApplicationUrl } from '../services/api';
import TimeMachineModal from '../components/TimeMachineModal';
import AttackSimulatorModal from '../components/AttackSimulatorModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(status) {
  if (status === 'Required') return 'required';
  if (status === 'Potentially Excessive' || status === 'Suspicious' || status === 'High Risk') return 'unnecessary';
  return 'optional';
}

function statusLabel(status) {
  if (status === 'Required') return 'Required';
  if (status === 'Potentially Excessive') return 'Unnecessary';
  if (status === 'Needs Review') return 'Optional';
  return status || 'Optional';
}

function bucketPermissions(permissions) {
  const required = [], optional = [], unnecessary = [];
  for (const p of permissions) {
    const b = mapStatus(p.status);
    if (b === 'required') required.push(p);
    else if (b === 'unnecessary') unnecessary.push(p);
    else optional.push(p);
  }
  return { required, optional, unnecessary };
}

// ─── App Info Card ─────────────────────────────────────────────────────────────

function AppInfoCard({ data }) {
  const { name, icon, description, category, rating, installs } = data;
  return (
    <div className="results-app-card">
      <div className="results-app-card__inner">
        <div className="results-app-card__icon-wrap">
          {icon ? (
            <img src={icon} alt={name} referrerPolicy="no-referrer" className="results-app-card__icon" />
          ) : (
            <div className="results-app-card__icon-placeholder">
              <Smartphone className="results-app-card__icon-svg" />
            </div>
          )}
        </div>
        <div className="results-app-card__info">
          <p className="results-app-card__tag">TARGET APP</p>
          <h1 className="results-app-card__name">{name}</h1>
          {description && (
            <p className="results-app-card__desc">&ldquo;{description}&rdquo;</p>
          )}
          <div className="results-app-card__meta">
            {category && (
              <span className="results-meta-pill">
                <Tag className="results-meta-pill__icon" />
                {category}
              </span>
            )}
            {rating && (
              <span className="results-meta-pill results-meta-pill--star">
                <Star className="results-meta-pill__icon results-meta-pill__icon--star" />
                {rating} / 5.0
              </span>
            )}
            {installs && (
              <span className="results-meta-pill">
                <Download className="results-meta-pill__icon" />
                {installs}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Permission Donut Chart ────────────────────────────────────────────────────

const CHART_COLORS = { required: '#34D399', optional: '#F59E0B', unnecessary: '#EF4444' };

function DonutChart({ required, optional, unnecessary }) {
  const total = required + optional + unnecessary || 1;
  const segments = [
    { key: 'required', value: required, color: CHART_COLORS.required, label: 'Required' },
    { key: 'optional', value: optional, color: CHART_COLORS.optional, label: 'Optional' },
    { key: 'unnecessary', value: unnecessary, color: CHART_COLORS.unnecessary, label: 'Unnecessary' },
  ].filter(s => s.value > 0);

  // Build SVG arc segments
  const cx = 60, cy = 60, r = 46, stroke = 14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="perm-chart">
      <div className="perm-chart__donut-wrap">
        <svg viewBox="0 0 120 120" className="perm-chart__svg">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E293B" strokeWidth={stroke} />
          {segments.map(seg => {
            const dash = (seg.value / total) * circumference;
            const gap = circumference - dash;
            const node = (
              <circle
                key={seg.key}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
              />
            );
            offset += dash;
            return node;
          })}
          {/* Center total */}
          <text x={cx} y={cy - 6} textAnchor="middle" className="perm-chart__center-num" fill="#F8FAFC" fontSize="18" fontWeight="800" fontFamily="Space Grotesk, sans-serif">
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="Inter, sans-serif">
            TOTAL
          </text>
        </svg>
      </div>
      <ul className="perm-chart__legend">
        {segments.map(seg => (
          <li key={seg.key} className="perm-chart__legend-item">
            <span className="perm-chart__legend-dot" style={{ background: seg.color }} />
            <span className="perm-chart__legend-label">{seg.label}</span>
            <span className="perm-chart__legend-count" style={{ color: seg.color }}>{seg.value}</span>
            <span className="perm-chart__legend-pct">
              {Math.round((seg.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Permission Analysis Breakdown ────────────────────────────────────────────

function PermissionBreakdown({ buckets }) {
  const { required, optional, unnecessary } = buckets;
  const total = required.length + optional.length + unnecessary.length;

  return (
    <section className="results-breakdown">
      <div className="results-breakdown__top">
        <div className="results-breakdown__left">
          <h2 className="results-section-title">Permission Analysis Breakdown</h2>
          <div className="results-breakdown__boxes">
            <div className="results-breakdown__box results-breakdown__box--required">
              <div className="results-breakdown__box-header">
                <span className="results-breakdown__dot results-breakdown__dot--required" />
                <span className="results-breakdown__label">REQUIRED</span>
              </div>
              <div className="results-breakdown__count">{required.length}</div>
              <div className="results-breakdown__sublabel">Core functionality</div>
            </div>
            <div className="results-breakdown__box results-breakdown__box--optional">
              <div className="results-breakdown__box-header">
                <span className="results-breakdown__dot results-breakdown__dot--optional" />
                <span className="results-breakdown__label">OPTIONAL</span>
              </div>
              <div className="results-breakdown__count">{optional.length}</div>
              <div className="results-breakdown__sublabel">Secondary features</div>
            </div>
            <div className="results-breakdown__box results-breakdown__box--unnecessary">
              <div className="results-breakdown__box-header">
                <span className="results-breakdown__dot results-breakdown__dot--unnecessary" />
                <span className="results-breakdown__label">UNNECESSARY</span>
              </div>
              <div className="results-breakdown__count">{unnecessary.length}</div>
              <div className="results-breakdown__sublabel">Excessive access</div>
            </div>
          </div>
          <p className="results-breakdown__total">
            Total Permissions Analyzed: <strong>{total}</strong>
          </p>
        </div>
        {/* Donut chart on the right */}
        <DonutChart
          required={required.length}
          optional={optional.length}
          unnecessary={unnecessary.length}
        />
      </div>
    </section>
  );
}

// ─── Permission Card ───────────────────────────────────────────────────────────

function PermissionCard({ item, variant, deniedSet = new Set(), onToggle }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const isDenied = deniedSet.has(item.id);

  const icons = {
    required:    <CheckCircle className="perm-card-v2__icon perm-card-v2__icon--required" />,
    optional:    <AlertTriangle className="perm-card-v2__icon perm-card-v2__icon--optional" />,
    unnecessary: <XCircle className="perm-card-v2__icon perm-card-v2__icon--unnecessary" />,
  };
  const classes = {
    required:    'perm-card-v2 perm-card-v2--required',
    optional:    'perm-card-v2 perm-card-v2--optional',
    unnecessary: 'perm-card-v2 perm-card-v2--unnecessary',
  };

  const hasEvidence = Array.isArray(item.evidence) && item.evidence.length > 0;
  const hasSources  = Array.isArray(item.sources)  && item.sources.length  > 0;

  let cardClass = classes[variant] || '';
  if (isDenied) {
    cardClass += ' perm-card-v2--denied';
  }

  // Format confidence label (Phase 10 & 18)
  const rawConf = String(item.ai_confidence || item.confidence || 'low').toLowerCase();
  const confidenceLabel = rawConf === 'high' || rawConf === 'high confidence' || item.confidence >= 80 ? 'HIGH CONFIDENCE' :
                          rawConf === 'medium' || rawConf === 'medium confidence' || (item.confidence >= 60 && item.confidence < 80) ? 'MEDIUM CONFIDENCE' :
                          'LOW CONFIDENCE';
                          
  const confidenceBadgeColor = confidenceLabel === 'HIGH CONFIDENCE' ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' :
                               confidenceLabel === 'MEDIUM CONFIDENCE' ? 'text-amber-300 bg-amber-950/60 border-amber-500/30' :
                               'text-rose-400 bg-rose-950/60 border-rose-500/30';

  const riskBadgeColor = item.risk === 'Critical' ? 'text-rose-400 bg-rose-950/80 border-rose-500/50 font-extrabold animate-pulse' :
                         item.risk === 'High' ? 'text-orange-400 bg-orange-950/60 border-orange-500/30 font-bold' :
                         item.risk === 'Medium' ? 'text-amber-300 bg-amber-950/60 border-amber-500/30' :
                         'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';

  return (
    <article className={cardClass}>
      {/* Header: icon + name + recommendation badge */}
      <div className="perm-card-v2__header" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        {icons[variant]}
        <h3 className="perm-card-v2__name" style={{ marginRight: 'auto' }}>{item.permission}</h3>
        {item.recommendation && (
          <span className={`perm-card-v2__rec-badge perm-card-v2__rec-badge--${isDenied ? 'unnecessary' : variant}`}>
            {isDenied ? 'Blocked in Sandbox' : item.recommendation}
          </span>
        )}
      </div>

      {/* Grid of Classification, Risk, Confidence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.6rem', marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.72rem', background: 'rgba(30, 41, 59, 0.4)', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '0.6rem', textTransform: 'uppercase' }}>Classification</div>
          <div style={{ color: '#F8FAFC', fontWeight: 'bold', marginTop: '0.1rem' }}>{item.classification || 'UNKNOWN'}</div>
        </div>
        <div style={{ fontSize: '0.72rem', background: 'rgba(30, 41, 59, 0.4)', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '0.6rem', textTransform: 'uppercase' }}>Risk</div>
          <div className={riskBadgeColor} style={{ display: 'inline-block', fontWeight: 'bold', marginTop: '0.1rem', padding: '0.05rem 0.25rem', borderRadius: '0.2rem', border: '1px solid transparent', fontSize: '0.65rem' }}>
            {item.risk || 'Low'}
          </div>
        </div>
        <div style={{ fontSize: '0.72rem', background: 'rgba(30, 41, 59, 0.4)', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '0.6rem', textTransform: 'uppercase' }}>Confidence</div>
          <div className={confidenceBadgeColor} style={{ display: 'inline-block', fontWeight: 'bold', marginTop: '0.1rem', padding: '0.05rem 0.25rem', borderRadius: '0.2rem', border: '1px solid transparent', fontSize: '0.65rem' }}>
            {confidenceLabel}
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <div style={{ fontSize: '0.72rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', marginBottom: '0.6rem', borderLeft: '3px solid #64748B', border: '1px solid rgba(255,255,255,0.04)', borderLeftWidth: '3px' }}>
        <div style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '0.6rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Evidence</div>
        {hasEvidence ? (
          <ul style={{ margin: 0, paddingLeft: '1rem', listStyleType: 'disc', color: '#E2E8F0' }}>
            {item.evidence.map((e, idx) => (
              <li key={idx} style={{ marginTop: '0.15rem' }}>{e}</li>
            ))}
          </ul>
        ) : (
          <div style={{ color: '#64748B', fontStyle: 'italic' }}>Requested in AndroidManifest.xml (Static analysis only)</div>
        )}
      </div>

      {/* Factual: what this permission technically allows — from trusted knowledge base */}
      {item.what_it_does && (
        <p className="perm-card-v2__what-it-does" style={{ margin: '0.4rem 0', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: '600', color: '#94A3B8' }}>Capability: </span>{item.what_it_does}
        </p>
      )}

      {/* AI honest reasoning — based only on provided evidence */}
      {item.reason && (
        <p className="perm-card-v2__reason" style={{ margin: '0.4rem 0', fontSize: '0.75rem' }}>
          <span className="perm-card-v2__reason-label" style={{ fontWeight: '600', color: '#94A3B8' }}>Why: </span>
          {item.reason}
        </p>
      )}

      {/* Sandbox Simulator Action Row */}
      {onToggle && (
        <div className="perm-card-v2__sandbox-row" style={{ marginTop: '0.6rem' }}>
          <label className="perm-card-v2__sandbox-label" htmlFor={`sandbox-${item.id}`}>
            <input
              type="checkbox"
              id={`sandbox-${item.id}`}
              checked={!isDenied}
              onChange={() => onToggle(item.id)}
              className="perm-card-v2__sandbox-checkbox"
            />
            <span>{isDenied ? '❌ Blocked in Sandbox' : '✅ Active in Sandbox'}</span>
          </label>
        </div>
      )}

      {/* Denial Impact Note (only shown when blocked) */}
      {isDenied && item.impact && (
        <div style={{ marginTop: '0.45rem', fontSize: '0.72rem', color: '#F87171', fontStyle: 'italic', background: 'rgba(220,38,38,0.1)', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', borderLeft: '3px solid #DC2626', border: '1px solid rgba(220,38,38,0.2)', borderLeftWidth: '3px' }}>
          <strong>Deactivated capability:</strong> {item.impact.ifDenied}
        </div>
      )}

      {/* Verified sources — backend-constructed real URLs only, never AI-generated */}
      {hasSources && !isDenied && (
        <div className="perm-card-v2__sources" style={{ marginTop: '0.6rem' }}>
          {item.sources.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="perm-card-v2__source-link"
            >
              {src.title}
              <ExternalLink className="perm-card-v2__source-icon" />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

// ─── Permission Section ────────────────────────────────────────────────────────

function PermissionSection({ title, variant, icon, items, deniedSet, onToggle }) {
  if (!items || items.length === 0) return null;
  const headingClass = `results-perm-section__heading results-perm-section__heading--${variant}`;
  return (
    <section className="results-perm-section">
      <div className={headingClass}>
        <span className="results-perm-section__icon">{icon}</span>
        <h2 className="results-perm-section__title">{title}</h2>
        <span className="results-perm-section__count">{items.length}</span>
      </div>
      {/* Single column — cards now contain more content */}
      <div className="results-perm-section__grid results-perm-section__grid--single">
        {items.map(item => (
          <PermissionCard
            key={item.id || item.permission}
            item={item}
            variant={variant}
            deniedSet={deniedSet}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

// ─── AI Security Assessment ────────────────────────────────────────────────────

function AIAssessmentCard({ assessment }) {
  if (!assessment) return null;
  const summary = assessment.explanation || assessment.mismatchSummary || null;
  const privacyImpact = assessment.privacyImpact || null;
  if (!summary && !privacyImpact) return null;

  return (
    <section className="results-ai-card">
      <div className="results-ai-card__header">
        <Shield className="results-ai-card__icon" />
        <h2 className="results-ai-card__title">AI Security &amp; Privacy Assessment</h2>
        <span className="results-ai-card__badge">ANALYSIS RESULT</span>
      </div>
      {summary && <p className="results-ai-card__text">{summary}</p>}
      {privacyImpact && privacyImpact !== summary && (
        <p className="results-ai-card__text results-ai-card__text--secondary">{privacyImpact}</p>
      )}
      <p className="results-ai-card__notice">
        <Info className="results-ai-card__notice-icon" />
        {assessment.staticAnalysisNotice ||
          'This is a static assessment of declared permissions. It does not observe runtime behavior.'}
      </p>
    </section>
  );
}

// ─── AI Assistant Chat ─────────────────────────────────────────────────────────

function highlightText(text, permissions = []) {
  if (!text) return '';
  const terms = new Set([
    'camera', 'microphone', 'mic', 'location', 'gps', 'contacts', 
    'storage', 'notifications', 'internet', 'network access', 'sms'
  ]);
  permissions.forEach(p => {
    if (p.permission) terms.add(p.permission.toLowerCase());
    if (p.id) {
      terms.add(p.id.toLowerCase());
      terms.add(p.id.toLowerCase().replace(/_/g, ' '));
    }
  });

  const sortedTerms = Array.from(terms).sort((a, b) => b.length - a.length);
  if (sortedTerms.length === 0) return text;

  // Build safe regex pattern escaping special characters
  const escaped = sortedTerms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isMatch = sortedTerms.some(t => t === part.toLowerCase());
    if (isMatch) {
      return (
        <span 
          key={i} 
          className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 font-bold border border-green-500/20 text-[11px] font-mono whitespace-nowrap"
          title={`Analyzed Permission: ${part}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

const QUICK_QUESTIONS = [
  'What is the biggest privacy concern?',
  'Is this app safe to use?',
  'Which permissions should I deny?',
];

function AIAssistant({ data, onUpdateData }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  const analysisId = data.analysisId || data.id;

  useEffect(() => {
    setMessages([]);
  }, [analysisId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text) {
    const value = (text || question).trim();
    if (!value || !analysisId) return;

    // Detect URL
    const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?$/.test(value) || value.includes('play.google.com') || value.includes('id=');
    if (isUrl) {
      setMessages(prev => [...prev, { role: 'user', text: value }]);
      setQuestion('');
      setBusy(true);
      try {
        let newReport;
        if (value.includes('play.google.com') || value.includes('id=')) {
          newReport = await analyzeApplicationUrl(value, true);
        } else {
          newReport = await analyzeApplicationUrl(value, false);
        }
        onUpdateData(newReport);
        setMessages(prev => [...prev, { role: 'assistant', text: "I've updated the analysis for this application." }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', text: `Failed to analyze URL: ${err.message}`, error: true }]);
      } finally {
        setBusy(false);
      }
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: value }]);
    setQuestion('');
    setBusy(true);
    try {
      const historyPayload = messages.map(m => ({ role: m.role, text: m.text }));
      const res = await askSecurityAssistant(analysisId, value, historyPayload);
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: err.message, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ai-assistant">
      <div className="ai-assistant__header">
        <div className="ai-assistant__header-icon">
          <Sparkles className="ai-assistant__sparkle" />
        </div>
        <div>
          <h2 className="ai-assistant__title">AI Security Assistant</h2>
          <p className="ai-assistant__subtitle">Ask anything about this app's permissions</p>
        </div>
      </div>

      {/* Quick suggestion chips */}
      {messages.length === 0 && (
        <div className="ai-assistant__chips">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              className="ai-assistant__chip"
              onClick={() => send(q)}
              disabled={busy}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Chat window */}
      {messages.length > 0 && (
        <div className="ai-assistant__chat">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-assistant__msg ai-assistant__msg--${msg.role}${msg.error ? ' ai-assistant__msg--error' : ''}`}>
              {msg.role === 'assistant' && (
                <span className="ai-assistant__avatar">
                  <Bot className="ai-assistant__avatar-icon" />
                </span>
              )}
              <p className="ai-assistant__msg-text">
                {msg.role === 'assistant' ? highlightText(msg.text, data.permissions) : msg.text}
              </p>
            </div>
          ))}
          {busy && (
            <div className="ai-assistant__msg ai-assistant__msg--assistant">
              <span className="ai-assistant__avatar">
                <Bot className="ai-assistant__avatar-icon" />
              </span>
              <div className="ai-assistant__typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <form
        className="ai-assistant__input-row"
        onSubmit={e => { e.preventDefault(); send(); }}
      >
        <input
          className="ai-assistant__input"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask about a specific permission…"
          disabled={busy}
        />
        <button
          type="submit"
          className="ai-assistant__send"
          disabled={busy || !question.trim()}
          aria-label="Send"
        >
          <Send className="ai-assistant__send-icon" />
        </button>
      </form>
    </section>
  );
}

// ─── Sources ───────────────────────────────────────────────────────────────────

function SourcesSection({ data }) {
  const id = data.id || '';
  const isRealPackage = id.includes('.') && !id.startsWith('http') && !id.startsWith('demo.');

  // Collect unique sources from all permissions (backend-verified URLs only)
  const uniqueSources = new Map();
  (data.permissions || []).forEach(p => {
    (p.sources || []).forEach(src => {
      if (src.url && src.title && !uniqueSources.has(src.url)) {
        uniqueSources.set(src.url, src);
      }
    });
  });
  const allSources = [...uniqueSources.values()];

  return (
    <section className="results-sources">
      <div className="results-sources__header">
        <BookOpen className="results-sources__icon" />
        <h2 className="results-sources__title">Sources &amp; References</h2>
      </div>
      <ul className="results-sources__list">
        {isRealPackage && (
          <li className="results-sources__item">
            <span className="results-sources__dot" />
            <span className="results-sources__label">Official App — Google Play Store</span>
            <a href={`https://play.google.com/store/apps/details?id=${id}`} target="_blank" rel="noopener noreferrer" className="results-sources__link">
              View listing <ExternalLink className="results-sources__link-icon" />
            </a>
          </li>
        )}
        <li className="results-sources__item">
          <span className="results-sources__dot" />
          <span className="results-sources__label">Android Permissions Reference</span>
          <span className="results-sources__note"> — Official Android developer documentation</span>
          <a href="https://developer.android.com/reference/android/Manifest.permission" target="_blank" rel="noopener noreferrer" className="results-sources__link">
            View source <ExternalLink className="results-sources__link-icon" />
          </a>
        </li>
        {/* Show analysis methodology note */}
        <li className="results-sources__item">
          <span className="results-sources__dot" />
          <span className="results-sources__label">Analysis method</span>
          <span className="results-sources__note"> — {data.methodology || 'Static permission analysis'}</span>
        </li>
      </ul>
    </section>
  );
}

// ─── Technical Details ─────────────────────────────────────────────────────────

function TechnicalDetails({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="results-tech">
      <button className="results-tech__toggle" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span>Technical Details</span>
        {open ? <ChevronUp className="results-tech__chevron" /> : <ChevronDown className="results-tech__chevron" />}
      </button>
      {open && (
        <div className="results-tech__body">
          <div className="results-tech__meta-grid">
            <div className="results-tech__meta-item">
              <span className="results-tech__meta-label">Data source</span>
              <span className="results-tech__meta-value">{data.dataSource || 'Unknown'}</span>
            </div>
            <div className="results-tech__meta-item">
              <span className="results-tech__meta-label">Analyzed at</span>
              <span className="results-tech__meta-value">{data.analyzedAt ? new Date(data.analyzedAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="results-tech__meta-item">
              <span className="results-tech__meta-label">Analysis method</span>
              <span className="results-tech__meta-value">{data.methodology || 'Static permission analysis'}</span>
            </div>
            {data.securityAssessment?.confidence && (
              <div className="results-tech__meta-item">
                <span className="results-tech__meta-label">Confidence</span>
                <span className="results-tech__meta-value">{data.securityAssessment.confidence}%</span>
              </div>
            )}
          </div>
          {data.limitations && <p className="results-tech__limitations">{data.limitations}</p>}
          <h3 className="results-tech__perm-heading">Per-Permission Technical Analysis</h3>
          <div className="results-tech__perm-table">
            <div className="results-tech__perm-table-header">
              <span>Permission</span>
              <span>Status</span>
              <span>Category</span>
              <span>Risk Score</span>
              <span>Technical Name</span>
            </div>
            {data.permissions.map(p => (
              <div key={p.id} className="results-tech__perm-row">
                <span className="results-tech__perm-name">{p.permission}</span>
                <span className={`results-tech__perm-status results-tech__perm-status--${mapStatus(p.status)}`}>
                  {statusLabel(p.status)}
                </span>
                <span className="results-tech__perm-sensitivity">{p.sensitivity || '—'}</span>
                <span className="results-tech__perm-risk">{p.riskScore ?? '—'}</span>
                <span className="results-tech__perm-id">{p.id || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Sandbox Banner ───────────────────────────────────────────────────────────

function SandboxBanner({ originalScore, simulatedScore, deniedCount, totalCount }) {
  if (deniedCount === 0) {
    return (
      <div className="sandbox-banner">
        <div className="sandbox-banner__header">
          <div className="sandbox-banner__title-wrap">
            <Shield className="sandbox-banner__icon" />
            <h2 className="sandbox-banner__title">Interactive Permission Sandbox</h2>
          </div>
          <span className="sandbox-banner__badge">SIMULATOR READY</span>
        </div>
        <p className="sandbox-banner__desc">
          Uncheck the checkboxes on the permission cards below to simulate blocking them. See how it affects your device capability and overall privacy risk score!
        </p>
      </div>
    );
  }

  const reduction = originalScore - simulatedScore;
  const ratingText = simulatedScore <= 20 ? 'Low Risk' : simulatedScore <= 40 ? 'Moderate Risk' : simulatedScore <= 70 ? 'High Risk' : 'Critical Risk';

  return (
    <div className="sandbox-banner">
      <div className="sandbox-banner__header">
        <div className="sandbox-banner__title-wrap">
          <Shield className="sandbox-banner__icon" style={{ color: '#34D399' }} />
          <h2 className="sandbox-banner__title">Interactive Permission Sandbox</h2>
        </div>
        <span className="sandbox-banner__badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
          SIMULATION ACTIVE
        </span>
      </div>
      <div className="sandbox-banner__score-row">
        <div className="sandbox-score-card">
          <span className="sandbox-score-card__label">Original Risk</span>
          <span className="sandbox-score-card__value sandbox-score-card__value--original">{originalScore} / 100</span>
        </div>
        <span className="sandbox-banner__arrow">→</span>
        <div className="sandbox-score-card">
          <span className="sandbox-score-card__label">Simulated Risk</span>
          <span className="sandbox-score-card__value sandbox-score-card__value--simulated" style={{ color: simulatedScore <= 40 ? '#34D399' : '#67E8F9' }}>
            {simulatedScore} / 100
          </span>
        </div>
        {reduction > 0 && (
          <div className="sandbox-score-card" style={{ marginLeft: 'auto' }}>
            <span className="sandbox-score-card__label">Risk Reduction</span>
            <span className="sandbox-score-card__value sandbox-score-card__value--reduction">-{reduction} pts</span>
          </div>
        )}
      </div>
      <p className="sandbox-banner__desc" style={{ borderColor: '#34D399' }}>
        You are simulating blocking <strong>{deniedCount} of {totalCount}</strong> permissions. {reduction > 0 ? `This reduces your privacy profile to a safer ${ratingText} level.` : ''} Be sure to check the red warnings below to see which app features might be affected.
      </p>
    </div>
  );
}

function SecurityPosturePie({ simulatedScore }) {
  const safeSlice = 100 - simulatedScore;
  const warningSlice = Math.round(simulatedScore * 0.45);
  const criticalSlice = Math.round(simulatedScore * 0.55);

  const total = safeSlice + warningSlice + criticalSlice || 1;
  const segments = [
    { key: 'safe', value: safeSlice, color: '#10B981', label: 'Trusted Safety' },
    { key: 'warning', value: warningSlice, color: '#F59E0B', label: 'Exposure Warning' },
    { key: 'critical', value: criticalSlice, color: '#EF4444', label: 'Abuse Concern' },
  ].filter(s => s.value > 0);

  // Donut parameters (keeps hollow center to avoid overlap spikes)
  const cx = 60, cy = 60, r = 44, strokeWidth = 12;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="metrics-panel-card">
      <div className="metrics-panel-card__header">
        <Shield className="metrics-panel-card__icon text-emerald-400" />
        <h3 className="metrics-panel-card__title">Security Level Posture</h3>
      </div>
      <div className="security-pie-container">
        <div className="security-pie-svg-wrap">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Background circle */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0F172A" strokeWidth={strokeWidth} />
            {segments.map(seg => {
              const dash = (seg.value / total) * circumference;
              const gap = circumference - dash;
              const node = (
                <circle
                  key={seg.key}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 0.8s ease' }}
                />
              );
              offset += dash;
              return node;
            })}
            {/* Center score percentage text */}
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#F8FAFC" fontSize="13" fontWeight="800" fontFamily="Space Grotesk, sans-serif">
              {Math.max(0, 100 - simulatedScore)}%
            </text>
            <text x={cx} y={cy + 13} textAnchor="middle" fill="#64748B" fontSize="6" fontWeight="700" fontFamily="Inter, sans-serif">
              SAFE
            </text>
          </svg>
        </div>
        <div className="security-pie-legend">
          {segments.map(seg => (
            <div key={seg.key} className="security-pie-legend__item">
              <span className="security-pie-legend__dot-label">
                <span className="security-pie-legend__dot" style={{ background: seg.color }} />
                <span>{seg.label}</span>
              </span>
              <span className="security-pie-legend__val" style={{ color: seg.color }}>
                {Math.round((seg.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App Store Rating & Reviews Graph ──────────────────────────────────────────

function RatingGraph({ rating = 4.2 }) {
  const R = parseFloat(rating || 4.2);

  // Compute a realistic distribution based on rating
  const p5 = Math.max(5, Math.round((R - 1) * 22));
  const p4 = Math.max(3, Math.round((5 - R) * 20));
  const p3 = Math.max(2, Math.round((5 - R) * 10));
  const p2 = Math.max(1, Math.round((5 - R) * 5));
  const p1 = Math.max(1, 100 - (p5 + p4 + p3 + p2));

  const distribution = [
    { stars: 5, percentage: p5 },
    { stars: 4, percentage: p4 },
    { stars: 3, percentage: p3 },
    { stars: 2, percentage: p2 },
    { stars: 1, percentage: p1 },
  ];

  return (
    <div className="metrics-panel-card">
      <div className="metrics-panel-card__header">
        <Star className="metrics-panel-card__icon text-amber-400" />
        <h3 className="metrics-panel-card__title">App Review &amp; Ratings</h3>
      </div>
      <div className="rating-graph-container">
        <div className="rating-graph-score-box">
          <span className="rating-graph-num">{R.toFixed(1)}</span>
          <div className="rating-graph-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="rating-graph-star-icon"
                style={{
                  fill: i < Math.floor(R) ? '#F59E0B' : 'none',
                  color: '#F59E0B'
                }}
              />
            ))}
          </div>
          <span className="rating-graph-total-reviews">Store Average</span>
        </div>

        <div className="rating-graph-bars">
          {distribution.map(row => (
            <div key={row.stars} className="rating-graph-bar-row">
              <span className="rating-graph-star-label">{row.stars}</span>
              <div className="rating-graph-track">
                <div 
                  className="rating-graph-fill" 
                  style={{ width: `${row.percentage}%` }} 
                />
              </div>
              <span className="rating-graph-pct-val">{row.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ResultsDashboard({ data: propData, onReset }) {
  const [currentData, setCurrentData] = useState(propData);

  useEffect(() => {
    setCurrentData(propData);
  }, [propData]);

  const data = currentData || propData;

  if (!data) return null;

  const [deniedSet, setDeniedSet] = useState(new Set());
  const [timeMachineOpen, setTimeMachineOpen] = useState(false);
  const [attackSimulatorOpen, setAttackSimulatorOpen] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [loadingSimulation, setLoadingSimulation] = useState(false);

  // Toggle permission simulator state
  function handleTogglePermission(id) {
    setDeniedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Load and open Attack Simulator details
  async function handleOpenAttackSimulator() {
    setLoadingSimulation(true);
    try {
      const sim = await simulatePrivacyImpactApi(data.analysisId || data.id);
      setSimulationData(sim);
      setAttackSimulatorOpen(true);
    } catch (err) {
      console.error('[Attack Simulator Error]:', err.message);
      alert(err.message || 'Unable to load privacy attack simulation details.');
    } finally {
      setLoadingSimulation(false);
    }
  }

  // Original buckets (all permissions)
  const buckets = bucketPermissions(data.permissions || []);

  // Simulated buckets (excluding simulated denied permissions for Donut Chart & Breakdown)
  const activePermissions = (data.permissions || []).filter(p => !deniedSet.has(p.id));
  const activeBuckets = bucketPermissions(activePermissions);

  // Dynamic Score computation
  const originalScore = data.privacyScore || 0;
  let simulatedScore = originalScore;
  let deniedCount = 0;

  (data.permissions || []).forEach(p => {
    if (deniedSet.has(p.id)) {
      deniedCount++;
      // Reduce score by the permission's individual risk contribution
      simulatedScore -= (p.riskScore ?? 12);
    }
  });

  // Keep simulated score within boundaries
  simulatedScore = Math.max(5, Math.min(100, Math.round(simulatedScore)));

  return (
    <div className="results-page">
      {/* Top bar */}
      <div className="results-page__topbar">
        <button onClick={onReset} className="results-page__back-btn" title="Back to main search">
          <ArrowLeft className="results-page__back-icon" />
          New analysis
        </button>

        {/* TIME MACHINE TRIGGER */}
        <button
          onClick={() => setTimeMachineOpen(true)}
          className="results-page__back-btn text-green-400 hover:text-green-300"
          style={{ marginLeft: '0.65rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}
          title="Compare permission history across versions"
        >
          <Clock className="results-page__back-icon" />
          Time Machine
        </button>

        {/* ATTACK SIMULATOR TRIGGER */}
        <button
          onClick={handleOpenAttackSimulator}
          disabled={loadingSimulation}
          className="results-page__back-btn text-rose-400 hover:text-rose-200 disabled:opacity-50"
          style={{ marginLeft: '0.5rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)' }}
          title="Run simulated penetration scenarios"
        >
          <Sword className="results-page__back-icon" />
          {loadingSimulation ? 'Loading Simulator...' : 'Attack Simulator'}
        </button>

        <div className="results-page__badges" style={{ marginLeft: 'auto' }}>
          {data.demo && <span className="results-page__badge results-page__badge--demo">DEMO DATASET</span>}
          <span className="results-page__badge results-page__badge--analyzed">
            ANALYZED {new Date(data.analyzedAt || Date.now()).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* 1. App Info Card */}
      <AppInfoCard data={data} />

      {/* 2. Interactive Permission Sandbox Simulator Panel */}
      <SandboxBanner
        originalScore={originalScore}
        simulatedScore={simulatedScore}
        deniedCount={deniedCount}
        totalCount={(data.permissions || []).length}
      />

      {/* 3. Permission Breakdown + Donut Chart (Updates dynamically in Sandbox mode) */}
      <PermissionBreakdown buckets={activeBuckets} />

      {/* Advanced metrics section containing Security Posture Pie and Store Rating Graph */}
      <div className="advanced-metrics-section">
        <SecurityPosturePie simulatedScore={simulatedScore} />
        <RatingGraph rating={data.rating} />
      </div>

      {/* 4. Required Permissions */}
      <PermissionSection
        title="Required Permissions"
        variant="required"
        icon="🟢"
        items={buckets.required}
        deniedSet={deniedSet}
        onToggle={handleTogglePermission}
      />

      {/* 5. Optional Permissions */}
      <PermissionSection
        title="Optional Permissions"
        variant="optional"
        icon="🟡"
        items={buckets.optional}
        deniedSet={deniedSet}
        onToggle={handleTogglePermission}
      />

      {/* 6. Unnecessary Permissions */}
      <PermissionSection
        title="Unnecessary Permissions"
        variant="unnecessary"
        icon="🔴"
        items={buckets.unnecessary}
        deniedSet={deniedSet}
        onToggle={handleTogglePermission}
      />

      {/* 7. AI Security & Privacy Assessment */}
      <AIAssessmentCard assessment={data.securityAssessment} />

      {/* 8. AI Assistant Chat */}
      <AIAssistant data={data} onUpdateData={setCurrentData} />

      {/* 9. Sources & References */}
      <SourcesSection data={data} />

      {/* 10. Technical Details */}
      <TechnicalDetails data={data} />

      {/* OVERLAY MODAL: TIME MACHINE COMPARISON */}
      {timeMachineOpen && (
        <TimeMachineModal
          currentReport={data}
          onClose={() => setTimeMachineOpen(false)}
        />
      )}

      {/* OVERLAY MODAL: ATTACK SIMULATOR */}
      {attackSimulatorOpen && simulationData && (
        <AttackSimulatorModal
          simulation={simulationData}
          onClose={() => setAttackSimulatorOpen(false)}
        />
      )}
    </div>
  );
}

