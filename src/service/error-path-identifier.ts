
import { ErrorPathNode } from "../domain/propagation/error-path";
import { FptcPort } from "../domain/propagation/fptc-port";
import { FptcPortMapping } from "../domain/propagation/fptc-port-mapping";
import { PathNode } from "../domain/propagation/path-node";
import { EventTypeEnum } from "../domain/shared/event-type-enum";
import { getFaultTypeEnum } from "../domain/shared/fault-type-enum";
import { Component } from "../domain/system-design";
import { SystemView } from "../dto/system-view";
import { LinkedList, ListNode } from "../utils/linked-list";

export class ErrorPathIdentifier {

    static identifyErrorPaths(systemView: SystemView, paths: LinkedList<PathNode>[]): LinkedList<ErrorPathNode>[] {
        const { componentsMap } = systemView;

        let errorPaths: LinkedList<ErrorPathNode>[] = this.identifyFailureModes(paths, componentsMap);

        errorPaths = this.filterBasedOnFPTCExpresions(errorPaths, componentsMap);

        return errorPaths;
    }

    private static identifyFailureModes(paths: LinkedList<PathNode>[], componentsMap: Map<string, Component>) {
        let errorPaths: LinkedList<ErrorPathNode>[] = [];
        paths.forEach(path => {
            let currentNode = path.head;
            let remainingNodesCount = path.size;

            while (currentNode) {
                const currentComponent = componentsMap.get(currentNode.value.componentId);

                const currentPort = currentComponent.ports.find(port => port.id === currentNode.value.portId);

                
                if (currentPort.failureMode && currentPort.failureModeCause) {
                    let firstNode = currentNode;
                    if(currentPort.failureModeCause === EventTypeEnum.ATTACK
                        && currentPort.direction === 'out') {
                        firstNode = currentNode.prev;
                    }
                    let newErrorPath = ErrorPathIdentifier.parseToErrorPath(
                        firstNode,
                        currentPort.failureModeCause,
                        `${currentPort.name}.${currentPort.failureMode}`,
                        remainingNodesCount
                    );
                    errorPaths.push(newErrorPath);
                }

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

    private static filterBasedOnFPTCExpresions(errorPaths: LinkedList<ErrorPathNode>[], componentsMap: Map<string, Component>) {
        errorPaths = errorPaths.filter(errorPath => {
            let currentNode = errorPath.tail;

            while (currentNode) {
                const currentComponent = componentsMap.get(currentNode.value.componentId);
        
                if (!currentComponent.isComposite && currentComponent.fptcExpression) {
                    const fptcPortMapping = this.parseFptcExpression(currentComponent.fptcExpression);

                    if(currentNode.value.portDirection === 'out' &&
                        currentNode.value.portName.toLowerCase() !== fptcPortMapping.output.portName) {
                        return false;
                    }

                    if(currentNode.prev){
                        const prevPortName = currentNode.prev.value.portName.toLowerCase();
                        const prevComponentPortName = `${currentNode.prev.value.componentName}${prevPortName}`.toLowerCase();
                        if(!fptcPortMapping.inputs.find(i => i.portName === prevPortName || i.portName === prevComponentPortName)) {
                            return false;
                        }
                    }
                }
        
                currentNode = currentNode.prev; // Avança para o nó anterior
            }
            return true;
        });
        return errorPaths;
    }

    static parseFptcExpression(expression: string): FptcPortMapping | null {
        const regex = /^([\w.,\s]+)\s*>\s*(\w+)\.(\w+)$/;
        const match = expression.match(regex);
      
        if (!match) {
          console.error("Expressão inválida");
          return null;
        }
      
        const [_, inputPart, outputPort, outputFault] = match;
      
        // Processa múltiplos inputs separados por vírgula
        const inputList = inputPart.split(",").map((input) => {
          const trimmedInput = input.trim();
          const inputMatch = trimmedInput.match(/^(\w+)\.(\w+)$/);

          if (!inputMatch) return null;

          const [, portName, faultType] = inputMatch;
          return { 
            portName: portName.toLowerCase(), 
            faultType: getFaultTypeEnum(faultType) 
        };
        }).filter(Boolean) as FptcPort[]; // Remove valores nulos
      
        if (inputList.length === 0) {
          console.error("Nenhum input válido encontrado");
          return null;
        }
      
        return {
          inputs: inputList,
          output: { portName: outputPort.toLowerCase(), faultType: getFaultTypeEnum(outputFault) },
        };
      }
}