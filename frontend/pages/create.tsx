import React from "react";
import CreatePost from "../components/CreatePost";

const CreatePage: React.FC = () => {
    return (
        <div>
            <h1>Create New Post</h1>
            <CreatePost />
        </div>
    );
};

export default CreatePage;