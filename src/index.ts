import { writeToFile } from './utils/txt-utils';
import { readXML } from './utils/xml-utils';
import { SystemViewParser } from './service/system-view-parser';

(async () => {
    const result = await readXML('assets/Automotive HAD Vehicle.uml');

    const { portsMap, componentsMap, connectorsArray } = SystemViewParser.parse(result);

    componentsMap.forEach(component => {
        console.log(`Component: ${component.id} ${component.name}`);
    });

    let paths: string[] = [];

    const storePath = (path: string[]) => {
        if(path.length <= 1) return;
        paths.push(path.join(" - "));
    }

    const printEdge = (connector: Connector) => {
        return `- ${connector.id} -`;
    }

    const printNode = (port: Port) => {
        return `[${port.ownerComponentName}] ${port.direction.toUpperCase()} ${port.name} ${port.id}`
    }

    const findComponent = (port: Port) => {
        return componentsMap.get(port.ownerComponentId);
    }

    const findPort = (portId: string, componentId: string) => {
        if(!componentId){
            componentsMap.forEach(component => {
                if(component.isComposite) {
                    componentId = component.id;
                }
            });

        }
        return portsMap.get(`${portId}:${componentId}`);
    }

    const explorePort = (port: Port, currentPath: string[]) => {
        currentPath.push(printNode(port));
        
        if(port.direction === "in" 
            && !connectorsArray.find(connector => connector.sourcePortId === port.id)) {
            const currentComponent: Component = findComponent(port);

            if(!currentComponent) {
                return;
            }

            if(currentComponent.isComposite) {
                exploreConnectors(port, [...currentPath]);
            }

            currentComponent.ports
                .filter(p => p.direction !== "in")
                .forEach(p => explorePort(p, [...currentPath]));
        } else {
            exploreConnectors(port, [...currentPath]);
        }
    }

    const exploreConnectors = (port: Port, currentPath: string[]) => {
        const sourceComponent = componentsMap.get(port.ownerComponentId);

        const connectors = connectorsArray.filter(c => c.sourcePortId === port.id
            && (sourceComponent.isComposite || c.sourceComponentId === port.ownerComponentId)
        );

        if(connectors.length === 0) {
            storePath(currentPath);
            return;
        }

        connectors.forEach(connector => {
            let newPath = [...currentPath, printEdge(connector)];
            const nextPort = findPort(connector.targetPortId, connector.targetComponentId);
            if (nextPort) explorePort(nextPort, newPath);
        })
    }

    const inPorts = Array.from(portsMap.values())
        .filter(port => port.direction === "in")
        .filter(port => !connectorsArray.find(connector => connector.targetPortId === port.id));

    inPorts.forEach(inPort => {
        explorePort(inPort, []);
    });

    writeToFile("out/output.txt", paths);
    
})()