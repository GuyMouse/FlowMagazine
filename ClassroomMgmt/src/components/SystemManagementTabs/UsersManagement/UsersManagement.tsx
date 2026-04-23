import React, { useState, useEffect } from "react";
import "./UsersManagement.scss";
import BaseGrid from "../../BaseGrid/BaseGrid";
import Button from "../../Button/Button";
import { ReactComponent as EditIcon } from "../../../assets/icons/EditIcon.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/delete.svg";
import { ReactComponent as AddCircleIcon } from "../../../assets/icons/Add_Circle.svg";
import { render } from "@testing-library/react";

const fakeUsers = [
  {
    id: 1,
    firstName: "אמילי",
    lastName: "לוי",
    unit: "גדוד קרן",
    role: "ע. מדר",
    lastLogin: "01/05/2025, 04:36:22 PM",
  },
  {
    id: 2,
    firstName: "סופיה",
    lastName: "בן-דוד",
    unit: "גדוד קרן",
    role: "מדריך ראשי",
    lastLogin: "01/05/2025, 04:36:22 PM",
  },
  {
    id: 3,
    firstName: "רוני",
    lastName: "חן",
    unit: "גדוד שמש",
    role: "מדר",
    lastLogin: "01/05/2025, 04:36:22 PM",
  },
];
const UsersManagement: React.FC = () => {
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
  });

  const columns = [
    { head: "שם פרטי", key: "firstName" },
    { head: "שם משפחה", key: "lastName" },
    { head: "יחידה", key: "unit" },
    {
      head: "תפקיד",
      key: "role",
      options: [
        { label: "ע. מדר", value: "ע. מדר" },
        { label: "מדריך ראשי", value: "מדריך ראשי" },
        { label: "מדר", value: "מדר" },
      ], // To be replaced with actual roles from the system
    },
    { head: "כניסה אחרונה", key: "lastLogin", editable: false },
    {
      head: "פעולות",
      key: "actions",
      render: (user: any) => (
        <div className="buttons-wrapper">
          <EditIcon className="edit-btn" onClick={() => handleEditUser()} />
          <DeleteIcon
            className="delete-btn"
            onClick={() => handleDeleteUser()}
          />
        </div>
      ),
    },
  ] as any;

  const handleEditUser = () => {
    // do nothing for now
  };
  const handleDeleteUser = () => {
    // do nothing for now
  };
  const handleAdd = () => {
    // do nothing for now
  };
  //

  return (
    <div className="users-management">
      <div className="users-management--wrapper">
        <BaseGrid
          data={fakeUsers}
          columns={columns}
          hasAddableRow={true}
          onClear={() => {}}
        />
      </div>
    </div>
  );
};

export default UsersManagement;
