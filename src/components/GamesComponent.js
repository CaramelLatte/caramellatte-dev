import React, { useState, useEffect } from 'react';

const API = 'https://games.caramellatte.dev:5002';

function Games() {
    const [games, setGames] = useState([]);
    const [playercount, setPlayercount] = useState(0);
    const [playerlist, setPlayerlist] = useState([]);
    const [loadState, setLoadState] = useState('loading');   // 'loading' | 'ok' | 'error'

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

    function startServer(game) {
        fetch(API + '/' + game.name + '/start');
    }
    function stopServer(game) {
        fetch(API + '/' + game.name + '/stop');
    }

    return (
        <div className="container">
            <header className="page-header">
                <p className="eyebrow">Live project</p>
                <h1 className="page-title">Game Server Console</h1>
                <p className="page-lede">
                    A control panel for dedicated game servers, each running in its own Docker container. Start or
                    stop a server, watch its status update live, and connect on the listed port. Only one server runs
                    at a time.
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
                        const online = game.status === true;
                        return (
                            <article className={`server${online ? ' is-online' : ''}`} key={index}>
                                <div className="server-top">
                                    <img
                                        className="server-icon"
                                        src={`${API}/image/${game.name}`}
                                        alt=""
                                    />
                                    <div className="server-id">
                                        <h2 className="server-name">{game.name}</h2>
                                        <span className={`status ${online ? 'status-on' : 'status-off'}`}>
                                            <span className="status-dot" />
                                            {online ? 'Online' : 'Offline'}
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
                                {online && playerlist.length > 0 && (
                                    <p className="server-players">{playerlist.join(', ')}</p>
                                )}
                                <div className="server-actions">
                                    <button className="btn-ui btn-ui-sm" onClick={() => startServer(game)} disabled={online}>
                                        Start
                                    </button>
                                    <button className="btn-ui btn-ui-sm btn-ui-danger" onClick={() => stopServer(game)}>
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
