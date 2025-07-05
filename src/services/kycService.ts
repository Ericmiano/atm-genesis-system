import { supabase } from '@/integrations/supabase/client';

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'national_id' | 'passport' | 'alien_id' | 'photo' | 'selfie' | 'proof_of_residence' | 'kra_pin';
  documentUrl?: string;
  documentNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality: string;
  kycStatus: 'incomplete' | 'pending' | 'approved' | 'rejected';
  accountTier: 'basic' | 'premium' | 'business';
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export class KYCService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? {
        id: data.id,
        userId: data.user_id,
        phoneNumber: data.phone_number,
        dateOfBirth: data.date_of_birth,
        gender: data.gender as UserProfile['gender'],
        nationality: data.nationality,
        kycStatus: data.kyc_status as UserProfile['kycStatus'],
        accountTier: data.account_tier as UserProfile['accountTier'],
        biometricEnabled: data.biometric_enabled,
        twoFactorEnabled: data.two_factor_enabled,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } : null;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  async createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: profileData.userId,
          phone_number: profileData.phoneNumber,
          date_of_birth: profileData.dateOfBirth,
          gender: profileData.gender,
          nationality: profileData.nationality || 'Kenyan',
          kyc_status: 'incomplete',
          account_tier: 'basic',
          biometric_enabled: false,
          two_factor_enabled: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        phoneNumber: data.phone_number,
        dateOfBirth: data.date_of_birth,
        gender: data.gender as UserProfile['gender'],
        nationality: data.nationality,
        kycStatus: data.kyc_status as UserProfile['kycStatus'],
        accountTier: data.account_tier as UserProfile['accountTier'],
        biometricEnabled: data.biometric_enabled,
        twoFactorEnabled: data.two_factor_enabled,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Create user profile error:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          phone_number: profileData.phoneNumber,
          date_of_birth: profileData.dateOfBirth,
          gender: profileData.gender,
          nationality: profileData.nationality,
          kyc_status: profileData.kycStatus,
          account_tier: profileData.accountTier,
          biometric_enabled: profileData.biometricEnabled,
          two_factor_enabled: profileData.twoFactorEnabled
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update user profile error:', error);
      return false;
    }
  }

  async uploadKYCDocument(documentData: {
    userId: string;
    documentType: KYCDocument['documentType'];
    documentUrl?: string;
    documentNumber?: string;
  }): Promise<KYCDocument | null> {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: documentData.userId,
          document_type: documentData.documentType,
          document_url: documentData.documentUrl,
          document_number: documentData.documentNumber,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        documentType: data.document_type as KYCDocument['documentType'],
        documentUrl: data.document_url,
        documentNumber: data.document_number,
        status: data.status as KYCDocument['status'],
        verificationNotes: data.verification_notes,
        uploadedAt: data.uploaded_at,
        verifiedAt: data.verified_at
      };
    } catch (error) {
      console.error('Upload KYC document error:', error);
      return null;
    }
  }

  async getUserKYCDocuments(userId: string): Promise<KYCDocument[]> {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return data.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        documentType: doc.document_type as KYCDocument['documentType'],
        documentUrl: doc.document_url,
        documentNumber: doc.document_number,
        status: doc.status as KYCDocument['status'],
        verificationNotes: doc.verification_notes,
        uploadedAt: doc.uploaded_at,
        verifiedAt: doc.verified_at
      }));
    } catch (error) {
      console.error('Get user KYC documents error:', error);
      return [];
    }
  }

  async verifyKYCDocument(documentId: string, status: 'approved' | 'rejected', notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('kyc_documents')
        .update({
          status,
          verification_notes: notes,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Verify KYC document error:', error);
      return false;
    }
  }

  async updateKYCStatus(userId: string, status: UserProfile['kycStatus']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ kyc_status: status })
        .eq('user_id', userId);

      if (error) throw error;

      // Create notification for status change
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'kyc',
          title: 'KYC Status Update',
          message: `Your KYC verification status has been updated to: ${status}`,
          priority: 'medium'
        });

      return true;
    } catch (error) {
      console.error('Update KYC status error:', error);
      return false;
    }
  }

  async validateNationalId(idNumber: string): Promise<{ valid: boolean; message: string }> {
    // Basic validation for Kenyan National ID
    const idRegex = /^\d{8}$/;
    
    if (!idRegex.test(idNumber)) {
      return {
        valid: false,
        message: 'National ID must be 8 digits'
      };
    }

    // In a real implementation, you would integrate with eCitizen or National Registration Bureau API
    return {
      valid: true,
      message: 'Valid National ID format'
    };
  }

  async validateKRAPin(kraPin: string): Promise<{ valid: boolean; message: string }> {
    // Basic validation for KRA PIN
    const kraRegex = /^[A-Z]\d{9}[A-Z]$/;
    
    if (!kraRegex.test(kraPin)) {
      return {
        valid: false,
        message: 'KRA PIN format should be: Letter + 9 digits + Letter (e.g., A123456789Z)'
      };
    }

    // In a real implementation, you would integrate with KRA API
    return {
      valid: true,
      message: 'Valid KRA PIN format'
    };
  }

  async performFacialRecognition(selfieUrl: string, idPhotoUrl: string): Promise<{ match: boolean; confidence: number }> {
    // Mock facial recognition - in production, use AWS Rekognition, Azure Face API, etc.
    console.log('Performing facial recognition comparison between:', selfieUrl, 'and', idPhotoUrl);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock result with high confidence
    return {
      match: true,
      confidence: 0.95
    };
  }

  async checkCRBStatus(userId: string, idNumber: string): Promise<{ 
    hasRecords: boolean; 
    creditScore?: number; 
    riskLevel: 'low' | 'medium' | 'high' 
  }> {
    // Mock CRB check - in production, integrate with Metropol, TransUnion, CRB Africa APIs
    console.log('Checking CRB status for user:', userId, 'with ID:', idNumber);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock result
    return {
      hasRecords: false,
      creditScore: 720,
      riskLevel: 'low'
    };
  }

  async sendVerificationSMS(phoneNumber: string, code: string): Promise<boolean> {
    try {
      // Mock SMS sending - in production, use Africa's Talking, Twilio, etc.
      console.log(`Sending SMS verification code ${code} to ${phoneNumber}`);
      
      // In a real implementation:
      // const response = await fetch('https://api.africastalking.com/version1/messaging', {
      //   method: 'POST',
      //   headers: { ... },
      //   body: { to: phoneNumber, message: `Your verification code is: ${code}` }
      // });
      
      return true;
    } catch (error) {
      console.error('Send verification SMS error:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
      // Mock email sending - in production, use SendGrid, Mailgun, etc.
      console.log(`Sending email verification code ${code} to ${email}`);
      
      // In a real implementation:
      // await emailProvider.send({
      //   to: email,
      //   subject: 'Verify your ATM Genesis account',
      //   html: `<p>Your verification code is: <strong>${code}</strong></p>`
      // });
      
      return true;
    } catch (error) {
      console.error('Send verification email error:', error);
      return false;
    }
  }

  async generateVerificationCode(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async getKYCRequirements(nationality: string): Promise<{
    requiredDocuments: string[];
    optionalDocuments: string[];
    additionalRequirements: string[];
  }> {
    if (nationality === 'Kenyan') {
      return {
        requiredDocuments: [
          'National ID',
          'Passport-size photo',
          'Selfie for biometric verification',
          'Proof of residence (utility bill/lease agreement)',
          'KRA PIN certificate'
        ],
        optionalDocuments: [
          'Employment letter',
          'Bank statements'
        ],
        additionalRequirements: [
          'Minimum age: 18 years',
          'Valid Kenyan National ID',
          'Active phone number',
          'Email address'
        ]
      };
    } else {
      return {
        requiredDocuments: [
          'Passport or Alien ID',
          'Passport-size photo',
          'Selfie for biometric verification',
          'Proof of residence',
          'Work permit (if applicable)'
        ],
        optionalDocuments: [
          'Employment letter',
          'Bank statements'
        ],
        additionalRequirements: [
          'Minimum age: 18 years',
          'Valid passport or alien registration',
          'Active phone number',
          'Email address'
        ]
      };
    }
  }
}

export const kycService = new KYCService();
