import React from "react";
import axios from "./axios";

import Profile from "./profile";
import ProfilePic from "./profilepic";
import FriendRequester from "./friendrequest";

import { Redirect } from "react-router-dom";

import style from "./styling.js";

export default class OtherProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { ownid: false };
    }
    componentDidMount() {
        const id = this.props.match.params.id;
        this.friendRequests();
        axios
            .get("/static/user/" + id, { headers: { getme: "userprofile" } })
            .then(({ data }) => {
                this.setState(data);
                if (this.state.first === undefined) {
                    this.setState({ ownid: true });
                }
            });
    }
    friendRequests(action) {
        if (!action) {
            axios.get("/static/friendrequests/", {
                headers: { getme: "userprofile" }
            });
        }
    }
    render() {
        if (!this.state.ownid) {
            return (
                <div style={style.data.profile}>
                    <Profile
                        first={this.state.first}
                        last={this.state.last}
                        profilePic={
                            <div>
                                <ProfilePic
                                    id={this.state.id}
                                    avatar={this.state.avatar}
                                    first={this.state.first}
                                    last={this.state.last}
                                    avatarscale={"150px"}
                                />
                                <FriendRequester
                                    id={this.state.friends}
                                    clickHandler={() =>
                                        this.friendRequests("action")
                                    }
                                />
                            </div>
                        }
                        bioEditor={
                            <div style={style.data.biotxt}>
                                <p>
                                    {this.state.first} {this.state.last}
                                </p>
                                <p>{this.state.bio}</p>
                            </div>
                        }
                    />
                </div>
            );
        } else {
            return <Redirect to="/" />;
        }
    }
}
