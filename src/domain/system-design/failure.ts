import { Base } from "./base";

export interface Failure extends Base {
    baseTransitionId: string;
    mode: string;
}