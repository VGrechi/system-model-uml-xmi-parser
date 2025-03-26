import { Base } from "./base";

export interface ErrorState extends Base {
    baseStateId: string;
    probability: number;
}