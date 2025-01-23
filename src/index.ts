import { readXML } from './utils/xml-utils';
import { SystemViewParser } from './service/system-view-parser';

(async () => {
    const result = await readXML('assets/Automotive HAD Vehicle.uml');
    
    let portsMap = new Map<string, Port>();
    let componentsMap = new Map<string, Class>();
    let connectorsArray = new Array<Connector>();

    SystemViewParser.parse(result, portsMap, componentsMap, connectorsArray);

    const printNode = (port: Port) => {
        console.log(`[${port.componentName}] ${port.direction.toUpperCase()} ${port.name}`);
    }

    const printEdge = (connector: Connector) => {
        console.log(`- ${connector.name} -`);
    }

    const printEndOfPath = () => {
        console.log('- - - - - - - - -\n')
    }

    const explorePort = (port: Port) => {
        printNode(port);

        //if(port.direction === "out" && !connectorsArray.find(connector => connector.source === port.id)) return;

        if(port.direction === "in" && !connectorsArray.find(connector => connector.source === port.id)) {
            const currentComponent = componentsMap.get(port.classId);

            currentComponent.ports
                .filter(p => p.direction !== "in")
                .forEach(p => explorePort(p));
        }

        exploreConnectors(port);
    }

    const exploreConnectors = (port: Port) => {
        const connectors = connectorsArray.filter(connector => connector.source === port.id);

        if(connectors.length === 0) {
            printEndOfPath();
            return;
        }

        connectors.forEach(connector => {
            printEdge(connector);
            const port = portsMap.get(connector.target);
            explorePort(port);
        })
    }

    const inPorts = Array.from(portsMap.values())
        .filter(port => port.direction === "in")
        .filter(port => !connectorsArray.find(connector => connector.target === port.id));

    inPorts.forEach(inPort => {
        printNode(inPort);
        exploreConnectors(inPort);
    });

    



    

    

    


    //console.log(portsMap);

    /*
     From FlowsAndPorts, identify in and out ports.
     Starting with in ports:
     - 
     - Identify its owner (Class name)
     - Identify target, other ownedAttribute inside Class, need to confirm if it is and out port.

     Print all connectors
     - In Port Name (Class Name)
     - Out Port Name (Class Name)

     Challenge: 
     - find all paths from frontEndData to longitudinal moviment
     - exclude paths without vulnerabilities and faults
     Result is a set of paths that form and AFT
    */
})()