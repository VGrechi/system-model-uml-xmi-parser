interface Port extends Base {
    classId: string;
    componentName: string;
    direction: "in" | "out" | "inout";
}