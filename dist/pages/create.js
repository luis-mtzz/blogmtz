"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const CreatePost_1 = __importDefault(require("../components/CreatePost"));
const CreatePage = () => {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("h1", null, "Create New Post"),
        react_1.default.createElement(CreatePost_1.default, null)));
};
exports.default = CreatePage;
