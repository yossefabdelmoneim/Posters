import React, { createContext, useContext, useState } from "react";

const CheckoutContext = createContext();

export const CheckoutProvider = ({ children }) => {
    const [checkoutData, setCheckoutData] = useState({
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        governorate: "",
        postalCode: "",
        notes: "",
        paymentMethod: "cod",
        shippingMethod: "standard",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const updateCheckoutData = (newData) => {
        setCheckoutData(prev => ({
            ...prev,
            ...newData
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!checkoutData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(checkoutData.email)) {
            newErrors.email = "Email is invalid";
        }

        // Phone validation
        if (!checkoutData.phone) {
            newErrors.phone = "Phone number is required";
        } else if (checkoutData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = "Phone number is invalid";
        }

        // Required fields validation
        const requiredFields = ['firstName', 'lastName', 'address', 'city', 'governorate'];
        requiredFields.forEach(field => {
            if (!checkoutData[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const processOrder = async (cartItems, totalAmount) => {
        setLoading(true);
        setErrors({});

        try {
            if (!validateForm()) {
                throw new Error("Please fix form errors before submitting");
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate order number
            const orderNumber = `FLXR-${Date.now().toString().slice(-8)}`;

            const order = {
                orderNumber,
                items: cartItems,
                total: totalAmount,
                customerInfo: {
                    email: checkoutData.email,
                    phone: checkoutData.phone,
                    shippingAddress: {
                        firstName: checkoutData.firstName,
                        lastName: checkoutData.lastName,
                        address: checkoutData.address,
                        city: checkoutData.city,
                        governorate: checkoutData.governorate,
                        postalCode: checkoutData.postalCode,
                        notes: checkoutData.notes
                    }
                },
                payment: {
                    method: checkoutData.paymentMethod,
                },
                status: "confirmed",
                createdAt: new Date().toISOString()
            };

            console.log("Order processed:", order);

            updateCheckoutData({
                orderNumber,
            });

            return order;

        } catch (error) {
            console.error("Order processing error:", error);
            setErrors({ submit: error.message });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearCheckoutData = () => {
        setCheckoutData({
            email: "",
            phone: "",
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            governorate: "",
            postalCode: "",
            notes: "",
            paymentMethod: "cod",
            shippingMethod: "standard",
        });
        setErrors({});
    };

    const setFieldError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };

    const clearFieldError = (field) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const value = {
        checkoutData,
        updateCheckoutData,
        loading,
        errors,
        validateForm,
        processOrder,
        clearCheckoutData,
        setFieldError,
        clearFieldError
    };

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};