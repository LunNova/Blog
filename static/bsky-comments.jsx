// bsky-comments.jsx - Bluesky Comments Module with JSX
// 
// Build with: swc compile bsky-comments.jsx -o bsky-comments.js
//
// Usage:
//   import BskyComments from './bsky-comments.js';
//   
//   const comments = new BskyComments(
//       'https://bsky.app/profile/did:plc:xyz/post/123',
//       document.getElementById('comments'),
//       { cssPath: '/path/to/comments.css' } // optional, defaults to '/comments.css'
//   );
//   
//   comments.render();

export class BskyComments {
    constructor(targetUrl, targetElement, options = {}) {
        this.targetUrl = targetUrl;
        this.targetElement = targetElement;
        this.shadowRoot = null;
        this.cssPath = options.cssPath || '/comments.css';
        this.theme = options.theme || 'dark'; // 'light' or 'dark'
    }

    thumbnailify(avatarUrl) {
        if (avatarUrl) {
            return avatarUrl.replace("img/avatar/plain", "img/avatar_thumbnail/plain");
        }
        return avatarUrl;
    }

    // Convert Bluesky URL to API URL
    convertToApiUrl(bskyUrl) {
        // Extract the AT URI from the Bluesky URL
        const match = bskyUrl.match(/profile\/(did:[^\/]+)\/post\/([^\/\?]+)/);
        if (!match) {
            throw new Error('Invalid Bluesky URL format');
        }

        const [, did, postId] = match;
        const atUri = `at://${did}/app.bsky.feed.post/${postId}`;
        const encodedUri = encodeURIComponent(atUri);

        return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodedUri}`;
    }

    // Format timestamp
    formatTimestamp(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Process text with facets (mentions, links, etc)
    processTextWithFacets(text, facets = []) {
        if (!facets || facets.length === 0) return text;

        // Convert string to UTF-8 bytes for proper indexing
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const textBytes = encoder.encode(text);

        // Sort facets by index to process in order
        const sortedFacets = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);

        let result = [];
        let lastEnd = 0;

        for (const facet of sortedFacets) {
            const start = facet.index.byteStart;
            const end = facet.index.byteEnd;

            // Add text before this facet
            if (start > lastEnd) {
                const beforeBytes = textBytes.slice(lastEnd, start);
                result.push(decoder.decode(beforeBytes));
            }

            const facetBytes = textBytes.slice(start, end);
            const facetText = decoder.decode(facetBytes);

            // Process the facet based on its type
            let processed = false;
            for (const feature of facet.features) {
                if (feature.$type === 'app.bsky.richtext.facet#mention') {
                    result.push(
                        <a href={`https://bsky.app/profile/${feature.did}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mention">
                            {facetText}
                        </a>
                    );
                    processed = true;
                    break;
                } else if (feature.$type === 'app.bsky.richtext.facet#link') {
                    result.push(
                        <a href={feature.uri}
                            target="_blank"
                            rel="noopener noreferrer">
                            {facetText}
                        </a>
                    );
                    processed = true;
                    break;
                }
            }

            // If no feature was processed, add the text as-is
            if (!processed) {
                result.push(facetText);
            }

            lastEnd = end;
        }

        // Add any remaining text
        if (lastEnd < textBytes.length) {
            const remainingBytes = textBytes.slice(lastEnd);
            result.push(decoder.decode(remainingBytes));
        }

        return result.length > 0 ? result : text;
    }

    // Create comment element
    createComment(replyData, depth = 0) {
        const post = replyData.post || replyData; // Handle both reply objects and direct post objects
        const { author, record, replyCount, likeCount, repostCount, uri, embed } = post;
        const text = record?.text || '';
        const facets = record?.facets || [];
        const recordEmbed = record?.embed;
        const timestamp = this.formatTimestamp(record?.createdAt || '');
        const postId = uri.split('/').pop();
        const profileUrl = `https://bsky.app/profile/${author.did}`;
        const postUrl = `https://bsky.app/profile/${author.did}/post/${postId}`;

        // Process text with facets
        const processedText = this.processTextWithFacets(text, facets);

        // Use embed from post object (view version) or record object
        const embedToShow = embed || recordEmbed;

        // Check if there are any valid replies
        const validReplies = replyData.replies ? replyData.replies.filter(r => r.post) : [];
        // Sort replies by date (oldest first - chronological)
        validReplies.sort((a, b) => {
            const dateA = new Date(a.post.record?.createdAt || a.post.indexedAt || 0);
            const dateB = new Date(b.post.record?.createdAt || b.post.indexedAt || 0);
            return dateA - dateB; // Oldest first
        });
        const hasReplies = validReplies.length > 0;

        // Count total nested replies
        const countAllReplies = (replies) => {
            let count = 0;
            for (const reply of replies) {
                if (reply.post) {
                    count++;
                    if (reply.replies) {
                        count += countAllReplies(reply.replies);
                    }
                }
            }
            return count;
        };

        const totalNestedReplies = hasReplies ? countAllReplies(validReplies) : 0;
        const startCollapsed = depth === 2 && hasReplies;

        return (
            <div class={`comment ${startCollapsed ? 'collapsed' : ''}`} data-depth={depth}>
                <div class="comment-header">
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" class="author-link">
                        <img src={this.thumbnailify(author.avatar) || ''} alt={author.handle} class="avatar" />
                        <span class="author-name">{author.displayName || author.handle}</span>
                        <span class="author-handle">@{author.handle}</span>
                    </a>
                </div>
                <div class="comment-body">
                    <div class="comment-text">{processedText}</div>
                    {embedToShow && (
                        (() => {
                            // Handle recordWithMedia type
                            if (embedToShow.record?.record) {
                                const record = embedToShow.record.record;
                                return (
                                    <div class="embed-external">
                                        <a href={`https://bsky.app/profile/${record.author.did}/post/${record.uri.split('/').pop()}`}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <div class="embed-title">
                                                {record.author.displayName || record.author.handle}
                                                <span style="color: #71717a; font-weight: normal; margin-left: 4px;">
                                                    @{record.author.handle}
                                                </span>
                                            </div>
                                            <div style="color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;">
                                                {record.value?.text || ''}
                                            </div>
                                        </a>
                                    </div>
                                );
                            }
                            // Handle simple record embed
                            else if (embedToShow.record) {
                                return (
                                    <div class="embed-external">
                                        <a href={`https://bsky.app/profile/${embedToShow.record.author?.did}/post/${embedToShow.record.uri.split('/').pop()}`}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <div class="embed-title">
                                                {embedToShow.record.author?.displayName || embedToShow.record.author?.handle || 'Unknown'}
                                                <span style="color: #71717a; font-weight: normal; margin-left: 4px;">
                                                    @{embedToShow.record.author?.handle || 'unknown'}
                                                </span>
                                            </div>
                                            <div style="color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;">
                                                {embedToShow.record.value?.text || embedToShow.record.text || ''}
                                            </div>
                                        </a>
                                    </div>
                                );
                            }
                            // Handle external links
                            else if (embedToShow.external) {
                                return (
                                    <div class="embed-external">
                                        <a href={embedToShow.external.uri} target="_blank" rel="noopener noreferrer">
                                            <div class="embed-title">{embedToShow.external.title}</div>
                                            {embedToShow.external.description && (
                                                <div class="embed-description">{embedToShow.external.description}</div>
                                            )}
                                            <div class="embed-url">{new URL(embedToShow.external.uri).hostname}</div>
                                        </a>
                                    </div>
                                );
                            }
                            return null;
                        })()
                    )}
                    <div class="comment-footer">
                        <div class="footer-left">
                            {hasReplies && (
                                <button class="collapse-btn" aria-label="Toggle thread" data-reply-count={totalNestedReplies}>
                                    {startCollapsed ? `+ ${totalNestedReplies} ${totalNestedReplies === 1 ? 'reply' : 'replies'}` : `− ${totalNestedReplies} ${totalNestedReplies === 1 ? 'reply' : 'replies'}`}
                                </button>
                            )}
                            {hasReplies && (
                                <span class="separator">·</span>
                            )}
                            <a href={postUrl} target="_blank" rel="noopener noreferrer" class="timestamp">
                                {timestamp}
                            </a>
                        </div>
                        <div class="actions">
                            <a href={postUrl} target="_blank" rel="noopener noreferrer" class="reply-btn">
                                ↩ Reply
                            </a>
                            <div class="stats">
                                <span class="stat">💬 {replyCount || 0}</span>
                                <span class="stat">🔁 {repostCount || 0}</span>
                                <span class="stat">♥ {likeCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {hasReplies && (
                    <div class="replies-wrapper">
                        <div class="replies">
                            {validReplies.map(reply => this.createComment(reply, depth + 1))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // JSX to string helper
    renderToString(jsx) {
        if (jsx === null || jsx === undefined || jsx === false) return '';

        if (typeof jsx === 'string' || typeof jsx === 'number') {
            return this.escapeHtml(String(jsx));
        }

        if (Array.isArray(jsx)) {
            return jsx.map(child => this.renderToString(child)).join('');
        }

        if (typeof jsx === 'object' && jsx.type) {
            const { type, props } = jsx;
            const { children, ...attrs } = props || {};

            let html = `<${type}`;

            // Add attributes
            for (const [key, value] of Object.entries(attrs)) {
                if (value !== null && value !== undefined && value !== false) {
                    const attrName = key === 'class' ? 'class' : key;
                    html += ` ${attrName}="${this.escapeAttr(String(value))}"`;
                }
            }

            html += '>';

            // Add children
            if (children) {
                html += this.renderToString(children);
            }

            // Close tag
            html += `</${type}>`;

            return html;
        }

        return '';
    }

    // Escape HTML
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Escape attribute values
    escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Load CSS into shadow DOM
    async loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this.cssPath;
        this.shadowRoot.appendChild(link);

        // Return a promise that resolves when the CSS is loaded
        return new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = () => reject(new Error(`Failed to load ${this.cssPath}`));
        });
    }

    // Setup event listeners
    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (e) => {
            // Handle collapse button clicks
            if (e.target.classList.contains('collapse-btn')) {
                const comment = e.target.closest('.comment');
                const isCollapsed = comment.classList.contains('collapsed');
                comment.classList.toggle('collapsed');

                // Update button text
                const replyCount = e.target.getAttribute('data-reply-count');
                if (replyCount) {
                    const replyText = replyCount === '1' ? 'reply' : 'replies';
                    e.target.textContent = isCollapsed ? `− ${replyCount} ${replyText}` : `+ ${replyCount} ${replyText}`;
                }
                e.stopPropagation();
            }

            // Handle clicking on expand banner or collapsed replies
            const collapsedReplies = e.target.closest('.comment.collapsed .replies-wrapper');

            if (collapsedReplies) {
                const comment = e.target.closest('.comment');
                if (comment && comment.classList.contains('collapsed')) {
                    comment.classList.remove('collapsed');
                    const btn = comment.querySelector('.collapse-btn');
                    if (btn) {
                        const replyCount = btn.getAttribute('data-reply-count');
                        if (replyCount) {
                            const replyText = replyCount === '1' ? 'reply' : 'replies';
                            btn.textContent = `− ${replyCount} ${replyText}`;
                        }
                    }
                    e.stopPropagation();
                }
            }
        });
    }

    // Fetch and render comments
    async render() {
        // Clear the target element
        this.targetElement.innerHTML = '';

        try {
            // Convert URL and fetch data FIRST
            const apiUrl = this.convertToApiUrl(this.targetUrl);
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${response.status}`);
            }

            const data = await response.json();

            // Extract data needed for header
            const mainPost = data.thread.post;
            const postId = mainPost.uri.split('/').pop();
            const threadUrl = `https://bsky.app/profile/${mainPost.author.did}/post/${postId}`;

            // Count total comments recursively
            const countComments = (replies) => {
                let count = 0;
                for (const reply of replies) {
                    if (reply.post) {
                        count++;
                        if (reply.replies) {
                            count += countComments(reply.replies);
                        }
                    }
                }
                return count;
            };

            const replies = data.thread.replies || [];
            const totalComments = countComments(replies);

            // Create and append the header OUTSIDE shadow DOM
            const header = document.createElement('div');
            header.className = 'comments-header';
            header.innerHTML = `
                <h3 class="comments-title">
                    ${totalComments > 0 ? `${totalComments} ` : ''}comments
                    <a href="#bsky-comments" title="Copy link to this section">🔗</a>
                </h3>
                <br>
                via <a href="${threadUrl}" target="_blank" rel="noopener noreferrer">
                    @${mainPost.author.handle}/post/${postId}
                </a>
            `;
            this.targetElement.appendChild(header);

            // Create container for shadow DOM
            const shadowContainer = document.createElement('div');
            this.targetElement.appendChild(shadowContainer);

            // Create shadow root in the container
            this.shadowRoot = shadowContainer.attachShadow({ mode: 'open' });

            // Load CSS into shadow DOM
            await this.loadStyles();

            // Sort top-level replies by date (oldest first)
            replies.sort((a, b) => {
                if (!a.post || !b.post) return 0;
                const dateA = new Date(a.post.record?.createdAt || a.post.indexedAt || 0);
                const dateB = new Date(b.post.record?.createdAt || b.post.indexedAt || 0);
                return dateA - dateB;
            });

            // Render the comments
            const commentsHtml = this.renderToString(
                <div class="comments-container">
                    <div class="root-post comment">
                        <div class="root-post-header">
                            <a href={`https://bsky.app/profile/${mainPost.author.did}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="author-link">
                                <img src={this.thumbnailify(mainPost.author.avatar) || ''}
                                    alt={mainPost.author.handle}
                                    class="avatar-small" />
                                <span class="author-name">{mainPost.author.displayName || mainPost.author.handle}</span>
                                <span class="author-handle">@{mainPost.author.handle}</span>
                            </a>
                        </div>
                        <div class="root-post-content">
                            {this.processTextWithFacets(mainPost.record?.text || '', mainPost.record?.facets || [])}
                        </div>
                        {(mainPost.embed || mainPost.record?.embed) && (
                            (() => {
                                const embed = mainPost.embed || mainPost.record?.embed;
                                // Handle recordWithMedia type
                                if (embed.record?.record) {
                                    const record = embed.record.record;
                                    return (
                                        <div class="embed-external">
                                            <a href={`https://bsky.app/profile/${record.author.did}/post/${record.uri.split('/').pop()}`}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                <div class="embed-title">
                                                    {record.author.displayName || record.author.handle}
                                                    <span style="color: #71717a; font-weight: normal; margin-left: 4px;">
                                                        @{record.author.handle}
                                                    </span>
                                                </div>
                                                <div style="color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;">
                                                    {record.value?.text || ''}
                                                </div>
                                            </a>
                                        </div>
                                    );
                                }
                                // Handle simple record embed
                                else if (embed.record) {
                                    return (
                                        <div class="embed-external">
                                            <a href={`https://bsky.app/profile/${embed.record.author?.did}/post/${embed.record.uri.split('/').pop()}`}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                <div class="embed-title">
                                                    {embed.record.author?.displayName || embed.record.author?.handle || 'Unknown'}
                                                    <span style="color: #71717a; font-weight: normal; margin-left: 4px;">
                                                        @{embed.record.author?.handle || 'unknown'}
                                                    </span>
                                                </div>
                                                <div style="color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;">
                                                    {embed.record.value?.text || embed.record.text || ''}
                                                </div>
                                            </a>
                                        </div>
                                    );
                                }
                                return null;
                            })()
                        )}
                        <div class="root-post-footer">
                            <a href={threadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="reply-button">
                                ↩ Reply on Bluesky
                            </a>
                        </div>
                    </div>
                    <div class="comment-thread">
                        {replies.length > 0 ? (
                            replies.filter(reply => reply.post).map(reply =>
                                this.createComment(reply, 0)
                            )
                        ) : (
                            <div class="no-comments">No comments yet.</div>
                        )}
                    </div>
                </div>
            );

            // Add comments to shadow DOM
            const container = document.createElement('div');
            container.innerHTML = commentsHtml;
            this.shadowRoot.appendChild(container.firstElementChild);

            // Setup event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Error loading comments:', error);

            // Create error header if not already created
            if (!this.targetElement.querySelector('.comments-header')) {
                const errorHeader = document.createElement('div');
                errorHeader.className = 'comments-header';
                errorHeader.innerHTML = `<h3 class="comments-title">Comments</h3>`;
                this.targetElement.appendChild(errorHeader);
            }

            // Show error message
            const errorContainer = document.createElement('div');
            errorContainer.innerHTML = `
                <div class="error" style="padding: 20px; color: #dc3545;">
                    Failed to load comments: ${error.message}
                </div>
            `;
            this.targetElement.appendChild(errorContainer);
        }
    }
}

// JSX pragma
function h(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.length > 1 ? children : children[0]
        }
    };
}

// Export for use as a module
export default BskyComments;