import { Class } from "./class";

export interface Component extends Class {
    isComposite: boolean;
    classDefinitionId: string;
    fptcExpression?: string;
}