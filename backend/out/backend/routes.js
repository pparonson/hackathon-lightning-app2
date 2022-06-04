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
var lnrpc_1 = require("@radar/lnrpc");
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
// export const postInvoice = async (req: Request, res: Response) => {
// const { id } = req.params;
// find the post
// const post = db.getPostById(parseInt(id));
// if (!post) throw new Error('Post not found');
// find the node that made this post
// const node = db.getNodeByPubkey(post.pubkey);
// if (!node) throw new Error('Node not found for this post');
// create an invoice on the poster's node
// const rpc = nodeManager.getRpc(node.token);
// const amount = 100;
// const inv = await rpc.addInvoice({ value: amount.toString() });
// res.send({
//   payreq: inv.paymentRequest,
//   hash: (inv.rHash as Buffer).toString('base64'),
//   amount,
// });
// };
// /**
//  * POST /api/posts/:id/invoice
//  */
exports.postInvoice = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, post, host, cert, macaroon, config;
    return __generator(this, function (_a) {
        id = req.params.id;
        post = posts_db_1["default"].getPostById(parseInt(id));
        if (!post)
            throw new Error('Post not found');
        host = '127.0.0.1:10001';
        cert = '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a4343416332674177494241674952414a6b56434d2f3058437749554f7241584e4576464d4577436759494b6f5a497a6a3045417749774d5445660a4d4230474131554543684d576247356b494746316447396e5a57356c636d46305a575167593256796444454f4d4177474131554541784d4659577870593255770a4868634e4d6a49774e4449774d54517a4f544d315768634e4d6a4d774e6a45314d54517a4f544d31576a41784d523877485159445651514b45785a73626d51670a595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566862476c6a5a54425a4d424d4742797147534d3439416745470a43437147534d343941774548413049414244416c397761737968644f505654454433474579646b4c535235647268756243743247433939306c42646d703777390a4431345835364b376f72792b2f463471375772314d4d6243372f546d546c586b796c6941764a696a676355776763497744675944565230504151482f424151440a41674b6b4d424d47413155644a51514d4d416f47434373474151554642774d424d41384741315564457745422f7751464d414d4241663877485159445652304f0a42425945464a6446314c7a6154646367566c465435444c30687858584c6b67354d477347413155644551526b4d474b434257467361574e6c67676c7362324e680a62476876633353434257467361574e6c6767357762327868636931754d79316862476c6a5a594945645735706549494b64573570654842685932746c644949480a596e566d59323975626f6345667741414159635141414141414141414141414141414141414141414159634572424941416a414b42676771686b6a4f505151440a41674e4841444245416942526a582b71696867346d686a365a7474456f646172635a6e2b6b7a2f536d5047734c38706d746b6d3965674967415a655551376d6f0a79756155312f67676c7431776b3271514c6b586175666d47682b735031614e426732413d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a';
        macaroon = '0201036c6e640267030a1047fa466df4cdc8710568809efef6e9b91201301a0c0a04696e666f1204726561641a170a08696e766f69636573120472656164120577726974651a160a076d657373616765120472656164120577726974651a100a086f6666636861696e120472656164000006206be8c7be76b95f8efbb746f2396421485f1c90d3876076fd37da42a5903a83b0';
        config = {
            server: host,
            cert: Buffer.from(cert, 'hex').toString('utf-8'),
            macaroon: macaroon
        };
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var routerRpc, request, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, lnrpc_1.createRouterRpc(config)];
                    case 1:
                        routerRpc = _a.sent();
                        request = {
                            payment_request: 'lnbcrt1u1p3xt2krpp5s85knwafuc4826pevvl8jmcqhnf6hm8cmwg2fdcuyey9yfarecrqdqqcqzpgsp5t8866e5cphurv07mc2eepk6vv8kr3ym3pwfrvspjya6lpr9lk74q9qyyssqutznlsev6cgzaqg49gwafhurztld76rsus37m02tn0j06wg9g7aj6gykwe43pnqqh4qf4uz7llhnyhvprk3wd8qk77uqlnwe688082sqk422pj'
                        };
                        stream = routerRpc.sendPaymentV2(request);
                        stream.on('data', function (payment) {
                            console.log("payment: " + payment);
                            // this.emit(NodeEvents.invoicePaid, { hash, amount, pubkey });
                        });
                        return [2 /*return*/];
                }
            });
        }); })();
        return [2 /*return*/];
    });
}); };
//# sourceMappingURL=routes.js.map