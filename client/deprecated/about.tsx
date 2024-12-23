import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// import Navbar from "../components/navbar/navbar";
const About = () => {
    return (
        <div>
            {/* <Navbar></Navbar> */}
            <h1>
                This would be the example about page.
            </h1>
            <p>
                This is a simple example of a react page that is being served by our express server. This page is being served from the client side of our application.
            </p>
            <br />
            <p>
                React works based on components. This page is a component that is being rendered by the App component. The App component is the root component of our application.
            </p>
            <br />
            <p>
                I will create a doc for you guys later to explain how this works (it's really simple, very similar to how we did the exercises.)
            </p>
            <p>
                You can find the docs page by clicking the link below.
                <br />
                <Link to="/docs">Docs</Link>
            </p>
            <Link to="/">Go back to landing</Link>
            <Helmet>
                <title>About</title>
            </Helmet>
        </div>
    );
};

export default About;