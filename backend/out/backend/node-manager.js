"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.NodeEvents = void 0;
var lnrpc_1 = __importDefault(require("@radar/lnrpc"));
var events_1 = require("events");
var uuid_1 = require("uuid");
exports.NodeEvents = {
    invoicePaid: 'invoice-paid'
};
var NodeManager = /** @class */ (function (_super) {
    __extends(NodeManager, _super);
    function NodeManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * a mapping of token to gRPC connection. This is an optimization to
         * avoid calling `createLnRpc` on every request. Instead, the object is kept
         * in memory for the lifetime of the server.
         */
        _this._lndNodes = {};
        return _this;
    }
    /**
     * Retrieves the in-memory connection to an LND node
     */
    NodeManager.prototype.getRpc = function (token) {
        if (!this._lndNodes[token]) {
            throw new Error('Not Authorized. You must login first!');
        }
        return this._lndNodes[token];
    };
    /**
     * Tests the LND node connection by validating that we can get the node's info
     */
    NodeManager.prototype.connect = function (host, cert, macaroon, prevToken) {
        return __awaiter(this, void 0, void 0, function () {
            var token, rpc, pubkey, msg, signature, rHash, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = prevToken || uuid_1.v4().replace(/-/g, '');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, lnrpc_1["default"]({
                                server: host,
                                cert: Buffer.from(cert, 'hex').toString('utf-8'),
                                macaroon: macaroon
                            })];
                    case 2:
                        rpc = _a.sent();
                        return [4 /*yield*/, rpc.getInfo()];
                    case 3:
                        pubkey = (_a.sent()).identityPubkey;
                        // verify we have permission to get channel balances
                        return [4 /*yield*/, rpc.channelBalance()];
                    case 4:
                        // verify we have permission to get channel balances
                        _a.sent();
                        msg = Buffer.from('authorization test').toString('base64');
                        return [4 /*yield*/, rpc.signMessage({ msg: msg })];
                    case 5:
                        signature = (_a.sent()).signature;
                        // verify we have permission to verify a message
                        return [4 /*yield*/, rpc.verifyMessage({ msg: msg, signature: signature })];
                    case 6:
                        // verify we have permission to verify a message
                        _a.sent();
                        return [4 /*yield*/, rpc.addInvoice({ value: '1' })];
                    case 7:
                        rHash = (_a.sent()).rHash;
                        // verify we have permission to lookup invoices
                        return [4 /*yield*/, rpc.lookupInvoice({ rHash: rHash })];
                    case 8:
                        // verify we have permission to lookup invoices
                        _a.sent();
                        // listen for payments from LND
                        this.listenForPayments(rpc, pubkey);
                        // store this rpc connection in the in-memory list
                        this._lndNodes[token] = rpc;
                        // return this node's token for future requests
                        return [2 /*return*/, { token: token, pubkey: pubkey }];
                    case 9:
                        err_1 = _a.sent();
                        // remove the connection from the cache since it is not valid
                        if (this._lndNodes[token]) {
                            delete this._lndNodes[token];
                        }
                        throw err_1;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reconnect to all persisted nodes to to cache the `LnRpc` objects
     * @param nodes the list of nodes
     */
    NodeManager.prototype.reconnectNodes = function (nodes) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, nodes_1, node, host, cert, macaroon, token, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, nodes_1 = nodes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < nodes_1.length)) return [3 /*break*/, 6];
                        node = nodes_1[_i];
                        host = node.host, cert = node.cert, macaroon = node.macaroon, token = node.token;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        console.log("Reconnecting to LND node " + host + " for token " + token);
                        return [4 /*yield*/, this.connect(host, cert, macaroon, token)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        // the token will not be cached
                        console.error("Failed to reconnect to LND node " + host + " with token: " + token);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * listen for payments made to the node. When a payment is settled, emit
     * the `invoicePaid` event to notify listeners of the NodeManager
     */
    NodeManager.prototype.listenForPayments = function (rpc, pubkey) {
        var _this = this;
        var stream = rpc.subscribeInvoices();
        stream.on('data', function (invoice) {
            if (invoice.settled) {
                var hash = invoice.rHash.toString('base64');
                var amount = invoice.amtPaidSat;
                _this.emit(exports.NodeEvents.invoicePaid, { hash: hash, amount: amount, pubkey: pubkey });
            }
        });
    };
    return NodeManager;
}(events_1.EventEmitter));
exports["default"] = new NodeManager();
//# sourceMappingURL=node-manager.js.map