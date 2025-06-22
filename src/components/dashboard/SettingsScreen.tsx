import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
    User, 
    Shield, 
    Bell, 
    CreditCard, 
    Smartphone, 
    Mail, 
    Eye, 
    EyeOff,
    Save,
    Trash2,
    DollarSign,
    Target
} from 'lucide-react';

const SettingsSection = ({ title, icon: Icon, children }) => (
    <Card className="bg-gray-800/80 border-gray-700">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
                <Icon className="w-5 h-5 text-custom-purple" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {children}
        </CardContent>
    </Card>
);

const SettingsScreen = ({ currentUser, onSaveSettings }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            sms: false,
            push: true,
            transactionAlerts: true,
            securityAlerts: true,
            marketing: false
        },
        security: {
            twoFactorAuth: true,
            biometricAuth: false,
            sessionTimeout: '30',
            requirePinForTransactions: true
        },
        preferences: {
            language: 'en',
            currency: 'KES',
            timezone: 'Africa/Nairobi',
            theme: 'dark'
        }
    });

    const handleSettingChange = (category, setting, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: value
            }
        }));
    };

    return (
        <div className="p-8 text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-gray-400 mt-2">Manage your account preferences and security settings</p>
                </div>
                <Button className="bg-custom-purple hover:bg-purple-700 text-white rounded-full px-6 py-3 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Account Settings */}
                <SettingsSection title="Account Information" icon={User}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                            <Input 
                                id="fullName"
                                value={currentUser?.full_name || ''}
                                className="bg-gray-700 border-gray-600 text-white"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                            <Input 
                                id="email"
                                type="email"
                                value={currentUser?.email || ''}
                                className="bg-gray-700 border-gray-600 text-white"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                            <Input 
                                id="phone"
                                value={currentUser?.phone || ''}
                                className="bg-gray-700 border-gray-600 text-white"
                                placeholder="Enter your phone number"
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Security Settings */}
                <SettingsSection title="Security" icon={Shield}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">Two-Factor Authentication</Label>
                                <p className="text-sm text-gray-400">Add an extra layer of security</p>
                            </div>
                            <Switch 
                                checked={settings.security.twoFactorAuth}
                                onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorAuth', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">Biometric Authentication</Label>
                                <p className="text-sm text-gray-400">Use fingerprint or face ID</p>
                            </div>
                            <Switch 
                                checked={settings.security.biometricAuth}
                                onCheckedChange={(checked) => handleSettingChange('security', 'biometricAuth', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">Require PIN for Transactions</Label>
                                <p className="text-sm text-gray-400">Always require PIN confirmation</p>
                            </div>
                            <Switch 
                                checked={settings.security.requirePinForTransactions}
                                onCheckedChange={(checked) => handleSettingChange('security', 'requirePinForTransactions', checked)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="sessionTimeout" className="text-gray-300">Session Timeout (minutes)</Label>
                            <Select 
                                value={settings.security.sessionTimeout}
                                onValueChange={(value) => handleSettingChange('security', 'sessionTimeout', value)}
                            >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </SettingsSection>

                {/* Notification Settings */}
                <SettingsSection title="Notifications" icon={Bell}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">Email Notifications</Label>
                                <p className="text-sm text-gray-400">Receive updates via email</p>
                            </div>
                            <Switch 
                                checked={settings.notifications.email}
                                onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">SMS Notifications</Label>
                                <p className="text-sm text-gray-400">Receive updates via SMS</p>
                            </div>
                            <Switch 
                                checked={settings.notifications.sms}
                                onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">Push Notifications</Label>
                                <p className="text-sm text-gray-400">Receive app notifications</p>
                            </div>
                            <Switch 
                                checked={settings.notifications.push}
                                onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                            />
                        </div>
                        <Separator className="bg-gray-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">Transaction Alerts</Label>
                                <p className="text-sm text-gray-400">Get notified of all transactions</p>
                            </div>
                            <Switch 
                                checked={settings.notifications.transactionAlerts}
                                onCheckedChange={(checked) => handleSettingChange('notifications', 'transactionAlerts', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300">Security Alerts</Label>
                                <p className="text-sm text-gray-400">Get notified of security events</p>
                            </div>
                            <Switch 
                                checked={settings.notifications.securityAlerts}
                                onCheckedChange={(checked) => handleSettingChange('notifications', 'securityAlerts', checked)}
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection title="Preferences" icon={CreditCard}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="language" className="text-gray-300">Language</Label>
                            <Select 
                                value={settings.preferences.language}
                                onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                            >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="sw">Swahili</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                            <Select 
                                value={settings.preferences.currency}
                                onValueChange={(value) => handleSettingChange('preferences', 'currency', value)}
                            >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                    <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                            <Select 
                                value={settings.preferences.timezone}
                                onValueChange={(value) => handleSettingChange('preferences', 'timezone', value)}
                            >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                    <SelectItem value="Africa/Nairobi">Nairobi (GMT+3)</SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </SettingsSection>
            </div>
        </div>
    );
};

export default SettingsScreen; 