
import { ErrorPath } from "../domain/propagation/error-path";
import { Path } from "../domain/propagation/path";
import { LinkedList, ListNode } from "../utils/linked-list";

export class ErrorPathIdentifier {

    static identifyErrorPaths(systemView: SystemView, paths: LinkedList<Path>[]): LinkedList<Path>[] {
        const { componentsMap } = systemView;

        let errorPaths: LinkedList<Path>[] = [];
        paths.forEach(path => {
            let currentNode = path.head;
            let remainingNodesCount = path.size;

            while (currentNode) {
                const currentComponent = componentsMap.get(currentNode.value.componentId);
                if(currentComponent.errorStates?.length > 0) {
                    // TODO
                    // Identify if ErrorState is attack or fault
                    // If it is fault and currentNode is an input port, jump to the next node
                    // If it is attack and currentNode is an output port, THE CODE IS BROKEN
                    let newErrorPath = ErrorPathIdentifier.parseToErrorPath(currentNode, remainingNodesCount);
                    errorPaths.push(newErrorPath);
                    break;
                }
                
                currentNode = currentNode.next;
                remainingNodesCount--;
            }
        });
        return errorPaths;
    }

    private static parseToErrorPath(currentNode: ListNode<Path>, remainingNodes: number) {
        let newErrorPath = new LinkedList<ErrorPath>();
        let newHead = new ListNode<ErrorPath>(
            new ErrorPath(currentNode.value, 'fault', 'Detected Error') // Example origin type and event name
        );
        newErrorPath.head = newHead;
        newErrorPath.size = remainingNodes;

        // Copy remaining nodes
        let prevNode = newHead;
        let tempNode = currentNode.next;
        while (tempNode) {
            let newNode = new ListNode<ErrorPath>(
                new ErrorPath(tempNode.value, null, null)
            );
            prevNode.next = newNode;
            prevNode = newNode;
            tempNode = tempNode.next;
        }
        return newErrorPath;
    }
}