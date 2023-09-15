import { EventEmitter } from 'events';
const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(1000);

export default eventEmitter;
