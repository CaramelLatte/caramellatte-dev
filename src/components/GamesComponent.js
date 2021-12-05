import { Button, Card, CardImg, CardTitle, CardBody } from "reactstrap";
import React, { Component } from "react";
import axios from "axios";


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
      url: this.state.url + "minecraft",
    })
      .then((data) => {
        this.mineServUpdate(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  mineServUpdate = (data) => {
    this.setState({ mineServ: data.online_status });
    if (data.player_count) {
      this.setState({ mineServ: data.online_status });
      this.setState({ minePlayers: data.player_count });
    }
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
  // startValheim = () => {
  //   let get = {
  //     method: "GET",
  //   };
  //   fetch(url + "games/valheim", get)
  //     .then((response) => {
  //       response.json();
  //     })
  //     .catch();
  // };
  // stopValheim = () => {
  //   let get = {
  //     method: "GET",
  //   };
  //   fetch(url + "games/valheim", get).then((response) => {
  //     response.json();
  //   });
  // };

  indicatorLight = () => {
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

  render() {
    return (
      <div className="container">
        <div className="content">
          These game servers are hosted on a dedicated machine. Specific
          instructions to connect to the hosted game world will be included with
          each game listed! (the backend for this is being rebuilt in Flask)
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
                Minecraft
              </CardTitle>
              <CardBody>
                <div className="row justify-content-center">
                  Server is: {this.state.mineServ} {this.indicatorLight()}
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
                Valheim (Not available yet)
              </CardTitle>
              <CardBody>
                <div className="row justify-content-center">
                  Server is: {this.state.valServ}
                </div>
                <div className="container">
                  <div className="row justify-content-center">
                    <Button
                      className="gameButton btn btn-success text-center"
                      //onClick={this.startMinecraft}
                    >
                      Start server
                    </Button>
                  </div>
                  <div className="row justify-content-center">
                    <Button
                      className="gameButton btn btn-danger"
                      //onClick={this.stopMinecraft}
                    >
                      Stop Server
                    </Button>
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
