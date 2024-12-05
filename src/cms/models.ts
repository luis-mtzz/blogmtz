export interface Post {
    postId: string;
    title: string;
    content: string;
    dateCreated: string;
    slug: string;
    imageUrls: string[];
    videoUrls: string[];
    [key: string]: string | string[];
}