import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, User, Mail, Phone, CreditCard, ArrowLeft, Check, Copy, AlertCircle, Info } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/axios';

interface PaymentInstructionsProps {
    paymentMethod: string;
    transactionId: string;
    total: number;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCopy: (text: string, label: string) => void;
}

const PaymentInstructions = ({ paymentMethod, transactionId, total, onInputChange, onCopy }: PaymentInstructionsProps) => {
    switch (paymentMethod) {
        case 'bkash':
        case 'nagad':
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-accent/5 rounded-2xl border border-accent/20 space-y-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg text-accent">
                            <Info size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider">Payment Instructions</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Please send the total amount (৳{total.toLocaleString()}) to the number below using <b>Send Money</b>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Personal Number</p>
                            <p className="font-bold font-mono">01758761248</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onCopy('01758761248', 'Account Number')}
                            className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
                        >
                            <Copy size={16} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent">Transaction ID / Reference</label>
                        <input
                            type="text"
                            name="transactionId"
                            value={transactionId}
                            onChange={onInputChange}
                            required
                            placeholder="Enter Transaction ID"
                            className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-sm font-mono"
                        />
                    </div>
                </motion.div>
            );
        case 'bank_transfer':
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-accent/5 rounded-2xl border border-accent/20 space-y-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg text-accent">
                            <Info size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider">Bank Details</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Transfer the amount (৳{total.toLocaleString()}) to our official bank account.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-muted-foreground text-xs">Bank Name:</span>
                            <span className="font-medium">City Bank PLC</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-muted-foreground text-xs">Account Name:</span>
                            <span className="font-medium truncate">Petal & Pearl Boutique</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-xs">A/C Number:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold font-mono">1234567890</span>
                                <button
                                    type="button"
                                    onClick={() => onCopy('1234567890', 'Account Number')}
                                    className="text-accent"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent">Bank Ref / Transaction ID</label>
                        <input
                            type="text"
                            name="transactionId"
                            value={transactionId}
                            onChange={onInputChange}
                            required
                            placeholder="Enter Transaction Reference"
                            className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-sm font-mono"
                        />
                    </div>
                </motion.div>
            );
        default:
            return (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg text-muted-foreground">
                        <Check size={18} />
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                        Pay in cash when your luxury parcel arrives at your door.
                    </p>
                </div>
            );
    }
};

const Checkout = () => {
    const navigate = useNavigate();
    const { items, clearCart } = useCart();
    const { user } = useAuth();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        shippingAddress: '',
        paymentMethod: 'cash_on_delivery',
        transactionId: '',
    });

    React.useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                customerName: prev.customerName || user.name || '',
                customerEmail: prev.customerEmail || user.email || '',
                customerPhone: prev.customerPhone || user.phone || '',
            }));
        }
    }, [user]);

    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal > 5000 ? 0 : 120;
    const total = subtotal + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${label} copied to clipboard.`,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for transaction ID
        if (formData.paymentMethod !== 'cash_on_delivery' && !formData.transactionId) {
            toast({
                title: "Transaction ID Required",
                description: "Please provide the reference/transaction ID for your payment.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);

        try {
            const orderData = {
                ...formData,
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                userId: user?.id || null,
            };

            await api.post('/orders', orderData);

            toast({
                title: "Order Placed Successfully!",
                description: formData.paymentMethod === 'cash_on_delivery'
                    ? "Your order is confirmed. Cash will be collected on delivery."
                    : "Order received! Our team will verify your payment shortly.",
            });

            clearCart();
            navigate(user ? '/orders' : '/');
        } catch (error: any) {
            toast({
                title: "Order Failed",
                description: error.response?.data?.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={64} />
                    <h2 className="text-2xl font-serif mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">Add some items to proceed to checkout</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-luxury bg-accent text-accent-foreground"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <h1 className="font-serif text-3xl sm:text-4xl mb-6 sm:mb-8 underline-accent">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Information */}
                            <div className="bg-[#032218] p-4 sm:p-6 rounded-3xl border border-[#449c80]/20 shadow-xl">
                                <h2 className="font-serif text-xl sm:text-2xl mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                        <User size={22} />
                                    </div>
                                    Customer Details
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/70 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-2xl py-3 px-5 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/70 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-2xl py-3 px-5 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/70 ml-1">Mobile Number</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/50" />
                                            <input
                                                type="tel"
                                                name="customerPhone"
                                                value={formData.customerPhone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-2xl py-3 pl-12 pr-5 focus:border-accent outline-none transition-all"
                                                placeholder="01XXXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-[#032218] p-4 sm:p-6 rounded-3xl border border-[#449c80]/20 shadow-xl">
                                <h2 className="font-serif text-xl sm:text-2xl mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                        <MapPin size={22} />
                                    </div>
                                    Handover Address
                                </h2>
                                <textarea
                                    name="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    placeholder="Enter complete shipping address with landmark..."
                                    className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-2xl py-4 px-6 focus:border-accent outline-none transition-all resize-none text-sm leading-relaxed"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="bg-[#032218] p-4 sm:p-6 rounded-3xl border border-[#449c80]/20 shadow-xl">
                                <h2 className="font-serif text-xl sm:text-2xl mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                        <CreditCard size={22} />
                                    </div>
                                    Select Settlement
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                    {[
                                        { id: 'cash_on_delivery', name: 'Cash on Delivery', sub: 'Handover Cash' },
                                        { id: 'bkash', name: 'bKash', sub: 'Mobile Wallet' },
                                        { id: 'nagad', name: 'Nagad', sub: 'Mobile Wallet' },
                                        { id: 'bank_transfer', name: 'Bank Transfer', sub: 'Online Banking' }
                                    ].map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method.id
                                                ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(68,156,128,0.2)]'
                                                : 'bg-[#02140f] border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={formData.paymentMethod === method.id}
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === method.id ? 'border-accent bg-accent' : 'border-white/20'
                                                }`}>
                                                {formData.paymentMethod === method.id && <Check size={12} className="text-accent-foreground" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{method.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{method.sub}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <PaymentInstructions
                                    paymentMethod={formData.paymentMethod}
                                    transactionId={formData.transactionId}
                                    total={total}
                                    onInputChange={handleInputChange}
                                    onCopy={copyToClipboard}
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isProcessing}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full bg-accent text-accent-foreground py-4 sm:py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-accent/20 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                                        Authenticating Transaction...
                                    </>
                                ) : (
                                    <>
                                        Confirm Final Order
                                        <ArrowLeft className="rotate-180" size={20} />
                                    </>
                                )}
                            </motion.button>
                            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-60">
                                🔒 Encrypted and Secure Transaction Environment
                            </p>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#032218] p-4 sm:p-6 rounded-3xl border border-[#449c80]/20 shadow-2xl sticky top-24">
                            <h2 className="font-serif text-xl sm:text-2xl mb-6">Valuation Summary</h2>
                            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-accent/40 transition-colors">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="text-sm font-bold line-clamp-1 group-hover:text-accent transition-colors">{item.name}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                <p className="text-sm text-accent font-mono font-bold">৳{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-white/10 pt-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Original Sum</span>
                                    <span className="font-mono">৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Logistic Fees</span>
                                    <span className="text-accent font-bold uppercase text-[10px] tracking-widest">
                                        {shippingFee === 0 ? 'Complimentary' : `৳${shippingFee}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-[#449c80]/30">
                                    <span className="font-serif text-lg">Total Valuation</span>
                                    <div className="text-right">
                                        <span className="block text-3xl font-bold text-accent shadow-accent/20 drop-shadow-lg">
                                            ৳{total.toLocaleString()}
                                        </span>
                                        <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Inclusive of all duties</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
