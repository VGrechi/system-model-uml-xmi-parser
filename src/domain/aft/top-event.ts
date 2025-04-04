import { LogicGate } from "./logic-gate";

export interface TopEvent {
    id: string;
    name: string;
    description?: string;
    root?: LogicGate; // Root logic gate of the tree
}