export enum FaultTypeEnum {
    COMISSION = 'comission',
    OMISSION = 'omission',
    VALUE_COARSE = 'valueCoarse',
}

export function getFaultTypeEnum(value: string): FaultTypeEnum | undefined {
    return Object.values(FaultTypeEnum).find(enumValue => enumValue === value);
}