import React from 'react';
import {Link} from 'react-router-dom';

import axios from './service/axios'
import ProfilePic from './profile-pic';
import FriendStatus from './friend-status'

export default class ProfileBrowser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            profile: {}
        }

        this.renderDefault = this.renderDefault.bind(this)
        this.renderProfile = this.renderProfile.bind(this)
    }

    componentDidMount() {
        axios.get(`/api/getProfile/${this.props.match.params.id}`)
            .then(({data}) => {
                this.setState({profile: data[0]})
            })
            .catch(err => console.log('err user data', err))

    }

    renderProfile(profile) {
        return (
            <div>
                <div>
                    <h4>this is the fancy bio.. </h4>
                    {this.state.profile.bio} <br />
                </div>               
            </div>
        )
    }

    renderDefault() {
        return (
            <div>
                <div className="bio-area">
                <h4> no bio yet.. </h4>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="profile-area">
                <div className="profile-content">
                    <ProfilePic bigger="true" avatar={this.state.profile.url} />
                    <div className="profile-render">
                        <h2> <span className="title-font">  {this.state.profile.first} {this.state.profile.last} </span></h2>
                        {this.state.profile.bio ? this.renderProfile(this.state.profile) : this.renderDefault()}
                    </div>
                </div>
                <div className="profile-footer">
                    {this.props.user && this.props.user.id_user == this.props.match.params.id && <Link to='/'>would you like to edit your site?</Link>}    
                    <FriendStatus idFriend={this.props.match.params.id} />
                </div>
            </div>
        )
    }
}