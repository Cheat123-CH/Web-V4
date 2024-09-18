export interface DashboardResponse {
    statatic: StataticData;
    message: string;
}
export interface StataticData {
    totalDocuments: number;
    totalDocumentsToday: number;
    totalDocumentsStatusDraft: number;
    totalDocumentsStatusCompleted: number;
    totalDocumentsStatusCopy: number;
}
