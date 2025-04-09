'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import { useCart } from '@/context/CartContext';
import { countdownTime } from '@/store/countdownTime';

const Cart = () => {
  const [timeLeft, setTimeLeft] = useState(countdownTime());
  const router = useRouter();
  const { cartState, updateCart, removeFromCart } = useCart();

  const [totalCart, setTotalCart] = useState<number>(0);
  const [discountCart, setDiscountCart] = useState<number>(0);
  const [shipCart, setShipCart] = useState<number>(30);
  const [couponCode, setCouponCode] = useState<string>(''); // Coupon code input
  const [couponError, setCouponError] = useState<string | null>(null); // Coupon error message

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.malukforever.com';
  const moneyForFreeship = 150;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(countdownTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const newTotal = cartState.cartArray.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
    setTotalCart(newTotal);

    if (newTotal >= moneyForFreeship) {
      setShipCart(0);
    } else if (cartState.cartArray.length === 0) {
      setShipCart(0);
    } else {
      setShipCart(30);
    }
  }, [cartState.cartArray]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const itemToUpdate = cartState.cartArray.find((item) => item.id === productId);
    if (itemToUpdate) {
      updateCart(productId, newQuantity, itemToUpdate.selectedSize, itemToUpdate.selectedColor);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: totalCart }),
      });

      const result = await response.json();

      if (response.ok) {
        setDiscountCart(result.discountAmount);
        setCouponError(null);
      } else {
        setDiscountCart(0);
        setCouponError(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      setDiscountCart(0);
      setCouponError('Error applying coupon. Please try again.');
      console.error('Error applying coupon:', error);
    }
  };

  const redirectToCheckout = () => {
    const query = discountCart > 0
      ? `/checkout?discount=${discountCart}&ship=${shipCart}&coupon=${encodeURIComponent(couponCode)}`
      : `/checkout?discount=${discountCart}&ship=${shipCart}`;
    router.push(query);
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Shopping Cart" subHeading="Shopping Cart" />
      </div>
      <div className="cart-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex justify-between max-xl:flex-col gap-y-8">
            <div className="xl:w-2/3 xl:pr-3 w-full">
              <div className="time bg-green py-3 px-5 flex items-center rounded-lg">
                <div className="heding5">🔥</div>
                <div className="caption1 pl-2">
                  Your cart will expire in
                  <span className="min text-red text-button fw-700">
                    {' '}
                    {timeLeft.minutes}:{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
                  </span>
                  <span> minutes! Please checkout now before your items sell out!</span>
                </div>
              </div>
              <div className="heading banner mt-5">
                <div className="text">
                  Buy
                  <span className="text-button">
                    {' '}
                    ₹<span className="more-price">{moneyForFreeship - totalCart > 0 ? moneyForFreeship - totalCart : 0}</span>.00{' '}
                  </span>
                  <span>more to get </span>
                  <span className="text-button">freeship</span>
                </div>
                <div className="tow-bar-block mt-4">
                  <div
                    className="progress-line"
                    style={{ width: totalCart <= moneyForFreeship ? `${(totalCart / moneyForFreeship) * 100}%` : '100%' }}
                  ></div>
                </div>
              </div>
              <div className="list-product w-full sm:mt-7 mt-5">
                <div className="w-full">
                  <div className="heading bg-surface bora-4 pt-4 pb-4">
                    <div className="flex">
                      <div className="w-1/2">
                        <div className="text-button text-center">Products</div>
                      </div>
                      <div className="w-1/12">
                        <div className="text-button text-center">Price</div>
                      </div>
                      <div className="w-1/6">
                        <div className="text-button text-center">Quantity</div>
                      </div>
                      <div className="w-1/6">
                        <div className="text-button text-center">Total Price</div>
                      </div>
                    </div>
                  </div>
                  <div className="list-product-main w-full mt-3">
                    {cartState.cartArray.length < 1 ? (
                      <p className="text-button pt-3">No product in cart</p>
                    ) : (
                      cartState.cartArray.map((product) => (
                        <div className="item flex md:mt-7 md:pb-7 mt-5 pb-5 border-b border-line w-full" key={product.id}>
                          <div className="w-1/2">
                            <div className="flex items-center gap-6">
                              <div className="bg-img md:w-[100px] w-20 aspect-[3/4]">
                                <Image
                                  src={product.thumbnails[0]}
                                  width={1000}
                                  height={1000}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                              <div>
                                <div className="text-title">{product.name}</div>
                                <div className="list-select mt-3"></div>
                              </div>
                            </div>
                          </div>
                          <div className="w-1/12 price flex items-center justify-center">
                            <div className="text-title text-center">₹{product.salePrice}.00</div>
                          </div>
                          <div className="w-1/6 flex items-center justify-center">
                            <div className="quantity-block bg-surface md:p-3 p-2 flex items-center justify-between rounded-lg border border-line md:w-[100px] flex-shrink-0 w-20">
                              <Icon.Minus
                                onClick={() => {
                                  if (product.quantity > 1) {
                                    handleQuantityChange(product.id, product.quantity - 1);
                                  }
                                }}
                                className={`text-base max-md:text-sm ${product.quantity === 1 ? 'disabled' : ''}`}
                              />
                              <div className="text-button quantity">{product.quantity}</div>
                              <Icon.Plus
                                onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                                className="text-base max-md:text-sm"
                              />
                            </div>
                          </div>
                          <div className="w-1/6 flex total-price items-center justify-center">
                            <div className="text-title text-center">₹{product.quantity * product.salePrice}.00</div>
                          </div>
                          <div className="w-1/12 flex items-center justify-center">
                            <Icon.XCircle
                              className="text-xl max-md:text-base text-red cursor-pointer hover:text-black duration-500"
                              onClick={() => removeFromCart(product.id)}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="input-block discount-code w-full h-12 sm:mt-7 mt-5">
                <form className="w-full h-full relative" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Add voucher discount"
                    className="w-full h-full bg-surface pl-4 pr-14 rounded-lg border border-line"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    required
                  />
                  <button type="submit" className="button-main hover:bg-green absolute top-1 bottom-1 right-1 px-5 rounded-lg flex items-center justify-center">
                    Apply Code
                  </button>
                </form>
                {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                {discountCart > 0 && (
                  <p className="text-green-500 text-sm mt-2">Coupon applied! Discount: ₹{discountCart}.00</p>
                )}
              </div>
            </div>
            <div className="xl:w-1/3 xl:pl-12 w-full">
              <div className="checkout-block bg-surface p-6 rounded-2xl">
                <div className="heading5">Order Summary</div>
                <div className="total-block py-5 flex justify-between border-b border-line">
                  <div className="text-title">Subtotal</div>
                  <div className="text-title">
                    ₹<span className="total-product">{totalCart}</span>.00
                  </div>
                </div>
                <div className="discount-block py-5 flex justify-between border-b border-line">
                  <div className="text-title">Discounts</div>
                  <div className="text-title">
                    {discountCart > 0 ? (
                      <span>-₹<span className="discount">{discountCart}</span>.00</span>
                    ) : (
                      '₹0.00'
                    )}
                  </div>
                </div>
                <div className="ship-block py-5 flex justify-between border-b border-line">
                  <div className="text-title">Shipping</div>
                  <div className="choose-type flex gap-12">
                    <div className="left">
                      <div className="type">
                        {totalCart >= moneyForFreeship ? (
                          <input
                            id="shipping"
                            type="radio"
                            name="ship"
                            checked={shipCart === 0}
                            onChange={() => setShipCart(0)}
                          />
                        ) : (
                          <input id="shipping" type="radio" name="ship" disabled />
                        )}
                        <label className="pl-1" htmlFor="shipping">
                          Free Shipping:
                        </label>
                      </div>
                      <div className="type mt-1">
                        <input
                          id="local"
                          type="radio"
                          name="ship"
                          value={30}
                          checked={shipCart === 30}
                          onChange={() => setShipCart(30)}
                          disabled={totalCart >= moneyForFreeship}
                        />
                        <label className="text-on-surface-variant1 pl-1" htmlFor="local">
                          Local:
                        </label>
                      </div>
                      <div className="type mt-1">
                        <input
                          id="flat"
                          type="radio"
                          name="ship"
                          value={40}
                          checked={shipCart === 40}
                          onChange={() => setShipCart(40)}
                          disabled={totalCart >= moneyForFreeship}
                        />
                        <label className="text-on-surface-variant1 pl-1" htmlFor="flat">
                          Flat Rate:
                        </label>
                      </div>
                    </div>
                    <div className="right">
                      <div className="ship">₹0.00</div>
                      <div className="local text-on-surface-variant1 mt-1">₹30.00</div>
                      <div className="flat text-on-surface-variant1 mt-1">₹40.00</div>
                    </div>
                  </div>
                </div>
                <div className="total-cart-block pt-4 pb-4 flex justify-between">
                  <div className="heading5">Total</div>
                  <div className="heading5">
                    ₹<span className="total-cart heading5">{totalCart - discountCart + shipCart}</span>.00
                  </div>
                </div>
                <div className="block-button flex flex-col items-center gap-y-4 mt-5">
                  <div className="checkout-btn button-main hover:bg-green text-center w-full" onClick={redirectToCheckout}>
                    Proceed To Checkout
                  </div>
                  <Link className="text-button  hover-underline" href="/shop/breadcrumb1">
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;