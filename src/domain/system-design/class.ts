import { Port } from "./port";

export interface Class extends Base {
    properties: Property[];
    ports: Port[];
    connectors: Connector[];
    behaviors: Behavior[];
}
