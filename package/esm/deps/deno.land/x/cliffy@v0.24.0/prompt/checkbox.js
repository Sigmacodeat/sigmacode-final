import { blue, dim, green, red, yellow } from "./deps.js";
import { Figures } from "./figures.js";
import { GenericList, } from "./_generic_list.js";
import { GenericPrompt } from "./_generic_prompt.js";
/** Checkbox prompt representation. */
export class Checkbox extends GenericList {
    /**
     * Inject prompt value. Can be used for unit tests or pre selections.
     * @param value Array of input values.
     */
    static inject(value) {
        GenericPrompt.inject(value);
    }
    /** Execute the prompt and show cursor on end. */
    static prompt(options) {
        return new this({
            pointer: blue(Figures.POINTER_SMALL),
            prefix: yellow("? "),
            indent: " ",
            listPointer: blue(Figures.POINTER),
            maxRows: 10,
            searchLabel: blue(Figures.SEARCH),
            minOptions: 0,
            maxOptions: Infinity,
            check: green(Figures.TICK),
            uncheck: red(Figures.CROSS),
            ...options,
            keys: {
                check: ["space"],
                ...(options.keys ?? {}),
            },
            options: Checkbox.mapOptions(options),
        }).prompt();
    }
    /**
     * Create list separator.
     * @param label Separator label.
     */
    static separator(label) {
        return {
            ...super.separator(label),
            icon: false,
        };
    }
    /**
     * Map string option values to options and set option defaults.
     * @param options Checkbox options.
     */
    static mapOptions(options) {
        return options.options
            .map((item) => typeof item === "string" ? { value: item } : item)
            .map((item) => ({
            ...this.mapOption(item),
            checked: typeof item.checked === "undefined" && options.default &&
                options.default.indexOf(item.value) !== -1
                ? true
                : !!item.checked,
            icon: typeof item.icon === "undefined" ? true : item.icon,
        }));
    }
    /**
     * Render checkbox option.
     * @param item        Checkbox option settings.
     * @param isSelected  Set to true if option is selected.
     */
    getListItem(item, isSelected) {
        let line = this.settings.indent;
        // pointer
        line += isSelected ? this.settings.listPointer + " " : "  ";
        // icon
        if (item.icon) {
            let check = item.checked
                ? this.settings.check + " "
                : this.settings.uncheck + " ";
            if (item.disabled) {
                check = dim(check);
            }
            line += check;
        }
        else {
            line += "  ";
        }
        // value
        line += `${isSelected && !item.disabled
            ? this.highlight(item.name, (val) => val)
            : this.highlight(item.name)}`;
        return line;
    }
    /** Get value of checked options. */
    getValue() {
        return this.settings.options
            .filter((item) => item.checked)
            .map((item) => item.value);
    }
    /**
     * Handle user input event.
     * @param event Key event.
     */
    async handleEvent(event) {
        switch (true) {
            case this.isKey(this.settings.keys, "check", event):
                this.checkValue();
                break;
            default:
                await super.handleEvent(event);
        }
    }
    /** Check selected option. */
    checkValue() {
        const item = this.options[this.listIndex];
        if (item.disabled) {
            this.setErrorMessage("This option is disabled and cannot be changed.");
        }
        else {
            item.checked = !item.checked;
        }
    }
    /**
     * Validate input value.
     * @param value User input value.
     * @return True on success, false or error message on error.
     */
    validate(value) {
        const isValidValue = Array.isArray(value) &&
            value.every((val) => typeof val === "string" &&
                val.length > 0 &&
                this.settings.options.findIndex((option) => option.value === val) !== -1);
        if (!isValidValue) {
            return false;
        }
        if (value.length < this.settings.minOptions) {
            return `The minimum number of options is ${this.settings.minOptions} but got ${value.length}.`;
        }
        if (value.length > this.settings.maxOptions) {
            return `The maximum number of options is ${this.settings.maxOptions} but got ${value.length}.`;
        }
        return true;
    }
    /**
     * Map input value to output value.
     * @param value Input value.
     * @return Output value.
     */
    transform(value) {
        return value.map((val) => val.trim());
    }
    /**
     * Format output value.
     * @param value Output value.
     */
    format(value) {
        return value.map((val) => this.getOptionByValue(val)?.name ?? val)
            .join(", ");
    }
}
