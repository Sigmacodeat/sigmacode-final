import { InvalidTypeError } from "../_errors.js";
/** Number type handler. Excepts any numeric value. */
export const integer = (type) => {
    const value = Number(type.value);
    if (Number.isInteger(value)) {
        return value;
    }
    throw new InvalidTypeError(type);
};
