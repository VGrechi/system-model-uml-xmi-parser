
import { ErrorPathNode } from "../domain/propagation/error-path";
import { PathNode } from "../domain/propagation/path-node";
import { EventTypeEnum } from "../domain/shared/event-type-enum";
import { LinkedList, ListNode } from "../utils/linked-list";

export class ErrorPathIdentifier {

    static identifyErrorPaths(systemView: SystemView, paths: LinkedList<PathNode>[]): LinkedList<ErrorPathNode>[] {
        const { componentsMap } = systemView;

        let errorPaths: LinkedList<ErrorPathNode>[] = [];
        paths.forEach(path => {
            let currentNode = path.head;
            let remainingNodesCount = path.size;

            while (currentNode) {
                const currentComponent = componentsMap.get(currentNode.value.componentId);

                currentComponent.errorStates?.forEach(errorState => {
                    const portDirection = currentNode.value.portDirection;
                    if (errorState.attack) {
                        if (portDirection === 'in' || portDirection === 'inout') {
                            let newErrorPath = ErrorPathIdentifier.parseToErrorPath(currentNode, EventTypeEnum.ATTACK, errorState.name, remainingNodesCount);
                            errorPaths.push(newErrorPath);
                        }
                    }

                    if (errorState.internalFault) {
                        if (portDirection === 'out' || portDirection === 'inout') {
                            let newErrorPath = ErrorPathIdentifier.parseToErrorPath(currentNode, EventTypeEnum.FAULT, errorState.name, remainingNodesCount);
                            errorPaths.push(newErrorPath);
                        }
                    }
                });

                currentNode = currentNode.next;
                remainingNodesCount--;
            }
        });
        return errorPaths;
    }

    private static parseToErrorPath(currentNode: ListNode<PathNode>, originType: EventTypeEnum, originEventName: string, remainingNodes: number) {
        let newErrorPath = new LinkedList<ErrorPathNode>();
        let newHead = new ListNode<ErrorPathNode>(
            new ErrorPathNode(currentNode.value, originType, originEventName)
        );

        newErrorPath.head = newHead;
        newErrorPath.size = remainingNodes;

        let prevNode = newHead;
        let tempNode = currentNode.next;

        while (tempNode) {
            let newNode = new ListNode<ErrorPathNode>(
                new ErrorPathNode(tempNode.value, null, null)
            );

            prevNode.next = newNode;
            newNode.prev = prevNode; // Adicionando o ponteiro prev para manter a lista duplamente encadeada

            prevNode = newNode;
            tempNode = tempNode.next;
        }

        // Ao final do loop, o último nó criado será o tail
        newErrorPath.tail = prevNode;

        return newErrorPath;
    }
}