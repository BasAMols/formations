export class Ticker {
    private running: boolean = false;
    private listeners: (() => void)[] = [];
    private requestId: number;
    constructor() {
        this.running = false;
    }

    start() {
        this.running = true;
        this.requestId = window.requestAnimationFrame(() => {
            this.tick();
        });
    }
    stop() {
        if (!this.running) return;
        window.cancelAnimationFrame(this.requestId);
        this.running = false;
    }
    tick() {
        if (!this.running) return;
        this.requestId = window.requestAnimationFrame(() => {
            this.tick();
        });
        this.listeners.forEach(listener => listener());
    }
    add(listener: () => void) {
        this.listeners.push(listener);
    }
    remove(listener: () => void) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
}
