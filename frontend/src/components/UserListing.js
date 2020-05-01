import React from 'react'
import { Image } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const UserListing = ({ user }) => {
    let profileImage = <></>
    if (user.imageUrl) {
        profileImage = <><Image style={{ height: '10%', width: '10%' }} src={user.imageUrl} fluid></Image></>
    }
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '10px'
    }
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return (
        <div style={styleBox}>
            <div>
                {profileImage} <Link to={`/users/${user.username}`}>{user.username}</Link>{user.admin ? <span>(admin)</span> : <></>} Joined: {new Date(user.joinDate).toLocaleDateString([], options)}
            </div>
        </div>
    )
}

export default UserListing