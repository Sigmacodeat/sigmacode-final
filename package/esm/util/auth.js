import { base64 } from "../deps.js";
import { loadConfig } from "../config.js";
/**
 * Parse cli config and return a basic auth header string
 */
export async function parseAuth(options) {
    let email = options.upstashEmail;
    let apiKey = options.upstashApiKey;
    const config = loadConfig(options.config);
    if (config?.email) {
        email = config.email;
    }
    if (config?.apiKey) {
        apiKey = config.apiKey;
    }
    if (!email || !apiKey) {
        throw new Error(`Not authenticated, please run "upstash auth login" or specify your config file with "--config=/path/to/.upstash.json"`);
    }
    return await Promise.resolve(`Basic ${base64.encode([email, apiKey].join(":"))}`);
}
