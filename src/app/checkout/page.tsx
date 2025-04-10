"use client";

import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/lib/authContext";

interface Product {
  name: string;
  price: number;
  salePrice: number;
  quantity: number;
  thumbnails: string[];
  sku: string;
  _id?: string;
}


interface PhonePeCheckout {
  transact: (options: {
    tokenUrl: string;
    callback: (response: string) => void;
    type: "IFRAME";
  }) => void;
}

declare global {
  interface Window {
    PhonePeCheckout?: PhonePeCheckout;
  }
}

interface Address {
  name: string;
  lastname: string;
  companyName?: string;
  country: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  type: "Shipping" | "Billing";
  isDefault?: boolean;
  _id?: string;
}

interface FormData {
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface PincodeAvailability {
  isServiceable: boolean;
  shippingCost: number;
  message?: string;
  shippingDetails?: any;
}

interface PincodeDetails {
  success: boolean;
  city?: string;
  state?: string;
  message?: string;
}

const fillFormDataFromAddress = (address: Address, type: "shipping" | "billing"): FormData => {
  return {
    email: address.email,
    country: address.country,
    firstName: address.name,
    lastName: address.lastname,
    address: address.streetAddress,
    apartment: address.apartment || "",
    city: address.city,
    state: address.state,
    zipCode: address.zip,
    phone: address.phone.replace("+91", ""),
  };
};

const Checkout: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartState } = useCart();
  const { tokens, logout } = useAuth();

  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [totalCart, setTotalCart] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>("");
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>("");
  const [sameAsShipping, setSameAsShipping] = useState<boolean>(false);
  const [saveAddress, setSaveAddress] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shippingPinCodeStatus, setShippingPinCodeStatus] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponApplied, setIsCouponApplied] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("PhonePe");
  const [isPaymentInitiated, setIsPaymentInitiated] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [isShippingAddressOpen, setIsShippingAddressOpen] = useState<boolean>(false);
  const [isBillingAddressOpen, setIsBillingAddressOpen] = useState<boolean>(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);
  const [isPhonePeLoaded, setIsPhonePeLoaded] = useState<boolean>(false);

  const [shippingFormData, setShippingFormData] = useState<FormData>({
    email: "",
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [billingFormData, setBillingFormData] = useState<FormData>({
    email: "",
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const PUBLIC_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const ORIGIN_PINCODE = "201301";

  const checkPinCodeAvailability = async (orgPincode: string, desPincode: string): Promise<PincodeAvailability> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shipping/verify-pincode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
        },
        body: JSON.stringify({ orgPincode, desPincode }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        return {
          isServiceable: true,
          shippingCost: result.shippingDetails?.shippingCost || 50,
          shippingDetails: result.shippingDetails,
        };
      }
      return { isServiceable: false, shippingCost: 0, message: result.message || "Service not available" };
    } catch (error) {
      console.error("Error verifying pincode:", error);
      return { isServiceable: false, shippingCost: 0, message: "Error checking pincode availability" };
    }
  };

  const fetchPincodeDetails = async (pincode: string): Promise<PincodeDetails> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shipping/pincode-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
        },
        body: JSON.stringify({ pincode }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        return { success: true, city: result.details.city, state: result.details.state };
      }
      return { success: false, message: result.message || "Pincode details not found" };
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      return { success: false, message: "Error fetching pincode details" };
    }
  };

  const handleApplyCoupon = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCouponApplied) return;
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
        },
        body: JSON.stringify({ code: couponCode, orderAmount: totalCart }),
      });

      const result = await response.json();

      if (response.ok) {
        setDiscountAmount(result.discountAmount);
        setCouponError(null);
        setIsCouponApplied(true);
      } else {
        setDiscountAmount(0);
        setCouponError(result.error || "Invalid coupon code");
      }
    } catch (error) {
      setDiscountAmount(0);
      setCouponError("Error applying coupon. Please try again.");
      console.error("Error applying coupon:", error);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://mercury.phonepe.com/web/bundle/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("PhonePe Checkout script loaded");
      setIsPhonePeLoaded(true);
    };
    script.onerror = () => console.error("Failed to load PhonePe Checkout script");
    document.body.appendChild(script);

    setIsLoading(true);
    setIsLoggedIn(!!tokens?.accessToken);

    const fetchStates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/shipping/states`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
          },
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setStates(result.states);
        } else {
          console.error("Failed to fetch states:", result.error);
          setStates([]);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
        setStates([]);
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        });
        if (response.ok) {
          const user = await response.json();
          setUserEmail(user.email);
          setShippingFormData((prev) => ({
            ...prev,
            email: user.email,
            phone: user.phone?.replace("+91", "") || "",
          }));
          setBillingFormData((prev) => ({
            ...prev,
            email: user.email,
            phone: user.phone?.replace("+91", "") || "",
          }));
        } else if (response.status === 401) {
          logout();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/address`, {
          headers: { Authorization: `Bearer ${tokens?.accessToken}` },
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setSavedAddresses(data);
        } else {
          setSavedAddresses([]);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setSavedAddresses([]);
      }
    };

    if (tokens?.accessToken) {
      Promise.all([fetchStates(), fetchUserData(), fetchAddresses()]).finally(() => setIsLoading(false));
    } else {
      fetchStates().finally(() => setIsLoading(false));
    }

    const discount = Number(searchParams.get("discount")) || 0;
    const ship = Number(searchParams.get("ship")) || 0;
    const coupon = searchParams.get("coupon") || "";
    if (coupon && discount > 0) {
      setCouponCode(coupon);
      setDiscountAmount(discount);
      setIsCouponApplied(true);
    }
    setShippingCost(ship);

    const productParam = searchParams.get("product");
    if (productParam) {
      try {
        const decodedProductDetails: Product = JSON.parse(decodeURIComponent(productParam));
        setProductDetails(decodedProductDetails);
        const { price, salePrice, quantity } = decodedProductDetails;
        setTotalCart(salePrice * quantity);
        if (price > salePrice) setTotalSavings((price - salePrice) * quantity);
      } catch (error) {
        console.error("Error parsing product details:", error);
      }
    } else {
      let total = 0;
      let savings = 0;
      cartState.cartArray.forEach((item) => {
        total += item.salePrice * item.quantity;
        if (item.price > item.salePrice) savings += (item.price - item.salePrice) * item.quantity;
      });
      setTotalCart(total);
      setTotalSavings(savings);
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [tokens, searchParams, cartState.cartArray, logout]);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");

    if (orderId && status === "pending" && tokens?.accessToken) {
      setPaymentStatusMessage("Payment is being processed. Please wait...");
      const checkStatus = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/phonepe/check-payment-status?orderId=${orderId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          });
          const data = await response.json();
          console.log("Checkout - Payment status check response:", data);

          if (data.success) {
            router.push(`/order-confirmation?orderId=${data.orderId}&transactionId=${data.transactionId}&status=success`);
          } else if (data.status === "failed") {
            router.push(`/payment-failure?orderId=${orderId}&error=PaymentFailed®ion=${encodeURIComponent(data.region || "")}`);
          }
        } catch (error) {
          console.error("Checkout - Error checking payment status:", error);
          setPaymentStatusMessage("Error checking payment status. Please try again later.");
        }
      };

      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [searchParams, router, tokens]);

  useEffect(() => {
    if (sameAsShipping) {
      setBillingFormData({ ...shippingFormData });
      setSelectedBillingAddress("");
    }
  }, [sameAsShipping, shippingFormData]);

  useEffect(() => {
    if (selectedShippingAddress && isShippingAddressOpen) {
      const address = savedAddresses.find((addr) => addr._id === selectedShippingAddress);
      if (address) {
        setShippingFormData(fillFormDataFromAddress(address, "shipping"));
        checkPinCodeAvailability(ORIGIN_PINCODE, address.zip).then(({ isServiceable, shippingCost, message }) => {
          setShippingCost(isServiceable ? shippingCost : 0);
          setShippingPinCodeStatus(isServiceable ? "Services available" : message || "Service not available");
        });
        setIsShippingAddressOpen(false);
      }
    }
    if (selectedBillingAddress && !sameAsShipping && isBillingAddressOpen) {
      const address = savedAddresses.find((addr) => addr._id === selectedBillingAddress);
      if (address) {
        setBillingFormData(fillFormDataFromAddress(address, "billing"));
        setIsBillingAddressOpen(false);
      }
    }
  }, [selectedShippingAddress, selectedBillingAddress, sameAsShipping, savedAddresses, isShippingAddressOpen, isBillingAddressOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: "shipping" | "billing") => {
    const { id, value } = e.target;
    if (type === "shipping") {
      setShippingFormData((prev) => ({ ...prev, [id]: value }));
      setSelectedShippingAddress("");
    } else {
      setBillingFormData((prev) => ({ ...prev, [id]: value }));
      if (!sameAsShipping) setSelectedBillingAddress("");
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, type: "shipping" | "billing") => {
    const { name, value } = e.target;
    if (type === "shipping") {
      setShippingFormData((prev) => ({ ...prev, [name]: value }));
      setSelectedShippingAddress("");
    } else {
      setBillingFormData((prev) => ({ ...prev, [name]: value }));
      if (!sameAsShipping) setSelectedBillingAddress("");
    }
  };

  const handlePinCodeChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "shipping" | "billing") => {
    const { value } = e.target;
    if (type === "shipping") {
      setShippingFormData((prev) => ({ ...prev, zipCode: value }));
      setSelectedShippingAddress("");
      if (value.length === 6) {
        const pincodeDetails = await fetchPincodeDetails(value);
        if (pincodeDetails.success) {
          setShippingFormData((prev) => ({
            ...prev,
            city: pincodeDetails.city || "",
            state: pincodeDetails.state || "",
          }));
        } else {
          setShippingFormData((prev) => ({ ...prev, city: "", state: "" }));
          console.warn(pincodeDetails.message);
        }

        const { isServiceable, shippingCost, message } = await checkPinCodeAvailability(ORIGIN_PINCODE, value);
        setShippingCost(isServiceable ? shippingCost : 0);
        setShippingPinCodeStatus(isServiceable ? "Services available" : message || "Service not available");
      } else {
        setShippingPinCodeStatus(null);
        setShippingCost(0);
        setShippingFormData((prev) => ({ ...prev, city: "", state: "" }));
      }
    } else {
      setBillingFormData((prev) => ({ ...prev, zipCode: value }));
      if (!sameAsShipping) setSelectedBillingAddress("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, type: "shipping" | "billing") => {
    const { value } = e.target;
    const digitsOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
    if (type === "shipping") {
      setShippingFormData((prev) => ({ ...prev, phone: digitsOnly }));
      setSelectedShippingAddress("");
    } else {
      setBillingFormData((prev) => ({ ...prev, phone: digitsOnly }));
      if (!sameAsShipping) setSelectedBillingAddress("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUserEmail("");
    setSavedAddresses([]);
    setSelectedShippingAddress("");
    setSelectedBillingAddress("");
    setShippingFormData({
      email: "",
      country: "India",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    });
    setBillingFormData({
      email: "",
      country: "India",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    });
    setShippingPinCodeStatus(null);
    setShippingCost(0);
  };

  const handleLogin = () => {
    router.push("/login?redirect=/pages/checkout");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPaymentInitiated(true);
    setPaymentError(null);

    if (!tokens?.accessToken) {
      router.push("/login?redirect=/pages/checkout");
      setIsPaymentInitiated(false);
      return;
    }

    if (!shippingPinCodeStatus || shippingPinCodeStatus !== "Services available") {
      setPaymentError("Please enter a valid, serviceable shipping pincode.");
      setIsPaymentInitiated(false);
      return;
    }

    const items = productDetails
      ? [
          {
            name: productDetails.name,
            price: productDetails.salePrice,
            quantity: productDetails.quantity,
            productId: productDetails._id || "single_product",
            thumbnail: productDetails.thumbnails[0],
          },
        ]
      : cartState.cartArray.map((item) => ({
          name: item.name,
          price: item.salePrice,
          quantity: item.quantity,
          productId: item._id || item.sku,
          thumbnail: item.thumbnails[0],
        }));

    const shippingAddress: Address = selectedShippingAddress
      ? savedAddresses.find((addr) => addr._id === selectedShippingAddress)!
      : {
          name: shippingFormData.firstName,
          lastname: shippingFormData.lastName,
          country: shippingFormData.country,
          streetAddress: shippingFormData.address,
          apartment: shippingFormData.apartment,
          city: shippingFormData.city,
          state: shippingFormData.state,
          zip: shippingFormData.zipCode,
          phone: shippingFormData.phone.startsWith("+91") ? shippingFormData.phone : `+91${shippingFormData.phone}`,
          email: shippingFormData.email,
          type: "Shipping",
          isDefault: savedAddresses.length === 0,
        };

    const billingAddress: Address = sameAsShipping
      ? shippingAddress
      : selectedBillingAddress
      ? savedAddresses.find((addr) => addr._id === selectedBillingAddress)!
      : {
          name: billingFormData.firstName,
          lastname: billingFormData.lastName,
          country: billingFormData.country,
          streetAddress: billingFormData.address,
          apartment: billingFormData.apartment,
          city: billingFormData.city,
          state: billingFormData.state,
          zip: billingFormData.zipCode,
          phone: billingFormData.phone.startsWith("+91") ? billingFormData.phone : `+91${billingFormData.phone}`,
          email: billingFormData.email || shippingFormData.email,
          type: "Billing",
          isDefault: savedAddresses.filter((addr) => addr.type === "Billing").length === 0,
        };

    if (!shippingFormData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setPaymentError("Please provide a valid email address.");
      setIsPaymentInitiated(false);
      return;
    }
    if (shippingFormData.phone.length !== 10) {
      setPaymentError("Please provide a valid 10-digit phone number for shipping.");
      setIsPaymentInitiated(false);
      return;
    }
    if (!billingAddress.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setPaymentError("Please provide a valid email for billing.");
      setIsPaymentInitiated(false);
      return;
    }
    if (billingFormData.phone.length !== 10 && !sameAsShipping && !selectedBillingAddress) {
      setPaymentError("Please provide a valid 10-digit phone number for billing.");
      setIsPaymentInitiated(false);
      return;
    }

    const orderData = {
      products: items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      orgPincode: ORIGIN_PINCODE,
      desPincode: shippingAddress.zip,
      consignments: [
        {
          pieceCount: items.length,
          pickupPincode: ORIGIN_PINCODE,
          deliveryPincode: shippingAddress.zip,
          weight: "0.5",
          customerName: `${shippingAddress.name} ${shippingAddress.lastname}`,
          customerEmail: shippingAddress.email,
        },
      ],
      totalAmount: totalCart,
      shippingCost,
      couponCode: discountAmount > 0 ? couponCode : undefined,
      discountAmount,
      saveAddress,
    };

    const endpoint =
      paymentMethod === "PhonePe"
        ? `${API_BASE_URL}/api/phonepe/initiate-phonepe`
        : `${API_BASE_URL}/api/orders/create-order`;

    try {
      console.log("Frontend - Submitting order data:", JSON.stringify(orderData, null, 2));
      const orderResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to process order");
      }

      const orderResult = await orderResponse.json();
      console.log("Frontend - Order response:", orderResult);

      if (paymentMethod === "COD") {
        router.push(`/pages/order-confirmation?orderId=${orderResult.orderId}`);
        setIsPaymentInitiated(false);
        return;
      }

      if (paymentMethod === "PhonePe" && orderResult.paymentUrl) {
  if (isPhonePeLoaded && window.PhonePeCheckout && window.PhonePeCheckout.transact) { // Fixed typo here
    window.PhonePeCheckout.transact({
      tokenUrl: orderResult.paymentUrl,
      callback: (response) => {
        setIsPaymentInitiated(false);
        if (response === "USER_CANCEL") {
          setPaymentError("Payment was canceled by the user.");
          console.log("Payment canceled by user");
        } else if (response === "CONCLUDED") {
          setPaymentStatusMessage("Payment processing. Please wait...");
          console.log("Payment concluded, awaiting backend verification");
        }
      },
      type: "IFRAME",
    });
  } else {
    setPaymentError("PhonePe payment module is not ready. Please wait or refresh the page.");
    setIsPaymentInitiated(false);
  }
}
      
      else {
        throw new Error("Payment URL not provided for PhonePe");
      }
    } catch (error: any) {
      console.error("Frontend - Checkout Error:", error);
      setPaymentError(`Checkout failed: ${error.message}. Please try again.`);
      setIsPaymentInitiated(false);
    }
  };

  if (!productDetails && !cartState.cartArray.length) {
    return <div>Loading...</div>;
  }

  const finalAmount = totalCart + shippingCost - discountAmount;

  return (
    <>
      <div id="header" className="relative w-full">
        <div className="header-menu style-one fixed top-0 left-0 right-0 w-full md:h-[74px] h-[56px]">
          <div className="container mx-auto h-full">
            <div className="header-main flex items-center justify-between h-full">
              <Link href="/" className="flex items-center">
                <div className="heading4">
                  <img src="/logo.png" alt="Logo" className="h-[4.5rem] w-auto" />
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/cart">
                  <button className="max-md:hidden cart-icon flex items-center relative h-fit cursor-pointer">
                    <Icon.Handbag size={24} color="black" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="checkout-block relative md:pt-[74px] pt-[56px]">
        <div className="content-main flex max-lg:flex-col-reverse justify-between">
          <div className="left flex lg:justify-end w-full">
            <div className="lg:max-w-[716px] flex-shrink-0 w-full lg:pt-20 pt-12 lg:pr-[70px] pl-[16px] max-lg:pr-[16px]">
              {isLoading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {paymentStatusMessage && (
                    <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg flex items-center">
                      <Icon.Spinner className="animate-spin mr-2" />
                      {paymentStatusMessage}
                    </div>
                  )}
                  <div className="login flex justify-between gap-4">
                    <h4 className="heading4">Contact</h4>
                    {isLoggedIn ? (
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-button underline"
                        type="button"
                      >
                        <Icon.SignOut size={24} />
                        Logout
                      </button>
                    ) : (
                      <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 text-button underline"
                        type="button"
                      >
                        <Icon.SignIn size={24} />
                        Login
                      </button>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      className="border-line mt-5 px-4 py-3 w-full rounded-lg"
                      placeholder="Email"
                      id="email"
                      value={shippingFormData.email}
                      onChange={(e) => handleInputChange(e, "shipping")}
                      required
                    />
                    <div className="flex items-center mt-5">
                      <div className="block-input">
                        <input type="checkbox" name="remember" id="remember" />
                        <Icon.CheckSquare weight="fill" className="icon-checkbox text-2xl" />
                      </div>
                      <label htmlFor="remember" className="pl-2 cursor-pointer">
                        Email me with news and offers
                      </label>
                    </div>
                  </div>
                  <div className="information md:mt-10 mt-6">
                    <div className="heading5 flex items-center justify-between">
                      Shipping Address
                      {isLoggedIn && savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsShippingAddressOpen(!isShippingAddressOpen)}
                          className="text-2xl"
                        >
                          <Icon.Plus weight="bold" />
                        </button>
                      )}
                    </div>
                    {isLoggedIn && savedAddresses.length > 0 && isShippingAddressOpen && (
                      <div className="mt-4 relative">
                        <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          {savedAddresses
                            .filter((addr) => addr.type === "Shipping")
                            .map((addr) => (
                              <div
                                key={addr._id}
                                className="p-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                                onClick={() => setSelectedShippingAddress(addr._id || "")}
                              >
                                <div className="text-sm font-medium">
                                  {addr.name} {addr.lastname}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {addr.streetAddress}
                                  {addr.apartment ? `, ${addr.apartment}` : ""}, {addr.city}, {addr.state}, {addr.zip}
                                </div>
                                <div className="text-sm text-gray-600">Phone: {addr.phone.replace("+91", "")}</div>
                                <div className="text-sm text-gray-600">Email: {addr.email}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    <div className="form-checkout mt-5">
                      <div className="grid sm:grid-cols-2 gap-4 gap-y-5 flex-wrap">
                        <div className="col-span-full">
                          <input
                            className="border-line px-4 py-3 w-full rounded-lg bg-gray-100"
                            id="country"
                            type="text"
                            value="India"
                            readOnly
                          />
                        </div>
                        <div>
                          <input
                            className="border-line px-4 py-3 w-full rounded-lg"
                            id="firstName"
                            type="text"
                            placeholder="First Name"
                            value={shippingFormData.firstName}
                            onChange={(e) => handleInputChange(e, "shipping")}
                            required
                          />
                        </div>
                        <div>
                          <input
                            className="border-line px-4 py-3 w-full rounded-lg"
                            id="lastName"
                            type="text"
                            placeholder="Last Name"
                            value={shippingFormData.lastName}
                            onChange={(e) => handleInputChange(e, "shipping")}
                            required
                          />
                        </div>
                        <div className="col-span-full relative">
                          <input
                            className="border-line pl-4 pr-12 py-3 w-full rounded-lg"
                            id="address"
                            type="text"
                            placeholder="Address"
                            value={shippingFormData.address}
                            onChange={(e) => handleInputChange(e, "shipping")}
                            required
                          />
                          <Icon.MagnifyingGlass className="text-xl absolute top-1/2 -translate-y-1/2 right-5" />
                        </div>
                        <div>
                          <input
                            className="border-line px-4 py-3 w-full rounded-lg"
                            id="apartment"
                            type="text"
                            placeholder="Apartment, suite, etc. (optional)"
                            value={shippingFormData.apartment}
                            onChange={(e) => handleInputChange(e, "shipping")}
                          />
                        </div>
                        <div>
                          <input
                            className="border-line px-4 py-3 w-full rounded-lg"
                            id="city"
                            type="text"
                            placeholder="City"
                            value={shippingFormData.city}
                            onChange={(e) => handleInputChange(e, "shipping")}
                            required
                          />
                        </div>
                        <div className="select-block">
                          <select
                            className="border border-line px-4 py-3 w-full rounded-lg"
                            id="state"
                            name="state"
                            value={shippingFormData.state}
                            onChange={(e) => handleSelectChange(e, "shipping")}
                            required
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                          <Icon.CaretDown className="arrow-down" />
                        </div>
                        <div>
                          <input
                            className="border-line px-4 py-3 w-full rounded-lg"
                            id="zipCode"
                            type="text"
                            placeholder="Pin Code"
                            value={shippingFormData.zipCode}
                            onChange={(e) => handlePinCodeChange(e, "shipping")}
                            maxLength={6}
                            required
                          />
                          {shippingPinCodeStatus && (
                            <span
                              className={`text-sm mt-1 block ${
                                shippingPinCodeStatus === "Services available" ? "text-[#3cbf5a]" : "text-red"
                              }`}
                            >
                              {shippingPinCodeStatus}
                            </span>
                          )}
                        </div>
                        <div className="col-span-full">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                            <input
                              className="border-line pl-12 pr-4 py-3 w-full rounded-lg"
                              id="phone"
                              type="text"
                              placeholder="Phone (10 digits)"
                              value={shippingFormData.phone}
                              onChange={(e) => handlePhoneChange(e, "shipping")}
                              maxLength={10}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="information md:mt-10 mt-6">
                    <div className="heading5 flex items-center justify-between">
                      Billing Address
                      {isLoggedIn && savedAddresses.length > 0 && !sameAsShipping && (
                        <button
                          type="button"
                          onClick={() => setIsBillingAddressOpen(!isBillingAddressOpen)}
                          className="text-2xl"
                        >
                          <Icon.Plus weight="bold" />
                        </button>
                      )}
                    </div>
                    <div className="form-checkout mt-5">
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => setSameAsShipping(e.target.checked)}
                          className="mr-2"
                        />
                        Same as shipping address
                      </label>
                      {!sameAsShipping && (
                        <>
                          {isLoggedIn && savedAddresses.length > 0 && isBillingAddressOpen && (
                            <div className="mt-4 relative">
                              <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {savedAddresses
                                  .filter((addr) => addr.type === "Billing")
                                  .map((addr) => (
                                    <div
                                      key={addr._id}
                                      className="p-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => setSelectedBillingAddress(addr._id || "")}
                                    >
                                      <div className="text-sm font-medium">
                                        {addr.name} {addr.lastname}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {addr.streetAddress}
                                        {addr.apartment ? `, ${addr.apartment}` : ""}, {addr.city}, {addr.state}, {addr.zip}
                                      </div>
                                      <div className="text-sm text-gray-600">Phone: {addr.phone.replace("+91", "")}</div>
                                      <div className="text-sm text-gray-600">Email: {addr.email}</div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          <div className="grid sm:grid-cols-2 gap-4 gap-y-5 flex-wrap">
                            <div className="col-span-full">
                              <input
                                className="border-line px-4 py-3 w-full rounded-lg bg-gray-100"
                                id="country"
                                type="text"
                                value="India"
                                readOnly
                              />
                            </div>
                            <div>
                              <input
                                className="border-line px-4 py-3 w-full rounded-lg"
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                value={billingFormData.firstName}
                                onChange={(e) => handleInputChange(e, "billing")}
                                required
                              />
                            </div>
                            <div>
                              <input
                                className="border-line px-4 py-3 w-full rounded-lg"
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                value={billingFormData.lastName}
                                onChange={(e) => handleInputChange(e, "billing")}
                                required
                              />
                            </div>
                            <div className="col-span-full relative">
                              <input
                                className="border-line pl-4 pr-12 py-3 w-full rounded-lg"
                                id="address"
                                type="text"
                                placeholder="Address"
                                value={billingFormData.address}
                                onChange={(e) => handleInputChange(e, "billing")}
                                required
                              />
                              <Icon.MagnifyingGlass className="text-xl absolute top-1/2 -translate-y-1/2 right-5" />
                            </div>
                            <div>
                              <input
                                className="border-line px-4 py-3 w-full rounded-lg"
                                id="apartment"
                                type="text"
                                placeholder="Apartment, suite, etc. (optional)"
                                value={billingFormData.apartment}
                                onChange={(e) => handleInputChange(e, "billing")}
                              />
                            </div>
                            <div>
                              <input
                                className="border-line px-4 py-3 w-full rounded-lg"
                                id="city"
                                type="text"
                                placeholder="City"
                                value={billingFormData.city}
                                onChange={(e) => handleInputChange(e, "billing")}
                                required
                              />
                            </div>
                            <div className="select-block">
                              <select
                                className="border border-line px-4 py-3 w-full rounded-lg"
                                id="state"
                                name="state"
                                value={billingFormData.state}
                                onChange={(e) => handleSelectChange(e, "billing")}
                                required
                              >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                  <option key={state} value={state}>
                                    {state}
                                  </option>
                                ))}
                              </select>
                              <Icon.CaretDown className="arrow-down" />
                            </div>
                            <div>
                              <input
                                className="border-line px-4 py-3 w-full rounded-lg"
                                id="zipCode"
                                type="text"
                                placeholder="Pin Code"
                                value={billingFormData.zipCode}
                                onChange={(e) => handlePinCodeChange(e, "billing")}
                                maxLength={6}
                                required
                              />
                            </div>
                            <div className="col-span-full">
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                                <input
                                  className="border-line pl-12 pr-4 py-3 w-full rounded-lg"
                                  id="phone"
                                  type="text"
                                  placeholder="Phone (10 digits)"
                                  value={billingFormData.phone}
                                  onChange={(e) => handlePhoneChange(e, "billing")}
                                  maxLength={10}
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-span-full">
                              <input
                                className="border-line px-4 py-3 w-full rounded-lg"
                                id="email"
                                type="email"
                                placeholder="Email"
                                value={billingFormData.email}
                                onChange={(e) => handleInputChange(e, "billing")}
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {isLoggedIn && (
                        <label className="flex items-center mt-5">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="mr-2"
                          />
                          Save these addresses
                        </label>
                      )}
                      <h4 className="heading4 md:mt-10 mt-6">Payment Method</h4>
                      <div className="mt-5">
                        <label className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="PhonePe"
                            checked={paymentMethod === "PhonePe"}
                            onChange={() => setPaymentMethod("PhonePe")}
                            className="mr-2"
                          />
                          PhonePe (UPI, Cards, Net Banking, Wallets)
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="COD"
                            checked={paymentMethod === "COD"}
                            onChange={() => setPaymentMethod("COD")}
                            className="mr-2"
                          />
                          Cash on Delivery
                        </label>
                      </div>
                      <h4 className="heading4 md:mt-10 mt-6">Shipping Method</h4>
                      <div className="body1 text-secondary2 py-6 px-5 border border-line rounded-lg bg-surface mt-5">
                        Standard Shipping (₹{shippingCost.toFixed(2)})
                      </div>
                      {paymentError && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                          {paymentError}
                        </div>
                      )}
                      <div className="block-button md:mt-10 mt-6">
                        <button
                          type="submit"
                          className="button-main hover:bg-green w-full tracking-widest"
                          disabled={isPaymentInitiated || !!paymentStatusMessage}
                        >
                          {isPaymentInitiated ? (
                            <span className="flex items-center justify-center">
                              <Icon.Spinner className="animate-spin mr-2" />
                              Processing...
                            </span>
                          ) : paymentMethod === "PhonePe" ? "Proceed to Payment" : "Place Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
              <div className="copyright caption1 md:mt-20 mt-12 py-3 border-t border-line">
                ©2025 Malukforever. All Rights Reserved.
              </div>
            </div>
          </div>
          <div className="right justify-start flex-shrink-0 lg:w-[47%] bg-surface lg:py-20 py-12">
            <div className="lg:sticky lg:top-24 h-fit lg:max-w-[606px] w-full flex-shrink-0 lg:pl-[80px] pr-[16px] max-lg:pl-[16px]">
              <div className="list_prd flex flex-col gap-7">
                {productDetails ? (
                  <div className="item flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="bg_img relative flex-shrink-0 w-[100px] h-[100px]">
                        <img
                          src={productDetails.thumbnails[0]}
                          alt={productDetails.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <span className="quantity flex items-center justify-center absolute -top-3 -right-3 w-7 h-7 rounded-full bg-black text-white">
                          {productDetails.quantity}
                        </span>
                      </div>
                      <div>
                        <strong className="name text-title">{productDetails.name}</strong>
                        <div className="flex items-center gap-2 mt-2">
                          <Icon.Tag className="text-secondary" />
                          <span className="code text-secondary">
                            {productDetails.sku}{" "}
                            <span className="discount">
                              (-₹{(productDetails.price - productDetails.salePrice).toFixed(2)})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <del className="caption1 text-secondary text-end org_price">
                        ₹{productDetails.price.toFixed(2)}
                      </del>
                      <strong className="text-title price">₹{productDetails.salePrice.toFixed(2)}</strong>
                    </div>
                  </div>
                ) : (
                  cartState.cartArray.map((item, index) => (
                    <div key={index} className="item flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="bg_img relative flex-shrink-0 w-[100px] h-[100px]">
                          <img src={item.thumbnails[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          <span className="quantity flex items-center justify-center absolute -top-3 -right-3 w-7 h-7 rounded-full bg-black text-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <strong className="name text-title">{item.name}</strong>
                          <div className="flex items-center gap-2 mt-2">
                            <Icon.Tag className="text-secondary" />
                            <span className="code text-secondary">
                              {item.sku}{" "}
                              <span className="discount">(-₹{(item.price - item.salePrice).toFixed(2)})</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <del className="caption1 text-secondary text-end org_price">₹{item.price.toFixed(2)}</del>
                        <strong className="text-title price">₹{item.salePrice.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form className="form_discount flex gap-3 mt-8" onSubmit={handleApplyCoupon}>
                <input
                  type="text"
                  placeholder="Discount code"
                  className="w-full border border-line rounded-lg px-4"
                  value={couponCode}
                  onChange={(e) => !isCouponApplied && setCouponCode(e.target.value)}
                  disabled={isCouponApplied}
                />
                <button type="submit" className="flex-shrink-0 button-main hover:bg-green bg-black" disabled={isCouponApplied}>
                  Apply
                </button>
              </form>
              {couponError && !isCouponApplied && <p className="text-red text-sm mt-2">{couponError}</p>}
              {discountAmount > 0 && (
                <p className="text-[#3cbf5a] text-sm mt-2">
                  Coupon {couponCode} applied! Discount: ₹{discountAmount.toFixed(2)}
                </p>
              )}
              <div className="subtotal flex items-center justify-between mt-8">
                <strong className="heading6">Subtotal</strong>
                <strong className="heading6">₹{totalCart.toFixed(2)}</strong>
              </div>
              <div className="ship-block flex items-center justify-between mt-4">
                <strong className="heading6">Shipping</strong>
                <span className="body1 text-secondary">₹{shippingCost.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="discount-block flex items-center justify-between mt-4">
                  <strong className="heading6">Discount</strong>
                  <span className="body1 text-[#3cbf5a]">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="total-cart-block flex items-center justify-between mt-4">
                <strong className="heading4">Total</strong>
                <div className="flex items-end gap-2">
                  <span className="body1 text-secondary">INR</span>
                  <strong className="heading4">₹{finalAmount.toFixed(2)}</strong>
                </div>
              </div>
              <div className="total-saving-block flex items-center gap-2 mt-4">
                <Icon.Tag weight="bold" className="text-xl" />
                <strong className="heading5">TOTAL SAVINGS</strong>
                <strong className="heading5">₹{(totalSavings + discountAmount).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;