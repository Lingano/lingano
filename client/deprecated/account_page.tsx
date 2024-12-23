// account page boilerplate
import React from "react";
import { Helmet } from "react-helmet-async";
// import Navbar from "../components/navbar/navbar";
// import "./account_page.css";
import { Link } from "react-router-dom";
// import SignIn from "../components/sign-in/sign-in";

const AccountPage = () => {
    return (
        <div>
            <Helmet>
                <title>Account</title>
            </Helmet>
            <h1>Account Login and Register Page</h1>
            <Link to="/">Go back to landing</Link>
            {/* <Navbar></Navbar>
            <h1>Account</h1>
            <SignIn></SignIn> */}
        </div>
    );
}

export default AccountPage;