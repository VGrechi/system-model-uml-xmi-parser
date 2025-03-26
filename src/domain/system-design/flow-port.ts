import { Base } from "./base";

export interface FlowPort extends Base {
    basePort: string;
    direction: "in" | "out";
}