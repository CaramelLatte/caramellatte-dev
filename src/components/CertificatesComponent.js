import React, { Component } from "react";
import Course1 from "../shared/course1.pdf";
import Course2 from "../shared/course2.pdf";
import Course3 from "../shared/course3.pdf";
import Course4 from "../shared/course4.pdf";
import Course5 from "../shared/course5.pdf";
import Grad from "../shared/grad.pdf";

export default class Certificates extends Component {
  render() {
    return (
      <div className="content container">
        <a href={Course1} rel="noreferrer" target="_blank">
          HTML, CSS, and Javascript Fundamentals
        </a>
        <br />
        <a href={Course2} rel="noreferrer" target="_blank">
          Bootstrap
        </a>{" "}
        <br />
        <a href={Course3} rel="noreferrer" target="_blank">
          React
        </a>
        <br />
        <a href={Course4} rel="noreferrer" target="_blank">
          React Native
        </a>{" "}
        <br />
        <a href={Course5}>NodeJS, Express, MongoDB</a>
        <br />
        <a href={Grad}>Nucamp Completion</a>
      </div>
    );
  }
}
