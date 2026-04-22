import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Save, Image as ImageIcon, ChevronRight, Lock, 
  Settings, ShoppingBag, Layout as LayoutIcon, CreditCard, 
  LogOut, Upload, X, Edit2, Loader2, Video, Database, Search, Hash
} from 'lucide-react';
import { db, auth, uploadFile } from '../lib/firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  updateDoc, query, orderBy, getDoc, setDoc, writeBatch, onSnapshot
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Link, NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- Types ---

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
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

interface Policies {
  sizeGuide: string;
  shipping: string;
  returns: string;
}

interface Order {
  id: string;
  items: any[];
  total: number;
  customer: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  status: string;
  payment: {
    reference: string;
  };
  createdAt: any;
}

// --- Main Admin Component ---

export default function Admin() {
  const { user, isAdmin: adminStatus, loading } = useAuth();

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
          <TabButton to="/admin/orders" icon={<Hash size={18} />} label="ORDERS" />
          <TabButton to="/admin/gallerycore" icon={<ImageIcon size={18} />} label="GALLERY" />
          <TabButton to="/admin/heros" icon={<LayoutIcon size={18} />} label="HERO_SECTION" />
          <TabButton to="/admin/policies" icon={<Database size={18} />} label="POLICIES" />
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
    stock: '10',
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
      stock: parseInt(formData.stock) || 0,
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
      stock: (p.stock ?? 10).toString(),
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
    setFormData({ name: '', price: '', stock: '10', category: 'ESSENTIALS', description: '', sizes: 'S, M, L, XL', colors: 'Black, White', images: [] });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {showPicker && <AssetPicker onSelect={(url) => { setFormData(p => ({ ...p, images: [...p.images, url] })); setShowPicker(false); }} onClose={() => setShowPicker(false)} />}
      
      <header className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">PRODUCT_CORE</h2>
        <p className="text-[10px] font-tech text-white/20 uppercase tracking-[0.5em]">{products.length} OBJECTS_MANIFESTED</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="bg-surface/30 border border-white/5 p-8 rounded-2xl h-fit">
          <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-4">
            {isEditing ? 'UPDATE_FREQUENCY' : 'NEW_ENTRY'} 
            {isEditing && <button onClick={resetForm} className="text-[10px] font-tech text-accent underline ml-auto">CANCEL_EDIT</button>}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
              </div>
              <Input label="Price_USD" type="number" value={formData.price} onChange={v => setFormData({...formData, price: v})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Inventory_Stock" type="number" value={formData.stock} onChange={v => setFormData({...formData, stock: v})} required />
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
                <p className="text-accent font-black text-sm">${p.price} | {p.stock} units</p>
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

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
  };

  const filtered = orders.filter(o => 
    o.customer.email.toLowerCase().includes(filter.toLowerCase()) ||
    o.payment?.reference.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <header className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">ORDER_LOGS</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
          <input 
            placeholder="SEARCH_ORDERS..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-black border border-white/10 p-3 pl-10 font-tech text-[10px] uppercase text-accent outline-none w-64"
          />
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center font-tech text-xs text-accent">RETRIEVING_MANIFESTS...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 text-white/20 font-tech text-xs uppercase">No orders detected in core</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 font-tech text-[9px] text-white/30 uppercase tracking-[0.3em]">
                  <th className="pb-4 pl-4">Manifest_ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Location</th>
                  <th className="pb-4">Items</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs uppercase font-black italic">
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-6 pl-4 font-tech text-[10px] text-white/40 group-hover:text-accent">
                      {order.id.slice(0, 8)}<br/>
                      <span className="text-[8px]">{order.payment?.reference}</span>
                    </td>
                    <td className="py-6">
                      {order.customer.name}<br/>
                      <span className="font-tech text-[9px] text-white/30 lowercase italic">{order.customer.email}</span><br/>
                      <span className="font-tech text-[9px] text-accent/60 italic">{order.customer.phone}</span>
                    </td>
                    <td className="py-6 max-w-[200px]">
                      <div className="truncate text-white/60 text-[10px]">{order.customer.address}</div>
                      <div className="font-tech text-[9px] text-white/30">{order.customer.city}, {order.customer.country}</div>
                    </td>
                    <td className="py-6">
                      {order.items.length} units
                    </td>
                    <td className="py-6 text-accent">${order.total}</td>
                    <td className="py-6">
                      <span className={`px-2 py-1 text-[8px] font-tech ${
                        order.status === 'paid' ? 'bg-green-500/20 text-green-500' : 
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' : 
                        'bg-white/10 text-white/40'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-6 pr-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-black border border-white/10 p-2 text-[9px] font-black uppercase text-accent outline-none"
                      >
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
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

  const isVideo = (filename: string) => /\.(mp4|webm|ogg|mov|avi|mkv|3gp|flv|wmv)$/i.test(filename);

  const buildPublishedGalleryItem = (file: string, currentOrder: number) => {
    const url = `/files/${file}`;
    const type = isVideo(file) ? 'video' : 'image';
    const title = file.split('.')[0].toUpperCase();
    
    return {
      url,
      type,
      title,
      order: currentOrder,
      createdAt: new Date().toISOString(),
      published: true
    };
  };

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
          const overlap = rect.left < box.right && rect.right > box.left && rect.top < box.bottom && rect.bottom > box.top;
          
          if (overlap) {
            const key = activeSubTab === 'gallery' ? getItemKey(item) : item;
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
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoAssets = async (currentItems: GalleryItem[]) => {
    try {
      const res = await fetch('/assets.json');
      if (!res.ok) return;
      const allFiles: string[] = await res.json();
      const galleryUrls = new Set(currentItems.map(item => item.url));
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
    } finally {
      setUploading(false);
    }
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
    if (!confirm('Erase this manifest?')) return;
    await deleteDoc(doc(db, 'gallery', id));
    fetchGallery();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
            } finally { setSaving(false); }
          }} 
          onClose={() => setShowPicker(false)} 
        />
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">GALLERY_CORE</h2>
          <div className="flex gap-8 mt-8 border-b border-white/10">
            <button onClick={() => setActiveSubTab('gallery')} className={`text-[11px] font-black uppercase tracking-[0.4em] pb-3 ${activeSubTab === 'gallery' ? 'text-accent' : 'text-white/20'}`}>LIVE ({items.length})</button>
            <button onClick={() => setActiveSubTab('repository')} className={`text-[11px] font-black uppercase tracking-[0.4em] pb-3 ${activeSubTab === 'repository' ? 'text-accent' : 'text-white/20'}`}>STAGING ({repoAssets.length})</button>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowPicker(true)} className="bg-white/5 border border-white/10 text-white px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em]">LIBRARY</button>
          <label className="bg-accent text-black px-10 py-4 font-black uppercase text-[10px] tracking-[0.3em] cursor-pointer">
            {uploading ? 'UPLOADING...' : 'ADD_MEDIA'}
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </header>

      <div ref={gridRef} onMouseDown={handleMouseDown} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activeSubTab === 'gallery' ? items.map((item, i) => (
          <div 
            key={item.id} 
            ref={el => el ? itemRefs.current.set(`gallery-${i}`, el) : itemRefs.current.delete(`gallery-${i}`)}
            className={`relative aspect-[4/5] bg-surface border rounded overflow-hidden group ${selectedGallery.has(item.id) ? 'border-accent' : 'border-white/5'}`}
          >
            {item.type === 'video' ? <video src={item.url} className="w-full h-full object-cover" /> : <img src={item.url} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-4 transition-opacity">
              <div className="flex gap-2">
                <button onClick={() => handleMove(i, 'up')} className="p-2 bg-white/10 hover:bg-accent hover:text-black transition-all"><ChevronRight size={16} className="-rotate-90" /></button>
                <button onClick={() => handleMove(i, 'down')} className="p-2 bg-white/10 hover:bg-accent hover:text-black transition-all"><ChevronRight size={16} className="rotate-90" /></button>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
            </div>
          </div>
        )) : repoAssets.map((file, i) => (
          <div 
            key={file} 
            ref={el => el ? itemRefs.current.set(`repository-${i}`, el) : itemRefs.current.delete(`repository-${i}`)}
            className="relative aspect-[4/5] bg-surface border border-white/5 rounded overflow-hidden"
          >
            {isVideo(file) ? <video src={`/files/${file}`} className="w-full h-full object-cover opacity-40" /> : <img src={`/files/${file}`} className="w-full h-full object-cover opacity-40" />}
            <button 
              onClick={async () => {
                const data = buildPublishedGalleryItem(file, items.length);
                await addDoc(collection(db, 'gallery'), data);
                fetchGallery();
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity font-black text-[10px] tracking-widest uppercase"
            >
              PUBLISH
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function HeroManager() {
  const [hero, setHero] = useState<HeroSettings>({ title: '', tagline: '', subtitle: '', bgUrl: '', bgType: 'video' });
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchHero = async () => {
      const snap = await getDoc(doc(db, 'settings', 'hero'));
      if (snap.exists()) setHero(snap.data() as HeroSettings);
    };
    fetchHero();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'hero'), hero);
      alert('Hero Synchronized');
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {showPicker && <AssetPicker onSelect={(url) => { setHero(h => ({ ...h, bgUrl: url, bgType: url.endsWith('.mp4') ? 'video' : 'image' })); setShowPicker(false); }} onClose={() => setShowPicker(false)} />}
      <header className="mb-12"><h2 className="text-4xl font-black italic uppercase tracking-tighter">HERO_SYNC</h2></header>
      <div className="max-w-2xl space-y-6">
        <div className="aspect-video bg-surface border border-white/5 relative overflow-hidden flex items-center justify-center">
          {hero.bgType === 'video' ? <video src={hero.bgUrl} className="w-full h-full object-cover opacity-50" autoPlay loop muted /> : <img src={hero.bgUrl} className="w-full h-full object-cover opacity-50" />}
          <button onClick={() => setShowPicker(true)} className="absolute bg-accent text-black px-6 py-3 font-black text-[10px] tracking-widest uppercase">SELECT_MEDIA</button>
        </div>
        <Input label="Title" value={hero.title} onChange={v => setHero({...hero, title: v})} />
        <Input label="Tagline" value={hero.tagline} onChange={v => setHero({...hero, tagline: v})} />
        <Input label="Subtitle" value={hero.subtitle} onChange={v => setHero({...hero, subtitle: v})} />
        <button disabled={saving} onClick={handleSave} className="w-full bg-accent text-black py-4 font-black uppercase tracking-widest flex items-center justify-center gap-4">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} SAVE_HERO
        </button>
      </div>
    </motion.div>
  );
}

export function PolicyManager() {
  const [policies, setPolicies] = useState<Policies>({ sizeGuide: '', shipping: '', returns: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      const snap = await getDoc(doc(db, 'settings', 'policies'));
      if (snap.exists()) setPolicies(snap.data() as Policies);
    };
    fetchPolicies();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'policies'), policies);
      alert('Policies Synchronized');
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <header className="mb-12"><h2 className="text-4xl font-black italic uppercase tracking-tighter">POLICY_CORE</h2></header>
      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-tech text-white/30 uppercase tracking-widest">Size_Guide</label>
          <textarea value={policies.sizeGuide} onChange={e => setPolicies({...policies, sizeGuide: e.target.value})} className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none min-h-[100px] text-xs" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-tech text-white/30 uppercase tracking-widest">Shipping_Policy</label>
          <textarea value={policies.shipping} onChange={e => setPolicies({...policies, shipping: e.target.value})} className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none min-h-[100px] text-xs" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-tech text-white/30 uppercase tracking-widest">Returns_Policy</label>
          <textarea value={policies.returns} onChange={e => setPolicies({...policies, returns: e.target.value})} className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none min-h-[100px] text-xs" />
        </div>
        <button disabled={saving} onClick={handleSave} className="w-full bg-accent text-black py-4 font-black uppercase tracking-widest flex items-center justify-center gap-4">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} SAVE_POLICIES
        </button>
      </div>
    </motion.div>
  );
}

export function PaymentManager() {
  const [payments, setPayments] = useState<PaymentSettings>({ paypalEmail: '', mtnNumber: '', airtelNumber: '', flutterwavePublicKey: '', flutterwaveSecretKey: '', flutterwaveWebhookHash: '' });
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
      alert('Payments Secured');
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <header className="mb-12"><h2 className="text-4xl font-black italic uppercase tracking-tighter">FINANCE_CORE</h2></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        <div className="space-y-4">
          <Input label="PayPal Email" value={payments.paypalEmail} onChange={v => setPayments({...payments, paypalEmail: v})} />
          <Input label="MTN Number" value={payments.mtnNumber} onChange={v => setPayments({...payments, mtnNumber: v})} />
          <Input label="Airtel Number" value={payments.airtelNumber} onChange={v => setPayments({...payments, airtelNumber: v})} />
        </div>
        <div className="space-y-4">
          <Input label="FW Public Key" value={payments.flutterwavePublicKey} onChange={v => setPayments({...payments, flutterwavePublicKey: v})} />
          <Input label="FW Secret Key" type="password" value={payments.flutterwaveSecretKey} onChange={v => setPayments({...payments, flutterwaveSecretKey: v})} />
          <Input label="Webhook Hash" value={payments.flutterwaveWebhookHash} onChange={v => setPayments({...payments, flutterwaveWebhookHash: v})} />
        </div>
        <button disabled={saving} onClick={handleSave} className="md:col-span-2 w-full bg-accent text-black py-4 font-black uppercase tracking-widest flex items-center justify-center gap-4">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} SECURE_FINANCE
        </button>
      </div>
    </motion.div>
  );
}

// --- Helpers ---

function TabButton({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 px-4 py-4 font-black italic uppercase text-xs tracking-widest transition-all ${isActive ? 'bg-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </NavLink>
  );
}

function SelectionBox({ start, current }: { start: { x: number, y: number }, current: { x: number, y: number } }) {
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  const width = Math.abs(start.x - current.x);
  const height = Math.abs(start.y - current.y);
  return <div className="fixed z-[150] border-2 border-accent bg-accent/20 pointer-events-none" style={{ left, top, width, height }} />;
}

function AssetPicker({ onSelect, onClose, excludeUrls = [] }: { onSelect: (url: string) => void, onClose: () => void, excludeUrls?: string[] }) {
  const [assets, setAssets] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets.json').then(r => r.json()).then(data => {
      setAssets(data.filter((f: string) => !excludeUrls.includes(`/files/${f}`)));
      setLoading(false);
    });
  }, [excludeUrls]);

  const filtered = assets.filter(a => a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-surface border border-white/10 rounded-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <header className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-black italic uppercase">ASSET_LIBRARY</h3>
          <button onClick={onClose}><X size={20} /></button>
        </header>
        <div className="p-6"><input placeholder="SEARCH..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-black border border-white/10 p-4 font-tech text-xs text-accent outline-none" /></div>
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-6 gap-4">
          {filtered.map(asset => (
            <button key={asset} onClick={() => onSelect(`/files/${asset}`)} className="aspect-square bg-black border border-white/5 overflow-hidden hover:border-accent">
              {asset.endsWith('.mp4') ? <div className="h-full flex items-center justify-center text-[8px]">{asset}</div> : <img src={`/files/${asset}`} className="w-full h-full object-cover" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginView({ user, adminStatus, onLogin }: any) {
  const [bootstrapping, setBootstrapping] = useState(false);
  const handleBootstrap = async () => {
    if (!user) return;
    setBootstrapping(true);
    try {
      await setDoc(doc(db, 'admins', user.uid), { email: user.email, role: 'super_admin', manifestedAt: new Date().toISOString() });
      window.location.reload();
    } finally { setBootstrapping(false); }
  };
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
      <Lock className="text-accent mb-8" size={64} />
      <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">ACCESS_DENIED</h1>
      <button onClick={onLogin} className="bg-accent text-black px-12 py-4 font-black uppercase text-sm tracking-[0.3em] flex items-center gap-4">INITIATE_AUTH <ChevronRight size={18} /></button>
      {user && !adminStatus && user.email === 'fffg3839@gmail.com' && (
        <button disabled={bootstrapping} onClick={handleBootstrap} className="mt-8 text-[10px] font-black uppercase text-accent underline flex items-center gap-2">
          {bootstrapping ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />} BOOTSTRAP_ADMIN
        </button>
      )}
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, required = false }: { label: string, type?: string, value: string, onChange: (v: string) => void, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="font-tech text-[10px] tracking-widest text-white/30 uppercase">{label}</label>
      <input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors" />
    </div>
  );
}
