import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"

import Home from './components/Home'
import NavigationBar from './components/NavigationBar';
import Register from './components/Register'
import Login from './components/Login'
import Logout from './components/Logout'
import Dashboard from './components/Dashboard'
import Viewpdf from './components/viewpdf'

// uncomment the register route below to register to the platform.(No need to do this thing from backend ;-))
function App() {
  return (
    <Router>
      <NavigationBar />
      <div className="App">
        {/* <Route path="/" exact component={Home}/> */}
        {/* <Route path="/register" component={Register}/> */}        
        <Route path="/login" component={Login}/>
        <Route path="/logout" component={Logout} />
        <Route path="/" exact component={Dashboard}/>
        <Route path="/viewBook" component={Viewpdf}/>
      </div>
    </Router>
  );
}

export default App;



/* USER CREDENTIALS
email id: aj@gmail.com        (This mail id doesn't exist in the real-world)
password: 1234
*/
