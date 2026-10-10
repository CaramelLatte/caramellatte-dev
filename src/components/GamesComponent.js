import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';

function Games() {
    const [games, setGames] = useState([]);
    const [playercount, setPlayercount] = useState(0);
    const [playerlist, setPlayerlist] = useState([]);

        useEffect(() => {
            function fetchGames() {
                    fetch('https://games.caramellatte.dev:5002/update')
                    .then(response => response.json())
                    .then (data => {
                        setGames(data.games);
                        setPlayercount(data.player_count);
                        setPlayerlist(data.players);
                    })
                    .catch(error => {
                        console.error('Error fetching games data:', error);
                    });
            }
            fetchGames();
            const intervalID = setInterval(fetchGames, 3000);
            return () => clearInterval(intervalID);
        }, []);

        function fetchGameIcons(gameIcon) {
            return "https://games.caramellatte.dev:5002/image/" + gameIcon;
        }

    function renderGameCards(games) {
        return (
            <div className='game-card-container'>
            {games.map((game, index) => {
                const online = game.status === true;
                const statusLabel = online ? 'Online' : 'Offline';
                const playerCountDisplay = playercount > 0 ? playercount : '0';
                return (
                    <Card className='game-card' key={index}>
                        <div className="game-card-media">
                            <img src={fetchGameIcons(game.name)} alt={game.name} />
                            <span className={`status-pill ${online ? 'status-online' : 'status-offline'}`}>
                                {statusLabel}
                            </span>
                        </div>
                        <CardBody>
                            <div className="game-card-header">
                                <CardTitle tag="h5" className="game-title text-success">{game.name}</CardTitle>
                                <div className="game-meta">
                                    <div className="meta-block">
                                        <span className="meta-label">Players</span>
                                        {online ? (
                                            <div className="tooltip-container">
                                                <span className="player-count">
                                                    {playerCountDisplay}
                                                    <div className="tooltip-text">
                                                        {playerlist.join(', ') || 'No active players'}
                                                    </div>
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="player-count muted">Offline</span>
                                        )}
                                    </div>
                                    <div className="meta-block">
                                        <span className="meta-label">Port</span>
                                        <span className="meta-value">{game.port}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="game-card-actions">
                                <Button color="success" size="sm" onClick={() => startServer(game)}>
                                    Start
                                </Button>
                                <Button color="danger" size="sm" onClick={() => stopServer(game)}>
                                    Stop
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                );
            })}
            </div>
        );
    }

    function startServer(game) {
        fetch(fetch('https://games.caramellatte.dev:5002/' + game.name + '/start'))
    }
    function stopServer(game) {
        fetch(fetch('https://games.caramellatte.dev:5002/' + game.name + '/stop'))
    }

    return (
        <div className="container">
            <div className="content" style={{ marginBottom: '1.5rem' }}>
                <p>
                    Remote control panel for dedicated game servers - each running in its own Docker container.
                    Start or stop any server, monitor live status, and connect via the listed port.
                    Only one server runs at a time.
                </p>
                <p>
                    To connect: once a server shows <strong>Online</strong>, use{' '}
                    <code>games.caramellatte.dev:PORT</code> in your game client. If the game requires a
                    raw IPv4 address, run <code>nslookup games.caramellatte.dev</code> (Windows) or{' '}
                    <code>dig games.caramellatte.dev</code> (Linux/Mac) to resolve it.
                </p>
                <p style={{ marginBottom: 0 }}>
                    Game requests or issues?{' '}
                    <a href="mailto:admin@caramellatte.dev">admin@caramellatte.dev</a>
                </p>
            </div>
            {renderGameCards(games)}
        </div>
    );
}

export default Games;
