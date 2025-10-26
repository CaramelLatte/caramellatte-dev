import React from 'react';
import { Card, CardImg, CardTitle, CardBody } from "reactstrap";

function About() {
    return (
        <div className="container">
            <br />
            <div className="content">
                Hi, I'm Jared. I consume coffee in irresponsible quantities and I like coding.
                This is my personal site to showcase some of my projects. Feel free to look around.
                If you'd like to reach out and connect, the
                most convenient way is through my{" "}
                <a
                    href="https://www.linkedin.com/in/jared-ekenstam-777348208/"
                    target="_blank"
                    rel="noreferrer">
                    LinkedIn profile
                </a>
            </div>
            <br />
            <div className="content">
                Feel free to take a look at some things I've built. Icons lead to github pages.
            </div>
            <br />
            <div className="card-grid mt-3">
                <Card className='project-card'>
                    <a href="https://github.com/CaramelLatte/game-server" target="_blank" rel="noreferrer">
                        <CardImg width="10%" src="python-logo.png" />
                    </a>
                    <CardTitle className="text-center border-bottom border-top">
                        Game Server Console
                    </CardTitle>
                    <CardBody>
                        Flask Router that handles web requests to manage various game
                        servers. A live demonstration of this is available in the Games
                        section of this site.
                    </CardBody>
                </Card>
                <Card className='project-card'>
                    <a href="https://github.com/CaramelLatte/NotLN_game" target="_blank" rel="noreferrer">
                        <CardImg width="10%" src="pygame-logo.png" />
                    </a>
                    <CardTitle className="text-center border-bottom border-top">Night of the Living Nerds</CardTitle>
                    <CardBody>
                        Very simple twin-stick style game. Made with pygame. Click{' '}
                        <a href="https://replit.com/@VanillaAffogato/Night-of-the-Living-Nerds" target="_blank" rel="noreferrer">here</a> to play (Free replit account needed)
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

export default About;
