import React, { Component } from "react";

class Home extends Component {
  render() {
    console.log("got here");

    return (
      <div className="content container">
        <div className="row">
          <div className="col text-wrap">
            NEEEEEEEEEEEERDS
            <br />
            <br />
            Site made with React and served through Python Flask.
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
