import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabaseATMService } from '../services/supabaseATMService';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CreditCard, Eye, EyeOff, User, Mail, Loader2 } from 'lucide-react';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { refreshUser } = useSupabaseATM();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Input validation
    if (!email || !email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!password || !password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // For signup, validate name
    if (!isLogin && (!name || !name.trim())) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
<<<<<<< HEAD
        console.log('Attempting login with:', email);
        const result = await supabaseATMService.authenticate(email, password);
        console.log('Login result:', result);
        
        if (result.success) {
          setSuccessMessage('Login successful! Redirecting...');
          // Refresh user data in context
          await refreshUser();
          setTimeout(() => {
            onAuthSuccess();
          }, 1000);
        } else {
          setError(result.message);
        }
      } else {
        // For signup, we'll use Supabase auth directly since we need to handle email verification
=======
        console.log('🔐 Attempting login with:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('❌ Login error:', error);
          setError(error.message);
        } else if (data.user) {
          console.log('✅ Login successful:', data.user.email);
          // Don't call onAuthSuccess immediately - let the auth state change handle it
          console.log('✅ Auth state will handle navigation');
        }
      } else {
        console.log('📝 Attempting signup with:', email);
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: name,
              username: email.split('@')[0]
            }
          }
        });
        
        if (error) {
          console.error('❌ Signup error:', error);
          setError(error.message);
<<<<<<< HEAD
        } else {
          setSuccessMessage('Account created! Please check your email for verification link.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
=======
        } else if (data.user) {
          console.log('✅ Signup successful:', data.user.email);
          if (data.user.email_confirmed_at) {
            // User is immediately confirmed
            console.log('✅ User confirmed, auth state will handle navigation');
          } else {
            // User needs to confirm email
            setError('Please check your email for verification link');
          }
        }
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      setError('An unexpected error occurred');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-scale-in relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            ATM Genesis
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Secure Banking Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="pl-10 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-10 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="pl-10 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4 animate-slide-in-right">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="default" className="mt-4 animate-slide-in-right bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
              <Shield className="w-4 h-4" />
              Demo Accounts (for testing)
            </div>
<<<<<<< HEAD
            <div className="text-xs space-y-1 text-gray-500 dark:text-gray-400">
              <div>Email: john@example.com / Password: password123</div>
              <div>Email: admin@example.com / Password: admin123</div>
=======
            <div className="text-xs space-y-1 text-gray-500">
              <div>Regular User: john@example.com / password123</div>
              <div>Admin User: admin@example.com / admin123</div>
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
