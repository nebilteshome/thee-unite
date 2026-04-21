import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Save, Image as ImageIcon, ChevronRight, Lock, 
  Settings, ShoppingBag, Layout as LayoutIcon, CreditCard, 
  LogOut, Upload, X, Edit2, Loader2, Video, Database, Search
} from 'lucide-react';
import { db, auth, uploadFile } from '../lib/firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  updateDoc, query, orderBy, getDoc, setDoc, writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Link, NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';

// --- Types ---

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  image?: string;
  sizes: string[];
  colors: string[];
  createdAt: string;
}

interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  span?: string;
  order: number;
}

interface HeroSettings {
  title: string;
  tagline: string;
  subtitle: string;
  bgUrl: string;
  bgType: 'image' | 'video';
}

interface PaymentSettings {
  paypalEmail: string;
  mtnNumber: string;
  airtelNumber: string;
  flutterwavePublicKey: string;
  flutterwaveSecretKey: string;
  flutterwaveWebhookHash: string;
}

// --- Main Admin Component ---

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const status = await checkAdmin(u.uid);
        setAdminStatus(status);
      } else {
        setAdminStatus(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const checkAdmin = async (uid: string) => {
    try {
      const docRef = doc(db, 'admins', uid);
      const snap = await getDoc(docRef);
      return snap.exists();
    } catch (e) {
      return false;
    }
  };

  const handleLogin = async () => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      alert("CRITICAL_ERROR: Firebase configuration is missing. Please ensure all VITE_FIREBASE_* environment variables are set in Vercel.");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Auth Error:", error);
      alert(`AUTH_FAILED: ${error.message}`);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-tech text-accent">SYNCHRONIZING_CORE...</div>;

  if (!user || !adminStatus) {
    return <LoginView user={user} adminStatus={adminStatus} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col gap-8 shrink-0">
        <div>
          <span className="font-tech text-[10px] tracking-[0.4em] text-accent uppercase mb-2 block">ADMIN_PANEL_v2.1</span>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">MANIFESTOR</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <TabButton to="/admin/products" icon={<ShoppingBag size={18} />} label="PRODUCTS" />
          <TabButton to="/admin/gallerycore" icon={<ImageIcon size={18} />} label="GALLERY" />
          <TabButton to="/admin/heros" icon={<LayoutIcon size={18} />} label="HERO_SECTION" />
          <TabButton to="/admin/payments" icon={<CreditCard size={18} />} label="PAYMENTS" />
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center font-black text-xs">
              {user.displayName?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black italic truncate">{user.displayName}</p>
              <p className="text-[8px] text-white/40 font-tech truncate">SUPER_ADMIN</p>
            </div>
          </div>
          <button onClick={() => auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-tech text-white/30 hover:text-red-500 transition-colors">
            <LogOut size={16} /> LOGOUT_SYSTEM
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16">
        <Outlet />
      </main>
    </div>
  );
}

// --- Global UI Helpers ---

function TabButton({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `flex items-center gap-4 px-4 py-4 font-black italic uppercase text-xs tracking-widest transition-all ${
        isActive ? 'bg-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </NavLink>
  );
}

function LoginView({ user, adminStatus, onLogin }: any) {
  const [bootstrapping, setBootstrapping] = useState(false);

  const handleBootstrap = async () => {
    if (!user) return;
    setBootstrapping(true);
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        role: 'super_admin',
        manifestedAt: new Date().toISOString()
      });
      alert('ADMIN_AUTHORIZED: Reloading core...');
      window.location.reload();
    } catch (e: any) {
      alert(`BOOTSTRAP_FAILED: ${e.message}`);
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
      <Lock className="text-accent mb-8" size={64} />
      <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">ACCESS_DENIED</h1>
      <p className="text-white/40 mb-12 max-w-sm font-tech text-xs tracking-widest uppercase">
        You are attempting to enter the administrative core of the domain. Verification required.
      </p>
      <button 
        onClick={onLogin}
        className="bg-accent text-black px-12 py-4 font-black uppercase text-sm tracking-[0.3em] flex items-center gap-4 hover:bg-white transition-all"
      >
        INITIATE_AUTH <ChevronRight size={18} />
      </button>
      {user && !adminStatus && (
        <div className="mt-12 space-y-4">
          <p className="text-red-500 font-tech text-[10px] uppercase tracking-widest">
            Identity verified: {user.email}<br/>But authorization is missing.
          </p>
          {user.email === 'fffg3839@gmail.com' && (
            <button 
              disabled={bootstrapping}
              onClick={handleBootstrap}
              className="text-[10px] font-black uppercase text-accent underline underline-offset-8 flex items-center gap-2 mx-auto"
            >
              {bootstrapping ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
              BOOTSTRAP_ADMIN_PRIVILEGES
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AssetPicker({ onSelect, onClose, excludeUrls = [] }: { onSelect: (url: string) => void, onClose: () => void, excludeUrls?: string[] }) {
  const [assets, setAssets] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets.json')
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP_${r.status}: Failed to fetch assets.json`);
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const excludeSet = new Set(excludeUrls);
          setAssets(data.filter(file => !excludeSet.has(`/files/${file}`)));
        } else {
          throw new Error("Asset data is not a valid list");
        }
      })
      .catch((err) => {
        console.error("Asset library error:", err);
        alert(`LIBRARY_LOAD_FAILED: ${err.message}. Ensure deployment is complete.`);
      })
      .finally(() => setLoading(false));
  }, [excludeUrls]);

  const filtered = assets.filter(a => a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-surface border border-white/10 rounded-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <header className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tight">ASSET_LIBRARY</h3>
            <p className="text-[10px] font-tech text-white/40 uppercase">Select existing file from domain repository</p>
          </div>
          <button onClick={onClose} className="p-2 hover:text-accent"><X size={20} /></button>
        </header>

        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              autoFocus
              placeholder="SEARCH_MANIFEST_DATA..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 pl-12 font-tech text-xs uppercase text-accent outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex items-center justify-center font-tech text-xs text-accent">SCANNING_REPOSITORY...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map(asset => {
                const url = `/files/${asset}`;
                const isVideo = asset.endsWith('.mp4');
                return (
                  <button 
                    key={asset}
                    onClick={() => onSelect(url)}
                    className="group relative aspect-square bg-black border border-white/5 overflow-hidden hover:border-accent transition-all"
                  >
                    {isVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <Video size={24} className="text-white/20 group-hover:text-accent" />
                        <span className="text-[8px] font-tech text-white/40 uppercase truncate px-2 w-full">{asset}</span>
                      </div>
                    ) : (
                      <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                    )}
                    <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] font-black text-black bg-accent px-2 py-1">SELECT</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Managers ---

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'ESSENTIALS',
    description: '',
    sizes: 'S, M, L, XL',
    colors: 'Black, White',
    images: [] as string[]
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setSaving(true);
    try {
      const files = Array.from(e.target.files) as File[];
      const urls = await Promise.all(
        files.map(file => uploadFile(file, `products/${Date.now()}_${file.name}`))
      );
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      alert('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      createdAt: isEditing ? isEditing.createdAt : new Date().toISOString()
    };

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'products', isEditing.id), data);
      } else {
        await addDoc(collection(db, 'products'), data);
      }
      resetForm();
      fetchProducts();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Product) => {
    setIsEditing(p);
    setFormData({
      name: p.name,
      price: p.price.toString(),
      category: p.category,
      description: p.description || '',
      sizes: p.sizes.join(', '),
      colors: p.colors.join(', '),
      images: p.images || [p.image || '']
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this manifestation?')) return;
    await deleteDoc(doc(db, 'products', id));
    fetchProducts();
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ name: '', price: '', category: 'ESSENTIALS', description: '', sizes: 'S, M, L, XL', colors: 'Black, White', images: [] });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {showPicker && <AssetPicker onSelect={(url) => { setFormData(p => ({ ...p, images: [...p.images, url] })); setShowPicker(false); }} onClose={() => setShowPicker(false)} />}
      
      <header className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">PRODUCT_CORE</h2>
        <p className="text-[10px] font-tech text-white/20 uppercase tracking-[0.5em]">{products.length} OBJECTS_MANIFESTED</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Form */}
        <div className="bg-surface/30 border border-white/5 p-8 rounded-2xl h-fit">
          <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-4">
            {isEditing ? 'UPDATE_FREQUENCY' : 'NEW_ENTRY'} 
            {isEditing && <button onClick={resetForm} className="text-[10px] font-tech text-accent underline ml-auto">CANCEL_EDIT</button>}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
              <Input label="Price_USD" type="number" value={formData.price} onChange={v => setFormData({...formData, price: v})} required />
            </div>
            
            <div className="space-y-2">
              <label className="font-tech text-[10px] tracking-widest text-white/30 uppercase">Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none appearance-none"
              >
                <option>ESSENTIALS</option>
                <option>PREMIUM</option>
                <option>ARCHIVE</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-tech text-[10px] tracking-widest text-white/30 uppercase">Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Sizes (Comma separated)" value={formData.sizes} onChange={v => setFormData({...formData, sizes: v})} />
              <Input label="Colors (Comma separated)" value={formData.colors} onChange={v => setFormData({...formData, colors: v})} />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <label className="font-tech text-[10px] tracking-widest text-white/30 uppercase">Visuals_Data</label>
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((url, i) => (
                  <div key={i} className="relative aspect-square bg-black border border-white/10 group">
                    <img src={url} className="w-full h-full object-cover grayscale" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="aspect-square border border-dashed border-accent/30 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
                >
                  <Database size={20} className="text-accent/40 mb-2" />
                  <span className="text-[8px] font-tech text-accent/60 uppercase text-center px-2">Library</span>
                </button>
                <label className="aspect-square border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                  <Upload size={20} className="text-white/20 mb-2" />
                  <span className="text-[8px] font-tech text-white/40 uppercase">Upload</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <button 
              disabled={saving}
              type="submit" 
              className="w-full bg-accent text-black py-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditing ? 'SYNCHRONIZE_CHANGES' : 'MANIFEST_OBJECT'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-4">ACTIVE_CATALOG</h3>
          {products.map(p => (
            <div key={p.id} className="bg-surface/20 border border-white/5 p-4 flex gap-6 group hover:border-white/20 transition-all">
              <div className="w-20 aspect-square bg-black border border-white/10 overflow-hidden shrink-0">
                <img src={p.images?.[0] || p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-black italic uppercase text-lg truncate">{p.name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 text-white/20 hover:text-accent transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-accent font-black text-sm">${p.price}</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-[8px] font-tech px-2 py-0.5 border border-white/10 text-white/40">{p.category}</span>
                  <span className="text-[8px] font-tech px-2 py-0.5 border border-white/10 text-white/40">{p.sizes.length} SIZES</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- UI Helpers ---

function SelectionBox({ start, current }: { start: { x: number, y: number }, current: { x: number, y: number } }) {
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  const width = Math.abs(start.x - current.x);
  const height = Math.abs(start.y - current.y);

  return (
    <div 
      className="fixed z-[150] border-2 border-accent bg-accent/20 pointer-events-none shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
      style={{ left, top, width, height }}
    />
  );
}

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [repoAssets, setRepoAssets] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'gallery' | 'repository'>('gallery');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [selectedGallery, setSelectedGallery] = useState<Set<string>>(new Set());
  const [selectedRepo, setSelectedRepo] = useState<Set<string>>(new Set());

  // Drag Selection State
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);
  const mouseMoveFrame = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Feedback State
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [modal, setModal] = useState<{ 
    isOpen: boolean, 
    title: string, 
    message: string, 
    onConfirm: () => void,
    isDestructive?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => { fetchGallery(); }, []);

  const getItemKey = (item: any) => item.id || item.url || item.title || item;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if ((e.target as HTMLElement).closest('button, input, label, a')) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    setDragCurrent({ x: e.clientX, y: e.clientY });

    if (!e.ctrlKey && !e.shiftKey) {
      setSelectedGallery(new Set());
      setSelectedRepo(new Set());
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart) return;
    
    const { clientX, clientY, ctrlKey, shiftKey } = e;
    setDragCurrent({ x: clientX, y: clientY });

    if (mouseMoveFrame.current) cancelAnimationFrame(mouseMoveFrame.current);

    mouseMoveFrame.current = requestAnimationFrame(() => {
      mouseMoveFrame.current = null;
      
      // 1. DIRECTION-AGNOSTIC NORMALIZATION
      const box = {
        left: Math.min(dragStart.x, clientX),
        top: Math.min(dragStart.y, clientY),
        right: Math.max(dragStart.x, clientX),
        bottom: Math.max(dragStart.y, clientY)
      };

      const newSelection = new Set<string>();
      const currentList = activeSubTab === 'gallery' ? items : repoAssets;
      
      currentList.forEach((item, idx) => {
        const refKey = `${activeSubTab}-${idx}`;
        const el = itemRefs.current.get(refKey);
        
        if (el) {
          const rect = el.getBoundingClientRect();
          
          // 2. PRECISE COLLISION DETECTION (STRICT INTERSECTION)
          const overlap = rect.left < box.right && 
                          rect.right > box.left && 
                          rect.top < box.bottom && 
                          rect.bottom > box.top;
          
          if (overlap) {
            // 3. DUPLICATE HANDLING (UNIQUE KEYS)
            const key = activeSubTab === 'gallery' 
              ? getItemKey(item) 
              : getItemKey({ url: `/files/${item}`, title: item });
            
            newSelection.add(key);
          }
        }
      });

      if (activeSubTab === 'gallery') {
        setSelectedGallery(prev => {
          const combined = ctrlKey || shiftKey ? new Set(prev) : new Set();
          newSelection.forEach(id => combined.add(id));
          return combined;
        });
      } else {
        setSelectedRepo(prev => {
          const combined = ctrlKey || shiftKey ? new Set(prev) : new Set();
          newSelection.forEach(id => combined.add(id));
          return combined;
        });
      }
    });
  }, [dragStart, activeSubTab, items, repoAssets]);

  const handleMouseUp = useCallback(() => {
    setDragStart(null);
    setDragCurrent(null);
    if (mouseMoveFrame.current) {
      cancelAnimationFrame(mouseMoveFrame.current);
      mouseMoveFrame.current = null;
    }
  }, []);

  useEffect(() => {
    if (dragStart) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragStart, handleMouseMove, handleMouseUp]);

  const fetchGallery = async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('order'));
      const snapshot = await getDocs(q);
      const galleryItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      setItems(galleryItems);
      await fetchRepoAssets(galleryItems);
    } catch (err: any) {
      console.error("Gallery fetch failed:", err);
      setAlert({ message: "FAILED_TO_LOAD_GALLERY", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (filename: string) => /\.(mp4|webm|ogg|mov|avi|mkv|3gp|flv|wmv)$/i.test(filename);

  const fetchRepoAssets = async (currentItems: GalleryItem[]) => {
    try {
      const res = await fetch('/assets.json');
      if (!res.ok) return;
      const allFiles: string[] = await res.json();

      const galleryUrls = new Set(currentItems.map(item => item.url));
      // Only include files from GitHub that aren't already in the live gallery
      const available = allFiles.filter(file => !galleryUrls.has(`/files/${file}`));
      setRepoAssets(available);
    } catch (err) {
      console.error("Repo fetch failed:", err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files) as File[];
      const batch = writeBatch(db);

      for (const file of files) {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const url = await uploadFile(file, `gallery/${Date.now()}_${file.name}`);
        const docRef = doc(collection(db, 'gallery'));
        batch.set(docRef, {
          url,
          type,
          title: file.name.split('.')[0].toUpperCase(),
          order: items.length,
          createdAt: new Date().toISOString()
        });
      }

      await batch.commit();
      await fetchGallery();
      setAlert({ message: "MEDIA_UPLOADED_SUCCESSFULLY", type: 'success' });
    } catch (err) {
      setAlert({ message: "UPLOAD_FAILED", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handlePublishFromRepo = async (file: string) => {
    setSaving(true);
    try {
      const type = isVideo(file) ? 'video' : 'image';
      await addDoc(collection(db, 'gallery'), {
        url: `/files/${file}`,
        type,
        title: file.split('.')[0].toUpperCase(),
        order: items.length,
        createdAt: new Date().toISOString()
      });
      await fetchGallery();
      setAlert({ message: "ITEM_PUBLISHED_TO_GALLERY", type: 'success' });
    } catch (err: any) {
      setAlert({ message: `PUBLISH_FAILED: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedRepo.size === 0) return;
    setSaving(true);
    try {
      const batch = writeBatch(db);
      const selectedArray = Array.from(selectedRepo) as string[];

      selectedArray.forEach((file, i) => {
        const type = isVideo(file) ? 'video' : 'image';
        const docRef = doc(collection(db, 'gallery'));
        batch.set(docRef, {
          url: `/files/${file}`,
          type,
          title: file.split('.')[0].toUpperCase(),
          order: items.length + i,
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();
      setSelectedRepo(new Set());
      await fetchGallery();
      setAlert({ message: `SUCCESS: ${selectedArray.length} ITEMS PUBLISHED`, type: 'success' });
    } catch (err: any) {
      setAlert({ message: `PUBLISH_FAILED: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGallery.size === 0) return;
    
    setSaving(true);
    try {
      const batch = writeBatch(db);
      selectedGallery.forEach(id => {
        batch.delete(doc(db, 'gallery', id));
      });
      await batch.commit();
      setSelectedGallery(new Set());
      await fetchGallery();
      setAlert({ message: "SELECTED_ITEMS_REMOVED", type: 'success' });
    } catch (err: any) {
      setAlert({ message: `DELETION_FAILED: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (items.length === 0) return;
    
    setSaving(true);
    try {
      const batch = writeBatch(db);
      items.forEach(item => {
        batch.delete(doc(db, 'gallery', item.id));
      });
      await batch.commit();
      await fetchGallery();
      setAlert({ message: "GALLERY_WIPED_CLEAN", type: 'success' });
    } catch (err: any) {
      setAlert({ message: `WIPE_FAILED: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmBulkDelete = () => {
    setModal({
      isOpen: true,
      title: "DELETE_SELECTED",
      message: `ARE_YOU_SURE_YOU_WANT_TO_ERASE_${selectedGallery.size}_ITEMS_FROM_THE_WEBSITE?`,
      isDestructive: true,
      onConfirm: handleBulkDelete
    });
  };

  const confirmBulkPublish = () => {
    setModal({
      isOpen: true,
      title: "SEND_TO_GALLERY",
      message: `PUBLISH_${selectedRepo.size}_SELECTED_ASSETS_TO_THE_LIVE_GALLERY_PAGE?`,
      onConfirm: handleBulkPublish
    });
  };

  const confirmClearAll = () => {
    setModal({
      isOpen: true,
      title: "CRITICAL_WIPE",
      message: "ARE_YOU_SURE_YOU_WANT_TO_ERASE_ALL_PICTURES_FROM_THE_GALLERY? THIS_ACTION_CANNOT_BE_UNDONE.",
      isDestructive: true,
      onConfirm: handleClearAll
    });
  };

  const handleSyncLocal = async () => {
    setSaving(true);
    try {
      await fetchGallery();
      setAlert({ message: "REPOSITORY_SYNCED", type: 'success' });
    } catch (err: any) {
      setAlert({ message: "REFRESH_FAILED", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleGallerySelection = (id: string) => {
    const next = new Set(selectedGallery);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGallery(next);
  };

  const toggleRepoSelection = (file: string) => {
    const next = new Set(selectedRepo);
    if (next.has(file)) next.delete(file);
    else next.add(file);
    setSelectedRepo(next);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setSaving(true);
    try {
      await Promise.all(newItems.map((item, i) => updateDoc(doc(db, 'gallery', item.id), { order: i })));
      fetchGallery();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setModal({
      isOpen: true,
      title: "ERASE_MANIFEST",
      message: "ARE_YOU_SURE_YOU_WANT_TO_REMOVE_THIS_ITEM_FROM_THE_WEBSITE?",
      isDestructive: true,
      onConfirm: async () => {
        await deleteDoc(doc(db, 'gallery', id));
        fetchGallery();
        setAlert({ message: "ITEM_REMOVED", type: 'success' });
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        isDestructive={modal.isDestructive}
      />

      {dragStart && dragCurrent && <SelectionBox start={dragStart} current={dragCurrent} />}

      {showPicker && (
        <AssetPicker 
          excludeUrls={items.map(i => i.url)}
          onSelect={async (url) => {
            setShowPicker(false);
            setSaving(true);
            try {
              await addDoc(collection(db, 'gallery'), {
                url,
                type: isVideo(url) ? 'video' : 'image',
                title: url.split('/').pop()?.split('.')[0].toUpperCase(),
                order: items.length,
                createdAt: new Date().toISOString()
              });
              fetchGallery();
              setAlert({ message: "ITEM_ADDED_FROM_LIBRARY", type: 'success' });
            } catch (err: any) {
              setAlert({ message: "LIBRARY_SYNC_FAILED", type: 'error' });
            } finally { setSaving(false); }
          }} 
          onClose={() => setShowPicker(false)} 
        />
      )}

      {/* Header following screenshot style */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">GALLERY_CORE</h2>
          <p className="text-xs font-tech text-white/30 uppercase tracking-[0.6em]">Manifesting visuals from domain storage</p>
          
          <div className="flex gap-8 mt-8 border-b border-white/10">
            <button 
              onClick={() => setActiveSubTab('gallery')}
              className={`text-[11px] font-black uppercase tracking-[0.4em] pb-3 transition-all relative ${activeSubTab === 'gallery' ? 'text-accent' : 'text-white/20 hover:text-white'}`}
            >
              LIVE_WEBSITE ({items.length})
              {activeSubTab === 'gallery' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />}
            </button>
            <button 
              onClick={() => setActiveSubTab('repository')}
              className={`text-[11px] font-black uppercase tracking-[0.4em] pb-3 transition-all relative ${activeSubTab === 'repository' ? 'text-accent' : 'text-white/20 hover:text-white'}`}
            >
              IMPORT_STAGING ({repoAssets.length})
              {activeSubTab === 'repository' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={confirmClearAll}
            className="bg-red-500/10 border border-red-500/20 text-red-500 px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={16} /> CLEAR_ALL
          </button>
          <button 
            onClick={handleSyncLocal}
            className="bg-white/5 border border-white/10 text-white/60 px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3 hover:border-accent hover:text-accent transition-all"
          >
            <Database size={16} /> SYNC_LOCAL_FILES
          </button>
          <button 
            onClick={() => setShowPicker(true)}
            className="bg-accent/10 border border-accent/20 text-accent px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3 hover:bg-accent hover:text-black transition-all"
          >
            <Database size={16} /> LIBRARY
          </button>
          <label className="bg-accent text-black px-10 py-4 font-black uppercase text-[10px] tracking-[0.3em] cursor-pointer flex items-center gap-3 hover:bg-white transition-all">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            ADD_MEDIA
            <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleUpload} />
          </label>
        </div>
      </header>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {((activeSubTab === 'gallery' && selectedGallery.size > 0) || (activeSubTab === 'repository' && selectedRepo.size > 0)) && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-black border border-accent/30 p-4 rounded-full flex items-center gap-8 shadow-2xl shadow-accent/20 backdrop-blur-xl"
          >
            <span className="text-[10px] font-black italic uppercase tracking-widest pl-4">
              {activeSubTab === 'gallery' ? `${selectedGallery.size} ITEMS SELECTED` : `${selectedRepo.size} ITEMS STAGED`}
            </span>
            <div className="flex gap-2">
              {activeSubTab === 'gallery' ? (
                <button 
                  disabled={saving}
                  onClick={confirmBulkDelete} 
                  className="bg-red-500 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                  DELETE_SELECTED
                </button>
              ) : (
                <button 
                  disabled={saving}
                  onClick={confirmBulkPublish} 
                  className="bg-accent text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 
                  SEND_TO_GALLERY
                </button>
              )}
              <button 
                onClick={() => { setSelectedGallery(new Set()); setSelectedRepo(new Set()); }}
                className="bg-white/10 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      <div 
        ref={gridRef}
        onMouseDown={handleMouseDown}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 select-none"
      >
        {activeSubTab === 'gallery' ? (
          items.map((item, i) => (
            <div 
              key={item.id} 
              ref={el => el ? itemRefs.current.set(`gallery-${i}`, el) : itemRefs.current.delete(`gallery-${i}`)}
              onClick={(e) => { e.stopPropagation(); toggleGallerySelection(item.id); }}
              className={`relative aspect-[4/5] bg-surface border transition-all cursor-pointer group overflow-hidden ${selectedGallery.has(getItemKey(item)) ? 'border-accent ring-2 ring-accent ring-offset-4 ring-offset-black' : 'border-white/5'}`}
            >
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              ) : (
                <img src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              )}
              
              <div className={`absolute top-6 left-6 w-8 h-8 border-2 flex items-center justify-center transition-all ${selectedGallery.has(getItemKey(item)) ? 'bg-accent border-accent text-black' : 'bg-black/60 border-white/20 text-transparent'}`}>
                <Plus size={18} className={selectedGallery.has(getItemKey(item)) ? 'rotate-45' : ''} />
              </div>

              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-3">
                  <button onClick={() => handleMove(i, 'up')} disabled={i === 0} className="p-3 bg-white/10 hover:bg-accent hover:text-black rounded transition-all disabled:opacity-0"><ChevronRight size={20} className="-rotate-90" /></button>
                  <button onClick={() => handleMove(i, 'down')} disabled={i === items.length - 1} className="p-3 bg-white/10 hover:bg-accent hover:text-black rounded transition-all disabled:opacity-0"><ChevronRight size={20} className="rotate-90" /></button>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-4 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={24} />
                </button>
              </div>
              {item.type === 'video' && <Video size={20} className="absolute top-6 right-6 text-accent" />}
            </div>
          ))
        ) : (
          repoAssets.map((file, i) => (
            <div 
              key={file} 
              ref={el => el ? itemRefs.current.set(`repository-${i}`, el) : itemRefs.current.delete(`repository-${i}`)}
              onClick={(e) => { e.stopPropagation(); toggleRepoSelection(file); }}
              className={`relative aspect-[4/5] bg-surface border transition-all cursor-pointer group overflow-hidden ${selectedRepo.has(getItemKey({ url: `/files/${file}`, title: file })) ? 'border-accent ring-2 ring-accent ring-offset-4 ring-offset-black' : 'border-white/5'}`}
            >
              {isVideo(file) ? (
                <video src={`/files/${file}`} className="w-full h-full object-cover grayscale transition-all duration-500" />
              ) : (
                <img src={`/files/${file}`} className="w-full h-full object-cover grayscale transition-all duration-500" />
              )}

              <div className={`absolute top-6 left-6 w-8 h-8 border-2 flex items-center justify-center transition-all ${selectedRepo.has(getItemKey({ url: `/files/${file}`, title: file })) ? 'bg-accent border-accent text-black' : 'bg-black/60 border-white/20 text-transparent'}`}>
                <Plus size={18} />
              </div>

              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => handlePublishFromRepo(file)}
                  className="bg-accent text-black px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> SEND_TO_GALLERY
                </button>
              </div>
              {isVideo(file) && <Video size={20} className="absolute top-6 right-6 text-accent" />}
            </div>
          ))
        )}
        
        {(activeSubTab === 'repository' && repoAssets.length === 0) && (
          <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="font-tech text-xs text-white/20 uppercase tracking-[1em]">NO_NEW_ASSETS_IN_DOMAIN_STORAGE</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function HeroManager() {
  const [hero, setHero] = useState<HeroSettings>({
    title: 'THEE UNITE',
    tagline: 'EST 2024',
    subtitle: 'FOR EVERY SOUL THAT DARES TO DREAM',
    bgUrl: '/hero-video.mp4',
    bgType: 'video'
  });
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchHero = async () => {
      const snap = await getDoc(doc(db, 'settings', 'hero'));
      if (snap.exists()) setHero(snap.data() as HeroSettings);
    };
    fetchHero();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setSaving(true);
    try {
      const file = e.target.files[0];
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const url = await uploadFile(file, `hero/${Date.now()}_${file.name}`);
      setHero(prev => ({ ...prev, bgUrl: url, bgType: type }));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'hero'), hero);
      alert('Hero synchronized');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {showPicker && (
        <AssetPicker 
          onSelect={(url) => { 
            setHero(h => ({ ...h, bgUrl: url, bgType: url.endsWith('.mp4') ? 'video' : 'image' })); 
            setShowPicker(false); 
          }} 
          onClose={() => setShowPicker(false)} 
        />
      )}

      <header className="mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">HERO_SYNC</h2>
      </header>

      <div className="max-w-2xl space-y-8">
        <div className="aspect-video bg-surface border border-white/5 relative overflow-hidden flex items-center justify-center">
          {hero.bgType === 'video' ? (
            <video src={hero.bgUrl} className="w-full h-full object-cover opacity-50" autoPlay loop muted />
          ) : (
            <img src={hero.bgUrl} className="w-full h-full object-cover opacity-50" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex gap-4">
              <button onClick={() => setShowPicker(true)} className="flex flex-col items-center justify-center p-6 bg-accent text-black hover:bg-white transition-all">
                <Database size={32} className="mb-2" />
                <span className="font-tech text-[10px] tracking-widest uppercase">LIBRARY</span>
              </button>
              <label className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 transition-all cursor-pointer">
                <Upload size={32} className="text-white mb-2" />
                <span className="font-tech text-[10px] tracking-widest uppercase">UPLOAD</span>
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Input label="Title" value={hero.title} onChange={v => setHero({...hero, title: v})} />
          <Input label="Tagline (Small text above)" value={hero.tagline} onChange={v => setHero({...hero, tagline: v})} />
          <Input label="Subtitle (Large text below)" value={hero.subtitle} onChange={v => setHero({...hero, subtitle: v})} />
          
          <button 
            disabled={saving}
            onClick={handleSave} 
            className="w-full bg-accent text-black py-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            SYNCHRONIZE_HERO
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function PaymentManager() {
  const [payments, setPayments] = useState<PaymentSettings>({
    paypalEmail: '',
    mtnNumber: '',
    airtelNumber: '',
    flutterwavePublicKey: '',
    flutterwaveSecretKey: '',
    flutterwaveWebhookHash: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      const snap = await getDoc(doc(db, 'settings', 'payments'));
      if (snap.exists()) setPayments(snap.data() as PaymentSettings);
    };
    fetchPayments();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'payments'), payments);
      alert('Payment settings secured');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <header className="mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">FINANCE_CORE</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
        <section className="space-y-6">
          <h3 className="text-lg font-black uppercase text-accent border-b border-white/5 pb-2">DIRECT_PAYMENTS</h3>
          <Input label="PayPal Recipient Email" value={payments.paypalEmail} onChange={v => setPayments({...payments, paypalEmail: v})} />
          <Input label="MTN Mobile Money" value={payments.mtnNumber} onChange={v => setPayments({...payments, mtnNumber: v})} />
          <Input label="Airtel Money" value={payments.airtelNumber} onChange={v => setPayments({...payments, airtelNumber: v})} />
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-black uppercase text-accent border-b border-white/5 pb-2">GATEWAY_CONFIG (FLUTTERWAVE)</h3>
          <Input label="Public Key" value={payments.flutterwavePublicKey} onChange={v => setPayments({...payments, flutterwavePublicKey: v})} />
          <Input label="Secret Key" type="password" value={payments.flutterwaveSecretKey} onChange={v => setPayments({...payments, flutterwaveSecretKey: v})} />
          <Input label="Webhook Hash" value={payments.flutterwaveWebhookHash} onChange={v => setPayments({...payments, flutterwaveWebhookHash: v})} />
          <p className="text-[9px] font-tech text-white/20 uppercase tracking-widest leading-relaxed">
            Keys are encrypted at rest via Firebase Security Rules. Only authenticated administrators can access these values.
          </p>
        </section>

        <div className="md:col-span-2 pt-8">
          <button 
            disabled={saving}
            onClick={handleSave} 
            className="w-full bg-accent text-black py-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            SECURE_FINANCIAL_SETTINGS
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- UI Helpers ---

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "CONFIRM", 
  cancelText = "CANCEL",
  isDestructive = false
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  confirmText?: string,
  cancelText?: string,
  isDestructive?: boolean
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-white/10 p-8 rounded-2xl shadow-2xl"
          >
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{title}</h3>
            <p className="text-xs font-tech text-white/40 uppercase tracking-widest leading-relaxed mb-8">{message}</p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }}
                className={`flex-1 px-6 py-4 font-black uppercase text-[10px] tracking-widest transition-all ${
                  isDestructive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-accent text-black hover:bg-white'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Alert({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`fixed top-8 right-8 z-[300] px-8 py-4 border font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center gap-4 ${
        type === 'success' ? 'bg-black border-accent text-accent' : 'bg-black border-red-500 text-red-500'
      }`}
    >
      <div className={`w-2 h-2 rounded-full animate-pulse ${type === 'success' ? 'bg-accent' : 'bg-red-500'}`} />
      {message}
    </motion.div>
  );
}

function Input({ label, type = 'text', value, onChange, required = false }: { label: string, type?: string, value: string, onChange: (v: string) => void, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="font-tech text-[10px] tracking-widest text-white/30 uppercase">{label}</label>
      <input 
        required={required}
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors" 
      />
    </div>
  );
}
