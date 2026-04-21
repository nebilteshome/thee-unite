import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Collection from './pages/Collection';
import Shop from './pages/Shop';
import Gallery from './pages/Gallery';
import Archive from './pages/Archive';
import Foundry from './pages/Foundry';
import Admin, { ProductManager, GalleryManager, HeroManager, PaymentManager } from './pages/Admin';

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
  return (
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
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="gallerycore" element={<GalleryManager />} />
            <Route path="heros" element={<HeroManager />} />
            <Route path="payments" element={<PaymentManager />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
