'use client'
import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer'
import '@splidejs/react-splide/css';

const RefundandReturn = () => {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Refund&Return' subHeading='Refund&Return' />
            </div>
            <div className='about md:pt-20 pt-10'>
                <div className="about-us-block">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text flex items-center justify-center">
                            <div className="content md:w-5/6 pb-10 w-full">
                                <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔄 Return & Exchange Policy</h2>
                                    <p className="text-gray-600 mb-4">
                                        We want you to love your purchase, but we understand that sometimes things don’t work out. Here’s how we handle returns and exchanges:
                                    </p>

                                    <div className="border-l-4 border-red-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">🚫 Non-returnable Items</h3>
                                        <p className="text-gray-600">
                                            Due to the personal care and wellness nature of our products, all items are <span className="font-semibold">non-returnable</span>, including beauty, skincare, and consumable goods.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-yellow-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">📦 Damaged or Incorrect Items</h3>
                                        <p className="text-gray-600">
                                            If you receive a damaged or incorrect product, please contact our customer service within <span className="font-semibold">48 hours</span> of delivery.
                                            A <span className="font-semibold">360-degree unboxing video</span> and clear pictures of the product, packaging, and invoice are required to process your claim.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-blue-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">⚠️ Exchanges for Allergic Reactions or Preferences</h3>
                                        <p className="text-gray-600">
                                            We do not accept exchanges for reasons such as allergic reactions or personal dislikes.
                                            We always recommend a <span className="font-semibold">patch test</span> before use, as mentioned on our product packaging.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h3 className="text-lg font-medium text-gray-800">🔄 Return Process</h3>
                                        <p className="text-gray-600">
                                            Items must be <span className="font-semibold">unused, unopened, and in original packaging</span> if making a claim.
                                            No refunds will be issued under any circumstances.
                                        </p>
                                    </div>
                                </div>

                                <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">💰 Refund Policy</h2>

                                    <div className="border-l-4 border-red-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">🚫 No Refund Policy</h3>
                                        <p className="text-gray-600">
                                            At <span className="font-semibold">Maluk Forever</span>, most purchases are <span className="font-semibold">non-returnable and non-exchangeable</span> due to hygiene and health regulations. However, we assist with specific issues as per the guidelines below.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-yellow-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">🛑 Order Cancellation</h3>
                                        <p className="text-gray-600">
                                            Once an order is placed, it <span className="font-semibold">cannot be modified, canceled, or refunded</span>.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-green-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">📦 Failed Delivery or Lost Orders</h3>
                                        <p className="text-gray-600">
                                            If your order is marked as <span className="font-semibold">Lost</span> by our logistics partner, we will resend the same item to you.
                                            No refunds will be issued in such cases.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-blue-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">💳 Refund Process for Canceled Orders</h3>
                                        <p className="text-gray-600">
                                            If we cancel an order for any reason (including prepaid orders), we will process a refund within <span className="font-semibold">24 hours</span>.
                                            The amount will be credited back to your original payment method within <span className="font-semibold">7-10 business days</span>.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h3 className="text-lg font-medium text-gray-800">🔄 Wrong Product Received</h3>
                                        <p className="text-gray-600">
                                            If you receive the wrong product, please contact our customer service team immediately.
                                            We will initiate a return and ensure the correct product is shipped to you.
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

export default RefundandReturn