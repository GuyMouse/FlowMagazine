import React, { useState } from "react";
import "./SystemManagement.scss";
import MainPage from "../MainPage/MainPage";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as EditIcon } from "../../assets/icons/EditIcon.svg";
import { ReactComponent as DeleteIcon } from "../../assets/icons/delete.svg";
import { SimplePopup } from "../../components/SimplePopup";
import UsersManagement from "../../components/SystemManagementTabs/UsersManagement/UsersManagement";
import RolesManagement from "../../components/SystemManagementTabs/RolesManagement/RolesManagement";
import { Tabs } from "../../components/Tabs";

const SystemManagement: React.FC = () => {
  const location = useLocation();

  const tabs = [
    {
      id: "usersmanagement",
      title: "ניהול משתמשים",
      component: UsersManagement,
    },
    {
      id: "rolesmanagement",
      title: "ניהול תפקידים",
      component: RolesManagement,
    },
  ];

  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const currentTab = tabs[currentTabIndex];

  const handleTabClick = (index: number) => {
    setCurrentTabIndex(index);
  };
  const renderTabs = () => {
    if (currentTab.id === "rolesmanagement") {
      return <RolesManagement />;
    }
    return <UsersManagement />;
  };

  return (
    <MainPage>
      <div className="system-management">
        <div className="system-management--wrapper">
          <div className="system-management--tabs">
            <div className="system-management--tabs-wrapper">
              <Tabs
                tabs={tabs}
                activeTab={currentTab.id}
                handleTabClick={handleTabClick}
              />
            </div>
          </div>
          {renderTabs()}
        </div>
      </div>
    </MainPage>
  );
};

export default SystemManagement;
