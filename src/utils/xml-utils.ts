import { promises as fs } from 'fs';
import xml2js from 'xml2js';

async function readXML(caminho): Promise<any[]> {
  try {
    const data = await fs.readFile(caminho);
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(data, {
      explicitArray: false, // Evita transformar strings únicas em arrays
      mergeAttrs: true,    // Junta os atributos diretamente no nó
    });

    //console.log('Resultado em JSON:', util.inspect(result, { depth: null, colors: true }));
    //console.log('Resultado em JSON:', result);
    return result;
  } catch (err) {
    console.error('Erro:', err);
  }
}

export {
  readXML
};

