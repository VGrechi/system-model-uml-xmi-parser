interface Port extends Base {
    classId: string;
    componentType: string;
    direction: "in" | "out" | "inout";
}