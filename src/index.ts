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
        let component;
        componentsMap.forEach(c => {
            if(c.classDefinitionId === port.ownerClassId) {
                component = c;
            }
        });
        return component;
    }

    const explorePort = (port: Port, currentPath: string[]) => {
        currentPath.push(printNode(port));
        
        if(port.direction === "in" && !connectorsArray.find(connector => connector.sourcePortId === port.id)) {
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
        const connectors = connectorsArray.filter(connector => connector.sourcePortId === port.id);

        if(connectors.length === 0) {
            storePath(currentPath);
            return;
        }

        connectors.forEach(connector => {
            let newPath = [...currentPath, printEdge(connector)];
            const nextPort = portsMap.get(connector.targetPortId);
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

    /*
    Target: 24 paths

    TODO: Two ports without direction

    Camera OUT connectig to all VC IN ports - Check XML
    Remove frontier connections on System level
    */
    
})()