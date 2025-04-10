'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Rate from '@/components/Other/Rate';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css/bundle';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import SwiperCore from 'swiper/core';
import { useCart } from '@/context/CartContext';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductType } from '@/type/ProductType';
import { useAuth } from '@/lib/authContext'; // Adjust path as needed

SwiperCore.use([Navigation, Thumbs]);

interface Props {
  productId: string | number | null;
}

const Default: React.FC<Props> = ({ productId }) => {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const swiperRef = useRef<SwiperCore | null>(null);
  const [openPopupImg, setOpenPopupImg] = useState<boolean>(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const [activeTab, setActiveTab] = useState<string>('description');
  const [newReview, setNewReview] = useState({ userName: '', email: '', rating: 0, comment: '' });
  const [sortOption, setSortOption] = useState<string>('Newest');
  const { addToCart } = useCart();
  const { openModalCart } = useModalCartContext();
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
  const { openModalWishlist } = useModalWishlistContext();
  const { tokens, logout, isLoading: authLoading } = useAuth(); // Use AuthContext
  const router = useRouter();

  const API_BASE_URL = 'https://server.malukforever.com/';
  const isAuthenticated = !!tokens?.accessToken; // Derive authentication status

  const checkAuthStatus = async (): Promise<boolean> => {
    const token = tokens?.accessToken;
    console.log('Default - Checking auth status, token:', token ? `${token.slice(0, 20)}...` : 'No token');

    if (!token) {
      console.log('Default - No token found');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Default - Auth response:', { status: response.status, data });

      const authenticated = response.ok && response.status === 200;
      if (!authenticated && response.status === 401) {
        logout();
        console.log('Default - Token invalid (401), logged out');
      }
      return authenticated;
    } catch (err) {
      console.error('Default - Auth check failed:', err);
      return false;
    }
  };

  const fetchProduct = async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (tokens?.accessToken) headers['Authorization'] = `Bearer ${tokens.accessToken}`;

      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, { headers });
      if (!response.ok) throw new Error(`Failed to fetch product: ${response.statusText}`);
      const rawData = await response.json();

      const transformedData: ProductType = {
        _id: rawData._id || 'unknown-id',
        name: rawData.name || 'Unnamed Product',
        description: rawData.description || 'No description available',
        price: rawData.price || 0,
        salePrice: rawData.saleprice || 0,
        category: rawData.category
          ? {
              _id: rawData.category._id || 'unknown',
              name: rawData.category.name || 'Uncategorized',
              status: rawData.category.status,
              productCount: rawData.category.productCount,
              subcategoryCount: rawData.category.subcategoryCount,
            }
          : { _id: 'unknown', name: 'Uncategorized' },
        subcategory: rawData.subcategory
          ? { _id: rawData.subcategory._id || 'unknown', name: rawData.subcategory.name || 'None' }
          : undefined,
        thumbnails: Array.isArray(rawData.thumbnails) ? rawData.thumbnails : [],
        gallery: Array.isArray(rawData.gallery) ? rawData.gallery : [],
        sku: rawData.sku || 'N/A',
        stock: rawData.stock || 0,
        specifications: rawData.specifications || '',
        reviews: rawData.reviews?.map((r: any) => ({
          id: r._id || r.id || 'unknown',
          userName: r.userName || 'Anonymous',
          rating: r.rating || 0,
          comment: r.comment || '',
          date: r.date || new Date().toISOString(),
        })) || [],
        type: rawData.type || 'Unknown',
        gender: rawData.gender || 'Unisex',
        new: rawData.new || false,
        sale: rawData.sale || false,
        rate: rawData.rate || 0,
        originPrice: rawData.price || 0,
        brand: rawData.brand || 'Unknown',
        sold: rawData.sold || 0,
        slug: rawData.slug || rawData._id || 'unknown-slug',
        id: '',
      };
      setProduct(transformedData);
      setLoading(false);
      console.log('Default - Product fetched:', transformedData);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch product');
      setLoading(false);
      console.log('Default - Product fetch error:', err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (productId && !authLoading) { // Wait for auth to finish loading
        setLoading(true);
        await checkAuthStatus();
        console.log('Default - Initial auth check completed, isAuthenticated:', isAuthenticated);
        await fetchProduct();
      }
    };
    initialize();
  }, [productId, tokens, authLoading]); // Re-run when tokens or authLoading changes

  useEffect(() => {
    console.log('Default - isAuthenticated changed to:', isAuthenticated);
  }, [isAuthenticated]);

  const handleSwiper = (swiper: SwiperCore) => setThumbsSwiper(swiper);
  const handleActiveTab = (tab: string) => setActiveTab(tab);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) setQuantity(1);
    else if (newQuantity > (product?.stock || 0)) setQuantity(product?.stock || 1);
    else setQuantity(newQuantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const productDetails = {
      id: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      description: product.description,
      thumbnails: product.thumbnails,
      quantity,
      sku: product.sku,
    };
    router.push(`/checkout?product=${encodeURIComponent(JSON.stringify(productDetails))}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Default - Review submit attempted, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      alert('Please log in to submit a review.');
      router.push('/login');
      return;
    }
    if (!newReview.userName || !newReview.email || newReview.rating === 0 || !newReview.comment) {
      alert('Please fill in all required fields, including a rating (1–5 stars).');
      return;
    }

    const reviewData = {
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          logout();
          alert('Session expired. Please log in again.');
          router.push('/login');
          return;
        }
        throw new Error(errorData.message || 'Failed to submit review');
      }
      const updatedProduct = await response.json();
      setProduct({
        ...updatedProduct,
        category: updatedProduct.category
          ? { _id: updatedProduct.category._id || 'unknown', name: updatedProduct.category.name || 'Uncategorized' }
          : { _id: 'unknown', name: 'Uncategorized' },
        subcategory: updatedProduct.subcategory
          ? { _id: updatedProduct.subcategory._id || 'unknown', name: updatedProduct.subcategory.name || 'None' }
          : undefined,
        thumbnails: Array.isArray(updatedProduct.thumbnails) ? updatedProduct.thumbnails : [],
        gallery: Array.isArray(updatedProduct.gallery) ? updatedProduct.gallery : [],
        reviews: updatedProduct.reviews?.map((r: any) => ({
          id: r._id || r.id || 'unknown',
          userName: r.userName || 'Anonymous',
          rating: r.rating || 0,
          comment: r.comment || '',
          date: r.date || new Date().toISOString(),
        })) || [],
      });
      setNewReview({ userName: '', email: '', rating: 0, comment: '' });
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Default - Error submitting review:', err);
      alert(`Failed to submit review: ${(err as Error).message}`);
    }
  };

  const calculateRatingStats = () => {
    if (!product?.reviews || product.reviews.length === 0) {
      return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    }
    const total = product.reviews.length;
    const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    const distribution = [5, 4, 3, 2, 1].map((star) =>
      ((product.reviews?.filter((r) => r.rating === star).length || 0) / total) * 100
    );
    return { average, total, distribution };
  };

  const getSortedReviews = () => {
    if (!product?.reviews) return [];
    const reviewsCopy = [...product.reviews];
    switch (sortOption) {
      case 'Newest':
        return reviewsCopy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case '5 Star':
        return reviewsCopy.filter((r) => r.rating === 5);
      case '4 Star':
        return reviewsCopy.filter((r) => r.rating === 4);
      case '3 Star':
        return reviewsCopy.filter((r) => r.rating === 3);
      case '2 Star':
        return reviewsCopy.filter((r) => r.rating === 2);
      case '1 Star':
        return reviewsCopy.filter((r) => r.rating === 1);
      default:
        return reviewsCopy;
    }
  };

  const ratingStats = calculateRatingStats();
  const sortedReviews = getSortedReviews();

  if (loading || authLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;

  const percentSale = product.salePrice ? Math.floor(100 - (product.price / product.price) * 100) : 0;

  return (
    <div className="product-detail default">
      <div className="featured-product underwear md:py-20 py-10">
        <div className="container flex justify-between gap-y-6 flex-wrap">
          <div className="list-img md:w-1/2 md:pr-[45px] w-full">
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Thumbs]}
              className="mySwiper2 rounded-2xl overflow-hidden"
            >
              {product.gallery.map((item, index) => (
                <SwiperSlide
                  key={index}
                  onClick={() => {
                    swiperRef.current?.slideTo(index);
                    setOpenPopupImg(true);
                  }}
                >
                  <Image
                    src={item}
                    width={1000}
                    height={1000}
                    alt="prd-img"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <Swiper
              onSwiper={handleSwiper}
              spaceBetween={0}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[Navigation, Thumbs]}
              className="mySwiper"
            >
              {product.gallery.map((item, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={item}
                    width={1000}
                    height={1000}
                    alt="prd-img"
                    className="w-full aspect-[3/4] object-cover rounded-xl"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className={`popup-img ${openPopupImg ? 'open' : ''}`}>
              <span
                className="close-popup-btn absolute top-4 right-4 z-[2] cursor-pointer"
                onClick={() => setOpenPopupImg(false)}
              >
                <Icon.X className="text-3xl text-white" />
              </span>
              <Swiper
                spaceBetween={0}
                slidesPerView={1}
                modules={[Navigation, Thumbs]}
                navigation={true}
                loop={true}
                className="popupSwiper"
                onSwiper={(swiper) => (swiperRef.current = swiper)}
              >
                {product.gallery.map((item, index) => (
                  <SwiperSlide key={index} onClick={() => setOpenPopupImg(false)}>
                    <Image
                      src={item}
                      width={1000}
                      height={1000}
                      alt="prd-img"
                      className="w-full aspect-[3/4] object-cover rounded-xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          <div className="product-infor md:w-1/2 w-full lg:pl-[15px] md:pl-2">
            <div className="flex justify-between">
              <div>
                <div className="caption2 text-secondary font-semibold uppercase">{product.category.name}</div>
                <div className="heading4 mt-1">{product.name}</div>
              </div>
              <div
                className={`add-wishlist-btn w-12 h-12 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some((item) => item._id === product._id) ? 'active' : ''}`}
                onClick={() => {
                  if (wishlistState.wishlistArray.some((item) => item._id === product._id)) {
                    removeFromWishlist(product._id);
                  } else {
                    addToWishlist(product);
                  }
                  openModalWishlist();
                }}
              >
                {wishlistState.wishlistArray.some((item) => item._id === product._id) ? (
                  <Icon.Heart size={24} weight="fill" className="text-white" />
                ) : (
                  <Icon.Heart size={24} />
                )}
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Rate currentRate={Math.round(ratingStats.average)} size={14} />
              <span className="caption1 text-secondary">({ratingStats.total} reviews)</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap mt-5 pb-6 border-b border-line">
              <div className="product-price heading5">₹{product.salePrice?.toFixed(2) || product.price.toFixed(2)}</div>
              {product.salePrice && (
                <>
                  <div className="w-px h-4 bg-line"></div>
                  <div className="product-origin-price font-normal text-secondary2">
                    <del>₹{product.price.toFixed(2)}</del>
                  </div>
                  <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                    {percentSale}%
                  </div>
                </>
              )}
            </div>
            <div className="desc text-secondary mt-3" dangerouslySetInnerHTML={{ __html: product.description }}></div>
            <div className="list-action mt-6">
              <div className="text-title mt-5">Quantity:</div>
              <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3">
                <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                  <Icon.Minus
                    size={20}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className={`${quantity === 1 ? 'disabled' : ''} cursor-pointer`}
                  />
                  <div className="body1 font-semibold">{quantity}</div>
                  <Icon.Plus
                    size={20}
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="cursor-pointer"
                  />
                </div>
                <div
                  onClick={() => {
                    addToCart({ ...product, quantity });
                    openModalCart();
                  }}
                  className="button-main w-full text-center bg-white text-black border border-black"
                >
                  Add To Cart
                </div>
              </div>
              <div className="button-block mt-5">
                <div onClick={handleBuyNow} className="button-main w-full text-center">
                  Buy It Now
                </div>
              </div>
            </div>
            <div className="more-infor mt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Icon.ArrowClockwise className="body1" />
                  <div className="text-title">Delivery & Return</div>
                </div>
                <div className="flex items-center gap-1">
                  <Icon.Question className="body1" />
                  <div className="text-title">Ask A Question</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Icon.Timer className="body1" />
                <div className="text-title">Estimated Delivery:</div>
                <div className="text-secondary">14 January - 18 January</div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Icon.Eye className="body1" />
                <div className="text-title">38</div>
                <div className="text-secondary">people viewing this product right now!</div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="text-title">SKU:</div>
                <div className="text-secondary">{product.sku}</div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="text-title">Categories:</div>
                <div className="text-secondary">{product.category.name}</div>
              </div>
            </div>
            <div className="list-payment mt-7">
              <div className="main-content lg:pt-8 pt-6 lg:pb-6 pb-4 sm:px-4 px-3 border border-line rounded-xl relative max-md:w-2/3 max-sm:w-full">
                <div className="heading6 px-5 bg-white absolute -top-[14px] left-1/2 -translate-x-1/2 whitespace-nowrap">
                  Guaranteed safe checkout
                </div>
                <div className="list grid grid-cols-6">
                  {['Frame-0', 'Frame-1', 'Frame-2', 'Frame-3', 'Frame-4', 'Frame-5'].map((frame, index) => (
                    <div key={index} className="item flex items-center justify-center lg:px-3 px-1">
                      <Image
                        src={`/images/payment/${frame}.webp`}
                        width={500}
                        height={450}
                        alt="payment"
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="desc-tab md:py-20 py-10">
        <div className="container">
          <div className="flex items-center justify-center w-full">
            <div className="menu-tab flex items-center md:gap-[60px] gap-8">
              <div
                className={`tab-item heading5 has-line-before text-secondary2 hover:text-black duration-300 ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => handleActiveTab('description')}
              >
                Description
              </div>
              <div
                className={`tab-item heading5 has-line-before text-secondary2 hover:text-black duration-300 ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => handleActiveTab('specifications')}
              >
                Specifications
              </div>
              <div
                className={`tab-item heading5 has-line-before text-secondary2 hover:text-black duration-300 ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => handleActiveTab('reviews')}
              >
                Reviews
              </div>
            </div>
          </div>
          <div className="desc-block mt-8">
            <div className={`desc-item description ${activeTab === 'description' ? 'open' : ''}`}>
              <div className="grid md:grid-cols-2 gap-8 gap-y-5">
                <div className="left">
                  <div className="heading6">Description</div>
                  <div className="text-secondary mt-2" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              </div>
            </div>
            <div className={`desc-item specifications flex items-center justify-center ${activeTab === 'specifications' ? 'open' : ''}`}>
              <div className="lg:w-1/2 sm:w-3/4 w-full">
                {typeof product.specifications === 'string' && product.specifications ? (
                  <div className="specifications-content py-3 px-10" dangerouslySetInnerHTML={{ __html: product.specifications }} />
                ) : (
                  <div className="py-3 px-10 text-secondary">No specifications available</div>
                )}
              </div>
            </div>
            <div className={`desc-item reviews ${activeTab === 'reviews' ? 'open' : ''}`}>
              <div className="review-block md:py-20 py-10 bg-surface">
                <div className="container">
                  <div className="heading flex items-center justify-between flex-wrap gap-4">
                    <div className="heading4">Customer Reviews</div>
                    {isAuthenticated ? (
                      <Link href="#form-review" className="button-main bg-white text-black border border-black">
                        Write a Review
                      </Link>
                    ) : (
                      <Link href="/login" className="text-secondary underline">
                        Log in to write a review
                      </Link>
                    )}
                  </div>
                  <div className="top-overview flex justify-between py-6 max-md:flex-col gap-y-6">
                    <div className="rating lg:w-1/4 md:w-[30%] lg:pr-[75px] md:pr-[35px]">
                      <div className="heading flex items-center justify-center flex-wrap gap-3 gap-y-4">
                        <div className="text-display">{ratingStats.average.toFixed(1)}</div>
                        <div className="flex flex-col items-center">
                          <Rate currentRate={Math.round(ratingStats.average)} size={18} />
                          <div className="text-secondary text-center mt-1">({ratingStats.total} Ratings)</div>
                        </div>
                      </div>
                      <div className="list-rating mt-3">
                        {[5, 4, 3, 2, 1].map((star, index) => (
                          <div key={star} className="item flex items-center justify-between gap-1.5 mt-1">
                            <div className="flex items-center gap-1">
                              <div className="caption1">{star}</div>
                              <Icon.Star size={14} weight="fill" />
                            </div>
                            <div className="progress bg-line relative w-3/4 h-2">
                              <div
                                className="progress-percent absolute bg-yellow h-full left-0 top-0"
                                style={{ width: `${ratingStats.distribution[index]}%` }}
                              />
                            </div>
                            <div className="caption1">{Math.round(ratingStats.distribution[index])}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="list-img lg:w-3/4 md:w-[70%] lg:pl-[15px] md:pl-[15px]">
                      <div className="sorting flex items-center flex-wrap md:gap-5 gap-3 gap-y-3">
                        <div className="text-button">Sort by</div>
                        {['Newest', '5 Star', '4 Star', '3 Star', '2 Star', '1 Star'].map((option) => (
                          <div
                            key={option}
                            className={`item px-4 py-1 border border-line rounded-full cursor-pointer transition-colors duration-200 ${
                              sortOption === option ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                            }`}
                            onClick={() => setSortOption(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="list-review">
                    {sortedReviews.length > 0 ? (
                      sortedReviews.map((review) => (
                        <div key={review.id} className="item flex max-lg:flex-col gap-y-4 w-full py-6 border-t border-line">
                          <div className="left lg:w-1/4 w-full lg:pr-[15px]">
                            <div className="user mt-3">
                              <div className="text-title">{review.userName}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-secondary2">{new Date(review.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>
                          <div className="right lg:w-3/4 w-full lg:pl-[15px]">
                            <Rate currentRate={review.rating} size={16} />
                            <div className="body1 mt-3">{review.comment}</div>
                            <div className="action mt-3">
                              <div className="flex items-center gap-4">
                                <div className="like-btn flex items-center gap-1 cursor-pointer">
                                  <Icon.HandsClapping size={18} />
                                  <div className="text-button">0</div>
                                </div>
                                <Link href="#form-review" className="reply-btn text-button text-secondary cursor-pointer hover:text-black">
                                  Reply
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-secondary text-center py-6">
                        {sortOption === 'Newest'
                          ? 'No reviews yet. Be the first to review this product!'
                          : `No ${sortOption} reviews available.`}
                      </div>
                    )}
                    {sortedReviews.length > 3 && (
                      <div className="text-button more-review-btn text-center mt-2 underline">View More Comments</div>
                    )}
                  </div>
                  {isAuthenticated && (
                    <div id="form-review" className="form-review pt-6">
                      <div className="heading4">Write Your Review</div>
                      <form className="grid sm:grid-cols-2 gap-4 gap-y-5 mt-6" onSubmit={handleReviewSubmit}>
                        <div className="name">
                          <input
                            className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                            id="username"
                            type="text"
                            placeholder="Your Name *"
                            value={newReview.userName}
                            onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="mail">
                          <input
                            className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                            id="email"
                            type="email"
                            placeholder="Your Email *"
                            value={newReview.email}
                            onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-span-full">
                          <label className="text-secondary mb-2 block">
                            Your Rating: <span className="text-red-500">*</span> (Click a star to rate)
                          </label>
                          <Rate
                            currentRate={newReview.rating}
                            size={20}
                            onRate={(rating: number) => setNewReview({ ...newReview, rating })}
                          />
                          <select
                            className="border-line px-4 py-3 w-full rounded-lg mt-2"
                            value={newReview.rating}
                            onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                            required
                          >
                            <option value="0" disabled>Select a rating</option>
                            <option value="1">1 Star</option>
                            <option value="2">2 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="5">5 Stars</option>
                          </select>
                          {newReview.rating === 0 && (
                            <p className="text-red-500 text-sm mt-1">Please select a rating (1–5 stars).</p>
                          )}
                        </div>
                        <div className="col-span-full message">
                          <textarea
                            className="border border-line px-4 py-3 w-full rounded-lg"
                            id="message"
                            name="message"
                            placeholder="Your review *"
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-span-full sm:pt-3">
                          <button type="submit" className="button-main bg-white text-black border border-black">
                            Submit Review
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Default;