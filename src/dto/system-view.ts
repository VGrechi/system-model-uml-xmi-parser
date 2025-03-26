import { Component, Connector, Port } from "../domain/system-design";

export interface SystemView {
    portsMap: Map<string, Port>;
    componentsMap: Map<string, Component>;
    connectorsArray: Array<Connector>;
}