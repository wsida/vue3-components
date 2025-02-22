export default class EventEmitter {
    emit(event: string, data?: any): void;
    on(event: string, callback: any): void;
    off(event: string, callback: any): void;
}
