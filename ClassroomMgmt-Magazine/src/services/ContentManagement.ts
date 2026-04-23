import { apiRequest } from "helpers/api.helpers";
import { Subject, Lesson, TaskBase, SelectionQuestion, TaskType, StudyUnit } from "../models/ContentManagement";

// Subjects API
export async function getAllSubjects(): Promise<Subject[]> {
    const subjects = await apiRequest<any[]>("/api/subjects", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Normalize the data: handle PascalCase from backend and convert task objects to IDs
    return subjects.map(subject => {
        // Handle both camelCase and PascalCase property names
        const subjectId = subject.id || subject.Id;
        const subjectTitle = subject.title || subject.Title;
        const subjectDescription = subject.description || subject.Description;
        const lessons = subject.lessons || subject.Lessons || [];

        return {
            id: String(subjectId || ''),
            title: subjectTitle || '',
            description: subjectDescription || undefined,
            lessons: lessons.map((lesson: any) => {
                // Handle both camelCase and PascalCase property names
                const lessonId = lesson.id || lesson.Id;
                const lessonTitle = lesson.title || lesson.Title;
                const lessonDescription = lesson.description || lesson.Description;
                const lessonSubjectId = lesson.subjectId || lesson.SubjectId;
                const tasks = lesson.tasks || lesson.Tasks || [];

                // Convert task objects to string IDs
                const taskIds: string[] = tasks.map((task: any) => {
                    if (typeof task === 'string') {
                        return task;
                    }
                    // Task is an object, extract the ID
                    const taskId = task.id || task.Id;
                    return String(taskId);
                }).filter((id: string) => id !== ''); // Remove empty IDs

                // taskDetails: full task objects so tree and question editor have prompt, options, correctIndex
                const taskDetails = tasks
                    .filter((task: any) => typeof task !== 'string')
                    .map((task: any) => {
                        const taskType = (task.type || task.Type || task["$type"] || "").replace("ClassroomServer.Models.ContentManagement.", "") as TaskType;
                        const base: TaskBase = {
                            id: String(task.id),
                            title: task.title,
                            lessonId: String(lessonId),
                            type: taskType
                        };
                        if (taskType === "SelectionQuestion") {
                            return {
                                ...base,
                                prompt: task.prompt,
                                options: task.options,
                                correctIndex: task.correctIndex !== undefined ? task.correctIndex : (task.CorrectIndex !== undefined ? task.CorrectIndex : 0)
                            } as SelectionQuestion;
                        }
                        return base;
                    })
                    .filter((t: any) => t.id !== '');

                return {
                    id: String(lessonId),
                    title: lessonTitle,
                    description: lessonDescription || undefined,
                    subjectId: String(lessonSubjectId),
                    tasks: taskIds,
                    taskDetails: taskDetails
                };
            })
        };
    });
}

export async function createSubject(title: string, description?: string): Promise<Subject> {
    const backendSubject = {
        Title: title,
        Description: description || null
    };
    const response = await apiRequest<any>(`/api/subjects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendSubject),
    });

    // Normalize response
    return {
        id: String(response.id),
        title: response.title,
        description: response.description || undefined,
        lessons: (response.lessons).map((lesson: any) => ({
            id: String(lesson.id),
            title: lesson.title,
            description: lesson.description || undefined,
            subjectId: String(lesson.subjectId),
            tasks: (lesson.tasks).map((task: any) =>
                String(task.id)).filter((id: string) => id !== '')
        }))
    };
}

export async function updateSubject(id: string, title: string, description?: string): Promise<Subject | null> {
    const backendSubject = {
        Title: title,
        Description: description || null
    };
    const response = await apiRequest<any>(`/api/subjects/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendSubject),
    });

    if (!response) return null;

    // Normalize response
    return {
        id: String(response.id),
        title: response.title,
        description: response.description || undefined,
        lessons: (response.lessons).map((lesson: any) => ({
            id: String(lesson.id),
            title: lesson.title,
            description: lesson.description || undefined,
            subjectId: String(lesson.subjectId),
            tasks: (lesson.tasks).map((task: any) =>
                String(task.id || task.Id || '')
            ).filter((id: string) => id !== '')
        }))
    };
}

export async function deleteSubject(id: string): Promise<boolean> {
    try {
        await apiRequest(`/api/subjects/${id}`, {
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

export async function getSubjectById(id: string): Promise<Subject | null> {
    try {
        const subject = await apiRequest<any>(`/api/subjects/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!subject) return null;
        return {
            id: String(subject.id),
            title: subject.title,
            description: subject.description || undefined,
            lessons: (subject.lessons).map((lesson: any) => ({
                id: String(lesson.id),
                title: lesson.title,
                description: lesson.description || undefined,
                subjectId: String(lesson.subjectId),
                tasks: (lesson.tasks).map((task: any) =>
                    String(task.id || task.Id || '')

                ).filter((id: string) => id !== '')
            }))
        };
    } catch {
        return null;
    }
}
// Lessons API
export async function getAllLessons(): Promise<Lesson[]> {
    const lessons = await apiRequest<any[]>("/api/lessons", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return lessons.map((lesson: any) => {
        const lessonId = lesson.id;
        const lessonTitle = lesson.title;
        const lessonDescription = lesson.description || undefined;
        const lessonSubjectId = lesson.subjectId;
        const tasks = lesson.tasks;

        // Convert task objects to string IDs
        const taskIds: string[] = tasks.map((task: any) => {
            if (typeof task === 'string') {
                return task;
            }
            // Task is an object, extract the ID
            const taskId = task.id || task.Id;
            return String(taskId || '');
        }).filter((id: string) => id !== ''); // Remove empty IDs

        return {
            id: String(lessonId),
            title: lessonTitle,
            description: lessonDescription || undefined,
            subjectId: String(lessonSubjectId),
            tasks: taskIds
        };
    });
}

export async function createLesson(title: string, subjectId: string, description?: string): Promise<Lesson> {
    const backendLesson = {
        Title: title,
        Description: description || null,
        SubjectId: subjectId
    };
    const response = await apiRequest<any>(`/api/lessons`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendLesson),
    });

    // Normalize response
    const tasks = response.tasks || response.Tasks || [];
    const taskIds: string[] = tasks.map((task: any) => {
        if (typeof task === 'string') {
            return task;
        }
        return String(task.id);
    }).filter((id: string) => id !== '');

    return {
        id: String(response.id),
        title: response.title,
        description: response.description || undefined,
        subjectId: String(response.subjectId),
        tasks: taskIds
    };
}

export async function updateLesson(id: string, title: string, subjectId: string, description?: string): Promise<Lesson | null> {
    const backendLesson = {
        Title: title,
        Description: description || null,
        SubjectId: subjectId
    };
    const response = await apiRequest<any>(`/api/lessons/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendLesson),
    });

    if (!response) return null;

    // Normalize response
    const tasks = response.tasks;
    const taskIds: string[] = tasks.map((task: any) => {
        if (typeof task === 'string') {
            return task;
        }
        return String(task.id);
    }).filter((id: string) => id !== '');

    return {
        id: String(response.id),
        title: response.title,
        description: response.description || undefined,
        subjectId: String(response.subjectId),
        tasks: taskIds
    };
}

export async function deleteLesson(id: string): Promise<boolean> {
    try {
        await apiRequest(`/api/lessons/${id}`, {
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

export async function getLessonById(id: string): Promise<Lesson | null> {
    try {
        const lesson = await apiRequest<any>(`/api/lessons/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!lesson) return null;
        const tasks = lesson.tasks || lesson.Tasks || [];
        const taskIds: string[] = tasks.map((task: any) => {
            if (typeof task === 'string') {
                return task;
            }
            return String(task.id || task.Id || '');
        }).filter((id: string) => id !== '');
        return {
            id: String(lesson.id),
            title: lesson.title,
            description: lesson.description || undefined,
            subjectId: String(lesson.subjectId),
            tasks: taskIds
        };
    }
    catch {
        return null;
    }
}

// Tasks API (SelectionQuestion/OpenQuestion)
export async function createSelectionQuestion(
    title: string,
    lessonId: string,
    prompt: string,
    options: string[],
    correctIndex: number
): Promise<SelectionQuestion> {
    const request = {
        Title: title,
        Type: "SelectionQuestion" as TaskType,
        LessonId: lessonId,
        Data: {
            Prompt: prompt,
            Options: options,
            CorrectIndex: correctIndex
        }
    };
    const raw = await apiRequest<any>(`/api/allTasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });
    const data = raw?.data;
    return {
        id: raw?.id,
        title: raw?.title,
        lessonId: raw?.lessonId,
        type: "SelectionQuestion" as TaskType,
        prompt: data?.prompt,
        options: data?.options,
        correctIndex: data?.correctIndex,
    } as SelectionQuestion;
}
export async function getAllTasks(): Promise<TaskBase[]> {
    try {
        const tasks = await apiRequest<any[]>("/api/allTasks", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!tasks || !Array.isArray(tasks)) return [];

        return tasks.map(task => {
            // SAFE CHECK: Ensure type exists before calling replace
            const rawType = task?.type || task?.Type || task?.["$type"] || "";
            const sanitizedType = rawType.replace("ClassroomServer.Models.ContentManagement.", "") as TaskType;

            const base: TaskBase = {
                id: String(task?.id || task?.Id || ''),
                title: task?.title || task?.Title || 'משימה ללא שם',
                lessonId: String(task?.lessonId || task?.LessonId || ''),
                type: sanitizedType
            };

            if (sanitizedType === "SelectionQuestion") {
                return {
                    ...base,
                    prompt: task?.prompt || task?.Prompt || "",
                    options: task?.options || task?.Options || [],
                    correctIndex: task?.correctIndex ?? task?.CorrectIndex ?? 0
                } as SelectionQuestion;
            }
            return base;
        });
    } catch (error) {
        console.error("Error in getAllTasks:", error);
        return []; // Return empty array instead of crashing
    }
}
export async function getTaskById(id: string): Promise<TaskBase | null> {
    try {
        const task = await apiRequest<any>(`/api/allTasks/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!task) return null;
        const base: TaskBase = {
            id: task.id,
            title: task.title,
            lessonId: task.lessonId,

            type: (task.type || task.Type || task["$type"] || "").replace("ClassroomServer.Models.ContentManagement.", "")
        };
        if (base.type === "SelectionQuestion") {
            return {
                ...base,
                prompt: task.prompt,
                options: task.options,
                correctIndex: task.correctIndex !== undefined ? task.correctIndex : 0
            } as SelectionQuestion;
        }
        return base;
    } catch {
        return null;
    }
}

export async function deleteTask(id: string): Promise<boolean> {
    try {
        await apiRequest(`/api/allTasks/${id}`, {
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
export async function updateSelectionQuestion(
    id: string,
    title: string,
    lessonId: string,
    prompt: string,
    options: string[],
    correctIndex: number
): Promise<SelectionQuestion | null> {
    const request = {
        Id: id,
        Title: title,
        Type: "SelectionQuestion" as TaskType,
        LessonId: lessonId,
        Data: {
            Prompt: prompt,
            Options: options,
            CorrectIndex: correctIndex
        }
    };
    const raw = await apiRequest<any>(`/api/allTasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        }, body: JSON.stringify(request),
    });
    if (!raw) return null;
    const data = raw?.data;
    return {
        id: raw?.id,
        title: raw?.title,
        lessonId: raw?.lessonId,
        type: "SelectionQuestion" as TaskType,
        prompt: data?.prompt,
        options: data?.options,
        correctIndex: data?.correctIndex,
    } as SelectionQuestion;
}
// StudyUnit API =>>> done by or 
// Updated StudyUnit API Service

/////////// need to add types for diffrent types of TASKS !!!!!!!!!!!//////
export async function getStudyUnitById(id: string): Promise<StudyUnit | null> {
    try {
        const response = await apiRequest<any>(`/api/studyUnits/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response) return null;

        const studyUnit: StudyUnit = {
            id: String(response.id || response.Id || id),
            title: response.title || response.Title || '',
            description: response.description || response.Description || undefined,
            taskIds: (response.taskIds || response.TaskIds || []).map((tid: any) => String(tid)),

            // New fields mapping
            course: response.course || response.Course || undefined,
            courseId: String(response.courseId || response.CourseId || ''),
            trainingId: response.trainingId || response.TrainingId ? String(response.trainingId || response.TrainingId) : undefined,

            tasks: (response.tasks || response.Tasks || []).map((task: any) => {
                const base: TaskBase = {
                    id: String(task.id || task.Id || ''),
                    title: task.title || task.Title || '',
                    lessonId: String(task.lessonId || task.LessonId || ''),
                    type: (task.type || task.Type || task["$type"] || "").replace("ClassroomServer.Models.ContentManagement.", "") as TaskType
                };

                if (base.type === "SelectionQuestion") {
                    return {
                        ...base,
                        prompt: task.prompt || task.Prompt || "",
                        options: task.options || task.Options || [],
                        correctIndex: task.correctIndex !== undefined ? task.correctIndex : (task.CorrectIndex !== undefined ? task.CorrectIndex : 0)
                    } as SelectionQuestion;
                }
                return base;
            })
        };

        return studyUnit;
    } catch (error) {
        console.error(`Failed to fetch StudyUnit with ID ${id}:`, error);
        return null;
    }
}

export async function createStudyUnit(
    title: string,
    description?: string,
    tasks?: string[],
    courseId?: string,
    trainingId?: string
): Promise<StudyUnit> {

    const backendStudyUnit: Record<string, unknown> = {
        Title: title,
        Description: description || null,
        TaskIds: tasks,
    };

    if (courseId) backendStudyUnit.CourseId = courseId;
    if (trainingId) backendStudyUnit.TrainingId = trainingId;

    return apiRequest<StudyUnit>(`/api/studyUnits`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendStudyUnit),
    });
}
export async function getAllStudyUnits(): Promise<StudyUnit[]> {
    const [studyUnits, allTasks] = await Promise.all([
        apiRequest<any[]>("/api/studyUnits", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }),
        getAllTasks()
    ]);

    return studyUnits.map((unit: any) => {
        const unitId = unit.id || unit.Id;
        const taskIds = unit.taskIds || unit.TaskIds || [];
        const backendTasks = unit.tasks || unit.Tasks || [];

        const normalizedTaskIds: string[] = taskIds.map((id: any) => String(id || '')).filter((id: string) => id !== '');

        let tasks: TaskBase[] = [];
        if (backendTasks.length > 0) {
            tasks = backendTasks.map((task: any) => {
                // Safe access to type here as well
                const rawType = task.type || task.Type || task["$type"] || "";

                const base: TaskBase = {
                    id: String(task.id || task.Id || ''),
                    title: task.title || task.Title || '',
                    lessonId: String(task.lessonId || task.LessonId || ''),
                    type: rawType.replace("ClassroomServer.Models.ContentManagement.", "") as TaskType
                };

                if (base.type === "SelectionQuestion") {
                    return {
                        ...base,
                        prompt: task.prompt || task.Prompt || "",
                        options: task.options || task.Options || [],
                        correctIndex: task.correctIndex !== undefined ? task.correctIndex : (task.CorrectIndex !== undefined ? task.CorrectIndex : 0)
                    } as SelectionQuestion;
                }
                return base;
            });
        } else if (normalizedTaskIds.length > 0 && allTasks.length > 0) {
            const taskIdsSet = new Set(normalizedTaskIds.map(String));
            tasks = allTasks.filter((task: any) => taskIdsSet.has(String(task.id)));
        }

        return {
            id: String(unitId),
            title: unit.title || unit.Title || '',
            description: unit.description || unit.Description || undefined,
            taskIds: normalizedTaskIds,
            tasks: tasks,
            course: unit.course || unit.Course || undefined,
            courseId: String(unit.courseId || unit.CourseId || ''),
            trainingId: unit.trainingId || unit.TrainingId ? String(unit.trainingId || unit.TrainingId) : undefined
        };
    });
}

export async function updateStudyUnit(
    id: string,
    title: string,
    tasks?: string[],
    description?: string,
    courseId?: string,
    trainingId?: string
): Promise<StudyUnit | null> {
    const backendStudyUnit = {
        Id: id,
        Title: title,
        Description: description || null,
        TaskIds: tasks,
        CourseId: courseId,
        TrainingId: trainingId
    };

    return apiRequest<StudyUnit>(`/api/studyUnits/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(backendStudyUnit),
    });
}

export async function deleteStudyUnit(id: string): Promise<boolean> {
    try {
        await apiRequest(`/api/studyUnits/${id}`, {
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

