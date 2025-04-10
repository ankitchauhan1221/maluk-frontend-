'use client'
import React, { useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define the type for form data
interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error(result.error || 'Failed to send message', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error sending message', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Contact us" subHeading="Contact us" />
      </div>
      <div className="contact-us md:py-20 py-10">
        <div className="container">
          <div className="flex justify-between max-lg:flex-col gap-y-10">
            <div className="left lg:w-2/3 lg:pr-4">
              <div className="heading3">Drop Us A Line</div>
              <div className="body1 text-secondary2 mt-3">Use the form below to get in touch with the sales team</div>
              <form className="md:mt-6 mt-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 gap-y-5">
                  <div className="name">
                    <input
                      className="border-line px-4 py-3 w-full rounded-lg"
                      id="name"
                      type="text"
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="email">
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="email"
                      type="email"
                      placeholder="Your Email *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="message sm:col-span-2">
                    <textarea
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="message"
                      rows={3}
                      placeholder="Your Message *"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="block-button md:mt-6 mt-4">
                  <button 
                    className="button-main hover:bg-green disabled:opacity-50" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            </div>
            <div className="right lg:w-1/4 lg:pl-4">
              <div className="item">
                <div className="heading4">Our Store</div>
                <p className="mt-3"> E-169, Lower Ground Part 1, Sector 63 G B Nagar, Noida, Uttar Pradesh, India, 201301</p>
                <p className="mt-3">Phone: <span className="whitespace-nowrap">+91 8588801711</span></p>
                <p className="mt-1">Email: <span className="whitespace-nowrap">operations@malukforever.com</span></p>
              </div>
              <div className="item mt-10">
                <div className="heading4">Open Hours</div>
                <p className="mt-3">Mon - Fri: <span className="whitespace-nowrap">7:30am - 8:00pm PST</span></p>
                <p className="mt-3">Saturday: <span className="whitespace-nowrap">8:00am - 6:00pm PST</span></p>
                <p className="mt-3">Sunday: <span className="whitespace-nowrap">9:00am - 5:00pm PST</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default ContactUs;