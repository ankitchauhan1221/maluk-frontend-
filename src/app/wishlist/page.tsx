'use client';
import React, { useState, useEffect } from 'react'; // Add useEffect
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import { ProductType } from '@/type/ProductType';
import Product from '@/components/Product/Product';
import { useWishlist } from '@/context/WishlistContext';
import HandlePagination from '@/components/Other/HandlePagination';
import * as Icon from '@phosphor-icons/react/dist/ssr';

interface ExtendedProductType extends ProductType {
  __v: number;
  quantityPurchase: number;
}

interface WishlistItem extends Partial<ExtendedProductType> {}

const Wishlist = () => {
  const { wishlistState } = useWishlist();
  const [sortOption, setSortOption] = useState('');
  const [layoutCol, setLayoutCol] = useState<number | null>(4);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 12;
  const offset = currentPage * productsPerPage;

  const handleLayoutCol = (col: number) => {
    setLayoutCol(col);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  const filteredData: ExtendedProductType[] = wishlistState.wishlistArray.map((item: WishlistItem) => ({
    ...item,
    id: item.id || item._id || 'no-id',
    _id: item._id || 'no-id',
    name: item.name || 'Unnamed Product',
    description: item.description || 'No description available',
    price: item.price || 0,
    salePrice: item.salePrice ?? item.price ?? 0,
    category: item.category || { _id: 'no-data', name: 'Unknown' },
    subcategory: item.subcategory || undefined,
    thumbnails: item.thumbnails || [],
    gallery: item.gallery || [],
    sku: item.sku || 'N/A',
    stock: item.stock || 0,
    specifications: item.specifications || '',
    reviews: item.reviews || [],
    new: item.new ?? false,
    sale: item.sale ?? false,
    sold: item.sold ?? 0,
    createdAt: item.createdAt || new Date(),
    updatedAt: item.updatedAt || new Date(),
    __v: item.__v ?? 0,
    quantityPurchase: item.quantityPurchase ?? 0,
  }));

  const totalProducts = filteredData.length;

  let sortedData: ExtendedProductType[] = [...filteredData];

  if (sortOption === 'soldQuantityHighToLow') {
    sortedData.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  } else if (sortOption === 'discountHighToLow') {
    sortedData.sort((a, b) =>
      Math.floor(100 - (b.salePrice / (b.price || 1)) * 100) -
      Math.floor(100 - (a.salePrice / (a.price || 1)) * 100)
    );
  } else if (sortOption === 'priceHighToLow') {
    sortedData.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'priceLowToHigh') {
    sortedData.sort((a, b) => a.price - b.price);
  }

  const pageCount = Math.ceil(sortedData.length / productsPerPage);

  // Move page reset logic to useEffect
  useEffect(() => {
    if (pageCount === 0) {
      setCurrentPage(0);
    } else if (currentPage >= pageCount) {
      setCurrentPage(pageCount - 1); // Adjust if currentPage exceeds available pages
    }
  }, [pageCount, currentPage]);

  const currentProducts: ExtendedProductType[] = sortedData.slice(offset, offset + productsPerPage);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Wish list" subHeading="Wish list" />
      </div>
      <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
        <div className="container">
          <div className="list-product-block relative">
            <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
              <div className="left flex has-line items-center flex-wrap gap-5">
                <div className="choose-layout flex items-center gap-2">
                  <div
                    className={`item three-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 3 ? 'active' : ''}`}
                    onClick={() => handleLayoutCol(3)}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                    </div>
                  </div>
                  <div
                    className={`item four-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 4 ? 'active' : ''}`}
                    onClick={() => handleLayoutCol(4)}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                    </div>
                  </div>
                  <div
                    className={`item five-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 5 ? 'active' : ''}`}
                    onClick={() => handleLayoutCol(5)}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                      <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="right flex items-center gap-3">
                <div className="select-block relative">
                  <select
                    id="select-filter"
                    name="select-filter"
                    className="caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-line"
                    onChange={(e) => handleSortChange(e.target.value)}
                    defaultValue="Sorting"
                  >
                    <option value="Sorting" disabled>Sorting</option>
                    <option value="soldQuantityHighToLow">Best Selling</option>
                    <option value="discountHighToLow">Best Discount</option>
                    <option value="priceHighToLow">Price High To Low</option>
                    <option value="priceLowToHigh">Price Low To High</option>
                  </select>
                  <Icon.CaretDown size={12} className="absolute top-1/2 -translate-y-1/2 md:right-4 right-2" />
                </div>
              </div>
            </div>

            <div className="list-filtered flex items-center gap-3 mt-4">
              <div className="total-product">
                {totalProducts}
                <span className="text-secondary pl-1">Products Found</span>
              </div>
            </div>

            <div className={`list-product hide-product-sold grid lg:grid-cols-${layoutCol ?? 4} sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-7`}>
              {currentProducts.length > 0 ? (
                currentProducts.map((item) => (
                  <Product key={item._id} data={item} type="grid" style="style-one" />
                ))
              ) : (
                <div className="no-data-product col-span-full text-center">No products in your wishlist.</div>
              )}
            </div>

            {pageCount > 1 && (
              <div className="list-pagination flex items-center justify-center md:mt-10 mt-7">
                <HandlePagination pageCount={pageCount} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;