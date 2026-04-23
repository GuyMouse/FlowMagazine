import React from "react";
import "./Tabs.scss";
import Tab from "./Tab/Tab";

interface TabsProps {
  tabs: {
    id: string;
    title: string;
    Component?: React.FC<any>;
  }[];
  activeTab: string;
  handleTabClick: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, handleTabClick }) => {
  return (
    <div className="tabs">
      <div className="tabs--wrapper">
        {tabs &&
          tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              title={tab.title}
              customClass={activeTab === tab.id ? "active" : ""}
              index={index}
              handleClick={() => handleTabClick(index)}
            />
          ))}
      </div>
    </div>
  );
};

export default Tabs;
