import * as dntShim from "../../../../../_dnt.shims.js";
import { GenericPrompt, } from "./_generic_prompt.js";
import { blue, dim, stripColor, underline } from "./deps.js";
/** Generic input prompt representation. */
export class GenericInput extends GenericPrompt {
    /**
     * Prompt constructor.
     * @param settings Prompt settings.
     */
    constructor(settings) {
        super({
            ...settings,
            keys: {
                moveCursorLeft: ["left"],
                moveCursorRight: ["right"],
                deleteCharLeft: ["backspace"],
                deleteCharRight: ["delete"],
                ...(settings.keys ?? {}),
            },
        });
        Object.defineProperty(this, "inputValue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "inputIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    getCurrentInputValue() {
        return this.inputValue;
    }
    message() {
        const message = super.message() + " " + this.settings.pointer + " ";
        this.cursor.x = stripColor(message).length + this.inputIndex + 1;
        return message + this.input();
    }
    input() {
        return underline(this.inputValue);
    }
    highlight(value, color1 = dim, color2 = blue) {
        value = value.toString();
        const inputLowerCase = this.getCurrentInputValue().toLowerCase();
        const valueLowerCase = value.toLowerCase();
        const index = valueLowerCase.indexOf(inputLowerCase);
        const matched = value.slice(index, index + inputLowerCase.length);
        return index >= 0
            ? color1(value.slice(0, index)) + color2(matched) +
                color1(value.slice(index + inputLowerCase.length))
            : value;
    }
    /**
     * Handle user input event.
     * @param event Key event.
     */
    async handleEvent(event) {
        switch (true) {
            case event.name === "c" && event.ctrl:
                this.clear();
                this.tty.cursorShow();
                dntShim.Deno.exit(130);
                return;
            case this.isKey(this.settings.keys, "moveCursorLeft", event):
                this.moveCursorLeft();
                break;
            case this.isKey(this.settings.keys, "moveCursorRight", event):
                this.moveCursorRight();
                break;
            case this.isKey(this.settings.keys, "deleteCharRight", event):
                this.deleteCharRight();
                break;
            case this.isKey(this.settings.keys, "deleteCharLeft", event):
                this.deleteChar();
                break;
            case this.isKey(this.settings.keys, "submit", event):
                await this.submit();
                break;
            default:
                if (event.sequence && !event.meta && !event.ctrl) {
                    this.addChar(event.sequence);
                }
        }
    }
    /** Add character to current input. */
    addChar(char) {
        this.inputValue = this.inputValue.slice(0, this.inputIndex) + char +
            this.inputValue.slice(this.inputIndex);
        this.inputIndex++;
    }
    /** Move prompt cursor left. */
    moveCursorLeft() {
        if (this.inputIndex > 0) {
            this.inputIndex--;
        }
    }
    /** Move prompt cursor right. */
    moveCursorRight() {
        if (this.inputIndex < this.inputValue.length) {
            this.inputIndex++;
        }
    }
    /** Delete char left. */
    deleteChar() {
        if (this.inputIndex > 0) {
            this.inputIndex--;
            this.deleteCharRight();
        }
    }
    /** Delete char right. */
    deleteCharRight() {
        if (this.inputIndex < this.inputValue.length) {
            this.inputValue = this.inputValue.slice(0, this.inputIndex) +
                this.inputValue.slice(this.inputIndex + 1);
        }
    }
}
