import React from 'react';
import { Card, CardImg, CardTitle } from "reactstrap";

function About() {
    return (
        <div className="container">
            <div className="content">
                Hi, I'm Jared. I consume coffee in irresponsible quantities and I like coding.
                    This is my personal site to showcase some of my personal projects. Feel free to look around.
                If you'd like to reach out and connect, the
                most convenient way is through my{" "}
                <a
                    href="https://www.linkedin.com/in/jared-ekenstam-777348208/"
                    target="_blank"
                    rel="noreferrer">
                    LinkedIn profile
                </a>
            </div>
            <br />
            <div className="content">
                Feel free to take a look at some things I've built. Icons lead to github pages.
            </div>
        </div>
    );
}

export default About;