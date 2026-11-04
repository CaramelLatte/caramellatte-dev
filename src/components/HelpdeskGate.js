import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Helpdesk from './HelpdeskComponent';

// The simulator itself is served only on the tailnet (web container :8083 behind
// `tailscale serve --https=8446`). The public edge no longer proxies its API.
const TAILNET_ORIGIN = 'https://fwserver.taile2e958.ts.net:8446';
const WRITEUP = '/blog/helpdesk-simulator';
const PROBE_TIMEOUT_MS = 4000;

function HelpdeskGate() {
    const onTailnet = window.location.origin === TAILNET_ORIGIN;
    const [state, setState] = useState(onTailnet ? 'ok' : 'checking');  // checking | ok | offline

    useEffect(() => {
        if (onTailnet) return undefined;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
        fetch(`${TAILNET_ORIGIN}/tailnet-check`, { cache: 'no-store', signal: ctrl.signal })
            .then(r => {
                if (!r.ok) throw new Error(String(r.status));
                window.location.replace(`${TAILNET_ORIGIN}/helpdesk`);
            })
            .catch(() => setState('offline'))
            .finally(() => clearTimeout(timer));
        return () => { clearTimeout(timer); ctrl.abort(); };
    }, [onTailnet]);

    if (state === 'ok') return <Helpdesk />;

    return (
        <div className="container">
            <header className="page-header">
                <p className="eyebrow">IT Helpdesk Simulator</p>
                <h1 className="page-title">Personal use only</h1>
                {state === 'checking' ? (
                    <p className="page-lede">Checking for a private connection…</p>
                ) : (
                    <p className="page-lede">
                        The simulator runs on my home server and is only available on my private network.
                        You can still see how it works: the write-up walks through a full ticket, from the
                        first message to the grading report, with screenshots.
                    </p>
                )}
            </header>
            {state === 'offline' && (
                <Link to={WRITEUP} className="btn-ui btn-ui-primary">Read the write-up</Link>
            )}
        </div>
    );
}

export default HelpdeskGate;
