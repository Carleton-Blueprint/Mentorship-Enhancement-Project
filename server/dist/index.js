"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
dotenv_1.default.config();
const port = process.env.PORT || 5000;
app_1.app.listen(port, () => {
    console.log(`App is listening to port: ${port}`);
});
module.exports = app_1.app;
//# sourceMappingURL=index.js.map