export class SystemViewParser {

    static buildBase(pe: any): Base{
        return {
            id: pe['$']['xmi:id'],
            type: pe['$']['xmi:type'],
            name: pe['$'].name,
        };
    }

    static parse(xml: any, portsMap: Map<string, Port>, componentsMap: Map<string, Class>, connectorsArray: Array<Connector>): SystemView {

        const xmi = xml['xmi:XMI'];

        const flowsAndPorts = this.parseFlowsAndPorts(xmi);

        const modelSystemView = this.parseModelSystemView(xmi, flowsAndPorts, portsMap, componentsMap, connectorsArray);

        return {
            ...modelSystemView,
            flowsAndPorts
        }        
        
    }

    static parseModelSystemView(xmi, flowsAndPorts: FlowPort[], portsMap: Map<string, Port>, componentsMap: Map<string, Class>, connectorsArray: Array<Connector>){
        const modelSystemView = xmi['uml:Model'][0].packagedElement.filter(pe => pe['$'].name === 'modelSystemView')[0];

        const associations: Association[] = modelSystemView.packagedElement
            .filter(pe => pe['$']['xmi:type'] === 'uml:Association')
            .map(pe => {
                const a: Base = this.buildBase(pe);
                a['memberEnd'] = pe['$']['memberEnd'].split(' ');
                return a;
            });

        const classes: Class[] = modelSystemView.packagedElement
            .filter(pe => pe['$']['xmi:type'] === 'uml:Class')
            .map(pe => {
                const c: Class = <Class> this.buildBase(pe);

                c.ports = pe.ownedAttribute
                    .filter(oa => oa['$']['xmi:type'] === 'uml:Port')
                    .map(oa => {
                        const p: Base = this.buildBase(oa);
                        p['classId'] = c.id;
                        p['componentName'] = c.name;

                        p['direction'] = flowsAndPorts.find(fp => fp.basePort === p.id)?.direction || "inout";

                        portsMap.set(p.id, <Port> p);
                        return p;
                    });

                c.connectors = pe.ownedConnector?.
                    filter(oc => oc['$']['xmi:type'] === 'uml:Connector')
                    .map(oc => {
                        const c: Base = this.buildBase(oc);

                        const ends = [];
                        oc.end?.filter(ce => ce['$']['xmi:type'] === 'uml:ConnectorEnd')
                        .map(ce => {
                            ends.push(ce['$'])
                        });


                        c['source'] = ends[0]['role'];
                        c['target'] = ends[1]['role'];
                        

                        connectorsArray.push(<Connector> c);
                        return c;
                    });
                    
                componentsMap.set(c.id, <Class> c);
                return c;
            });

        return {
            classes,
            associations
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
}