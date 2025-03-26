import { EventTypeEnum } from "../shared/event-type-enum";
import { FaultTypeEnum } from "../shared/fault-type-enum";
import { Base } from "./base";

export interface Port extends Base {
    ownerClassId: string;
    ownerClassName: string;
    ownerComponentId: string;
    ownerComponentName: string;
    direction: "in" | "out" | "inout";
    failureMode?: FaultTypeEnum;
    failureModeCause?: EventTypeEnum.ATTACK | EventTypeEnum.FAULT;
}