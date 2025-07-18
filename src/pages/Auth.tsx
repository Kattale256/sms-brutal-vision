import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Smartphone } from 'lucide-react';
import AISecurityBadge from '@/components/AISecurityBadge';
const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const {
    signIn,
    signUp,
    user,
    loading: authLoading
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', {
        replace: true
      });
    }
  }, [user, authLoading, navigate]);
  if (authLoading) {
    return <div className="min-h-screen bg-silver-light flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-neo-yellow" />
          <p className="text-sm text-gray-600 font-medium">Initializing...</p>
        </div>
      </div>;
  }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await signIn({
        email: loginData.email,
        password: loginData.password
      });
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "An error occurred during login.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in."
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.email || !signupData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await signUp({
        email: signupData.email,
        password: signupData.password,
        fullName: signupData.fullName
      });
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please login instead.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Signup Failed",
            description: error.message || "An error occurred during signup.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Account Created!",
          description: "You have successfully created your account and can start using the app."
        });
        setSignupData({
          email: '',
          password: '',
          fullName: ''
        });
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-silver-light flex flex-col">
      {/* AI Security Badge at the very top */}
      <div className="flex justify-center pt-4 pb-2">
        <AISecurityBadge />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 my-0 mx-0">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-neo-yellow rounded-3xl border-4 border-neo-black shadow-neo-sm mb-6">
              <Smartphone className="h-10 w-10 text-neo-black" />
            </div>
            <h1 className="text-3xl font-bold text-neo-black mb-2 tracking-tight">AKAMEME
AKAMOMO
TAX APP</h1>
            <p className="text-gray-600 font-medium text-center">Know The Tax On Your Mobile Money Transactions
- Safely & Easily -</p>
          </div>

          <Card className="border-4 border-neo-black shadow-neo bg-white rounded-2xl overflow-hidden">
            <CardHeader className="text-center py-8 bg-gradient-to-r from-silver-light to-white">
              <CardTitle className="text-xl font-bold text-neo-black">Welcome</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Create a new account or sign in to existing one
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-silver p-1 rounded-xl border-2 border-neo-black">
                  <TabsTrigger value="signup" className="rounded-xl font-semibold data-[state=active]:bg-neo-yellow data-[state=active]:text-neo-black data-[state=active]:shadow-neo-sm transition-all">Sign Up</TabsTrigger>
                  <TabsTrigger value="login" className="rounded-xl font-semibold data-[state=active]:bg-neo-yellow data-[state=active]:text-neo-black data-[state=active]:shadow-neo-sm transition-all">Log In</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700">User Name</Label>
                      <Input id="signup-name" type="text" placeholder="Enter your user name" value={signupData.fullName} onChange={e => setSignupData({
                      ...signupData,
                      fullName: e.target.value
                    })} disabled={isLoading} className="h-12 border-2 border-gray-200 rounded-xl focus:border-neo-yellow focus:ring-0 transition-colors font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">Email</Label>
                      <Input id="signup-email" type="email" placeholder="Enter your email" value={signupData.email} onChange={e => setSignupData({
                      ...signupData,
                      email: e.target.value
                    })} required disabled={isLoading} className="h-12 border-2 border-gray-200 rounded-xl focus:border-neo-yellow focus:ring-0 transition-colors font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">Password</Label>
                      <Input id="signup-password" type="password" placeholder="Create a password" value={signupData.password} onChange={e => setSignupData({
                      ...signupData,
                      password: e.target.value
                    })} required disabled={isLoading} className="h-12 border-2 border-gray-200 rounded-xl focus:border-neo-yellow focus:ring-0 transition-colors font-medium" />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-neo-yellow hover:bg-yellow-400 text-neo-black font-bold rounded-xl border-2 border-neo-black shadow-neo-sm hover:shadow-neo transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-none" disabled={isLoading}>
                      {isLoading ? <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating Account...
                        </> : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">Email</Label>
                      <Input id="login-email" type="email" placeholder="Enter your email" value={loginData.email} onChange={e => setLoginData({
                      ...loginData,
                      email: e.target.value
                    })} required disabled={isLoading} className="h-12 border-2 border-gray-200 rounded-xl focus:border-neo-yellow focus:ring-0 transition-colors font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">Password</Label>
                      <Input id="login-password" type="password" placeholder="Enter your password" value={loginData.password} onChange={e => setLoginData({
                      ...loginData,
                      password: e.target.value
                    })} required disabled={isLoading} className="h-12 border-2 border-gray-200 rounded-xl focus:border-neo-yellow focus:ring-0 transition-colors font-medium" />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-neo-yellow hover:bg-yellow-400 text-neo-black font-bold rounded-xl border-2 border-neo-black shadow-neo-sm hover:shadow-neo transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-none" disabled={isLoading}>
                      {isLoading ? <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Signing In...
                        </> : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer with AI Security Badge at the very bottom */}
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 font-medium">
          Built By <span className="font-bold text-neo-black">KATTALE GROUP (UG) EST. 2015</span>
        </p>
        <div className="flex justify-center mt-2">
          <AISecurityBadge variant="minimal" />
        </div>
      </div>
    </div>;
};
export default Auth;