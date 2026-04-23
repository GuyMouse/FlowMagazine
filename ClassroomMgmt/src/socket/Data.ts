
// -------------------------------------------------------------------------------------------------------

const COURSE = {
    "name": "course_000",
    "status": "Pending",
    "location": "Room 101"
};

const INSTRUCTOR = {
    "firstName": "Jeho",
    "lastName": "Va",
    "authRank": "Low"
};

const STUDENT = {
    "firstName": "Jeho",
    "lastName": "Va",
    "studentId": "222"
};

const STUDENT2 = {
    "firstName": "Cookie",
    "lastName": "Shmerkler",
    "studentId": "333"
};

const SUBJECT = {
    "title": "Subject_00",
    "description": "first subject dummy description!!!!!!"
};

const LESSON = {
    "title": "Lesson_01",
    "description": "This Lesson is about KAKI",
};

const TASK = {
    "title": "Task 01 Selection Question",
    "type": "SelectionQuestion",
    "data": {
        "prompt": "You need to choose the right answer for:",
        "options": ["OPT1", "OPT2", "OPT3", "OPT4"],
        "correctIndex": 1
    }
};

const TASK2 = {
    "title": "Task 02 Selection Question",
    "type": "SelectionQuestion",
    "data": {
        "prompt": "What is the hallmark of prophet muhammed ?",
        "options": ["Rape", "Murder", "Slavery", "All of the above"],
        "correctIndex": 3
    }
};

const STUDY_UNIT = {
    "title": "Curriculum 1239"
    // "taskIds": ["7093359e-9df2-4d2e-82dd-00bf4796c250"],
    // "courseId": "fe324fa3-fb37-4379-92d7-072ab4345ca2"
};

export async function createData() {
    const course = await fetch(`http://localhost:5000/api/courses/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(COURSE),
    });
    let Course = await course.json();

    const instructor = await fetch(`http://localhost:5000/api/instructors/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(INSTRUCTOR),
    });
    const Instructor = await instructor.json();

    const student = await fetch(`http://localhost:5000/api/students/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(STUDENT),
    });
    const Student = await student.json();

    const student2 = await fetch(`http://localhost:5000/api/students/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(STUDENT2),
    });
    const Student2 = await student2.json();

    const subject = await fetch(`http://localhost:5000/api/subjects/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(SUBJECT),
    });
    const Subject = await subject.json();

    const lesson = await fetch(`http://localhost:5000/api/lessons/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...LESSON, subjectId: Subject.id }),
    });
    const Lesson = await lesson.json();

    const task = await fetch(`http://localhost:5000/api/allTasks/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...TASK, lessonId: Lesson.id }),
    });
    const Task = await task.json();

    const task2 = await fetch(`http://localhost:5000/api/allTasks/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...TASK2, lessonId: Lesson.id }),
    });
    const Task2 = await task2.json();

    const studyUnit = await fetch(`http://localhost:5000/api/studyUnits/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...STUDY_UNIT, courseId: Course.id, taskIds: [Task.id, Task2.id] }),
    });

    Course = await getCourseData(Course.id);

    const updatedCourse = await fetch(`http://localhost:5000/api/courses/${Course.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...Course, instructorId: Instructor.id, studentIds: [Student.id, Student2.id] }),
    });

    return await getCourseData(Course.id);
}

export async function getCourseData(courseId: string) {
    const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    const data = await response.json();
    console.log('data was created', data)

    return data;
}

// `docker-compose -f docker-compose.Dev.yml build --no-cache`
// `docker-compose -f docker-compose.Dev.yml up`
// `docker-compose -f docker-compose.Dev.yml down -v`