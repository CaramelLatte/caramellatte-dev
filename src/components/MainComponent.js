import React, { Component } from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";
import Home from "./HomeComponent";
import Header from "./HeaderComponent";
// import Certificates from "./CertificatesComponent";
import About from "./AboutComponent";
import Games from "./GamesComponent";

import "../app.css";

class Main extends Component {
  render() {
    const HomePage = () => {
      return <Home />;
    };
    // const CertificatesPage = () => {
    //   return <Certificates />;
    // };
    const AboutPage = () => {
      return <About />;
    };
    const GamesPage = () => {
      return <Games />;
    };

    return (
      <div className="App">
        <Header></Header>
        <Switch>
          <Route exact path="/home" component={HomePage} />
          {/* <Route exact path="/certificates" component={CertificatesPage} /> */}
          <Route exact path="/about" component={AboutPage} />
          <Route exact path="/games" component={GamesPage} />
          <Redirect to="/home" />
        </Switch>
      </div>
    );
  }
}

export default withRouter(Main);
