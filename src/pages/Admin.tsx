import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Save, Image as ImageIcon, ChevronRight, Lock, 
  Settings, ShoppingBag, Layout as LayoutIcon, CreditCard, 
  LogOut, Upload, X, Edit2, Loader2, Video
} from 'lucide-react';
import { db, auth, uploadFile } from '../lib/firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  updateDoc, query, orderBy, getDoc, setDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// --- Types ---

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
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
  const [activeTab, setActiveTab] = useState<'hero' | 'gallery' | 'products' | 'payments'>('products');

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

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
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
          <span className="font-tech text-[10px] tracking-[0.4em] text-accent uppercase mb-2 block">ADMIN_PANEL_v2.0</span>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">MANIFESTOR</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<ShoppingBag size={18} />} label="PRODUCTS" />
          <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon={<ImageIcon size={18} />} label="GALLERY" />
          <TabButton active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon={<LayoutIcon size={18} />} label="HERO_SECTION" />
          <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<CreditCard size={18} />} label="PAYMENTS" />
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
        <AnimatePresence mode="wait">
          {activeTab === 'products' && <ProductManager key="products" />}
          {activeTab === 'gallery' && <GalleryManager key="gallery" />}
          {activeTab === 'hero' && <HeroManager key="hero" />}
          {activeTab === 'payments' && <PaymentManager key="payments" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Sub-Components ---

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-4 font-black italic uppercase text-xs tracking-widest transition-all ${
        active ? 'bg-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function LoginView({ user, adminStatus, onLogin }: any) {
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
        <p className="mt-8 text-red-500 font-tech text-[10px] uppercase tracking-widest">
          Identity verified: {user.email}<br/>But authorization is missing.
        </p>
      )}
    </div>
  );
}

// --- Managers ---

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const urls = await Promise.all(
        Array.from(e.target.files).map(file => uploadFile(file, `products/${Date.now()}_${file.name}`))
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
    } catch (err) {
      alert('Save failed');
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
      images: p.images || [p.image] // handle old image field
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

function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    const q = query(collection(db, 'gallery'), orderBy('order'));
    const snapshot = await getDocs(q);
    setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const url = await uploadFile(file, `gallery/${Date.now()}_${file.name}`);
      
      await addDoc(collection(db, 'gallery'), {
        url,
        type,
        title: file.name.split('.')[0].toUpperCase(),
        order: items.length,
        createdAt: new Date().toISOString()
      });
      fetchGallery();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update orders in Firestore
    setSaving(true);
    try {
      await Promise.all(newItems.map((item, i) => updateDoc(doc(db, 'gallery', item.id), { order: i })));
      fetchGallery();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Erase from history?')) return;
    await deleteDoc(doc(db, 'gallery', id));
    fetchGallery();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <header className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">GALLERY_CORE</h2>
        <div className="flex gap-4">
          {saving && <Loader2 size={16} className="animate-spin text-accent" />}
          <label className="bg-accent text-black px-8 py-3 font-black uppercase text-xs tracking-widest cursor-pointer flex items-center gap-2 hover:bg-white transition-all">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            ADD_MEDIA
            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} />
          </label>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <div key={item.id} className="relative aspect-square bg-surface border border-white/5 group overflow-hidden">
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
            ) : (
              <img src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
            )}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2">
                <button onClick={() => handleMove(i, 'up')} disabled={i === 0} className="p-2 bg-white/10 hover:bg-accent hover:text-black rounded disabled:opacity-0 transition-all"><ChevronRight size={16} className="-rotate-90" /></button>
                <button onClick={() => handleMove(i, 'down')} disabled={i === items.length - 1} className="p-2 bg-white/10 hover:bg-accent hover:text-black rounded disabled:opacity-0 transition-all"><ChevronRight size={16} className="rotate-90" /></button>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={20} />
              </button>
            </div>
            {item.type === 'video' && <Video size={16} className="absolute top-2 right-2 text-white/50" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function HeroManager() {
  const [hero, setHero] = useState<HeroSettings>({
    title: 'THEE UNITE',
    tagline: 'EST 2024',
    subtitle: 'FOR EVERY SOUL THAT DARES TO DREAM',
    bgUrl: '/hero-video.mp4',
    bgType: 'video'
  });
  const [saving, setSaving] = useState(false);

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
    } catch (err) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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
          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <Upload size={32} className="text-accent mb-4" />
            <span className="font-tech text-xs tracking-widest uppercase">CHANGE_BACKGROUND</span>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
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

function PaymentManager() {
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
    } catch (err) {
      alert('Save failed');
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
