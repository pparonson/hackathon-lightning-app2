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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.catchAsyncErrors = void 0;
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var express_ws_1 = __importDefault(require("express-ws"));
var types_1 = require("../src/shared/types");
var node_manager_1 = __importStar(require("./node-manager"));
var posts_db_1 = __importStar(require("./posts-db"));
var routes = __importStar(require("./routes"));
var PORT = 4000;
//
// Create Express server
//
var app = express_ws_1["default"](express_1["default"]()).app;
app.use(cors_1["default"]({ origin: 'http://localhost:3000' }));
app.use(express_1["default"].json());
// simple middleware to grab the token from the header and add
// it to the request's body
app.use(function (req, res, next) {
    req.body.token = req.header('X-Token');
    next();
});
/**
 * ExpressJS will hang if an async route handler doesn't catch errors and return a response.
 * To avoid wrapping every handler in try/catch, just call this func on the handler. It will
 * catch any async errors and return
 */
exports.catchAsyncErrors = function (routeHandler) {
    // return a function that wraps the route handler in a try/catch block and
    // sends a response on error
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var promise, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    promise = routeHandler(req, res);
                    if (!promise) return [3 /*break*/, 2];
                    return [4 /*yield*/, promise];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    res.status(400).send({ error: err_1.message });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
};
//
// Configure Routes
//
app.post('/api/connect', exports.catchAsyncErrors(routes.connect));
app.get('/api/info', exports.catchAsyncErrors(routes.getInfo));
app.get('/api/posts', exports.catchAsyncErrors(routes.getPosts));
app.post('/api/posts', exports.catchAsyncErrors(routes.createPost));
app.post('/api/posts/:id/invoice', exports.catchAsyncErrors(routes.postInvoice));
// app.post('/api/posts/:id/upvote', catchAsyncErrors(routes.upvotePost));
// app.post('/api/posts/:id/verify', catchAsyncErrors(routes.verifyPost));
app.post('/api/paymentRequestAmount', exports.catchAsyncErrors(routes.getPaymentAmount));
app.post('/api/posts/:id/markPostAsPaid', exports.catchAsyncErrors(routes.markPaid));
//
// Configure Websocket
//
app.ws('/api/events', function (ws) {
    // when a websocket connection is made, add listeners for posts and invoices
    var postsListener = function (posts) {
        var event = { type: types_1.SocketEvents.postUpdated, data: posts };
        ws.send(JSON.stringify(event));
    };
    var paymentsListener = function (info) {
        var event = { type: types_1.SocketEvents.invoicePaid, data: info };
        ws.send(JSON.stringify(event));
    };
    // add listeners to to send data over the socket
    posts_db_1["default"].on(posts_db_1.PostEvents.updated, postsListener);
    node_manager_1["default"].on(node_manager_1.NodeEvents.invoicePaid, paymentsListener);
    // remove listeners when the socket is closed
    ws.on('close', function () {
        posts_db_1["default"].off(posts_db_1.PostEvents.updated, postsListener);
        node_manager_1["default"].off(node_manager_1.NodeEvents.invoicePaid, paymentsListener);
    });
});
//
// Start Server
//
console.log('Starting API server...');
app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("API listening at http://localhost:" + PORT);
                // Rehydrate data from the DB file
                return [4 /*yield*/, posts_db_1["default"].restore()];
            case 1:
                // Rehydrate data from the DB file
                _a.sent();
                return [4 /*yield*/, node_manager_1["default"].reconnectNodes(posts_db_1["default"].getAllNodes())];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=index.js.map