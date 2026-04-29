'use client';

import { useEffect, useRef, useState } from 'react';

interface PanoramaViewerProps {
  post: any;
  author: any;
  currentUser: any;
  darkMode: boolean;
  onClose: () => void;
  onDelete: () => void;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function PanoramaViewer({ post, author, currentUser, darkMode, onClose, onDelete }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes_count || 0);

  const API = 'https://omnisee-backend.onrender.com';

  useEffect(() => {
    if (!containerRef.current || !post?.media_url) return;

    let mounted = true;
    let viewer: any;
    let resizeHandler: (() => void) | null = null;

    const init = async () => {
      try {
        const Marzipano = (await import('marzipano')).default;
        if (!mounted || !containerRef.current) return;

        viewer = new Marzipano.Viewer(containerRef.current, {
          stageType: 'webgl',
        });

        const source = Marzipano.ImageUrlSource.fromString(
          post.media_url,
          { corsWithCredentials: false }
        );

        const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
        const limiter = Marzipano.RectilinearView.limit.traditional(
          4000,
          (120 * Math.PI) / 180
        );
        const view = new Marzipano.RectilinearView(
          { yaw: 0, pitch: 0, roll: 0, fov: Math.PI / 2 },
          limiter
        );

        const scene = viewer.createScene({
          source,
          geometry,
          view,
          pinFirstLevel: true,
        });

        scene.switchTo();

        const controls = viewer.controls();
        controls.registerMethod(
          'scrollZoom',
          new Marzipano.ScrollZoomControlMethod()
        );
        controls.registerMethod('drag', new Marzipano.DragControlMethod());
        controls.registerMethod(
          'pinchZoom',
          new Marzipano.PinchZoomControlMethod()
        );

        resizeHandler = () => viewer.resize();
        window.addEventListener('resize', resizeHandler);

        if (mounted) setLoading(false);
      } catch (err) {
        console.error('Marzipano init error:', err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (viewer && typeof viewer.destroy === 'function') {
        viewer.destroy();
      }
    };
  }, [post?.media_url]);

  // Fetch comments
  useEffect(() => {
    if (!post?.id) return;
    fetch(`${API}/api/posts/${post.id}/comments`)
      .then(res => res.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));
  }, [post?.id]);

  const handleLike = async () => {
    if (!post?.id || liked) return;
    try {
      await fetch(`${API}/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      setLikeCount(c => c + 1);
      setLiked(true);
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !post?.id || !currentUser?.id) return;
    try {
      const res = await fetch(`${API}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, text: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [{
          ...data.comment,
          username: currentUser.username,
          displayName: currentUser.display_name,
          avatarUrl: currentUser.avatar_url,
        }, ...prev]);
        setCommentText('');
      }
    } catch (err) {
      console.error('Comment failed', err);
    }
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current?.parentElement;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const avatarUrl = (u: any) => u?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u?.username || 'user'}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        background: darkMode ? '#0a0a0a' : '#ffffff',
      }}
      onClick={onClose}
    >
      {/* Left - Viewer */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: '#000',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Marzipano Canvas */}
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Loading */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 10 }}>
            <div style={{ color: '#fff', fontSize: 14 }}>Loading panorama...</div>
          </div>
        )}

        {/* Error fallback */}
        {error && post?.media_url && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 10 }}>
            <img src={post.media_url} alt="360 panorama" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        )}

        {/* Top Left Buttons */}
        <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 20 }}>
          <button
            onClick={onClose}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
            title="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post?.caption || 'OmniSee 360', url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
            title="Share"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        {/* Bottom Left Map */}
        <div style={{ position: 'absolute', bottom: 24, left: 24, width: 140, height: 100, borderRadius: 10, overflow: 'hidden', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <div style={{ width: '100%', height: '100%', background: '#e5e7eb', position: 'relative' }}>
            {/* Map placeholder pattern */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <rect width="100%" height="100%" fill="#f3f4f6" />
              <path d="M0 50 Q35 20 70 50 T140 50" fill="none" stroke="#d1d5db" strokeWidth="2" />
              <path d="M0 70 Q35 40 70 70 T140 70" fill="none" stroke="#d1d5db" strokeWidth="2" />
              <circle cx="70" cy="50" r="3" fill="#6366F1" />
            </svg>
            <div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, color: '#4b5563', background: 'rgba(255,255,255,0.8)', padding: '2px 4px', borderRadius: 4 }}>
              {post?.location || 'Map'}
            </div>
          </div>
        </div>

        {/* Bottom Center Controls */}
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4, zIndex: 20, background: 'rgba(0,0,0,0.75)', borderRadius: 10, padding: '6px 10px' }}>
          <button onClick={toggleFullscreen} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Fullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Copy link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
          <button style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Gyroscope">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Zoom">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        style={{
          width: 400,
          minWidth: 360,
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          background: darkMode ? '#0f0f0f' : '#ffffff',
          color: darkMode ? '#ffffff' : '#111827',
          borderLeft: `1px solid ${darkMode ? '#262626' : '#e5e7eb'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${darkMode ? '#262626' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={avatarUrl(author)}
              alt=""
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${darkMode ? '#333' : '#e5e7eb'}` }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{author?.display_name || author?.username || 'User'}</div>
              <div style={{ color: darkMode ? '#a1a1aa' : '#6b7280', fontSize: 14 }}>@{author?.username || 'user'}</div>
            </div>
          </div>
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: darkMode ? '#a1a1aa' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Location */}
          <div style={{ color: darkMode ? '#a1a1aa' : '#6b7280', fontSize: 13, marginBottom: 6 }}>
            Post Location : {post?.location || 'Unknown location'}
          </div>

          {/* Title */}
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>
            {post?.caption || 'Untitled'}
          </div>

          {/* Time */}
          <div style={{ color: darkMode ? '#a1a1aa' : '#9ca3af', fontSize: 13, marginBottom: 16 }}>
            {timeAgo(post?.created_at)}
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${darkMode ? '#262626' : '#e5e7eb'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: darkMode ? '#a1a1aa' : '#6b7280', fontSize: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{(post?.views_count || 0).toLocaleString()} Views</span>
            </div>
            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: liked ? '#ef4444' : (darkMode ? '#a1a1aa' : '#6b7280'),
                fontSize: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{likeCount} likes</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: darkMode ? '#a1a1aa' : '#6b7280', fontSize: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span>{comments.length} Comments</span>
            </div>
          </div>

          {/* Comments Header */}
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            Comments ({comments.length})
          </div>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {comments.length === 0 && (
              <div style={{ color: darkMode ? '#71717a' : '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                No comments yet. Be the first to comment!
              </div>
            )}
            {comments.map((comment: any) => (
              <div key={comment.id} style={{ display: 'flex', gap: 12 }}>
                <img
                  src={avatarUrl({ username: comment.username, avatar_url: comment.avatarUrl })}
                  alt=""
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{comment.displayName || comment.username}</span>
                      <span style={{ color: darkMode ? '#a1a1aa' : '#9ca3af', fontSize: 13 }}>@{comment.username}</span>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: darkMode ? '#a1a1aa' : '#9ca3af', cursor: 'pointer', padding: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {comment.text}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 12, color: darkMode ? '#71717a' : '#9ca3af', fontSize: 12 }}>
                    <span>{timeAgo(comment.created_at)}</span>
                    <span>{comment.likes_count || 0} like</span>
                    <span>0 Reply</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Comment Input or Login */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${darkMode ? '#262626' : '#e5e7eb'}`, background: darkMode ? '#0f0f0f' : '#ffffff' }}>
          {currentUser ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Write a comment..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${darkMode ? '#333' : '#e5e7eb'}`,
                  background: darkMode ? '#1a1a1a' : '#f9fafb',
                  color: darkMode ? '#fff' : '#111',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#6366F1',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                  opacity: commentText.trim() ? 1 : 0.5,
                }}
              >
                Post
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: '#6366F1',
                color: 'white',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Log in to comment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
