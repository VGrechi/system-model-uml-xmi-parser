import { LinkedList } from '../utils/linked-list';
import { writeToFile } from '../utils/txt-utils';
import { Path } from '../domain/propagation/path';

export class PropagationPathIdentifier {

    static systemView: SystemView;
    static paths: LinkedList<Path>[];

    static identifyPropagationPath(systemView: SystemView): LinkedList<Path>[] {

        this.systemView = systemView;
        this.paths = [];

        const { portsMap, connectorsArray } = this.systemView;

        const inPorts = Array.from(portsMap.values())
            .filter(port => port.direction === "in")
            .filter(port => !connectorsArray.find(connector => connector.targetPortId === port.id));

        inPorts.forEach(inPort => {
            this.explorePort(inPort, new LinkedList<Path>());
        });

        writeToFile("out/output.txt", this.paths.map(path => path.toString()));

        return this.paths;
    }

    static storePath = (path: LinkedList<Path>) => {
        if(path.getSize() <= 1) return;
        this.paths.push(path);
    }

    static printEdge = (connector: Connector) => {
        return `- ${connector.id} -`;
    }

    static printNode = (port: Port) => {
        const component = this.findComponent(port);
        return new Path(port.id, port.name, port.direction, component.id, component.name);
    }

    static findComponent = (port: Port) => {
        const { componentsMap } = this.systemView;
        return componentsMap.get(port.ownerComponentId);
    }

    static findPort = (portId: string, componentId: string) => {
        const { componentsMap, portsMap } = this.systemView;

        if(!componentId){
            componentsMap.forEach(component => {
                if(component.isComposite) {
                    componentId = component.id;
                }
            });

        }
        return portsMap.get(`${portId}:${componentId}`);
    }

    static explorePort = (port: Port, currentPath: LinkedList<Path>) => {
        const { connectorsArray } = this.systemView;

        currentPath.append(this.printNode(port));
        
        if(port.direction === "in" 
            && !connectorsArray.find(connector => connector.sourcePortId === port.id)) {
            const currentComponent: Component = this.findComponent(port);

            if(!currentComponent) {
                return;
            }

            if(currentComponent.isComposite) {
                this.exploreConnectors(port, currentPath.clone())
            }

            currentComponent.ports
                .filter(p => p.direction !== "in")
                .forEach(p => this.explorePort(p, currentPath.clone()));
        } else {
            this.exploreConnectors(port, currentPath.clone())
        }
    }

    static exploreConnectors = (port: Port, currentPath: LinkedList<Path>) => {
        const { connectorsArray, componentsMap } = this.systemView;
        const sourceComponent = componentsMap.get(port.ownerComponentId);

        const connectors = connectorsArray.filter(c => c.sourcePortId === port.id
            && (sourceComponent.isComposite || c.sourceComponentId === port.ownerComponentId)
        );

        if(connectors.length === 0) {
            this.storePath(currentPath);
            return;
        }

        connectors.forEach(connector => {
            const nextPort = this.findPort(connector.targetPortId, connector.targetComponentId);
            if (nextPort) this.explorePort(nextPort, currentPath.clone());
        })
    }
}