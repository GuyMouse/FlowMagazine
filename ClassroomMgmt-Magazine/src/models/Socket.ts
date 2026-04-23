export interface FlowConnectionRequest {
    OwnerId: string;
    IsStation: boolean;
    StudyUnitId?: string;
    StudentIds?: string[];
    NumberOfStations?: number;
}