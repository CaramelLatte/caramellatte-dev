import React, { Component } from "react";

class Home extends Component {
  render() {
    console.log("got here");

    return (
      <div className="content container">
        <div className="row">
          <div className="col text-wrap">
            You're all a bunch of nerds.
            <br />
            <br />
            Forgive the mess, while this site is rebuilt!
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
