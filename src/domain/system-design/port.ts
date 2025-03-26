import { EventTypeEnum } from "../shared/event-type-enum";

export interface Port extends Base {
    ownerClassId: string;
    ownerClassName: string;
    ownerComponentId: string;
    ownerComponentName: string;
    direction: "in" | "out" | "inout";
    failureMode?: "comission" | "omission" | "valueCoarse";
    failureModeCause?: EventTypeEnum.ATTACK | EventTypeEnum.FAULT;
}