import { Component } from "../domain/system-design/component";
import { Port } from "../domain/system-design/port";

export interface SystemView {
    portsMap: Map<string, Port>;
    componentsMap: Map<string, Component>;
    connectorsArray: Array<Connector>;
}