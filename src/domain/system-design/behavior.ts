import { Base } from "./base";
import { State } from "./state";
import { Transition } from "./transition";

export interface Behavior extends Base {
    states: State[];
    transitions: Transition[];
}