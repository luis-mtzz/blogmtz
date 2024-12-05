import { createClient } from 'redis';
import config from './../config/config'
import { v4 as uuidv4 } from 'uuid';
import { Post } from './models'

class RedisClient {
    private client: ReturnType<typeof createClient>;

    constructor() {
        const redisConfig = config.redis;
        this.client = createClient({
            url: `redis://${redisConfig.username}:${redisConfig.password}@${redisConfig.publicEndpoint}`,
            database: redisConfig.databaseName ? parseInt(redisConfig.databaseName, 10) : undefined,
          });

        this.client.on("error", (err: Error) =>
            console.error("Cannot connect to Redis Server: ", err),
        );
    }

    async connectClient() {
        try {
            await this.client.connect()
        } catch (error) {
            console.error('Error connecting to redis server:', error)
        }
    }

    // ----------------------------------------------------------------
    // POST FUNCTIONS
    // ----------------------------------------------------------------
    async createPost(post: Post): Promise<string> {
        const postId = generateUUID();
        await this.client.hSet(`post:${postId}`, {
            ...post,
            imageUrls: JSON.stringify(post.imageUrls),
            videoUrls: JSON.stringify(post.videoUrls),
        });

        await this.client.zAdd('posts:published', { score: Date.now(), value: postId});

        return postId;
    }

    async getPost(slug: string): Promise<Post | null> {
        const postId = await this.client.hGet(`slug:${slug}`, 'postId');
        if (!postId) {
            return null;
        }

        const post = await this.client.hGetAll(`post:${postId}`);
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
    }

    async getAllPosts(): Promise<Post[]> {
        const postIds = await this.client.zRange('posts:published', 0, -1);
        const posts = await Promise.all(
            postIds.map(async (postId) => {
                const post = await this.client.hGetAll(`post:${postId}`);
                return {
                    postId,
                    title: post.title,
                    content: post.content,
                    dateCreated: post.dateCreated,
                    slug: post.slug,
                    imageUrls: JSON.parse(post.imageUrls),
                    videoUrls: JSON.parse(post.videoUrls)
                }
            })
        );
        return posts;
    }

    async updatePost(
        slug: string,
        updatedPost: Partial<Post>
    ): Promise<boolean> {
        const postId = await this.client.hGet(`slug${slug}`, 'postId');
        if (!postId) {
            return false;
        }

        const existingPost = await this.client.hGetAll(`post:${postId}`);

        const mergedPost: Post = {
            ...existingPost,
            ...updatedPost,
            postId,
            title: updatedPost.title || existingPost.title || '',
            content: updatedPost.content || existingPost.content || '',
            dateCreated: updatedPost.dateCreated || existingPost.dateCreated || '',
            slug: updatedPost.slug || existingPost.slug || '',
            imageUrls: updatedPost.imageUrls || JSON.parse(existingPost.imageUrls),
            videoUrls: updatedPost.videoUrls || JSON.parse(existingPost.videoUrls)
        };

        const postForRedis: { [key: string]: string } = {};
        for (const key in mergedPost) {
            if (mergedPost.hasOwnProperty(key)) {
                if (Array.isArray(mergedPost[key])) {
                    postForRedis[key] = JSON.stringify(mergedPost[key]);
                } else {
                    postForRedis[key] = mergedPost[key] as string;
                }
            }
        }

        await this.client.hSet(`post:${postId}`, postForRedis);

        return true;
    }

    async deletePost(slug: string): Promise<boolean> {
        const postId = await this.client.hGet(`slug:${slug}`, 'postId');
        if (!postId) {
            return false;
        }

        await this.client.del(`post:${postId}`);
        await this.client.zRem('posts:published', postId);
        await this.client.del(`slug:${slug}`);

        return true;
    }
}

function generateUUID(): string {
    return uuidv4()
}

export default RedisClient;