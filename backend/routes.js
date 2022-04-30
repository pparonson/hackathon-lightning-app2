"use strict";
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
exports.postInvoice = exports.markPaid = exports.getPaymentAmount = exports.createPost = exports.getPosts = exports.getInfo = exports.connect = void 0;
var node_manager_1 = __importDefault(require("./node-manager"));
var posts_db_1 = __importDefault(require("./posts-db"));
/**
 * POST /api/connect
 */
exports.connect = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, host, cert, macaroon, _b, token, pubkey;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, host = _a.host, cert = _a.cert, macaroon = _a.macaroon;
                return [4 /*yield*/, node_manager_1["default"].connect(host, cert, macaroon)];
            case 1:
                _b = _c.sent(), token = _b.token, pubkey = _b.pubkey;
                return [4 /*yield*/, posts_db_1["default"].addNode({ host: host, cert: cert, macaroon: macaroon, token: token, pubkey: pubkey })];
            case 2:
                _c.sent();
                res.send({ token: token });
                return [2 /*return*/];
        }
    });
}); };
/**
 * GET /api/info
 */
exports.getInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, node, rpc, _a, alias, pubkey, balance;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                token = req.body.token;
                if (!token)
                    throw new Error('Your node is not connected!');
                node = posts_db_1["default"].getNodeByToken(token);
                if (!node)
                    throw new Error('Node not found with this token');
                rpc = node_manager_1["default"].getRpc(node.token);
                return [4 /*yield*/, rpc.getInfo()];
            case 1:
                _a = _b.sent(), alias = _a.alias, pubkey = _a.identityPubkey;
                return [4 /*yield*/, rpc.channelBalance()];
            case 2:
                balance = (_b.sent()).balance;
                res.send({ alias: alias, balance: balance, pubkey: pubkey });
                return [2 /*return*/];
        }
    });
}); };
/**
 * GET /api/posts
 */
exports.getPosts = function (req, res) {
    var posts = posts_db_1["default"].getAllPosts();
    res.send(posts);
};
/**
 * POST /api/posts
 */
exports.createPost = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, title, customerId, agentId, invoice, post;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, title = _a.title, customerId = _a.customerId, agentId = _a.agentId, invoice = _a.invoice;
                return [4 /*yield*/, posts_db_1["default"].createPost(username, title, customerId, agentId, invoice)];
            case 1:
                post = _b.sent();
                res.status(201).send(post);
                return [2 /*return*/];
        }
    });
}); };
/**
 * Post /api/getPaymentRequestAmount
 */
exports.getPaymentAmount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, token, paymentRequest, node, rpc, numSatoshis;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, token = _a.token, paymentRequest = _a.paymentRequest;
                if (!token)
                    throw new Error('Your node is not connected!');
                node = posts_db_1["default"].getNodeByToken(token);
                if (!node)
                    throw new Error('Node not found with this token');
                rpc = node_manager_1["default"].getRpc(node.token);
                return [4 /*yield*/, rpc.decodePayReq(paymentRequest)];
            case 1:
                numSatoshis = (_b.sent()).numSatoshis;
                res.send({ numSatoshis: numSatoshis });
                return [2 /*return*/];
        }
    });
}); };
/**
 * POST /api/posts/:id/upvote
 */
// export const upvotePost = async (req: Request, res: Response) => {
// const { id } = req.params;
// const { hash } = req.body;
// validate that a invoice hash was provided
// if (!hash) throw new Error('hash is required');
// find the post
// const post = db.getPostById(parseInt(id));
// if (!post) throw new Error('Post not found');
// find the node that made this post
// const node = db.getNodeByPubkey(post.pubkey);
// if (!node) throw new Error('Node not found for this post');
// const rpc = nodeManager.getRpc(node.token);
// const rHash = Buffer.from(hash, 'base64');
// const { settled } = await rpc.lookupInvoice({ rHash });
// if (!settled) {
// throw new Error('The payment has not been paid yet!');
// }
// db.upvotePost(post.id);
// res.send(post);
// };
/**
 * POST /api/posts/:id/markPaid
 */
exports.markPaid = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, token, post, node, rpc;
    return __generator(this, function (_a) {
        id = req.params.id;
        token = req.body.token;
        post = posts_db_1["default"].getPostById(parseInt(id));
        if (!post)
            throw new Error('Post not found');
        node = posts_db_1["default"].getNodeByToken(token);
        if (!node)
            throw new Error('Node not found for this post');
        rpc = node_manager_1["default"].getRpc(node.token);
        posts_db_1["default"].markPaid(post.id);
        res.send(post);
        return [2 /*return*/];
    });
}); };
/**
 * POST /api/posts/:id/verify
 */
// export const verifyPost = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { token } = req.body;
//   // find the post
//   const post = db.getPostById(parseInt(id));
//   if (!post) throw new Error('Post not found');
//   // find the node that's verifying this post
//   const verifyingNode = db.getNodeByToken(token);
//   if (!verifyingNode) throw new Error('Your node not found. Try reconnecting.');
//   if (post.pubkey === verifyingNode.pubkey)
//     throw new Error('You cannot verify your own posts!');
//   const rpc = nodeManager.getRpc(verifyingNode.token);
//   const msg = Buffer.from(post.content).toString('base64');
//   const { signature } = post;
//   const { pubkey, valid } = await rpc.verifyMessage({ msg, signature });
//   if (!valid || pubkey !== post.pubkey) {
//     throw new Error('Verification failed! The signature is invalid.');
//   }
//   db.verifyPost(post.id);
//   res.send(post);
// };
// /**
//  * POST /api/posts/:id/invoice
//  */
exports.postInvoice = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, post;
    return __generator(this, function (_a) {
        id = req.params.id;
        post = posts_db_1["default"].getPostById(parseInt(id));
        if (!post)
            throw new Error('Post not found');
        return [2 /*return*/];
    });
}); };
//# sourceMappingURL=routes.js.map