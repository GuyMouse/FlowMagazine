import { Student } from "models/Student";
import { apiRequest } from "helpers/api.helpers";
import { EMPTY_STUDENT_HISTORY, StudentHistory } from "models/StudentHistory";

// get all students from the API
export async function getAllStudents(): Promise<Student[]> {
    return apiRequest("/api/students", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// get a single student by their ID
export async function getStudentById(
    id: string | undefined
): Promise<Student | null> {
    if (!id) {
        return null;
    }
    return apiRequest(`/api/students/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// create a new student (id is required by the database)
export async function createStudent(
    newStudent: Student
): Promise<Student | null> {
    if (!newStudent) {
        return null;
    }

    // Convert frontend Student format to backend Student format (PascalCase)
    // Backend requires: FirstName, LastName, StudentId (required)
    const backendStudent = {
        FirstName: newStudent.firstName,
        LastName: newStudent.lastName,
        StudentId: newStudent.id 
    };

    // Validate that StudentId is provided (required by backend)
    if (!backendStudent.StudentId) {
        throw new Error("StudentId is required");
    }

    return apiRequest<Student>("/api/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendStudent),
    });
}

// delete a student by ID
export async function deleteStudent(id: string): Promise<boolean> {
    if (!id) return false;
    try {
        await apiRequest(`/api/students/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        return true;
    } catch {
        return false;
    }
}
export async function getStudentHistoryByStudentId(studentId: string): Promise<StudentHistory > {
    if (!studentId) {
        return EMPTY_STUDENT_HISTORY;
    }
    return apiRequest(`/api/studentHistories/student/${studentId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

}