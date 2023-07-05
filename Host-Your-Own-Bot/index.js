const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
    if (
        name === `warning` &&
        typeof data === `object` &&
        data.name === `ExperimentalWarning`
    ) {
        return false;
    }
    return originalEmit.apply(process, arguments);
};
require("./src/structure/client/client").init();