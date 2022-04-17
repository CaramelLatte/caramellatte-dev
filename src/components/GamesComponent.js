import { Button, Card, CardImg, CardTitle, CardBody } from "reactstrap";
import React, { Component } from "react";
import axios from "axios";
//aaa

function Timer(func, time) {
  let intervalTimer = setInterval(func, time);
  this.stop = () => {
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }
    return this;
  };

  this.start = () => {
    if (!intervalTimer) {
      this.stop();
      intervalTimer = setInterval(func, time);
    }
    return this;
  };
  this.reset = (newTimer = intervalTimer) => {
    intervalTimer = newTimer;
    return this.stop().this.start();
  };
}

export default class Games extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mineServ: "offline",
      valServ: "offline",
      minePlayers: 0,
      valPlayers: 0,
      url: process.env.REACT_APP_GAME_SERVER_URL,
    };
    this.timer = new Timer(this.runCheck, 30000);
  }
  componentDidMount = () => {
    this.runCheck();
  };

  runCheck = () => {
    axios({
      method: "get",
      url: this.state.url + "update"
    })
      .then((data) => {
        console.log(data.data)
        this.mineServUpdate(data.data);
        this.valServUpdate(data.data)
      })
      .catch((err) => {
        console.log(err);
      });
  };

  startMinecraft = () => {
    this.timer.stop();
    axios({
      method: "get",
      url: this.state.url + "minecraft/start",
    })
      .then((data) => {
        this.mineServUpdate(data.data);
        console.log(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
    this.timer.start();
  };
  stopMinecraft = () => {
    this.timer.stop();
    axios({
      method: "get",
      url: this.state.url + "minecraft/stop",
    })
      .then((data) => {
        this.mineServUpdate(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
    this.runCheck();
    setTimeout(3000);
    this.timer.start();
  };

  mineServUpdate = (data) => {
    if (data.active_server === "minecraft") {
      this.setState({ mineServ: "online" });
    }
    else {
      this.setState({mineServ: "offline"})
    }
    if (data.player_count) {
      if (this.state.mineServ === "online") {
      this.setState({ minePlayers: data.player_count });
      }
      else {
        this.setState({ minePlayers: 0})
      }
    }
  };

  valServUpdate = (data) => {
    if (data.active_server === "valheim") {
      this.setState({ valServ: "online" });
    }
    else {
      this.setState({valServ: "offline"})
    }
    if (data.player_count) {
      if (this.state.valServ === "online") {
      this.setState({ valPlayers: data.player_count });
      }
      else {
      this.setState({ valPlayers: 0 });
      }
    }
  };
  startValheim = () => {
    this.timer.stop();
    axios({
      method: "get",
      url: this.state.url + "valheim/start",
    })
      .then((data) => {
        this.valServUpdate(data.data);
        console.log(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
    this.timer.start();
  };
  stopValheim = () => {
    this.timer.stop();
    axios({
      method: "get",
      url: this.state.url + "valheim/stop",
    })
      .then((data) => {
        this.valServUpdate(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
    this.runCheck();
    setTimeout(3000);
    this.timer.start();
  };

  mineIndicator = () => {
    if (this.state.mineServ === "online") {
      return (
        <div className="online-indicator">
          <span class="online-blink"></span>
        </div>
      );
    } else if (this.state.mineServ === "offline") {
      return <div className="offline-indicator"></div>;
    } else {
      return <div></div>;
    }
  };
  valIndicator = () => {
    if (this.state.valServ === "online") {
      return (
        <div className="online-indicator">
          <span class="online-blink"></span>
        </div>
      );
    } else if (this.state.valServ === "offline") {
      return <div className="offline-indicator"></div>;
    } else {
      return <div></div>;
    }
  };

  render() {
    return (
      <div className="container">
        <div className="content">
          Welcome. This is a control panel for game servers. Access to these servers is curently unrestricted. You may launch or close them at will, and anyone may play on an online server with the connection information listed. In the future you will be required to register and request admin permissions for some features.
          <br />
          <br />
          Consider this a functional demonstration rather than a completed project. More features and functionalty will come soon.
          <br />
          <br />
          Limitations: This project is running on a raspberry pi, so don't expect enterprise level performance.
          <br />
          <br />
          This page updates every couple minutes. Wait three minutes after starting or stopping a server to see it properly reflected here.
        </div>
        <br />
        <div className="row">
          <div className="col-sm-6 col-md-4 d-flex justify-content-center">
            <Card>
              <CardImg
                top
                className="gameIcon"
                src="minecraftimg.png"
                alt="Minecraft Picture"
              />
              <CardTitle
                tag="h5"
                className="text-center text-success border-bottom border-top">
                Minecraft (Java)
              </CardTitle>
              <CardBody>
                <div className="row justify-content-center">
                  Server is: {this.state.mineServ} {" "} {this.mineIndicator()}
                </div>
                <div className="row justify-content-center">
                  Players connected: {this.state.minePlayers}
                </div>
                <div className="container">
                  <div className="row justify-content-center">
                    <Button
                      className="gameButton btn btn-success text-center"
                      onClick={this.startMinecraft}>
                      Start server
                    </Button>
                  </div>
                  <div className="row justify-content-center">
                    <Button
                      className="gameButton btn btn-danger"
                      onClick={this.stopMinecraft}>
                      Stop Server
                    </Button>

                  </div>
                  <div className="serverPorts">Server address:<br/>
                    games.caramellatte.dev:25565
                  </div>
                </div>
              </CardBody>
            </Card>
            
            
          </div>
          <div className="col-sm-6 col-lg-4 d-flex justify-content-center">
            <Card>
              <CardImg
                top
                className="gameIcon"
                src="valheimimg.png"
                alt="Valheim Picture"
              />
              <CardTitle
                tag="h5"
                className="text-center text-success border-bottom border-top">
                Valheim
              </CardTitle>
              <CardBody>
                <div className="row justify-content-center">
                  Server is: {this.state.valServ}  {this.valIndicator()}
                </div>
                <div className="row justify-content-center">
                  Players connected: {this.state.valPlayers}
                </div>
                <div className="container">
                  <div className="row justify-content-center">
                    <Button
                      className="gameButton btn btn-success text-center"
                      onClick={this.startValheim}
                    >
                      Start server
                    </Button>
                  </div>
                  <div className="row justify-content-center">
                    <Button
                      className="gameButton btn btn-danger"
                      onClick={this.stopValheim}
                    >
                      Stop Server
                    </Button>
                    
                    
                  </div>
                  <div className="serverPorts">Server address:<br/>
                    games.caramellatte.dev:5656
                  </div>
                </div>
              </CardBody>
            </Card>
            
          </div>
        </div>
      </div>
    );
  }
}
