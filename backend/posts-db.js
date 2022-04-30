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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PostEvents = void 0;
var events_1 = require("events");
var fs_1 = require("fs");
var DB_FILE = 'db.json';
/**
 * The list of events emitted by the PostsDb
 */
exports.PostEvents = {
    updated: 'post-updated'
};
/**
 * A very simple file-based DB to store the posts
 */
var PostsDb = /** @class */ (function (_super) {
    __extends(PostsDb, _super);
    function PostsDb() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // in-memory database
        _this._data = {
            posts: [],
            nodes: []
        };
        return _this;
    }
    //
    // Posts
    //
    PostsDb.prototype.getAllPosts = function () {
        //return this._data.posts.sort((a, b) => b.votes - a.votes);
        return this._data.posts.sort(function (a, b) { return b.id - a.id; });
    };
    PostsDb.prototype.getPostById = function (id) {
        return this.getAllPosts().find(function (post) { return post.id === id; });
    };
    PostsDb.prototype.createPost = function (username, title, 
    // content: string,
    // signature: string,
    // pubkey: string,
    customerId, agentId, invoice) {
        return __awaiter(this, void 0, void 0, function () {
            var maxId, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxId = Math.max.apply(Math, __spreadArrays([0], this._data.posts.map(function (p) { return p.id; })));
                        post = {
                            id: maxId + 1,
                            username: username,
                            title: title,
                            customerId: customerId,
                            agentId: agentId,
                            invoice: invoice,
                            votes: 0,
                            paid: false
                        };
                        this._data.posts.push(post);
                        return [4 /*yield*/, this.persist()];
                    case 1:
                        _a.sent();
                        this.emit(exports.PostEvents.updated, post);
                        return [2 /*return*/, post];
                }
            });
        });
    };
    PostsDb.prototype.upvotePost = function (postId) {
        return __awaiter(this, void 0, void 0, function () {
            var post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        post = this._data.posts.find(function (p) { return p.id === postId; });
                        if (!post) {
                            throw new Error('Post not found');
                        }
                        post.votes++;
                        return [4 /*yield*/, this.persist()];
                    case 1:
                        _a.sent();
                        this.emit(exports.PostEvents.updated, post);
                        return [2 /*return*/];
                }
            });
        });
    };
    PostsDb.prototype.markPaid = function (postId) {
        return __awaiter(this, void 0, void 0, function () {
            var post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        post = this._data.posts.find(function (p) { return p.id === postId; });
                        if (!post) {
                            throw new Error('Post not found');
                        }
                        post.paid = true;
                        return [4 /*yield*/, this.persist()];
                    case 1:
                        _a.sent();
                        this.emit(exports.PostEvents.updated, post);
                        return [2 /*return*/];
                }
            });
        });
    };
    // async verifyPost(postId: number) {
    //   const post = this._data.posts.find(p => p.id === postId);
    //   if (!post) {
    //     throw new Error('Post not found');
    //   }
    //   post.verified = true;
    //   await this.persist();
    //   this.emit(PostEvents.updated, post);
    // }
    //
    // Nodes
    //
    PostsDb.prototype.getAllNodes = function () {
        return this._data.nodes;
    };
    PostsDb.prototype.getNodeByPubkey = function (pubkey) {
        return this.getAllNodes().find(function (node) { return node.pubkey === pubkey; });
    };
    PostsDb.prototype.getNodeByToken = function (token) {
        return this.getAllNodes().find(function (node) { return node.token === token; });
    };
    PostsDb.prototype.addNode = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._data.nodes = __spreadArrays([
                            // add new node
                            node
                        ], this._data.nodes.filter(function (n) { return n.host !== node.host; }));
                        return [4 /*yield*/, this.persist()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    // HACK! Persist data to a JSON file to keep it when the server restarts.
    // Do not do this in a production app. This is just for convenience when
    // developing this sample app locally.
    //
    PostsDb.prototype.persist = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.writeFile(DB_FILE, JSON.stringify(this._data, null, 2))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostsDb.prototype.restore = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs_1.existsSync(DB_FILE))
                            return [2 /*return*/];
                        return [4 /*yield*/, fs_1.promises.readFile(DB_FILE)];
                    case 1:
                        contents = _a.sent();
                        if (contents) {
                            this._data = JSON.parse(contents.toString());
                            if (!this._data.nodes)
                                this._data.nodes = [];
                            console.log("Loaded " + this._data.posts.length + " posts");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return PostsDb;
}(events_1.EventEmitter));
exports["default"] = new PostsDb();
//# sourceMappingURL=posts-db.js.map