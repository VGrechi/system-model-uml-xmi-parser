import { Base } from "./base";
import { Behavior } from "./behavior";
import { Connector } from "./connector";
import { Port } from "./port";
import { Property } from "./property";

export interface Class extends Base {
    properties: Property[];
    ports: Port[];
    connectors: Connector[];
    behaviors: Behavior[];
}
