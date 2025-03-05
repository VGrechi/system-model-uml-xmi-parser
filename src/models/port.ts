interface Port extends Base {
    ownerClassId: string;
    ownerClassName: string;
    ownerComponentId: string;
    ownerComponentName: string;
    direction: "in" | "out" | "inout";
}