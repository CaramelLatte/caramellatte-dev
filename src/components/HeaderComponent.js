import React, { Component } from "react";
import {
  Nav,
  NavbarToggler,
  Collapse,
  NavItem,
  Navbar,
  NavbarBrand,
  Jumbotron,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { NavLink } from "react-router-dom";
// import LoginComponent from "./loginModalComponent";
import axios from "axios";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isNavOpen: false,
      isLoginOpen: false,
      isRegisterOpen: false,
      username: "",
      password: "",
      isLogged: false,
      accounts: [],
    };
    this.toggleNav = this.toggleNav.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleRegister = this.toggleRegister.bind(this);
  }
  login(data) {
    this.setState({ username: data });
    this.setState({ isLogged: true });
  }

  toggleNav() {
    this.setState({ isNavOpen: !this.state.isNavOpen });
  }
  toggleModal() {
    this.setState({ isLoginOpen: !this.state.isLoginOpen });
  }
  toggleRegister() {
    this.setState({ isLoginOpen: false });
    this.setState({ isRegisterOpen: !this.state.isRegisterOpen });
  }
  handleSubmit = (e) => {
    this.toggleModal();
    e.preventDefault();

    let data = new FormData(e.target);
    let userLogin = {
      username: data.get("username"),
      password: data.get("password"),
    };
    axios
      .post("/accounts/login", {
        username: userLogin.username,
        password: userLogin.password,
      })
      .then((data) => {
        this.login(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleRegister = (e) => {
    this.toggleRegister();
    e.preventDefault();
    let data = new FormData(e.target);
    let newUser = {
      username: data.get("username"),
      password: data.get("password"),
    };
    let postOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUser.username,
        password: newUser.password,
      }),
    };
    fetch("/accounts/register", postOptions).then((response) => {
      console.log(response);
    });
  };

  render() {
    if (this.state.isLogged === false) {
      return (
        <div className="header-container">
          <Jumbotron fluid>
            <div className="container">
              <div className="row">
                <div className="col">
                  <h1>Will work for coffee</h1>
                </div>
              </div>
            </div>
          </Jumbotron>
          <Navbar dark sticky="top" expand="md">
            <NavbarBrand></NavbarBrand>
            <NavbarToggler onClick={this.toggleNav} />
            <Collapse isOpen={this.state.isNavOpen} navbar>
              <Nav className="col" navbar>
                <NavItem>
                  <NavLink className="nav-link test" to="/home">
                    Home
                  </NavLink>
                </NavItem>
                {/* <NavItem>
                  <NavLink className="nav-link" to="/certificates">
                    Certificates
                  </NavLink>
                </NavItem> */}
                <NavItem>
                  <NavLink className="nav-link" to="/games">
                    Games
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/about">
                    About Me
                  </NavLink>
                </NavItem>
              </Nav>
              <Button className="button-right" onClick={this.toggleModal}>Login</Button>
            </Collapse>
          </Navbar>

          <Modal isOpen={this.state.isLoginOpen} toggle={this.toggleModal}>
            <ModalHeader toggle={this.toggleModal}>Login</ModalHeader>
            <ModalBody>
              <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    innerRef={(input) => (this.username = input)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    handleRef={(input) => (this.password = input)}
                  />
                </FormGroup>
                <FormGroup check>
                  <Label check htmlFor="remember">
                    <Input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      handleRef={(input) => (this.remember = input)}
                    />
                    Remember Me
                  </Label>
                </FormGroup>
                <FormGroup>
                  <Button value="submit" type="submit">
                    Login
                  </Button>
                </FormGroup>
                <FormGroup>
                  <Button onClick={this.toggleRegister}>Register</Button>
                </FormGroup>
              </Form>
            </ModalBody>
          </Modal>

          <Modal
            isOpen={this.state.isRegisterOpen}
            toggle={this.toggleRegister}>
            <ModalHeader toggle={this.toggleRegister}>Register</ModalHeader>
            <ModalBody>
              <Form onSubmit={this.handleRegister}>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    innerRef={(input) => (this.username = input)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    handleRef={(input) => (this.password = input)}
                  />
                </FormGroup>
                <FormGroup check>
                  <Label check htmlFor="remember">
                    <Input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      handleRef={(input) => (this.remember = input)}
                    />
                    Remember Me
                  </Label>
                </FormGroup>
                <FormGroup></FormGroup>
                <FormGroup>
                  <Button type="submit" value="submit">
                    Register
                  </Button>
                </FormGroup>
              </Form>
            </ModalBody>
          </Modal>
        </div>
      );
    } else {
      //IS LOGGED STARTS HERE
      return (
        <div className="header-container">
          <Jumbotron fluid>
            <div className="container">
              <div className="row">
                <div className="col">
                  <h1>Oh god what do you title a page like this?</h1>
                </div>
              </div>
            </div>
          </Jumbotron>
          <Navbar dark sticky="top" expand="md">
            <NavbarBrand></NavbarBrand>
            <NavbarToggler onClick={this.toggleNav} />
            <Collapse isOpen={this.state.isNavOpen} navbar>
              <Nav className="col" navbar>
                <NavItem>
                  <NavLink className="nav-link" to="/home">
                    Home
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/certificates">
                    Certificates
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/projects">
                    Projects
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/about">
                    About Me
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/contact">
                    Contact Me
                  </NavLink>
                </NavItem>
              </Nav>
              Welcome {this.state.username}
              <Button onClick={this.logout}>Log Out</Button>
            </Collapse>
          </Navbar>

          <Modal isOpen={this.state.isLoginOpen} toggle={this.toggleModal}>
            <ModalHeader toggle={this.toggleModal}>Login</ModalHeader>
            <ModalBody>
              <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    innerRef={(input) => (this.username = input)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    handleRef={(input) => (this.password = input)}
                  />
                </FormGroup>
                <FormGroup check>
                  <Label check htmlFor="remember">
                    <Input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      handleRef={(input) => (this.remember = input)}
                    />
                    Remember Me
                  </Label>
                </FormGroup>
                <FormGroup>
                  <Button value="submit" type="submit">
                    Login
                  </Button>
                </FormGroup>
                <FormGroup>
                  <Button onClick={this.toggleRegister}>Register</Button>
                </FormGroup>
              </Form>
            </ModalBody>
          </Modal>

          <Modal
            isOpen={this.state.isRegisterOpen}
            toggle={this.toggleRegister}>
            <ModalHeader toggle={this.toggleRegister}>Register</ModalHeader>
            <ModalBody>
              <Form onSubmit={this.handleRegister}>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    innerRef={(input) => (this.username = input)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    handleRef={(input) => (this.password = input)}
                  />
                </FormGroup>
                <FormGroup check>
                  <Label check htmlFor="remember">
                    <Input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      handleRef={(input) => (this.remember = input)}
                    />
                    Remember Me
                  </Label>
                </FormGroup>
                <FormGroup></FormGroup>
                <FormGroup>
                  <Button type="submit" value="submit">
                    Register
                  </Button>
                </FormGroup>
              </Form>
            </ModalBody>
          </Modal>
        </div>
      );
    }
  }
}

export default Header;
