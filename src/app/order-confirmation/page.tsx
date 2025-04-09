'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import { Order, Product, Address } from '@/type/order';
import { useAuth } from '@/lib/authContext';

const OrderConfirmation: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tokens, isLoading: authLoading } = useAuth();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.malukforever.com';

  const fetchOrderDetails = async (orderId: string, transactionId?: string | null): Promise<void> => {
    console.log('OrderConfirmation - Tokens:', tokens);
    console.log('OrderConfirmation - TransactionId:', transactionId);
    console.log('OrderConfirmation - Fetching order for:', orderId);

    try {
      setLoading(true);
      const url = transactionId
        ? `${API_BASE_URL}/api/orders/${orderId}?transactionId=${transactionId}`
        : `${API_BASE_URL}/api/orders/${orderId}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (tokens?.accessToken) {
        headers.Authorization = `Bearer ${tokens.accessToken}`;
      }

      const response = await fetch(url, { method: 'GET', headers });
      console.log('OrderConfirmation - Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch order details: ${response.status} - ${errorText}`);
      }

      const orderData: Order = await response.json();
      console.log('OrderConfirmation - Order Data:', orderData);
      setOrder(orderData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('OrderConfirmation - Error:', errorMessage);
      setError(errorMessage);
      if (errorMessage.includes('401') && tokens?.accessToken) {
        localStorage.removeItem('tokens');
        router.push('/login');
      } else if (!tokens?.accessToken && !transactionId) {
        router.push('/login?redirect=/pages/order-confirmation');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');
    const status = searchParams.get('status');
    console.log('OrderConfirmation - Query Params:', { orderId, transactionId, status });
    console.log('OrderConfirmation - Tokens:', tokens);

    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      router.push('/');
    } else if (status === 'success' || status === 'processing' || status === 'shipped' || tokens?.accessToken) {
      fetchOrderDetails(orderId, transactionId);
    } else {
      router.push('/login?redirect=/pages/order-confirmation');
    }
  }, [searchParams, router, tokens, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-gray-700">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-500">Error: {error}</p>
        <Link href="/my-account" className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Go to My Account
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-gray-700">No order found.</p>
        <Link href="/my-account" className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Go to My Account
        </Link>
      </div>
    );
  }

  const rawSubtotal = order.products.reduce((sum: number, p: Product) => sum + p.price * p.quantity, 0);
  const status = searchParams.get('status');
  const transactionId = searchParams.get('transactionId');

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Order Confirmation" subHeading="Thank You for Your Purchase" />
      </div>
      <div className="order-confirmation-block bg-gray-100 md:py-20 py-10">
        <div className="container mx-auto px-4">
          <div className="confirmation-content max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-green-500">
              {status === 'processing' ? 'Order Processing' : status === 'shipped' ? 'Order Shipped' : 'Order Confirmed'}
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Thank you for your order! Your order <strong className="font-semibold">{order.orderId}</strong> is
              {status === 'processing' ? ' being processed.' : status === 'shipped' ? ' shipped.' : ' confirmed.'}
              {order.trackingNumber && ` Tracking Number: ${order.trackingNumber}`}
              {transactionId && order.paymentMethod !== 'COD' && ` Transaction ID: ${transactionId}`}
            </p>

            <div className="order-details grid md:grid-cols-2 gap-8 border-t border-gray-200 pt-6">
              <div className="info">
                <h5 className="text-2xl font-bold mb-4">Order Details</h5>
                <div className="grid gap-6">
                  <div>
                    <strong className="text-sm uppercase font-semibold text-gray-500">Contact Information</strong>
                    <p className="mt-2 text-gray-700">{order.shippingAddress.name} {order.shippingAddress.lastname}</p>
                    <p className="text-gray-700">{order.shippingAddress.phone}</p>
                    <p className="text-gray-700 lowercase">{order.shippingAddress.email}</p>
                  </div>
                  <div>
                    <strong className="text-sm uppercase font-semibold text-gray-500">Payment Method</strong>
                    <p className="mt-2 text-gray-700">{order.paymentMethod}</p>
                  </div>
                  {order.paymentMethod !== 'COD' && (
                    <div>
                      <strong className="text-sm uppercase font-semibold text-gray-500">Transaction ID</strong>
                      <p className="mt-2 text-gray-700">{transactionId || order.transactionId || 'Not available'}</p>
                    </div>
                  )}
                  <div>
                    <strong className="text-sm uppercase font-semibold text-gray-500">Shipping Address</strong>
                    <p className="mt-2 text-gray-700">
                      {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zip}, {order.shippingAddress.country}
                    </p>
                  </div>
                  <div>
                    <strong className="text-sm uppercase font-semibold text-gray-500">Billing Address</strong>
                    <p className="mt-2 text-gray-700">
                      {order.billingAddress.streetAddress}, {order.billingAddress.city}, {order.billingAddress.state}{' '}
                      {order.billingAddress.zip}, {order.billingAddress.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="list">
                <h5 className="text-2xl font-bold mb-4">Items Purchased</h5>
                <div className="space-y-4">
                  {order.products.map((product: Product, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 py-4 border-b border-gray-200"
                    >
                      <Link href={`/product/${product.productId}`} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={product.thumbnail || '/images/product/1000x1000.png'}
                            width={1000}
                            height={1000}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-lg font-semibold text-gray-800">{product.name}</p>
                      </Link>
                      <div className="text-lg font-semibold text-gray-800">
                        <span>{product.quantity}</span>
                        <span> X </span>
                        <span>₹{product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-lg font-semibold text-gray-800">
                    <span>Subtotal</span>
                    <span>₹{rawSubtotal.toFixed(2)}</span>
                  </div>
                  {order.couponCode && (
                    <div className="flex items-center justify-between mt-2 text-lg font-semibold text-green-600">
                      <span>Discount ({order.couponCode})</span>
                      <span>-₹{(order.discountAmount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 text-lg font-semibold text-gray-800">
                    <span>Shipping (DTDC)</span>
                    <span>₹{(order.shippingCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200">
                    <h5 className="text-2xl font-bold">Total</h5>
                    <h5 className="text-2xl font-bold">₹{order.totalAmount.toFixed(2)}</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-10">
              <Link href="/my-account" className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                View My Orders
              </Link>
              <Link href="/" className="px-6 py-3 bg-gray-100 border border-gray-300 text-black rounded-lg hover:bg-[#000] hover:text-white transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;