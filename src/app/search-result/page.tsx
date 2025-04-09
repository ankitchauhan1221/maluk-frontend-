'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import Product from '@/components/Product/Product';
import { ProductType } from '@/type/ProductType';

interface ApiProductType {
  _id: string;
  name: string;
  description: string;
  price: number;
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

const SearchResult = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || 'dress';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://server.malukforever.com/api/products?query=${query}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: ApiProductType[] = await response.json();

        // Map API response to ProductType
        const mappedProducts: ProductType[] = data.map((product) => ({
          id: product._id, // Map _id to id (required by ProductType)
          _id: product._id, // Include _id if ProductType allows it
          name: product.name,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice ?? product.price,
          category: {
            _id: product.category.$oid,
            name: 'Unknown', // Adjust if API provides name
          },
          subcategory: product.subcategory
            ? {
                _id: product.subcategory.$oid,
                name: 'Unknown', // Adjust if API provides name
              }
            : undefined,
          thumbnails: product.thumbnails,
          gallery: product.gallery,
          sku: product.sku,
          stock: product.stock,
          specifications: product.specifications,
          reviews: [], // Default to empty
          new: product.new,
          sale: product.sale,
          sold: product.sold,
          createdAt: product.createdAt.$date,
          updatedAt: product.updatedAt.$date,
          __v: product.__v,
          quantityPurchase: product.quantityPurchase,
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Search Result" subHeading="Search Result" />
      </div>
      <div className="list-product hide-product-sold grid lg:grid-cols-4 sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-5">
        {products.length > 0 ? (
          products.map((product) => (
            <Product key={product._id} data={product} type="grid" style="" />
          ))
        ) : (
          <div>No products found</div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchResult;