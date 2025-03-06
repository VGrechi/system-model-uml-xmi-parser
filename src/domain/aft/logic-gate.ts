interface LogicGate {
    id: string;
    type: "AND" | "OR" | "NOT" | "VOTING";
    inputs: AFTNode[];  // Nós filhos (eventos ou outras portas)
}