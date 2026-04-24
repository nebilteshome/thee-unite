import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import AdminGuard from './components/AdminGuard';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Pages
import Home from './pages/Home';
import Collection from './pages/Collection';
import Shop from './pages/Shop';
import Gallery from './pages/Gallery';
import Archive from './pages/Archive';
import Foundry from './pages/Foundry';
import Admin, { ProductManager, GalleryManager, HeroManager, PaymentManager, OrderManager, PolicyManager } from './pages/Admin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/foundry" element={<Foundry />} />
            <Route 
              path="/admin" 
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              }
            >
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="orders" element={<OrderManager />} />
              <Route path="gallerycore" element={<GalleryManager />} />
              <Route path="heros" element={<HeroManager />} />
              <Route path="policies" element={<PolicyManager />} />
              <Route path="payments" element={<PaymentManager />} />
            </Route>
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
