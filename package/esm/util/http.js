import * as dntShim from "../_dnt.shims.js";
class HttpClient {
    constructor(config) {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
    }
    async request(req) {
        if (!req.path) {
            req.path = [];
        }
        const url = [this.baseUrl, ...req.path].join("/");
        const init = {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                Authorization: req.authorization,
            },
        };
        if (req.method !== "GET") {
            init.body = JSON.stringify(req.body);
        }
        // fetch is defined by isomorphic fetch
        // eslint-disable-next-line no-undef
        const res = await dntShim.fetch(url, init);
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return (await res.json());
    }
}
export const http = new HttpClient({ baseUrl: "https://api.upstash.com" });
