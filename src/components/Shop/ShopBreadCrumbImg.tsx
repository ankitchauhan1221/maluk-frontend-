'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import Product from '../Product/Product';
import HandlePagination from '../Other/HandlePagination';
import { useSearchParams } from 'next/navigation';
import { ProductType } from '@/type/ProductType'; // Import the canonical ProductType

interface Props {
  productPerPage: number;
  data?: ProductType[]; // Use imported ProductType
}

const ShopBreadCrumbImg: React.FC<Props> = ({ productPerPage, data }) => {
  const [layoutCol, setLayoutCol] = useState<number>(4);
  const [sortOption, setSortOption] = useState<string>('soldQuantityHighToLow');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categoryName, setCategoryName] = useState<string>('Shop');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const subcategoryId = searchParams.get('subcategoryId');

  const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.malukforever.com/';
  const productsPerPage: number = productPerPage;
  const offset: number = currentPage * productsPerPage;

  useEffect(() => {
    if (data) {
      setProducts(data);
      setCategoryName(data[0]?.category?.name || 'Shop');
      setLoading(false);
      return;
    }

    const fetchProductsByCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const safeCategoryId = categoryId ?? 'all';
        let url = `${API_BASE_URL}/api/products/by-category/${encodeURIComponent(safeCategoryId)}`;

        const queryParams = new URLSearchParams();
        if (subcategoryId) queryParams.set('subcategoryId', encodeURIComponent(subcategoryId));
        if (queryParams.toString()) url += `?${queryParams.toString()}`;

        console.log('Fetching from:', url);
        const productResponse = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!productResponse.ok) {
          const errorData = await productResponse.json();
          throw new Error(`Failed to fetch products: ${productResponse.statusText} - ${JSON.stringify(errorData)}`);
        }

        const productsArray: ProductType[] = await productResponse.json();
        if (productsArray.length > 0) {
          const nameSource = subcategoryId && productsArray[0].subcategory?.name
            ? productsArray[0].subcategory.name
            : productsArray[0].category?.name || 'Shop';
          setCategoryName(nameSource);
        } else {
          setCategoryName('Shop');
        }
        setProducts(productsArray);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching data';
        setError(errorMessage);
        console.error('Fetch error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categoryId, subcategoryId, API_BASE_URL, data]);

  const handleLayoutCol = (col: number): void => {
    setLayoutCol(col);
  };

  const handleSortChange = (option: string): void => {
    setSortOption(option);
    setCurrentPage(0);
  };

  const sortedData = useMemo((): ProductType[] => {
    let data = [...products];
    if (sortOption === 'soldQuantityHighToLow') {
      data = data.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (sortOption === 'discountHighToLow') {
      data = data.sort(
        (a, b) =>
          Math.floor(100 - (b.salePrice / b.price) * 100) -
          Math.floor(100 - (a.salePrice / a.price) * 100)
      );
    } else if (sortOption === 'priceHighToLow') {
      data = data.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'priceLowToHigh') {
      data = data.sort((a, b) => a.price - b.price);
    }
    return data;
  }, [products, sortOption]);

  const pageCount: number = Math.ceil(sortedData.length / productsPerPage);
  const currentProducts: ProductType[] = sortedData.slice(offset, offset + productsPerPage);

  const handlePageChange = (selected: number): void => {
    setCurrentPage(selected);
  };

  const gridClasses: { [key: number]: string } = {
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  };

  if (loading) {
    return <div className="container py-20">Loading products...</div>;
  }

  if (error) {
    return <div className="container py-20">Error: {error}</div>;
  }

  return (
    <>
      <div className="breadcrumb-block style-img">
        <div className="breadcrumb-main bg-linear overflow-hidden">
          <div className="container lg:pt-[134px] pt-24 pb-10 relative">
            <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
              <div className="text-content">
                <div className="heading2 text-center">{categoryName}</div>
                <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                  <Link href={'/'}>Homepage</Link>
                  <Icon.CaretRight size={14} className="text-secondary2" />
                  <div className="text-secondary2 capitalize">{categoryName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
        <div className="container">
          <div className="list-product-block relative">
            <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
              <div className="left flex has-line items-center flex-wrap gap-5">
                <div className="choose-layout flex items-center gap-2">
                  <button
                    className={`item three-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 3 ? 'active' : ''}`}
                    onClick={() => handleLayoutCol(3)}
                    aria-label="Switch to 3-column layout"
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                    </div>
                  </button>
                  <button
                    className={`item four-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 4 ? 'active' : ''}`}
                    onClick={() => handleLayoutCol(4)}
                    aria-label="Switch to 4-column layout"
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                    </div>
                  </button>
                  <button
                    className={`item five-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 5 ? 'active' : ''}`}
                    onClick={() => handleLayoutCol(5)}
                    aria-label="Switch to 5-column layout"
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                    </div>
                  </button>
                </div>
              </div>
              <div className="right flex items-center gap-3">
                <label htmlFor="select-filter" className="caption1 capitalize">
                  Sort by
                </label>
                <div className="select-block relative">
                  <select
                    id="select-filter"
                    name="select-filter"
                    className="caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-line"
                    onChange={(e) => handleSortChange(e.target.value)}
                    value={sortOption}
                  >
                    <option value="soldQuantityHighToLow">Best Selling</option>
                    <option value="discountHighToLow">Best Discount</option>
                    <option value="priceHighToLow">Price High To Low</option>
                    <option value="priceLowToHigh">Price Low To High</option>
                  </select>
                  <Icon.CaretDown
                    size={12}
                    className="absolute top-1/2 -translate-y-1/2 md:right-4 right-2"
                  />
                </div>
              </div>
            </div>

            <div className="list-filtered flex items-center gap-3 mt-4">
              <div className="total-product">
                {sortedData.length}
                <span className="text-secondary pl-1">Products Found</span>
              </div>
            </div>

            {sortedData.length === 0 ? (
              <div className="no-products mt-7 text-center">No products found in this category</div>
            ) : (
              <div
                className={`list-product hide-product-sold grid ${gridClasses[layoutCol]} sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-7`}
              >
                {currentProducts.map((item) => (
                  <Product key={item._id} data={item} type="grid" style="" />
                ))}
              </div>
            )}

            {pageCount > 1 && (
              <div className="list-pagination flex items-center justify-center md:mt-10 mt-7">
                <HandlePagination pageCount={pageCount} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopBreadCrumbImg;