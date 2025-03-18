import { AttackEvent } from "./attack-event";
import { FaultEvent } from "./fault-event";
import { LogicGate } from "./logic-gate";

export type AFTNode = AttackEvent | FaultEvent | LogicGate;