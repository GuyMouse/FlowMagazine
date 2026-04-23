import React from "react";
import "./NavBar.scss";
import { NAV_BAR_OPTIONS, useNavBar } from "hooks/NavBar.hook";
import classnames from "classnames";
import Credits from '../Credits/Credits';
import Profile from '../Profile/Profile';

interface NavBarProps extends React.HTMLAttributes<HTMLDivElement> { }

const NavBar: React.FC<NavBarProps> = ({ }) => {
    const { currentTab, setCurrentTab } = useNavBar();

    const renderTabs = () => {
        return NAV_BAR_OPTIONS.map((o) => (
            <a href="#" key={o.id}
                className={classnames("navbar-option", {
                    current: o.id === currentTab.id,
                })} onClick={(e) => { e.preventDefault(); setCurrentTab(o); }}>
                {o.icon && <div className="icon">{o.icon}</div>}
                <span>{o.title}</span>
            </a>
        ));
    };
    return (
        <div className={"navbar"} >
            <div className="navbar--wrapper">
                <Credits />
                <div className="navbar-tabs">
                    <div className="navbar-tabs--wrapper">
                        {renderTabs()}
                    </div>
                </div>
                <Profile />
            </div>
        </div>
    );
};

export default NavBar;
