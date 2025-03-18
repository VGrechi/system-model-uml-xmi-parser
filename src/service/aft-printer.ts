import { AFTNode } from "../domain/aft/aft-node";
import { TopEvent } from "../domain/aft/top-event";
import { EventTypeEnum } from "../domain/shared/event-type-enum";

export class AFTPrinter {
    static printAFT(node: AFTNode, depth: number = 0) {
        const indent = "  ".repeat(depth); // Duas espaços por nível

        if (node.type === EventTypeEnum.ATTACK) {
            console.log(`${indent}⚠️ [ATTACK] ${node.name} in ${node.componentName}`);
        } else if (node.type === EventTypeEnum.FAULT) {
            console.log(`${indent}🔥 [FAULT] ${node.name} in ${node.componentName}`);
        } else {
            if ("inputs" in node) {
                console.log(`${indent}🔀 [${node.type}] Gate`);
                node.inputs.forEach(input => AFTPrinter.printAFT(input, depth + 1));
            }
        }
    }

    static printTopEvent = (topEvent: TopEvent) => {
        console.log('\n');
        console.log(`🚨 [TOP EVENT] ${topEvent.id}`);
        this.printAFT(topEvent.root, 1);
    };
}