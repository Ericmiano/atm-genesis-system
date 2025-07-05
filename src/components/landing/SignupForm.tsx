
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentUpload {
  file: File | null;
  preview: string | null;
  uploaded: boolean;
}

const SignupForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Kenyan',
    
    // Address Information
    county: '',
    city: '',
    address: '',
    postalCode: '',
    
    // Identity Information
    idType: '',
    idNumber: '',
    kraPin: '',
    
    // Employment Information
    employmentStatus: '',
    monthlyIncome: '',
    employer: '',
    
    // Terms
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false
  });

  const [documents, setDocuments] = useState<{
    nationalId: DocumentUpload;
    passport: DocumentUpload;
    photo: DocumentUpload;
    selfie: DocumentUpload;
    proofOfResidence: DocumentUpload;
    kraPin: DocumentUpload;
  }>({
    nationalId: { file: null, preview: null, uploaded: false },
    passport: { file: null, preview: null, uploaded: false },
    photo: { file: null, preview: null, uploaded: false },
    selfie: { file: null, preview: null, uploaded: false },
    proofOfResidence: { file: null, preview: null, uploaded: false },
    kraPin: { file: null, preview: null, uploaded: false }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (documentType: keyof typeof documents, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          file,
          preview: e.target?.result as string,
          uploaded: true
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && 
               formData.password && formData.confirmPassword && formData.phoneNumber &&
               formData.password === formData.confirmPassword;
      case 2:
        return formData.county && formData.city && formData.address;
      case 3:
        const requiredDocs = formData.nationality === 'Kenyan' 
          ? ['nationalId', 'photo', 'selfie', 'proofOfResidence']
          : ['passport', 'photo', 'selfie', 'proofOfResidence'];
        return requiredDocs.every(doc => documents[doc as keyof typeof documents].uploaded);
      case 4:
        return formData.idType && formData.idNumber && (formData.nationality !== 'Kenyan' || formData.kraPin);
      case 5:
        return formData.employmentStatus && formData.monthlyIncome;
      case 6:
        return formData.acceptTerms && formData.acceptPrivacy;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            phone_number: formData.phoneNumber,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            nationality: formData.nationality,
            kyc_status: 'pending'
          });

        if (profileError) throw profileError;

        // Upload KYC documents (in a real app, you'd upload to storage)
        const documentTypes = Object.keys(documents).filter(
          key => documents[key as keyof typeof documents].uploaded
        );

        for (const docType of documentTypes) {
          await supabase
            .from('kyc_documents')
            .insert({
              user_id: authData.user.id,
              document_type: docType,
              document_url: 'pending_upload', // Would be actual URL in production
              document_number: docType === 'nationalId' ? formData.idNumber : undefined,
              status: 'pending'
            });
        }

        toast.success('Account created successfully! Please check your email to verify your account.');
        setCurrentStep(7); // Success step
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A237E] mb-2">Personal Information</h2>
              <p className="text-gray-600">Let's start with your basic information</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+254 7XX XXX XXX"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kenyan">Kenyan</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A237E] mb-2">Address Information</h2>
              <p className="text-gray-600">Where can we reach you?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="county">County *</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => handleInputChange('county', e.target.value)}
                  placeholder="e.g., Nairobi"
                />
              </div>
              <div>
                <Label htmlFor="city">City/Town *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Westlands"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Physical Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your physical address"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="e.g., 00100"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A237E] mb-2">Document Upload</h2>
              <p className="text-gray-600">Upload your identification documents</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {formData.nationality === 'Kenyan' && (
                <Card className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">National ID *</h3>
                    {documents.nationalId.preview ? (
                      <div className="relative">
                        <img src={documents.nationalId.preview} alt="National ID" className="w-full h-32 object-cover rounded" />
                        <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500" />
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-[#1A237E] transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload ID</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('nationalId', e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </Card>
              )}

              {formData.nationality !== 'Kenyan' && (
                <Card className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">Passport/Alien ID *</h3>
                    {documents.passport.preview ? (
                      <div className="relative">
                        <img src={documents.passport.preview} alt="Passport" className="w-full h-32 object-cover rounded" />
                        <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500" />
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-[#1A237E] transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload document</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('passport', e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Passport Photo *</h3>
                  {documents.photo.preview ? (
                    <div className="relative">
                      <img src={documents.photo.preview} alt="Photo" className="w-full h-32 object-cover rounded" />
                      <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500" />
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-[#1A237E] transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('photo', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Selfie for Verification *</h3>
                  {documents.selfie.preview ? (
                    <div className="relative">
                      <img src={documents.selfie.preview} alt="Selfie" className="w-full h-32 object-cover rounded" />
                      <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500" />
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-[#1A237E] transition-colors">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Take a selfie</p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Proof of Residence *</h3>
                  {documents.proofOfResidence.preview ? (
                    <div className="relative">
                      <img src={documents.proofOfResidence.preview} alt="Proof of Residence" className="w-full h-32 object-cover rounded" />
                      <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500" />
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-[#1A237E] transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Utility bill/lease agreement</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('proofOfResidence', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </Card>

              {formData.nationality === 'Kenyan' && (
                <Card className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">KRA PIN Certificate</h3>
                    {documents.kraPin.preview ? (
                      <div className="relative">
                        <img src={documents.kraPin.preview} alt="KRA PIN" className="w-full h-32 object-cover rounded" />
                        <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500" />
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-[#1A237E] transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Upload KRA PIN certificate</p>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('kraPin', e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A237E] mb-2">Identity Verification</h2>
              <p className="text-gray-600">Provide your identification details</p>
            </div>

            <div>
              <Label htmlFor="idType">ID Type *</Label>
              <Select onValueChange={(value) => handleInputChange('idType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="alien_id">Alien ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idNumber">ID Number *</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                placeholder="Enter your ID number"
              />
            </div>

            {formData.nationality === 'Kenyan' && (
              <div>
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input
                  id="kraPin"
                  value={formData.kraPin}
                  onChange={(e) => handleInputChange('kraPin', e.target.value)}
                  placeholder="Enter your KRA PIN"
                />
                <p className="text-sm text-gray-500 mt-1">Required for most account types</p>
              </div>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A237E] mb-2">Employment Information</h2>
              <p className="text-gray-600">Help us understand your financial profile</p>
            </div>

            <div>
              <Label htmlFor="employmentStatus">Employment Status *</Label>
              <Select onValueChange={(value) => handleInputChange('employmentStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self_employed">Self Employed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (KSh) *</Label>
              <Select onValueChange={(value) => handleInputChange('monthlyIncome', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-20000">0 - 20,000</SelectItem>
                  <SelectItem value="20000-50000">20,000 - 50,000</SelectItem>
                  <SelectItem value="50000-100000">50,000 - 100,000</SelectItem>
                  <SelectItem value="100000-200000">100,000 - 200,000</SelectItem>
                  <SelectItem value="200000+">200,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.employmentStatus === 'employed' || formData.employmentStatus === 'self_employed') && (
              <div>
                <Label htmlFor="employer">Employer/Business Name</Label>
                <Input
                  id="employer"
                  value={formData.employer}
                  onChange={(e) => handleInputChange('employer', e.target.value)}
                  placeholder="Enter employer or business name"
                />
              </div>
            )}
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A237E] mb-2">Terms & Conditions</h2>
              <p className="text-gray-600">Please review and accept our terms</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                />
                <div className="text-sm">
                  <Label htmlFor="acceptTerms" className="cursor-pointer">
                    I accept the <a href="#" className="text-[#1A237E] underline">Terms and Conditions</a> *
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) => handleInputChange('acceptPrivacy', checked)}
                />
                <div className="text-sm">
                  <Label htmlFor="acceptPrivacy" className="cursor-pointer">
                    I accept the <a href="#" className="text-[#1A237E] underline">Privacy Policy</a> *
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptMarketing"
                  checked={formData.acceptMarketing}
                  onCheckedChange={(checked) => handleInputChange('acceptMarketing', checked)}
                />
                <div className="text-sm">
                  <Label htmlFor="acceptMarketing" className="cursor-pointer">
                    I agree to receive marketing communications (optional)
                  </Label>
                </div>
              </div>
            </div>

            <Card className="p-6 bg-blue-50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Account Opening Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Minimum age: 18 years</li>
                    <li>Valid identification documents</li>
                    <li>Proof of residence (not older than 3 months)</li>
                    <li>KRA PIN certificate (for Kenyan citizens)</li>
                    <li>Minimum opening balance: KSh 500</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-[#1A237E] mb-4">Account Created Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your account has been created and is currently under review. You'll receive an email confirmation shortly.
              </p>
              
              <Card className="p-6 bg-yellow-50 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-2">What happens next?</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>We'll verify your documents (usually within 24-48 hours)</li>
                      <li>You'll receive an email once verification is complete</li>
                      <li>You can then make your first deposit and start banking</li>
                    </ol>
                  </div>
                </div>
              </Card>

              <Button
                size="lg"
                className="bg-[#1A237E] hover:bg-[#151C66]"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1A237E] mb-2">Open Your Account</h1>
            <p className="text-gray-600">Join thousands of satisfied customers</p>
          </div>

          {/* Progress indicator */}
          {currentStep < 7 && (
            <div className="mb-12">
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step <= currentStep
                          ? 'bg-[#1A237E] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step}
                    </div>
                    <div className="text-xs mt-2 text-gray-500">
                      {step === 1 && 'Personal'}
                      {step === 2 && 'Address'}
                      {step === 3 && 'Documents'}
                      {step === 4 && 'Identity'}
                      {step === 5 && 'Employment'}
                      {step === 6 && 'Terms'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#1A237E] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <Card className="p-8">
            {renderStep()}

            {currentStep < 7 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8"
                >
                  Previous
                </Button>
                
                {currentStep === 6 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep(currentStep) || loading}
                    className="bg-[#1A237E] hover:bg-[#151C66] px-8"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-[#1A237E] hover:bg-[#151C66] px-8"
                  >
                    Next
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
