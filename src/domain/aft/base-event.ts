import { EventTypeEnum } from "../shared/event-type-enum";

export interface BaseEvent {
    id: string;
    name: string;
    type: EventTypeEnum;
    componentName: string;
    
}