import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user, apiCall } = useApp();
    const [cart, setCart] = useState({ items: [], total_amount: 0, total_discount: 0 });
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!user) {
            setCart({ items: [], total_amount: 0, total_discount: 0 });
            return;
        }
        setLoading(true);
        try {
            const res = await apiCall(`get_cart?user_id=${user.id}`);
            if (res.success) {
                setCart(res.data);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
        setLoading(false);
    }, [user, apiCall]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Unified addToCart function that handles both products and donations
    const addToCart = async (item, quantity = 1) => {
        if (!user) {
            alert('Please log in to add items to your cart.');
            return { success: false, message: 'User not logged in' };
        }
        
        // For donations, we handle them differently (no API call needed)
        if (item.type === 'donation') {
            // Check if this donation is already in the cart
            const existingItemIndex = cart.items.findIndex(
                cartItem => cartItem.donation_id === item.donation_id
            );
            
            if (existingItemIndex !== -1) {
                alert('This donation is already in your cart.');
                return { success: false, message: 'Donation already in cart' };
            }
            
            // Add to local cart state
            setCart(prev => ({
                ...prev,
                items: [...prev.items, { ...item, quantity: 1 }],
                total_amount: prev.total_amount + (item.price * 1)
            }));
            
            alert('Donation added to cart!');
            return { success: true };
        }
        
        // Regular product handling - call API
        try {
            const res = await apiCall('add_to_cart', {
                method: 'POST',
                body: { 
                    user_id: user.id, 
                    product_id: item.id || item.product_id, 
                    quantity: quantity 
                },
            });
            
            if (res.success) {
                await fetchCart();
                alert('Item added to cart!');
                return res;
            } else {
                alert(res.message || 'Failed to add item.');
                return res;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item. Please try again.');
            return { success: false, message: 'Network error' };
        }
    };
    
    const updateQuantity = async (itemId, quantity, itemType = 'product') => {
        if (!user) {
            alert('Please log in to update your cart.');
            return { success: false };
        }
        
        // Handle donation items (local state only)
        if (itemType === 'donation') {
            if (quantity === 0) {
                // Remove donation from cart
                setCart(prev => ({
                    ...prev,
                    items: prev.items.filter(item => item.donation_id !== itemId),
                    total_amount: prev.items
                        .filter(item => item.donation_id !== itemId)
                        .reduce((total, item) => total + (item.price * item.quantity), 0)
                }));
                return { success: true };
            }
            
            // Update donation quantity (typically should be 1 for donations)
            setCart(prev => ({
                ...prev,
                items: prev.items.map(item => 
                    item.donation_id === itemId 
                        ? { ...item, quantity: Math.max(1, quantity) } 
                        : item
                ),
                total_amount: prev.items
                    .map(item => 
                        item.donation_id === itemId 
                            ? { ...item, quantity: Math.max(1, quantity) } 
                            : item
                    )
                    .reduce((total, item) => total + (item.price * item.quantity), 0)
            }));
            return { success: true };
        }
        
        // Handle regular products (API call)
        try {
            const res = await apiCall('update_cart', {
                method: 'POST',
                body: { 
                    user_id: user.id, 
                    product_id: itemId, 
                    quantity: quantity 
                }
            });
            
            if (res.success) {
                await fetchCart();
                return res;
            } else {
                alert(res.message || 'Failed to update cart.');
                return res;
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert('Failed to update cart. Please try again.');
            return { success: false, message: 'Network error' };
        }
    };

    const checkout = async (checkoutData) => {
        if (!user) return { success: false, message: 'User not logged in.' };
        
        try {
            // Separate donation items from regular products
            const donationItems = cart.items.filter(item => item.type === 'donation');
            const productItems = cart.items.filter(item => item.type !== 'donation');
            
            // Process regular products through API
            if (productItems.length > 0) {
                const res = await apiCall('checkout', {
                    method: 'POST',
                    body: { 
                        ...checkoutData, 
                        user_id: user.id,
                        items: productItems 
                    },
                });
                
                if (!res.success) {
                    return res;
                }
            }
            
            // Process donation items (no API call needed for demo)
            if (donationItems.length > 0) {
                console.log('Processing donation items:', donationItems);
                // In a real app, you would update donation status here
            }
            
            // Clear the cart after successful checkout
            setCart({ items: [], total_amount: 0, total_discount: 0 });
            
            return { 
                success: true, 
                message: 'Checkout successful!',
                data: { 
                    order_ids: ['ORDER_' + Date.now()], // Mock order ID
                    donation_ids: donationItems.map(item => item.donation_id)
                }
            };
        } catch (error) {
            console.error('Error during checkout:', error);
            return { success: false, message: 'Checkout failed. Please try again.' };
        }
    };

    const clearCart = () => {
        setCart({ items: [], total_amount: 0, total_discount: 0 });
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        checkout,
        clearCart,
        fetchCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);