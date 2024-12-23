import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
// import Reader from "../components/reader/reader";

const Docs = () => {
    return (
        <div>
            <h1>
                Change
            </h1>
            <h3>Issues</h3>
            <h3>How the app works</h3>
            <p>
                The basic structure of this app is explained in the repo readme file in the client folder.
            </p>
            <h3>API reference</h3>
            <p>
                this part should be updated with all the API endpoints that we create and their definitions.
                Currently used port for the API is 9000. Generally the API urls are like this: http://localhost:9000/XXXX
                If you want to see the API in action without having to open up the entire client app, you can just go to the localhost url in the browser and try it out there.
            </p>
            {/* <Reader></Reader> */}
            <Link to="/">Go back to landing</Link>
            <Helmet>
                <title>Docs</title>
            </Helmet>
        </div>
    );
};

export default Docs;