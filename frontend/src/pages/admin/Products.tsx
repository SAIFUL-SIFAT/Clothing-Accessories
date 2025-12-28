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
    Check,
    Upload
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
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadImage = async () => {
        if (!selectedFile) return null;

        setUploading(true);
        try {
            const response = await productApi.upload(selectedFile);
            return response.data.url;
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload image",
                variant: "destructive"
            });
            return null;
        } finally {
            setUploading(false);
        }
    };

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
            setImagePreview(product.image);
            setSelectedFile(null);
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
            setImagePreview('');
            setSelectedFile(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let imageUrl = formData.image;

            // Upload image if a new file is selected
            if (selectedFile) {
                const uploadedUrl = await handleUploadImage();
                if (!uploadedUrl) {
                    toast({
                        title: "Error",
                        description: "Image upload failed. Please try again.",
                        variant: "destructive"
                    });
                    return;
                }
                imageUrl = uploadedUrl;
            }

            // Validate that we have an image URL
            if (!imageUrl) {
                toast({
                    title: "Error",
                    description: "Please select an image",
                    variant: "destructive"
                });
                return;
            }

            const payload = {
                ...formData,
                image: imageUrl,
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
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="font-serif text-2xl sm:text-4xl font-bold mb-2">Product Management</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Manage inventory, prices, and product details.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 sm:px-6 py-3 rounded-xl font-bold hover:bg-gold transition-all shadow-lg shadow-accent/20 text-sm sm:text-base"
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
                            <tr className="bg-[#02140f] border-b border-[#449c80]/20 whitespace-nowrap">
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category/Type</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="p-4 sm:p-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#449c80]/10 whitespace-nowrap">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-6 bg-[#449c80]/5 h-16" />
                                    </tr>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-[#449c80]/5 transition-colors group">
                                        <td className="p-4 sm:p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/20 overflow-hidden flex-shrink-0">
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground truncate max-w-[150px] sm:max-w-none">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">ID: #{product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-6">
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
                                        <td className="p-4 sm:p-6">
                                            <div className="text-sm font-bold text-accent">
                                                ৳{product.price.toLocaleString()}
                                                {product.originalPrice && (
                                                    <span className="text-xs text-muted-foreground line-through ml-2">
                                                        ৳{product.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-6">
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
                                        <td className="p-4 sm:p-6 text-right">
                                            <div className="flex justify-end gap-1 sm:gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="p-1.5 sm:p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors border border-transparent hover:border-accent/20"
                                                >
                                                    <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 sm:p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
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
                            className="fixed inset-4 m-auto w-[calc(100vw-32px)] sm:w-full sm:max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-[#032218] rounded-3xl border border-[#449c80]/30 shadow-2xl z-[61]"
                        >
                            <div className="p-6 sm:p-8 border-b border-[#449c80]/20 flex justify-between items-center bg-[#02140f] sticky top-0 z-10">
                                <h2 className="font-serif text-xl sm:text-2xl font-bold">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform p-1">
                                    <X size={24} className="text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent">Product Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-sm sm:text-base"
                                                placeholder="Elegant Silk Saree"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent">Category</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-sm sm:text-base"
                                                placeholder="Jamdani, Necklace, etc."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-foreground appearance-none text-sm sm:text-base"
                                            >
                                                <option value="clothing">Clothing</option>
                                                <option value="ornament">Ornament</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent">Price (৳)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-sm sm:text-base"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent">Orig. Price (৳)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.originalPrice}
                                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                                    className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-sm sm:text-base"
                                                    placeholder="Opt."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent">Product Image</label>

                                            {/* File Upload Button */}
                                            <div className="flex gap-2">
                                                <label className="flex-1 cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                    <div className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 hover:border-accent transition-all text-sm sm:text-base text-center flex items-center justify-center gap-2">
                                                        <Upload size={18} />
                                                        {selectedFile ? selectedFile.name : 'Choose Image File'}
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Optional URL Input */}
                                            <div className="relative">
                                                <input
                                                    type="url"
                                                    value={formData.image}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, image: e.target.value });
                                                        setImagePreview(e.target.value);
                                                        setSelectedFile(null);
                                                    }}
                                                    className="w-full bg-[#02140f] border border-[#449c80]/30 rounded-xl py-3 px-4 outline-none focus:border-accent transition-all text-sm sm:text-base"
                                                    placeholder="Or paste image URL..."
                                                />
                                            </div>

                                            {uploading && (
                                                <div className="text-accent text-sm flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
                                                    Uploading image...
                                                </div>
                                            )}

                                            {/* Image Preview */}
                                            <div className="aspect-video w-full bg-[#02140f] rounded-xl border border-[#449c80]/30 overflow-hidden flex items-center justify-center mt-2 group relative">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                                                        <ImageIcon size={32} className="opacity-50" />
                                                        <span className="text-[10px]">No image selected</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border border-accent flex items-center justify-center transition-colors ${formData.isNew ? 'bg-accent' : 'bg-transparent'}`}>
                                                    {formData.isNew && <Check size={14} className="text-primary" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isNew}
                                                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                                    className="hidden"
                                                />
                                                <span className="text-xs sm:text-sm font-medium group-hover:text-accent transition-colors">Mark as New Release</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border border-accent flex items-center justify-center transition-colors ${formData.isSale ? 'bg-accent' : 'bg-transparent'}`}>
                                                    {formData.isSale && <Check size={14} className="text-primary" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isSale}
                                                    onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                                                    className="hidden"
                                                />
                                                <span className="text-xs sm:text-sm font-medium group-hover:text-accent transition-colors">Mark as On Sale</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 border-t border-[#449c80]/20">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 sm:py-4 border border-[#449c80]/30 rounded-xl font-bold hover:bg-[#449c80]/10 transition-all text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 sm:py-4 bg-accent text-accent-foreground rounded-xl font-bold hover:bg-gold transition-all shadow-lg shadow-accent/20 text-sm sm:text-base"
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
