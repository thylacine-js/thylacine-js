export class Client {
    public readonly baseURL: URL;
    constructor(url: string | URL) {
        this.baseURL = new URL(url);
    }
    public async get(...args): Promise<Response> {
        let r = await fetch(new URL("/", this.baseURL), { method: "GET" });
        return r;
    }
    public async postLoginWithPassword(...args): Promise<Response> {
        let r = await fetch(new URL("/login/withPassword", this.baseURL), { method: "POST" });
        return r;
    }
    public async postLoginWithToken(...args): Promise<Response> {
        let r = await fetch(new URL("/login/withToken", this.baseURL), { method: "POST" });
        return r;
    }
    public async allLogout(...args): Promise<Response> {
        let r = await fetch(new URL("/logout", this.baseURL), { method: "ALL" });
        return r;
    }
    public async getSession(...args): Promise<Response> {
        let r = await fetch(new URL("/session", this.baseURL), { method: "GET" });
        return r;
    }
    public async wsWs(...args): Promise<Response> {
        let r = await fetch(new URL("/ws", this.baseURL), { method: "WS" });
        return r;
    }
}
