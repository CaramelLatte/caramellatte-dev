import React, { Component } from "react";
import { Card, CardImg, CardOverlay, CardTitle } from "reactstrap";
import CardBody from "reactstrap/lib/CardBody";

export default class About extends Component {
  render() {
    return (
      <div className="container">
        <div className="content">
          Hi, I'm Jared. I consume coffee in irresponsible quantities and I like
          coding.
          <br />
          <br />
          I'm currently studying full-stack development at{" "}
          <a href="https://nucamp.co">Nucamp</a>, a hybrid part-time coding
          bootcamp.
          <br /> <br />
          I'm building this site and using it to practice what I learn and
          display my progress. If you're here and you don't know me, you've
          clearly made some poor decisions in life and I would recommend calmly
          backing away and forgetting anything and everything you see here.
          Unless you're either hiring or wish to provide me with coffee. In
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
          This space is to display ongoing personal projects.
        </div>
        <br />
        <br />
        <div className="row">
          <div className="col-4">
            <Card>
              <CardImg width="100%" src="logo192.png" />
              <CardTitle className="text-center border-bottom border-top">
                Game Server Console
              </CardTitle>
              <CardBody>
                Flask Router that handles web requests to manage various game
                servers. A live demonstration of this is available in the Games
                section of this site. (WIP, rebuilding this!)
              </CardBody>
            </Card>
          </div>
          <div className="col-4">
            <Card>
              <CardImg width="100%" src="logo192.png" />
              <CardTitle>Project</CardTitle>
            </Card>
          </div>
          <div className="col-4">
            <Card>
              <CardImg width="100%" src="logo192.png" />
              <CardTitle>Project</CardTitle>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
