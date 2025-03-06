interface AttackEvent extends BaseEvent {
    threatCategory: "Spoofing" | "Tampering" | "Repudiation" | "Information Disclosure" | "Denial of Service" | "Elevation of Privilege";
    attackType: string;  // Nome específico do ataque, ex: "DDoS", "Packet Injection"
    targetPortId: string;  // ID da porta atacada
}