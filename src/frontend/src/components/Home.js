// THIS FIEL IS NOT USED ANYMORE IN THE CODE
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useHistory} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import download from 'downloadjs';


export default function Home() {
    const [dp, setdp] = React.useState(null);
    let history = useHistory();

    function goToLogin() {
        history.push('/login');
    }

    function goToRegister() {
        history.push('/register');
    }

    function upload(e) {
        setdp(e.target.files[0]);
        console.log(e.target.files[0]);
        const formData = new FormData();        
        formData.append('file', e.target.files[0]);
        const details = {
            title: e.target.files[0].filename,
            description: "none"
        }
        axios.post('http://ec2-52-66-236-60.ap-south-1.compute.amazonaws.com/user/upload/', formData)
            .then(res => {
                console.log("ok")
                console.log(res.data)
                alert(res.data.msg)
                // window.location.reload()
            })
            .catch(err=>{
                console.log(err)
                alert("error")
            })
    }

    function Download() {
        const filename = "file-1615036673256.pdf"
        axios.get("http://ec2-52-66-236-60.ap-south-1.compute.amazonaws.com/user/downloadpdf/"+filename, {
            responseType: 'blob',     
        }).then(res => {
            alert(res.data.msg);
            // res.data has pdf file which is in application/pdf format.
            return download(res.data, res.data.originalname, 'application/pdf');
        }).catch(err => {
            alert("there was a problem");
            console.log(err);
        }); 
    }

    useEffect(() => {
        axios.get("http://ec2-52-66-236-60.ap-south-1.compute.amazonaws.com/user/legit", {withCredentials: true})
            .then(res => {
                if(!res.data){
                    // window.location = '/login';
                }
                else{
                    window.location = '/dashboard';
                }
            })
            .catch(err => {
                console.log(err);
            });
    });

    return(
        <div>
            <div>
                <h3 align='center'>
                    Welcome. We are at your serivce.
                </h3>
            </div>
            <div>
                <Box textAlign='center' margin={2}>
                    <Button variant="contained" onClick={goToLogin} color="primary">
                        Login
                    </Button>
                </Box>
                <Box textAlign='center' margin={2}>
                    <Button variant="contained" onClick={goToRegister} color="primary">
                        Register
                    </Button>
                </Box>
            </div>
            {/* <div>
                <Box>
                    <input onChange={upload} id="icon-button-file" type="file" enctype="multipart/form-data"/>
                    <Button variant="contained" onClick={Download} color="primary">
                        Download
                    </Button>
                </Box>
            </div> */}
        </div>
    );
}