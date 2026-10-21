import React, { useState, useEffect } from 'react';

const API = 'https://games.caramellatte.dev';

const BUSY = ['pulling', 'starting', 'stopping'];

// Older API builds only send `status` (running or not), so fall back to that.
function gameState(game) {
    return game.state || (game.status ? 'running' : 'stopped');
}

function statusLabel(game) {
    switch (gameState(game)) {
        case 'running':
            return 'Online';
        case 'pulling':
            return `${game.detail || 'Downloading Docker image'}${game.progress != null ? ` ${game.progress}%` : ''}`;
        case 'starting':
            return game.detail ? `${game.detail}…` : 'Starting…';
        case 'stopping':
            return 'Stopping…';
        case 'error':
            return game.detail || 'Error';
        default:
            return 'Offline';
    }
}

function Games() {
    const [games, setGames] = useState([]);
    const [playercount, setPlayercount] = useState(0);
    const [playerlist, setPlayerlist] = useState([]);
    const [loadState, setLoadState] = useState('loading');   // 'loading' | 'ok' | 'error'
    const [pending, setPending] = useState({});   // game name -> true while its start/stop request is in flight
    const [notices, setNotices] = useState({});   // game name -> message from a rejected request

    useEffect(() => {
        function fetchGames() {
            fetch(API + '/update')
                .then(response => response.json())
                .then(data => {
                    setGames(data.games);
                    setPlayercount(data.player_count);
                    setPlayerlist(data.players);
                    setLoadState('ok');
                })
                .catch(error => {
                    console.error('Error fetching games data:', error);
                    setLoadState(prev => (prev === 'ok' ? prev : 'error'));
                });
        }
        fetchGames();
        const intervalID = setInterval(fetchGames, 3000);
        return () => clearInterval(intervalID);
    }, []);

    function sendCommand(game, cmd) {
        setPending(p => ({ ...p, [game.name]: true }));
        setNotices(n => ({ ...n, [game.name]: null }));
        fetch(API + '/' + game.name + '/' + cmd)
            .then(response => response.json().then(data => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    setNotices(n => ({ ...n, [game.name]: data.error || `Couldn't ${cmd} the server.` }));
                } else if (data.state) {
                    // Show the new state now rather than waiting for the next poll.
                    setGames(gs => gs.map(g => (g.name === game.name ? { ...g, state: data.state, detail: '', progress: null } : g)));
                }
            })
            .catch(() => setNotices(n => ({ ...n, [game.name]: "Couldn't reach the server host." })))
            .finally(() => setPending(p => ({ ...p, [game.name]: false })));
    }

    const anotherActive = name => games.some(g => g.name !== name && (gameState(g) === 'running' || BUSY.includes(gameState(g))));

    return (
        <div className="container">
            <header className="page-header">
                <p className="eyebrow">Live project</p>
                <h1 className="page-title">Game Server Console</h1>
                <p className="page-lede">
                    A control panel for dedicated game servers, each running in its own Docker container. Start or
                    stop a server, watch its status update live, and connect on the listed port. Only one server runs
                    at a time. The first start of a game downloads its Docker image, which can take several minutes.
                </p>
            </header>

            <div className="callout">
                <div className="callout-title">How to connect</div>
                <p>
                    Once a server shows <strong>Online</strong>, point your game client at{' '}
                    <code>games.caramellatte.dev:PORT</code>. If the game needs a raw IPv4 address, resolve it with{' '}
                    <code>nslookup games.caramellatte.dev</code> (Windows) or{' '}
                    <code>dig games.caramellatte.dev</code> (Linux/macOS).
                </p>
                <p className="callout-foot">
                    Requests or issues? <a href="mailto:admin@caramellatte.dev">admin@caramellatte.dev</a>
                </p>
            </div>

            {loadState === 'loading' && <div className="empty-state">Connecting to the server host…</div>}
            {loadState === 'error' && (
                <div className="empty-state">
                    The game server host isn't responding right now. It's self-hosted, so it may be down for
                    maintenance. Try again later.
                </div>
            )}

            {loadState === 'ok' && (
                <div className="server-grid">
                    {games.map((game, index) => {
                        const state = gameState(game);
                        const online = state === 'running';
                        const busy = BUSY.includes(state) || pending[game.name];
                        const statusClass = online ? 'status-on' : BUSY.includes(state) ? 'status-busy' : state === 'error' ? 'status-error' : 'status-off';
                        return (
                            <article className={`server${online ? ' is-online' : ''}${BUSY.includes(state) ? ' is-busy' : ''}`} key={index}>
                                <div className="server-top">
                                    <img
                                        className="server-icon"
                                        src={`${API}/image/${game.name}`}
                                        alt=""
                                    />
                                    <div className="server-id">
                                        <h2 className="server-name">{game.name}</h2>
                                        <span className={`status ${statusClass}`} role="status">
                                            <span className="status-dot" />
                                            {statusLabel(game)}
                                        </span>
                                    </div>
                                </div>
                                <dl className="server-meta">
                                    <div>
                                        <dt>Port</dt>
                                        <dd className="mono">{game.port}</dd>
                                    </div>
                                    <div>
                                        <dt>Players</dt>
                                        <dd>{online ? playercount || 0 : '-'}</dd>
                                    </div>
                                </dl>
                                {state === 'pulling' && game.progress != null && (
                                    <div className="server-progress" role="progressbar" aria-label={`${game.name} download`}
                                        aria-valuemin={0} aria-valuemax={100} aria-valuenow={game.progress}>
                                        <div className="server-progress-bar" style={{ width: `${game.progress}%` }} />
                                    </div>
                                )}
                                {notices[game.name] && <p className="server-notice">{notices[game.name]}</p>}
                                {online && playerlist.length > 0 && (
                                    <p className="server-players">{playerlist.join(', ')}</p>
                                )}
                                <div className="server-actions">
                                    <button className="btn-ui btn-ui-sm" onClick={() => sendCommand(game, 'start')}
                                        disabled={online || busy || anotherActive(game.name)}>
                                        Start
                                    </button>
                                    <button className="btn-ui btn-ui-sm btn-ui-danger" onClick={() => sendCommand(game, 'stop')}
                                        disabled={!online || busy}>
                                        Stop
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Games;
