export class AFTPrinter {
    static printAFT(node: AFTNode, depth: number = 0) {
        const indent = "  ".repeat(depth); // Duas espaços por nível

        if ("threatCategory" in node) {
            console.log(`${indent}⚠️ [${node.threatCategory}] ${node.name} (Ataque: ${node.attackType})`);
        } else if ("faultType" in node) {
            console.log(`${indent}🔥 [FALHA] ${node.name} (Tipo: ${node.faultType})`);
        } else {
            console.log(`${indent}🔀 [${node.type}] Gate`);
            node.inputs.forEach(input => AFTPrinter.printAFT(input, depth + 1));
        }
    }

    static printTopEvent = (topEvent: TopEvent) => {
        console.log(`🚨 [TOP EVENT] ${topEvent.name}`);
        console.log(`   ${topEvent.description}`);
        this.printAFT(topEvent.root, 1);
    };
}