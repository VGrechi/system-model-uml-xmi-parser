import { Path } from "./path";

export class ErrorPath extends Path {
    originType: 'attack' | 'fault';
    originEventName: string;

    constructor(path: Path, originType: 'attack' | 'fault', originEventName: string) {
        super(path.portId, path.portName, path.portDirection, path.componentId, path.componentName);
        this.originType = originType;
        this.originEventName = originEventName;
    }
}