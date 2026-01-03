import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
    Search,
    ShoppingCart,
    Eye,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    Calendar,
    User,
    CreditCard,
    Package,
    ShieldCheck,
    AlertCircle,
    CheckCircle,
    Phone,
    MapPin
} from 'lucide-react';
import { orderApi } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getAll();
            setOrders(response.data);
            if (selectedOrder) {
                const updated = response.data.find((o: any) => o.id === selectedOrder.id);
                if (updated) setSelectedOrder(updated);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch orders",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await orderApi.updateStatus(id, status);
            toast({
                title: "Status Updated",
                description: `Order #${id} is now ${status}`,
            });
            fetchOrders();
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update order status",
                variant: "destructive"
            });
        }
    };

    const handleUpdatePaymentStatus = async (id: number, paymentStatus: string) => {
        try {
            await orderApi.updatePaymentStatus(id, paymentStatus);
            toast({
                title: "Payment Verified",
                description: `Order #${id} marked as ${paymentStatus}`,
            });
            fetchOrders();
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to verify payment",
                variant: "destructive"
            });
        }
    };

    const handleConfirmOrder = async (id: number) => {
        try {
            setLoading(true);
            await orderApi.confirm(id);
            toast({
                title: "Order Confirmed",
                description: `Order #${id} has been sent to Steadfast Courier`,
            });
            await fetchOrders();
        } catch (error: any) {
            toast({
                title: "Confirmation Failed",
                description: error.response?.data?.message || "Failed to connect to Steadfast",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'confirmed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getPaymentStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'refunded': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.transactionId && order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold mb-2">Order Management</h1>
                <p className="text-muted-foreground">Track and manage customer orders, updates and shipping status.</p>
            </div>

            {/* Search */}
            <div className="bg-[#032218] p-4 rounded-2xl border border-[#449c80]/20 mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer Name, Email or Transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#02140f] border border-[#449c80]/20 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#032218] rounded-2xl border border-[#449c80]/20 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#02140f] border-b border-[#449c80]/20 whitespace-nowrap">
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order ID</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payment Status</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order Status</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#449c80]/10 whitespace-nowrap">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="p-6 h-20 bg-[#449c80]/5" />
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#449c80]/5 transition-colors group">
                                        <td className="p-4 sm:p-6 font-mono text-accent">#{order.id}</td>
                                        <td className="p-4 sm:p-6">
                                            <div>
                                                <p className="font-bold text-foreground">{order.customerName}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{order.paymentMethod.replace(/_/g, ' ')}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            <p className="font-bold text-foreground">৳{order.totalAmount.toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd, h:mm a')}</p>
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getPaymentStatusStyle(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 sm:p-6 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors border border-transparent hover:border-accent/20"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <p className="text-muted-foreground">No orders found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-4 m-auto w-full max-w-3xl h-fit max-h-[90vh] overflow-y-auto bg-[#032218] rounded-3xl border border-[#449c80]/30 shadow-2xl z-[61]"
                        >
                            <div className="p-6 sm:p-8 border-b border-[#449c80]/20 flex justify-between items-center bg-[#02140f] sticky top-0">
                                <div>
                                    <h2 className="font-serif text-2xl font-bold">In-depth Order Review</h2>
                                    <p className="text-xs text-accent font-mono uppercase tracking-widest">#{selectedOrder.id} • {selectedOrder.paymentMethod.replace(/_/g, ' ')}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <XCircle size={24} className="text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-6 sm:p-8 space-y-8">
                                {/* Payment Details (NEW) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20 space-y-4">
                                        <div className="flex items-center gap-2 text-accent">
                                            <ShieldCheck size={20} />
                                            <h3 className="text-sm font-bold uppercase tracking-widest">Payment Integrity</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Current Standing</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPaymentStatusStyle(selectedOrder.paymentStatus)}`}>
                                                    {selectedOrder.paymentStatus}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Transaction Ref</p>
                                                <p className="font-mono text-sm font-bold mt-1 truncate">{selectedOrder.transactionId || 'N/A'}</p>
                                            </div>
                                        </div>
                                        {selectedOrder.paymentStatus !== 'paid' && (
                                            <div className="pt-2 flex gap-2">
                                                <button
                                                    onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'paid')}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> Mark as Verified (Paid)
                                                </button>
                                                <button
                                                    onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'failed')}
                                                    className="px-4 border border-red-500/30 text-red-500 hover:bg-red-500/10 py-2 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Truck size={20} />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Logistic Lifecycle</h3>
                                        </div>

                                        {selectedOrder.courier === 'steadfast' ? (
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] text-emerald-500 font-bold uppercase">Steadfast Logistics</p>
                                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white rounded-full uppercase">
                                                        {selectedOrder.courierStatus}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Consignment ID:</p>
                                                <p className="font-mono text-sm font-bold text-foreground">{selectedOrder.courierConsignmentId}</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleConfirmOrder(selectedOrder.id)}
                                                disabled={loading}
                                                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Package size={16} />
                                                )}
                                                Confirm & Send to Steadfast
                                            </button>
                                        )}

                                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                                            {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                                    className={`px-2 py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${selectedOrder.status === status
                                                        ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20'
                                                        : 'bg-white/5 text-muted-foreground border-white/10 hover:border-accent/40'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-accent/70 px-1">Identity & Contact</h3>
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{selectedOrder.customerName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{selectedOrder.customerEmail}</p>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone size={14} className="text-accent" />
                                                {selectedOrder.customerPhone}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-accent/70 px-1">Shipping Designation</h3>
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 h-full">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={18} className="text-accent mt-0.5" />
                                                <p className="text-sm leading-relaxed text-muted-foreground italic">
                                                    {selectedOrder.shippingAddress}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-accent/70 px-1">Manifest of Acquisition</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedOrder.items.map((item: any, id: number) => (
                                            <div key={id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-accent/30 transition-colors">
                                                <div className="w-16 h-20 rounded-xl bg-accent/20 overflow-hidden flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{item.name}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                        <p className="text-sm font-bold text-accent">৳{(item.price * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center bg-accent/10 p-5 rounded-2xl border border-accent/20">
                                        <span className="font-serif text-xl">Cumulative Total</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-accent">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Settlement Method: {selectedOrder.paymentMethod.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminOrders;
