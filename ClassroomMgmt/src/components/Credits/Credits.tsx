import React from "react";
import ShahamLogo from "../../assets/logos/ShahamLogo.svg";
import AppLogo from "../../assets/logos/logo1.svg";

import "./Credits.scss";

function Credits() {
    return (
        <div className="credits">
            <div className="credits--wrapper">
                <div className="flow-container">
                    <span className="app-name">Flow</span>
                    <div className="shaham-logo">
                        <span>Shaham tec</span>
                        <img src={ShahamLogo} alt="Shaham Logo" />
                    </div>
                </div>
                <div className="app-logo">
                    <img src={AppLogo} alt="App Logo" />
                </div>
            </div>
        </div>
    )
}
export default Credits;