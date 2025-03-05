interface SystemView {
    portsMap: Map<string, Port>;
    componentsMap: Map<string, Component>;
    connectorsArray: Array<Connector>;
}