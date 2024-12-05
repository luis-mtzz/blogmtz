import React, { useState } from 'react';
import axios from 'axios';
import { Post } from '../cms/models';

const CreatePost: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [slug, setSlug] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const newPost = {
            title,
            content,
            dateCreated: new Date().toISOString(),
            slug,
            imageUrls,
            videoUrls,
        };

        try {
            const response = await axios.post('/cms/posts', newPost);
            console.log('Post created:', response.data);
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='title'>Title:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <button type="submit">Create Post</button>
        </form>
    )
}

export default CreatePost;