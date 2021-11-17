import { Button, Card, CardImg, CardTitle, CardBody } from "reactstrap";
import React, { Component } from "react";
import axios from "axios";

let url = "localhost:8080/";

export default class Games extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mineServ: "Offline",
      valServ: "Offline",
      minePlayers: 0,
      valPlayers: 0,
    };
  }
  componentDidMount = () => {
    axios({
      method: "get",
      url: "http://localhost:8080/check",
    })
      .then((data) => {
        this.mineServUpdate(data.data);
        console.log(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  mineServUpdate = (data) => {
    this.setState({ mineServ: data.online_status });
    this.setState({ minePlayers: data.player_count });
  };
  // startMinecraft = () => {
  //   let get = {
  //     method: "GET",
  //   };
  //   fetch(url, get)
  //     .then((response) => {
  //       response.json();
  //     })
  //     .catch();
  // };
  // stopMinecraft = () => {
  //   let get = {
  //     method: "GET",
  //   };
  //   fetch(url + "/close", get)
  //     .then((response) => {
  //       response.json();
  //     })
  //     .catch();
  // };
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

  render() {
    return (
      <div className="container">
        <div className="content">
          These game servers are hosted on a dedicated machine. Specific
          instructions to connect to the hosted game world will be included with
          each game listed! (test, the backend for this is being rebuilt in
          Flask)
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
                {/* <div className="row justify-content-center">
                  Server is: {this.state.mineServ}{" "}
                </div> */}
                <div className="row justify-content-center">
                  Server is: {this.state.mineServ} Players connected:{" "}
                  {this.state.minePlayers}
                  <div className="offline-indicator">
                    <span class="offline-blink"></span>
                  </div>
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
