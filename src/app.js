import React from "react";
import axios from "./axios";
// import { HashRouter, Route } from "react-router-dom";

import Header from "./header";
import ProfilePic from "./profilepic";
import Uploader from "./uploader";
import Profile from "./profile";
import BioEditor from "./bioeditor";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploaderVisible: false
        };
        this.toggleUploader = this.toggleUploader.bind(this);
        this.profilePicUrl = this.profilePicUrl.bind(this);
        this.changeBio = this.changeBio.bind(this);
    }
    componentDidMount() {
        axios.get("/user").then(({ data }) => {
            const firstName = data.first_name;
            const lastName = data.last_name;
            const picture = data.picture;
            const bio = data.bio;
            this.setState({ firstName, lastName, picture, bio });
        });
    }
    toggleUploader() {
        if (this.state.uploaderVisible) {
            this.setState({ uploaderVisible: false });
        } else {
            this.setState({ uploaderVisible: true });
        }
    }
    profilePicUrl(picture) {
        this.setState({ picture });
        this.setState({ uploaderVisible: false });
    }
    changeBio(bio) {
        this.setState({ bio });
    }
    render() {
        return (
            <div className="app">
                <Header
                    ProfilePic={
                        <ProfilePic
                            firstName={this.state.firstName}
                            lastName={this.state.lastName}
                            picture={this.state.picture}
                            toggleUploader={this.toggleUploader}
                        />
                    }
                />

                {this.state.uploaderVisible && (
                    <Uploader
                        toggleUploader={this.toggleUploader}
                        profilePicUrl={this.profilePicUrl}
                    />
                )}

                <Profile
                    firstName={this.state.firstName}
                    lastName={this.state.lastName}
                    ProfilePic={
                        <ProfilePic
                            firstName={this.state.firstName}
                            lastName={this.state.lastName}
                            picture={this.state.picture}
                            toggleUploader={this.toggleUploader}
                        />
                    }
                    BioEditor={
                        <BioEditor
                            bio={this.state.bio}
                            changeBio={this.changeBio}
                        />
                    }
                />
            </div>
        );
    }
}
