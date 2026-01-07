import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/components/ProductCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { cartApi } from '@/api/services';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    items: CartItem[]; // Alias for easier access
    cartCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    addToCart: (product: Product) => void;
    updateQuantity: (id: number, quantity: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    handleCheckout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Load cart from localStorage or backend on mount
    React.useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse saved cart", e);
            }
        }

        const loadCart = async () => {
            if (isAuthenticated && user?.id) {
                try {
                    const res = await cartApi.getByUser(user.id);
                    if (res.data && res.data.items && res.data.items.length > 0) {
                        setCartItems(res.data.items);
                        localStorage.setItem('cart', JSON.stringify(res.data.items));
                    }
                } catch (error) {
                    console.error("Failed to load cart:", error);
                }
            }
        };
        loadCart();
    }, [isAuthenticated, user?.id]);

    // Sync cart to backend and localStorage when it changes
    React.useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } else if (cartItems.length === 0 && localStorage.getItem('cart')) {
            localStorage.removeItem('cart');
        }

        const syncCart = async () => {
            if (isAuthenticated && user?.id) {
                try {
                    // map to essential data to avoid cycles or bloat
                    const itemsToSync = cartItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                        stock: item.stock,
                        category: item.category
                    }));
                    await cartApi.update(user.id, itemsToSync);
                } catch (error) {
                    console.error("Failed to sync cart:", error);
                }
            }
        };
        const timer = setTimeout(syncCart, 2000); // Debounce sync
        return () => clearTimeout(timer);
    }, [cartItems, isAuthenticated, user?.id]);

    const addToCart = useCallback((product: Product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    toast({
                        title: "Limit reached",
                        description: `Only ${product.stock} items available in stock.`,
                        variant: "destructive"
                    });
                    return prevItems;
                }
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            if (product.stock <= 0) {
                toast({
                    title: "Out of stock",
                    description: "This product is currently unavailable.",
                    variant: "destructive"
                });
                return prevItems;
            }
            toast({
                title: "Added to bag!",
                description: `${product.name} has been added to your bag.`,
            });
            return [...prevItems, { ...product, quantity: 1 }];
        });
    }, [toast]);

    const updateQuantity = useCallback((id: number, quantity: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === id) {
                    if (quantity > item.stock) {
                        toast({
                            title: "Stock limit",
                            description: `Only ${item.stock} items available.`,
                            variant: "destructive"
                        });
                        return item;
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    }, [toast]);

    const removeItem = useCallback((id: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
        toast({
            title: "Item removed",
            description: "The item has been removed from your bag.",
        });
    }, [toast]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const handleCheckout = useCallback(() => {
        setIsCartOpen(false);
        navigate('/checkout');
    }, [navigate]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                items: cartItems, // Alias
                cartCount,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                handleCheckout,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
