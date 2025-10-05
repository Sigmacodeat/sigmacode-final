import * as dntShim from "../../../../../_dnt.shims.js";
import { cursorPosition } from "./ansi_escapes.js";
/**
 * Get cursor position.
 * @param options  Options.
 * ```
 * const cursor: Cursor = getCursorPosition();
 * console.log(cursor); // { x: 0, y: 14}
 * ```
 */
export function getCursorPosition({ stdin = dntShim.Deno.stdin, stdout = dntShim.Deno.stdout, } = {}) {
    const data = new Uint8Array(8);
    dntShim.Deno.setRaw(stdin.rid, true);
    stdout.writeSync(new TextEncoder().encode(cursorPosition));
    stdin.readSync(data);
    dntShim.Deno.setRaw(stdin.rid, false);
    const [y, x] = new TextDecoder()
        .decode(data)
        .match(/\[(\d+);(\d+)R/)
        ?.slice(1, 3)
        .map(Number) ?? [0, 0];
    return { x, y };
}
