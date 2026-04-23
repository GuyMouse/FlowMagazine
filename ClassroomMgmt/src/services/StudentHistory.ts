import { EMPTY_STUDENT_HISTORY, StudentHistory } from "models/StudentHistory";
import { apiRequest } from "helpers/api.helpers";
import { StudentTrainingGrade } from "models/StudentTrainingGrade";


// get all student histories from the API
export async function getAllStudentHistories(): Promise<StudentHistory[]> {
    return apiRequest("/api/studentHistories", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function getStudentHistoryById(studentHistoryId: string): Promise<StudentHistory > {

    if (!studentHistoryId) return EMPTY_STUDENT_HISTORY;


    return await apiRequest(`/api/studentHistories/${studentHistoryId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

}

export async function getAllHistoryTrainingGrades(studentHistoryId: string): Promise<StudentTrainingGrade[]> {
    return apiRequest(`/api/studentHistories/trainingGrades`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
}