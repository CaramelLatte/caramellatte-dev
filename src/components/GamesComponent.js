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
            {games.map((game, index) => (
            <div className='col-xs-6 col-md-4 col-xl-3' key={index}>
            <Card className='game-card'>
                <img src={fetchGameIcons(game.name)} alt={game.name}></img>
                <CardTitle className='game-title border-top border-bottom text-success' tag="h5">{game.name}</CardTitle>
                <CardBody>
                <div className='game-status'>Server is: {game.status}{(game.status === true) ?
                <div className='online-indicator'><span className="online-blink"></span></div> : <div className='offline-indicator'></div>}
                </div>
                {game.status === true && (
                <div className='game-status'>
                Online players: {
                    playercount > 0 ? (
                    <div className="tooltip-container">
                        <span className="text-primary player-count">
                            {playercount}
                            <div className="tooltip-text">
                                {playerlist.join(', ')}
                            </div>
                        </span>
                    </div>
                    ) : '0'
                }
                </div>
                )}
                <div className="container">
                <div className='row justify-content-center'>
                <Button color="success" onClick={() => startServer(game)}>Start Server</Button>
                </div>
                <div className='row justify-content-center'>
                <Button color="danger" onClick={() => stopServer(game)}>Stop Server</Button>
                </div>
                </div>
                <CardText className='game-port'>Connect via: <br /> games.caramellatte.dev:{game.port}</CardText>
                </CardBody>
            </Card>
            </div>
            ))}
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
                    This is a control panel allow for remotely controlling a number of dedicated game servers using docker containers. Consider this a functional demonstration rather than a completed project. More features and additional games will be added in the future.
                    <br /><br />
                    Currently, use of this page is unrestricted. Verification will be added later.
                    <br /><br />
                    Using this page is simple. You may start or stop any of the servers by clicking the corresponding button. The status of the server will be updated in real time. Once the server you wish to use is online, you may connect to it in your game client using the provided IP address and port in the format "IP:PORT". Note that some games may not require specifying a port at all, in which case the base IP will be sufficient. Please note also that as the underlying servers are running from docker containers, you may need to wait several minutes before you can connect to them.
                    <br /><br />
                    The following features are either planned or have been implemented previously but are not yet available with this version of the project:

                    <ul>
                        <li>Show player count, player names</li>
                        <li>Automatic shut-down when idle</li>
                        <li>Options to specify configuration settings on container launch</li>
                    </ul>
                    
                    <br /><br />

                    If you have any issues or want to see specific games added to this page, you can either contact me directly or send an email to admin@caramellatte.dev.
                </div>
                <div className='row'>
                    {renderGameCards(games)}
                </div>
            </div>

        </div>
    );
}

export default Games;