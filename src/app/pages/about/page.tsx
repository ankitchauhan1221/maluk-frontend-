'use client'
import React, { useEffect } from 'react'
import Image from 'next/image';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Benefit from '@/components/Home1/Benefit'
import Instagram from '@/components/Cosmetic1/Instagram';
import Footer from '@/components/Footer/Footer'
import Splide from '@splidejs/splide';
import '@splidejs/splide/css'; // Import Splide CSS

// Define interface for slide objects
interface Slide {
    image: string;
    alt: string;
}

// Slider Component using Splide.js
const ImageSlider: React.FC = () => {
    const slides: Slide[] = [
        {
            image: '/images/slider/1.jpg',
            alt: 'Skincare Product 1'
        },
        {
            image: '/images/slider/2.jpg',
            alt: 'Skincare Product 2'
        },
        {
            image: '/images/slider/3.jpg',
            alt: 'Skincare Product 3'
        },
        {
            image: '/images/slider/4.jpg',
            alt: 'Skincare Product 4'
        },
        {
            image: '/images/slider/5.jpg',
            alt: 'Skincare Product 5'
        }
        // Add more slides if needed
    ];

    useEffect(() => {
        const splide = new Splide('.splide', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '1rem', // Adds spacing between slides
            pagination: true, // Shows dots
            arrows: true, // Shows navigation arrows
            autoplay: true, // Auto-slides
            interval: 3000, // 3 seconds between slides
        });

        splide.mount();

        // Cleanup on unmount
        return () => {
            splide.destroy();
        };
    }, []);

    return (
        <div className="slider-section md:pt-20 pt-10">
            <div className="container">
                <h2 className="text-2xl font-semibold text-center mb-8">Our Products in Action</h2>
                <div className="splide max-w-4xl mx-auto">
                    <div className="splide__track">
                        <ul className="splide__list">
                            {slides.map((slide: Slide, index: number) => (
                                <li className="splide__slide" key={index}>
                                    <div className="bg-img">
                                        <Image
                                            src={slide.image}
                                            width={2000}
                                            height={3000}
                                            alt={slide.alt}
                                            className="w-full h-[400px] object-cover "
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// AboutUs Component
const AboutUs: React.FC = () => {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='About Us' subHeading='About Us' />
            </div>
            <div className='about md:pt-20 pt-10'>
                <div className="about-us-block">
                    <div className="container">
                        <div className="text flex items-center justify-center">
                            <div className="content md:w-5/6 w-full">
                                <div className="body1 text-center">At MalukForever, we believe skincare should be simple, effective, and accessible to everyone. We blend the power of nature with the precision of science to create formulations that are safe, effective, and affordable—because great skin care shouldn't come with a high price tag.  With a focus on innovation and excellence, we offer an extensive range of product categories:</div>

                                <div className="body1 text-center md:mt-7 mt-5">
                                    <ul className="list-disc text-left mt-3 ml-6">
                                        
                                        <li><strong>Skin Care:</strong> Nourish and rejuvenate your skin with our carefully crafted products, including sheet masks, bath oils, sunscreens, and serums.</li>
                                    </ul>
                                    <p className="mt-3">MalukForever - Enhance Your Beauty<br />At MalukForever, we are dedicated to combining beauty with care, ensuring each product meets the highest standards of quality, safety, and efficacy. Discover the difference and let us help you shine, inside and out.</p>
                                </div>
                            </div>
                        </div>

                        <div className="vision-mission grid md:grid-cols-2 grid-cols-1 gap-6 md:mt-7 mt-5">
                            <div className="vision-section">
                                <h3 className="text-xl font-semibold text-center">Our Vision</h3>
                                <div className="body1 text-center mt-2">To make skincare effortless, affordable, and accessible for all, by combining the best of nature and science for healthier, happier skin.</div>
                            </div>
                            <div className="mission-section">
                                <h3 className="text-xl font-semibold text-center">Our Mission</h3>
                                <div className="body1 text-center mt-2">To deliver high-quality, budget-friendly skincare solutions that cater to every skin type, using carefully selected ingredients that are both effective and sustainable.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ImageSlider />
            <Benefit props="md:pt-20 pt-10" />
            <Instagram />
            <Footer />
        </>
    )
}

export default AboutUs