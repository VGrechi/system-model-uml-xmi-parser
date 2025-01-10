import { readXML } from './utils/xml-utils';
import { SystemViewParser } from './service/system-view-parser';

(async () => {
    const result = await readXML('assets/Automotive HAD Vehicle.uml');
    //console.log(result);
    
    const systemView = SystemViewParser.parse(result);

})()