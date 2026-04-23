# הסבר שינויי קוד – תיקון שגיאת CourseId (Guid)

## הבעיה

בעת יצירת StudyUnit מתוך דף עריכת קורס (או קורס חדש), הבקשה לשרת נכשלת עם השגיאה:

```
400 - "$.CourseId": "The JSON value could not be converted to System.Guid"
```

### שורש הבעיה

1. **המודל בבקאנד** מגדיר את `Course.Id` כ-`Guid` (מחרוזת בפורמט `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
2. **המודל בפרונט** הגדיר את `Course.id` כ-`number` עם ברירת מחדל `0`.
3. כאשר נוצר StudyUnit, הפרונט שולח `CourseId: "0"` לשרת – וזה **לא Guid תקין**, מה שגורם לשגיאת deserialization.

---

## קבצים ששונו

### 1. `ClassroomMgmt/src/models/Course.ts`

**מה שונה:** שינוי הטיפוס של `id` מ-`number` ל-`string`.

**למה:** הבקאנד מחזיר Guid (מחרוזת) כ-ID של קורס. הטיפוס `number` לא תואם ויצר ברירת מחדל `0` שהיא לא Guid תקין.

| לפני | אחרי |
|-------|-------|
| `id: number` | `id: string` |
| `id: 0` (ב-NEW_COURSE_TEMPLATE) | `id: ""` (ב-NEW_COURSE_TEMPLATE) |

---

### 2. `ClassroomMgmt/src/pages/AddCoursePage/tabs/StudyContentTab.tsx`

**מה שונה:** הוספת בדיקה פשוטה לפני יצירת StudyUnit – בודק שלקורס יש ID (לא ריק).

**למה:** כשהמשתמש יוצר קורס חדש ועובר ללשונית "תכנים לימודיים" לפני שמירה, ה-ID עדיין ריק. בלי בדיקה, הבקשה נשלחת עם ID ריק ונכשלת.

**מה נוסף:**
- בדיקה ב-`handleSelect` (הוספת תכנים חדשים) – אם אין ID לקורס, מוצגת הודעה "יש לשמור את הקורס לפני הוספת תכנים לימודיים".
- בדיקה בלחצן השכפול (copy) של StudyUnit – אם אין ID לקורס, מוצגת הודעה "יש לשמור את הקורס לפני שכפול תכנים".

---

### 3. `ClassroomMgmt/src/pages/EditCoursePage/EditCoursePage.tsx`

**מה שונה:** תיקון שורת טעינת ה-ID של הקורס כך שתתמוך גם ב-PascalCase.

**למה:** הAPI עלול להחזיר את השדה כ-`id` (camelCase) או כ-`Id` (PascalCase). קודם לכן רק `c.id` נבדק, אז אם הAPI החזיר `Id`, הערך היה `undefined` ונפל לברירת מחדל ריקה.

| לפני | אחרי |
|-------|-------|
| `id: c.id ?? ""` | `id: c.id ?? c.Id ?? ""` |

---

### 4. `ClassroomMgmt/src/redux/CourseSlice.ts`

**מה שונה:** עדכון טיפוסים ב-Redux store להתאמה.

**למה:** ה-Redux slice השתמש בטיפוסים ישנים (`id: number`, `studyUnitIds?: number[]`) שלא תאמו את מה שהבקאנד מחזיר (Guid = string). עודכן לעקביות.

| שדה | לפני | אחרי |
|------|-------|-------|
| `id` | `number` | `string` |
| `studyUnitIds` | `number[]` | `string[]` |
| `id` (initialState) | `0` | `""` |
| `deleteStudyUnit` payload | `PayloadAction<number>` | `PayloadAction<string>` |

---

## תרשים זרימה של הבעיה והפתרון

```
[משתמש יוצר קורס חדש]
        ↓
[id = "" (ריק, לא Guid)]
        ↓
[עובר ללשונית "תכנים לימודיים"]
        ↓
[לוחץ "הוספת תכנים"]
        ↓
    ┌─────────────────────────┐
    │ בדיקה: יש ID לקורס?   │  ← חדש!
    └─────────────────────────┘
        ↓ אין ID                 ↓ יש ID
   [הודעה: "יש לשמור          [POST /api/studyUnits
    את הקורס קודם"]              עם CourseId תקין]
                                     ↓
                              [StudyUnit נוצר בהצלחה]
```

---

# שינויים נוספים – חיבור SignalR למדריך + שמות דינמיים בדף סטודנט

## בעיה 1: "No Students Data Available" בדף המדריך

### שורש הבעיה

דף `RunningLesson` (צד מדריך) הציג "No Students Data Available" כי:
1. הוא הסתמך על `course.students` מה-API – אבל הקורס לא הכיל סטודנטים רשומים.
2. סטודנטים מתחברים **דינמית** דרך WebSocket, אבל לדף לא היה חיבור SignalR לשמוע על חיבורים חדשים.
3. החיבור SignalR שנוצר ב-`StudyContentTab` (דף עריכת הקורס) ננטש כשהדף ניווט ל-`RunningLesson`.

### הפתרון

---

### 5. `ClassroomMgmt/src/pages/RunningLesson/RunningLesson.tsx`

**מה שונה:** הוספת חיבור SignalR עצמאי לדף + מעקב דינמי אחרי סטודנטים שמתחברים.

**למה:** כדי שהמדריך יראה סטודנטים שמתחברים לעמדות בזמן אמת, ולא רק סטודנטים שרשומים מראש בקורס.

**מה נוסף:**
- `connectedStudents` state – מערך סטודנטים שמתעדכן בזמן אמת.
- `useEffect` חדש שיוצר חיבור SignalR (`getFlowHub`) ומאזין ל-`trainingConnectionRegistered`.
- כשסטודנט מתחבר, מגיע `payload` עם `Station` → מתוכו נשלף `StudentIds` → עבור כל ID מתבצע fetch של פרטי הסטודנט (`getStudentById`).
- הסטודנט מתווסף ל-`connectedStudents` (בלי כפילויות).
- קומפוננטת `StudentsProgression` מקבלת `connectedStudents` במקום `course.students`.
- ניקוי חיבור SignalR ב-`useEffect` cleanup.

**זרימה:**
```
[סטודנט מתחבר לעמדה]
        ↓
[Backend שולח TrainingConnectionRegistered למדריך]
        ↓
[RunningLesson מאזין ← מקבל Station עם StudentIds]
        ↓
[קורא ל-getStudentById לכל ID]
        ↓
[מעדכן connectedStudents ← מוצג בטבלה]
```

---

## בעיה 2: שמות mock בדף האימון של הסטודנט

### שורש הבעיה

דף `TrainingPage` הציג שמות קבועים ("קורס תותחן מתנייע", "שיעור 1: מבוא לתותחנות") במקום השמות האמיתיים של הקורס והשיעור.

### הפתרון

---

### 6. `ClassroomMgmt/src/pages/TrainingPage/TrainingPage.tsx`

**מה שונה:** הדף מביא את שמות הקורס והשיעור מהAPI לפי ה-`studyUnitId` שמגיע עם ה-Station.

**למה:** כדי שהסטודנט יראה את השמות האמיתיים של הקורס והשיעור שהוא נמצא בהם.

**מה נוסף:**
- קריאת `station` מ-`location.state` (מועבר מ-`StudentLogin` בניווט).
- State חדש: `courseName` ו-`lessonName`.
- `useEffect` חדש שקורא ל-API:
  1. שולף את ה-`studyUnitId` מה-Station.
  2. קורא ל-`GET /api/studyUnits/{id}` כדי לקבל את שם השיעור (`title`) ואת ה-`courseId`.
  3. קורא ל-`getCourseById(courseId)` כדי לקבל את שם הקורס.
- הכותרות בדף הוחלפו מ-mock לערכים דינמיים:

| לפני | אחרי |
|-------|-------|
| `"קורס תותחן מתנייע"` | `{courseName \|\| "קורס"}` |
| `"שיעור 1: מבוא לתותחנות"` | `{lessonName \|\| "שיעור"}` |

---

# תיקון חיבור SignalR – Singleton Hub

## בעיה: סטודנטים לא מופיעים אצל המדריך אחרי התחברות

### שורש הבעיה

`getFlowHub()` יצר **חיבור WebSocket חדש בכל קריאה**. זה גרם ל:

1. **המדריך** – `StudyContentTab` יצר חיבור A ונרשם כמדריך בבקאנד. אחרי ניווט ל-`RunningLesson`, נוצר חיבור B (חדש). הבקאנד עדיין שמר את חיבור A כמדריך → חיבור B לא קיבל הודעות על סטודנטים שמתחברים.
2. **הסטודנט** – `StudentLogin` יצר חיבור ושלח `RegisterTrainingConnection`. ה-callback ניווט ל-`TrainingPage` → `StudentLogin` נהרס → ה-cleanup הריץ `hub.stop()` → סגר את החיבור באמצע הפעולה → שגיאת "Invocation canceled due to the underlying connection being closed".

### הפתרון

---

### 7. `ClassroomMgmt/src/services/Socket.ts`

**מה שונה:** `getFlowHub()` הפך ל-**singleton** – מחזיר את אותו חיבור בכל קריאה.

**למה:** כדי שכל הקומפוננטות (StudyContentTab → RunningLesson, StudentLogin → TrainingPage) ישתמשו באותו חיבור WebSocket. ככה:
- הבקאנד מזהה את אותו `ConnectionId` לאורך כל ה-session.
- המדריך ב-RunningLesson מקבל הודעות על סטודנטים כי הוא על אותו חיבור שנרשם כמדריך.

| לפני | אחרי |
|-------|-------|
| כל קריאה ל-`getFlowHub()` יוצרת חיבור חדש | חיבור אחד משותף (singleton) |

---

### 8. `ClassroomMgmt/src/pages/StudentLogin/StudentLogin.tsx`

**מה שונה:** הוסר `hub.stop()` מה-`useEffect` cleanup.

**למה:** כשסטודנט מתחבר ומנווט ל-`TrainingPage`, הקומפוננטה `StudentLogin` נהרסת. הcleanup היה סוגר את חיבור ה-WebSocket באמצע פעולת ההתחברות. עכשיו החיבור נשאר חי ויכול לשמש את `TrainingPage`.

| לפני | אחרי |
|-------|-------|
| `hubRef.current?.stop?.().catch(() => {});` | (הוסר) |

---

### 9. `ClassroomMgmt/src/pages/RunningLesson/RunningLesson.tsx`

**מה שונה:** הוסר `hub.stop()` מה-`useEffect` cleanup.

**למה:** אותו חיבור singleton משמש גם את `StudyContentTab` וגם את `RunningLesson`. אם נסגור אותו ב-cleanup, הבקאנד יאבד את הרישום של המדריך. עכשיו `hub.start()` פשוט מזהה שהחיבור כבר פעיל ולא עושה כלום (no-op), וה-listener מתחיל לקבל הודעות על אותו חיבור.

| לפני | אחרי |
|-------|-------|
| `hubRef.current?.stop?.().catch(() => {});` | (הוסר) |

---

## תרשים זרימה אחרי התיקון

```
[המדריך לוחץ "הרץ" ב-StudyContentTab]
        ↓
[getFlowHub() → יוצר חיבור (singleton)]
        ↓
[registerTrainingConnection → בקאנד שומר InstructorConnection]
        ↓
[ניווט ל-RunningLesson]
        ↓
[getFlowHub() → מחזיר את אותו חיבור!]
        ↓
[hub.start() → כבר מחובר (no-op)]
        ↓
[מאזין ל-trainingConnectionRegistered על אותו חיבור]
        ↓                              
[סטודנט מתחבר]
        ↓
[בקאנד שולח TrainingConnectionRegistered ← מגיע ל-RunningLesson!]
        ↓
[המדריך רואה את הסטודנט בטבלה]
```

---

# מעקב התקדמות בזמן אמת (Progress Tracking)

## בעיה: ה-progress bar לא מתקדם כשהסטודנט עונה על שאלות

### שורש הבעיה

1. **`TrainingPage`** (צד סטודנט) – כשהסטודנט בוחר תשובה, `handleAnswerSelect` רק עדכן state מקומי. **לא נשלחה שום הודעה לשרת** דרך SignalR.
2. **`RunningLesson`** (צד מדריך) – לא היה listener ל-`answerSubmissionAccepted`. גם אם הבקאנד היה שולח עדכון, אף אחד לא שמע.
3. **`StudentsProgression`** – ה-progress bar היה hardcoded ל-20 שאלות עם `defaultValue={0}`, ושינוי ידני בלבד.

### הפתרון

---

### 10. `ClassroomMgmt/src/pages/TrainingPage/TrainingPage.tsx`

**מה שונה:** כשהסטודנט עונה על שאלה, נשלחת הודעת `submitAnswer` לשרת דרך SignalR.

**למה:** הבקאנד צריך לדעת שהסטודנט ענה כדי לקדם את ה-Station ולשלוח עדכון למדריך.

**מה נוסף:**
- import של `getFlowHub` מ-`services/Socket`.
- בתוך `handleAnswerSelect`: אחרי עדכון ה-state המקומי, שליפת `stationId` מ-`station` (מגיע מ-`location.state`), ושליחת `hub.submitAnswer(stationId, { AnswerIndex })`.
- ה-`AnswerIndex` הוא מיקום התשובה במערך ה-options (בהתאם למה שהבקאנד מצפה ב-`FlowAnswerSelectionQuestion`).

---

### 11. `ClassroomMgmt/src/pages/RunningLesson/RunningLesson.tsx`

**מה שונה:** הוספת listener ל-`answerSubmissionAccepted` + state למעקב progress.

**למה:** כדי שהמדריך יראה בזמן אמת את ההתקדמות של כל סטודנט.

**מה נוסף:**
- `progressMap` state – מילון `{ studentId: מספר_שאלות_שנענו }`.
- `totalTasks` state – סך כל המשימות (נשלף מ-`Station.TrainingTaskIds.length`).
- listener ל-`answerSubmissionAccepted` בתוך ה-SignalR useEffect:
  - מקבל `Station` מהpayload.
  - שולף `CurrentTaskIndex` (=כמה שאלות הסטודנט ענה) ו-`TrainingTaskIds` (=סך השאלות).
  - מעדכן את `progressMap` ו-`totalTasks`.
- מעביר `progressMap` ו-`totalTasks` כ-props ל-`StudentsProgression`.

---

### 12. `ClassroomMgmt/src/components/StudentsProgression/StudentsProgression.tsx`

**מה שונה:** הקומפוננטה מקבלת progress אמיתי מבחוץ במקום ערכים hardcoded.

**למה:** כדי שה-progress bar ישקף את ההתקדמות בפועל של כל סטודנט.

**מה שונה בפירוט:**
- props חדשים: `progressMap?: { [studentId: string]: number }`, `totalTasks?: number`.
- הוסר `questionsCount = 20` (hardcoded) → `maxTasks` מחושב מ-`totalTasks`.
- הוסר `useState(currentStep)` ו-`handleProgressChange` (ידני) → `value={studentProgress}` (מ-`progressMap`) + `readOnly`.
- כל סטודנט מציג progress לפי ה-ID שלו מתוך `progressMap`.

| לפני | אחרי |
|-------|-------|
| `max={20}` (hardcoded) | `max={maxTasks}` (דינמי מהשרת) |
| `defaultValue={0}` + `onChange` (ידני) | `value={studentProgress}` + `readOnly` (מהשרת) |

---

## תרשים זרימה – Progress

```
[סטודנט עונה על שאלה ב-TrainingPage]
        ↓
[hub.submitAnswer(stationId, { AnswerIndex })]
        ↓
[בקאנד: FlowHub.SubmitAnswer → FlowService.OnAnswerSubmitted]
        ↓
[בקאנד מקדם Station.CurrentTaskIndex]
        ↓
[בקאנד שולח AnswerSubmissionAccepted לסטודנט + למדריך]
        ↓                                    ↓
[סטודנט: מקבל שאלה הבאה]    [מדריך: RunningLesson מאזין]
                                             ↓
                              [מעדכן progressMap[studentId]]
                                             ↓
                              [StudentsProgression: bar מתקדם]
```

---

# תיקון באגים ב-Progress Bar (קצב התקדמות)

## בעיה 1: Counter מציג 4/3 כשיש רק 3 שאלות

### שורש הבעיה

בקוד של `answerSubmissionAccepted` ב-`RunningLesson.tsx`, הערך נקבע כ-`currentIdx + 1`. אבל הבקאנד כבר מקדם את `CurrentTaskIndex` לשאלה **הבאה** אחרי כל תשובה:
- אחרי Q1: `CurrentTaskIndex = 1` (הבקאנד כבר קידם ל-Q2) → הקוד הציג `1 + 1 = 2`
- אחרי Q2: `CurrentTaskIndex = 2` → הקוד הציג `2 + 1 = 3`
- אחרי Q3 (אחרונה): `CurrentTaskIndex = 3` (= מספר השאלות) → הקוד הציג `3 + 1 = 4`

כלומר ה-`+1` הוסיף שאלה מיותרת כי `CurrentTaskIndex` כבר מייצג כמה שאלות הושלמו.

### הפתרון

**קובץ:** `ClassroomMgmt/src/pages/RunningLesson/RunningLesson.tsx`

| לפני | אחרי |
|-------|-------|
| `next[String(sid)] = currentIdx + 1;` | `next[String(sid)] = currentIdx;` |

---

## בעיה 2: ה-bar ויזואלית לא זז (נשאר מלא מההתחלה)

### שורש הבעיה

`totalTasks` (ה-max של ה-bar) נגזר מ-`station.TrainingTaskIds.length`. אבל הבקאנד בונה את `TrainingTaskIds` **בהדרגה** – מוסיף רשומה אחת לכל תשובה. כך:

- אחרי Q1: `TrainingTaskIds = [task0, task1]`, `CurrentTaskIndex = 1` → max=2, value=2 → **100%**
- אחרי Q2: `TrainingTaskIds = [task0, task1, task2]`, `CurrentTaskIndex = 2` → max=3, value=3 → **100%**

ה-max וה-value גדלו ביחד, אז ה-bar תמיד נשאר מלא.

### הפתרון

`totalTasks` עכשיו נגזר מ-`studyUnit.taskIds.length` (ה-StudyUnit שכבר טעון בדף) – זהו המספר האמיתי של כלל השאלות, ולא מהרשומות ההדרגתיות בpayload.

**קובץ:** `ClassroomMgmt/src/pages/RunningLesson/RunningLesson.tsx`

**מה שונה:**
- הוסר `setTotalTasks(taskIds.length)` מתוך ה-`answerSubmissionAccepted` listener (כי זה נתון שגדל בהדרגה).
- נוסף `useEffect` חדש שמגדיר `totalTasks` כש-`studyUnit` נטען:

```typescript
useEffect(() => {
    if (studyUnit) {
        const count = studyUnit.taskIds?.length ?? studyUnit.tasks?.length ?? 0;
        if (count > 0) setTotalTasks(count);
    }
}, [studyUnit]);
```

**תוצאה:**
- ה-max של ה-bar נקבע פעם אחת לפי מספר השאלות האמיתי (למשל 3).
- ה-value עולה בהדרגה (0 → 1 → 2 → 3) ככל שהסטודנט עונה.
- ה-counter מציג נכון: `1/3`, `2/3`, `3/3`.

| לפני | אחרי |
|-------|-------|
| `totalTasks` מ-`TrainingTaskIds.length` (גדל עם כל תשובה) | `totalTasks` מ-`studyUnit.taskIds.length` (קבוע) |
| bar תמיד 100% | bar מתקדם מ-0% ל-100% |
| counter: `2/2`, `3/3`, `4/3` | counter: `1/3`, `2/3`, `3/3` |

---

## Training Completion + Grading (No Backend Changes)

### Overview
Added training completion detection, client-side grade calculation, and real-time grade display on the instructor's RunningLesson page. All done using existing backend data without any C# changes.

### Files Changed

#### 1. TrainingPage.tsx (Student Side)
**What was already in place:**
- 	rainingCompleted and grade state variables
- nswerSubmissionAccepted listener that detects TrainingCompleted: true from the backend
- Grade calculation inside setUserAnswers functional update (compares each selected answer index against correctIndex)

**What was added:**
- **Completion screen UI** - When 	rainingCompleted is true, the questions view is replaced with a results screen showing:
  - A checkmark icon and ! (Training completed) heading
  - Grade percentage (e.g., 67%)
  - Correct count (e.g., 2 correct out of 3)
  - Per-question summary with green/red indicators for correct/incorrect answers

**How grading works (student side):**
Each DisplayQuestion stores correctIndex from the backend SelectionQuestion.CorrectIndex. The answer ID format is {taskId}-opt-{index}, so the selected answer's index is extracted via nswers.findIndex() and compared to correctIndex.

#### 2. RunningLesson.tsx (Instructor Side)
**What was already in place:**
- calculateStationGrade() utility function
- StudentGrade interface ({ correct, total, grade })
- gradeMap state

**What was added:**
- The nswerSubmissionAccepted handler now checks TrainingCompleted flag
- When a station completes, extracts station.TrainingTaskIds from the payload
- Calls calculateStationGrade(taskIds) which fetches each training task via GET /api/trainingTasks/{id}
- The backend's GetTrainingTaskByIdAsync populates both Task (with CorrectIndex) and Answer (with AnswerIndex)
- Compares AnswerIndex === CorrectIndex for each task to calculate the grade
- Stores the result in gradeMap keyed by student ID
- Passes gradeMap to StudentsProgression

**Key insight:** The existing GET /api/trainingTasks/{id} endpoint already returns both the original task data and the student's answer data, making grade calculation possible without backend changes.

#### 3. StudentsProgression.tsx (Instructor Display)
**What changed:**
- Added gradeMap prop (type: { [studentId: string]: StudentGrade })
- Added a new Grade column to the grid
- When a student has a grade: shows a colored badge (green >= 60%, red < 60%) with percentage and fraction (e.g., 67% (2/3))
- When no grade yet: shows a dash (--)
- Progress bar shows full (green) when training is completed for that student
- Added a checkmark badge next to completed progress bars

#### 4. StudentsProgression.scss
- Added styles for .progress-cell, .completed-badge, .grade-badge (with .passing/.failing variants), .grade-detail, and .grade-pending

### Data Flow
`
Student answers last question
    -> submitAnswer() via SignalR
    -> Backend processes, sets TrainingCompleted=true
    -> Backend sends AnswerSubmissionAccepted to both student and instructor

Student (TrainingPage):
    -> Detects TrainingCompleted=true
    -> Calculates grade locally from questions[].correctIndex vs userAnswers
    -> Shows completion screen with grade

Instructor (RunningLesson):
    -> Detects TrainingCompleted=true in payload
    -> Extracts station.TrainingTaskIds
    -> Fetches each training task via REST (GET /api/trainingTasks/{id})
    -> Each response includes Task.CorrectIndex + Answer.AnswerIndex
    -> Calculates grade and stores in gradeMap
    -> StudentsProgression renders grade column
`
