'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, MagnifyingGlass, Heart, Handbag, X, CaretRight, CaretLeft } from '@phosphor-icons/react';
import { usePathname, useRouter } from 'next/navigation';
import useLoginPopup from '@/store/useLoginPopup';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useModalSearchContext } from '@/context/ModalSearchContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/lib/authContext';

interface Props {
  props: string;
}

interface Category {
  _id: string;
  name: string;
  status?: 'active' | 'inactive';
}

const MenuCosmeticOne: React.FC<Props> = ({ props }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { openLoginPopup, handleLoginPopup } = useLoginPopup();
  const { openMenuMobile, handleMenuMobile } = useMenuMobile();
  const { openModalCart } = useModalCartContext();
  const { cartState } = useCart();
  const { openModalWishlist } = useModalWishlistContext();
  const { openModalSearch } = useModalSearchContext();
  const { tokens } = useAuth();
  const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [fixedHeader, setFixedHeader] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine login status based on accessToken only
  const isLoggedIn = !!tokens?.accessToken;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://server.malukforever.com//api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (response.ok) {
          const categoryData = data.data || data;
          const activeCategories = Array.isArray(categoryData)
            ? categoryData.filter((cat: Category) => !cat.status || cat.status === 'active')
            : [];
          setCategories(activeCategories);
        } else {
          throw new Error(data.error || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error instanceof Error ? error.message : 'Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition);
      setLastScrollPosition(scrollPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition]);

  const handleSearch = (value: string) => {
    router.push(`/search-result?query=${encodeURIComponent(value)}`);
    setSearchKeyword('');
  };

  const handleOpenSubNavMobile = (index: number) => {
    setOpenSubNavMobile(openSubNavMobile === index ? null : index);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/shop/breadcrumb-img?categoryId=${encodeURIComponent(categoryId)}`);
  };

  const handleUserIconClick = () => {
    if (isLoggedIn) {
      router.push('/my-account'); // Redirect to /my-account if logged in
    } else {
      handleLoginPopup(); // Show login popup if not logged in
    }
  };

  return (
    <>
      <div className={`header-menu style-one ${fixedHeader ? 'fixed' : 'relative'} w-full md:h-[74px] h-[56px] ${props}`}>
        <div className="container mx-auto h-full">
          <div className="header-main flex items-center justify-between h-full">
            <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
              <i className="icon-category text-2xl"></i>
            </div>
            <Link href={'/'} className="flex items-center lg:hidden">
              <div className="heading4">MalukForever</div>
            </Link>
            <div className="form-search relative max-lg:hidden z-[1]">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => handleSearch(searchKeyword)}
              />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="h-10 rounded-lg border border-line caption2 w-full pl-9 pr-4"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
              />
            </div>
            <div className="menu-main h-full xl:w-full flex items-center justify-center max-lg:hidden xl:absolute xl:top-1/2 xl:left-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2">
              <ul className="flex items-center gap-8 h-full">
                <li className="h-full relative">
                  <Link href="/" className={`text-button-uppercase duration-300 h-full flex items-center justify-center gap-1 ${pathname.includes('/homepages/') ? 'active' : ''}`}>
                    Home
                  </Link>
                </li>
                <li className="h-full relative">
                  <Link href="#!" className="text-button-uppercase duration-300 h-full flex items-center justify-center">
                    Shop
                  </Link>
                  <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                    <ul className="w-full">
                      {loading ? (
                        <li>Loading categories...</li>
                      ) : error ? (
                        <li>Error: {error}</li>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <li key={category._id}>
                            <div
                              onClick={() => handleCategoryClick(category._id)}
                              className={`link text-secondary duration-300 w-full text-left ${
                                pathname === `/shop/breadcrumb-img?categoryId=${category._id}` ? 'active' : ''
                              }`}
                            >
                              {category.name}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li>No categories available</li>
                      )}
                    </ul>
                  </div>
                </li>
                <li className="h-full flex items-center justify-center logo">
                  <a className="heading4" href="/">
                    <img src="/logo.png" alt="Logo" className="h-[4.5rem] w-auto" />
                  </a>
                </li>
                <li className="h-full relative">
                  <Link href="/pages/about" className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname === '/pages/about' ? 'active' : ''}`}>
                    About Us
                  </Link>
                </li>
                <li className="h-full relative">
                  <Link href="/pages/contact" className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname === '/pages/contact' ? 'active' : ''}`}>
                    Contact Us
                  </Link>
                </li>
                <li className="h-full relative">
                  <Link href="/blog/grid/" className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname === '/blog/grid/' ? 'active' : ''}`}>
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="right flex gap-12 relative z-[1]">
              <div className="list-action flex items-center gap-4">
                <div className="user-icon flex items-center justify-center cursor-pointer" onClick={handleUserIconClick}>
                  <User size={24} color="black" />
                  {/* Show login popup only if not logged in */}
                  {!isLoggedIn && (
                    <div className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm ${openLoginPopup ? 'open' : ''}`}>
                      <Link href={'/login'} className="button-main hover:bg-green w-full text-center">Login</Link>
                      <div className="text-secondary text-center mt-3 pb-4">
                        Don’t have an account? <Link href={'/register'} className="text-black pl-1 hover:underline">Register</Link>
                      </div>
                      <div className="bottom mt-4 pt-4 border-t border-line"></div>
                      <Link href={'#!'} className="body1 hover:underline">Support</Link>
                    </div>
                  )}
                </div>
                <div className="max-md:hidden wishlist-icon flex items-center cursor-pointer" onClick={openModalWishlist}>
                  <Heart size={24} color="black" />
                </div>
                <div className="cart-icon flex items-center relative cursor-pointer" onClick={openModalCart}>
                  <Handbag size={24} color="black" />
                  <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">
                    {cartState.cartArray.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="menu-mobile" className={`${openMenuMobile ? 'open' : ''}`}>
        <div className="menu-container bg-white h-full">
          <div className="container h-full">
            <div className="menu-main h-full overflow-hidden">
              <div className="heading py-2 relative flex items-center justify-center">
                <div className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center" onClick={handleMenuMobile}>
                  <X size={14} />
                </div>
                <a className="logo text-3xl font-semibold text-center" href="/">
                  <img src="/logo.png" alt="Logo" className="h-[4.5rem] w-auto" />
                </a>
              </div>
              <div className="form-search relative mt-2">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => handleSearch(searchKeyword)}
                />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                />
              </div>
              <div className="list-nav mt-6">
                <ul>
                  <li>
                    <a href={'/'} className="text-xl font-semibold flex items-center justify-between">Home</a>
                  </li>
                  <li className={`${openSubNavMobile === 3 ? 'open' : ''}`} onClick={() => handleOpenSubNavMobile(3)}>
                    <a href={'#!'} className="text-xl font-semibold flex items-center justify-between mt-5">
                      Shop
                      <span className="text-right"><CaretRight size={20} /></span>
                    </a>
                    <div className="sub-nav-mobile">
                      <div className="back-btn flex items-center gap-3" onClick={() => handleOpenSubNavMobile(3)}>
                        <CaretLeft /> Back
                      </div>
                      <div className="list-nav-item w-full pt-3 pb-12">
                        <div className="nav-link grid grid-cols-2 gap-5 gap-y-6 justify-between">
                          <div className="nav-item">
                            <ul>
                              {loading ? (
                                <li>Loading categories...</li>
                              ) : error ? (
                                <li>Error: {error}</li>
                              ) : categories.length > 0 ? (
                                categories.map((category) => (
                                  <li key={category._id}>
                                    <div
                                      onClick={() => handleCategoryClick(category._id)}
                                      className={`text-secondary duration-300 cursor-pointer ${
                                        pathname === `/shop/breadcrumb-img?categoryId=${category._id}` ? 'active' : ''
                                      }`}
                                    >
                                      {category.name}
                                    </div>
                                  </li>
                                ))
                              ) : (
                                <li>No categories available</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className={`${openSubNavMobile === 5 ? 'open' : ''}`} onClick={() => handleOpenSubNavMobile(5)}>
                    <a href={'/blog/grid/'} className="text-xl font-semibold flex items-center justify-between mt-5">Blog</a>
                  </li>
                  <li className={`${openSubNavMobile === 6 ? 'open' : ''}`} onClick={() => handleOpenSubNavMobile(6)}>
                    <a href={'#!'} className="text-xl font-semibold flex items-center justify-between mt-5">
                      Pages
                      <span className="text-right"><CaretRight size={20} /></span>
                    </a>
                    <div className="sub-nav-mobile">
                      <div className="back-btn flex items-center gap-3" onClick={() => handleOpenSubNavMobile(6)}>
                        <CaretLeft /> Back
                      </div>
                      <div className="list-nav-item w-full pt-2 pb-6">
                        <ul className="w-full">
                          <li><Link href="/pages/about" className={`text-secondary duration-300 ${pathname === '/pages/about' ? 'active' : ''}`}>About Us</Link></li>
                          <li><Link href="/pages/contact" className={`text-secondary duration-300 ${pathname === '/pages/contact' ? 'active' : ''}`}>Contact Us</Link></li>
                          <li><Link href="/pages/faqs" className={`text-secondary duration-300 ${pathname === '/pages/faqs' ? 'active' : ''}`}>FAQs</Link></li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuCosmeticOne;