import React from 'react';
import { motion } from 'framer-motion';
import { X, Filter } from 'lucide-react';

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    metadata: {
        materials: string[];
        occasions: string[];
        colors: string[];
        categories: string[];
    };
    activeFilters: any;
    onFilterChange: (key: string | Record<string, any>, value?: any) => void;
    onReset: () => void;
}

const FilterSidebar = ({
    isOpen,
    onClose,
    metadata,
    activeFilters,
    onFilterChange,
    onReset
}: FilterSidebarProps) => {
    const colorMap: { [key: string]: string } = {
        'Red': '#ef4444',
        'Blue': '#3b82f6',
        'Green': '#22c55e',
        'Gold': '#BFA045',
        'Silver': '#C0C0C0',
        'Black': '#000000',
        'White': '#ffffff',
        'Pink': '#ec4899',
        'Purple': '#a855f7',
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isOpen ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-xs bg-background z-[70] shadow-2xl border-l border-border p-6 flex flex-col"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-accent" />
                        <h2 className="font-serif text-2xl font-bold">Filters</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                    {/* Sort Options */}
                    <div>
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-accent mb-4">Sort By</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onFilterChange({
                                        sortBy: 'price',
                                        sortOrder: (activeFilters.sortBy === 'price' && activeFilters.sortOrder === 'ASC') ? 'DESC' : 'ASC'
                                    });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs text-left flex justify-between items-center transition-all ${activeFilters.sortBy === 'price' ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                                <span>Price {activeFilters.sortBy === 'price' && (activeFilters.sortOrder === 'ASC' ? '(Low to High)' : '(High to Low)')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onFilterChange({
                                        sortBy: 'name',
                                        sortOrder: (activeFilters.sortBy === 'name' && activeFilters.sortOrder === 'ASC') ? 'DESC' : 'ASC'
                                    });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs text-left flex justify-between items-center transition-all ${activeFilters.sortBy === 'name' ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                                <span>Alphabetical {activeFilters.sortBy === 'name' && (activeFilters.sortOrder === 'ASC' ? '(A-Z)' : '(Z-A)')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onFilterChange({
                                        sortBy: 'date',
                                        sortOrder: (activeFilters.sortBy === 'date' && activeFilters.sortOrder === 'DESC') ? 'ASC' : 'DESC'
                                    });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs text-left flex justify-between items-center transition-all ${activeFilters.sortBy === 'date' ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                                <span>Date {activeFilters.sortBy === 'date' && (activeFilters.sortOrder === 'ASC' ? '(Oldest First)' : '(Newest First)')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-accent mb-4">Price Range</h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                placeholder="Min"
                                value={activeFilters.minPrice || ''}
                                onChange={(e) => onFilterChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs focus:border-accent outline-none"
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={activeFilters.maxPrice || ''}
                                onChange={(e) => onFilterChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs focus:border-accent outline-none"
                            />
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                onFilterChange('inStock', !activeFilters.inStock);
                            }}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${activeFilters.inStock ? 'bg-accent border-accent' : 'border-border group-hover:border-accent'}`}>
                                {activeFilters.inStock && <div className="w-2 h-2 bg-accent-foreground rounded-full" />}
                            </div>
                            <span className="text-sm font-medium">In Stock Only</span>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-accent mb-4">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {metadata.categories.map(cat => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onFilterChange('category', activeFilters.category === cat ? null : cat);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${activeFilters.category === cat
                                        ? 'bg-accent text-accent-foreground'
                                        : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border mt-auto flex gap-3">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onReset();
                        }}
                        className="flex-1 py-3 border border-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                        className="flex-1 py-3 bg-accent text-accent-foreground rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#a68b3d] transition-colors"
                    >
                        Show Results
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default FilterSidebar;
