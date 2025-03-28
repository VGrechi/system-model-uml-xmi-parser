import { FaultTypeEnum } from "../shared/fault-type-enum";

export interface FptcPort {
    portName: string;
    faultType: FaultTypeEnum;
}