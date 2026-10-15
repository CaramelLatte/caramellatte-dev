import React, { useState, useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL = 5000;
const ESCALATION_GROUPS = ['Network Team', 'Systems Team', 'Dev Team', 'Security', 'Facilities'];
const DEFAULT_LABELS = {
    diagnostic_accuracy: 'Diagnostic accuracy',
    diagnostic_efficiency: 'Diagnostic efficiency',
    escalation_judgment: 'Escalation judgment',
    change_safety: 'Change safety',
    response_timeliness: 'Response timeliness',
    customer_service: 'Customer service',
};

// Scenario entries come from /api/catalog (rich) or /api/scenarios (ids only).
function toEntry(s) {
    if (typeof s === 'string') {
        return { id: s, title: s.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), kind: 'sim' };
    }
    return s;
}

function Helpdesk() {
    const [phase, setPhase] = useState('pick');       // 'pick' | 'active' | 'graded'
    const [scenarios, setScenarios] = useState([]);
    const [selected, setSelected] = useState(null);
    const [ticketId, setTicketId] = useState(null);
    const [lab, setLab] = useState(null);             // lab session info for live-machine scenarios
    const [consoleTab, setConsoleTab] = useState('terminal');
    const [thread, setThread] = useState([]);
    const [shellLog, setShellLog] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [commandInput, setCommandInput] = useState('');
    const [closeNotes, setCloseNotes] = useState('');
    const [resolutionMode, setResolutionMode] = useState('close');  // 'close' | 'escalate'
    const [escalateGroup, setEscalateGroup] = useState('');
    const [grade, setGrade] = useState(null);
    const [error, setError] = useState(null);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [showCmdRef, setShowCmdRef] = useState(false);
    const [availableCommands, setAvailableCommands] = useState([]);

    const threadEndRef = useRef(null);
    const shellEndRef = useRef(null);
    const pollThreadRef = useRef(null);
    const pollShellRef = useRef(null);

    // Load scenarios: rich catalog first, plain id list as a fallback
    useEffect(() => {
        fetch('/api/catalog')
            .then(r => (r.ok ? r.json() : Promise.reject()))
            .then(data => setScenarios((data.scenarios ?? []).map(toEntry)))
            .catch(() =>
                fetch('/api/scenarios')
                    .then(r => r.json())
                    .then(data => setScenarios((Array.isArray(data) ? data : (data.scenarios ?? [])).map(toEntry)))
                    .catch(() => setError('Could not reach the ticketing sim! Is it running?'))
            );
    }, []);

    const fetchThread = useCallback((id) => {
        fetch(`/api/tickets/${id}/thread`)
            .then(r => r.json())
            .then(data => setThread(Array.isArray(data) ? data : (data.messages ?? [])))
            .catch(() => {});
    }, []);

    const fetchShellLog = useCallback((id) => {
        fetch(`/api/shell/${id}/log`)
            .then(r => r.json())
            .then(data => setShellLog(Array.isArray(data) ? data : (data.command_log ?? [])))
            .catch(() => {});
    }, []);

    // Start polling when active
    useEffect(() => {
        if (phase !== 'active' || !ticketId) return;
        fetchThread(ticketId);
        pollThreadRef.current = setInterval(() => fetchThread(ticketId), POLL_INTERVAL);
        if (!lab) {
            fetchShellLog(ticketId);
            pollShellRef.current = setInterval(() => fetchShellLog(ticketId), POLL_INTERVAL);
        }
        return () => {
            clearInterval(pollThreadRef.current);
            clearInterval(pollShellRef.current);
        };
    }, [phase, ticketId, lab, fetchThread, fetchShellLog]);

    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    useEffect(() => {
        shellEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [shellLog]);

    const startSession = async () => {
        if (!selected) return;
        setStarting(true);
        setError(null);
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario_id: selected.id }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Bad response');
            const id = data.ticket_id;
            setTicketId(id);
            setLab(data.lab ?? null);
            setConsoleTab(data.lab?.consoles?.terminal ? 'terminal' : 'gui');
            if (!data.lab) {
                fetch(`/api/shell/${id}/commands`)
                    .then(r => r.json())
                    .then(d => setAvailableCommands(Array.isArray(d.available_commands) ? d.available_commands : []))
                    .catch(() => {});
            }
            setPhase('active');
        } catch (e) {
            setError(e.message && e.message !== 'Bad response'
                ? e.message
                : 'Failed to start session. Check that the ticketing sim is running.');
        } finally {
            setStarting(false);
        }
    };

    const sendMessage = async () => {
        const msg = messageInput.trim();
        if (!msg || sendingMsg) return;
        setSendingMsg(true);
        setMessageInput('');
        try {
            await fetch(`/api/tickets/${ticketId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
            });
            fetchThread(ticketId);
        } catch {
            setError('Failed to send message.');
        } finally {
            setSendingMsg(false);
        }
    };

    const runCommand = async () => {
        const cmd = commandInput.trim();
        if (!cmd) return;
        setCommandInput('');
        try {
            await fetch(`/api/shell/${ticketId}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd }),
            });
            fetchShellLog(ticketId);
        } catch {
            setError('Failed to run command.');
        }
    };

    const submitResolution = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const stateBody = resolutionMode === 'close'
                ? { state: 'closed' }
                : { group: escalateGroup };

            const st = await fetch(`/api/tickets/${ticketId}/state`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stateBody),
            });
            if (!st.ok) throw new Error('State update failed');

            const res = await fetch(`/api/tickets/${ticketId}/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: closeNotes, resolution_notes: closeNotes }),
            });
            if (!res.ok) throw new Error('Close failed');
            const data = await res.json();
            clearInterval(pollThreadRef.current);
            clearInterval(pollShellRef.current);
            setGrade(data);
            setPhase('graded');
        } catch {
            setError('Failed to submit resolution.');
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setPhase('pick');
        setSelected(null);
        setTicketId(null);
        setLab(null);
        setThread([]);
        setShellLog([]);
        setMessageInput('');
        setCommandInput('');
        setCloseNotes('');
        setResolutionMode('close');
        setEscalateGroup('');
        setGrade(null);
        setError(null);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (phase === 'pick') {
        return (
            <div className="hd-page container-fluid py-4">
                <div className="hd-inner mx-auto">
                    <header className="page-header">
                        <p className="eyebrow">Live project</p>
                        <h1 className="page-title">IT Helpdesk Simulator</h1>
                        <p className="page-lede">
                            Work a realistic support ticket from start to finish. Talk to the end user, fix or
                            escalate. Most scenarios give you a real, disposable Linux machine with a genuine fault
                            injected. A locally hosted LLM plays the user and grades your work from what you
                            actually did on the machine.
                        </p>
                    </header>

                    <div className="hd-howto mb-4">
                        <ol className="hd-howto-steps">
                            <li className="hd-howto-step">
                                <span className="hd-howto-num">1</span>
                                <span>Read the user's opening message to understand the issue.</span>
                            </li>
                            <li className="hd-howto-step">
                                <span className="hd-howto-num">2</span>
                                <span>Investigate on the machine: a real terminal, and the user's desktop for some tickets.</span>
                            </li>
                            <li className="hd-howto-step">
                                <span className="hd-howto-num">3</span>
                                <span>Reply in the Conversation panel. The AI persona responds and notices when things are fixed.</span>
                            </li>
                            <li className="hd-howto-step">
                                <span className="hd-howto-num">4</span>
                                <span>Close or escalate, write resolution notes, and submit for grading.</span>
                            </li>
                        </ol>
                    </div>

                    <h2 className="section-title mb-3">Choose a scenario</h2>

                    {error && <div className="hd-error mb-3">{error}</div>}

                    {scenarios.length === 0 && !error && (
                        <div className="empty-state">Loading scenarios…</div>
                    )}

                    <div className="row g-3">
                        {scenarios.map((s, i) => (
                            <div className="col-12 col-md-6" key={s.id ?? i}>
                                <div
                                    className={`hd-scenario-card ${selected?.id === s.id ? 'hd-scenario-selected' : ''}`}
                                    onClick={() => setSelected(s)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && setSelected(s)}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h3 className="h5 mb-0">{s.title}</h3>
                                        {selected?.id === s.id && (
                                            <span className="hd-pill hd-pill-selected">Selected</span>
                                        )}
                                    </div>
                                    <p className="hd-scenario-desc">{s.description ?? ''}</p>
                                    <div className="mt-2 d-flex gap-2 flex-wrap">
                                        {s.kind === 'lab'
                                            ? <span className="hd-pill hd-pill-live">Live machine</span>
                                            : <span className="hd-pill">Simulated shell</span>}
                                        {(s.consoles ?? []).includes('gui') && <span className="hd-pill">Desktop</span>}
                                        {s.difficulty && <span className="hd-pill">{s.difficulty}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hd-start-bar mt-4">
                        <p className="hd-notice mb-0">
                            Runs on self-hosted hardware with a local LLM. Starting a machine and persona replies can
                            take <strong>15–45 seconds</strong>.
                        </p>
                        <button
                            className="btn-ui btn-ui-primary"
                            disabled={!selected || starting}
                            onClick={startSession}
                        >
                            {starting ? (selected?.kind === 'lab' ? 'Preparing machine…' : 'Starting…') : 'Start session'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'graded') {
        return (
            <div className="hd-page container-fluid py-4">
                <div className="hd-inner mx-auto">
                    <header className="page-header">
                        <p className="eyebrow">Session complete</p>
                        <h1 className="page-title">Grading report</h1>
                        <p className="page-lede">Ticket #{ticketId} · {selected?.title}</p>
                    </header>

                    <div className="hd-grade-card">
                        <GradeReport data={grade} />
                    </div>

                    <div className="mt-4">
                        <button className="btn-ui btn-ui-primary" onClick={reset}>
                            Try another scenario
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // phase === 'active'
    const access = lab?.access ?? {};
    return (
        <div className="hd-active py-3">
            <div className="hd-ticketbar mb-3">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <span className="hd-ticket-id">Ticket #{ticketId}</span>
                    <span className="hd-ticketbar-name">{selected?.title}</span>
                    {lab && access.terminal && (
                        <span className="hd-pill hd-pill-live">
                            {access.terminal.user}@{access.terminal.hostname} · sudo
                        </span>
                    )}
                    {selected?.difficulty && <span className="hd-pill ms-auto">{selected.difficulty}</span>}
                </div>
            </div>

            <p className="hd-notice hd-notice-sm mb-3">
                {lab
                    ? 'This is a real, disposable machine. Everything you do on it, and its final state, is used for grading. Persona replies can take 15–45 seconds.'
                    : 'Running on self-hosted hardware with a local LLM. Persona replies and grading can take 15–45 seconds.'}
            </p>

            {error && <div className="hd-error mb-3">{error}</div>}

            <div className="row g-3">
                {/* Conversation + resolution */}
                <div className={`col-12 ${lab ? 'col-xl-5' : 'col-lg-7'} d-flex flex-column gap-3`}>
                    <div className="hd-panel hd-thread-panel flex-grow-1 d-flex flex-column">
                        <div className="hd-panel-label">Conversation</div>
                        <div className="hd-thread flex-grow-1">
                            {thread.length === 0 && (
                                <p className="hd-thread-empty">Waiting for the first message…</p>
                            )}
                            {thread.map((msg, i) => (
                                <ThreadMessage key={msg.article_id ?? i} msg={msg} />
                            ))}
                            <div ref={threadEndRef} />
                        </div>
                        <div className="hd-reply">
                            <textarea
                                className="hd-textarea"
                                rows={3}
                                placeholder="Type your response…"
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendMessage();
                                }}
                            />
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <small className="hd-hint">Ctrl+Enter to send</small>
                                <button
                                    className="btn-ui btn-ui-primary btn-ui-sm"
                                    onClick={sendMessage}
                                    disabled={!messageInput.trim() || sendingMsg}
                                >
                                    {sendingMsg ? 'Sending…' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {lab && (
                        <ResolutionPanel
                            resolutionMode={resolutionMode} setResolutionMode={setResolutionMode}
                            escalateGroup={escalateGroup} setEscalateGroup={setEscalateGroup}
                            closeNotes={closeNotes} setCloseNotes={setCloseNotes}
                            submitting={submitting} submitResolution={submitResolution}
                        />
                    )}
                </div>

                {/* Machine consoles (lab) or the simulated shell */}
                <div className={`col-12 ${lab ? 'col-xl-7' : 'col-lg-5'} d-flex flex-column gap-3`}>
                    {lab ? (
                        <div className="hd-panel hd-console-panel d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="hd-console-tabs">
                                    {lab.consoles?.terminal && (
                                        <button
                                            className={`hd-toggle-btn ${consoleTab === 'terminal' ? 'active' : ''}`}
                                            onClick={() => setConsoleTab('terminal')}
                                        >
                                            Terminal
                                        </button>
                                    )}
                                    {lab.consoles?.gui && (
                                        <button
                                            className={`hd-toggle-btn ${consoleTab === 'gui' ? 'active' : ''}`}
                                            onClick={() => setConsoleTab('gui')}
                                        >
                                            {access.gui?.desktop_user ? `${access.gui.desktop_user}'s desktop` : 'Desktop'}
                                        </button>
                                    )}
                                </div>
                                <span className="hd-hint">
                                    {(lab.machines ?? []).map(m => m.hostname).join(', ')}
                                </span>
                            </div>
                            {/* Both consoles stay mounted so switching tabs keeps the connections open */}
                            {lab.consoles?.terminal && (
                                <iframe
                                    title="Terminal"
                                    src={lab.consoles.terminal}
                                    className="hd-console-frame"
                                    style={{ display: consoleTab === 'terminal' ? 'block' : 'none' }}
                                    allow="clipboard-read; clipboard-write"
                                />
                            )}
                            {lab.consoles?.gui && (
                                <iframe
                                    title="Desktop"
                                    src={lab.consoles.gui}
                                    className="hd-console-frame"
                                    style={{ display: consoleTab === 'gui' ? 'block' : 'none' }}
                                    allow="clipboard-read; clipboard-write"
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="hd-panel hd-shell-panel d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="hd-panel-label mb-0">Shell / Diagnostics</div>
                                    <button className="hd-cmdref-toggle" onClick={() => setShowCmdRef(v => !v)}>
                                        {showCmdRef ? 'Hide commands' : 'Available commands'}
                                    </button>
                                </div>
                                {showCmdRef && <CommandReference commands={availableCommands} />}
                                <div className="hd-shell-log flex-grow-1">
                                    {shellLog.length === 0 && (
                                        <span className="hd-shell-placeholder">No commands run yet.</span>
                                    )}
                                    {shellLog.map((entry, i) => (
                                        <ShellEntry key={i} entry={entry} />
                                    ))}
                                    <div ref={shellEndRef} />
                                </div>
                                <div className="hd-shell-input-row">
                                    <span className="hd-shell-prompt">$</span>
                                    <input
                                        className="hd-shell-input"
                                        type="text"
                                        placeholder="ping 192.168.1.1"
                                        value={commandInput}
                                        onChange={e => setCommandInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && runCommand()}
                                    />
                                    <button className="hd-btn-run" onClick={runCommand}>Run</button>
                                </div>
                            </div>
                            <ResolutionPanel
                                resolutionMode={resolutionMode} setResolutionMode={setResolutionMode}
                                escalateGroup={escalateGroup} setEscalateGroup={setEscalateGroup}
                                closeNotes={closeNotes} setCloseNotes={setCloseNotes}
                                submitting={submitting} submitResolution={submitResolution}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ResolutionPanel({ resolutionMode, setResolutionMode, escalateGroup, setEscalateGroup,
                           closeNotes, setCloseNotes, submitting, submitResolution }) {
    return (
        <div className="hd-panel hd-resolution-panel">
            <div className="hd-panel-label">Resolution</div>
            <div className="hd-resolution-toggle mb-3">
                <button
                    className={`hd-toggle-btn ${resolutionMode === 'close' ? 'active' : ''}`}
                    onClick={() => setResolutionMode('close')}
                >
                    Close ticket
                </button>
                <button
                    className={`hd-toggle-btn ${resolutionMode === 'escalate' ? 'active' : ''}`}
                    onClick={() => setResolutionMode('escalate')}
                >
                    Escalate
                </button>
            </div>

            {resolutionMode === 'escalate' && (
                <select
                    className="hd-input mb-3"
                    value={escalateGroup}
                    onChange={e => setEscalateGroup(e.target.value)}
                >
                    <option value="">Escalate to…</option>
                    {ESCALATION_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            )}

            <textarea
                className="hd-textarea mb-3"
                rows={3}
                placeholder="Resolution notes (what you found, what you did, or what the next team needs)…"
                value={closeNotes}
                onChange={e => setCloseNotes(e.target.value)}
            />

            <button
                className="btn-ui btn-ui-primary btn-ui-block"
                onClick={submitResolution}
                disabled={submitting || (resolutionMode === 'escalate' && !escalateGroup)}
            >
                {submitting && <span className="hd-spinner" />}
                {submitting
                    ? 'Grading... this may take a moment…'
                    : resolutionMode === 'close' ? 'Submit & Grade' : 'Escalate & Grade'}
            </button>
        </div>
    );
}

function ThreadMessage({ msg }) {
    const isOperator = msg.role === 'operator';
    return (
        <div className={`hd-msg ${isOperator ? 'hd-msg-operator' : 'hd-msg-user'}`}>
            <div className="hd-msg-meta">
                <span className="hd-msg-role">{isOperator ? 'You' : 'User'}</span>
                {msg.timestamp && (
                    <span className="hd-msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            <div className="hd-msg-body">{msg.body}</div>
        </div>
    );
}

function ShellEntry({ entry }) {
    if (typeof entry === 'string') {
        return <pre className="hd-shell-line">{entry}</pre>;
    }
    return (
        <div className="hd-shell-entry">
            {entry.command && <div className="hd-shell-cmd">$ {entry.command}</div>}
            {entry.output && <pre className="hd-shell-out">{entry.output}</pre>}
        </div>
    );
}

function GradeReport({ data }) {
    if (!data) return null;
    const g = data.grading ?? {};
    const labels = g.rubric_labels ?? DEFAULT_LABELS;
    const path = data.resolution_path;
    const labInfo = data.lab;

    return (
        <div className="hd-grade-body">
            {g.overall_score && (
                <div className="hd-grade-score">
                    <span className="hd-grade-label">Score</span>
                    <span className="hd-grade-value">{g.overall_score}</span>
                </div>
            )}

            {path && (
                <div className="mb-3">
                    <div className="hd-grade-section-label">Outcome</div>
                    <p className="hd-grade-feedback mb-1">{path.label}</p>
                    <small className="hd-hint">
                        {data.zammad_group && data.zammad_group !== 'Users'
                            ? `Escalated to ${data.zammad_group}`
                            : `Ticket ${data.zammad_state ?? ''}`}
                        {path.score_modifier !== undefined && ` · credit ${Math.round(path.score_modifier * 100)}%`}
                    </small>
                </div>
            )}

            <div className="mb-3">
                <div className="hd-grade-section-label">Rubric</div>
                <ul className="hd-rubric-list">
                    {(g.rubric_order ?? Object.keys(labels)).filter(k => g[k]).map(k => (
                        <li key={k} className="hd-rubric-item">
                            <span className="hd-rubric-criterion">{labels[k] ?? k}</span>
                            <span className="hd-rubric-pts">{g[k]}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {g.feedback && (
                <div className="mb-3">
                    <div className="hd-grade-section-label">Feedback</div>
                    <p className="hd-grade-feedback" style={{ whiteSpace: 'pre-wrap' }}>{g.feedback}</p>
                </div>
            )}

            {labInfo?.checks?.length > 0 && (
                <div className="mb-3">
                    <div className="hd-grade-section-label">What the machine showed</div>
                    <ul className="hd-rubric-list">
                        {labInfo.checks.map((c, i) => {
                            const broke = c.kind === 'guard' && c.before && !c.after;
                            const fixed = c.kind !== 'guard' && !c.before && c.after;
                            const cls = broke ? 'hd-rubric-fail' : (c.after ? 'hd-rubric-pass' : '');
                            return (
                                <li key={i} className={`hd-rubric-item ${cls}`}>
                                    <span className="hd-rubric-criterion">{c.desc}</span>
                                    <span className="hd-rubric-pts">
                                        {broke ? 'broken by you' : fixed ? 'fixed' : c.after ? 'OK' : 'still failing'}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {labInfo?.debrief && (
                <div className="mb-3">
                    <div className="hd-grade-section-label">What was actually wrong</div>
                    <p className="hd-grade-feedback">{labInfo.debrief}</p>
                </div>
            )}
        </div>
    );
}

function CommandReference({ commands }) {
    if (!commands.length) return null;
    return (
        <div className="hd-cmdref">
            {commands.map((entry, i) => {
                const cmd = typeof entry === 'string' ? entry : (entry.command ?? entry.cmd ?? JSON.stringify(entry));
                const desc = typeof entry === 'object' ? (entry.description ?? entry.desc ?? '') : '';
                return (
                    <div key={i} className="hd-cmdref-row">
                        <code className="hd-cmdref-cmd">{cmd}</code>
                        {desc && <span className="hd-cmdref-desc">{desc}</span>}
                    </div>
                );
            })}
        </div>
    );
}

export default Helpdesk;
