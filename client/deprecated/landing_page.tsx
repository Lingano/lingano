import React, { Component } from "react";
import { Link } from "react-router-dom";

interface LandingPageState {
    apiResponse: string;
}

class LandingPage extends Component<object, LandingPageState> {
    private interval: NodeJS.Timeout | undefined;

    constructor(props: object) {
        super(props);
        this.state = { apiResponse: "" };
    }

    callAPI() {
        fetch("http://localhost:9000/testAPI")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    }

    componentWillMount() {
        this.callAPI();
    }

    componentDidMount() {
        this.interval = setInterval(() => this.callAPI(), 1000);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    render() {
        return (
            <div>
                <div className="App">
                    <header className="App-header">
                        <h1 className="App-title">This project is going to be fun!</h1>
                    </header>
                    <p className="App-intro">{this.state.apiResponse}</p>
                    <Link to="/about">About</Link>
                    <br />
                    <Link to="/docs">Docs</Link>
                    <br />
                    <Link to="/">Go back</Link>
                </div>
            </div>
        );
    }
}

export default LandingPage;