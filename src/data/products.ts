import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  image?: string;
  video?: string;
  stock?: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  createdAt?: string;
}

/**
 * Fetches all products from Firestore, ordered by creation date.
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    console.log(`Fetched ${products.length} products from Firestore`);
    return products;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    return [];
  }
};

// Keep the hardcoded products as a fallback or for initial development
// but mark them as deprecated in favor of fetchProducts()
/** @deprecated Use fetchProducts() instead */
export const products: Product[] = [
  {
    id: "1",
    name: "BLACK ESSENTIAL HOODIE",
    price: 120,
    category: "ESSENTIALS",
    images: ["/images/product1.jpg"],
    image: "/images/product1.jpg",
    video: "/hero-video.mp4"
  },
  {
    id: "2",
    name: "OVERSIZED TEE",
    price: 80,
    category: "ESSENTIALS",
    images: ["/images/product2.jpg"],
    image: "/images/product2.jpg",
    video: "/hero-video.mp4"
  },
  {
    id: "3",
    name: "CARGO PANTS",
    price: 150,
    category: "ESSENTIALS",
    images: ["/images/product3.jpg"],
    image: "/images/product3.jpg",
    video: "/hero-video.mp4"
  }
];
