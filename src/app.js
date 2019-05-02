import React from "react";
import axios from "./axios";
import { BrowserRouter, Route } from "react-router-dom";

import ProfilePic from "./profilepic";
import Uploader from "./uploader";
import Profile from "./profile.js";
import Bio from "./bio";
import OtherProfile from "./otherprofile.js";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        axios.get("/user").then(({ data }) => {
            this.setState(data[0]);
            console.log("Component has mounted");
        });
    }
    render() {
        if (!this.state.id) {
            return (
                <section id="modal">
                    <img id="spinner" src="/img/spinner.gif" />
                </section>
            );
        } else {
            return (
                <BrowserRouter>
                    <div id="app">
                        <ProfilePic
                            id={this.state.id}
                            first={this.state.first_name}
                            last={this.state.last_name}
                            image_url={this.state.image_url}
                            clickHandler={() =>
                                this.setState({
                                    showUploader: true
                                })
                            }
                        />
                        <div>
                            <Route
                                exact
                                path="/"
                                render={props => {
                                    return (
                                        <Profile
                                            first={this.state.first_name}
                                            last={this.state.last_name}
                                            profilePic={
                                                <ProfilePic
                                                    id={this.state.id}
                                                    first={
                                                        this.state.first_name
                                                    }
                                                    last={this.state.last_name}
                                                    image_url={
                                                        this.state.image_url
                                                    }
                                                    clickHandler={() =>
                                                        this.setState({
                                                            showUploader: true
                                                        })
                                                    }
                                                />
                                            }
                                            bioEditor={
                                                <Bio
                                                    bio={this.state.bio}
                                                    setBio={this.setBio}
                                                />
                                            }
                                        />
                                    );
                                }}
                            />
                            <Route
                                path="/user/:id"
                                render={props => (
                                    <OtherProfile
                                        key={props.match.url}
                                        match={props.match}
                                        history={props.history}
                                    />
                                )}
                            />
                        </div>

                        {this.state.showUploader && (
                            <Uploader
                                setImage={url =>
                                    this.setState({ image_url: url })
                                }
                                clickHandler={() =>
                                    this.setState({ showUploader: false })
                                }
                            />
                        )}
                    </div>
                </BrowserRouter>
            );
        }
    }
}
