import { writeToFile } from './utils/txt-utils';
import { readXML } from './utils/xml-utils';
import { SystemViewParser } from './service/system-view-parser';

(async () => {
    const result = await readXML('assets/Automotive HAD Vehicle.uml');
    
    let portsMap = new Map<string, Port>();
    let componentsMap = new Map<string, Class>();
    let connectorsArray = new Array<Connector>();

    SystemViewParser.parse(result, portsMap, componentsMap, connectorsArray);

    let paths: string[] = [];

    const storePath = (path: string[]) => {
        if(path.length <= 1) return;
        paths.push(path.join(" - "));
    }

    const printEdge = (connector: Connector) => {
        return `- ${connector.name} -`;
    }

    const printNode = (port: Port) => {
        return `[${port.componentName}] ${port.direction.toUpperCase()} ${port.name}`
    }

    const explorePort = (port: Port, currentPath: string[]) => {
        currentPath.push(printNode(port));
        
        if(port.direction === "in" && !connectorsArray.find(connector => connector.source === port.id)) {
            const currentComponent = componentsMap.get(port.classId);

            currentComponent.ports
                .filter(p => p.direction !== "in")
                .forEach(p => explorePort(p, [...currentPath]));
        } else {
            exploreConnectors(port, [...currentPath]);
        }
    }

    const exploreConnectors = (port: Port, currentPath: string[]) => {
        const connectors = connectorsArray.filter(connector => connector.source === port.id);

        if(connectors.length === 0) {
            storePath(currentPath);
            return;
        }

        connectors.forEach(connector => {
            let newPath = [...currentPath, printEdge(connector)];
            const nextPort = portsMap.get(connector.target);
            if (nextPort) explorePort(nextPort, newPath);
        })
    }

    const inPorts = Array.from(portsMap.values())
        .filter(port => port.direction === "in")
        .filter(port => !connectorsArray.find(connector => connector.target === port.id));

    inPorts.forEach(inPort => {
        explorePort(inPort, []);
    });

    writeToFile("out/output.txt", paths);

    /*
    Target: 24 paths

    Camera OUT connectig to all VC IN ports
    */
    
})()