import React from 'react';
import placeholder from '../../assets/images/placeholder.png';
import './Profile.scss';

const Profile: React.FC = () => {
    const userName = "מדריך ראשי";
    return (
        <div className="profile">
            <a href="#" className="profile--wrapper">
                <div className="profile-icon">
                    <span>{userName[0]}</span>
                </div>
                <span>{userName}</span>
            </a>
        </div>
    )
};

export default Profile;