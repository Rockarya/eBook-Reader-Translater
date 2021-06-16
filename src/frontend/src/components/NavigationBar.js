// This code is for the navigation bar shown at the top on the website
import React, { Component, useState, useEffect } from "react";
import MenuBookTwoToneIcon from '@material-ui/icons/MenuBookTwoTone';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import axios from 'axios'
import { Nav, Navbar, Form, FormControl } from 'react-bootstrap';
import styled from 'styled-components';const Styles = styled.div`
  .navbar { background-color: #800080; }
  a, .navbar-nav, .navbar-light .nav-link {
    color: #9FFFCB;
    &:hover { color: white; }
  }
  .navbar-brand {
    font-size: 1.4em;
    color: #9FFFCB;
    &:hover { color: white; }
  }
  .form-center {
    position: absolute !important;
    left: 25%;
    right: 25%;
  }
`;

function NavigationBar() {
    const [isAdmin, setAdmin] = useState(false)

    // setting the state to true when the user is logged in.(Will be used to show the Sign In/Sign Out button in navigation bar accordingly)
    useEffect(() => {
      axios.get("http://localhost:4000/user/legit", {withCredentials: true})
      .then(res => {
        // console.log(res.data, "this is the response");
        if(!res.data){
            // window.location = '/login';
        }
        else{
          setAdmin(true)
        }
      })
      .catch(err => {
        console.log(err);
      });
    }, []);

return(
  <Styles>
    <Navbar expand="lg">
      <Navbar.Brand href="/"><MenuBookTwoToneIcon  fontSize='large'/> eBook Reader</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>

      {/* <Form className="form-center">
        <FormControl type="text" placeholder="Search" className="" />
      </Form> */}
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
        {
          isAdmin ?
          <Nav.Item><Nav.Link href="/logout">Sign Out <ExitToAppIcon/></Nav.Link>
          </Nav.Item>
        : <Nav.Item><Nav.Link href="/login">Sign In <VpnKeyIcon fontSize='small'/></Nav.Link></Nav.Item>
        }
          
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  </Styles>
)
}
export default NavigationBar