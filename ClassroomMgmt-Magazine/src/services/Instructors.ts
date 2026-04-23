import { apiRequest } from "helpers/api.helpers";
import {Instructor} from "../models/Instructor";
import {Course} from "../models/Course"


export async function getAllInstructors(): Promise<Instructor[]> {
    return apiRequest("/api/instructors", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function getInstructorById(id: string): Promise<Instructor | null> {
    if (!id) {
        return null;
    }
    return apiRequest(`/api/instructors/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function createInstructor(newInstructor: {
    firstName: string;
    lastName: string;
    authRank?: "Low" | "Medium" | "High";
    courseIds?: string[];
}): Promise<Instructor> {
    const backendInstructor = {
        FirstName: newInstructor.firstName,
        LastName: newInstructor.lastName,
        AuthRank: newInstructor.authRank ?? "Low",
        CourseIds: newInstructor.courseIds || [],
    };

    return apiRequest<Instructor>(`/api/instructors`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendInstructor),
    });
}

