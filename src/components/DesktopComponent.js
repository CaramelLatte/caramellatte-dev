import React, { useState, useRef } from 'react';

// Served by the edge proxy only when framed by this site; KasmVNC asks for its own login.
const DESKTOP_URL = 'https://desktop.caramellatte.dev/';

function Desktop() {
    const [connected, setConnected] = useState(false);
    const frameRef = useRef(null);

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            frameRef.current?.requestFullscreen?.();
        }
    }

    return (
        <div className="container">
            <header className="page-header">
                <p className="eyebrow">Live project</p>
                <h1 className="page-title">Remote Desktop</h1>
                <p className="page-lede">
                    A Linux desktop running in a container on my home server, streamed to the browser with KasmVNC.
                    Sign in with the desktop credentials when prompted.
                </p>
            </header>

            <div className="desktop-toolbar">
                <button
                    type="button"
                    className={`btn-ui ${connected ? 'btn-ui-danger' : 'btn-ui-primary'}`}
                    onClick={() => setConnected(c => !c)}
                >
                    {connected ? 'Disconnect' : 'Connect'}
                </button>
                <button type="button" className="btn-ui" onClick={toggleFullscreen} disabled={!connected}>
                    Fullscreen
                </button>
            </div>

            <div className="desktop-frame" ref={frameRef}>
                {connected ? (
                    <iframe
                        src={DESKTOP_URL}
                        title="Remote desktop"
                        allow="clipboard-read; clipboard-write; fullscreen; autoplay"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                ) : (
                    <div className="desktop-placeholder">Press Connect to open the desktop.</div>
                )}
            </div>

            <div className="callout">
                <div className="callout-title">Tips</div>
                <p>
                    For sound, use the <strong>Audio</strong> button in the desktop's top-right corner. Click inside
                    the desktop to give it the keyboard.
                </p>
            </div>
        </div>
    );
}

export default Desktop;
