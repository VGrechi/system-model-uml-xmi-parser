export class SystemViewParser {

    static buildBase(pe: any): Base {
        return {
            id: pe['$']['xmi:id'],
            name: pe['$'].name,
            umlType: pe['$']['xmi:type'],
        };
    }

    static parse(xml: any): SystemView {

        let portsMap = new Map<string, Port>();
        let componentsMap = new Map<string, Component>();
        let connectorsArray = new Array<Connector>();

        const xmi = xml['xmi:XMI'];

        const flowsAndPorts = this.parseFlowsAndPorts(xmi);

        this.parseModelSystemView(xmi, flowsAndPorts, portsMap, componentsMap, connectorsArray);

        this.sanitizeComponents(componentsMap, connectorsArray);

        return {
            portsMap,
            componentsMap,
            connectorsArray
        }        
        
    }

    static parseFlowsAndPorts(xmi){
        const flowPorts: FlowPort[] = xmi['PortAndFlows:FlowPort'].map(fp => {
            return {
                id: fp['$']['xmi:id'],
                direction: fp['$']['direction'],
                basePort: fp['$']['base_Port'],
            }
        });

        return flowPorts;
    }

    static parseModelSystemView(xmi, 
        flowsAndPorts: FlowPort[], 
        portsMap: Map<string, Port>,  
        componentsMap: Map<string, Component>,
        connectorsArray: Array<Connector>){

        const modelSystemView = xmi['uml:Model'][0].packagedElement.filter(pe => pe['$'].name === 'modelSystemView')[0];

        const classesMap: Map<string, Class> = modelSystemView.packagedElement
            .filter(pe => pe['$']['xmi:type'] === 'uml:Class')
            .map(pe => {
                let c: Class = <Class> this.buildBase(pe);

                c.properties = pe.ownedAttribute
                    .filter(oa => oa['$']['xmi:type'] === 'uml:Property')
                    .map(oa => {
                        let p: Property = <Property> this.buildBase(oa);
                        p.classDefinitionId = oa['$']['type'];
                        return p;
                    });

                c.ports = pe.ownedAttribute
                    .filter(oa => oa['$']['xmi:type'] === 'uml:Port')
                    .map(oa => {
                        let p: Port = <Port> this.buildBase(oa);
                        p.ownerClassId = c.id;
                        p.ownerClassName = c.name;

                        p.direction = flowsAndPorts.find(fp => fp.basePort === p.id)?.direction || "inout";

                        portsMap.set(p.id, p);
                        return p;
                    });

                c.connectors = pe.ownedConnector?.
                    filter(oc => oc['$']['xmi:type'] === 'uml:Connector')
                    .map(oc => {
                        const c: Connector = <Connector> this.buildBase(oc);

                        const ends = [];
                        oc.end?.filter(ce => ce['$']['xmi:type'] === 'uml:ConnectorEnd')
                        .map(ce => {
                            ends.push(ce['$'])
                        });

                        c.sourcePortId = ends[0]['role'];
                        c.sourceComponentId = ends[0]['partWithPort'];
                        c.targetPortId = ends[1]['role'];
                        c.targetComponentId = ends[1]['partWithPort'];

                        connectorsArray.push(c);
                        return c;
                    });

                return c;
            }).reduce((acc, c) => {
                acc.set(c.id, c);
                return acc;
            }, new Map<string, Class>());

        // for each entry in classesMap, create a component and set into componentsMap.
        // If the component has a property, and the property type is a class, then mark component as master.
        classesMap.forEach((c, classId) => {

            if(c.properties.length > 0){
                let c1: Component = {
                    ...c,
                    id: classId,
                    classDefinitionId: classId,
                    name: c.name,
                    isComposite: true
                };

                c.properties.forEach(p => {
                    const clazz: Class = classesMap.get(p.classDefinitionId);
                    let c2: Component = {
                        ...clazz,
                        id: p.id,
                        classDefinitionId: p.classDefinitionId,
                        name: p.name,
                        isComposite: false
                    };
                    componentsMap.set(c2.id, c2);
                });
                componentsMap.set(c1.id, c1);
            }
        });
    }

    static sanitizeComponents(componentsMap: Map<string, Component>, connectorsArray: Array<Connector>){
        // Remove components without connectors
        const keysToDelete: string[] = [];

        componentsMap.forEach(component => {
            if (!connectorsArray.find(c => [c.sourceComponentId, c.targetComponentId].includes(component.id))
                && !component.isComposite) {
                keysToDelete.push(component.id);
            }
        });
    
        // Delete components after iteration
        keysToDelete.forEach(key => componentsMap.delete(key));
    }

    
}