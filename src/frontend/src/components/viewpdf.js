// This code is actually responsible for taking the URL of the book from backend and show in the frontend using pdf-viewer
import React, { Component, useState, useEffect } from "react";
import axios from 'axios'
import { Dropdown, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {useLocation} from "react-router-dom";
// This phucong pdf-viewer i am using(Really it's not a good pdf viewer, but can't find any other pdf-viewer which can render books using URLs)
import Viewer, { Worker } from '@phuocng/react-pdf-viewer';
import '@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css';


export default function Viewpdf() {

  // When u click the 'view' btn on the ook then take a look at the URL above.It contains the book-name(actually book-id)...which we are using here to get the book-name
  const search = useLocation().search;
  const name = new URLSearchParams(search).get('book_name');
  console.log("this is the book name", name); 

    const [isAdmin, setAdmin] = useState(false);
    const [url, setUrl] = useState(' ');

    // Setting the the state value to true if the user is logged in
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

      // getting the URL from the backend of the desired book and setting that in state
      axios.get("http://localhost:4000/user/downloadpdf?filename=" + name).then(res => {
        console.log(res.data.url);
        setUrl(res.data.url);
      });
    }, []);

  return (
    <div>
      <div className="App">
        {/* DROP-DOWN for the language(will only be shown to admin). This can be used in the way that, after user chooses the language, the book should be converted to that language*/}

        {/* {
          isAdmin ?
        <div className="dropdown" align="left">
          <Dropdown>
          <Dropdown.Toggle 
          variant="secondary btn-sm" 
          id="dropdown-basicc">
              Language
          </Dropdown.Toggle>

          <Dropdown.Menu style={{backgroundColor:'#00FFFF'}}>
              <Dropdown.Item href="#" >Hindi</Dropdown.Item>
              <Dropdown.Item href="#">Telugu</Dropdown.Item>
              <Dropdown.Item href="#">English</Dropdown.Item>
          </Dropdown.Menu>
          </Dropdown>
        </div>
        : false
      } */}

          <div>
            {/* The implementation the pdf-viewer */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
            <div id="pdfviewer">
              <Viewer fileUrl={url} />
            </div>
          </Worker>
        </div>

        {/* The delete book btn at the bottom of the book */}

        {/* {
          isAdmin ?
        <div align="center">
          <button type="button" className="btn btn-danger">Delete this book?</button>
        </div>
        : false
        } */}
      </div>
    </div>
  );
}
