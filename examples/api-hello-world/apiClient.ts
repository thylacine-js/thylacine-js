export class Client {
    public readonly baseURL: URL;
    constructor(url: string | URL) {
        this.baseURL = new URL(url);
    }
    public async get(...args): Promise<Response> {
        let r = await fetch(new URL("/", this.baseURL), { method: "GET" });
        return r;
    }
    public async postLogin(...args): Promise<Response> {
        let r = await fetch(new URL("/login", this.baseURL), { method: "POST" });
        return r;
    }
    public async wsWs(...args): Promise<Response> {
        let r = await fetch(new URL("/ws", this.baseURL), { method: "WS" });
        return r;
    }
    public async getSession(...args): Promise<Response> {
        let r = await fetch(new URL("/session", this.baseURL), { method: "GET" });
        return r;
    }
}
