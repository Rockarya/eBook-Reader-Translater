import React, { Component } from "react";
import {Container,Box,Typography,TextField,Button,Switch} from '@material-ui/core';
import {AccountCircle} from '@material-ui/icons'
import axios from 'axios';
import '../files/css/login.css'

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };

    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    // the get request checks that user is logged in or not?(if it gets the data then logged in, else not logged in)
    axios
      .get("http://localhost:4000/user/legit", { withCredentials: true })
      .then((res) => {
        console.log(res.data, "this is the response");
        if (!res.data) {
          // window.location = '/login';
        } else {
          // if already logged in then redirecting to dashboard
          window.location = "/";
          console.log(document.cookie + "this cookie");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(Date());
  }

  // this fxn updates with each letter written under password section
  onChangePassword(event) {
    this.setState({ password: event.target.value });
  }

  // this fxn updates with each letter written under email section
  onChangeEmail(event) {
    this.setState({ email: event.target.value });
  }

  // this fxn will be called when user clicks the submit btn on login page
  onSubmit(e) {
    e.preventDefault();
    const user = {
      email: this.state.email,
      password: this.state.password,
    };
    // posting the request for login to backend
    axios
      .post("http://localhost:4000/user/login", user, { withCredentials: true })
      .then((res) => {
        if (res.status == 200) {
          console.log(res.data);
          alert("Welcome " + res.data.name);
          // on succesfull login, directing to the dashboard
          window.location = "/";
        }
        // Not getting this response
        else
        {
            console.log(res);
            alert("Make sure that password and emailId are correct!")
        }
      })
      .catch((err) => {
        console.log(err);
        window.location = "/login";
        // alert("Couldn't log you in. Please try again");
      });
  }

  render() {
    return (
      <Container>
        <Box 
        bgcolor="white"
        boxShadow="10"
        borderColor="purple"
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
                  <h1>Sign In</h1>
                      {/* <Switch
                          name="switched"
                          color="primary"
                      />
                      <label id="cat">Request Admin Access</label> */}
                      
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
                          id="loginbutton"
                          onClick = {this.onSubmit}
                          >
                          Sign In
                      </Button>
                      <br/>
                      <br/>
                  </form> 
                  {/* <p id="nouser">Not registered yet? <a id="tandc" href="http://localhost:3000/register">Sign Up</a></p> */}
                  </Typography>
                </div>
              </div>
        </Box>
      </Container>
    );
  }
}
