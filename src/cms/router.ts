import express from 'express';
import RedisClient from './redis';
import { Post } from './models';

const router = express.Router();
const redisClient = new RedisClient();

(async () => {
    try {
        await redisClient.connectClient();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Error connecting to Redis:', error)
    }
})();

// API ROUTES

// GET 
router.get('/posts', async (req, res) => {
    try {
        const posts = await redisClient.getAllPosts();
        res.json(posts)
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).send('Error getting posts');
    }
});

router.get('/posts/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const post = await redisClient.getPost(slug);
        if (post) {
            res.json(post);
        } else {
            res.status(400).send('Post not found');
        }
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).send('Error getting post');
    }
});

// POST
router.post('/posts/', async (req, res) => {
    try {
        const newPost: Post = req.body;
        const postId = await redisClient.createPost(newPost);
        res.status(201).json({ id: postId, ...newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Error creating post');
    }
});

// PUT
router.put('/posts/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const updatedPost: Post = req.body;
        const success = await redisClient.updatePost(slug, updatedPost);
        if (success) {
            res.send('Post updated successfully');
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send('Error updating post');
    }
});

// DELETE
router.delete('/posts/:slug', async (req, res) => {
    const { slug } = req.params
    try {
        const success = await redisClient.deletePost(slug);
        if (success) {
            res.send('Post deleted successfully');
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Error deleting post');
    }
});

export default router;