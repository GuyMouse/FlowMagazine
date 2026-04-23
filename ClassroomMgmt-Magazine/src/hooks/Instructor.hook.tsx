// import React, {
//     createContext,
//     FC,
//     ReactNode,
//     useCallback,
//     useContext,
//     useEffect,
//     useState,
// } from "react";
// import { getAllInstructors, createInstructor } from "services/Instructors";
// import {Instructor} from "../models/Instructor"
// /** Display name for the global "head instructor" entity (מדריך ראשי) */
// export const MAIN_INSTRUCTOR_DISPLAY_NAME = "מדריך ראשי";

// /** First name stored in backend for main instructor */
// const MAIN_INSTRUCTOR_FIRST_NAME = "מדריך";
// /** Last name stored in backend for main instructor */
// const MAIN_INSTRUCTOR_LAST_NAME = "ראשי";

// export interface InstructorContextType {
//     /** The global head instructor (מדריך ראשי). Fetched/created on app load. */
//     mainInstructor: Instructor | null;
//     /** All instructors from the API. Can be extended later (e.g. filters, pagination). */
//     allInstructors: Instructor[] | null;
//     loading: boolean;
//     error: Error | null;
//     /** Refetch all instructors; returns the list (or [] on error). */
//     fetchInstructors: () => Promise<Instructor[]>;
//     /** Ensure main instructor exists (find or create). Called automatically on mount; can be called again to refresh. */
//     ensureMainInstructor: () => Promise<void>;
// }

// const defaultInstructorContext: InstructorContextType = {
//     mainInstructor: null,
//     allInstructors: null,
//     loading: true,
//     error: null,
//     fetchInstructors: async () => [],
//     ensureMainInstructor: async () => { },
// };

// const InstructorContext = createContext<InstructorContextType>(defaultInstructorContext);

// interface InstructorProviderProps {
//     children?: ReactNode;
// }
//  const InstructorProvider:React.FC=()=>  {
//     const [mainInstructor, setMainInstructor] = useState<Instructor | null>(null);
//     const [allInstructors, setAllInstructors] = useState<Instructor[] | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<Error | null>(null);

//     const fetchInstructors = useCallback(async () => {
//         try {
//             setError(null);
//             const list = await getAllInstructors();
//             setAllInstructors(list);
//             return list;
//         } catch (err) {
//             const e = err instanceof Error ? err : new Error("Failed to fetch instructors");
//             setError(e);
//             setAllInstructors(null);
//             return [];
//         }
//     }, []);

//     const ensureMainInstructor = useCallback(async () => {
//         try {
//             const instructors = await fetchInstructors();
//             const main = instructors.find((inst) => {
//                 const firstName = (inst as { firstName?: string; FirstName?: string }).firstName
//                     ?? (inst as { firstName?: string; FirstName?: string }).FirstName ?? "";
//                 const lastName = (inst as { lastName?: string; LastName?: string }).lastName
//                     ?? (inst as { lastName?: string; LastName?: string }).LastName ?? "";
//                 return (
//                     (firstName === MAIN_INSTRUCTOR_FIRST_NAME && lastName === MAIN_INSTRUCTOR_LAST_NAME) ||
//                     `${firstName} ${lastName}` === MAIN_INSTRUCTOR_DISPLAY_NAME ||
//                     firstName === MAIN_INSTRUCTOR_DISPLAY_NAME
//                 );
//             });

//             if (main) {
//                 setMainInstructor(main);
//                 return;
//             }

//             const created = await createInstructor({
//                 firstName: MAIN_INSTRUCTOR_FIRST_NAME,
//                 lastName: MAIN_INSTRUCTOR_LAST_NAME,
//                 courses: [],
//                 courseIds: [],
//             });
//             const id = (created as { id?: string; Id?: string }).id ?? (created as { id?: string; Id?: string }).Id;
//             setMainInstructor({ ...created, id: id ?? "" });
//             setAllInstructors((prev) => (prev ? [...prev, { ...created, id: id ?? "" }] : [{ ...created, id: id ?? "" }]));
//         } catch (err) {
//             console.error("Error finding/creating main instructor:", err);
//             setMainInstructor(null);
//         } finally {
//             setLoading(false);
//         }
//     }, [fetchInstructors]);

//     useEffect(() => {
//         ensureMainInstructor();
//     }, [ensureMainInstructor]);

//     return (
//         <InstructorContext.Provider
//             value={{
//                 mainInstructor,
//                 allInstructors,
//                 loading,
//                 error,
//                 fetchInstructors,
//                 ensureMainInstructor,
//             }}
//         >
//             {children}
//         </InstructorContext.Provider>
//     );
// };

// export const useInstructor = (): InstructorContextType => {
//     const context = useContext(InstructorContext);
//     if (context === undefined) {
//         throw new Error("useInstructor must be used within an InstructorProvider");
//     }
//     return context;
// };

export default {};
