import * as signalR from "@microsoft/signalr";
import { FlowConnectionRequest } from "../models/Socket";

export type HubApi = {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    registerTrainingConnection: (request: FlowConnectionRequest) => Promise<void>;
    trainingConnectionRegistered: (cb: (response: any) => void) => () => void;
    answerSubmissionAccepted: (cb: (response: any) => void) => () => void;
    submitAnswer: (stationId: string, answer: any) => Promise<void>;
    connectionRejected: (cb: (response: any) => void) => () => void;
    answerSubmissionRejected: (cb: (response: any) => void) => () => void;
    // Added functions
    jumpToTask: (stationId: string, taskIndex: number) => Promise<void>;
    submitTraining: (stationId: string) => Promise<void>;
    finishTraining: () => Promise<void>;
};

export function createHubConnection(baseUrl: string): HubApi {
    const connectionOptions: signalR.IHttpConnectionOptions = {};

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/flowHub`, connectionOptions)
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.onreconnecting((err) => console.log("SignalR reconnecting", err));
    connection.onreconnected((id) => console.log("SignalR reconnected", id));
    connection.onclose((err) => console.log("SignalR closed", err));

    return {
        start: async () => {
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                await connection.start();
            }
        },
        stop: async () => {
            await connection.stop();
        },
        registerTrainingConnection: async (request: FlowConnectionRequest) => {
            await connection.invoke("RegisterTrainingConnection", request);
        },
        trainingConnectionRegistered: (cb) => {
            connection.on("trainingconnectionregistered", cb);
            return () => connection.off("trainingconnectionregistered", cb);
        },
        answerSubmissionAccepted: (cb) => {
            connection.on("answersubmissionaccepted", cb);
            return () => connection.off("answersubmissionaccepted", cb);
        },
        connectionRejected: (cb) => {
            connection.on("connectionrejected", cb);
            return () => connection.off("connectionrejected", cb);
        },
        submitAnswer: async (stationId: string, answer: any) => {
            await connection.invoke("SubmitAnswer", stationId, answer);
        },
        answerSubmissionRejected: (cb) => {
            connection.on("answersubmissionrejected", cb);
            return () => connection.off("answersubmissionrejected", cb);
        },
        // Implementation of new functions
        jumpToTask: async (stationId: string, taskIndex: number) => {
            await connection.invoke("JumpToTask", stationId, taskIndex);
        },
        submitTraining: async (stationId: string) => {
            await connection.invoke("SubmitTraining", stationId);
        },
        finishTraining: async () => {
            await connection.invoke("FinishTraining");
        }
    };
}