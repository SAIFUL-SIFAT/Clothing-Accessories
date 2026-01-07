import React from 'react';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Shield, Package } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

const Profile = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const detailItems = [
        { label: 'Full Name', value: user?.name, icon: <User className="text-accent" size={20} /> },
        { label: 'Email Address', value: user?.email, icon: <Mail className="text-accent" size={20} /> },
        { label: 'Phone Number', value: user?.phone || 'Not provided', icon: <Phone className="text-accent" size={20} /> },
        { label: 'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Valued Customer', icon: <Shield className="text-accent" size={20} /> },
    ];

    return (
        <PageLayout showFooter={false}>
            <div className="pt-32 pb-20 min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center mb-12">
                            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">My Profile</h1>
                            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Profile Card */}
                            <div className="md:col-span-1">
                                <div className="bg-secondary p-8 rounded-2xl border border-border flex flex-col items-center text-center shadow-lg">
                                    <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-4 border border-accent/20">
                                        <User size={48} className="text-accent" />
                                    </div>
                                    <h2 className="font-serif text-xl text-foreground mb-1">{user?.name}</h2>
                                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-6">
                                        {user?.role === 'admin' ? 'Admin' : 'Member'}
                                    </p>
                                    <button className="w-full py-2 bg-accent/10 text-accent border border-accent/20 rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-secondary p-8 rounded-2xl border border-border shadow-lg">
                                    <h3 className="font-serif text-2xl text-foreground mb-6 flex items-center gap-2">
                                        <Shield size={24} className="text-accent" />
                                        Account Information
                                    </h3>

                                    <div className="grid grid-cols-1 gap-6">
                                        {detailItems.map((item, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 bg-background/50 rounded-xl border border-border/50">
                                                <div className="p-3 bg-accent/10 rounded-lg">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                                                    <p className="text-lg text-foreground font-medium">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-secondary p-8 rounded-2xl border border-border shadow-lg">
                                    <h3 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                                        <Package size={24} className="text-accent" />
                                        Quick Actions
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        <Link to="/orders" className="px-6 py-3 bg-background border border-border rounded-xl hover:border-accent hover:text-accent transition-all flex items-center gap-2">
                                            <Package size={18} /> View My Orders
                                        </Link>
                                        <button className="px-6 py-3 bg-background border border-border rounded-xl hover:border-accent hover:text-accent transition-all flex items-center gap-2">
                                            <Shield size={18} /> Privacy Settings
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Profile;
