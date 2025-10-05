import * as dntShim from "./_dnt.shims.js";
import { path } from "./deps.js";
const homeDir = dntShim.Deno.env.get("HOME");
const fileName = ".upstash.json";
export const DEFAULT_CONFIG_PATH = homeDir
    ? path.join(homeDir, fileName)
    : fileName;
export function loadConfig(path) {
    try {
        return JSON.parse(dntShim.Deno.readTextFileSync(path));
    }
    catch {
        return null;
    }
}
export function storeConfig(path, config) {
    dntShim.Deno.writeTextFileSync(path, JSON.stringify(config));
}
export function deleteConfig(path) {
    dntShim.Deno.removeSync(path);
}
