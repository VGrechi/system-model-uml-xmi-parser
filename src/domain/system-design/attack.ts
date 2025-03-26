import { Base } from "./base";

export interface Attack extends Base {
    baseTransitionId: string;
    kind: string;
    severity: string;
    threat: string;
}