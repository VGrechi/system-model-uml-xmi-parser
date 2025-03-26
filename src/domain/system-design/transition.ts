import { Base } from "./base";

export interface Transition extends Base {
    sourceId: string;
    targetId: string;
}