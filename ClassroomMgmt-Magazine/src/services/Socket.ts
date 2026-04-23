import { config } from "../config";
import { createHubConnection } from "../socket/sockethub";
import type { HubApi } from "../socket/sockethub";

const BASE_URL = config.apiUrl;

/** GET /api/flow/initializeNewStation – assign an available station to this device (call when training is live). */
export async function initializeNewStation(): Promise<{ id: string;[key: string]: unknown } | null> {
    const response = await fetch(`${BASE_URL}/api/flow/initializeNewStation`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    console.log('initializeNewStation | response', response);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    return data;
}

/** Legacy alias for backward compatibility. */
export const InitializeStation = initializeNewStation;

/** GET /api/flow/activeStations – list of currently active stations (order = assignment order). */
export async function getActiveStations(): Promise<{ id?: string; Id?: string; [key: string]: unknown }[] | null> {
    const response = await fetch(`${BASE_URL}/api/flow/activeStations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data?.data ?? data?.Data);
    return Array.isArray(list) ? list : null;
}

/** GET /api/students/idNumber/:idNumber – get student by personal ID. Returns null if not found. */
export async function getStudentByIdNumber(idNumber: string): Promise<{ id: string;[key: string]: unknown } | null> {
    const response = await fetch(`${BASE_URL}/api/students/idNumber/${encodeURIComponent(idNumber)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
}

let _flowHub: HubApi | null = null;

/** Return the shared Flow SignalR hub (singleton – same connection for all callers). */
export function getFlowHub(): HubApi {
    if (!_flowHub) {
        _flowHub = createHubConnection(BASE_URL);
    }
    return _flowHub;
}
