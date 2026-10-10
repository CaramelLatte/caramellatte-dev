import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { posts, TAGS } from '../blog/posts';

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

function BlogPost() {
    const { postId } = useParams();
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return (
            <div className="container">
                <div className="blog-not-found">
                    <div className="about-section-label">Not Found</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                        Post doesn't exist.
                    </h2>
                    <Link to="/blog" className="project-link project-link-accent">
                        ← Back to blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="blog-post-header">
                <Link to="/blog" className="blog-back-link">← All posts</Link>
                <div className="blog-card-tags" style={{ marginBottom: '0.75rem' }}>
                    {post.tags.map(t => (
                        <span key={t} className="blog-card-tag">{TAGS[t] ?? t}</span>
                    ))}
                </div>
                <h1 className="blog-post-title">{post.title}</h1>
                <span className="blog-card-date">{formatDate(post.date)}</span>
            </div>
            {/* body is a plain string for now - swap for <ReactMarkdown>{post.body}</ReactMarkdown> when ready */}
            <div className="blog-prose">
                {post.body}
            </div>
        </div>
    );
}

export default BlogPost;
