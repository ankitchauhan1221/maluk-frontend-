"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import TopNavThree from '@/components/Header/TopNav/TopNavThree';
import MenuCosmeticOne from '@/components/Header/Menu/MenuCosmeticOne';
import SliderCosmeticOne from '@/components/Slider/SliderCosmeticOne';
import BannerTop from '@/components/Header/TopNav/BannerTop';
import Collection from '@/components/Cosmetic1/Collection';
import CommunityStory from '@/components/Cosmetic1/CommunityStory';
import AdsPhoto from '@/components/Cosmetic1/AdsPhoto.jsx';
import NewArrival from '@/components/Cosmetic1/NewArrival';
import Testimonial from '@/components/Home1/Testimonial';
import testimonialData from '@/data/Testimonial.json';
import Benefit from '@/components/Cosmetic1/Benefit';
import Instagram from '@/components/Cosmetic1/Instagram';
import Footer from '@/components/Footer/Footer';

export default function HomeCosmeticOne() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 4000); // Adjust timing as needed
    }, []);

    return (
        <>
            {loading ? (
                <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                    <Image 
                        src="/logo.png" 
                        alt="Logo Loader" 
                        width={100} 
                        height={100} 
                        className="animate-pulse"
                    />
                </div>
            ) : (
                <>
                    <TopNavThree props="style-three bg-white" />
                    <div id="header" className='relative w-full'>
                        <MenuCosmeticOne props="bg-white" />
                        <BannerTop props="bg-green py-3" textColor='text-black' bgLine='bg-black' />
                        <SliderCosmeticOne />
                    </div>
                    <Collection />
                    <CommunityStory />
                    <AdsPhoto />
                    <NewArrival />
                    <Benefit props="md:py-20 py-10" />
                    <Testimonial data={testimonialData} limit={6} />
                    <Instagram />
                    <Footer />
                </>
            )}
        </>
    );
}
