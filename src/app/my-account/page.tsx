'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import { HouseLine, Package, Tag, GearSix, SignOut, PencilSimple, Trash } from '@phosphor-icons/react';
import { useAuth } from '@/lib/authContext';
import api from '@/lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Skeleton Component
interface SkeletonProps {
  className?: string;
}
const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Interfaces
interface Address {
  _id: string;
  name: string;
  lastname: string;
  companyName?: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  type: 'Shipping' | 'Billing';
  isDefault: boolean;
}

interface Product {
  productId: string;
  name: string;
  thumbnail?: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: string;
  products: Product[];
  totalAmount: number;
  status: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  shippingCost?: number;
}

interface User {
  name?: string;
  lastname?: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  addresses?: Address[];
  role: string;
}

const MyAccount: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userData, setUserData] = useState<User | null>(null);
  const [showCancelPopup, setShowCancelPopup] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Unified loading state
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Address>({
    _id: '',
    name: '',
    lastname: '',
    companyName: '',
    country: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    type: 'Shipping',
    isDefault: false,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState<string | null>(null);

  const router = useRouter();
  const { tokens, logout, isLoading: authLoading } = useAuth(); // Use isLoading from AuthProvider

  // Handle authentication and data fetching
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    if (!tokens?.accessToken) {
      router.replace('/login');
      return;
    }

    fetchUserDataAndOrders();
  }, [tokens, authLoading, router]);

  const fetchUserDataAndOrders = async () => {
    try {
      setLoading(true);
      const userResponse = await api.get('/api/auth/user', tokens?.accessToken);
      const user: User = userResponse.data;

      if (user.role !== 'user') {
        toast.error('Access denied. This page is for customers only.', {
          position: 'top-right',
          autoClose: 3000,
        });
        await logout();
        router.push('/login');
        return;
      }

      setUserData(user);

      const ordersResponse = await api.get('/api/orders/history', tokens?.accessToken);
      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
    } catch (error: any) {
      console.error('MyAccount - Error fetching data:', error);
      toast.error('Failed to load account data', { position: 'top-right', autoClose: 3000 });
      if (error.response?.status === 401) {
        await logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!', { position: 'top-right', autoClose: 2000 });
      router.push('/login');
    } catch (error) {
      console.error('MyAccount - Error during logout:', error);
      toast.error('Failed to log out', { position: 'top-right', autoClose: 3000 });
      router.push('/login');
    } finally {
      localStorage.clear();
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation', { position: 'top-right', autoClose: 3000 });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/api/shipping/${orderId}/cancel`,
        { reason: cancelReason },
        tokens?.accessToken
      );

      toast.success(response.data.message || 'Order cancelled successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      setShowCancelPopup(null);
      setCancelReason('');
      await fetchUserDataAndOrders();
    } catch (error: any) {
      console.error('MyAccount - Error cancelling order:', error);
      toast.error(`Failed to cancel order: ${error.response?.data?.error || 'Unknown error'}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      if (error.response?.status === 401) {
        await logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setAddressForm({ ...address, phone: address.phone || userData?.phone || '' });
    setIsEditing(true);
  };

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setAddressForm({
      _id: '',
      name: userData?.name || '',
      lastname: userData?.lastname || '',
      companyName: '',
      country: 'India',
      streetAddress: '',
      city: '',
      state: '',
      zip: '',
      phone: userData?.phone || '',
      email: userData?.email || '',
      type: 'Shipping',
      isDefault: false,
    });
    setIsEditing(true);
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'phone') {
      const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      setAddressForm((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setAddressForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formattedAddressForm = {
        ...addressForm,
        phone: addressForm.phone.startsWith('+91') ? addressForm.phone : `+91${addressForm.phone}`,
      };

      if (!/^\+91\d{10}$/.test(formattedAddressForm.phone)) {
        throw new Error('Phone number must be 10 digits');
      }

      const response = await api.post('/api/address', formattedAddressForm, tokens?.accessToken);
      setUserData((prev) => (prev ? { ...prev, addresses: response.data } : null));
      setIsEditing(false);
      setSelectedAddress(null);
      toast.success('Address saved successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(`Failed to save address: ${error.response?.data?.error || error.message}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      if (error.response?.status === 401) {
        await logout();
        router.push('/login');
      }
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await api.delete(`/api/address/${addressId}`, tokens?.accessToken);
      setUserData((prev) => (prev ? { ...prev, addresses: response.data } : null));
      setIsEditing(false);
      setSelectedAddress(null);
      setShowDeletePopup(null);
      toast.success('Address deleted successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast.error(`Failed to delete address: ${error.response?.data?.error || 'Unknown error'}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      if (error.response?.status === 401) {
        await logout();
        router.push('/login');
      }
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      name: formData.get('firstName') as string,
      lastname: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
    };

    try {
      const response = await api.put('/api/auth/user', updatedData, tokens?.accessToken);
      setUserData(response.data);
      toast.success('Profile updated successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update profile: ${error.response?.data?.error || 'Unknown error'}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      if (error.response?.status === 401) {
        await logout();
        router.push('/login');
      }
    }
  };

  // Unified loading state from AuthProvider and local fetch
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
        <div id="header" className="relative w-full">
          <MenuOne props="bg-transparent" />
          <Breadcrumb heading="My Account" subHeading="My Account" />
        </div>
        <div className="profile-block md:py-20 py-10 flex-1">
          <div className="container">
            <div className="content-main flex gap-y-8 max-md:flex-col w-full">
              <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
                <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                  <div className="heading flex flex-col items-center justify-center">
                    <Skeleton className="md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full" />
                    <Skeleton className="h-6 w-32 mt-4" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </div>
                  <div className="menu-tab w-full max-w-none lg:mt-10 mt-6 space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="right md:w-2/3 w-full pl-2.5">
                <div className="p-7 border border-line rounded-xl">
                  <Skeleton className="h-6 w-40 mb-5" />
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Redirect handling is done in useEffect, so no need to render anything if not authenticated
  if (!tokens?.accessToken || !userData) {
    return null;
  }

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="My Account" subHeading="My Account" />
      </div>
      <div className="profile-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col w-full">
            <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
              <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                <div className="heading flex flex-col items-center justify-center">
                  <div className="avatar">
                    <Image
                      src="/images/avatar/avatar.webp"
                      width={300}
                      height={300}
                      alt="avatar"
                      className="md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full"
                    />
                  </div>
                  <div className="name heading6 mt-4 text-center">
                    {`${userData.name || ''} ${userData.lastname || ''}`.trim() || 'User'}
                  </div>
                  <div className="mail heading6 font-normal normal-case text-secondary text-center mt-1">
                    {userData.email}
                  </div>
                </div>
                <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                  <Link
                    href="#!"
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <HouseLine size={20} />
                    <strong className="heading6">Dashboard</strong>
                  </Link>
                  <Link
                    href="#!"
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <Package size={20} />
                    <strong className="heading6">History Orders</strong>
                  </Link>
                  <Link
                    href="#!"
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'address' ? 'active' : ''}`}
                    onClick={() => setActiveTab('address')}
                  >
                    <Tag size={20} />
                    <strong className="heading6">My Address</strong>
                  </Link>
                  <Link
                    href="#!"
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'setting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('setting')}
                  >
                    <GearSix size={20} />
                    <strong className="heading6">Settings</strong>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5"
                  >
                    <SignOut size={20} />
                    <strong className="heading6">Logout</strong>
                  </button>
                </div>
              </div>
            </div>
            <div className="right md:w-2/3 w-full pl-2.5">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
                  <h6 className="heading6">Recent Orders</h6>
                  {orders.length === 0 ? (
                    <p className="mt-5">No recent orders found.</p>
                  ) : (
                    <div className="list overflow-x-auto w-full mt-5">
                      <table className="w-full max-[1400px]:w-[700px] max-md:w-[700px]">
                        <thead className="border-b border-line">
                          <tr>
                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                              Order
                            </th>
                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                              Products
                            </th>
                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                              Pricing
                            </th>
                            <th scope="col" className="pb-3 text-right text-sm font-bold uppercase text-secondary whitespace-nowrap">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.orderId} className="item duration-300 border-b border-line">
                              <th scope="row" className="py-3 text-left">
                                <strong className="text-title">{order.orderId}</strong>
                              </th>
                              <td className="py-3">
                                <Link href={`/product/default?id=${order.products[0].productId}`} className="product flex items-center gap-3">
                                  <Image
                                    src={order.products[0].thumbnail || '/images/product/1000x1000.png'}
                                    width={400}
                                    height={400}
                                    alt={order.products[0].name}
                                    className="flex-shrink-0 w-12 h-12 rounded"
                                  />
                                  <div className="info flex flex-col">
                                    <strong className="product_name text-button">{order.products[0].name}</strong>
                                    <span className="product_tag caption1 text-secondary">Order Item</span>
                                  </div>
                                </Link>
                              </td>
                              <td className="py-3 price">₹{order.totalAmount.toFixed(2)}</td>
                              <td className="py-3 text-right">
                                <span
                                  className={`tag px-4 py-1.5 rounded-full bg-opacity-10 caption1 font-semibold ${order.status === 'Pending'
                                    ? 'bg-yellow text-yellow'
                                    : order.status === 'Shipped'
                                      ? 'bg-blue text-blue'
                                      : order.status === 'Delivered'
                                        ? 'bg-success text-success'
                                        : 'bg-red text-red'
                                    }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="text-content overflow-hidden w-full p-7 border border-line rounded-xl">
                  <h6 className="heading6">Your Orders</h6>
                  {orders.length === 0 ? (
                    <p className="mt-5">No orders found.</p>
                  ) : (
                    <div className="list_order">
                      {orders.map((order) => (
                        <div key={order.orderId} className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                            <div className="flex items-center gap-2">
                              <strong className="text-title">Order Number:</strong>
                              <strong className="order_number text-button uppercase">{order.orderId}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <strong className="text-title">Order status:</strong>
                              <span
                                className={`tag px-4 py-1.5 rounded-full bg-opacity-10 caption1 font-semibold ${order.status === 'Pending'
                                  ? 'bg-yellow text-yellow'
                                  : order.status === 'Shipped'
                                    ? 'bg-[#8684d41a] text-[#8684d4]'
                                    : order.status === 'Delivered'
                                      ? 'bg-success text-success'
                                      : 'bg-red text-red'
                                  }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="list_prd px-5">
                            {order.products.map((product, index) => (
                              <div
                                key={index}
                                className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line"
                              >
                                <Link href={`/product/${product.productId}`} className="flex items-center gap-5">
                                  <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                    <Image
                                      src={product.thumbnail || '/images/product/1000x1000.png'}
                                      width={1000}
                                      height={1000}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="prd_name text-title">{product.name}</div>
                                  </div>
                                </Link>
                                <div className="text-title">
                                  <span className="prd_quantity">{product.quantity}</span>
                                  <span> X </span>
                                  <span className="prd_price">₹{product.price.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 p-5">
                            <button className="button-main hover:bg-green" onClick={() => setOpenDetail(order.orderId)}>
                              Order Details
                            </button>
                            {['Pending', 'Processing'].includes(order.status) && (
                              <button
                                className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white"
                                onClick={() => setShowCancelPopup(order.orderId)}
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="text-content w-full p-7 border border-line rounded-xl">
                  <h6 className="heading6 mb-5">My Addresses</h6>
                  <div className="address-list flex flex-col gap-4">
                    {userData.addresses && userData.addresses.length > 0 ? (
                      userData.addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`address-card p-4 border border-line rounded-lg cursor-pointer duration-300 ${selectedAddress?._id === address._id ? 'bg-surface' : ''}`}
                          onClick={() => handleSelectAddress(address)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="heading6">
                                {address.name} {address.lastname}
                                {address.isDefault && (
                                  <span className="ml-2 text-xs bg-success text-white px-2 py-1 rounded">Default</span>
                                )}
                              </div>
                              <div className="text-base mt-1">
                                {address.streetAddress}{address.companyName && `, ${address.companyName}`},
                                {address.city}, {address.state} {address.zip}, {address.country}
                              </div>
                              <div className="text-base">Phone: {address.phone}</div>
                              <div className="text-base">Email: {address.email}</div>
                              <div className="text-base">Type: {address.type}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="text-blue hover:text-blue-dark"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAddress(address);
                                }}
                              >
                                <PencilSimple size={20} />
                              </button>
                              <button
                                type="button"
                                className="text-red hover:text-red-dark"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeletePopup(address._id);
                                }}
                              >
                                <Trash size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary">No addresses found. Add one below!</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-5 text-blue hover:text-blue-dark flex items-center gap-2"
                    onClick={handleAddNewAddress}
                  >
                    <PencilSimple size={20} /> Add New Address
                  </button>

                  {isEditing && (
                    <form onSubmit={handleSaveAddress} className="mt-6">
                      <h6 className="heading6 mb-4">{selectedAddress ? 'Edit Address' : 'Add New Address'}</h6>
                      <div className="grid sm:grid-cols-2 gap-4 gap-y-5">
                        <div>
                          <label className="caption1 capitalize">
                            First Name <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="name"
                            type="text"
                            value={addressForm.name}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            Last Name <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="lastname"
                            type="text"
                            value={addressForm.lastname}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">Company Name (optional)</label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="companyName"
                            type="text"
                            value={addressForm.companyName || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            Country <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="country"
                            type="text"
                            value={addressForm.country}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            Street Address <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="streetAddress"
                            type="text"
                            value={addressForm.streetAddress}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            City <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="city"
                            type="text"
                            value={addressForm.city}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            State <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="state"
                            type="text"
                            value={addressForm.state}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            ZIP <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="zip"
                            type="text"
                            value={addressForm.zip}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            Phone <span className="text-red">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                            <input
                              className="border-line mt-2 pl-12 pr-4 py-3 w-full rounded-lg"
                              name="phone"
                              type="text"
                              value={addressForm.phone.replace('+91', '')}
                              onChange={handleAddressChange}
                              maxLength={10}
                              placeholder="10-digit number"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="caption1 capitalize">
                            Email <span className="text-red">*</span>
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="email"
                            type="email"
                            value={addressForm.email}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="caption1 capitalize">Address Type</label>
                          <select
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            name="type"
                            value={addressForm.type}
                            onChange={handleAddressChange}
                          >
                            <option value="Shipping">Shipping</option>
                            <option value="Billing">Billing</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={addressForm.isDefault}
                            onChange={handleAddressChange}
                            className="mt-2"
                          />
                          <label className="caption1 capitalize">Set as Default</label>
                        </div>
                      </div>
                      <div className="block-button lg:mt-10 mt-6 flex gap-4">
                        <button type="submit" className="button-main hover:bg-green">Save Address</button>
                        <button
                          type="button"
                          className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'setting' && (
                <div className="text-content w-full p-7 border border-line rounded-xl">
                  <form onSubmit={handleUpdateUser}>
                    <div className="heading5 pb-4">Information</div>
                    <div className="grid sm:grid-cols-2 gap-4 gap-y-5 mt-5">
                      <div>
                        <label htmlFor="firstName" className="caption1 capitalize">
                          First Name <span className="text-red">*</span>
                        </label>
                        <input
                          className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                          id="firstName"
                          name="firstName"
                          type="text"
                          defaultValue={userData.name || ''}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="caption1 capitalize">
                          Last Name <span className="text-red">*</span>
                        </label>
                        <input
                          className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                          id="lastName"
                          name="lastName"
                          type="text"
                          defaultValue={userData.lastname || ''}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="caption1 capitalize">
                          Email Address <span className="text-red">*</span>
                        </label>
                        <input
                          className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={userData.email}
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="caption1 capitalize">
                          Phone <span className="text-red">*</span>
                        </label>
                        <input
                          className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                          id="phone"
                          name="phone"
                          type="text"
                          defaultValue={userData.phone || ''}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="gender" className="caption1 capitalize">
                          Gender
                        </label>
                        <select
                          className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                          id="gender"
                          name="gender"
                          defaultValue={userData.gender || ''}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="dateOfBirth" className="caption1 capitalize">
                          Date of Birth
                        </label>
                        <input
                          className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          defaultValue={userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : ''}
                        />
                      </div>
                    </div>
                    <div className="block-button lg:mt-10 mt-6">
                      <button type="submit" className="button-main hover:bg-green">Save Changes</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Order Details Modal */}
      {openDetail && (
        <div className="modal-order-detail-block fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-order-detail-main grid grid-cols-2 w-[1160px] max-w-[90%] max-h-[80vh] bg-white rounded-2xl overflow-y-auto">
            {orders
              .filter((order) => order.orderId === openDetail)
              .map((order) => (
                <React.Fragment key={order.orderId}>
                  <div className="info p-10 border-r border-line">
                    <h5 className="heading5">Order Details</h5>
                    <div className="list_info grid grid-cols-2 gap-10 gap-y-8 mt-5">
                      <div className="info_item">
                        <strong className="text-button-uppercase text-secondary">Contact Information</strong>
                        <h6 className="heading6 order_name mt-2">
                          {order.shippingAddress.name} {order.shippingAddress.lastname}
                        </h6>
                        <h6 className="heading6 order_phone mt-2">{order.shippingAddress.phone}</h6>
                        <h6 className="heading6 normal-case order_email mt-2">{order.shippingAddress.email}</h6>
                      </div>
                      <div className="info_item">
                        <strong className="text-button-uppercase text-secondary">Payment Method</strong>
                        <h6 className="heading6 order_payment mt-2">{order.paymentMethod}</h6>
                      </div>
                      <div className="info_item">
                        <strong className="text-button-uppercase text-secondary">Shipping Address</strong>
                        <h6 className="heading6 order_shipping_address mt-2">
                          {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
                        </h6>
                      </div>
                      <div className="info_item">
                        <strong className="text-button-uppercase text-secondary">Billing Address</strong>
                        <h6 className="heading6 order_billing_address mt-2">
                          {order.billingAddress.streetAddress}, {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip}, {order.billingAddress.country}
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className="list p-10">
                    <h5 className="heading5">Items</h5>
                    <div className="list_prd">
                      {order.products.map((product, index) => (
                        <div
                          key={index}
                          className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line"
                        >
                          <Link href={`/product/${product.productId}`} className="flex items-center gap-5">
                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                              <Image
                                src={product.thumbnail || '/images/product/1000x1000.png'}
                                width={1000}
                                height={1000}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="prd_name text-title">{product.name}</div>
                            </div>
                          </Link>
                          <div className="text-title">
                            <span className="prd_quantity">{product.quantity}</span>
                            <span> X </span>
                            <span className="prd_price">₹{product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <strong className="text-title">Shipping</strong>
                      <strong className="order_ship text-title">₹{order.shippingCost?.toFixed(2) || 'Free'}</strong>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-line">
                      <h5 className="heading5">Subtotal</h5>
                      <h5 className="order_total heading5">₹{order.totalAmount.toFixed(2)}</h5>
                    </div>
                    <button
                      className="button-main mt-5 w-full"
                      onClick={() => setOpenDetail(null)}
                    >
                      Close
                    </button>
                  </div>
                </React.Fragment>
              ))}
          </div>
        </div>
      )}

      {/* Delete Address Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h5 className="heading5 mb-4">Confirm Deletion</h5>
            <p className="text-base mb-6">Are you sure you want to delete this address?</p>
            <div className="flex justify-end gap-4">
              <button
                className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white px-4 py-2 rounded-lg"
                onClick={() => setShowDeletePopup(null)}
              >
                Cancel
              </button>
              <button
                className="button-main bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-lg"
                onClick={() => handleDeleteAddress(showDeletePopup)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h5 className="heading5 mb-4">Confirm Order Cancellation</h5>
            <p className="text-base mb-4">Are you sure you want to cancel order #{showCancelPopup}?</p>
            <div className="mb-4">
              <label className="caption1 capitalize block mb-2">
                Reason for cancellation <span className="text-red">*</span>
              </label>
              <textarea
                className="border-line w-full px-4 py-3 rounded-lg"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  setShowCancelPopup(null);
                  setCancelReason('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="button-main bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-lg"
                onClick={() => handleCancelOrder(showCancelPopup)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default MyAccount;