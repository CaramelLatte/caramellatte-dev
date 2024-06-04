import React from 'react';
import { Card, CardImg, CardBody, CardTitle, CardText } from 'reactstrap';

//placeholder, this will eventually be fetched via axios call
let games = [
    { game: 'Minecraft', logo: 'https://upload.wikimedia.org/wikipedia/en/3/32/Minecraft_logo.png', status: 'Offline', port: '25565' },
    { game: 'Valheim', logo: 'https://upload.wikimedia.org/wikipedia/en/3/32/Minecraft_logo.png', status: 'Offline', port: '2456' }
];

function renderGameCards(games) {
    return (
        <div className='game-cards col'>
            {games.map((game, index) => (
                <Card className='game-card col-2' key={index}>
                    <CardImg top src={game.logo} alt={game.game} className='game-logo' />
                    <CardBody>
                        <CardTitle className='game-title'>{game.game}</CardTitle>
                        <CardText className='game-status'>Status: {game.status}</CardText>
                        <CardText className='game-port'>Port: {game.port}</CardText>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}

function Games() {
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