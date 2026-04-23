import React from 'react';
import { Course } from '../../models/Course';
import { StudyUnit } from '../../models/ContentManagement';
import { Student } from '../../models/Student';
import BaseGrid from '../BaseGrid/BaseGrid';
import "./StationInfo.scss";
import { StatusIndicator } from "../StatusIndicator";
import { translateCourseStatus } from '../../helpers/data.helpers';

interface StationInfoProps {
    courseData: Course;
    studyUnit?: StudyUnit | null;
    clickedStudent?: Student | null;
    currentTaskIndex: number;
    allStudentsCompleted?: boolean;
    currentStationNumber?: number | null;
}

const StationInfo: React.FC<StationInfoProps> = ({ courseData, studyUnit, clickedStudent, currentTaskIndex, allStudentsCompleted, currentStationNumber }) => {
    const su = studyUnit as any;
    const id = su?.id ?? '';

    // const title = su?.title ?? '';
    // const description = su?.description ?? '';
    const tasks = su?.tasks ?? [];
    const taskRows = (tasks as any[]).map((task, i) => ({
        ...task,
        status: i === currentTaskIndex ? <StatusIndicator status='Active' /> : i < currentTaskIndex ? <StatusIndicator status='Completed' /> : <StatusIndicator status='Inactive' />
    }));
    const studentName = clickedStudent ? clickedStudent.firstName + ' ' + clickedStudent.lastName : '';
    const columns = [
        { head: 'שאלה', key: 'title' },
        // { head: 'תפקיד', key: 'role' },
        { head: 'סטטוס', key: 'status' },
    ]
    const stationStatus = allStudentsCompleted ? "Completed" : "Active";

    return (
        <div className="station-info">
            <div className="station-info--wrapper">
                <div className="station-info--header">
                    <div className="active-station">
                        <h1>{currentStationNumber != null ? `עמדה ${currentStationNumber}` : 'עמדה'}</h1>
                        <StatusIndicator status={stationStatus} />
                    </div>
                    <div className="student-info">
                        <div className="student-info--name">{studentName}</div>
                        {/* <div className="student-info--role">{courseData.students[0]?.role ? courseData.students[0]?.role : 'No Role'}</div> */}
                    </div>
                </div>
                <div className="station-info--content">
                    {tasks.length > 0 && (
                        <BaseGrid columns={columns} data={taskRows} />
                        // <div>
                        //     <h3>Tasks:</h3>
                        //     {tasks.map((task: any) => (
                        //         <div key={task?.id}>{task?.title}</div>
                        //     ))}
                        // </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StationInfo;