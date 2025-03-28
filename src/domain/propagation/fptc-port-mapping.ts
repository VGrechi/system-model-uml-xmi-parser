import { FptcPort } from "./fptc-port";

export interface FptcPortMapping {
    inputs: FptcPort[];
    output: FptcPort;
}