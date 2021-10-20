import { Button, Card, CardImg, CardTitle, CardBody } from "reactstrap";
import React, { Component } from "react";
import { url } from "../shared/url";
export default class Games extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mineServ: "Offline",
      valServ: "Offline",
    };
  }
  // startMinecraft = () => {
  //   let get = {
  //     method: "GET",
  //   };
  //   fetch(url + "games/minecraft", get)
  //     .then((response) => {
  //       response.json();
  //     })
  //     .catch();
  // };
  // stopMinecraft = () => {
  //   let get = {
  //     method: "GET",
  //   };
  //   fetch(url + "games/minecraftstop", get)
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
          each game listed! (WIP, the backend for this is being rebuilt in
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
                <div className="row justify-content-center">
                  Server is: {this.state.mineServ}{" "}
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
