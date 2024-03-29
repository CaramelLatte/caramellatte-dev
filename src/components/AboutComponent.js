import React, { Component } from "react";
import { Card, CardImg, CardOverlay, CardTitle, Modal, ModalHeader, ModalBody } from "reactstrap";
import CardBody from "reactstrap/lib/CardBody";


export default class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGameOpen: false,
    };
    this.toggleModal = this.toggleModal.bind(this)
  }

  toggleModal() {
    this.setState({ isGameOpen: !this.state.isGameOpen });
  }


  render() {
    return (

      <div className="container">
        <Modal overflow isOpen={this.state.isGameOpen} size="large" toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>NotLN</ModalHeader>
          <ModalBody>
            <iframe frameborder="0" width="1024" height="900" src="https://replit.com/@VanillaAffogato/Night-of-the-Living-Nerds?embed=true"></iframe>
          </ModalBody>
        </Modal>
        <div className="content">
          Hi, I'm Jared. I consume coffee in irresponsible quantities and I like
          coding.
          <br />
          <br />
          I'm a graduate from{" "}<a href="https://nucamp.co" target="_blank"
            rel="noreferrer">Nucamp's</a> complete software engineering course.
          <br /> <br />
          This is my personal site, to display and integrate some of my own projects. If you're here and you don't know me, you've
          clearly made some poor decisions in life and I would recommend calmly
          backing away and forgetting anything and everything you see here.
          Unless you're either hiring or want to talk about nerdy code stuff. In
          which case, let's chat.
          <br /> <br />
          If you'd like to reach out and connect, the
          most convenient way is through my{" "}
          <a
            href="https://www.linkedin.com/in/jared-ekenstam-777348208/"
            target="_blank"
            rel="noreferrer">
            LinkedIn profile
          </a>
          .
        </div>
        <br />
        <div className="content">
          Feel free to take a look at some things I've built. Icons lead to github pages.
        </div>
        <br />
        <br />
        <div className="row">
          <div className="col xs={12} md={4}">
            <Card>
              <a href="https://github.com/CaramelLatte/game-server" target="_blank">
                <CardImg width="100%" src="logo192.png" />
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
          </div>
          <div className="col xs={12} md={4}">
            <Card>
              <a href="https://github.com/CaramelLatte/NotLN_game" target="_blank">
                <CardImg width="100%" src="logo192.png" />
              </a>
              <CardTitle className="text-center border-bottom border-top">Night of the Living Nerds</CardTitle>
              <CardBody>
                {/* Very simple twin-stick style game. Made with pygame. Click <a onClick={this.toggleModal} className="game-link">here</a> to play. */}
                Very simple twin-stick style game. Made with pygame. Click <a href="https://replit.com/@VanillaAffogato/Night-of-the-Living-Nerds" target="_blank">here</a> to play
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
