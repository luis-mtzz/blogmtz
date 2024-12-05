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
const express_1 = __importDefault(require("express"));
const redis_1 = __importDefault(require("./redis"));
const router = express_1.default.Router();
const redisClient = new redis_1.default();
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.connectClient();
        console.log('Connected to Redis');
    }
    catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}))();
// API ROUTES
// GET 
router.get('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield redisClient.getAllPosts();
        res.json(posts);
    }
    catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).send('Error getting posts');
    }
}));
router.get('/posts/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    try {
        const post = yield redisClient.getPost(slug);
        if (post) {
            res.json(post);
        }
        else {
            res.status(400).send('Post not found');
        }
    }
    catch (error) {
        console.error('Error getting post:', error);
        res.status(500).send('Error getting post');
    }
}));
// POST
router.post('/posts/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPost = req.body;
        const postId = yield redisClient.createPost(newPost);
        res.status(201).json(Object.assign({ id: postId }, newPost));
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Error creating post');
    }
}));
// PUT
router.put('/posts/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    try {
        const updatedPost = req.body;
        const success = yield redisClient.updatePost(slug, updatedPost);
        if (success) {
            res.send('Post updated successfully');
        }
        else {
            res.status(404).send('Post not found');
        }
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send('Error updating post');
    }
}));
// DELETE
router.delete('/posts/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    try {
        const success = yield redisClient.deletePost(slug);
        if (success) {
            res.send('Post deleted successfully');
        }
        else {
            res.status(404).send('Post not found');
        }
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Error deleting post');
    }
}));
exports.default = router;
