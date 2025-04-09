'use client'
import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer'
import '@splidejs/react-splide/css';

const Shipping = () => {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Shipping Policy' subHeading='Shipping Policy' />
            </div>
            <div className='about md:pt-20 pt-10'>
                <div className="about-us-block">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text flex items-center justify-center">
                            <div className="content md:w-5/6 pb-10 w-full">
                                {/* <div className="heading3 text-center">At MalukForever, we believe skincare should be simple, effective, and accessible to everyone.</div> */}
                                <div className="max-w-3xl mx-auto  p-6 bg-white shadow-md rounded-lg">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🚚 Shipping & Delivery Policy</h2>

                                    <p className="text-gray-600 mb-4">
                                        We strive to deliver your orders as quickly as possible while ensuring a secure and efficient process.
                                    </p>

                                    <div className="border-l-4 border-blue-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">📦 Order Processing Time</h3>
                                        <p className="text-gray-600">
                                            All orders are processed and shipped within <span className="font-semibold">48 hours</span> of placing the order.
                                            We partner with trusted logistics providers to ensure timely delivery.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-green-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">⏳ Delivery Time</h3>
                                        <p className="text-gray-600">
                                            We aim to deliver your order within <span className="font-semibold">15 working days</span> from payment confirmation,
                                            depending on the shipping destination. Delivery times may vary based on location and courier service.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-red-500 pl-4">
                                        <h3 className="text-lg font-medium text-gray-800">⚠️ Out-of-Stock Items</h3>
                                        <p className="text-gray-600">
                                            If an item is <span className="font-semibold">out of stock</span> at the time of purchase, we may require an
                                            additional <span className="font-semibold">7-10 days</span> to restock and fulfill your order.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Shipping