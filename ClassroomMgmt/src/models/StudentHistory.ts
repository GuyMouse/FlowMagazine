import { StudentTrainingGrade } from "./StudentTrainingGrade";

export interface StudentHistory {
    id: string;
    studentId: string;
    studentTrainingGradeIds: string[];
    studentTrainingGrades: StudentTrainingGrade[];
    progressionId?: string;
}
export const EMPTY_STUDENT_HISTORY: StudentHistory = {
    id: "",
    studentId: "",
    studentTrainingGradeIds: [],
    progressionId: "",
    studentTrainingGrades: [],
    
}