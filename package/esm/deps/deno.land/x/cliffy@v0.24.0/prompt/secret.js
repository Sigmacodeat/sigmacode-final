import { GenericPrompt } from "./_generic_prompt.js";
import { blue, underline, yellow } from "./deps.js";
import { Figures } from "./figures.js";
import { GenericInput, } from "./_generic_input.js";
/** Secret prompt representation. */
export class Secret extends GenericInput {
    /** Execute the prompt and show cursor on end. */
    static prompt(options) {
        if (typeof options === "string") {
            options = { message: options };
        }
        return new this({
            pointer: blue(Figures.POINTER_SMALL),
            prefix: yellow("? "),
            indent: " ",
            label: "Password",
            hidden: false,
            minLength: 0,
            maxLength: Infinity,
            ...options,
        }).prompt();
    }
    /**
     * Inject prompt value. Can be used for unit tests or pre selections.
     * @param value Input value.
     */
    static inject(value) {
        GenericPrompt.inject(value);
    }
    input() {
        return underline(this.settings.hidden ? "" : "*".repeat(this.inputValue.length));
    }
    /** Read user input. */
    read() {
        if (this.settings.hidden) {
            this.tty.cursorHide();
        }
        return super.read();
    }
    /**
     * Validate input value.
     * @param value User input value.
     * @return True on success, false or error message on error.
     */
    validate(value) {
        if (typeof value !== "string") {
            return false;
        }
        if (value.length < this.settings.minLength) {
            return `${this.settings.label} must be longer then ${this.settings.minLength} but has a length of ${value.length}.`;
        }
        if (value.length > this.settings.maxLength) {
            return `${this.settings.label} can't be longer then ${this.settings.maxLength} but has a length of ${value.length}.`;
        }
        return true;
    }
    /**
     * Map input value to output value.
     * @param value Input value.
     * @return Output value.
     */
    transform(value) {
        return value;
    }
    /**
     * Format output value.
     * @param value Output value.
     */
    format(value) {
        return this.settings.hidden ? "*".repeat(8) : "*".repeat(value.length);
    }
    /** Get input input. */
    getValue() {
        return this.inputValue;
    }
}
