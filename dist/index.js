"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.json({ message: "hello world" });
});
const port = 5000;
const startServer = () => {
    app.listen(port, () => {
        console.log(`server raning in port ${port}`);
    });
};
exports.startServer = startServer;
(0, exports.startServer)();
