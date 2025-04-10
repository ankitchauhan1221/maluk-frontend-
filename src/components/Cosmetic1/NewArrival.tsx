'use client';

import React, { useEffect, useState } from 'react';
import Product from '../Product/Product';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import { ProductType } from '@/type/ProductType';

interface ApiProductType {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  salePrice?: number;
  category: { $oid: string };
  subcategory: { $oid: string };
  thumbnails: string[];
  gallery: string[];
  sku: string;
  stock: number;
  specifications: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  __v: number;
  new: boolean;
  sale: boolean;
  sold: number;
  quantityPurchase: number;
}

const NewArrival: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: ApiProductType[] = await response.json();

        // Map API data to ProductType
        const mappedProducts: ProductType[] = data.map((item) => ({
          id: item._id || 'no-id', // Add id, mapping from _id
          _id: item._id || 'no-id', // Keep _id if ProductType allows it
          name: item.name || 'Unnamed Product',
          price: item.price || 0,
          salePrice: item.salePrice ?? item.price,
          description: item.description || 'No description available',
          category: {
            _id: item.category.$oid,
            name: 'Unknown', // Placeholder; adjust if API provides name
          },
          subcategory: item.subcategory
            ? { _id: item.subcategory.$oid, name: 'Unknown' }
            : undefined,
          thumbnails: item.thumbnails || [],
          gallery: item.gallery || [],
          sku: item.sku || 'N/A',
          stock: item.stock || 0,
          specifications: item.specifications || 'No specifications',
          reviews: [], // Default; not in API
          new: item.new || false,
          sale: item.sale || false,
          sold: item.sold || 0,
          createdAt: item.createdAt.$date || new Date().toISOString(),
          updatedAt: item.updatedAt.$date || new Date().toISOString(),
        }));

        setProducts(mappedProducts);
      } catch (error: any) {
        console.error('Error fetching products:', error.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="new-arrival-block md:pt-20 pt-10">
      <div className="container">
        <div className="heading">
          <div className="heading3">New Arrival</div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="list-product hide-product-sold section-swiper-navigation style-outline style-center style-small-border md:mt-10 mt-6">
            <Swiper
              spaceBetween={12}
              slidesPerView={2}
              navigation
              loop={true}
              modules={[Navigation, Autoplay]}
              breakpoints={{
                576: { slidesPerView: 2, spaceBetween: 12 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                992: { slidesPerView: 4, spaceBetween: 20 },
                1200: { slidesPerView: 4, spaceBetween: 30 },
              }}
              className="h-full"
            >
              {products.map((prd) => (
                <SwiperSlide key={prd._id}>
                  <Product data={prd} type="grid" style="style-one" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrival;