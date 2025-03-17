export class SystemViewParser {

    static buildBase(pe: any): Base {
        return {
            id: pe['$']['xmi:id'],
            name: pe['$'].name,
            umlType: pe['$']['xmi:type'],
        };
    }

    static parse(xml: any): SystemView {
        const xmi = xml['xmi:XMI'];

        const flowsAndPorts = this.parseFlowsAndPorts(xmi);

        const internalFaults = this.parseInternalFault(xmi);

        const attacks = this.parseAttacks(xmi);

        const errorStates = this.parseErrorStates(xmi);

        const classesMap = this.parseClasses(xmi, flowsAndPorts);

        let componentsMap = this.identifyComponents(classesMap);

        this.identifyThreatsPropagation(classesMap, componentsMap, internalFaults, attacks, errorStates);

        let portsMap = this.identifyPorts(componentsMap);

        let connectorsArray = this.identifyConnectors(classesMap);

        this.sanitizeComponents(componentsMap, connectorsArray);

        this.sanitizePorts(portsMap, connectorsArray);

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

    static parseInternalFault(xmi){
        const internalFaults: InternalFault[] = xmi['ThreatsPropagation:InternalFault'].map(itf => {
            return {
                id: itf['$']['xmi:id'],
                baseTransitionId: itf['$']['base_Transition']
            }
        });

        return internalFaults;
    }

    static parseAttacks(xmi){
        const attacks: Attack[] = xmi['ThreatsPropagation:Attack'].map(at => {
            return {
                id: at['$']['xmi:id'],
                baseTransitionId: at['$']['base_Transition'],
                kind: at['$']['kind'],
                severity: at['$']['severity'],
                threat: at['$']['threat']
            }
        });

        return attacks;
    }

    static parseErrorStates(xmi){
        const errorStates: ErrorState[] = xmi['ThreatsPropagation:ErrorState'].map(es => {
            return {
                id: es['$']['xmi:id'],
                baseStateId: es['$']['base_State'],
                probability: es['$']['probability']
            }
        });

        return errorStates;
    }

    static parseClasses(xmi, flowsAndPorts: FlowPort[]){

        const modelSystemView = xmi['uml:Model'][0].packagedElement.filter(pe => pe['$'].name === 'modelSystemView')[0];

        return modelSystemView.packagedElement
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

                        //connectorsArray.push(c);
                        return c;
                    });

                c.behaviors = pe.ownedBehavior?.
                    filter(ob => ob['$']['xmi:type'] === 'uml:StateMachine')
                    .map(ob => {
                        const b: Behavior = <Behavior> this.buildBase(ob);
                        b.states = [];
                        b.transitions = [];

                        ob.region?.forEach(r => {
                            r.subvertex?.
                                filter(sv => sv['$']['xmi:type'] === 'uml:State')
                                .map(sv => {
                                    const s: State = <State> this.buildBase(sv);
                                    b.states.push(s);
                                });

                            r.transition?.
                                filter(tr => tr['$']['xmi:type'] === 'uml:Transition')
                                .map(tr => {
                                    const t: Transition = <Transition> this.buildBase(tr);
                                    t.sourceId = tr['$']['source'];
                                    t.targetId = tr['$']['target'];
                                    b.transitions.push(t);
                                });
                        });
                        return b;
                    });
                return c;
            }).reduce((acc, c) => {
                acc.set(c.id, c);
                return acc;
            }, new Map<string, Class>());
    }

    static identifyComponents(classesMap: Map<string, Class>){

        let componentsMap: Map<string, Component> = new Map<string, Component>();

        classesMap.forEach((c, classId) => {

            if(c.properties.length > 0){
                
                let c1: Component = {
                    ...c,
                    id: classId,
                    classDefinitionId: classId,
                    name: c.name,
                    isComposite: true,
                    ports: c.ports.map(port => ({
                        ...port,
                        ownerComponentId: classId,
                        ownerComponentName: c.name
                    }))
                };

                c.properties.forEach(p => {
                    const clazz: Class = classesMap.get(p.classDefinitionId);
                    let c2: Component = {
                        ...clazz,
                        id: p.id,
                        classDefinitionId: p.classDefinitionId,
                        name: p.name,
                        isComposite: false,
                        ports: clazz.ports.map(port => ({
                            ...port,
                            ownerComponentId: p.id,
                            ownerComponentName: p.name
                        }))
                    };
                    componentsMap.set(c2.id, c2);
                });
                componentsMap.set(c1.id, c1);
            }

        });

        return componentsMap;
    }

    static identifyThreatsPropagation(classesMap: Map<string, Class>, 
        componentsMap: Map<string, Component>, 
        internalFaults: InternalFault[], 
        attacks: Attack[], 
        errorStates: ErrorState[]) {

        const errorStatesIds = errorStates.map(es => es.baseStateId);

        componentsMap.forEach(c => {
            const clazz = classesMap.get(c.classDefinitionId);

            clazz.behaviors?.forEach(b => {

                let internalFault;
                b.transitions?.find(t => {
                    internalFault = internalFaults.find(itf => itf.baseTransitionId === t.id);
                });

                let attack;
                b.transitions?.find(t => {
                    attack = attacks.find(at => at.baseTransitionId === t.id);
                });

                c.errorStates = b.states?.filter(s => errorStatesIds.includes(s.id))
                    .map(s => {
                        return {
                            ...s,
                            baseStateId: s.id,
                            probability: errorStates.find(es => es.baseStateId === s.id)?.probability,
                            internalFault,
                            attack
                        }
                    });
            });
        });

    }

    static identifyPorts(componentsMap: Map<string, Component>){
        let portsMap: Map<string, Port> = new Map<string, Port>();

        componentsMap.forEach(c => {
            c.ports.forEach(port => {
                portsMap.set(`${port.id}:${c.id}`, port);
            });
        });

        return portsMap;
    }

    static identifyConnectors(classesMap: Map<string, Class>){
        const connectorsArray: Connector[] = [];
        classesMap.forEach(c => {
            if(!!c?.connectors){
                connectorsArray.push(...c?.connectors);
            }
        });
        return connectorsArray;
    }

    static findErrorStates(errorStates: ErrorState[], c: Class){
        // see if any c.behavior.states has its id in errorStates.baseStateId
        
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

    static sanitizePorts(portsMap: Map<string, Port>, connectorsArray: Array<Connector>){
        // Remove components without connectors
        const keysToDelete: string[] = [];

        portsMap.forEach(port => {
            if (!connectorsArray.find(c => [c.sourcePortId, c.targetPortId].includes(port.id))) {
                keysToDelete.push(`${port.id}:${port.ownerComponentId}`);
            }
        });
    
        // Delete components after iteration
        keysToDelete.forEach(key => portsMap.delete(key));
    }

    
}