import React, { useState } from "react";
import "./SideBar.scss";
interface SideBarProps extends React.HTMLAttributes<HTMLDivElement> {
    onClickOutside: () => void;
    title: string;
}

const SideBar: React.FC<SideBarProps> = ({
    children,
    onClickOutside,
    title,
}) => {
    const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClickOutside();
        }
    };
    return (
        <div className={"sidebar-wrapper"} onClick={handleWrapperClick}>
            <div className={"sidebar-content"}>
                <div className={"sidebar-header"}>
                    <b>{title}</b>
                    <span onClick={onClickOutside} className={"close"}>
                        ×
                    </span>
                </div>
                {children}
            </div>
        </div>
    );
};

export default SideBar;
