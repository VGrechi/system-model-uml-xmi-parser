interface ErrorState extends Base {
    baseStateId: string;
    probability: number;
    internalFault?: InternalFault;
    attack?: Attack;
}