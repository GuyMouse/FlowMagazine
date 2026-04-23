import React from "react";
import "./CoursesActions.scss";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";
import { ReactComponent as ArrowIcon } from "../../assets/icons/Arrow_down.svg";
import { ReactComponent as AddCircle } from "../../assets/icons/Add_Circle.svg";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { translateCourseStatus } from "../../helpers/data.helpers";

interface CoursesActionsProps {
  coursesData?: any[]; // שיניתי ל-any כדי למנוע בעיות טיפוסים זמניות
  searchText?: string;
  selectedInstructor?: string;
  selectedStatus?: string;
  onSearchChange?: (value: string) => void;
  onInstructorChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

const CoursesActions: React.FC<CoursesActionsProps> = ({
  coursesData = [],
  searchText = "",
  selectedInstructor = "",
  selectedStatus = "",
  onSearchChange,
  onInstructorChange,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  const getInstructorName = (instructor: any): string => {
    if (!instructor) return "";
    if (typeof instructor === "string") return instructor;
    if (instructor.firstName || instructor.lastName) {
      return `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim();
    }
    return "";
  };

  const uniqueInstructors = Array.from(
    new Set(coursesData.map((course) => getInstructorName(course.instructor)))
  ).filter(name => name !== "");

  const uniqueStatuses = Array.from(
    new Set(coursesData.map((course) => course.status))
  );

  return (
    <div className="courses-actions">
      <div className="courses-actions--wrapper">
        <div className="courses-actions--filters">
          <div className="search-bar">
            <SearchIcon className="search-icon" />
            <input
              className="search"
              placeholder="חיפוש"
              value={searchText}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>

          <div className="instructor-selector">
            <label className="instructor-text" htmlFor="select-instructor">
              מדריך
            </label>
            <select
              id="select-instructor"
              className="select-bar-instructor"
              value={selectedInstructor}
              onChange={(e) => onInstructorChange?.(e.target.value)}
            >
              <option value="">הכל</option>
              {uniqueInstructors.map((instructorName) => (
                <option key={instructorName} value={instructorName}>
                  {instructorName} {/* ✅ עכשיו זה string תקין! */}
                </option>
              ))}
            </select>
            <ArrowIcon className="arrow-icon-one" />
          </div>

          <div className="status-selector">
            <span className="status-text">סטטוס</span>
            <select
              className="select-bar-status"
              value={selectedStatus}
              onChange={(e) => onStatusChange?.(e.target.value)}
            >
              <option value="">הכל</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {translateCourseStatus(status)}
                </option>
              ))}
            </select>
            <ArrowIcon className="arrow-icon-one" />
          </div>
        </div>

        <div className="courses-buttons">
          <div className="courses-buttons--wrapper">
            <Button
              endIcon={<AddCircle />}
              onClick={() => navigate("/addcourse")}
            >
              הוספת קורס
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesActions;