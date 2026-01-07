import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Calendar, CreditCard, Eye, ArrowLeft, ShieldCheck, Clock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { orderApi } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Order {
    id: number;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    paymentStatus: string;
    transactionId: string;
    shippingAddress: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: string;
    createdAt: string;
}

const Orders = () => {
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await orderApi.getByUser(user.id);
                setOrders(response.data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load orders",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, isAuthLoading, navigate, toast]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status?.toLowerCase()] || colors.pending;
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'text-green-400';
            case 'failed': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const generateInvoicePDF = (order: Order, orderNumber: number) => {
        const doc = new jsPDF();

        // Brand Colors
        const brandGold: [number, number, number] = [183, 171, 144]; // #b7ab90
        const brandDark: [number, number, number] = [3, 34, 24]; // #032218
        const brandAccent: [number, number, number] = [68, 156, 128]; // #449c80

        // Header - Company Name
        doc.setFillColor(...brandDark);
        doc.rect(0, 0, 210, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('Petal & Pearl', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Boutique', 105, 28, { align: 'center' });

        doc.setFontSize(9);
        doc.text('Exquisite Fashion & Handcrafted Ornaments', 105, 36, { align: 'center' });

        // Invoice Title
        doc.setTextColor(...brandGold);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 20, 60);

        // Invoice Details
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ORD-${orderNumber}`, 20, 70);
        doc.text(`Date: ${formatDate(order.createdAt)}`, 20, 76);
        doc.text(`Status: ${order.status.toUpperCase()}`, 20, 82);

        // Customer Details Box
        doc.setDrawColor(...brandAccent);
        doc.setLineWidth(0.5);
        doc.rect(20, 90, 170, 30);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandDark);
        doc.text('BILL TO:', 25, 98);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(order.customerName, 25, 105);
        doc.text(order.customerEmail, 25, 111);
        doc.text(order.customerPhone, 25, 117);

        // Shipping Address
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const addressLines = doc.splitTextToSize(order.shippingAddress, 80);
        doc.text(addressLines, 110, 105);

        // Items Table
        const tableData = order.items.map((item) => [
            item.name,
            item.quantity.toString(),
            `৳${item.price.toLocaleString()}`,
            `৳${(item.price * item.quantity).toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 130,
            head: [['Product', 'Qty', 'Price', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: brandDark,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [60, 60, 60],
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { halign: 'center', cellWidth: 20 },
                2: { halign: 'center', cellWidth: 45 },
                3: { halign: 'center', cellWidth: 45 }
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        // Get final Y position after table
        const finalY = (doc as any).lastAutoTable.finalY || 130;

        // Payment Details
        doc.setDrawColor(...brandAccent);
        doc.rect(20, finalY + 10, 170, 30);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandDark);
        doc.text('Payment Method:', 25, finalY + 18);
        doc.setFont('helvetica', 'normal');
        doc.text(order.paymentMethod.replace(/_/g, ' ').toUpperCase(), 70, finalY + 18);

        doc.setFont('helvetica', 'bold');
        doc.text('Payment Status:', 25, finalY + 26);
        const paymentStatusColor: [number, number, number] = order.paymentStatus === 'paid' ? [34, 197, 94] : [234, 179, 8];
        doc.setTextColor(...paymentStatusColor);
        doc.text(order.paymentStatus.toUpperCase(), 70, finalY + 26);

        if (order.transactionId) {
            doc.setTextColor(60, 60, 60);
            doc.setFont('helvetica', 'bold');
            doc.text('Transaction ID:', 25, finalY + 34);
            doc.setFont('helvetica', 'normal');
            doc.text(order.transactionId, 70, finalY + 34);
        }

        // Total Amount Box
        doc.setFillColor(...brandGold);
        doc.rect(130, finalY + 10, 60, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 135, finalY + 18);
        doc.setFontSize(14);
        // Box is from 130 to 190. Center is 160.
        doc.text(`৳${order.totalAmount.toLocaleString()}`, 160, finalY + 32, { align: 'center' });

        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text('Thank you for your patronage at Petal & Pearl Boutique', 105, pageHeight - 20, { align: 'center' });
        doc.text('For inquiries, please contact us at support@petalpearl.com', 105, pageHeight - 15, { align: 'center' });

        // Save PDF
        doc.save(`Petal-Pearl-Invoice-${orderNumber}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <p className="text-accent font-serif tracking-widest uppercase text-xs">Accessing Archives...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Atelier
                </button>

                <div className="mb-12">
                    <h1 className="font-serif text-5xl mb-4">Acquisition History</h1>
                    <p className="text-muted-foreground tracking-wide">Detailed chronicle of your Petal & Pearl acquisitions</p>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card p-16 rounded-[2.5rem] border border-border text-center shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="text-accent" size={32} />
                        </div>
                        <h2 className="text-3xl font-serif mb-3">No acquisitions found</h2>
                        <p className="text-muted-foreground mb-8 text-lg">Your legacy begins with your first selection.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
                        >
                            Explore Collection
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#032218] p-8 rounded-[2rem] border border-[#449c80]/20 shadow-xl group hover:border-[#449c80]/40 transition-colors"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-serif">Order #{orders.length - index}</h3>
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-accent" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                                                <ShieldCheck size={14} className={getPaymentStatusColor(order.paymentStatus)} />
                                                <span className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Value</p>
                                            <p className="text-3xl font-bold text-accent">৳{order.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => generateInvoicePDF(order, orders.length - index)}
                                                className="bg-white/5 p-4 rounded-2xl hover:bg-accent hover:text-accent-foreground transition-all border border-white/10"
                                                title="Download Invoice"
                                            >
                                                <Download size={20} />
                                            </button>
                                            <button
                                                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                                className="bg-white/5 p-4 rounded-2xl hover:bg-accent hover:text-accent-foreground transition-all border border-white/10"
                                                title="View Details"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-4">
                                    {order.items.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="w-16 h-20 rounded-xl overflow-hidden border border-white/5 ring-1 ring-white/10">
                                            <img src={item.image} alt={item.name} crossOrigin="anonymous" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {order.items.length > 5 && (
                                        <div className="w-16 h-20 rounded-xl bg-white/5 flex items-center justify-center text-accent text-sm font-bold border border-white/10">
                                            +{order.items.length - 5}
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {selectedOrder?.id === order.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-[#449c80]/20 mt-8 pt-8 grid md:grid-cols-2 gap-12">
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                            <MapPin size={14} /> Destination
                                                        </h4>
                                                        <p className="text-sm text-foreground leading-relaxed italic opacity-80">
                                                            {order.shippingAddress}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                            <CreditCard size={14} /> Settlement Details
                                                        </h4>
                                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-[10px] text-muted-foreground uppercase">Method</span>
                                                                <span className="text-sm font-bold capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
                                                            </div>
                                                            {order.transactionId && (
                                                                <div className="flex justify-between pt-2 border-t border-white/5">
                                                                    <span className="text-[10px] text-muted-foreground uppercase">Reference</span>
                                                                    <span className="text-sm font-mono text-accent">{order.transactionId}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        <Package size={14} /> Enclosed Items
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 items-center">
                                                                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                                    <img src={item.image} alt={item.name} crossOrigin="anonymous" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold truncate">{item.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                                                                </div>
                                                                <p className="text-sm font-bold text-accent">৳{(item.price * item.quantity).toLocaleString()}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
