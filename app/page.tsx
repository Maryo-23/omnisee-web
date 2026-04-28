'use client';
import { useState, CSSProperties, useEffect, useRef } from 'react';

const API = 'https://omnisee-backend.onrender.com';

const styles: Record<string, any> = {
  container: (isDark: boolean) => ({ minHeight: '100vh', background: isDark ? 'linear-gradient(180deg, #000000 0%, #121212 100%)' : 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)', color: isDark ? 'white' : '#262626', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }),
  topNav: (isDark: boolean) => ({ position: 'fixed', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${isDark ? '#262626' : '#DBDBDB'}` }),
  floatingNav: (isDark: boolean) => ({ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 24, padding: '12px 32px', background: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(20px)', borderRadius: 50, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, zIndex: 50 }),
  feed: { padding: 0, marginTop: 50, marginBottom: 80, maxWidth: 470, margin: '50px auto 80px' },
  feedCard: (isDark: boolean) => ({ background: isDark ? '#000000' : '#FFFFFF', marginBottom: 12, border: `1px solid ${isDark ? '#262626' : '#DBDBDB'}` }),
  feedHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: 14 },
  feedAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)', objectFit: 'cover' },
  feedUsername: { fontWeight: 600, fontSize: '0.9rem' },
  feedLocation: (isDark: boolean) => ({ fontSize: '0.75rem', color: isDark ? '#A8A8A8' : '#8E8E8E' }),
  feedImage: { width: '100%', aspectRatio: '1/1', background: 'linear-gradient(135deg, #1DA1F2, #0A66C2)' },
  feedActions: { display: 'flex', gap: 16, padding: '12px 14px' },
  feedIcon: (isDark: boolean) => ({ width: 24, height: 24, cursor: 'pointer', color: isDark ? 'white' : '#262626' }),
  feedActionsRight: { marginLeft: 'auto', display: 'flex', gap: 12 },
  feedLikeCount: { fontWeight: 600, fontSize: '0.9rem', padding: '0 14px' },
  feedCaption: { padding: '0 14px 14px', fontSize: '0.9rem' },
  feedCaptionUser: { fontWeight: 600, marginRight: 6 },
  feedTime: (isDark: boolean) => ({ padding: '0 14px 14px', fontSize: '0.75rem', color: isDark ? '#A8A8A8' : '#8E8E8E' }),
  hero: { position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(236,72,153,0.1) 0%, transparent 50%)' },
  heroGrid: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(99,102,241,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.5 },
  heroContent: { position: 'relative', zIndex: 10, textAlign: 'center', padding: '20px', maxWidth: '800px' },
  heroBadget: { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'rgba(26,26,46,0.6)', borderRadius: '50px', border: '1px solid rgba(45,45,74,0.8)', marginBottom: '30px' },
  heroTitle: { fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '24px' },
  heroGradient: { background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubtitle: { fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#A1A1AA', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' },
  btn: (isDark: boolean) => ({ padding: '18px 36px', borderRadius: '50px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s', border: 'none', background: isDark ? 'white' : 'white', color: isDark ? '#0F0F23' : '#0F0F23' }),
  btnPrimary: (isDark: boolean) => ({ background: isDark ? 'white' : 'white', color: '#0F0F23' }),
  btnSecondary: (isDark: boolean) => ({ background: isDark ? 'transparent' : 'white', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#DBDBDB'}`, color: isDark ? 'white' : '#262626' }),
  section: { padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' },
  card: { background: 'rgba(26,26,46,0.5)', borderRadius: '24px', border: '1px solid rgba(45,45,74,0.5)', padding: '40px', transition: 'all 0.3s' },
  showcase: { display: 'flex', gap: '30px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' },
  showcaseCard: { minWidth: '80vw', aspectRatio: '16/9', borderRadius: '30px', overflow: 'hidden', position: 'relative', cursor: 'pointer', scrollSnapAlign: 'center' },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'bold', background: 'linear-gradient(135deg, #6366F1, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLabel: { color: '#A1A1AA', marginTop: '8px' },
  footer: { padding: '40px 20px', borderTop: '1px solid rgba(45,45,74,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)' },
  modalContent: { background: '#1A1A2E', borderRadius: '24px', padding: '50px', maxWidth: '420px', width: '90%', border: '1px solid rgba(45,45,74,0.8)' },
  input: { width: '100%', padding: '16px 20px', borderRadius: '12px', background: 'rgba(15,15,35,0.8)', border: '1px solid rgba(45,45,74,0.8)', color: 'white', fontSize: '1rem', marginBottom: '16px' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, transition: 'all 0.3s' },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.3rem' },
  navBtn: { padding: '12px 24px', borderRadius: '30px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s' },
  floatingBtn: { width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#FFD700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
};

export default function Home() {
  const [mode, setMode] = useState<'signup'|'login'|'changepassword'|'editprofile'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'feed'|'profile'>('feed');
  const [feedTab, setFeedTab] = useState<'foryou'|'following'|'topics'>('foryou');
  const [albums, setAlbums] = useState<{id: string, name: string, cover: string, photos: string[], followers: string[], topic?: string}[]>([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [viewingPost, setViewingPost] = useState<any>(null);
  const [viewRotation, setViewRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const userPosts = posts.filter(p => p.user_id === user?.id || p.username === user?.username);
  
  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`https://omnisee-backend.onrender.com/api/posts/${postId}`, { method: 'DELETE' });
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const viewPost = (post: any) => {
    setViewingPost(post);
  };
  const [following, setFollowing] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [customTopics, setCustomTopics] = useState<{id: string, name: string, description: string, emoji: string}[]>([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicEmoji, setNewTopicEmoji] = useState('');

  const topics = [
    { id: 'mountains', name: 'Mountains', emoji: '🏔️', color: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
    { id: 'water', name: 'Water', emoji: '🌊', color: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
    { id: 'city', name: 'City', emoji: '🏙️', color: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { id: 'nature', name: 'Nature', emoji: '🌲', color: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
    { id: 'sunset', name: 'Sunset', emoji: '🌅', color: 'linear-gradient(135deg, #f97316, #ec4899)' },
    { id: 'space', name: 'Space', emoji: '🚀', color: 'linear-gradient(135deg, #1e293b, #6366f1)' },
  ];

  const isDark = darkMode;
  const containerStyle = { minHeight: '100vh', background: isDark ? 'linear-gradient(180deg, #000000 0%, #121212 100%)' : 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)', color: isDark ? 'white' : '#262626', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' };
  const topNavStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${isDark ? '#262626' : '#DBDBDB'}` };
  const floatingNavStyle = { position: 'fixed' as const, bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 24, padding: '12px 32px', background: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(20px)', borderRadius: 50, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, zIndex: 50 };
  const feedCardStyle = { background: isDark ? '#000000' : '#FFFFFF', marginBottom: 12, border: `1px solid ${isDark ? '#262626' : '#DBDBDB'}` };
  const feedIconStyle = { width: 24, height: 24, cursor: 'pointer' as const, color: isDark ? 'white' : '#262626' };
  const textColor = isDark ? 'white' : '#262626';
  const secondaryText = isDark ? '#A8A8A8' : '#8E8E8E';

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const savedUser = JSON.parse(saved);
      setUser(savedUser);
      setView('feed');
    } else {
      setShowModal(true);
      setMode('signup');
    }
    const savedFollowing = localStorage.getItem('following');
    if (savedFollowing) setFollowing(JSON.parse(savedFollowing));
    fetchPosts();
  }, []);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user?.id]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('https://omnisee-backend.onrender.com/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const username = mode === 'signup' ? (form.elements.namedItem('username') as HTMLInputElement).value : '';
    
    try {
      if (mode === 'changepassword') {
        const oldPassword = (form.elements.namedItem('oldPassword') as HTMLInputElement).value;
        const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
        const res = await fetch('https://omnisee-backend.onrender.com/api/users/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, oldPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        setSuccess('Password changed successfully!');
        setTimeout(() => { setShowModal(false); setMode('login'); }, 2000);
        setLoading(false);
        return;
      }

      if (mode === 'editprofile' && user) {
        // Use user state directly (already updated via onChange)
        localStorage.setItem('user', JSON.stringify(user));
        setShowModal(false);
        return;
      }

      const endpoint = mode === 'signup' ? '/api/register' : '/api/login';
      const body = mode === 'signup' 
        ? { username, email, password, displayName: username }
        : { email, password };
      const res = await fetch('https://omnisee-backend.onrender.com' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      if (mode === 'login') {
        const existingUser = localStorage.getItem('user');
        const existingUsername = existingUser ? JSON.parse(existingUser).username : null;
        const userToSave = { ...data.user, username: existingUsername || data.user.username };
        localStorage.setItem('user', JSON.stringify(userToSave));
        setUser(userToSave);
        fetchPosts();
        setSuccess('Logged in successfully!');
        setShowModal(false);
      } else {
        setSuccess('Account created! Please sign in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.id);
      formData.append('caption', uploadCaption);
      formData.append('mediaType', selectedFile.type.startsWith('video/') ? 'video' : 'photo');
      
      const res = await fetch('https://omnisee-backend.onrender.com/api/posts', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSuccess('Posted successfully!');
      setUploadCaption('');
      setSelectedFile(null);
      fetchPosts();
      setTimeout(() => { setShowUpload(false); setView('profile'); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const [showFeed, setShowFeed] = useState(true);

  const features = [
    { icon: 'Glob', title: 'Federated', desc: 'Connect with Mastodon, PixelFed, and more' },
    { icon: 'Phone', title: 'Native', desc: 'iOS, Android, Web - all synced' },
    { icon: 'Target', title: 'No Ads', desc: 'No tracking. No profiling. Ever' },
    { icon: 'Gem', title: 'Free', desc: 'Open source. Free forever' },
  ];

  const [showModal, setShowModal] = useState(false);

  return (
    <div style={styles.container(darkMode)}>
      {!user && view !== 'profile' && (
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.heroGrid} />
          
          <div style={styles.heroContent}>
            <div style={styles.heroBadget}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ color: '#A1A1AA', fontSize: '0.9rem' }}>Join the spatial web</span>
            </div>
            
            <h1 style={styles.heroTitle}>
              Your world in<br />
              <span style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OmniSee</span>
            </h1>
            
            <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#A1A1AA', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
              Share immersive 360 experiences. Connect globally. Own your visual journey.
            </p>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { setMode('signup'); setShowModal(true); }} style={{ padding: '18px 36px', borderRadius: '50px', fontWeight: 600, fontSize: '1.1rem', border: 'none', background: '#262626', color: 'white' }}>
                Get Started
              </button>
              {user ? (
                <button onClick={() => setShowFeed(true)} style={{ padding: '18px 36px', borderRadius: '50px', fontWeight: 600, fontSize: '1.1rem', border: '2px solid #262626', background: 'white', color: '#262626' }}>
                  View Feed
                </button>
              ) : (
                <button onClick={() => { setMode('login'); setShowModal(true); }} style={{ padding: '18px 36px', borderRadius: '50px', fontWeight: 600, fontSize: '1.1rem', border: '2px solid #262626', background: 'white', color: '#262626' }}>
                  Sign In
                </button>
              )}
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#71717A', opacity: 0.6 }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>SCROLL</span>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </section>
      )}

      {view === 'feed' && (
        <div style={styles.feed}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: secondaryText, marginBottom: 20 }}>Welcome to OmniSee!</p>
            <p style={{ color: secondaryText, fontSize: '0.9rem' }}>Follow users and topics to see content in your feed.</p>
          </div>
        </div>
      )}

      {view === 'profile' && user && (
        <div key={user.username + user.display_name + user.bio + user.avatar_url} style={{ paddingTop: 60, paddingBottom: 100 }}>
          <div style={{ padding: '20px 20px 0', borderBottom: `1px solid ${darkMode ? '#262626' : '#DBDBDB'}`, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, maxWidth: 470, margin: '0 auto' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setMode('editprofile'); setShowModal(true); }}>
                <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} style={{ width: 77, height: 77, borderRadius: '50%', background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)', pointerEvents: 'none', userSelect: 'none' }} alt="" />
                <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#FFD700', borderRadius: '50%', padding: 4 }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
                  <div><div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{posts.filter(p => p.user_id === user?.id || p.username === user?.username).length}</div><div style={{ fontSize: '0.85rem', color: secondaryText }}>posts</div></div>
                  <div><div style={{ fontWeight: 600, fontSize: '1.1rem' }}>0</div><div style={{ fontSize: '0.85rem', color: secondaryText }}>followers</div></div>
                  <div><div style={{ fontWeight: 600, fontSize: '1.1rem' }}>0</div><div style={{ fontSize: '0.85rem', color: secondaryText }}>following</div></div>
                </div>
              </div>
            </div>
            <div style={{ maxWidth: 470, margin: '20px auto 0' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>@{user.username}</div>
              {user.display_name && <div style={{ fontSize: '0.9rem', color: secondaryText, marginBottom: 4 }}>{user.display_name}</div>}
              {user.bio && <div style={{ marginTop: 12, fontSize: '0.95rem' }}>{user.bio}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button 
                  onClick={() => { setMode('editprofile'); setShowModal(true); }}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${darkMode ? '#262626' : '#DBDBDB'}`, background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => { localStorage.removeItem('user'); setUser(null); setView('feed'); }}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 20px', maxWidth: 470, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', borderRadius: 12, marginBottom: 20 }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Federated (ActivityPub & AT Protocol)</div>
                <div style={{ fontSize: '0.75rem', color: secondaryText }}>Your federated address:</div>
                <div style={{ fontSize: '0.75rem', color: '#8B5CF6', fontFamily: 'monospace' }}>@{user?.username}@{user?.customDomain || 'omnisee.app'}</div>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://omnisee.app/ap/users/${user?.username}`);
                }}
                style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Copy
              </button>
            </div>
          </div>
          <div style={{ padding: '20px 20px', maxWidth: 470, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600 }}>Albums</h3>
              <button 
                onClick={() => setShowAlbumModal(true)}
                style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#0095F6', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                + New Album
              </button>
            </div>
            {albums.length === 0 ? (
              <p style={{ color: secondaryText, fontSize: '0.9rem' }}>No albums yet. Create one to organize your photos!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {albums.map((album, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedAlbum(i)}
                    style={{ aspectRatio: '1/1', background: album.cover || '#262626', cursor: 'pointer', position: 'relative' }}
                  >
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', fontSize: '0.75rem', fontWeight: 600 }}>{album.name}</div>
                  </div>
                ))}
</div>
        )}

      {viewingPost && (
        <div style={styles.modal} onClick={() => setViewingPost(null)}>
          <div style={{ ...styles.modalContent, background: isDark ? '#1A1A2E' : '#FFFFFF', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', maxWidth: '1000px', width: '95%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {viewingPost.media_type === 'photo' ? (
              <div 
                onMouseDown={(e) => { setIsDragging(true); setLastPos({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={(e) => {
                  if (isDragging) {
                    const dx = e.clientX - lastPos.x;
                    setViewRotation(r => ({ ...r, y: r.y + dx * 0.5 }));
                    setLastPos({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                style={{ 
                  width: '100%', 
                  height: '500px', 
                  overflow: 'hidden', 
                  cursor: isDragging ? 'grabbing' : 'grab',
                  background: '#000',
                  position: 'relative',
                  perspective: '1000px'
                }}
              >
                <img 
                  src={viewingPost.media_url} 
                  alt="360" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: `rotateY(${viewRotation.y}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                  draggable={false}
                />
                <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 20, zIndex: 10 }}>
                  Click and drag to view 360
                </div>
              </div>
            ) : (
              <video 
                src={viewingPost.media_url} 
                controls 
                style={{ width: '100%', display: 'block' }}
                autoPlay
              />
            )}
            {viewingPost.caption && (
              <div style={{ padding: 16, color: isDark ? 'white' : '#262626' }}>
                {viewingPost.caption}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, padding: 16, borderTop: `1px solid ${isDark ? '#262626' : '#E5E5E5'}` }}>
              <button 
                onClick={() => { deletePost(viewingPost.id); setViewingPost(null); }}
                style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
              >
                Delete Post
              </button>
              <button 
                onClick={() => setViewingPost(null)}
                style={{ flex: 1, padding: '12px', background: isDark ? '#262626' : '#E5E5E5', color: isDark ? 'white' : '#262626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
          <div style={{ padding: '20px 20px', maxWidth: 470, margin: '0 auto' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Posts</h3>
            {userPosts.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {userPosts.map((post, i) => (
                  <div 
                    key={i} 
                    onClick={() => viewPost(post)}
                    onContextMenu={(e) => { e.preventDefault(); deletePost(post.id); }}
                    style={{ aspectRatio: '1/1', background: post.media_url ? `url(${post.media_url}) center/cover` : '#262626', cursor: 'pointer' }}
                  >
                    <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: 4, display: 'none' }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="white"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: secondaryText, textAlign: 'center', padding: '20px' }}>No posts yet. Upload your first 360 photo!</p>
            )}
          </div>
        </div>
      )}

      <div style={styles.topNav(darkMode)}>
        <span style={{ fontWeight: 'bold', fontSize: '1.5rem', background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Billabong, cursive' }}>OmniSee</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textColor, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
          {user ? (
            <div 
              onClick={() => setView(view === 'feed' ? 'profile' : 'feed')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)', padding: '6px 16px', borderRadius: 20 }}
            >
              <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} style={{ width: 24, height: 24, borderRadius: '50%', pointerEvents: 'none', userSelect: 'none' }} alt="" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>@{user.username}</span>
            </div>
          ) : (
            <>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth={2}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </>
          )}
        </div>
      </div>

      <nav style={styles.floatingNav(darkMode)}>
        {view === 'feed' ? (
          <>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'white' : '#8B5CF6'} strokeWidth={2} style={{ cursor: 'pointer' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <button style={styles.floatingBtn} onClick={() => { if (user) setShowUpload(true); else { setMode('signup'); setShowModal(true); } }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'white' : '#8B5CF6'} strokeWidth={2} style={{ cursor: 'pointer' }} onClick={() => { setMode('login'); setShowModal(true); }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
          </>
        ) : (
          <>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'white' : '#8B5CF6'} strokeWidth={2} style={{ cursor: 'pointer' }} onClick={() => setView('feed')}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <button style={styles.floatingBtn} onClick={() => { if (user) setShowUpload(true); else { setMode('signup'); setShowModal(true); } }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'white' : '#8B5CF6'} strokeWidth={2} style={{ cursor: 'pointer' }} onClick={() => { setMode('login'); setShowModal(true); }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
          </>
        )}
      </nav>

      <section style={{ ...styles.section, paddingTop: 80 }}>
        <div style={{ maxWidth: 470, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: `1px solid ${isDark ? '#262626' : '#DBDBDB'}`, paddingBottom: 12 }}>
            <button 
              onClick={() => setFeedTab('foryou')}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: feedTab === 'foryou' ? 'linear-gradient(135deg, #6366F1, #EC4899)' : 'transparent', color: feedTab === 'foryou' ? 'white' : secondaryText, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >
              For You
            </button>
            <button 
              onClick={() => setFeedTab('following')}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: feedTab === 'following' ? 'linear-gradient(135deg, #6366F1, #EC4899)' : 'transparent', color: feedTab === 'following' ? 'white' : secondaryText, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Following
            </button>
            <button 
              onClick={() => setFeedTab('topics')}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: feedTab === 'topics' ? 'linear-gradient(135deg, #6366F1, #EC4899)' : 'transparent', color: feedTab === 'topics' ? 'white' : secondaryText, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Topics
            </button>
          </div>

          {feedTab === 'topics' && (
            <div style={{ marginBottom: 24 }}>
              <input 
                style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626', marginBottom: 16 }}
                placeholder="Search topics..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
              />
              <button 
                onClick={() => setShowTopicModal(true)}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px dashed #8B5CF6', background: 'transparent', color: '#8B5CF6', cursor: 'pointer', fontSize: '0.9rem', marginBottom: 16 }}
              >
                + Create Custom Topic
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {(customTopics as any[]).filter(t => !topicSearch || t.name.toLowerCase().includes(topicSearch.toLowerCase())).map(topic => (
                  <div 
                    key={topic.id}
                    onClick={() => {
                      const topicAlbum = albums.find(a => a.topic === topic.id);
                      if (topicAlbum) {
                        setSelectedAlbum(albums.indexOf(topicAlbum));
                      } else {
                        setNewAlbumName(topic.name);
                        setShowAlbumModal(true);
                      }
                    }}
                    style={{ padding: 16, background: topic.color || 'rgba(99,102,241,0.3)', borderRadius: 12, cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{(topic as any).emoji || ''}</div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', marginTop: 8 }}>{(topic as any).name || topic.name}</div>
                    {(topic as any).description && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginTop: 4 }}>{(topic as any).description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedTab === 'foryou' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: secondaryText }}>Welcome to your feed! Follow users and topics to see content here.</p>
            </div>
          )}

          {feedTab === 'following' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              {following.length === 0 ? (
                <p style={{ color: secondaryText }}>You're not following anyone yet. Follow users to see their posts here!</p>
              ) : (
                <p style={{ color: secondaryText }}>You're following {following.length} user(s)</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section style={styles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ ...styles.card, background: isDark ? 'rgba(26,26,46,0.5)' : '#FFFFFF', border: `1px solid ${isDark ? 'rgba(45,45,74,0.5)' : '#E5E5E5'}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: 8, color: textColor }}>{f.title}</h3>
              <p style={{ color: secondaryText, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {!user && (
        <section style={{ ...styles.section, background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.1))' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'bold', marginBottom: 20 }}>Ready to dive in?</h2>
            <p style={{ fontSize: '1.2rem', color: '#A1A1AA', marginBottom: 40 }}>Join the spatial social revolution.</p>
            <button onClick={() => { setMode('signup'); setShowModal(true); }} style={{ ...styles.btn, background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white' }}>
              Create Free Account
            </button>
          </div>
        </section>
      )}

      <footer style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 'bold' }}>OmniSee</span>
          <span style={{ color: '#71717A' }}>-</span>
          <span style={{ color: '#A1A1AA' }}>360 Social</span>
        </div>
        <div style={{ display: 'flex', gap: 30, color: '#A1A1AA', fontSize: '0.9rem' }}>
          <a href="#" style={{ color: 'inherit' }}>Privacy</a>
          <a href="#" style={{ color: 'inherit' }}>Terms</a>
          <a href="#" style={{ color: 'inherit' }}>GitHub</a>
        </div>
      </footer>

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={{ ...styles.modalContent, background: isDark ? '#1A1A2E' : '#FFFFFF', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 30, color: isDark ? 'white' : '#262626' }}>
              {mode === 'signup' ? 'Join OmniSee' : mode === 'changepassword' ? 'Change Password' : mode === 'editprofile' ? 'Edit Profile' : 'Welcome Back'}
            </h3>
            <form onSubmit={handleSubmit}>
{mode === 'editprofile' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} id="avatarInput" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCropImage(reader.result as string);
                        setCropping(true);
                      };
                      reader.readAsDataURL(file);
                    }} />
                    <label htmlFor="avatarInput" style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #0095F6', pointerEvents: 'none' }} alt="" />
                      <div style={{ color: '#000000', fontSize: '0.85rem', marginTop: 8, fontWeight: 600 }}>Change profile photo</div>
                    </label>
                  </div>
                  <input style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} name="username" placeholder="Username" value={user?.username || ''} onChange={(e) => setUser(user ? { ...user, username: e.target.value } : null)} />
                  <input style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} name="name" placeholder="Real Name (optional)" value={user?.display_name || ''} onChange={(e) => setUser(user ? { ...user, display_name: e.target.value } : null)} />
                  <textarea style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626', minHeight: '80px', resize: 'vertical' }} name="bio" placeholder="Bio" value={user?.bio || ''} onChange={(e) => setUser(user ? { ...user, bio: e.target.value } : null)} />
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.85rem', color: secondaryText, display: 'block', marginBottom: 8 }}>Custom Domain (optional)</label>
                    <input style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} name="customDomain" placeholder="andrew.com" value={user?.customDomain || ''} onChange={(e) => setUser(user ? { ...user, customDomain: e.target.value } : null)} />
                    <p style={{ fontSize: '0.75rem', color: '#8B5CF6', marginTop: 4 }}>Your profile will be at @{user?.username}@yourdomain.com</p>
                    <p style={{ fontSize: '0.7rem', color: secondaryText, marginTop: 4 }}>Supports ActivityPub for Mastodon/PixelFed</p>
                  </div>
                </>
              ) : (
                <>
                  {mode === 'signup' && <input style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} name="username" placeholder="Username" required />}
                  <input style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} name="email" placeholder="Email" type="email" required />
                  <input style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} name="password" placeholder="Password" type="password" required />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                    <input type="checkbox" name="keepSignedIn" defaultChecked={false} />
                    <span style={{ fontSize: '0.85rem', color: isDark ? '#A1A1AA' : '#8E8E8E' }}>Keep me signed in</span>
                  </label>
                </>
              )}
              {error && <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>}
              {success && <p style={{ color: '#4ade80', marginBottom: 16 }}>{success}</p>}
              <button type="submit" disabled={loading} style={{ ...styles.btn, width: '100%', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', marginTop: 10 }}>
                {loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : mode === 'changepassword' ? 'Change Password' : mode === 'editprofile' ? 'Save Profile' : 'Sign In')}
              </button>
              <p style={{ textAlign: 'center', color: '#71717A', fontSize: '0.85rem', marginTop: 24 }}>
                {mode === 'signup' ? 'Create an account to get started' : mode === 'changepassword' ? 'Change your password' : 'Welcome back!'}
              </p>
              {mode !== 'changepassword' && (
                <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setSuccess(''); }} style={{ color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', marginTop: 16 }}>
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                </button>
              )}
              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('changepassword'); setError(''); setSuccess(''); }} style={{ color: isDark ? '#A1A1AA' : '#8E8E8E', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, fontSize: '0.85rem' }}>
                  Change Password
                </button>
              )}
              {mode === 'changepassword' && (
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', marginTop: 16 }}>
                  Back to Login
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {showUpload && (
        <div style={styles.modal} onClick={() => setShowUpload(false)}>
          <div style={{ ...styles.modalContent, background: isDark ? '#1A1A2E' : '#FFFFFF', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 30, color: isDark ? 'white' : '#262626' }}>Upload 360 Content</h3>
            <form onSubmit={handleUpload}>
              <div style={{ border: '2px dashed #6366F1', borderRadius: '12px', padding: '40px', textAlign: 'center', marginBottom: 16, cursor: 'pointer' }}>
                <input type="file" accept="image/*,video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v" style={{ display: 'none' }} id="fileInput" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }} />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                  {selectedFile ? (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>File selected</div>
                      <p style={{ color: isDark ? '#A1A1AA' : '#71717A', fontWeight: 600 }}>{selectedFile.name}</p>
                      <p style={{ color: isDark ? '#71717A' : '#A1A1AA', fontSize: '0.8rem', marginTop: 4 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: 12 }}>Camera</div>
                      <p style={{ color: isDark ? '#A1A1AA' : '#71717A' }}>Click to select a file</p>
                      <p style={{ color: isDark ? '#71717A' : '#A1A1AA', fontSize: '0.8rem', marginTop: 8 }}>All 360 formats supported (Theta, Insta360, DSLR, etc.)</p>
                    </>
                  )}
                </label>
              </div>
              {albums.length > 0 && (
                <select 
                  style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626', marginBottom: 16 }}
                  onChange={(e) => {
                    if (e.target.value) {
                      const albumIndex = parseInt(e.target.value);
                      const newAlbums = [...albums];
                      newAlbums[albumIndex].photos.push(`photo_${Date.now()}`);
                      setAlbums(newAlbums);
                      if (newAlbums[albumIndex].followers?.length) {
                        setNotifications([...notifications, `New photo added to ${newAlbums[albumIndex].name}!`]);
                      }
                    }
                  }}
                >
                  <option value="">Add to album (notifies followers)</option>
                  {albums.map((album, i) => (
                    <option key={i} value={i}>{album.name} ({album.followers?.length || 0} followers)</option>
                  ))}
                </select>
              )}
              <textarea style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626', minHeight: '100px', resize: 'vertical' }} placeholder="Write a caption..." value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} />
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.85rem', color: secondaryText, display: 'block', marginBottom: 8 }}>Topic Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {selectedTags.map((tag, i) => {
                    const topic = customTopics.find(t => t.id === tag || t.name.toLowerCase() === tag.toLowerCase());
                    return (
                      <div key={i} style={{ padding: '4px 10px', background: '#8B5CF6', borderRadius: 12, color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>#{tag}</span>
                          <button type="button" onClick={() => setSelectedTags(selectedTags.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}>×</button>
                        </div>
                        {topic?.description && <div style={{ fontSize: '0.65rem', opacity: 0.9, marginTop: 2 }}>{topic.description}</div>}
                      </div>
                    );
                  })}
                </div>
                <input 
                  style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} 
                  placeholder="Add topic tags (press Enter)" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                      if (tag && !selectedTags.includes(tag)) {
                        setSelectedTags([...selectedTags, tag]);
                      }
                      setTagInput('');
                    }
                  }}
                />
                <p style={{ fontSize: '0.7rem', color: secondaryText, marginTop: 4 }}>Press Enter to add tags like #mountains #sunset</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {customTopics.map(topic => (
                    <button 
                      key={topic.id}
                      type="button"
                      title={topic.description}
                      onClick={() => {
                        if (!selectedTags.includes(topic.name.toLowerCase())) {
                          setSelectedTags([...selectedTags, topic.name.toLowerCase()]);
                        }
                      }}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #8B5CF6', background: 'transparent', color: '#8B5CF6', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      {topic.emoji} #{topic.name}
                    </button>
                  ))}
                  {customTopics.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: secondaryText }}>Create topics first, then add tags from them</p>
                  )}
                </div>
              </div>
              {error && <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>}
              {success && <p style={{ color: '#4ade80', marginBottom: 16 }}>{success}</p>}
              <button type="submit" disabled={uploading} style={{ ...styles.btn, width: '100%', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', marginTop: 10 }}>
                {uploading ? 'Uploading...' : 'Post'}
              </button>
              <button type="button" onClick={() => setShowUpload(false)} style={{ color: isDark ? '#A1A1AA' : '#71717A', background: 'none', border: 'none', cursor: 'pointer', marginTop: 16, width: '100%' }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {cropping && cropImage && (
        <div style={styles.modal} onClick={() => { setCropping(false); setCropImage(null); }}>
          <div style={{ ...styles.modalContent, background: isDark ? '#1A1A2E' : '#FFFFFF', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 20, color: isDark ? 'white' : '#262626' }}>Crop Your Photo</h3>
            <p style={{ fontSize: '0.85rem', color: isDark ? '#A1A1AA' : '#71717A', marginBottom: 15 }}>Your photo will be cropped to a circle</p>
            <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #0095F6' }}>
              <img 
                src={cropImage} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                alt="Crop preview"
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => {
                  const img = document.createElement('img');
                  img.src = cropImage;
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    
                    const size = Math.min(img.width, img.height);
                    const sx = (img.width - size) / 2;
                    const sy = (img.height - size) / 2;
                    
                    canvas.width = 200;
                    canvas.height = 200;
                    ctx.beginPath();
                    ctx.arc(100, 100, 100, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
                    
                    const cropped = canvas.toDataURL('image/jpeg', 0.8);
                    const updatedUser = { ...user!, avatar_url: cropped };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setCropping(false);
                    setCropImage(null);
                    setSuccess('Profile picture updated!');
                  };
                }}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Apply
              </button>
              <button 
                onClick={() => { setCropping(false); setCropImage(null); }}
                style={{ flex: 1, padding: '12px', background: isDark ? '#262626' : '#E5E5E5', color: isDark ? 'white' : '#262626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlbumModal && (
        <div style={styles.modal} onClick={() => setShowAlbumModal(false)}>
          <div style={{ ...styles.modalContent, background: isDark ? '#1A1A2E' : '#FFFFFF', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 20, color: isDark ? 'white' : '#262626' }}>Create Album</h3>
            <input 
              style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} 
              placeholder="Album name" 
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => {
                  if (!newAlbumName.trim()) return;
                  setAlbums([...albums, { id: Date.now().toString(), name: newAlbumName, cover: '', photos: [], followers: [] }]);
                  setNewAlbumName('');
                  setShowAlbumModal(false);
                }}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Create
              </button>
              <button 
                onClick={() => { setShowAlbumModal(false); setNewAlbumName(''); }}
                style={{ flex: 1, padding: '12px', background: isDark ? '#262626' : '#E5E5E5', color: isDark ? 'white' : '#262626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAlbum !== null && albums[selectedAlbum] && (
        <div style={styles.modal} onClick={() => setSelectedAlbum(null)}>
          <div style={{ ...styles.modalContent, background: isDark ? '#1A1A2E' : '#FFFFFF', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? 'white' : '#262626' }}>{albums[selectedAlbum].name}</h3>
                <p style={{ fontSize: '0.85rem', color: secondaryText }}>{albums[selectedAlbum].followers?.length || 0} followers</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {user && albums[selectedAlbum].followers?.includes(user.email || user.email?.toLowerCase()) ? (
                  <button 
                    onClick={() => {
                      const newAlbums = [...albums];
                      newAlbums[selectedAlbum].followers = newAlbums[selectedAlbum].followers?.filter(e => e !== (user.email || user.email?.toLowerCase()));
                      setAlbums(newAlbums);
                    }}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (!user) return;
                      const newAlbums = [...albums];
                      if (!newAlbums[selectedAlbum].followers) newAlbums[selectedAlbum].followers = [];
                      newAlbums[selectedAlbum].followers.push(user.email || user.email?.toLowerCase());
                      setAlbums(newAlbums);
                    }}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#FFD700', color: '#000', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Follow
                  </button>
                )}
                <button 
                  onClick={() => {
                    const newAlbums = [...albums];
                    newAlbums.splice(selectedAlbum, 1);
                    setAlbums(newAlbums);
                    setSelectedAlbum(null);
                  }}
                  style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
            {albums[selectedAlbum].photos.length === 0 ? (
              <p style={{ color: secondaryText, textAlign: 'center', padding: '40px 0' }}>No photos in this album yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {albums[selectedAlbum].photos.map((photo, i) => (
                  <div key={i} style={{ aspectRatio: '1/1', background: `url(${photo}) center/cover` }} />
                ))}
              </div>
            )}
            <button 
              onClick={() => setSelectedAlbum(null)}
              style={{ marginTop: 20, width: '100%', padding: '12px', background: isDark ? '#262626' : '#E5E5E5', color: isDark ? 'white' : '#262626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showTopicModal && (
        <div style={styles.modal} onClick={() => setShowTopicModal(false)}>
          <div style={{ ...styles.modalContent, background: isDark ? '#1A1A2E' : '#FFFFFF', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 20, color: isDark ? 'white' : '#262626' }}>Create Topic</h3>
            <input 
              style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626' }} 
              placeholder="Topic name (e.g., Mountains)" 
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
            />
            <textarea 
              style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626', minHeight: '80px', resize: 'vertical' }} 
              placeholder="Description - what kind of posts will be in this topic?" 
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
            />
            <input 
              style={{ ...styles.input, background: isDark ? 'rgba(15,15,35,0.8)' : '#F5F5F5', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5', color: isDark ? 'white' : '#262626', marginTop: 8, fontSize: '1.5rem', textAlign: 'center' }} 
              placeholder="😊" 
              value={newTopicEmoji}
              onChange={(e) => setNewTopicEmoji(e.target.value)}
              maxLength={2}
            />
            <p style={{ fontSize: '0.75rem', color: secondaryText, marginTop: 4, textAlign: 'center' }}>Type or paste any emoji</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button 
                onClick={() => {
                  if (!newTopicName.trim()) return;
                  const id = newTopicName.toLowerCase().replace(/\s+/g, '-');
                  setCustomTopics([...customTopics, { id, name: newTopicName, description: newTopicDesc, emoji: newTopicEmoji }]);
                  setNewTopicName('');
                  setNewTopicDesc('');
                  setNewTopicEmoji('');
                  setShowTopicModal(false);
                }}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Create
              </button>
              <button 
                onClick={() => { setShowTopicModal(false); setNewTopicName(''); setNewTopicDesc(''); setNewTopicEmoji(''); }}
                style={{ flex: 1, padding: '12px', background: isDark ? '#262626' : '#E5E5E5', color: isDark ? 'white' : '#262626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}// updated
