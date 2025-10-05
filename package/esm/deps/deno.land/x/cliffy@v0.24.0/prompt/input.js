import { GenericPrompt } from "./_generic_prompt.js";
import { GenericSuggestions, } from "./_generic_suggestions.js";
import { blue, normalize, yellow } from "./deps.js";
import { Figures } from "./figures.js";
/** Input prompt representation. */
export class Input extends GenericSuggestions {
    /** Execute the prompt and show cursor on end. */
    static prompt(options) {
        if (typeof options === "string") {
            options = { message: options };
        }
        return new this({
            pointer: blue(Figures.POINTER_SMALL),
            prefix: yellow("? "),
            indent: " ",
            listPointer: blue(Figures.POINTER),
            maxRows: 8,
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
    success(value) {
        this.saveSuggestions(value);
        return super.success(value);
    }
    /** Get input value. */
    getValue() {
        return this.settings.files ? normalize(this.inputValue) : this.inputValue;
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
            return `Value must be longer then ${this.settings.minLength} but has a length of ${value.length}.`;
        }
        if (value.length > this.settings.maxLength) {
            return `Value can't be longer then ${this.settings.maxLength} but has a length of ${value.length}.`;
        }
        return true;
    }
    /**
     * Map input value to output value.
     * @param value Input value.
     * @return Output value.
     */
    transform(value) {
        return value.trim();
    }
    /**
     * Format output value.
     * @param value Output value.
     */
    format(value) {
        return value;
    }
}
