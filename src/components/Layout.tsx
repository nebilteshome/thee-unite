import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, ArrowUpRight, Hash, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cartStore } from '../lib/cart';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, runTransaction, doc } from 'firebase/firestore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState(cartStore.items);
  const [isCartOpen, setIsCartOpen] = useState(cartStore.isOpen);
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();

  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Ghana'
  });

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setCartItems([...cartStore.items]);
      setIsCartOpen(cartStore.isOpen);
      if (!cartStore.isOpen) setIsCheckoutMode(false);
    });
    return unsubscribe;
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: `THEE-${Date.now()}`,
    amount: subtotal,
    currency: 'USD',
    payment_options: 'card,mobilemoneyghana,mobilemoneyuganda,mobilemoneyrwanda,mobilemoneyzambia,mobilemoneytanzania,paypal',
    customer: {
      email: shippingDetails.email || auth.currentUser?.email || 'customer@example.com',
      phone_number: shippingDetails.phone || '',
      name: shippingDetails.fullName || auth.currentUser?.displayName || 'Guest Customer',
    },
    customizations: {
      title: 'THEE UNITE',
      description: `Payment for ${totalItems} items`,
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return;
    
    // Validate shipping if in checkout mode
    if (isCheckoutMode) {
      if (!shippingDetails.fullName || !shippingDetails.email || !shippingDetails.address) {
        alert("Please fulfill all manifestation requirements (Shipping Details).");
        return;
      }
    } else {
      setIsCheckoutMode(true);
      return;
    }

    setIsProcessing(true);
    
    // DEMO MODE: Directly create order without real payment
    try {
      // 1. PRE-CALCULATE EVERYTHING OUTSIDE THE TRANSACTION
      const productIds = Array.from(new Set(cartItems.map(item => item.id.split('-')[0])));
      const productRefs = productIds.map(id => doc(db, 'products', id));
      const orderRef = doc(collection(db, 'orders'));
      
      const productQuantities = new Map();
      for (const item of cartItems) {
        const productId = item.id.split('-')[0];
        productQuantities.set(productId, (productQuantities.get(productId) || 0) + item.quantity);
      }

      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.id.split('-')[0],
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        total: subtotal,
        customer: {
          ...config.customer,
          ...shippingDetails
        },
        payment: {
          reference: config.tx_ref,
          status: 'demo_success',
          method: 'demo'
        },
        status: 'paid',
        createdAt: serverTimestamp()
      };

      await runTransaction(db, async (transaction) => {
        // 2. PERFORM ALL READS FIRST
        const snapshots = [];
        for (const ref of productRefs) {
          const snap = await transaction.get(ref);
          snapshots.push(snap);
        }

        // 3. PERFORM ALL WRITES SECOND (Synchronous queueing)
        transaction.set(orderRef, orderData);
        
        for (const snap of snapshots) {
          if (snap.exists()) {
            const currentStock = snap.data().stock ?? 0;
            const productId = snap.id;
            const quantity = productQuantities.get(productId) || 0;
            transaction.update(snap.ref, { 
              stock: Math.max(0, currentStock - quantity) 
            });
          }
        }
      });
      
      cartStore.clearCart();
      setIsCheckoutMode(false);
      cartStore.setIsOpen(false);
      alert('ORDER_MANIFESTED: Manifest sent to administrative core.');
    } catch (error: any) {
      console.error("Order creation failed:", error);
      alert(`ORDER_FAILED: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const mainLinks = [
    { name: 'Collection', path: '/collection' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Archive', path: '/archive' },
    { name: 'Foundry', path: '/foundry' },
  ];

  const footerLinks = [
    ...mainLinks,
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-black text-primary selection:bg-accent selection:text-black overflow-x-hidden">
      {/* Background Mask Symbol */}
      <div className="greater-than-mask top-[-100px] left-[100px]">{'>'}</div>
      <div className="greater-than-mask bottom-[-100px] right-[-100px] rotate-180 opacity-[0.02]">{'>'}</div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-4xl text-accent uppercase cursor-pointer hover:opacity-80 transition-opacity leading-none tracking-normal">
            UNITE
          </Link>
          <div className="hidden md:flex gap-12 text-[10px] tracking-[0.2em] uppercase font-medium text-white/50">
            {mainLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`transition-colors h-full flex items-center ${location.pathname === link.path ? 'text-accent' : 'hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => cartStore.setIsOpen(true)}
            className="flex items-center gap-2 group text-[10px] tracking-[0.2em] uppercase font-bold text-accent relative"
          >
            <ShoppingBag size={14} />
            <span>Shop Now [{totalItems}]</span>
          </motion.button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors md:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => cartStore.setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900 z-[101] flex flex-col border-l border-white/10 shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h3 className="font-tech text-[10px] tracking-[0.3em] uppercase text-accent mb-1 underline underline-offset-4 decoration-accent/30">
                    {isCheckoutMode ? 'Fulfillment_Data' : 'Your Frequency'}
                  </h3>
                  <p className="text-2xl font-black italic uppercase tracking-tighter">
                    {isCheckoutMode ? 'Shipping_Info' : 'Shopping Bag'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isCheckoutMode && (
                    <button 
                      onClick={() => setIsCheckoutMode(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-accent"
                      title="Return to Bag"
                    >
                      <ArrowUpRight size={24} className="rotate-[225deg]" />
                    </button>
                  )}
                  <button 
                    onClick={() => cartStore.setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {isCheckoutMode ? (
                  <form className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2">
                      <label className="font-tech text-[9px] tracking-widest text-white/30 uppercase">Full_Name</label>
                      <input 
                        type="text" 
                        value={shippingDetails.fullName}
                        onChange={e => setShippingDetails({...shippingDetails, fullName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors"
                        placeholder="ENTER_NAME..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-tech text-[9px] tracking-widest text-white/30 uppercase">Email_Address</label>
                      <input 
                        type="email" 
                        value={shippingDetails.email}
                        onChange={e => setShippingDetails({...shippingDetails, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors"
                        placeholder="ENTER_EMAIL..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-tech text-[9px] tracking-widest text-white/30 uppercase">Contact_Phone</label>
                      <input 
                        type="tel" 
                        value={shippingDetails.phone}
                        onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors"
                        placeholder="+000 000 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-tech text-[9px] tracking-widest text-white/30 uppercase">Manifestation_Address</label>
                      <textarea 
                        value={shippingDetails.address}
                        onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors min-h-[100px]"
                        placeholder="STREET, HOUSE, ETC..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-tech text-[9px] tracking-widest text-white/30 uppercase">City</label>
                        <input 
                          type="text" 
                          value={shippingDetails.city}
                          onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors"
                          placeholder="CITY..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-tech text-[9px] tracking-widest text-white/30 uppercase">Country</label>
                        <select 
                          value={shippingDetails.country}
                          onChange={e => setShippingDetails({...shippingDetails, country: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors appearance-none"
                        >
                          <option value="Ghana">Ghana</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="World">Greater Domain</option>
                        </select>
                      </div>
                    </div>
                  </form>
                ) : (
                  cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                      <ShoppingBag size={64} strokeWidth={1} />
                      <p className="font-tech text-xs tracking-widest uppercase italic">Your bag is currently void</p>
                      <Link 
                        to="/collection" 
                        onClick={() => cartStore.setIsOpen(false)}
                        className="text-accent underline underline-offset-8 decoration-accent/30 font-black text-xs tracking-widest"
                      >
                        ENTER THE DOMAIN
                      </Link>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex gap-6 group animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="w-24 aspect-[3/4] bg-surface flex-shrink-0 overflow-hidden border border-white/5 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-black uppercase tracking-tighter text-lg">{item.name}</h4>
                              <span className="font-tech text-xs text-accent">${item.price}</span>
                            </div>
                            <div className="flex gap-4 text-[10px] items-center text-white/40 font-tech uppercase tracking-widest">
                              <span>Size: {item.size}</span>
                              <span className="w-1 h-1 bg-white/20 rounded-full" />
                              <span>Color: {item.color}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 bg-black/50 p-1 border border-white/10">
                              <button 
                                onClick={() => cartStore.updateQuantity(item.id, -1)}
                                className="p-1 hover:text-accent transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-tech text-xs w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => cartStore.updateQuantity(item.id, 1)}
                                className="p-1 hover:text-accent transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => cartStore.removeItem(item.id)}
                              className="text-white/20 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-8 bg-black border-t border-white/10 space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="font-tech text-[10px] tracking-[0.4em] uppercase text-white/40 italic flex items-center gap-4">
                      Subtotal_manifest <div className="h-px w-8 bg-white/10" />
                    </span>
                    <span className="text-3xl font-black italic tracking-tighter">${subtotal}</span>
                  </div>
                  <button 
                    onClick={() => handleCheckout()}
                    disabled={isProcessing}
                    className="w-full bg-accent text-black py-6 font-black uppercase text-sm tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isProcessing ? (
                      <>
                        Synchronizing <Loader2 className="animate-spin" size={18} />
                      </>
                    ) : (
                      isCheckoutMode ? (
                        <>FINALIZE_MANIFEST <ArrowUpRight size={18} /></>
                      ) : (
                        <>INITIATE_FULFILLMENT <ArrowUpRight size={18} /></>
                      )
                    )}
                  </button>
                  <p className="text-[9px] text-center text-white/20 font-tech uppercase tracking-widest">
                    {isCheckoutMode ? 'Confirming manifest will finalize the order.' : 'Taxes and shipping calculated at final manifest.'}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[100px] left-0 w-full z-40 bg-black/95 backdrop-blur-md border-b border-white/10 px-8 py-12 md:hidden"
          >
            <div className="flex flex-col gap-6 text-4xl font-black uppercase tracking-tight">
              <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
              {mainLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className={location.pathname === link.path ? 'text-accent' : ''}
                >
                  {link.name}
                </Link>
              ))}
              <a href="https://instagram.com/thee_unite" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent italic text-2xl">
                Instagram <ArrowUpRight size={24} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-[calc(100vh-100px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black pt-40 pb-12 px-8 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
          <div className="md:col-span-2">
            <h3 className="text-7xl font-display text-accent mb-8 leading-none uppercase">UNITE</h3>
            <p className="text-white/40 max-w-sm font-light italic text-lg leading-relaxed mb-12">
              The Greater Domain. Authentic Streetwear. We are the architects of the manifested dream.
            </p>
          </div>
          
          <div>
            <h4 className="font-tech text-xs tracking-[0.4em] uppercase text-accent mb-8 font-black underline underline-offset-8">MANIFEST</h4>
            <div className="flex flex-col gap-6 font-black text-sm uppercase tracking-widest italic">
              {footerLinks.map(link => (
                <Link key={link.path} to={link.path} className="hover:text-accent transition-colors flex items-center justify-between group">
                  {link.name} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <h4 className="font-tech text-xs tracking-[0.4em] uppercase text-white/30 mb-8 font-black">NEWSLETTER</h4>
            <div className="flex flex-col gap-4">
              <div className="flex border-b border-white/20 pb-4 group focus-within:border-accent transition-colors">
                <input 
                  type="email" 
                  placeholder="FREQUENCY_ACCESS" 
                  className="bg-transparent border-none outline-none text-[10px] font-black tracking-[0.4em] w-full placeholder:text-white/10 text-accent uppercase"
                />
                <button className="text-accent hover:scale-125 transition-transform"><ArrowUpRight size={20} /></button>
              </div>
              <p className="text-[9px] text-white/20 font-tech uppercase tracking-widest">Connect your frequency to our drops.</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8 pt-8 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">
            Thee Unite &copy; SERIES_01 / Manifested 2024
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase italic">Authentic Streetwear</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
