'use client'
import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer'
import '@splidejs/react-splide/css';

const PrivacyPolicy = () => {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Privacy Policy' subHeading='Privacy Policy' />
            </div>
            <div className='about md:pt-20 pt-10'>
                <div className="about-us-block">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text flex items-center justify-center">
                            <div className="content md:w-5/6 pb-10 w-full">

                                <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔒 Privacy Policy</h2>

                                    <p className="text-gray-600 mb-4">
                                        Your privacy is important to us. By using our website, you consent to the collection and use of your personal information as described in this policy.
                                    </p>

                                    <div className="border-l-4 border-blue-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">📋 Information Collection</h3>
                                        <p className="text-gray-600">
                                            We collect basic user details such as <span className="font-semibold">first name, last name, and email</span>.
                                            This information is stored securely on our servers to facilitate your orders and communication with us.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-red-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">🗑️ Data Deletion</h3>
                                        <p className="text-gray-600">
                                            If you wish to delete your account and personal information, you can contact our <span className="font-semibold">customer support</span> team at any time.
                                            Requests for data deletion will be processed within <span className="font-semibold">90 days</span>, and you will receive a confirmation once completed.
                                        </p>
                                    </div>
                                </div>

                                <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">📞 Customer Service & Contact Information</h2>

                                    <p className="text-gray-600 mb-4">
                                        For any issues, questions, or claims, our customer service team is available to assist you. Please reach out via:
                                    </p>

                                    <div className="border-l-4 border-green-500 pl-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">📧 Email</h3>
                                        <p className="text-gray-600">
                                            <a href="mailto:customer.support@malukforever.com" className="text-blue-600 hover:underline">
                                                customer.support@malukforever.com
                                            </a>
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-yellow-500 pl-4">
                                        <h3 className="text-lg font-medium text-gray-800">📞 Phone</h3>
                                        <p className="text-gray-600">
                                            <a href="tel:+918588801711" className="text-blue-600 hover:underline">+91 85888 01711</a>
                                        </p>
                                    </div>

                                    <p className="text-gray-600 mt-4">
                                        We appreciate your trust in <span className="font-semibold">Maluk Forever</span>, and we are here to make your shopping experience as smooth as possible.
                                        If you have any further questions, don’t hesitate to contact us.
                                    </p>

                                    <p className="text-gray-800 font-semibold mt-4">Thank you for choosing Maluk Forever! 🌟</p>
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

export default PrivacyPolicy