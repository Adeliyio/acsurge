from fastapi import APIRouter, Depends, HTTPException, Response, Query
from fastapi.responses import XMLResponse, PlainTextResponse
from typing import List, Optional
import os

from .models.blog_models import (
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostList,
    BlogPostDetail,
    BlogPostResponse,
    BlogPostSearch,
    PostStatus,
    PostCategory
)
from .services.blog_service import BlogService
from .services.seo_service import SEOService
from ..auth import require_admin
from ..models.user import User

# Initialize router
router = APIRouter()

# Initialize services
blog_service = BlogService()
seo_service = SEOService()


@router.get("/", response_model=BlogPostResponse)
async def get_blog_posts(
    status: Optional[PostStatus] = Query(PostStatus.PUBLISHED, description="Filter by post status"),
    category: Optional[PostCategory] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
    offset: int = Query(0, ge=0, description="Number of posts to skip"),
    sort_by: str = Query("published_at", regex="^(published_at|created_at|title|views)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    """Get list of blog posts with filtering and pagination"""
    
    try:
        search_params = BlogPostSearch(
            query="",  # Empty query for listing
            category=category,
            status=status,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return blog_service.search_posts(search_params)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")


@router.get("/search", response_model=BlogPostResponse)
async def search_blog_posts(
    q: str = Query(..., min_length=1, description="Search query"),
    category: Optional[PostCategory] = Query(None, description="Filter by category"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    status: Optional[PostStatus] = Query(PostStatus.PUBLISHED, description="Filter by post status"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
    offset: int = Query(0, ge=0, description="Number of posts to skip"),
    sort_by: str = Query("published_at", regex="^(published_at|created_at|title|views)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    """Search blog posts"""
    
    try:
        search_params = BlogPostSearch(
            query=q,
            category=category,
            tags=tags or [],
            status=status,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return blog_service.search_posts(search_params)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/categories/{category}", response_model=BlogPostResponse)
async def get_posts_by_category(
    category: PostCategory,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get posts by category"""
    
    try:
        search_params = BlogPostSearch(
            query="",
            category=category,
            status=PostStatus.PUBLISHED,
            limit=limit,
            offset=offset
        )
        
        return blog_service.search_posts(search_params)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts by category: {str(e)}")


@router.get("/tags/{tag}", response_model=BlogPostResponse)
async def get_posts_by_tag(
    tag: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get posts by tag"""
    
    try:
        search_params = BlogPostSearch(
            query="",
            tags=[tag],
            status=PostStatus.PUBLISHED,
            limit=limit,
            offset=offset
        )
        
        return blog_service.search_posts(search_params)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts by tag: {str(e)}")


@router.get("/{slug}", response_model=BlogPostDetail)
async def get_blog_post(slug: str):
    """Get a single blog post by slug"""
    
    try:
        post = blog_service.get_post_by_slug(slug)
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Only allow published posts for non-admin users
        if post.status != PostStatus.PUBLISHED:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return post
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch post: {str(e)}")


# Admin-only endpoints
@router.post("/", response_model=dict)
async def create_blog_post(
    post_data: BlogPostCreate,
    current_user: User = Depends(require_admin)
):
    """Create a new blog post (Admin only)"""
    
    try:
        slug = blog_service.create_post(post_data)
        
        if not slug:
            raise HTTPException(status_code=400, detail="Failed to create post - slug may already exist")
        
        return {"slug": slug, "message": "Post created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")


@router.put("/{slug}", response_model=dict)
async def update_blog_post(
    slug: str,
    post_data: BlogPostUpdate,
    current_user: User = Depends(require_admin)
):
    """Update an existing blog post (Admin only)"""
    
    try:
        success = blog_service.update_post(slug, post_data)
        
        if not success:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return {"message": "Post updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update post: {str(e)}")


@router.delete("/{slug}", response_model=dict)
async def delete_blog_post(
    slug: str,
    current_user: User = Depends(require_admin)
):
    """Delete a blog post (Admin only)"""
    
    try:
        success = blog_service.delete_post(slug)
        
        if not success:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return {"message": "Post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete post: {str(e)}")


@router.get("/admin/all", response_model=BlogPostResponse)
async def get_all_posts_admin(
    status: Optional[PostStatus] = Query(None, description="Filter by post status"),
    category: Optional[PostCategory] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_admin)
):
    """Get all posts including drafts (Admin only)"""
    
    try:
        search_params = BlogPostSearch(
            query="",
            category=category,
            status=status,  # Allow all statuses for admin
            limit=limit,
            offset=offset
        )
        
        return blog_service.search_posts(search_params)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")


# SEO endpoints
@router.get("/sitemap.xml", response_class=XMLResponse)
async def get_sitemap():
    """Generate XML sitemap for blog posts"""
    
    try:
        posts = blog_service.get_all_posts(status=PostStatus.PUBLISHED)
        additional_urls = seo_service.get_default_sitemap_entries()
        
        sitemap_xml = seo_service.generate_sitemap(posts, additional_urls)
        
        return XMLResponse(
            content=sitemap_xml,
            headers={"Content-Type": "application/xml; charset=utf-8"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate sitemap: {str(e)}")


@router.get("/rss.xml", response_class=XMLResponse)
async def get_rss_feed():
    """Generate RSS feed for blog posts"""
    
    try:
        posts = blog_service.get_all_posts(status=PostStatus.PUBLISHED)
        
        rss_xml = seo_service.generate_rss_feed(posts)
        
        return XMLResponse(
            content=rss_xml,
            headers={
                "Content-Type": "application/rss+xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate RSS feed: {str(e)}")


@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots_txt():
    """Generate robots.txt for blog"""
    
    try:
        robots_content = seo_service.generate_robots_txt()
        
        return PlainTextResponse(
            content=robots_content,
            headers={"Content-Type": "text/plain; charset=utf-8"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate robots.txt: {str(e)}")


# Analytics and engagement endpoints
@router.post("/{slug}/view")
async def track_post_view(slug: str):
    """Track a post view (for analytics)"""
    
    # TODO: Implement view tracking
    # This would typically update the post's view count
    # and send analytics events
    
    return {"message": "View tracked"}


@router.post("/{slug}/share")
async def track_post_share(
    slug: str,
    platform: str = Query(..., description="Social platform (twitter, linkedin, facebook, etc.)")
):
    """Track a post share (for analytics)"""
    
    # TODO: Implement share tracking
    # This would typically update the post's share count
    # and send analytics events
    
    return {"message": "Share tracked"}


# Utility endpoints
@router.get("/categories", response_model=List[str])
async def get_categories():
    """Get all available categories"""
    return [category.value for category in PostCategory]


@router.get("/popular", response_model=List[BlogPostList])
async def get_popular_posts(limit: int = Query(5, ge=1, le=10)):
    """Get popular blog posts"""
    
    try:
        all_posts = blog_service.get_all_posts(status=PostStatus.PUBLISHED)
        popular = blog_service.search_service.get_popular_posts(all_posts, limit)
        
        return popular
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch popular posts: {str(e)}")


@router.get("/trending", response_model=List[BlogPostList])
async def get_trending_posts(limit: int = Query(5, ge=1, le=10)):
    """Get trending blog posts"""
    
    try:
        all_posts = blog_service.get_all_posts(status=PostStatus.PUBLISHED)
        trending = blog_service.search_service.get_trending_posts(all_posts, limit)
        
        return trending
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending posts: {str(e)}")
