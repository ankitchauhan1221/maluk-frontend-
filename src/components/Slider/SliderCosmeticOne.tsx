'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';

// Define the Banner interface
interface Banner {
  _id: string;        // Unique identifier
  salestext: string;  // Sale text (e.g., "50% Off")
  title: string;      // Main title
  description: string;// Description text
  buttonLink: string; // URL for the button
  buttonText: string; // Button label
  imageUrl: string;   // Image URL for the banner
  active: boolean;    // Active status
}

const SliderCosmeticOne = () => {
  const [banners, setBanners] = useState<Banner[]>([]); // Type the state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/banners', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }

        const data = await response.json();
        const activeBanners: Banner[] = data.filter((banner: Banner) => banner.active);
        setBanners(activeBanners);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error('Error fetching banners:', err);
        } else {
          setError('An unknown error occurred');
          console.error('Unknown error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading banners...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-20">{error}</div>;
  }

  if (banners.length === 0) {
    return <div className="text-center py-20">No active banners available.</div>;
  }

  return (
    <div className="slider-block style-two bg-linear 2xl:h-[820px] xl:h-[740px] lg:h-[680px] md:h-[580px] sm:h-[500px] h-[420px] w-full">
      <div className="slider-main h-full w-full">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          className="h-full relative"
          autoplay={{
            delay: 4000,
          }}
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner._id}>
              <div className="slider-item h-full w-full relative">
                <div className="container w-full h-full flex items-center">
                  <div className="text-content sm:w-1/2 w-2/3">
                    <div className="text-sub-display">{banner.salestext}</div>
                    <div className="text-display md:mt-5 mt-2">{banner.title}</div>
                    <div className="body1 mt-4">{banner.description}</div>
                    <Link href={banner.buttonLink} className="button-main hover:bg-[#F1D68F] md:mt-8 mt-3">
                      {banner.buttonText}
                    </Link>
                  </div>
                  <div className="sub-img absolute left-0 top-0 w-full h-full z-[-1]">
                    <Image
                      src={banner.imageUrl}
                      width={2560}
                      height={1080}
                      alt={banner.title}
                      priority={true}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SliderCosmeticOne;