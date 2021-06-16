import axios from 'axios';
import React, {useEffect} from 'react';

function Logout() {
    useEffect(() => {
        // axios.get("http://localhost:4000/user/legit", {withCredentials: true})
        //     .then(res => {
        //         // console.log(res.data, "this is the response");
        //         if(!res.data){
        //             window.location = '/login';
        //         }
        //     })
        //     .catch(err => {
        //         console.log(err);
        //     });

        // this fxn let's the user log-out of the platform, when he clicks the sign-out on the navigation bar
        axios.get('http://localhost:4000/user/logout', {withCredentials: true})
            .then(res => {
                alert("Logged out successfully");
                // redirecting to the dashboard
                window.location = '/';
                // console.log(res, "is the response");
            })
            .catch(err => {
                console.log(err);
                alert("Couldn't logout. Please try again or after some time.");
            });
    });
    return(
        <div>
             <h1 style={{ color: 'white' }}>Thanks for visiting Us!</h1>
        </div>
    );

}

export default Logout