import * as dntShim from "../../../../../_dnt.shims.js";
import * as ansiEscapes from "./ansi_escapes.js";
import { getCursorPosition } from "./cursor_position.js";
/**
 * Chainable ansi escape sequence's.
 * If invoked as method, a new Tty instance will be returned.
 * ```
 * tty.cursorTo(0, 0).eraseScreen();
 * ```
 */
export const tty = factory();
function factory(options) {
    let result = "";
    let stack = [];
    const stdout = options?.stdout ?? dntShim.Deno.stdout;
    const stdin = options?.stdin ?? dntShim.Deno.stdin;
    const tty = function (...args) {
        if (this) {
            update(args);
            stdout.writeSync(new TextEncoder().encode(result));
            return this;
        }
        return factory(args[0] ?? options);
    };
    tty.text = function (text) {
        stack.push([text, []]);
        update();
        stdout.writeSync(new TextEncoder().encode(result));
        return this;
    };
    tty.getCursorPosition = () => getCursorPosition({ stdout, stdin });
    const methodList = Object.entries(ansiEscapes);
    for (const [name, method] of methodList) {
        if (name === "cursorPosition") {
            continue;
        }
        Object.defineProperty(tty, name, {
            get() {
                stack.push([method, []]);
                return this;
            },
        });
    }
    return tty;
    function update(args) {
        if (!stack.length) {
            return;
        }
        if (args) {
            stack[stack.length - 1][1] = args;
        }
        result = stack.reduce((prev, [cur, args]) => prev + (typeof cur === "string" ? cur : cur.call(tty, ...args)), "");
        stack = [];
    }
}
