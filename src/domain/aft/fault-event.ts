import { BaseEvent } from "./base-event";

export interface FaultEvent extends BaseEvent {
    componentId?: string;  // ID do componente onde ocorre a falha
    faultType?: "Crash" | "Byzantine" | "Degraded Performance" | "Silent Failure";
}