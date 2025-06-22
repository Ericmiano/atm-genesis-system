import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Activity,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  Settings,
  BarChart3,
  Users,
  Globe,
  Calendar,
  Zap
} from 'lucide-react';
import { useSecurity } from '@/contexts/SecurityContext';

const AdvancedSecurityDashboard: React.FC = () => {
  const {
    securityHealth,
    biometricStatus,
    deviceStatus,
    behavioralStatus,
    geoFencingStatus,
    timeRestrictionsStatus,
    realTimeThreats,
    performSecurityHealthCheck,
    setupBiometric,
    setupGeoFencing,
    setupTimeRestrictions,
    detectRealTimeThreats
  } = useSecurity();

  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await performSecurityHealthCheck();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleBiometricSetup = async (type: 'fingerprint' | 'face' | 'voice') => {
    // Simulated biometric data
    const biometricData = `simulated_${type}_data_${Date.now()}`;
    const result = await setupBiometric(type, biometricData);
    console.log(`Biometric ${type} setup:`, result);
  };

  const handleGeoFencingSetup = async () => {
    const locations = [
      { lat: -1.2921, lng: 36.8219, radius: 10 }, // Nairobi
      { lat: -1.2921, lng: 36.8219, radius: 5 }   // Home location
    ];
    const result = await setupGeoFencing(locations);
    console.log('Geo-fencing setup:', result);
  };

  const handleTimeRestrictionsSetup = async () => {
    const restrictions = [
      { day: 0, startHour: 6, endHour: 22 }, // Sunday
      { day: 1, startHour: 6, endHour: 22 }, // Monday
      { day: 2, startHour: 6, endHour: 22 }, // Tuesday
      { day: 3, startHour: 6, endHour: 22 }, // Wednesday
      { day: 4, startHour: 6, endHour: 22 }, // Thursday
      { day: 5, startHour: 6, endHour: 22 }, // Friday
      { day: 6, startHour: 8, endHour: 20 }  // Saturday
    ];
    const result = await setupTimeRestrictions(restrictions);
    console.log('Time restrictions setup:', result);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
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
          <h1 className="text-3xl font-bold text-[#F1F1F1] mb-2">Advanced Security Dashboard</h1>
          <p className="text-gray-400">Comprehensive security monitoring and controls</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Security Health Overview */}
      {securityHealth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  System Security Health
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(securityHealth.status)}
                  <Badge 
                    variant={securityHealth.status === 'healthy' ? 'default' : 
                            securityHealth.status === 'warning' ? 'secondary' : 'destructive'}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {securityHealth.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{securityHealth.metrics.totalThreats}</div>
                  <div className="text-sm text-gray-400">Active Threats</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{(securityHealth.metrics.averageRiskScore * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Avg Risk Score</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{securityHealth.metrics.securityEvents}</div>
                  <div className="text-sm text-gray-400">Security Events</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{securityHealth.metrics.activeSessions}</div>
                  <div className="text-sm text-gray-400">Active Sessions</div>
                </div>
              </div>

              {/* Issues and Recommendations */}
              {securityHealth.issues.length > 0 && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Issues Detected:</strong> {securityHealth.issues.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {securityHealth.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Recommendations:</h4>
                  <ul className="space-y-1">
                    {securityHealth.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Security Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/80">
          <TabsTrigger value="overview" className="transition-all duration-200 hover:scale-105">
            <Shield className="w-4 h-4 mr-2" />
            Overview
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

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Biometric Status */}
            <Card className="bg-gray-800/80 border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5" />
                  Biometric Auth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <Badge variant={biometricStatus.isEnabled ? 'default' : 'secondary'}>
                      {biometricStatus.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Methods:</span>
                    <span className="text-sm text-white">{biometricStatus.methods.length}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleBiometricSetup('fingerprint')}
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    Setup Fingerprint
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Device Status */}
            <Card className="bg-gray-800/80 border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Trusted:</span>
                    <Badge variant={deviceStatus.isTrusted ? 'default' : 'destructive'}>
                      {deviceStatus.isTrusted ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Risk Score:</span>
                      <span className="text-sm text-white">{(deviceStatus.riskScore * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={deviceStatus.riskScore * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavioral Analysis */}
            <Card className="bg-gray-800/80 border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Behavioral Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <Badge variant={behavioralStatus.isAnalyzing ? 'secondary' : 'default'}>
                      {behavioralStatus.isAnalyzing ? 'Analyzing' : 'Active'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Anomaly:</span>
                    <Badge variant={behavioralStatus.anomalyDetected ? 'destructive' : 'default'}>
                      {behavioralStatus.anomalyDetected ? 'Detected' : 'None'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Confidence:</span>
                      <span className="text-sm text-white">{(behavioralStatus.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={behavioralStatus.confidence * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geo-fencing */}
            <Card className="bg-gray-800/80 border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Geo-fencing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Enabled:</span>
                    <Switch checked={geoFencingStatus.isEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Access:</span>
                    <Badge variant={geoFencingStatus.isAllowed ? 'default' : 'destructive'}>
                      {geoFencingStatus.isAllowed ? 'Allowed' : 'Blocked'}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleGeoFencingSetup}
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    Setup Geo-fencing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Time Restrictions */}
            <Card className="bg-gray-800/80 border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Enabled:</span>
                    <Switch checked={timeRestrictionsStatus.isEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Access:</span>
                    <Badge variant={timeRestrictionsStatus.isAllowed ? 'default' : 'destructive'}>
                      {timeRestrictionsStatus.isAllowed ? 'Allowed' : 'Blocked'}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleTimeRestrictionsSetup}
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    Setup Restrictions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Threats */}
            <Card className="bg-gray-800/80 border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Real-time Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Threats:</span>
                    <Badge variant={realTimeThreats?.threats.length ? 'destructive' : 'default'}>
                      {realTimeThreats?.threats.length || 0}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Risk Score:</span>
                      <span className="text-sm text-white">{(realTimeThreats?.riskScore || 0) * 100}%</span>
                    </div>
                    <Progress value={(realTimeThreats?.riskScore || 0) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Biometric Tab */}
        <TabsContent value="biometric" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Biometric Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                  <Fingerprint className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Fingerprint</h3>
                  <p className="text-sm text-gray-400 mb-4">Use your fingerprint for secure authentication</p>
                  <Button 
                    onClick={() => handleBiometricSetup('fingerprint')}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Setup
                  </Button>
                </div>
                <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                  <Eye className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Face Recognition</h3>
                  <p className="text-sm text-gray-400 mb-4">Use facial recognition for hands-free access</p>
                  <Button 
                    onClick={() => handleBiometricSetup('face')}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Setup
                  </Button>
                </div>
                <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                  <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Voice Recognition</h3>
                  <p className="text-sm text-gray-400 mb-4">Use your voice for secure authentication</p>
                  <Button 
                    onClick={() => handleBiometricSetup('voice')}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Tab */}
        <TabsContent value="device" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Device Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Device Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fingerprint:</span>
                      <span className="text-white font-mono text-xs">{deviceStatus.fingerprint?.substring(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trust Status:</span>
                      <Badge variant={deviceStatus.isTrusted ? 'default' : 'destructive'}>
                        {deviceStatus.isTrusted ? 'Trusted' : 'Untrusted'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Level:</span>
                      <Badge variant={deviceStatus.riskScore > 0.7 ? 'destructive' : 
                                     deviceStatus.riskScore > 0.3 ? 'secondary' : 'default'}>
                        {deviceStatus.riskScore > 0.7 ? 'High' : 
                         deviceStatus.riskScore > 0.3 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Risk Score:</span>
                      <span className="text-white">{(deviceStatus.riskScore * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={deviceStatus.riskScore * 100} className="h-3" />
                    <p className="text-xs text-gray-400">
                      {deviceStatus.riskScore > 0.7 ? 'High risk device detected. Consider additional verification.' :
                       deviceStatus.riskScore > 0.3 ? 'Medium risk device. Monitor for suspicious activity.' :
                       'Low risk device. Normal operation.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral Tab */}
        <TabsContent value="behavioral" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Behavioral Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Analysis Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge variant={behavioralStatus.isAnalyzing ? 'secondary' : 'default'}>
                        {behavioralStatus.isAnalyzing ? 'Analyzing' : 'Active'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Anomaly Detected:</span>
                      <Badge variant={behavioralStatus.anomalyDetected ? 'destructive' : 'default'}>
                        {behavioralStatus.anomalyDetected ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence Level:</span>
                      <span className="text-white">{(behavioralStatus.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Pattern Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Typing Pattern:</span>
                      <span className="text-white">Analyzing...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Mouse Movement:</span>
                      <span className="text-white">Analyzing...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Session Duration:</span>
                      <span className="text-white">Normal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Action Frequency:</span>
                      <span className="text-white">Normal</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Geo-fencing & Location Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Current Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Geo-fencing:</span>
                      <Badge variant={geoFencingStatus.isEnabled ? 'default' : 'secondary'}>
                        {geoFencingStatus.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Access Allowed:</span>
                      <Badge variant={geoFencingStatus.isAllowed ? 'default' : 'destructive'}>
                        {geoFencingStatus.isAllowed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance from Zone:</span>
                      <span className="text-white">{geoFencingStatus.distance.toFixed(2)} km</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Setup Geo-fencing</h3>
                  <p className="text-sm text-gray-400">
                    Define allowed locations and radius for secure access. Only devices within these zones will be allowed.
                  </p>
                  <Button 
                    onClick={handleGeoFencingSetup}
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Setup Geo-fencing Zones
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tab */}
        <TabsContent value="time" className="space-y-4">
          <Card className="bg-gray-800/80 border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Time-based Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Current Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Restrictions:</span>
                      <Badge variant={timeRestrictionsStatus.isEnabled ? 'default' : 'secondary'}>
                        {timeRestrictionsStatus.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Access Allowed:</span>
                      <Badge variant={timeRestrictionsStatus.isAllowed ? 'default' : 'destructive'}>
                        {timeRestrictionsStatus.isAllowed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {timeRestrictionsStatus.reason && (
                      <div className="text-sm text-red-400">
                        Reason: {timeRestrictionsStatus.reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Setup Time Restrictions</h3>
                  <p className="text-sm text-gray-400">
                    Define allowed time windows for each day of the week. Access will be restricted outside these hours.
                  </p>
                  <Button 
                    onClick={handleTimeRestrictionsSetup}
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Setup Time Windows
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSecurityDashboard; 