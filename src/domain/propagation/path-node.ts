export class PathNode {
    portId: string;
    portName: string;
    portDirection: "in" | "out" | "inout";
    componentId: string;
    componentName: string;

    constructor(portId: string, portName: string, portDirection: "in" | "out" | "inout", componentId: string, componentName: string) {
        this.portId = portId;
        this.portName = portName;
        this.portDirection = portDirection;
        this.componentId = componentId;
        this.componentName = componentName;
    }

    toString(hideIds: boolean = true): string {
        if(hideIds) {
            return `${this.portName} ${this.portDirection.toUpperCase()} [${this.componentName}]`;
        } else {
            return `${this.portName} ${this.portDirection.toUpperCase()} (${this.portId.substring(0,4)}) [${this.componentName} (${this.componentId.substring(0,4)})]`;
        }
    }
}