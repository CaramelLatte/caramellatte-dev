import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';

function Games() {
    const [games, setGames] = useState([]);
    const [playercount, setPlayercount] = useState(0);
    const [playerlist, setPlayerlist] = useState([]);

        useEffect(() => {
            function fetchGames() {
                    fetch('https://games.caramellatte.dev:8080/update')
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
            return "https://games.caramellatte.dev:8080/image/" + gameIcon;
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
        fetch(fetch('https://games.caramellatte.dev:8080/' + game.name + '/start'))
    }
    function stopServer(game) {
        fetch(fetch('https://games.caramellatte.dev:8080/' + game.name + '/stop'))
    }

    return (
        <div>
            <br />
            <div className='container'>
                <div className='content'>
                    This is a control panel for remotely controlling a number of dedicated game servers using docker containers. More features and additional games will be added in the future. Currently, use of this page is unrestricted. Verification will be added later.
                    <br /><br />
                    Using this page is simple. You may start or stop any of the servers by clicking the corresponding button (Only one server may be active at a time). The status of the servers will be updated in real time. Once the server you wish to use is online, you may connect to it in your game client using the provided IP address and port in the format "URL:PORT". 
                    <br /><br />
                    Note that some games may not require specifying a port, in which case base address will be sufficient. Some games may only allow ipv4 addresses as well, in which case you can find the base IP address by running the command "nslookup games.caramellatte.dev" in your terminal for windows, or "dig games.caramellatte.dev" for linux. This will return the IP address of the server, which you can use in the same "IP:PORT" method.
                    <br /><br />
                    If you have any issues or want to see specific games added to this page, you can either contact me directly or send an email to admin@caramellatte.dev.
                </div>
                {renderGameCards(games)}
            </div>

        </div>
    );
}

export default Games;
