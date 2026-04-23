export interface Station {
    id: string;
    studentIds: string[];
    trainingId: string;
    studyUnitId: string;
    stationName: string;
    trainingTaskIds: string[];
    currentTaskIndex: number;
}
