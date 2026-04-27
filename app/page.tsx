'use client';
import { useState, CSSProperties, useEffect } from 'react';

const styles: Record<string, CSSProperties> = {
  container: { minHeight: '100vh', background: '#0F0F23', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' },
  hero: { position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(236,72,153,0.1) 0%, transparent 50%)' },
  heroGrid: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(99,102,241,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.5 },
  heroContent: { position: 'relative', zIndex: 10, textAlign: 'center', padding: '20px', maxWidth: '800px' },
  heroBadget: { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'rgba(26,26,46,0.6)', borderRadius: '50px', border: '1px solid rgba(45,45,74,0.8)', marginBottom: '30px' },
  heroTitle: { fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '24px' },
  heroGradient: { background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubtitle: { fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#A1A1AA', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' },
  btn: { padding: '18px 36px', borderRadius: '50px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s', border: 'none' },
  btnPrimary: { background: 'white', color: '#0F0F23' },
  btnSecondary: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' },
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
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'signup'|'login'|'changepassword'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);
    try {
      const res = await fetch('https://omnisee-backend.onrender.com/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, mediaUrl: 'https://example.com/360-photo.jpg', mediaType: 'photo', caption: uploadCaption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Posted successfully!');
      setUploadCaption('');
      setTimeout(() => setShowUpload(false), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
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
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setSuccess('Logged in successfully!');
        setTimeout(() => { setShowModal(false); }, 1500);
      } else {
        setSuccess('Account created! You can now log in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const featured = [
    { title: 'Swiss Alps', author: 'MountainLens', color: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
    { title: 'Tokyo Nights', author: 'UrbanView', color: 'linear-gradient(135deg, #7c3aed, #db2777)' },
    { title: 'Maldives', author: 'OceanDrone', color: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
    { title: 'Iceland', author: 'Nordic360', color: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { title: 'Santorini', author: 'GreekSky', color: 'linear-gradient(135deg, #f97316, #ec4899)' },
  ];

  const features = [
    { icon: '🌐', title: 'Federated', desc: 'Connect with Mastodon, PixelFed, and more' },
    { icon: '⚡', title: 'Fast', desc: 'Built for speed on any connection' },
    { icon: '📱', title: 'Native', desc: 'iOS, Android, Web - all synced' },
    { icon: '🎯', title: 'No Ads', desc: 'No tracking. No profiling. Ever' },
    { icon: '💎', title: 'Free', desc: 'Open source. Free forever' },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>OmniSee</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {user ? (
              <>
                <button onClick={() => setShowUpload(true)} style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: 500, cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', border: 'none' }}>Upload</button>
                <button onClick={() => { localStorage.removeItem('user'); setUser(null); }} style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#A1A1AA', border: 'none' }}>Logout</button>
              </>
            ) : (
              <>
                <button style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s', background: 'transparent', color: '#A1A1AA', border: 'none' }}>Explore</button>
                <button onClick={() => { setMode('signup'); setShowModal(true); }} style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s', background: 'white', color: '#0F0F23' }}>Get Started</button>
              </>
            )}
          </div>
        </nav>

      {/* Hero */}
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
            Share immersive 360° experiences. Connect globally. Own your visual journey.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setMode('signup'); setShowModal(true); }} style={{ ...styles.btn, ...styles.btnPrimary }}>
              Get Started
            </button>
            {user ? (
              <button onClick={() => setShowUpload(true)} style={{ ...styles.btn, ...styles.btnSecondary }}>
                Upload
              </button>
            ) : (
              <button style={{ ...styles.btn, ...styles.btnSecondary }}>
                View Showcase
              </button>
            )}
          </div>
        </div>

        {/* Scroll Hint */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#71717A', opacity: 0.6 }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>SCROLL</span>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Featured Showcase */}
      <section style={{ ...styles.section, background: 'rgba(26,26,46,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 16 }}>Immersive Experiences</h2>
          <p style={{ color: '#A1A1AA', maxWidth: '500px', margin: '0 auto' }}>Explore stunning 360° content from creators worldwide</p>
        </div>

        <div style={styles.showcase}>
          {featured.map((item, i) => (
            <div key={i} style={{ ...styles.showcaseCard, background: item.color }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 30, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <span style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, fontSize: '0.75rem', marginBottom: 10 }}>360°</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{item.title}</h3>
                <p style={{ opacity: 0.8 }}>by {item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={styles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={styles.card}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 16 }}>{f.icon}</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#A1A1AA', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...styles.section, background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.1))' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'bold', marginBottom: 20 }}>Ready to dive in?</h2>
          <p style={{ fontSize: '1.2rem', color: '#A1A1AA', marginBottom: 40 }}>Join the spatial social revolution.</p>
          <button onClick={() => { setMode('signup'); setShowModal(true); }} style={{ ...styles.btn, background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white' }}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 'bold' }}>OmniSee</span>
          <span style={{ color: '#71717A' }}>•</span>
          <span style={{ color: '#A1A1AA' }}>360° Social</span>
        </div>
        <div style={{ display: 'flex', gap: 30, color: '#A1A1AA', fontSize: '0.9rem' }}>
          <a href="#" style={{ color: 'inherit' }}>Privacy</a>
          <a href="#" style={{ color: 'inherit' }}>Terms</a>
          <a href="#" style={{ color: 'inherit' }}>GitHub</a>
        </div>
      </footer>

{/* Auth Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 30 }}>
              {mode === 'signup' ? 'Join OmniSee' : mode === 'changepassword' ? 'Change Password' : 'Welcome Back'}
            </h3>
            <form onSubmit={handleSubmit}>
              {mode === 'changepassword' ? (
                <>
                  <input style={styles.input} name="oldPassword" placeholder="Current Password" type="password" required />
                  <input style={styles.input} name="newPassword" placeholder="New Password" type="password" required />
                </>
              ) : (
                <>
                  {mode === 'signup' && <input style={styles.input} name="username" placeholder="Username" required />}
                  <input style={styles.input} name="email" placeholder="Email" type="email" required />
                  <input style={styles.input} name="password" placeholder="Password" type="password" required />
                </>
              )}
              {error && <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>}
              {success && <p style={{ color: '#4ade80', marginBottom: 16 }}>{success}</p>}
              <button type="submit" disabled={loading} style={{ ...styles.btn, width: '100%', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', marginTop: 10 }}>
                {loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : mode === 'changepassword' ? 'Change Password' : 'Sign In')}
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
                <button type="button" onClick={() => { setMode('changepassword'); setError(''); setSuccess(''); }} style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, fontSize: '0.85rem' }}>
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

      {/* Upload Modal */}
      {showUpload && (
        <div style={styles.modal} onClick={() => setShowUpload(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 30 }}>Upload 360° Content</h3>
            <form onSubmit={handleUpload}>
              <div style={{ border: '2px dashed #6366F1', borderRadius: '12px', padding: '40px', textAlign: 'center', marginBottom: 16, cursor: 'pointer' }}>
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} id="fileInput" />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
                  <p style={{ color: '#A1A1AA' }}>Click to select a file</p>
                  <p style={{ color: '#71717A', fontSize: '0.8rem', marginTop: 8 }}>360° photos and videos supported</p>
                </label>
              </div>
              <textarea style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }} placeholder="Write a caption..." value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} />
              {error && <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>}
              {success && <p style={{ color: '#4ade80', marginBottom: 16 }}>{success}</p>}
              <button type="submit" disabled={uploading} style={{ ...styles.btn, width: '100%', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', marginTop: 10 }}>
                {uploading ? 'Uploading...' : 'Post'}
              </button>
              <button type="button" onClick={() => setShowUpload(false)} style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer', marginTop: 16, width: '100%' }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
              {error && <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>}
              {success && <p style={{ color: '#4ade80', marginBottom: 16 }}>{success}</p>}
              <button type="submit" disabled={loading} style={{ ...styles.btn, width: '100%', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', marginTop: 10 }}>
                {loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : mode === 'changepassword' ? 'Change Password' : 'Sign In')}
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
                <button type="button" onClick={() => { setMode('changepassword'); setError(''); setSuccess(''); }} style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, fontSize: '0.85rem' }}>
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
    </div>
  );
}