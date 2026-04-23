import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Course } from "models/Course";
import { Button, TextField } from "components";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";
import { ReactComponent as AddCircleIcon } from "../../assets/icons/Add_Circle.svg";
import { ReactComponent as ExportNotesIcon } from "../../assets/icons/export_notes.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/EditIcon.svg";
import { ReactComponent as DeleteIcon } from "../../assets/icons/delete.svg";
import { Student } from "../../models/Student";
import { SimplePopup } from "../../components/SimplePopup/SimplePopup";
import BaseGrid from "components/BaseGrid/BaseGrid";
import "./StudentsTab.scss";

interface StudentsTabProps extends React.HTMLAttributes<HTMLDivElement> {
  setCourse: (course: Course) => void;
  course: Course;
  initialStudents?: Student[];
  isEditable: boolean;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  setCourse,
  course,
  isEditable,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState<Student[]>(course.students || []);
  const [showPopup, setShowPopup] = useState(false);
  // Form state for the "add" input row
  const [newRow, setNewRow] = useState<Student>({
    id: "",
    serviceNumber: "",
    firstName: "",
    lastName: "",
  });
  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    id: "",
    serviceNumber: "",
    firstName: "",
    lastName: "",
  });

  // --- Sync Logic ---
  const handleStudentsChange = (newStudents: Student[]) => {
    setStudents(newStudents);
    const studentIds = newStudents
      .map((student) => student.id)
      .filter((id) => id !== null && id !== "" && id !== "0");

    setCourse({
      ...course,
      students: newStudents,
      studentIds: studentIds,
    });
  };

  // --- Action Handlers ---
  const handleAdd = () => {
    // console.log(newRow);
    if (!newRow.firstName || !newRow.id) return;

    if (students.filter((s) => s.id === newRow.id).length > 0) {
      setShowPopup(true);
      return;
    }
    const updated = [...students, newRow as Student];
    handleStudentsChange(updated);
    console.log(newRow);
    // createStudent({ id: "", ...newRow })
    //   .then((student) => {
    //     if (student) handleStudentsChange([...students, student]);
    //     setNewRow({ firstName: "", lastName: "", studentId: "" });
    //   })
    //   .catch((err: Error) => console.error("Failed to save student:", err));
  };

  const handleDelete = (id: string) => {
    // handleStudentsChange(
    //   students.filter((s) => {
    //     console.log(s.id, id);
    //     return s.id !== id;
    //   }),
    // );
  };

  const startEdit = (student: Student) => {
    setEditingId(String(student.id));
    setEditValues({
      id: String(student.id),
      serviceNumber: String(student.id),
      firstName: student.firstName,
      lastName: student.lastName,
    });
  };

  const saveEdit = (student: Student) => {
    if (editingId === null) return;
    setEditValues({
      id: String(student.id),
      serviceNumber: String(student.id),
      firstName: student.firstName,
      lastName: student.lastName,
    });
    // handleStudentsChange(
    //   students.map((row) =>
    //     row.id === editingId
    //       ? {
    //           ...row,
    //           firstName: newRow.firstName,
    //           lastName: newRow.lastName,
    //         }
    //       : row,
    //   ),
    // );
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const clearInputs = () => {
    setNewRow({ firstName: "", lastName: "", id: "" });
    console.log("cleared inputs");
  };

  // --- CSV Logic ---
  const downloadSampleCSV = () => {
    const content = "First Name,Last Name,Personal ID\nIsrael,Israeli,1234567";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "students_template.csv");
    link.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      //   const text = e.target?.result as string;
      //   const lines = text.split("\n").slice(1); // Skip header row
      const newStudents: Student[] = [];

      //   for (const line of lines) {
      //     // line.split(",").map((s) => s.trim());
      //     // if (firstName && studentId) {
      //     //   try {
      //     //     const created = await createStudent({
      //     //       id: "",
      //     //       firstName,
      //     //       lastName,
      //     //       studentId,
      //     //     });
      //     //     if (created) newStudents.push(created);
      //     //   } catch (err) {
      //     //     console.error("Error creating student from CSV:", err);
      //     //   }
      //     // }
      //   }
      handleStudentsChange([...students, ...newStudents]);
    };
    reader.readAsText(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewRow({
      ...newRow,
      [e.target.name]: value,
    } as Student);
  };

  const columnsForStudents = [
    {
      head: "שם פרטי",
      key: "firstName" as keyof Student,
      render: (s: Student | null) => {
        if (editingId === s?.id) {
          return (
            <TextField
              className="input-item"
              value={editValues.firstName}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  firstName: e.target.value,
                })
              }
            />
          );
        } else {
          return <span className="item-text">{s?.firstName}</span>;
        }
      },
    },
    {
      head: "שם משפחה",
      key: "lastName" as keyof Student,
      render: (s: Student | null) => {
        if (editingId === s?.id) {
          return (
            <TextField
              className="input-item"
              value={editValues.lastName}
              onChange={(e) =>
                setEditValues({ ...editValues, lastName: e.target.value })
              }
            />
          );
        } else {
          return <span className="item-text">{s?.lastName}</span>;
        }
      },
    },
    {
      head: "מספר אישי",
      key: "id" as keyof Student,
      render: (s: Student | null) => {
        if (editingId === s?.id) {
          return (
            <TextField
              className="input-item"
              value={editValues.serviceNumber}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  serviceNumber: e.target.value,
                })
              }
            />
          );
        } else {
          return <span className="item-text">{s?.id}</span>;
        }
      },
    },
    {
      head: "פעולות",
      key: "actions" as keyof Student,
      render: (s: Student | null) => {
        console.log(
          "editingId:",
          String(editingId),
          "student id:",
          String(s?.id),
        );
        return s === null ? (
          <div className="apprentice-go">
            <Button
              startIcon={<ExportNotesIcon />}
              variant="primary"
              className="apprentice-button"
              onClick={() =>
                navigate("/apprenticefile", { state: { student: s } })
              }
            >
              <span>תיק חניך</span>
            </Button>
          </div>
        ) : (
          <div className="buttons-wrapper">
            {editingId && String(editingId) === String(s.id) ? (
              <button className="save-btn" onClick={() => saveEdit(s)}>
                שמור
              </button>
            ) : (
              <button className="edit-btn" onClick={() => startEdit(s)}>
                <EditIcon />
              </button>
            )}
            <button className="cancel-btn" onClick={() => cancelEdit()}>
              <DeleteIcon />
            </button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    console.log(editingId);
  }, [editingId]);

  const filteredStudents = students.filter(
    (s) =>
      s.firstName.includes(searchText) ||
      s.lastName.includes(searchText) ||
      s.serviceNumber?.includes(searchText),
  );

  return (
    <div className="students-tab">
      <div className="tab-content-wrapper">
        <div className="students-actions">
          <div className="search-bar">
            <SearchIcon className="search-icon" />
            <input
              className="search"
              placeholder="חיפוש"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {isEditable && (
            <div className="csv-actions">
              <span className="downlod-csv" onClick={downloadSampleCSV}>
                הורד קובץ CSV לדוגמא
              </span>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<AddCircleIcon />}
              >
                <span>טען רשימה מקובץ CSV</span>
              </Button>
            </div>
          )}
        </div>

        <div className="students-grid-area">
          <BaseGrid
            columns={columnsForStudents}
            data={filteredStudents}
            hasAddableRow={isEditable}
            handleOnChange={(e) => {
              handleChange(e as React.ChangeEvent<HTMLInputElement>);
            }}
            onSaveAdd={handleAdd}
            onClear={() => clearInputs()}
          />
          <SimplePopup
            show={showPopup}
            onClose={() => setShowPopup(false)}
            type="warning"
            message="קיים כבר חניך עם מספר אישי זה במערכת"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;
