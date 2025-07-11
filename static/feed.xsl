<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
    <xsl:template match="/">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
            <head>
                <title>
                    <xsl:choose>
                        <xsl:when test="/rss/channel/title">
                            <xsl:value-of select="/rss/channel/title" />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="/atom:feed/atom:title" />
                        </xsl:otherwise>
                    </xsl:choose>
                    - Feed </title>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style type="text/css">
                    :root {
                    --bg: #0a0a0f;
                    --surface: #13131a;
                    --text: #e1e1e6;
                    --text-dim: #8b8b96;
                    --accent: #7c7cff;
                    --accent-hover: #9999ff;
                    --border: #2a2a35;
                    }

                    * {
                    box-sizing: border-box;
                    }

                    body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica
                    Neue", Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: var(--text);
                    background-color: var(--bg);
                    }

                    .container {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 1rem 1rem;
                    }

                    .notice {
                    background-color: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 0.5rem;
                    padding: 1rem 1.25rem;
                    margin-bottom: 2rem;
                    }

                    .notice-title {
                    margin: 0 0 0.5rem 0;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--accent);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    }

                    .notice-text {
                    margin: 0;
                    font-size: 0.875rem;
                    color: var(--text-dim);
                    }

                    h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    }

                    h2 {
                    margin: 3rem 0 1.5rem 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-dim);
                    }

                    .feed-header {
                    margin-bottom: 2rem;
                    }

                    .feed-description {
                    margin: 1rem 0;
                    color: var(--text-dim);
                    }

                    .feed-icon {
                    display: inline-block;
                    width: 1.25rem;
                    height: 1.25rem;
                    margin-right: 0.5rem;
                    vertical-align: text-bottom;
                    fill: var(--accent);
                    }

                    a {
                    color: var(--accent);
                    text-decoration: none;
                    transition: color 0.2s ease;
                    }

                    a:hover {
                    color: var(--accent-hover);
                    }

                    .website-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    }

                    .item {
                    margin-top: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    }

                    .item:last-child {
                    border-bottom: none;
                    }

                    .item-title {
                    margin: 0 0 0.25rem 0;
                    font-size: 1.125rem;
                    font-weight: 600;
                    line-height: 1.4;
                    }

                    .item-date {
                    font-size: 0.875rem;
                    color: var(--text-dim);
                    }

                    .arrow {
                    display: inline-block;
                    transition: transform 0.2s ease;
                    }

                    a:hover .arrow {
                    transform: translateX(2px);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="notice">
                        <p class="notice-title">
                            <xsl:choose>
                                <xsl:when test="/rss">RSS Feed</xsl:when>
                                <xsl:otherwise>Atom Feed</xsl:otherwise>
                            </xsl:choose>
                        </p>
                        <p class="notice-text">Subscribe by copying the URL from your address bar
                            into your feed reader.</p>
                    </div>

                    <header class="feed-header">
                        <h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round"
                                    stroke-linejoin="round" stroke-width="1.5"
                                    d="M12 19c0-4.2-2.8-7-7-7m14 7c0-8.4-5.6-14-14-14m0 14.01l.01-.011" />
                            </svg>
                            <xsl:choose>
                                <xsl:when test="/rss/channel/title">
                                    <xsl:value-of select="/rss/channel/title" />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="/atom:feed/atom:title" />
                                </xsl:otherwise>
                            </xsl:choose>
                        </h1>

                        <xsl:if test="/rss/channel/description or /atom:feed/atom:subtitle">
                            <p class="feed-description">
                                <xsl:choose>
                                    <xsl:when test="/rss/channel/description">
                                        <xsl:value-of select="/rss/channel/description" />
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:value-of select="/atom:feed/atom:subtitle" />
                                    </xsl:otherwise>
                                </xsl:choose>
                            </p>
                        </xsl:if>

                        <xsl:variable name="website-url">
                            <xsl:choose>
                                <xsl:when test="/rss/channel/link">
                                    <xsl:value-of select="/rss/channel/link" />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of
                                        select="/atom:feed/atom:link[@rel='alternate']/@href" />
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>

                        <xsl:if test="$website-url != ''">
                            <a class="website-link" target="_blank" href="{$website-url}"> Visit
                                website <span class="arrow">→</span>
                            </a>
                        </xsl:if>
                    </header>

                    <section>
                        <h2>Recent Posts</h2>

                        <!-- RSS Items -->
                        <xsl:for-each select="/rss/channel/item">
                            <article class="item">
                                <h3 class="item-title">
                                    <a target="_blank" href="{link}">
                                        <xsl:value-of select="title" />
                                    </a>
                                </h3>
                                <time class="item-date">
                                    <xsl:value-of select="pubDate" />
                                </time>
                            </article>
                        </xsl:for-each>

                        <!-- Atom Entries -->
                        <xsl:for-each select="/atom:feed/atom:entry">
                            <article class="item">
                                <h3 class="item-title">
                                    <a target="_blank">
                                        <xsl:attribute name="href">
                                            <xsl:choose>
                                                <xsl:when test="atom:link[@rel='alternate']/@href">
                                                    <xsl:value-of
                                                        select="atom:link[@rel='alternate']/@href" />
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <xsl:value-of select="atom:link/@href" />
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:attribute>
                                        <xsl:value-of select="atom:title" />
                                    </a>
                                </h3>
                                <time class="item-date">
                                    <xsl:choose>
                                        <xsl:when test="atom:updated">
                                            <xsl:value-of select="atom:updated" />
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of select="atom:published" />
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </time>
                            </article>
                        </xsl:for-each>
                    </section>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>