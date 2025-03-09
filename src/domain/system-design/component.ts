interface Component extends Class {
    isComposite: boolean;
    classDefinitionId: string;
    errorStates: ErrorState[];
}