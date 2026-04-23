import React, { useState, useEffect, useRef } from 'react';
import MainPage from '../MainPage/MainPage';
import { Navigate, useLocation, useParams } from 'react-router-dom';

import { getCourseById, editCourse } from '../../services/Courses';
import { Course } from '../../models/Course';
import { Student } from '../../models/Student';
import { Station } from '../../models/Station';
import { StudyUnit, TaskBase, TaskType, SelectionQuestion } from '../../models/ContentManagement';
import { StationInfo } from '../../components/StationInfo';
import { StudentsProgression } from '../../components/StudentsProgression';
import { getAllStudyUnits } from '../../services/ContentManagement';
import { getStudentById } from '../../services/Students';
import { getFlowHub, getActiveStations } from '../../services/Socket';
import { config } from '../../config';
import type { HubApi } from '../../socket/sockethub';
import './RunningLesson.scss';

export interface StudentGrade {
    correct: number;
    total: number;
    grade: number;
}

/**
 * GRADE CALCULATION LOGIC:
 * This function fetches the details of all tasks performed in the training
 * and compares the student's answer with the correct index to generate a grade.
 */
async function calculateStationGrade(trainingTaskIds: string[]): Promise<StudentGrade> {
    let correct = 0;
    let total = 0;

    const results = await Promise.all(
        trainingTaskIds.map(id =>
            fetch(`${config.apiUrl}/api/trainingTasks/${id}`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
        )
    );

    for (const tt of results) {
        if (!tt) continue;
        const task = tt.task ?? tt.Task;
        const answer = tt.answer ?? tt.Answer;
        if (!task || !answer) continue;

        const correctIndex = task.correctIndex ?? task.CorrectIndex;
        const answerIndex = answer.answerIndex ?? answer.AnswerIndex;
        if (correctIndex === undefined || answerIndex === undefined) continue;

        total++;
        if (correctIndex === answerIndex) correct++;
    }

    const grade = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, grade };
}

const RunningLesson: React.FC = () => {
    const location = useLocation();
    const params = useParams<{ courseId?: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studyUnit, setStudyUnit] = useState<StudyUnit | null>(null);
    const [clickedStudent, setClickedStudent] = useState<Student | null>(null);
    const [connectedStudents, setConnectedStudents] = useState<Student[]>([]);
    const [progressMap, setProgressMap] = useState<{ [studentId: string]: number }>({});
    const [gradeMap, setGradeMap] = useState<{ [studentId: string]: StudentGrade }>({});
    const [totalTasks, setTotalTasks] = useState<number>(0);
    const [currentStationId, setCurrentStationId] = useState<string | null>(null);
    const [currentStation, setCurrentStation] = useState<Station | null>(null);
    const [currentTaskIndexByStation, setCurrentTaskIndexByStation] = useState<Record<string, number>>({});
    const [studentIdToStationId, setStudentIdToStationId] = useState<Record<string, string>>({});
    const [stationIdToNumber, setStationIdToNumber] = useState<Record<string, number>>({});
    const hubRef = useRef<HubApi | null>(null);

    /**
     * REFERENCE HOLDERS (Refs):
     * SignalR listeners are created once during the initial connection. 
     * They cannot see updated State values due to JavaScript closures.
     * These Refs always point to the most current data, allowing the Hub to make correct decisions.
     */
    const courseRef = useRef<Course | null>(null);
    const studyUnitRef = useRef<StudyUnit | null>(null);
    const connectedStudentsRef = useRef<Student[]>([]);

    useEffect(() => { courseRef.current = course; }, [course]);
    useEffect(() => { studyUnitRef.current = studyUnit; }, [studyUnit]);
    useEffect(() => { connectedStudentsRef.current = connectedStudents; }, [connectedStudents]);

    useEffect(() => {
        if (studyUnit) {
            const count = studyUnit.taskIds?.length ?? studyUnit.tasks?.length ?? 0;
            if (count > 0) setTotalTasks(count);
        }
    }, [studyUnit]);

    const state = location.state as { courseId?: string; studyUnit?: StudyUnit } | string | null;
    const courseId = (typeof state === 'object' && state?.courseId)
        || (typeof state === 'string' ? state : null)
        || params.courseId
        || location.pathname.split('/').pop()
        || '';
    const studyUnitFromState = (typeof state === 'object' && state?.studyUnit) || null;

    /**
     * COURSE COMPLETION LOGIC:
     * Step 1: Checks if all units in the course array have a valid trainingId (except current).
     * Step 2: Checks if any other training session in the course is currently 'isLive'.
     */
    const CourseStatusChange = () => {
        const currentCourse = courseRef.current;
        if (!currentCourse || !currentCourse.studyUnits) return false;

        const allUnitsHaveTraining = currentCourse.studyUnits.every(unit => {
            if (String(unit.id) === String(studyUnitRef.current?.id)) return true;
            return unit.trainingId !== null && unit.trainingId !== undefined;
        });

        if (!allUnitsHaveTraining){ 
            console.log("studyunit have trining dont update status");
            return false;
        }
        const anyOtherTrainingIsLive = currentCourse.trainings?.some(t => {
               console.log("trining is live dont update status");
            return t.isLive && String(t.id) !== String(studyUnitRef.current?.trainingId);
        });

        return !anyOtherTrainingIsLive;
    };

    useEffect(() => {
        const hub = getFlowHub();
        hubRef.current = hub;

        hub.start()
            .then(() => {
                /**
                 * SIGNALR: STATION CONNECTED
                 * Updates the connectedStudents list so the instructor knows how many people to wait for.
                 */
                hub.trainingConnectionRegistered(async (payload: any) => {
                    const station = payload?.Station ?? payload?.station;
                    setCurrentStation(station as Station);
                    setCurrentStationId(station?.id ?? station?.Id ?? null);
                    if (!station) return;

                    const studentIds: string[] = station.studentIds ?? station.StudentIds ?? [];
                    const stationIdStr = String(station.id ?? station.Id ?? "");
                    setStudentIdToStationId((prev) => {
                        const next = { ...prev };
                        studentIds.forEach((sid) => { next[String(sid)] = stationIdStr; });
                        return next;
                    });
                    for (const sid of studentIds) {
                        const student = await getStudentById(sid as any);
                        if (student) {
                            setConnectedStudents((prev) => {
                                const exists = prev.some((s) => String(s.id) === String(student.id));
                                if (exists) return prev;
                                return [...prev, student];
                            });
                        }
                    }
                });

                /**
                 * SIGNALR: DATA RECEIVED (Answers / Completion)
                 * This is the core listener for updating instructor UI in real-time.
                 */
                hub.answerSubmissionAccepted(async (payload: any) => {
                    const station = payload?.Station ?? payload?.station;
                    if (!station) return;

                    const currentIdx = station.currentTaskIndex ?? station.CurrentTaskIndex ?? 0;
                    const studentIds: string[] = station.studentIds ?? station.StudentIds ?? [];
                    const stationIdStr = String(station.id ?? station.Id ?? "");
                    const completed = payload?.TrainingCompleted ?? payload?.trainingCompleted ?? false;
                    
                    // Update progression bar and task indices
                    setCurrentTaskIndexByStation((prev) => ({ ...prev, [stationIdStr]: currentIdx }));
                    setProgressMap((prev) => {
                        const next = { ...prev };
                        for (const sid of studentIds) { next[String(sid)] = currentIdx; }
                        return next;
                    });

                    // Logic specifically for when a station finishes the unit
                    if (completed) {
                        const taskIds: string[] = (station.trainingTaskIds ?? station.TrainingTaskIds ?? [])
                            .map((id: any) => String(id));

                        if (taskIds.length > 0) {
                            /**
                             * IMPORTANT: Fetch the grade immediately upon completion.
                             * This ensures the instructor sees the score as soon as the student hits 'Submit'.
                             */
                            const gradeResult = await calculateStationGrade(taskIds);
                            
                            setGradeMap((prev) => {
                                const nextGradeMap = { ...prev };
                                for (const sid of studentIds) {
                                    nextGradeMap[String(sid)] = gradeResult;
                                }

                                /**
                                 * MULTI-STUDENT SYNCHRONIZATION:
                                 * We compare the number of students who finished (in nextGradeMap) 
                                 * with the number of students who joined (in connectedStudentsRef).
                                 * We ONLY call FinishTraining and stop the hub when EVERYONE is done.
                                 */
                                const joinedCount = connectedStudentsRef.current.length;
                                const finishedCount = Object.keys(nextGradeMap).length;

                                if (finishedCount >= joinedCount && joinedCount > 0) {
                                    hub.finishTraining().then(() => {
                                        if (CourseStatusChange()) {
                                            editCourse(courseId, { status: "Completed" })
                                                .then((updated) => updated && setCourse(updated as Course));
                                        }
                                        hub.stop();
                                    });
                                }
                                return nextGradeMap;
                            });
                        }
                    }
                });
            })
            .catch((err) => console.error("Instructor Hub Connection Failed:", err));

        return () => {
            hubRef.current = null;
        };
    }, []);

    useEffect(() => {
        getActiveStations().then((list) => {
            if (!Array.isArray(list)) return;
            const map: Record<string, number> = {};
            list.forEach((s, index) => {
                const id = String(s?.id ?? s?.Id ?? '').toLowerCase();
                if (id) map[id] = index + 1;
            });
            setStationIdToNumber(map);
        });
    }, [studentIdToStationId, currentStationId]);

    useEffect(() => {
        if (!courseId) {
            setError("Course ID is missing");
            setLoading(false);
            return;
        }
        setLoading(true);

        Promise.all([
            getCourseById(courseId),
         
        ])
            .then(([courseData]) => {
                const course = courseData as Course;
                const courseAny = courseData as any;
                const studyUnitIds = courseAny?.studyUnitIds ?? courseAny?.StudyUnitIds ?? course.studyUnitIds ?? [];
                const backendStudyUnits = courseAny?.studyUnits ?? courseAny?.StudyUnits ?? [];

                let courseStudyUnits: StudyUnit[] = [];

                if (backendStudyUnits.length > 0) {
                    const backendUnitIds = new Set(backendStudyUnits.map((u: any) => String(u.id || u.Id || '')));
                   // courseStudyUnits = allStudyUnits.filter(unit => backendUnitIds.has(String(unit.id)));

                    courseStudyUnits = backendStudyUnits.map((unit: any) => {
                        const unitId = String(unit.id || unit.Id || '');
                       // const existingUnit = allStudyUnits.find(u => String(u.id) === unitId);
                      //  if (existingUnit && existingUnit.tasks && existingUnit.tasks.length > 0) return existingUnit;

                        const normalizedUnit: StudyUnit = {
                            id: String(unit.id || unit.Id || unitId),
                            title: unit.title || unit.Title || '',
                            description: unit.description || unit.Description || undefined,
                            taskIds: (unit.taskIds || unit.TaskIds || []).map((id: any) => String(id)),
                            course: unit.course || unit.Course || undefined,
                            courseId: String(unit.courseId || unit.CourseId || ''),
                            trainingId: (unit.trainingId || unit.TrainingId) ? String(unit.trainingId || unit.TrainingId) : undefined,
                            tasks: (unit.tasks || unit.Tasks || []).map((task: any) => {
                                const base: TaskBase = {
                                    id: String(task.id || task.Id),
                                    title: task.title || task.Title,
                                    lessonId: String(task.lessonId || task.LessonId),
                                    type: (task.type || task.Type || task["$type"] || "").replace("ClassroomServer.Models.ContentManagement.", "") as TaskType
                                };
                                if (base.type === "SelectionQuestion") {
                                    return { ...base, prompt: task.prompt || task.Prompt || "", options: task.options || task.Options || [], correctIndex: task.correctIndex !== undefined ? task.correctIndex : (task.CorrectIndex !== undefined ? task.CorrectIndex : 0) } as SelectionQuestion;
                                }
                                return base;
                            })
                        };
                        return normalizedUnit;
                    });
                }// else if (studyUnitIds.length > 0 && allStudyUnits.length > 0) {
                //     const ids = new Set(studyUnitIds.map(String));
                //   //  courseStudyUnits = allStudyUnits.filter((unit) => ids.has(String(unit.id)));
                // }

               // course.studyUnits = courseStudyUnits;

                // if (studyUnitFromState) {
                //     const id = String(studyUnitFromState.id ?? (studyUnitFromState as any).Id);
                //     const match = allStudyUnits.find((u: any) => String(u?.id ?? u?.Id) === id);
                //     setStudyUnit((match ?? studyUnitFromState) as StudyUnit);
                // }
                
                setCourse(course);

                if (course.status !== "Active") {
                    editCourse(courseId, { name: course.name, status: "Active", location: courseAny.location || courseAny.Location || course.location || "", studyUnitIds: courseAny.studyUnitIds || courseAny.StudyUnitIds || course.studyUnitIds || [], instructorId: courseAny.instructorId || course.instructorId || null })
                        .then((updated) => updated && setCourse(updated as Course));
                }

                setLoading(false);
            })
            .catch((err) => {
                console.error("Initial data load failed:", err);
                setLoading(false);
            });
    }, [courseId, studyUnitFromState]);

    if (loading) return <MainPage><div>{"טוען נתוני קורס..."}</div></MainPage>;
    if (error) return <MainPage><div>{"שגיאה:"} {error}</div></MainPage>;
    if (!course) return <MainPage><div>{"קורס לא נמצא"}</div></MainPage>;

    return (
        <MainPage>
            <div className="running-lesson">
                <div className="running-lesson--wrapper">
                    <StudentsProgression
                        setClickedStudent={setClickedStudent}
                        studentsData={connectedStudents.length > 0 ? connectedStudents : course.students}
                        progressMap={progressMap}
                        totalTasks={totalTasks}
                        gradeMap={gradeMap}
                        stationNumberByStudentId={(() => {
                            const out: Record<string, number> = {};
                            Object.entries(studentIdToStationId).forEach(([studentId, stationId]) => {
                                const n = stationIdToNumber[stationId.toLowerCase()] ?? stationIdToNumber[stationId];
                                if (n != null) out[studentId] = n;
                            });
                            return out;
                        })()}
                    />
                    <StationInfo
                        courseData={course}
                        studyUnit={studyUnit}
                        clickedStudent={clickedStudent}
                        currentTaskIndex={currentTaskIndexByStation[clickedStudent ? studentIdToStationId[String(clickedStudent.id)] ?? currentStationId ?? "" : currentStationId ?? ""] ?? 0}
                        allStudentsCompleted={(() => {
                            const displayedStationId = clickedStudent ? studentIdToStationId[String(clickedStudent.id)] ?? currentStationId ?? "" : currentStationId ?? "";
                            if (!displayedStationId) return false;
                            const studentsAtStation = Object.entries(studentIdToStationId).filter(([, sid]) => sid === displayedStationId).map(([studentId]) => studentId);
                            return studentsAtStation.length > 0 && studentsAtStation.every((sid) => !!gradeMap[sid]);
                        })()}
                        currentStationNumber={clickedStudent
                            ? (stationIdToNumber[(studentIdToStationId[String(clickedStudent.id)] ?? "").toLowerCase()] ?? stationIdToNumber[studentIdToStationId[String(clickedStudent.id)] ?? ""])
                            : (currentStationId ? (stationIdToNumber[currentStationId.toLowerCase()] ?? stationIdToNumber[currentStationId]) : null)}
                    />
                </div>
            </div>
        </MainPage>
    );
}

export default RunningLesson;