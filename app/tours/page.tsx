'use client';

import { useEffect, useRef, useState } from 'react';
import PaymentModal from './PaymentModal';

const API = 'https://omnisee-backend.onrender.com';

interface Scene {
  id: string;
  tour_id: string;
  title: string;
  panorama_url: string;
  initial_yaw: number;
  initial_pitch: number;
  initial_fov: number;
}

interface Hotspot {
  id: string;
  scene_id: string;
  target_scene_id: string;
  yaw: number;
  pitch: number;
  text: string;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  user_id: string;
  status: string;
  created_at: string;
  username?: string;
  displayName?: string;
  sceneCount?: number;
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'list'|'builder'|'viewer'>('list');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [tourScenes, setTourScenes] = useState<Scene[]>([]);
  const [tourHotspots, setTourHotspots] = useState<Hotspot[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourDesc, setNewTourDesc] = useState('');
  const [newSceneFile, setNewSceneFile] = useState<File | null>(null);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [showAddScene, setShowAddScene] = useState(false);
  const [addingHotspot, setAddingHotspot] = useState(false);
  const [hotspotTargetScene, setHotspotTargetScene] = useState('');
  const [hotspotText, setHotspotText] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    fetchTours();
  }, []);

  useEffect(() => {
    if (view === 'viewer' && selectedTour && tourScenes.length > 0) {
      initViewer();
    }
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [view, selectedTour, currentSceneIndex, tourScenes]);

  const fetchTours = async () => {
    try {
      const res = await fetch(`${API}/api/tours`);
      const data = await res.json();
      setTours(data);
    } catch (err) { console.error('Failed to fetch tours', err); }
  };

  const fetchTourDetails = async (tour: Tour) => {
    try {
      const res = await fetch(`${API}/api/tours/${tour.id}`);
      const data = await res.json();
      setTourScenes(data.scenes || []);
      setTourHotspots(data.scenes?.flatMap((s: any) => s.hotspots || []) || []);
      setSelectedTour(data);
      setCurrentSceneIndex(0);
    } catch (err) { console.error('Failed to fetch tour', err); }
  };

  const initViewer = async () => {
    if (!containerRef.current || tourScenes.length === 0) return;
    const scene = tourScenes[currentSceneIndex];
    if (!scene?.panorama_url) return;

    try {
      const mod = await import('marzipano');
      const Marzipano = mod.default || mod;

      if (viewerRef.current) viewerRef.current.destroy();

      const viewer = new Marzipano.Viewer(containerRef.current, { stageType: 'webgl' });
      viewerRef.current = viewer;

      const source = Marzipano.ImageUrlSource.fromString(scene.panorama_url, { corsWithCredentials: false });
      const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
      const limiter = Marzipano.RectilinearView.limit.traditional(4000, (120 * Math.PI) / 180);
      const view = new Marzipano.RectilinearView(
        { yaw: scene.initial_yaw || 0, pitch: scene.initial_pitch || 0, roll: 0, fov: scene.initial_fov || Math.PI / 2 },
        limiter
      );

      const marzipanoScene = viewer.createScene({ source, geometry, view, pinFirstLevel: true });
      marzipanoScene.switchTo();
      sceneRef.current = marzipanoScene;

      // Add hotspot containers for linked scenes
      const hotspotsForScene = tourHotspots.filter(h => h.scene_id === scene.id);
      hotspotsForScene.forEach(h => {
        const hotspotContainer = document.createElement('div');
        hotspotContainer.style.cssText = 'position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(99,102,241,0.8);border:2px solid white;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;z-index:100;';
        hotspotContainer.innerHTML = '→';
        hotspotContainer.title = h.text || 'Go to scene';
        hotspotContainer.onclick = () => {
          const targetIndex = tourScenes.findIndex(s => s.id === h.target_scene_id);
          if (targetIndex >= 0) setCurrentSceneIndex(targetIndex);
        };
        // Note: Marzipano hotspot positioning requires hotspot container API which is complex
        // For simplicity we overlay at center
        containerRef.current?.appendChild(hotspotContainer);
        (hotspotContainer as any).__cleanup = () => hotspotContainer.remove();
      });

      setTimeout(() => viewer.updateSize(), 100);
    } catch (err) { console.error('Tour viewer error:', err); }
  };

  const createTour = async () => {
    if (!user || !newTourTitle.trim()) return;
    try {
      const res = await fetch(`${API}/api/tours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: newTourTitle, description: newTourDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setTours(prev => [data.tour, ...prev]);
        setSelectedTour(data.tour);
        setView('builder');
        setShowCreateModal(false);
        setNewTourTitle('');
        setNewTourDesc('');
      }
    } catch (err) { console.error('Create tour failed', err); }
  };

  const addScene = async () => {
    if (!selectedTour || !newSceneFile) return;
    const formData = new FormData();
    formData.append('panorama', newSceneFile);
    formData.append('title', newSceneTitle || 'Scene');
    try {
      const res = await fetch(`${API}/api/tours/${selectedTour.id}/scenes`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setTourScenes(prev => [...prev, data.scene]);
        setShowAddScene(false);
        setNewSceneFile(null);
        setNewSceneTitle('');
      }
    } catch (err) { console.error('Add scene failed', err); }
  };

  const addHotspot = async () => {
    if (!selectedTour || tourScenes.length < 2 || !hotspotTargetScene) return;
    const currentScene = tourScenes[currentSceneIndex];
    try {
      const res = await fetch(`${API}/api/tours/${selectedTour.id}/hotspots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: currentScene.id,
          targetSceneId: hotspotTargetScene,
          yaw: 0,
          pitch: 0,
          text: hotspotText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTourHotspots(prev => [...prev, data.hotspot]);
        setAddingHotspot(false);
        setHotspotTargetScene('');
        setHotspotText('');
      }
    } catch (err) { console.error('Add hotspot failed', err); }
  };

  const isDark = darkMode;
  const textColor = isDark ? 'white' : '#262626';
  const secondaryText = isDark ? '#A8A8A8' : '#8E8E8E';
  const bgColor = isDark ? '#0a0a0a' : '#ffffff';

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0a0a0a' : '#fafafa', color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      {/* Top Nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${isDark ? '#262626' : '#DBDBDB'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem', background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OmniSee Tours</span>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: textColor, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}` }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to Feed
          </a>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowPayment(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1a1a', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(255,215,0,0.3)' }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v20M2 12h20" /></svg>
            Upgrade
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textColor, cursor: 'pointer' }}>
            {darkMode ? 'Light' : 'Dark'}
          </button>
          {view !== 'list' && (
            <button onClick={() => setView('list')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366F1', color: 'white', cursor: 'pointer' }}>
              Back to Tours
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingTop: 70, maxWidth: 900, margin: '0 auto', padding: '80px 20px 40px' }}>
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>360 Virtual Tours</h1>
              {user && (
                <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  + Create Tour
                </button>
              )}
            </div>

            {/* Premium Banner - Prominent */}
            <div style={{ marginBottom: 32, padding: '24px 28px', borderRadius: 16, background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>Premium 360 Virtual Tours</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: 500 }}>Unlock unlimited scenes, custom branding, embeddable tours, and hotspot linking. Pay once, keep forever.</div>
              </div>
              <button onClick={() => setShowPayment(true)} style={{ padding: '12px 28px', borderRadius: 30, border: '2px solid white', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
                Upgrade $5
              </button>
            </div>

            {tours.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: secondaryText, marginBottom: 20 }}>No tours yet. Create your first 360 virtual tour!</p>
                <button onClick={() => setShowCreateModal(true)} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  Create Tour
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {tours.map(tour => (
                  <div key={tour.id} style={{ background: isDark ? '#1a1a1a' : '#fff', borderRadius: 12, overflow: 'hidden', border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}`, cursor: 'pointer' }} onClick={() => { fetchTourDetails(tour); setView('viewer'); }}>
                    <div style={{ aspectRatio: '16/9', background: tour.cover_url ? `url(${tour.cover_url}) center/cover` : 'linear-gradient(135deg, #6366F1, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!tour.cover_url && <span style={{ color: 'white', fontWeight: 600 }}>{tour.title[0]}</span>}
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>{tour.title}</div>
                      <div style={{ color: secondaryText, fontSize: '0.85rem', marginBottom: 8 }}>{tour.description || 'No description'}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: secondaryText }}>
                        <span>By {tour.displayName || tour.username || 'User'}</span>
                        <span>{tour.sceneCount || 0} scenes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'viewer' && selectedTour && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedTour.title}</h2>
                <p style={{ color: secondaryText }}>{selectedTour.description}</p>
              </div>
              {user?.id === selectedTour.user_id && (
                <button onClick={() => setView('builder')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366F1', color: 'white', cursor: 'pointer' }}>
                  Edit Tour
                </button>
              )}
            </div>

            {tourScenes.length === 0 ? (
              <p style={{ color: secondaryText }}>No scenes in this tour yet.</p>
            ) : (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 300 }}>
                  <div ref={containerRef} style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000', position: 'relative' }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 8 }}>
                    {tourScenes.map((scene, i) => (
                      <button key={scene.id} onClick={() => setCurrentSceneIndex(i)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: i === currentSceneIndex ? '#6366F1' : isDark ? '#262626' : '#e5e7eb', color: i === currentSceneIndex ? 'white' : textColor, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {scene.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Hotspots</h3>
                  {tourHotspots.filter(h => h.scene_id === tourScenes[currentSceneIndex]?.id).length === 0 ? (
                    <p style={{ color: secondaryText, fontSize: '0.9rem' }}>No hotspots in this scene.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {tourHotspots.filter(h => h.scene_id === tourScenes[currentSceneIndex]?.id).map(h => {
                        const target = tourScenes.find(s => s.id === h.target_scene_id);
                        return (
                          <div key={h.id} style={{ padding: 10, background: isDark ? '#1a1a1a' : '#f3f4f6', borderRadius: 8, fontSize: '0.9rem' }}>
                            → {target?.title || 'Unknown'}
                            {h.text && <div style={{ color: secondaryText, fontSize: '0.8rem' }}>{h.text}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'builder' && selectedTour && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Editing: {selectedTour.title}</h2>
              <button onClick={() => setView('viewer')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366F1', color: 'white', cursor: 'pointer' }}>
                Preview
              </button>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <button onClick={() => setShowAddScene(true)} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                + Add Scene
              </button>
              {tourScenes.length >= 2 && (
                <button onClick={() => setAddingHotspot(!addingHotspot)} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#262626' : '#e5e7eb', color: textColor, cursor: 'pointer' }}>
                  {addingHotspot ? 'Cancel Hotspot' : '+ Add Hotspot'}
                </button>
              )}
            </div>

            {showAddScene && (
              <div style={{ background: isDark ? '#1a1a1a' : '#fff', padding: 20, borderRadius: 12, marginBottom: 24, border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}` }}>
                <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Add Scene</h3>
                <input type="file" accept="image/*" onChange={(e) => setNewSceneFile(e.target.files?.[0] || null)} style={{ marginBottom: 12, display: 'block' }} />
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#fff', color: textColor, marginBottom: 12 }} placeholder="Scene name" value={newSceneTitle} onChange={(e) => setNewSceneTitle(e.target.value)} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={addScene} disabled={!newSceneFile} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#6366F1', color: 'white', cursor: newSceneFile ? 'pointer' : 'not-allowed', opacity: newSceneFile ? 1 : 0.5 }}>Add Scene</button>
                  <button onClick={() => setShowAddScene(false)} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#262626' : '#e5e7eb', color: textColor, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {addingHotspot && tourScenes.length >= 2 && (
              <div style={{ background: isDark ? '#1a1a1a' : '#fff', padding: 20, borderRadius: 12, marginBottom: 24, border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}` }}>
                <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Add Hotspot from "{tourScenes[currentSceneIndex]?.title}"</h3>
                <select value={hotspotTargetScene} onChange={(e) => setHotspotTargetScene(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#fff', color: textColor, marginBottom: 12 }}>
                  <option value="">Select target scene</option>
                  {tourScenes.filter((_, i) => i !== currentSceneIndex).map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#fff', color: textColor, marginBottom: 12 }} placeholder="Label (optional)" value={hotspotText} onChange={(e) => setHotspotText(e.target.value)} />
                <button onClick={addHotspot} disabled={!hotspotTargetScene} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#6366F1', color: 'white', cursor: hotspotTargetScene ? 'pointer' : 'not-allowed', opacity: hotspotTargetScene ? 1 : 0.5 }}>Add Hotspot</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {tourScenes.map((scene, i) => (
                <div key={scene.id} style={{ background: isDark ? '#1a1a1a' : '#fff', borderRadius: 12, overflow: 'hidden', border: `1px solid ${i === currentSceneIndex ? '#6366F1' : isDark ? '#262626' : '#e5e7eb'}` }}>
                  <div style={{ aspectRatio: '16/9', background: scene.panorama_url ? `url(${scene.panorama_url}) center/cover` : '#262626' }} />
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{scene.title}</div>
                    <div style={{ fontSize: '0.8rem', color: secondaryText }}>Scene {i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Tour Modal */}
      {showPayment && (
        <PaymentModal amount={5} description="Premium Virtual Tour" onClose={() => setShowPayment(false)} darkMode={darkMode} />
      )}

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: isDark ? '#1A1A2E' : '#FFFFFF', borderRadius: 24, padding: 40, maxWidth: 420, width: '90%', border: isDark ? '1px solid rgba(45,45,74,0.8)' : '1px solid #E5E5E5' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 20, color: isDark ? 'white' : '#262626' }}>Create Virtual Tour</h3>
            <input style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#f9fafb', color: textColor, fontSize: '1rem', marginBottom: 12 }} placeholder="Tour title" value={newTourTitle} onChange={(e) => setNewTourTitle(e.target.value)} />
            <input style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#f9fafb', color: textColor, fontSize: '1rem', marginBottom: 20 }} placeholder="Description (optional)" value={newTourDesc} onChange={(e) => setNewTourDesc(e.target.value)} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={createTour} disabled={!newTourTitle.trim()} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', cursor: newTourTitle.trim() ? 'pointer' : 'not-allowed', opacity: newTourTitle.trim() ? 1 : 0.5, fontWeight: 600 }}>Create</button>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: isDark ? '#262626' : '#e5e7eb', color: textColor, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
