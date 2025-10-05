import * as ansiEscapes from "./ansi_escapes.js";
/**
 * Chainable ansi escape sequence's.
 * If invoked as method, a new Ansi instance will be returned.
 * ```
 * await Deno.stdout.write(
 *   new TextEncoder().encode(
 *     ansi.cursorTo(0, 0).eraseScreen(),
 *   ),
 * );
 * ```
 * Or shorter:
 * ```
 * await Deno.stdout.write(
 *   ansi.cursorTo(0, 0).eraseScreen.toBuffer(),
 * );
 * ```
 */
export const ansi = factory();
function factory() {
    let result = [];
    let stack = [];
    const ansi = function (...args) {
        if (this) {
            if (args.length) {
                update(args);
                return this;
            }
            return this.toString();
        }
        return factory();
    };
    ansi.text = function (text) {
        stack.push([text, []]);
        return this;
    };
    ansi.toString = function () {
        update();
        const str = result.join("");
        result = [];
        return str;
    };
    ansi.toBuffer = function () {
        return new TextEncoder().encode(this.toString());
    };
    const methodList = Object.entries(ansiEscapes);
    for (const [name, method] of methodList) {
        Object.defineProperty(ansi, name, {
            get() {
                stack.push([method, []]);
                return this;
            },
        });
    }
    return ansi;
    function update(args) {
        if (!stack.length) {
            return;
        }
        if (args) {
            stack[stack.length - 1][1] = args;
        }
        result.push(...stack.map(([prop, args]) => typeof prop === "string" ? prop : prop.call(ansi, ...args)));
        stack = [];
    }
}
