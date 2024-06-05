import React, { useState, useEffect } from 'react';
import { Card, CardImg, CardBody, CardTitle, CardText, Button } from 'reactstrap';

function Games() {
    const [games, setGames] = useState([]);
    const [playercount, setPlayercount] = useState(0);

        useEffect(() => {
            fetch('https://games.caramellatte.dev:8080/update')
                .then(response => response.json())
                .then(data => {
                    setGames(data.games);
                    setPlayercount(data.player_count);
                })
                .catch(error => {
                    console.error('Error fetching games data:', error);
                });
        }, []);

    
    function renderGameCards(games) {
        return (
            <div className='game-card-container'>
                {games.map((game, index) => (
                    console.log(game),
                    <div className='col-xs-8'>
                        <Card className='game-card' key={index}>
                            <CardImg top src={game.logo} alt={game.name} className='game-logo' />
                            <CardTitle className='game-title border-top border-bottom text-success' tag="h5">{game.name}</CardTitle>
                            <CardBody>
                                <div className='game-status'>Server is: {game.status}{(game.status === true) ?
                                    <div className='online-indicator'><span className="online-blink"></span></div> : <div className='offline-indicator'></div>}
                                </div>
                                <div className='game-status'>Online players: {(game.status === true) ? playercount : 0}</div>
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
        console.log("Starting server for " + game.name);
    }
    function stopServer(game) {
        console.log("Stopping server for " + game.name);
    }

    return (
        <div>
            <div className='container'>
                <div className='content'>
                    This is a control panel allow for remotely controlling a number of dedicated game servers. Consider this a functional demonstration rather than a completed project. More features and additional games will be added in the future.
                    <br /><br />
                    Currently, use of this page is unrestricted. A login system will be added at a later date, to restrict access and allow for logging of user actions.
                    <br /><br />
                    Using this page is simple. You may start or stop any of the servers by clicking the corresponding button. The status of the server will be updated in real time. Once the server you wish to use is online, you may connect to it in your game client using the provided IP address and port in the format "IP:PORT". Note that some games may not require specifying a port at all, in which case the base IP will be sufficient.
                    <br /><br />
                    If you have any issues or want to see specific games added to this page, let me know.
                </div>
                <div className='row'>
                    {renderGameCards(games)}
                </div>
            </div>

        </div>
    );
}

export default Games;