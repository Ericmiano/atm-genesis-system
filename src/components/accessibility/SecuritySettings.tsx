import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Fingerprint, 
  Smartphone, 
  Brain, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings,
  Lock,
  Unlock,
  Eye,
  Zap,
  Save,
  RefreshCw,
  Trash2,
  Plus,
  Minus,
  Globe,
  Calendar,
  Bell,
  Key
} from 'lucide-react';
import { useSecurity } from '@/contexts/SecurityContext';

const SecuritySettings: React.FC = () => {
  const {
    biometricStatus,
    deviceStatus,
    behavioralStatus,
    geoFencingStatus,
    timeRestrictionsStatus,
    setupBiometric,
    setupGeoFencing,
    setupTimeRestrictions,
    performSecurityHealthCheck
  } = useSecurity();

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Security
    requireMFA: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    
    // Biometric Settings
    enableBiometric: false,
    biometricMethods: [] as string[],
    
    // Device Security
    enableDeviceFingerprinting: true,
    autoTrustDevices: false,
    deviceVerificationLevel: 'medium',
    
    // Behavioral Analysis
    enableBehavioralAnalysis: true,
    analysisSensitivity: 'medium',
    anomalyThreshold: 0.7,
    
    // Geo-fencing
    enableGeoFencing: false,
    geoFencingRadius: 10,
    allowedLocations: [] as Array<{ lat: number; lng: number; radius: number; name: string }>,
    
    // Time Restrictions
    enableTimeRestrictions: false,
    timeRestrictions: [] as Array<{ day: number; startHour: number; endHour: number; enabled: boolean }>,
    
    // Notifications
    securityAlerts: true,
    threatNotifications: true,
    anomalyAlerts: true,
    weeklyReports: false
  });

  const [newLocation, setNewLocation] = useState({ lat: '', lng: '', radius: 10, name: '' });

  useEffect(() => {
    // Initialize time restrictions for all days
    if (settings.timeRestrictions.length === 0) {
      const defaultRestrictions = Array.from({ length: 7 }, (_, i) => ({
        day: i,
        startHour: 6,
        endHour: 22,
        enabled: false
      }));
      setSettings(prev => ({ ...prev, timeRestrictions: defaultRestrictions }));
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save general settings
      if (settings.enableBiometric && settings.biometricMethods.length > 0) {
        for (const method of settings.biometricMethods) {
          await setupBiometric(method as any, `simulated_${method}_data`);
        }
      }

      if (settings.enableGeoFencing && settings.allowedLocations.length > 0) {
        await setupGeoFencing(settings.allowedLocations);
      }

      if (settings.enableTimeRestrictions) {
        const activeRestrictions = settings.timeRestrictions
          .filter(r => r.enabled)
          .map(r => ({ day: r.day, startHour: r.startHour, endHour: r.endHour }));
        await setupTimeRestrictions(activeRestrictions);
      }

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh security health
      await performSecurityHealthCheck();
      
      console.log('Security settings saved successfully');
    } catch (error) {
      console.error('Failed to save security settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLocation = () => {
    if (newLocation.lat && newLocation.lng && newLocation.name) {
      setSettings(prev => ({
        ...prev,
        allowedLocations: [...prev.allowedLocations, {
          lat: parseFloat(newLocation.lat),
          lng: parseFloat(newLocation.lng),
          radius: newLocation.radius,
          name: newLocation.name
        }]
      }));
      setNewLocation({ lat: '', lng: '', radius: 10, name: '' });
    }
  };

  const handleRemoveLocation = (index: number) => {
    setSettings(prev => ({
      ...prev,
      allowedLocations: prev.allowedLocations.filter((_, i) => i !== index)
    }));
  };

  const handleBiometricToggle = (method: string) => {
    setSettings(prev => ({
      ...prev,
      biometricMethods: prev.biometricMethods.includes(method)
        ? prev.biometricMethods.filter(m => m !== method)
        : [...prev.biometricMethods, method]
    }));
  };

  const handleTimeRestrictionToggle = (day: number) => {
    setSettings(prev => ({
      ...prev,
      timeRestrictions: prev.timeRestrictions.map(r => 
        r.day === day ? { ...r, enabled: !r.enabled } : r
      )
    }));
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1] mb-2">Security Settings</h1>
          <p className="text-gray-400">Configure advanced security features and preferences</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="transition-all duration-200 hover:scale-105"
        >
          <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>

      {/* Security Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Security Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <Fingerprint className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  {biometricStatus.isEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className="text-sm text-gray-400">Biometric Auth</div>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <Smartphone className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  {deviceStatus.isTrusted ? 'Trusted' : 'Untrusted'}
                </div>
                <div className="text-sm text-gray-400">Device Status</div>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  {behavioralStatus.isAnalyzing ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-400">Behavioral Analysis</div>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  {geoFencingStatus.isEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className="text-sm text-gray-400">Geo-fencing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/80">
          <TabsTrigger value="general" className="transition-all duration-200 hover:scale-105">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="biometric" className="transition-all duration-200 hover:scale-105">
            <Fingerprint className="w-4 h-4 mr-2" />
            Biometric
          </TabsTrigger>
          <TabsTrigger value="device" className="transition-all duration-200 hover:scale-105">
            <Smartphone className="w-4 h-4 mr-2" />
            Device
          </TabsTrigger>
          <TabsTrigger value="behavioral" className="transition-all duration-200 hover:scale-105">
            <Brain className="w-4 h-4 mr-2" />
            Behavioral
          </TabsTrigger>
          <TabsTrigger value="location" className="transition-all duration-200 hover:scale-105">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </TabsTrigger>
          <TabsTrigger value="time" className="transition-all duration-200 hover:scale-105">
            <Clock className="w-4 h-4 mr-2" />
            Time
          </TabsTrigger>
        </TabsList>

        {/* General Security Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">General Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Require Multi-Factor Authentication</Label>
                    <p className="text-sm text-gray-400">Enforce MFA for all login attempts</p>
                  </div>
                  <Switch 
                    checked={settings.requireMFA}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireMFA: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Maximum Login Attempts</Label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Account Lockout Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.lockoutDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biometric Tab */}
        <TabsContent value="biometric" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Biometric Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Enable Biometric Authentication</Label>
                  <p className="text-sm text-gray-400">Allow biometric methods for login</p>
                </div>
                <Switch 
                  checked={settings.enableBiometric}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableBiometric: checked }))}
                />
              </div>

              {settings.enableBiometric && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Available Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-5 h-5 text-blue-500" />
                          <span className="text-white">Fingerprint</span>
                        </div>
                        <Switch 
                          checked={settings.biometricMethods.includes('fingerprint')}
                          onCheckedChange={() => handleBiometricToggle('fingerprint')}
                        />
                      </div>
                      <p className="text-sm text-gray-400">Use your fingerprint for secure authentication</p>
                    </div>

                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-green-500" />
                          <span className="text-white">Face Recognition</span>
                        </div>
                        <Switch 
                          checked={settings.biometricMethods.includes('face')}
                          onCheckedChange={() => handleBiometricToggle('face')}
                        />
                      </div>
                      <p className="text-sm text-gray-400">Use facial recognition for hands-free access</p>
                    </div>

                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-purple-500" />
                          <span className="text-white">Voice Recognition</span>
                        </div>
                        <Switch 
                          checked={settings.biometricMethods.includes('voice')}
                          onCheckedChange={() => handleBiometricToggle('voice')}
                        />
                      </div>
                      <p className="text-sm text-gray-400">Use your voice for secure authentication</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Security Tab */}
        <TabsContent value="device" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Device Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Device Fingerprinting</Label>
                    <p className="text-sm text-gray-400">Track and verify trusted devices</p>
                  </div>
                  <Switch 
                    checked={settings.enableDeviceFingerprinting}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableDeviceFingerprinting: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-Trust New Devices</Label>
                    <p className="text-sm text-gray-400">Automatically trust devices after first login</p>
                  </div>
                  <Switch 
                    checked={settings.autoTrustDevices}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoTrustDevices: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Device Verification Level</Label>
                  <Select 
                    value={settings.deviceVerificationLevel}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, deviceVerificationLevel: value }))}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Basic verification</SelectItem>
                      <SelectItem value="medium">Medium - Standard verification</SelectItem>
                      <SelectItem value="high">High - Strict verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {deviceStatus.fingerprint && (
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Current Device</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fingerprint:</span>
                        <span className="text-white font-mono">{deviceStatus.fingerprint.substring(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trust Status:</span>
                        <Badge variant={deviceStatus.isTrusted ? 'default' : 'destructive'}>
                          {deviceStatus.isTrusted ? 'Trusted' : 'Untrusted'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Score:</span>
                        <span className="text-white">{(deviceStatus.riskScore * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral Analysis Tab */}
        <TabsContent value="behavioral" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Behavioral Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Behavioral Analysis</Label>
                    <p className="text-sm text-gray-400">Monitor user behavior patterns for anomalies</p>
                  </div>
                  <Switch 
                    checked={settings.enableBehavioralAnalysis}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableBehavioralAnalysis: checked }))}
                  />
                </div>

                {settings.enableBehavioralAnalysis && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white">Analysis Sensitivity</Label>
                      <Select 
                        value={settings.analysisSensitivity}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, analysisSensitivity: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Fewer false positives</SelectItem>
                          <SelectItem value="medium">Medium - Balanced detection</SelectItem>
                          <SelectItem value="high">High - Maximum detection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Anomaly Threshold: {(settings.anomalyThreshold * 100).toFixed(0)}%</Label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.anomalyThreshold}
                        onChange={(e) => setSettings(prev => ({ ...prev, anomalyThreshold: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-400">Lower values trigger alerts more frequently</p>
                    </div>

                    {behavioralStatus.anomalyDetected && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Behavioral anomaly detected with {(behavioralStatus.confidence * 100).toFixed(1)}% confidence
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Security Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Geo-fencing & Location Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Geo-fencing</Label>
                    <p className="text-sm text-gray-400">Restrict access to specific geographic locations</p>
                  </div>
                  <Switch 
                    checked={settings.enableGeoFencing}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableGeoFencing: checked }))}
                  />
                </div>

                {settings.enableGeoFencing && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white">Default Radius (kilometers)</Label>
                      <Input
                        type="number"
                        value={settings.geoFencingRadius}
                        onChange={(e) => setSettings(prev => ({ ...prev, geoFencingRadius: parseInt(e.target.value) }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Allowed Locations</h3>
                      
                      {/* Add New Location */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input
                          placeholder="Latitude"
                          value={newLocation.lat}
                          onChange={(e) => setNewLocation(prev => ({ ...prev, lat: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Input
                          placeholder="Longitude"
                          value={newLocation.lng}
                          onChange={(e) => setNewLocation(prev => ({ ...prev, lng: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Input
                          placeholder="Location Name"
                          value={newLocation.name}
                          onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Button onClick={handleAddLocation} className="transition-all duration-200 hover:scale-105">
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>

                      {/* Location List */}
                      <div className="space-y-2">
                        {settings.allowedLocations.map((location, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div>
                              <div className="font-semibold text-white">{location.name}</div>
                              <div className="text-sm text-gray-400">
                                {location.lat}, {location.lng} (Radius: {location.radius}km)
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveLocation(index)}
                              className="transition-all duration-200 hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Restrictions Tab */}
        <TabsContent value="time" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Time-based Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Time Restrictions</Label>
                    <p className="text-sm text-gray-400">Restrict access to specific time windows</p>
                  </div>
                  <Switch 
                    checked={settings.enableTimeRestrictions}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTimeRestrictions: checked }))}
                  />
                </div>

                {settings.enableTimeRestrictions && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Daily Time Windows</h3>
                    
                    {settings.timeRestrictions.map((restriction, index) => (
                      <div key={restriction.day} className="p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-white">{getDayName(restriction.day)}</span>
                          </div>
                          <Switch 
                            checked={restriction.enabled}
                            onCheckedChange={() => handleTimeRestrictionToggle(restriction.day)}
                          />
                        </div>
                        
                        {restriction.enabled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white">Start Time</Label>
                              <Input
                                type="time"
                                value={`${restriction.startHour.toString().padStart(2, '0')}:00`}
                                onChange={(e) => {
                                  const [hours] = e.target.value.split(':');
                                  setSettings(prev => ({
                                    ...prev,
                                    timeRestrictions: prev.timeRestrictions.map(r => 
                                      r.day === restriction.day ? { ...r, startHour: parseInt(hours) } : r
                                    )
                                  }));
                                }}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">End Time</Label>
                              <Input
                                type="time"
                                value={`${restriction.endHour.toString().padStart(2, '0')}:00`}
                                onChange={(e) => {
                                  const [hours] = e.target.value.split(':');
                                  setSettings(prev => ({
                                    ...prev,
                                    timeRestrictions: prev.timeRestrictions.map(r => 
                                      r.day === restriction.day ? { ...r, endHour: parseInt(hours) } : r
                                    )
                                  }));
                                }}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings; 