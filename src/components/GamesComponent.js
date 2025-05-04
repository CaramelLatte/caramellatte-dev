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
                    This is a control panel for remotely controlling a number of dedicated game servers using docker containers. More features and additional games will be added in the future. Currently, use of this page is unrestricted. Verification will be added later.
                    <br /><br />
                    Using this page is simple. You may start or stop any of the servers by clicking the corresponding button (Only one server may be active at a time). The status of the servers will be updated in real time. Once the server you wish to use is online, you may connect to it in your game client using the provided IP address and port in the format "URL:PORT". 
                    <br /><br />
                    Note that some games may not require specifying a port, in which case base address will be sufficient. Some games may only allow ipv4 addresses as well, in which case you can find the base IP address by running the command "nslookup games.caramellatte.dev" in your terminal for windows, or "dig games.caramellatte.dev" for linux. This will return the IP address of the server, which you can use in the same "IP:PORT" method.
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