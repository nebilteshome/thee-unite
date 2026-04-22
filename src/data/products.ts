export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  video?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "BLACK ESSENTIAL HOODIE",
    price: 120,
    category: "ESSENTIALS",
    image: "/images/product1.jpg",
    video: "/hero-video.mp4" // Reusing hero video as placeholder
  },
  {
    id: "2",
    name: "OVERSIZED TEE",
    price: 80,
    category: "ESSENTIALS",
    image: "/images/product2.jpg",
    video: "/hero-video.mp4"
  },
  {
    id: "3",
    name: "CARGO PANTS",
    price: 150,
    category: "ESSENTIALS",
    image: "/images/product3.jpg",
    video: "/hero-video.mp4"
  }
];
