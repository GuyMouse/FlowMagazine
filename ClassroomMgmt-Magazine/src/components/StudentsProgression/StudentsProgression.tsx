import React from 'react';
import BaseGrid from '../BaseGrid/BaseGrid';
import { Student } from '../../models/Student';
import type { StudentGrade } from '../../pages/RunningLesson/RunningLesson';
import "./StudentsProgression.scss";

interface StudentsProgressionProps {
    studentsData: Student[];
    setClickedStudent?: (student: Student) => void;
    progressMap?: { [studentId: string]: number };
    totalTasks?: number;
    gradeMap?: { [studentId: string]: StudentGrade };
    /** Station number (1-based) per student id, from getActiveStations order (first to log in = 1, etc.) */
    stationNumberByStudentId?: Record<string, number>;
}

type ProgressionRow = { students: string; progress: React.ReactNode; grade: React.ReactNode; workstation: string; student: Student };

const StudentsProgression: React.FC<StudentsProgressionProps> = ({ studentsData, setClickedStudent, progressMap = {}, totalTasks = 0, gradeMap = {}, stationNumberByStudentId = {} }) => {
    const maxTasks = totalTasks > 0 ? totalTasks : 1;

    const columns: { head: string; key: keyof ProgressionRow }[] = [
        { head: '\u05E2\u05DE\u05D3\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4', key: 'workstation' },
        { head: '\u05E6\u05D9\u05D5\u05DF', key: 'grade' },
        { head: '\u05E7\u05E6\u05D1 \u05D4\u05EA\u05E7\u05D3\u05DE\u05D5\u05EA', key: 'progress' },
        { head: '\u05EA\u05DC\u05DE\u05D9\u05D3\u05D9\u05DD', key: 'students' },
    ];

    const data: ProgressionRow[] = studentsData.map((s) => {
        const sid = String(s.id);
        const studentProgress = progressMap[sid] ?? 1;
        const studentGrade = gradeMap[sid];
        const isCompleted = !!studentGrade;

        return {
            student: s,
            students: [s.firstName, s.lastName].filter(Boolean).join(' '),
            progress: (
                <div className="progress-cell">
                    <input
                        type="range"
                        name="student-progress"
                        id={`student-progress-${s.id}`}
                        data-step={`${maxTasks} / ${studentProgress}`}
                        className={`student-progress-bar${isCompleted ? ' completed' : ''}`}
                        min="0"
                        step="1"
                        max={maxTasks}
                        value={isCompleted ? maxTasks : studentProgress}
                        readOnly
                    />
                    <span className="student-current-task">{`${maxTasks} / ${studentProgress}`}</span>
                    {isCompleted && <span className="completed-badge">{'\u2713'}</span>}
                </div>
            ),
            grade: studentGrade ? (
                <span className={`grade-badge ${Math.round(studentGrade.grade) >= 60 ? 'passing' : 'failing'}`}>
                    {Math.round(studentGrade.grade)}%
                    <span className="grade-detail">({studentGrade.correct}/{studentGrade.total})</span>
                </span>
            ) : (
                <span className="grade-pending">{'\u2014'}</span>
            ),
            workstation: stationNumberByStudentId[sid] != null ? `עמדה ${stationNumberByStudentId[sid]}` : '',
        };
    });

    return (
        <div className="students-progression">
            <div className="students-progression--wrapper">
                {studentsData.length > 0 ? (
                    <BaseGrid columns={columns} data={data} isClickable={true} onRowClick={(row) => { setClickedStudent?.(row.student); }} />
                ) : (
                    <div className="students-progression--no-data">ממתין לכניסת התלמידים לשיעור</div>
                )}
            </div>
        </div>
    );
};

export default StudentsProgression;
