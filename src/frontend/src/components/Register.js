// THIS CODE REGISTERS THE USER ON THE PLATFORM(NO MORE USED)
import React, { Component } from "react";
import {Container,Box,Typography,TextField,Button,Switch} from '@material-ui/core';
import {AccountCircle} from '@material-ui/icons'
import axios from 'axios';
import '../files/css/signup.css'

export default class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      password: ""
    };

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    axios
      .get("http://localhost:4000/user/legit", { withCredentials: true })
      .then((res) => {
        console.log(res.data, "this is the response");
        if (!res.data) {
          // window.location = '/register';
        } else {
          window.location = "/";
          console.log(document.cookie + "this cookie");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(Date());
  }

   
  onChangeName(event) {
    this.setState({ name: event.target.value });
  }

    
  onChangeEmail(event) {
    this.setState({ email: event.target.value });
  }

  onChangePassword(event) {
    this.setState({ password: event.target.value });
  }


  onSubmit(e) {
    e.preventDefault();
    const user = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
    };
    axios
      .post("http://localhost:4000/user/register", user, { withCredentials: true })
      .then((res) => {
        if(res.status == 200)
        {
            alert("created " + res.data.name);
            window.location = '/login';
        }
        if(res.status === 204)
        {
            alert("Email already exists!");
        }
      })
      .catch((err) => {
        console.log(err);
        window.location = "/register";
        // alert("User not registered!\n Try Again");
      });
  }

  render() {
    return (
        <Container>
        <Box 
        bgcolor="white"
        boxShadow="10"
        borderColor="black"
        borderRadius="15px"
        textAlign="center"
        p='30px'
        mt='50px'
        >
        <div>
          <AccountCircle id="loginicon" />
          <div id="logincontainer">
              <Typography component="div" id="logintypo" >
              <form onSubmit={this.onSubmit}>
                  <br/>
                  <br/>
                  <h1>Sign Up</h1>
                      <Switch
                          name="switched"
                          color="primary"
                      />
                      <label id="cat">Request Admin Access</label>

                      <TextField
                      variant="standard"
                      margin="normal"
                      required
                      fullWidth
                      name="name"
                      label="Name"
                      type="text"
                      id="name"
                      onChange = {this.onChangeName}
                      />
                      
                      <TextField
                      variant="standard"
                      margin="normal"
                      required
                      fullWidth
                      name="email"
                      label="Email"
                      type="text"
                      id="email"
                      onChange = {this.onChangeEmail}
                      />

                      <TextField
                          variant="standard"
                          margin="normal"
                          required
                          fullWidth
                          name="password"
                          label="Password"
                          type="password"
                          id="password"
                          onChange = {this.onChangePassword}
                      />
                      <br/>
                      <br/>
                      <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          id="signupbutton"
                          onClick = {this.onSubmit}
                          >
                          Sign Up
                      </Button>
                      <br/>
                      <br/>
                  </form> 
                  <p id="nouser">Already registered? <a id="tandc" href="http://localhost:3000/login">Sign In</a></p>
                  </Typography>
                </div>
            </div>
          </Box>
      </Container>
    );
  }
}