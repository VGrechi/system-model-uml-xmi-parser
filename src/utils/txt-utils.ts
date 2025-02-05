import * as fs from 'fs';

function writeToFile(filePath: string, data: string[], dirPath: string = "out"): void {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
            console.error("Erro ao criar o diretório:", err);
        } else {
            console.log(`Diretório ${dirPath} criado com sucesso!`);
        }
    });
    
    // Junta as strings do array com quebras de linha
    const content = data.join('\n');

    // Escreve o conteúdo no arquivo
    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            console.error("Erro ao escrever no arquivo:", err);
        } else {
            console.log(`Arquivo ${filePath} escrito com sucesso!`);
        }
    });
}

export {
    writeToFile
}