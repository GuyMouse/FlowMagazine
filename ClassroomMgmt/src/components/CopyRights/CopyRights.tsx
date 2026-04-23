import React from "react";
import ShahamLogo from "../../assets/icons/ShahamLogo.svg";
import "./CopyRights.scss";

function CopyRights() {
    return (
        <div className="copy-rights">
            <span>Powered by Shaham tec</span>
            <img src={ShahamLogo} alt="Shaham Logo" />
        </div>
    )
}
export default CopyRights;