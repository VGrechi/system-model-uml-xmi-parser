import { BaseEvent } from "./base-event";

export interface LogicGate {
    id: string;
    type: "AND" | "OR" | "NOT" | "VOTING";
    inputs: BaseEvent[];  // Nós filhos (eventos ou outras portas)
}