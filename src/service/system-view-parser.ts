export class SystemViewParser {

    static buildBase(pe: any): Base{
        return {
            id: pe['$']['xmi:id'],
            type: pe['$']['xmi:type'],
            name: pe['$'].name,
        };
    }

    static parse(xml: any): SystemView {

        const xmi = xml['xmi:XMI'];
        const umlModel = xmi['uml:Model'];
        //console.log(umlModel)
        
        const modelSystemView = umlModel[0].packagedElement.filter(pe => pe['$'].name === 'modelSystemView')[0];
        //console.log(modelSystemView)

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
                const c: Base = this.buildBase(pe);

                c['ports'] = pe.ownedAttribute
                    .filter(oa => oa['$']['xmi:type'] === 'uml:Port')
                    .map(oa => {
                        const p: Base = this.buildBase(oa);
                        p['aggregation'] = oa['$']['aggregation'];
                        return p;
                    });

                return c;
            });

        return {
            classes,
            associations
        }
    }
}