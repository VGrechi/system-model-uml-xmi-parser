import { writeToFile } from '../utils/txt-utils';

export class PropagationPathIdentifier {

    static paths: string[] = [];

    static identifyPropagationPath(systemView: SystemView): string[] {

        const { portsMap, connectorsArray } = systemView;

        this.paths = [];

        const inPorts = Array.from(portsMap.values())
            .filter(port => port.direction === "in")
            .filter(port => !connectorsArray.find(connector => connector.targetPortId === port.id));

        inPorts.forEach(inPort => {
            this.explorePort(systemView, inPort, []);
        });

        writeToFile("out/output.txt", this.paths);

        return this.paths;
    }

    static storePath = (path: string[]) => {
        if(path.length <= 1) return;
        this.paths.push(path.join(" - "));
    }

    static printEdge = (connector: Connector) => {
        return `- ${connector.id} -`;
    }

    static printNode = (port: Port) => {
        return `[${port.ownerComponentName}] ${port.direction.toUpperCase()} ${port.name} ${port.id}`
    }

    static findComponent = (systemView: SystemView, port: Port) => {
        const { componentsMap } = systemView;
        return componentsMap.get(port.ownerComponentId);
    }

    static findPort = (systemView: SystemView, portId: string, componentId: string) => {
        const { componentsMap, portsMap } = systemView;

        if(!componentId){
            componentsMap.forEach(component => {
                if(component.isComposite) {
                    componentId = component.id;
                }
            });

        }
        return portsMap.get(`${portId}:${componentId}`);
    }

    static explorePort = (systemView: SystemView, port: Port, currentPath: string[]) => {
        const { connectorsArray } = systemView;

        currentPath.push(this.printNode(port));
        
        if(port.direction === "in" 
            && !connectorsArray.find(connector => connector.sourcePortId === port.id)) {
            const currentComponent: Component = this.findComponent(systemView, port);

            if(!currentComponent) {
                return;
            }

            if(currentComponent.isComposite) {
                this.exploreConnectors(systemView, port, [...currentPath]);
            }

            currentComponent.ports
                .filter(p => p.direction !== "in")
                .forEach(p => this.explorePort(systemView, p, [...currentPath]));
        } else {
            this.exploreConnectors(systemView, port, [...currentPath]);
        }
    }

    static exploreConnectors = (systemView: SystemView, port: Port, currentPath: string[]) => {
        const { connectorsArray, componentsMap } = systemView;
        const sourceComponent = componentsMap.get(port.ownerComponentId);

        const connectors = connectorsArray.filter(c => c.sourcePortId === port.id
            && (sourceComponent.isComposite || c.sourceComponentId === port.ownerComponentId)
        );

        if(connectors.length === 0) {
            this.storePath(currentPath);
            return;
        }

        connectors.forEach(connector => {
            let newPath = [...currentPath, this.printEdge(connector)];
            const nextPort = this.findPort(systemView, connector.targetPortId, connector.targetComponentId);
            if (nextPort) this.explorePort(systemView, nextPort, newPath);
        })
    }
}