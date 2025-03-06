type AFTNode = AttackEvent | FaultEvent | LogicGate;

interface AttackFaultTree {
    root: AFTNode;  // Nó raiz da árvore
    nodes: Map<string, AFTNode>;  // Mapeamento de todos os nós da árvore
}