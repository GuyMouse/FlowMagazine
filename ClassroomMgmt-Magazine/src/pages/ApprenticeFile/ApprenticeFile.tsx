import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ApprenticeFile.scss";
import { StudentHistory } from "models/StudentHistory";
import { setAverageGradeClass } from "helpers/data.helpers";
import { getStudentHistoryById, getAllStudentHistories } from "services/StudentHistory";
import { getTrainingById } from "services/Trainings";
import { Student } from "models/Student";
import { StudentTrainingGrade } from "models/StudentTrainingGrade";
import Chart from "../../components/Chart/Chart"
import { Training } from "../../models/Training";
import { MainPage } from "pages/MainPage";
import { Button } from "components/Button";
import { ReactComponent as ArrowIconLeft } from "../../assets/icons/chevronleft.svg"
import { ReactComponent as DateIcon } from "../../assets/icons/date.svg"
import { ReactComponent as StatusIcon } from "../../assets/icons/status.svg"
import { ReactComponent as RoleIcon } from "../../assets/icons/role.svg"
import { ReactComponent as UnitIcon } from "../../assets/icons/unit.svg"
import { ReactComponent as EditIcon } from "../../assets/icons/EditIcon.svg";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { BaseGrid } from "components/BaseGrid";
import { ReactComponent as ExportIcon } from "../../assets/icons/export_icon.svg";

export interface HistoryRow {
    key: string;
    title: string;
    grade: number;
    average: number;
}
const columns = [
    { head: "שם ההדרכה", key: "title" as keyof HistoryRow },
    {
        head: "ציון",
        key: "grade" as keyof HistoryRow,
        render: (h: HistoryRow) => {
            const gradeClass = setAverageGradeClass(Math.round(h.grade));
            return (
                <svg width="40" height="40" className={gradeClass}>
                    <circle className="grade" cx="20" cy="20" r="10" />
                    <text
                        x="20"
                        y="24"
                        textAnchor="middle"
                        className="text"
                        style={{ fontWeight: 'bold', fontSize: '12px' }}
                    >
                        {Math.round(h.grade)}
                    </text>
                </svg>
            );
        },
    },
];

export interface ApprenticeFileProps {
    student: Student;
}

const ApprenticeFile: React.FC<ApprenticeFileProps> = ({ student }) => {
    const navigate = useNavigate();

    const [rows, setRows] = useState<HistoryRow[]>([]);
    // const [averageTrainingId, setAverageTrainingId] = useState(0);
    const [sidebar, setSidebar] = useState(false);
    const [editInput, setInput] = useState(false);
    const [inputstring, setInputString] = useState("החייל מפגין שליטה טובה בהפעלת התותח, נדרש שיפור בזמני תגובה בתרגילי ירי חי");
    const [trainingGrades, setTrainingGrades] = useState<StudentTrainingGrade[] | null>(null);
    const [studentHistory, setStudentHistory] = useState<StudentHistory | null>(null);
    const [trainingId, setTrainingId] = useState<string>("");
    const [training, setTraining] = useState<Training | null>(null);
    const [grades, setGrades] = useState<number[]>([]);
    const [chartData, setChartData] = useState<{ title: string; grade: number }[]>([]);
    // const [newHistoryData, setNewHistoryData] = useState([])

    const historyId = student.studentHistoryId;

    useEffect(() => {
        if (!historyId) {
            console.log('no history id');
            return;
        }
        getStudentHistoryById(historyId).then((response) => {
            const historyData = response;
            const studentTrainingGrades = historyData.studentTrainingGrades;
            setTrainingGrades(studentTrainingGrades ?? []);
            setStudentHistory(historyData);
            // console.log('trainingGrades in useeffect', { studentTrainingGrades });

        }).catch((e) => {
            console.error('errors for retriving student history', e);
            setStudentHistory(null);
            setTrainingGrades(null);
            setRows([]);
        });
    }, [historyId]);

    useEffect(() => {
        if (!trainingGrades || trainingGrades.length === 0) return;

        setRows([]);

        Promise.all(

            trainingGrades.map((t) => {
                setTrainingId(t.trainingId);
                const newTraining = getTrainingById(t.trainingId);
                return newTraining;
            })
        )
            .then((responses) => {
                const builtRows = trainingGrades.map((t, i) => {
                    const training = responses[i] as any;
                    const trainingAvg = training?.gradeAverage ?? training?.GradeAverage ?? 0;
                    return {
                        key: t.trainingId,
                        title: training?.title ?? `הדרכה ${i + 1}`,
                        grade: Math.round(t.grade),
                        average: typeof trainingAvg === 'number' ? Math.round(trainingAvg) : 0,
                    };
                });
                setRows(builtRows);
            })
            .catch((e) => {
                console.error('errors for retriving training grades', e);
            });
    }, [trainingGrades]);


    useEffect(() => {
        if (!trainingId) return;
        getTrainingById(trainingId)
            .then((result) => {
                // console.log('training', result);
                setTraining(result);
                const avg = (result as any)?.gradeAverage ?? (result as any)?.GradeAverage;
                setGrades((prev) => [...prev, Math.round(avg)]);
                setChartData((prev) => [...prev, { title: result?.title ?? "", grade: Math.round(avg) }]);
            })
            .catch((error) => {
                console.error("failed to load training:", error);
                setTraining(null);
            });
    }, [trainingId]);
    // useEffect(() => {
    //     getAllStudentHistories().then((histories) => {
    //         //console.log('histories', histories);

    //        const allStudensTrainingGrades = histories.map((history) => history.studentTrainingGrades.filter(
    //         (triningid)=>triningid.trainingId===thisTrainingId));

    //         console.log('allStudensTrainingGrades', allStudensTrainingGrades);
    //     }).catch((e) => {
    //         console.error('errors for retriving all student histories', e);
    //     });


    // },[trainingGrades]);


    let sum = 0;
    for (let i = 0; i < rows.length; i++) {
        sum += rows[i].grade;
    }
    const average = rows.length > 0 ? Math.round(sum / rows.length) : 0;



    const handle_save_pdf = async () => {
        const myelement = document.getElementById("apprentice-container");
        if (!myelement) return;

        const canvas = await html2canvas(myelement, { scale: 2, backgroundColor: "#FFFFFF" });
        const data = canvas.toDataURL("image/png");

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        doc.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
        doc.save("תיק_חניך.pdf");
    }

    return (
        <MainPage>
            <div className="apprentice-container" id="apprentice-container">
                <div className="apprentice-container--head">
                    <div className="head-item" >
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <ArrowIconLeft className="back-arrow" />
                        </button>
                        <span className="name">{student.firstName} {student.lastName}</span>
                        <svg width="70" height="70" className={setAverageGradeClass(average)} >
                            <circle className="grade"
                                cx="33.4"
                                cy="33.4"
                                r="30"
                            />
                            <text x="35" y="40" textAnchor="middle" className="text"
                                style={{ fontWeight: 'bold', fontSize: '16px' }}
                            >{average}</text>

                        </svg>

                    </div>
                    <Button
                        className="pdf"
                        variant="primary"
                        onClick={() => {
                            handle_save_pdf();
                        }
                        }
                    >ייצא קובץ PDF
                        <ExportIcon className="export-icon" />
                    </Button>
                </div>
                <div className="apprentice-container--body">
                    <div className={sidebar === true ? "side-container-close" : "side-container-open"}>
                        <button className="arrow" // will close and open side bar !
                            onClick={() => {
                                setSidebar(!sidebar);
                            }}
                        >
                            <ArrowIconLeft ></ArrowIconLeft>
                        </button>
                        <div className="side-items-container">
                            <div className="item-container" // find correct icons !
                            >
                                <div className="side-head-container">
                                    <RoleIcon></RoleIcon>
                                    <span >תפקיד</span>
                                </div>
                                <span >סמל</span>
                            </div>
                            <div className="item-container"// find correct icons !
                            >
                                <div className="side-head-container">
                                    <UnitIcon></UnitIcon>
                                    <span >יחידה</span>
                                </div>
                                <span>גדוד תותחנים</span>
                            </div>
                            <div className="item-container"// find correct icons !
                            >
                                <div className="side-head-container">
                                    <DateIcon></DateIcon>
                                    <span >תאריך</span>
                                </div>
                                <span className="date">{new Date().toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    // hour: "2-digit",
                                    // minute: "2-digit",
                                    // second: "2-digit",
                                    hour12: true,
                                })} </span>
                            </div>
                            <div className="item-container"// find correct icons !
                            >
                                <div className="side-head-container">
                                    <StatusIcon />
                                    <span >סטטוס</span>
                                </div>
                                <span >עבר קורס</span>
                            </div>
                        </div>
                    </div> {/*<!--end of side bar-->*/}

                    <div className="apprentice-container--mid">
                        <div className="chart-container">
                            <Chart
                                dataBar={rows.length > 0 ? rows : [{ title: "אין הדרכות", grade: 0 }]}
                                dataLine={rows.length > 0 ? rows.map((r) => ({ title: r.title, grade: r.average })) : [{ title: "אין הדרכות", grade: 0 }]}
                                chartTitle={`${student.firstName} ${student.lastName} - ממוצע: ${average}`}
                            />

                        </div>
                        <div className="note-container">
                            <div className="head-note-container">
                                <h2>הערכת מדריך</h2>
                                <button className="edit-button"
                                    onClick={() => {
                                        setInput(!editInput);
                                    }
                                    }
                                >
                                    <EditIcon className="edit-icon"></EditIcon>
                                </button>
                            </div>
                            {editInput ? (
                                <textarea
                                    className="note"
                                    placeholder={inputstring}
                                    onChange={(e) => {
                                        setInputString(e.target.value)
                                    }}
                                >

                                </textarea>
                            ) : (

                                <span className="note">{inputstring}</span>
                            )}

                        </div>

                    </div>{/*<!--end of  mid-->*/}
                </div>                        {/*end of body*/}
                {
                    studentHistory && rows.length > 0 ?
                        <div className="apprentice-container--bottom">
                            <span className="h">היסטוריית הדרכות</span>
                            <div className="grid-container">
                                <BaseGrid data={rows}
                                    columns={columns}
                                />
                            </div>

                        </div>
                        : <div className="apprentice-container--bottom no-data">אין לתלמיד הזה הדרכות קודמות</div>
                }


            </div>                          {/*end of main*/}
        </MainPage >
    )
}
// props which are used to get the student from the location state
const ApprenticeFileWithStudent: React.FC = () => {
    const location = useLocation();
    const student = (location.state as { student?: Student })?.student;
    if (!student) {
        return (
            <MainPage>
                <div className="apprentice-container">
                    <p>נא לבחור תלמיד ולפתוח תיק חניך מרשימת התלמידים</p>
                </div>
            </MainPage>
        );
    }
    return <ApprenticeFile student={student} />;
};

export default ApprenticeFileWithStudent;