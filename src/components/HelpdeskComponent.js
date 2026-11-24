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

// Full: chat with the AI user, ticket in Zammad, graded at close.
// Practice: written brief, no chat or ticket, instant pass/fail check, AI grade on request.
const MODE_KEY = 'hd-mode';
function loadMode() {
    try { return localStorage.getItem(MODE_KEY) === 'practice' ? 'practice' : 'full'; } catch { return 'full'; }
}
function saveMode(m) {
    try { localStorage.setItem(MODE_KEY, m); } catch { /* private window etc. */ }
}

// Scenario entries come from /api/catalog (rich) or /api/scenarios (ids only).
function toEntry(s) {
    if (typeof s === 'string') {
        return { id: s, title: s.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), kind: 'sim' };
    }
    return s;
}

function Helpdesk() {
    const [phase, setPhase] = useState('pick');       // 'pick' | 'active' | 'graded'
    const [mode, setModeState] = useState(loadMode);  // chosen on the picker for the next session
    const [ticketMode, setTicketMode] = useState('full');  // mode of the running session
    const [brief, setBrief] = useState(null);         // practice mode: the ticket as written
    const [grading, setGrading] = useState(false);    // practice mode: AI grade requested
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

    const setMode = (m) => { setModeState(m); saveMode(m); };
    const practice = ticketMode === 'practice';

    // Start polling when active
    useEffect(() => {
        if (phase !== 'active' || !ticketId) return;
        if (!practice) {   // practice sessions have no conversation
            fetchThread(ticketId);
            pollThreadRef.current = setInterval(() => fetchThread(ticketId), POLL_INTERVAL);
        }
        if (!lab) {
            fetchShellLog(ticketId);
            pollShellRef.current = setInterval(() => fetchShellLog(ticketId), POLL_INTERVAL);
        }
        return () => {
            clearInterval(pollThreadRef.current);
            clearInterval(pollShellRef.current);
        };
    }, [phase, ticketId, lab, practice, fetchThread, fetchShellLog]);

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
                body: JSON.stringify({ scenario_id: selected.id, mode }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Bad response');
            const id = data.ticket_id;
            setTicketId(id);
            setTicketMode(data.mode ?? 'full');
            setBrief(data.brief ?? null);
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
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Close failed');
            clearInterval(pollThreadRef.current);
            clearInterval(pollShellRef.current);
            setGrade(data);
            setPhase('graded');
        } catch (e) {
            setError(`Failed to submit resolution${e?.message ? `: ${e.message}` : '.'}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Practice mode: send the finished attempt to the grading model.
    const requestGrade = async () => {
        setGrading(true);
        setError(null);
        try {
            const res = await fetch(`/api/tickets/${ticketId}/grade`, { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Grading failed');
            setGrade(data);
        } catch (e) {
            setError(`Could not get a grade: ${e.message}`);
        } finally {
            setGrading(false);
        }
    };

    const reset = () => {
        setPhase('pick');
        setSelected(null);
        setTicketId(null);
        setLab(null);
        setTicketMode('full');
        setBrief(null);
        setGrading(false);
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

                    <div className="hd-mode mb-4">
                        <div className="hd-panel-label">Mode</div>
                        <div className="hd-resolution-toggle hd-mode-toggle mb-2" role="group" aria-label="Session mode">
                            <button
                                className={`hd-toggle-btn ${mode === 'full' ? 'active' : ''}`}
                                aria-pressed={mode === 'full'}
                                onClick={() => setMode('full')}
                            >
                                Full simulation
                            </button>
                            <button
                                className={`hd-toggle-btn ${mode === 'practice' ? 'active' : ''}`}
                                aria-pressed={mode === 'practice'}
                                onClick={() => setMode('practice')}
                            >
                                Technical practice
                            </button>
                        </div>
                        <p className="hd-notice hd-notice-sm mb-0">
                            {mode === 'full'
                                ? 'A ticket with an AI end user to talk to, graded by the AI at the end.'
                                : 'No user and no ticket: a written brief, the machine, and an instant pass/fail check at the end. The AI grade is optional.'}
                        </p>
                    </div>

                    <div className="hd-howto mb-4">
                        <ol className="hd-howto-steps">
                            {(mode === 'full' ? [
                                "Read the user's opening message to understand the issue.",
                                "Investigate on the machine: a real terminal, and the user's desktop for some tickets.",
                                'Reply in the Conversation panel. The AI persona responds and notices when things are fixed.',
                                'Close or escalate, write resolution notes, and submit for grading.',
                            ] : [
                                'Read the brief: the ticket as filed and what the user would tell you.',
                                "Investigate and fix on the machine: a real terminal, and the user's desktop for some tickets.",
                                'Close or escalate and write your notes.',
                                'See the pass/fail checks right away, then ask the AI for a grade and feedback if you want one.',
                            ]).map((text, i) => (
                                <li className="hd-howto-step" key={i}>
                                    <span className="hd-howto-num">{i + 1}</span>
                                    <span>{text}</span>
                                </li>
                            ))}
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
                            {mode === 'full'
                                ? <>Runs on self-hosted hardware with a local LLM. Starting a machine and persona replies can
                                    take <strong>15–45 seconds</strong>.</>
                                : <>Practice mode makes no AI calls until you ask for a grade. Live machines take
                                    about <strong>15 seconds</strong> to start.</>}
                        </p>
                        <button
                            className="btn-ui btn-ui-primary"
                            disabled={!selected || starting}
                            onClick={startSession}
                        >
                            {starting ? (selected?.kind === 'lab' ? 'Preparing machine…' : 'Starting…')
                                : mode === 'practice' ? 'Start practice' : 'Start session'}
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
                        <p className="eyebrow">{practice ? 'Practice complete' : 'Session complete'}</p>
                        <h1 className="page-title">{grade?.grading ? 'Grading report' : 'Result'}</h1>
                        <p className="page-lede">
                            {practice ? 'Practice' : 'Ticket'} #{ticketId} · {selected?.title}
                        </p>
                    </header>

                    {error && <div className="hd-error mb-3">{error}</div>}

                    {grade?.check && (
                        <div className="hd-grade-card mb-3">
                            <CheckReport check={grade.check} data={grade} />
                        </div>
                    )}

                    {grade?.grading ? (
                        <div className="hd-grade-card">
                            <GradeReport data={grade} />
                        </div>
                    ) : practice && (
                        <div className="hd-panel">
                            <div className="hd-panel-label">AI grade</div>
                            <p className="hd-notice hd-notice-sm mb-3">
                                Send your commands{lab ? ', the machine report' : ''}, your resolution and your notes to
                                the grading model for scores and specific feedback on the technical work. Takes about
                                20–60 seconds.
                            </p>
                            <button className="btn-ui btn-ui-primary" onClick={requestGrade} disabled={grading}>
                                {grading && <span className="hd-spinner" />}
                                {grading ? 'Grading…' : 'Get AI grade & feedback'}
                            </button>
                        </div>
                    )}

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
    // Full mode keeps its original layout. Practice has no chat, so the brief and the resolution
    // share a narrow left column and the machine gets the room.
    const leftCol = practice ? (lab ? 'col-xl-4' : 'col-lg-5') : (lab ? 'col-xl-5' : 'col-lg-7');
    const rightCol = practice ? (lab ? 'col-xl-8' : 'col-lg-7') : (lab ? 'col-xl-7' : 'col-lg-5');
    const resolutionLeft = practice || !!lab;
    return (
        <div className="hd-active py-3">
            <div className="hd-ticketbar mb-3">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <span className="hd-ticket-id">{practice ? 'Practice' : 'Ticket'} #{ticketId}</span>
                    <span className="hd-ticketbar-name">{selected?.title}</span>
                    {practice && <span className="hd-pill">Practice</span>}
                    {lab && access.terminal && (
                        <span className="hd-pill hd-pill-live">
                            {access.terminal.user}@{access.terminal.hostname} · sudo
                        </span>
                    )}
                    {selected?.difficulty && <span className="hd-pill ms-auto">{selected.difficulty}</span>}
                </div>
            </div>

            <p className="hd-notice hd-notice-sm mb-3">
                {practice
                    ? (lab
                        ? 'This is a real, disposable machine. Its final state and everything you run decide the pass/fail check.'
                        : 'Practice mode: commands you run decide the pass/fail check.')
                    : lab
                        ? 'This is a real, disposable machine. Everything you do on it, and its final state, is used for grading. Persona replies can take 15–45 seconds.'
                        : 'Running on self-hosted hardware with a local LLM. Persona replies and grading can take 15–45 seconds.'}
            </p>

            {error && <div className="hd-error mb-3">{error}</div>}

            <div className="row g-3">
                {/* Conversation (or the practice brief) + resolution */}
                <div className={`col-12 ${leftCol} d-flex flex-column gap-3`}>
                    {practice ? <BriefPanel brief={brief} /> : (
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
                    )}

                    {resolutionLeft && (
                        <ResolutionPanel practice={practice}
                            resolutionMode={resolutionMode} setResolutionMode={setResolutionMode}
                            escalateGroup={escalateGroup} setEscalateGroup={setEscalateGroup}
                            closeNotes={closeNotes} setCloseNotes={setCloseNotes}
                            submitting={submitting} submitResolution={submitResolution}
                        />
                    )}
                </div>

                {/* Machine consoles (lab) or the simulated shell */}
                <div className={`col-12 ${rightCol} d-flex flex-column gap-3`}>
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
                            {!resolutionLeft && (
                                <ResolutionPanel
                                    resolutionMode={resolutionMode} setResolutionMode={setResolutionMode}
                                    escalateGroup={escalateGroup} setEscalateGroup={setEscalateGroup}
                                    closeNotes={closeNotes} setCloseNotes={setCloseNotes}
                                    submitting={submitting} submitResolution={submitResolution}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ResolutionPanel({ practice, resolutionMode, setResolutionMode, escalateGroup, setEscalateGroup,
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
                    ? (practice ? 'Checking…' : 'Grading... this may take a moment…')
                    : practice
                        ? (resolutionMode === 'close' ? 'Close & check' : 'Escalate & check')
                        : (resolutionMode === 'close' ? 'Submit & Grade' : 'Escalate & Grade')}
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

    return (
        <div className="hd-grade-body">
            {g.overall_score && (
                <div className="hd-grade-score">
                    <span className="hd-grade-label">Score</span>
                    <span className="hd-grade-value">{g.overall_score}</span>
                </div>
            )}

            {/* Outcome, machine checks and debrief are in CheckReport. Older responses without a check: */}
            {!data.check && path && (
                <div className="mb-3">
                    <div className="hd-grade-section-label">Outcome</div>
                    <p className="hd-grade-feedback mb-1">{path.label}</p>
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

        </div>
    );
}

// Practice mode's stand-in for the conversation: the ticket as filed and what the user would say if asked.
function BriefPanel({ brief }) {
    if (!brief) return null;
    const r = brief.reporter ?? {};
    const who = [r.name, r.title].filter(Boolean).join(', ');
    const ids = [r.username && `user ${r.username}`, r.employee_id && `ID ${r.employee_id}`, r.hostname && `machine ${r.hostname}`]
        .filter(Boolean).join(' · ');
    return (
        <div className="hd-panel hd-brief">
            <div className="hd-panel-label">Ticket brief</div>
            <h2 className="hd-brief-subject">{brief.subject}</h2>
            {(who || ids) && <p className="hd-hint mb-2">{who}{who && ids ? ' · ' : ''}{ids}</p>}
            {brief.voice === 'user_brief' && (
                <p className="hd-hint mb-1">The user's situation (written to the simulated user):</p>
            )}
            <p className="hd-brief-body">{brief.body}</p>
            {brief.facts?.length > 0 && (
                <>
                    <div className="hd-grade-section-label mt-3">What the user would tell you if asked</div>
                    <ul className="hd-brief-facts">
                        {brief.facts.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </>
            )}
        </div>
    );
}

function fmtElapsed(sec) {
    if (sec == null) return null;
    const m = Math.floor(sec / 60), s = sec % 60;
    return m ? `${m}m ${s}s` : `${s}s`;
}

// Programmatic pass/fail: the same outcome the grader is told is authoritative, with no model involved.
function CheckReport({ check, data }) {
    const o = check.outcome ?? {};
    const elapsed = fmtElapsed(check.elapsed_seconds);
    const action = data.zammad_group && data.zammad_group !== 'Users'
        ? `Escalated to ${data.zammad_group}`
        : data.zammad_state === 'closed' ? 'Closed' : `Left ${data.zammad_state ?? 'open'}`;
    return (
        <div className="hd-grade-body">
            <div className={`hd-check-verdict ${check.passed ? 'hd-check-pass' : 'hd-check-fail'}`}>
                <span className="hd-check-word">{check.passed ? 'PASS' : 'FAIL'}</span>
                <span className="hd-check-detail">
                    {o.label}
                    <small className="hd-hint d-block">
                        {action} · credit {Math.round((o.score ?? 0) * 100)}% (pass at {Math.round(check.pass_score * 100)}%)
                        {elapsed && ` · ${elapsed}`}
                    </small>
                </span>
            </div>

            {check.items?.length > 0 && (
                <div>
                    <div className="hd-grade-section-label">Checks</div>
                    <ul className="hd-rubric-list">
                        {check.items.map((it, i) => (
                            <li key={i} className={`hd-rubric-item ${it.ok ? 'hd-rubric-pass' : 'hd-rubric-fail'}`}>
                                <span className="hd-rubric-criterion">{it.label}</span>
                                <span className="hd-rubric-pts">{it.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {check.debrief && (
                <details className="hd-debrief">
                    <summary className="hd-grade-section-label">What was actually wrong</summary>
                    <p className="hd-grade-feedback mt-2">{check.debrief}</p>
                </details>
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
