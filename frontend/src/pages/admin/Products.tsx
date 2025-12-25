import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Tag,
    DollarSign,
    Image as ImageIcon,
    X,
    AlertCircle,
    Check
} from 'lucide-react';
import { productApi } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        image: '',
        category: '',
        type: 'clothing',
        isNew: false,
        isSale: false
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productApi.getAll();
            setProducts(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch products",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || '',
                image: product.image,
                category: product.category,
                type: product.type,
                isNew: product.isNew,
                isSale: product.isSale
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                originalPrice: '',
                image: '',
                category: '',
                type: 'clothing',
                isNew: false,
                isSale: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            };

            if (editingProduct) {
                await productApi.update(editingProduct.id, payload);
                toast({ title: "Updated", description: "Product updated successfully" });
            } else {
                await productApi.create(payload);
                toast({ title: "Created", description: "Product created successfully" });
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Operation failed",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await productApi.remove(id);
            toast({ title: "Deleted", description: "Product removed successfully" });
            fetchProducts();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete product",
                variant: "destructive"
            });
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-serif text-4xl font-bold mb-2">Product Management</h1>
                    <p className="text-muted-foreground">Manage inventory, prices, and product details.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold hover:bg-gold transition-all shadow-lg shadow-accent/20"
                >
                    <Plus size={20} />
                    Add New Product
                </button>
            </div>

            {/* Search */}
            <div className="bg-[#032218] p-4 rounded-2xl border border-[#449c80]/20 mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#02140f] border border-[#449c80]/20 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-[#032218] rounded-2xl border border-[#449c80]/20 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#02140f] border-b border-[#449c80]/20">
                                <th className="p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                                <th className="p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category/Type</th>
                                <th className="p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                                <th className="p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#449c80]/10">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-6 bg-[#449c80]/5 h-16" />
                                    </tr>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-[#449c80]/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-accent/20 overflow-hidden flex-shrink-0">
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">ID: #{product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Tag size={14} className="text-accent/60" />
                                                    <span className="capitalize">{product.category}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground capitalize bg-white/5 px-2 py-0.5 rounded-full w-fit">
                                                    {product.type}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm font-bold text-accent">
                                                ${product.price}
                                                {product.originalPrice && (
                                                    <span className="text-xs text-muted-foreground line-through ml-2">
                                                        ${product.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-2">
                                                {product.isNew && (
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded-md border border-blue-500/30">New</span>
                                                )}
                                                {product.isSale && (
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-md border border-red-500/30">Sale</span>
                                                )}
                                                {!product.isNew && !product.isSale && (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors border border-transparent hover:border-accent/20"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                            <AlertCircle size={48} className="opacity-20" />
                                            <p>No products found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
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
                            className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-[#032218] rounded-3xl border border-[#449c80]/30 shadow-2xl z-[61]"
                        >
                            <div className="p-8 border-b border-[#449c80]/20 flex justify-between items-center bg-[#02140f] sticky top-0 z-10">
                                <h2 className="font-serif text-2xl font-bold">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                                    <X size={24} className="text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-accent">Product Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all"
                                                placeholder="Elegant Silk Saree"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-accent">Category</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all"
                                                placeholder="Jamdani, Necklace, etc."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-accent">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-foreground appearance-none"
                                            >
                                                <option value="clothing">Clothing</option>
                                                <option value="ornament">Ornament</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-accent">Price ($)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-accent">Orig. Price ($)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.originalPrice}
                                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                                    className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-accent">Image URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    required
                                                    value={formData.image}
                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            {/* Image Preview */}
                                            <div className="aspect-video w-full bg-[#02140f] rounded-xl border border-[#449c80]/30 overflow-hidden flex items-center justify-center mt-2 group relative">
                                                {formData.image ? (
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                                                        <ImageIcon size={32} className="opacity-50" />
                                                        <span className="text-xs">No image preview</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-6 pt-4">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-6 h-6 rounded border border-accent flex items-center justify-center transition-colors ${formData.isNew ? 'bg-accent' : 'bg-transparent'}`}>
                                                    {formData.isNew && <Check size={16} className="text-primary" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isNew}
                                                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                                    className="hidden"
                                                />
                                                <span className="text-sm font-medium group-hover:text-accent transition-colors">Mark as New Release</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-6 h-6 rounded border border-accent flex items-center justify-center transition-colors ${formData.isSale ? 'bg-accent' : 'bg-transparent'}`}>
                                                    {formData.isSale && <Check size={16} className="text-primary" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isSale}
                                                    onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                                                    className="hidden"
                                                />
                                                <span className="text-sm font-medium group-hover:text-accent transition-colors">Mark as On Sale</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4 border-t border-[#449c80]/20">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 border border-[#449c80]/30 rounded-xl font-bold hover:bg-[#449c80]/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-accent text-accent-foreground rounded-xl font-bold hover:bg-gold transition-all shadow-lg shadow-accent/20"
                                    >
                                        {editingProduct ? 'Save Changes' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminProducts;
