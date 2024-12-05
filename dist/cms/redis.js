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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_1 = __importDefault(require("./../config/config"));
const uuid_1 = require("uuid");
class RedisClient {
    constructor() {
        const redisConfig = config_1.default.redis;
        this.client = (0, redis_1.createClient)({
            url: `redis://${redisConfig.username}:${redisConfig.password}@${redisConfig.publicEndpoint}`,
            database: redisConfig.databaseName ? parseInt(redisConfig.databaseName, 10) : undefined,
        });
        this.client.on("error", (err) => console.error("Cannot connect to Redis Server: ", err));
    }
    connectClient() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
            }
            catch (error) {
                console.error('Error connecting to redis server:', error);
            }
        });
    }
    // ----------------------------------------------------------------
    // POST FUNCTIONS
    // ----------------------------------------------------------------
    createPost(post) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = generateUUID();
            yield this.client.hSet(`post:${postId}`, Object.assign(Object.assign({}, post), { imageUrls: JSON.stringify(post.imageUrls), videoUrls: JSON.stringify(post.videoUrls) }));
            yield this.client.zAdd('posts:published', { score: Date.now(), value: postId });
            return postId;
        });
    }
    getPost(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = yield this.client.hGet(`slug:${slug}`, 'postId');
            if (!postId) {
                return null;
            }
            const post = yield this.client.hGetAll(`post:${postId}`);
            if (!post) {
                return null;
            }
            return {
                postId,
                title: post.title,
                content: post.content,
                dateCreated: post.dateCreated,
                slug: post.slug,
                imageUrls: JSON.parse(post.imageUrls),
                videoUrls: JSON.parse(post.videoUrls),
            };
        });
    }
    getAllPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const postIds = yield this.client.zRange('posts:published', 0, -1);
            const posts = yield Promise.all(postIds.map((postId) => __awaiter(this, void 0, void 0, function* () {
                const post = yield this.client.hGetAll(`post:${postId}`);
                return {
                    postId,
                    title: post.title,
                    content: post.content,
                    dateCreated: post.dateCreated,
                    slug: post.slug,
                    imageUrls: JSON.parse(post.imageUrls),
                    videoUrls: JSON.parse(post.videoUrls)
                };
            })));
            return posts;
        });
    }
    updatePost(slug, updatedPost) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = yield this.client.hGet(`slug${slug}`, 'postId');
            if (!postId) {
                return false;
            }
            const existingPost = yield this.client.hGetAll(`post:${postId}`);
            const mergedPost = Object.assign(Object.assign(Object.assign({}, existingPost), updatedPost), { postId, title: updatedPost.title || existingPost.title || '', content: updatedPost.content || existingPost.content || '', dateCreated: updatedPost.dateCreated || existingPost.dateCreated || '', slug: updatedPost.slug || existingPost.slug || '', imageUrls: updatedPost.imageUrls || JSON.parse(existingPost.imageUrls), videoUrls: updatedPost.videoUrls || JSON.parse(existingPost.videoUrls) });
            const postForRedis = {};
            for (const key in mergedPost) {
                if (mergedPost.hasOwnProperty(key)) {
                    if (Array.isArray(mergedPost[key])) {
                        postForRedis[key] = JSON.stringify(mergedPost[key]);
                    }
                    else {
                        postForRedis[key] = mergedPost[key];
                    }
                }
            }
            yield this.client.hSet(`post:${postId}`, postForRedis);
            return true;
        });
    }
    deletePost(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = yield this.client.hGet(`slug:${slug}`, 'postId');
            if (!postId) {
                return false;
            }
            yield this.client.del(`post:${postId}`);
            yield this.client.zRem('posts:published', postId);
            yield this.client.del(`slug:${slug}`);
            return true;
        });
    }
}
function generateUUID() {
    return (0, uuid_1.v4)();
}
exports.default = RedisClient;
