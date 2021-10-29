"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@klonzo/common");
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const root_1 = __importDefault(require("./root"));
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use('/graphql', (0, express_graphql_1.graphqlHTTP)({
    schema: common_1.graphqlSchema,
    rootValue: root_1.default,
    graphiql: true,
    customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        stack: error.stack ? error.stack.split('\n') : [],
        path: error.path,
    }),
}));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`sqlserver running on PORT: ${port}`));
//# sourceMappingURL=index.js.map