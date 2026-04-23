export interface StudentTrainingGrade {
    id: string;
    studentHistoryId: string;
    trainingId: string;
    grade: number;
}
export const EMPTY_STUDENT_TRAINING_GRADE: StudentTrainingGrade = {
    id: "",
    studentHistoryId: "",
    trainingId: "",
    grade: 0,
}
