import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { posts, TAGS } from '../blog/posts';

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

function BlogList() {
    const [activeTag, setActiveTag] = useState(null);

    const usedTags = [...new Set(posts.flatMap(p => p.tags))];
    const filtered = activeTag ? posts.filter(p => p.tags.includes(activeTag)) : posts;

    return (
        <div className="container">
            <div className="blog-header">
                <div className="about-section-label">Blog</div>
                <h2 className="blog-title">Notes & Write-ups</h2>
                <p className="blog-subtitle">
                    Career journey, project deep-dives, CTF write-ups, and whatever else I'm learning.
                </p>
            </div>

            {usedTags.length > 0 && (
                <div className="blog-tag-filter">
                    <button
                        className={`blog-tag-btn${!activeTag ? ' blog-tag-active' : ''}`}
                        onClick={() => setActiveTag(null)}
                    >
                        All
                    </button>
                    {usedTags.map(tag => (
                        <button
                            key={tag}
                            className={`blog-tag-btn${activeTag === tag ? ' blog-tag-active' : ''}`}
                            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        >
                            {TAGS[tag] ?? tag}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="blog-empty">
                    {posts.length === 0
                        ? 'No posts yet - first one is in the works.'
                        : 'No posts with this tag.'}
                </div>
            ) : (
                <div className="blog-post-list">
                    {filtered.map(post => (
                        <Link key={post.id} to={`/blog/${post.id}`} className="blog-card">
                            <div className="blog-card-meta">
                                <span className="blog-card-date">{formatDate(post.date)}</span>
                                <div className="blog-card-tags">
                                    {post.tags.map(t => (
                                        <span key={t} className="blog-card-tag">{TAGS[t] ?? t}</span>
                                    ))}
                                </div>
                            </div>
                            <h3 className="blog-card-title">{post.title}</h3>
                            <p className="blog-card-summary">{post.summary}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BlogList;
