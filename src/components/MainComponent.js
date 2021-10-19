import React, { Component } from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";
import Home from "./HomeComponent";
import Header from "./HeaderComponent";

import "../App.css";

class Main extends Component {
  render() {
    const HomePage = () => {
      return <Home />;
    };
    return (
      <div className="App">
        <Header></Header>
        <Switch>
          <Route exact path="/home" component={HomePage} />
          <Redirect to="/home" />
        </Switch>
      </div>
    );
  }
}

export default withRouter(Main);
