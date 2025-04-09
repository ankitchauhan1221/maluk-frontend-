'use client';
import React from 'react';
import Image from 'next/image';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import { useCart } from '@/context/CartContext';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useRouter } from 'next/navigation';

// Import ProductType from src/type/ProductType.ts
import { ProductType } from '@/type/ProductType';

interface Props {
  data: ProductType; // Use imported ProductType
  type: 'grid' | 'list' | 'marketplace';
  style: string;
}

const Product: React.FC<Props> = ({ data, type, style }) => {
  const { addToCart, updateCart, cartState } = useCart();
  const { openModalCart } = useModalCartContext();
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
  const { openModalWishlist } = useModalWishlistContext();
  const router = useRouter();

  const [selectedSize, setSelectedSize] = React.useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('');

  const handleAddToCart = (product: ProductType) => {
    const cartItem = { ...product, quantity: 1, selectedSize, selectedColor };
    if (!cartState.cartArray.find((item) => item._id === product._id)) {
      addToCart(cartItem);
      updateCart(product._id, 1, selectedSize, selectedColor);
    } else {
      const existingItem = cartState.cartArray.find((item) => item._id === product._id);
      updateCart(product._id, (existingItem?.quantity || 0) + 1, selectedSize || existingItem?.selectedSize || '', selectedColor || existingItem?.selectedColor || '');
    }
    openModalCart();
  };

  const handleAddToWishlist = (product: ProductType) => {
    if (wishlistState.wishlistArray.some((item) => item._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
    openModalWishlist();
  };

  const handleDetailProduct = (productId: string) => {
    router.push(`/product/default?id=${productId}`);
  };

  return (
    <div>
      {type === 'grid' ? (
        <div className={`product-item grid-type ${style}`}>
          <div onClick={() => handleDetailProduct(data._id)} className="product-main cursor-pointer block relative">
            <div className="product-thumb bg-white relative overflow-hidden rounded-2xl">
              <div className="list-action-right absolute top-3 right-3 max-lg:hidden">
                <div
                  className={`add-wishlist-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${
                    wishlistState.wishlistArray.some((item) => item._id === data._id) ? 'active' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(data);
                  }}
                >
                  <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Add To Wishlist</div>
                  {wishlistState.wishlistArray.some((item) => item._id === data._id) ? (
                    <Icon.Heart size={18} weight="fill" className="text-white" />
                  ) : (
                    <Icon.Heart size={18} />
                  )}
                </div>
              </div>
              <div className="product-img w-full h-full aspect-[3/4]">
                {Array.isArray(data.thumbnails) && data.thumbnails.length > 0 ? (
                  data.thumbnails.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      width={500}
                      height={500}
                      priority={true}
                      alt={data.name}
                      className="w-full h-full object-cover duration-700"
                    />
                  ))
                ) : (
                  <Image
                    src="/placeholder-image.jpg"
                    width={500}
                    height={500}
                    priority={true}
                    alt={data.name}
                    className="w-full h-full object-cover duration-700"
                  />
                )}
              </div>
              <div className="list-action px-5 absolute w-full bottom-5 max-lg:hidden">
                <div
                  className="add-cart-btn w-full text-button-uppercase py-2 text-center rounded-full duration-500 bg-white hover:bg-black hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(data);
                  }}
                >
                  Add To Cart
                </div>
              </div>
              <div className="list-action-icon flex items-center justify-center gap-2 absolute w-full bottom-3 z-[1] lg:hidden">
                <div
                  className="add-cart-btn w-9 h-9 flex items-center justify-center rounded-lg duration-300 bg-white hover:bg-black hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(data);
                  }}
                >
                  <Icon.ShoppingBagOpen className="text-lg" />
                </div>
              </div>
            </div>
            <div className="product-infor mt-4 lg:mb-7">
              <div className="product-name text-title duration-300">{data.name}</div>
              <div className="product-price-block flex items-center gap-2 flex-wrap mt-1 duration-300 relative z-[1]">
                <div className="product-price text-title">₹{data.salePrice || data.price}.00</div>
                {data.salePrice && data.salePrice !== data.price && (
                  <>
                    <div className="product-origin-price caption1 text-secondary2">
                      <del>₹{data.price}.00</del>
                    </div>
                    <div className="product-sale caption1 font-medium bg-green px-3 py-0.5 inline-block rounded-full">
                      -{Math.floor(100 - (data.salePrice / data.price) * 100)}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : type === 'list' ? (
        <div className="product-item list-type">
          <div className="product-main cursor-pointer flex lg:items-center sm:justify-between gap-7 max-lg:gap-5">
            <div onClick={() => handleDetailProduct(data._id)} className="product-thumb bg-white relative overflow-hidden rounded-2xl block max-sm:w-1/2">
              <div className="product-img w-full aspect-[3/4] rounded-2xl overflow-hidden">
                {Array.isArray(data.thumbnails) && data.thumbnails.length > 0 ? (
                  data.thumbnails.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      width={500}
                      height={500}
                      priority={true}
                      alt={data.name}
                      className="w-full h-full object-cover duration-700"
                    />
                  ))
                ) : (
                  <Image
                    src="/placeholder-image.jpg"
                    width={500}
                    height={500}
                    priority={true}
                    alt={data.name}
                    className="w-full h-full object-cover duration-700"
                  />
                )}
              </div>
            </div>
            <div className="flex sm:items-center gap-7 max-lg:gap-4 max-lg:flex-wrap max-lg:w-full max-sm:flex-col max-sm:w-1/2">
              <div className="product-infor max-sm:w-full">
                <div onClick={() => handleDetailProduct(data._id)} className="product-name heading6 inline-block duration-300">
                  {data.name}
                </div>
                <div className="product-price-block flex items-center gap-2 flex-wrap mt-2 duration-300 relative z-[1]">
                  <div className="product-price text-title">₹{data.salePrice || data.price}.00</div>
                  {data.salePrice && data.salePrice !== data.price && (
                    <>
                      <div className="product-origin-price caption1 text-secondary2">
                        <del>₹{data.price}.00</del>
                      </div>
                      <div className="product-sale caption1 font-medium bg-green px-3 py-0.5 inline-block rounded-full">
                        -{Math.floor(100 - (data.salePrice / data.price) * 100)}%
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="action w-fit flex flex-col items-center justify-center">
                <div
                  className="add-cart-btn button-main whitespace-nowrap py-2 px-9 max-lg:px-5 rounded-full bg-white text-black border border-black hover:bg-black hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(data);
                  }}
                >
                  Add To Cart
                </div>
                <div className="list-action-right flex items-center justify-center gap-3 mt-4">
                  <div
                    className={`add-wishlist-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${
                      wishlistState.wishlistArray.some((item) => item._id === data._id) ? 'active' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(data);
                    }}
                  >
                    <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Add To Wishlist</div>
                    {wishlistState.wishlistArray.some((item) => item._id === data._id) ? (
                      <Icon.Heart size={18} weight="fill" className="text-white" />
                    ) : (
                      <Icon.Heart size={18} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : type === 'marketplace' ? (
        <div className="product-item style-marketplace p-4 border border-line rounded-2xl" onClick={() => handleDetailProduct(data._id)}>
          <div className="bg-img relative w-full">
            <Image
              className="w-full aspect-square"
              width={5000}
              height={5000}
              src={Array.isArray(data.thumbnails) && data.thumbnails.length > 0 ? data.thumbnails[0] : '/placeholder-image.jpg'}
              alt={data.name}
            />
            <div className="list-action flex flex-col gap-1 absolute top-0 right-0">
              <span
                className={`add-wishlist-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300 ${
                  wishlistState.wishlistArray.some((item) => item._id === data._id) ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToWishlist(data);
                }}
              >
                {wishlistState.wishlistArray.some((item) => item._id === data._id) ? (
                  <Icon.Heart size={18} weight="fill" className="text-white" />
                ) : (
                  <Icon.Heart size={18} />
                )}
              </span>
              <span
                className="add-cart-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(data);
                }}
              >
                <Icon.ShoppingBagOpen />
              </span>
            </div>
          </div>
          <div className="product-infor mt-4">
            <span className="text-title">{data.name}</span>
            <span className="text-title inline-block mt-1">₹{data.salePrice || data.price}.00</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Product;