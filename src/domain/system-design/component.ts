interface Component extends Class {
    isComposite: boolean;
    classDefinitionId: string;
    fptcExpression?: string;
    errorStates?: ErrorState[];
}