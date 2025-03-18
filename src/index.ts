import { readXML } from './utils/xml-utils';
import { SystemViewParser } from './service/system-view-parser';
import { PropagationPathIdentifier } from './service/propagation-path-identifier';
import { AFTPrinter } from './service/aft-printer';
import { ErrorPathIdentifier } from './service/error-path-identifier';
import { writeToFile } from './utils/txt-utils';
import { AFTGenerator } from './service/aft-generator';

(async () => {
    const result = await readXML('assets/Automotive HAD Vehicle.uml');

    const systemView = SystemViewParser.parse(result);

    const paths = PropagationPathIdentifier.identifyPropagationPath(systemView);

    const errorsPaths = ErrorPathIdentifier.identifyErrorPaths(systemView, paths);

    //writeToFile("out/output.txt", errorsPaths.map(path => path.toString()));
    
    const afts = AFTGenerator.generate(errorsPaths);

    afts.forEach(aft => {
        AFTPrinter.printTopEvent(aft);
    });
})()