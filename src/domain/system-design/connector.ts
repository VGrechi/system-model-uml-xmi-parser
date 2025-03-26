import { Base } from "./base";

export interface Connector extends Base {
    sourcePortId: string;
    sourceComponentId: string;
    targetPortId: string;
    targetComponentId: string;
}