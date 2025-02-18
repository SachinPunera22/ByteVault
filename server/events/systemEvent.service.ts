import {EventEmitter} from "events";

class SystemEventService extends EventEmitter {
    constructor() {
        super();
    }
}

// Create a singleton instance and export it
export const systemEventService = new SystemEventService();
