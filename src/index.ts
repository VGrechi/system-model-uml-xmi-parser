import { readXML } from './utils/xml-utils';
import { SystemViewParser } from './service/system-view-parser';
import { PropagationPathIdentifier } from './service/propagation-path-identifier';
import { AFTPrinter } from './service/aft-printer';
import { ErrorPathIdentifier } from './service/error-path-identifier';

(async () => {
    const result = await readXML('assets/Automotive HAD Vehicle.uml');

    const systemView = SystemViewParser.parse(result);

    const paths = PropagationPathIdentifier.identifyPropagationPath(systemView);

    const errorsPaths = ErrorPathIdentifier.identifyErrorPaths(systemView, paths);
    
    //TODO - Build Attack-Fault Tree

    // AFT Example
    const attack1: AttackEvent = {
        id: "A1",
        name: "DoS Attack on Camera",
        description: "Overloads video stream, causing failure",
        threatCategory: "Denial of Service",
        attackType: "UDP Flooding",
        targetPortId: "123"
    };
    
    const fault1: FaultEvent = {
        id: "F1",
        name: "Camera Processor Failure",
        componentId: "CAM01",
        faultType: "Crash"
    };
    
    const andGate: LogicGate = {
        id: "G1",
        type: "AND",
        inputs: [attack1, fault1]
    };
    
    const topEvent: TopEvent = {
        id: "T1",
        name: "System Video Failure",
        description: "The video transmission system stops working due to attack or failure.",
        root: andGate
    };
    
    console.log("=== Attack-Fault Tree ===");
    AFTPrinter.printTopEvent(topEvent);
})()