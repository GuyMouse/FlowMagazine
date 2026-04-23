import { Course } from "models";
import { apiRequest } from "helpers/api.helpers";

export async function getAllCourses(): Promise<Course[]> {
    return apiRequest("/api/courses", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function editCourse(
    id: string | undefined,
    updatedCourse: Partial<Course>
): Promise<Course | null> {
    if (!id || !updatedCourse) {
        return null;
    }

    const backendCourse: any = {
        Name: updatedCourse.name ?? null,
        Status: updatedCourse.status ?? null,
        Location: updatedCourse.location ?? null,
        StudyUnitIds: updatedCourse.studyUnitIds ?? null,
        TrainingIds: updatedCourse.trainingIds ?? null,
        InstructorId: updatedCourse.instructorId ?? null,
        StudentIds: updatedCourse.studentIds ?? null,
    };

    return apiRequest(`/api/courses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendCourse),
    });
}
export async function createCourse(
    newCourse: Pick<Course, "name" & "status" & "instructor" & "instructorId" & "students" & "studyUnitIds"  & "trainingIds" >
): Promise<Course | null>{
 return apiRequest<Course>(`/api/courses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newCourse) 
 });
}

// export async function createCourse(
//     newCourse: Pick<Course, "name" | "status" | "studyUnitIds" | "location"> & { instructorId?: string | null; studentIds?: string[] }
// ): Promise<Course | null> {

//     return apiRequest<Course>(`/api/courses`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newCourse),
//     });
// }

export async function getCourseById(
    id: string | undefined
): Promise<Course | null> {
    if (!id) {
        return null;
    }
    return apiRequest(`/api/courses/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function deleteCourse(
    id: string
): Promise<Course | null> {
    if (!id) {
        return null;
    }
    return apiRequest(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
}