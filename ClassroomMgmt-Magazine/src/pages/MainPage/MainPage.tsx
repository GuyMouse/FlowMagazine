import React from 'react';
import './MainPage.scss';

interface MainPageProps {
    children?: React.ReactNode;
}

const MainPage: React.FC<MainPageProps> = ({ children }) => {
    return (
        <div className="main-page">
            <div className="main-page--wrapper">
                {children}
            </div>
        </div>
    );
}

export default MainPage;