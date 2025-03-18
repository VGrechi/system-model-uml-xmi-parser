import { BaseEvent } from "../domain/aft/base-event";
import { AttackEvent } from "../domain/aft/attack-event";
import { FaultEvent } from "../domain/aft/fault-event";
import { ErrorPathNode } from "../domain/propagation/error-path";
import { EventTypeEnum } from "../domain/shared/event-type-enum";
import { LinkedList } from "../utils/linked-list";
import { LogicGate } from "../domain/aft/logic-gate";
import { TopEvent } from "../domain/aft/top-event";

export class AFTGenerator {

    static baseEvents: Map<string, BaseEvent>;
    static topEvents: Map<string, TopEvent>;

    static generate(errorPaths: LinkedList<ErrorPathNode>[]) {
        this.baseEvents = new Map<string, BaseEvent>();
        this.topEvents = new Map<string, TopEvent>();

        this.identifyEvents(errorPaths);

        let afts = [];
        this.topEvents.forEach(topEvent => {
            
            const orGate: LogicGate = {
                id: "G1",
                type: "OR",
                inputs: Array.from(this.baseEvents.values())
            };

            topEvent.root = orGate;
            afts.push(topEvent);
        });

        return afts;
    }

    static identifyEvents(errorPaths: LinkedList<ErrorPathNode>[]) {
        errorPaths.forEach(path => {
            const firstNode = path.head.value;

            if (firstNode.eventType === EventTypeEnum.ATTACK) {
                const attack: AttackEvent = {
                    id: this.getEventId(firstNode),
                    name: firstNode.eventName,
                    type: EventTypeEnum.ATTACK,
                    componentName: firstNode.componentName
                };
                this.addToMap(this.baseEvents, attack.id, attack);
            }

            if (firstNode.eventType === EventTypeEnum.FAULT) {
                const fault: FaultEvent = {
                    id: this.getEventId(firstNode),
                    name: firstNode.eventName,
                    type: EventTypeEnum.FAULT,
                    componentName: firstNode.componentName
                };
                this.addToMap(this.baseEvents, fault.id, fault);
            }

            const lastNode = path.tail.value;
            const topEvent: TopEvent = {
                id: this.getEventId(lastNode),
                name: lastNode.eventName,
                root: null
            };
            this.addToMap(this.topEvents, topEvent.id, topEvent);
        });
    }

    static getEventId(node: ErrorPathNode) {
        return `${node.componentName} ${node.portDirection} ${node.portName}`;
    }

    static addToMap(map: any, id: string, obj: any) {
        if (!map.has(id)) {
            map.set(id, obj);
        }
    }
}