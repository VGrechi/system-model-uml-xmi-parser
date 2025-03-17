import { EventTypeEnum } from "../shared/event-type-enum";
import { PathNode } from "./path-node";

export class ErrorPathNode extends PathNode {
    eventType: EventTypeEnum;
    eventName: string;

    constructor(path: PathNode, eventType: EventTypeEnum, eventName: string) {
        super(path.portId, path.portName, path.portDirection, path.componentId, path.componentName);
        this.eventType = eventType;
        this.eventName = eventName;
    }
}