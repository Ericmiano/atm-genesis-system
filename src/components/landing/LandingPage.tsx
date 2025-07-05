import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Shield, Zap, Users, Star, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-[#FFD600]" />,
      title: "M-Pesa Integration", 
      description: "Seamless money transfers, bill payments, and airtime purchases through M-Pesa"
    },
    {
      icon: <Shield className="w-8 h-8 text-[#00C853]" />,
      title: "Secure Banking",
      description: "Bank-grade security with biometric authentication and real-time fraud detection"
    },
    {
      icon: <Users className="w-8 h-8 text-[#FF4081]" />,
      title: "Personal Loans",
      description: "Quick loan approvals with competitive rates and flexible repayment terms"
    }
  ];

  const benefits = [
    "Lightning-fast transactions in under 30 seconds",
    "24/7 customer support and banking access", 
    "Zero maintenance fees for basic accounts",
    "Advanced security with biometric verification",
    "Instant loan approvals with AI-powered credit scoring",
    "Seamless M-Pesa integration for all transactions"
  ];

  const steps = [
    {
      step: "01",
      title: "Register",
      description: "Sign up with your National ID and complete KYC verification"
    },
    {
      step: "02", 
      title: "Verify",
      description: "Upload documents and complete biometric verification"
    },
    {
      step: "03",
      title: "Bank",
      description: "Start banking with M-Pesa, loans, and secure transactions"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Wanjiku",
      role: "Small Business Owner",
      content: "ATM Genesis transformed my business banking. The M-Pesa integration makes payments seamless!",
      rating: 5
    },
    {
      name: "John Kamau",
      role: "Freelancer", 
      content: "Got my loan approved in minutes. The mobile app is incredibly user-friendly.",
      rating: 5
    },
    {
      name: "Grace Akinyi",
      role: "Teacher",
      content: "Finally, a bank that understands Kenya. No hidden fees and excellent customer service.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How secure is my money with ATM Genesis?",
      answer: "We use bank-grade security with 256-bit encryption, biometric authentication, and real-time fraud monitoring to protect your funds."
    },
    {
      question: "Can I use M-Pesa for all transactions?",
      answer: "Yes! Our platform is fully integrated with M-Pesa for deposits, withdrawals, transfers, and bill payments."
    },
    {
      question: "How quickly can I get a loan?",
      answer: "Loan approvals are typically instant for qualified applicants, with funds disbursed within 24 hours."
    },
    {
      question: "What documents do I need to open an account?",
      answer: "You'll need a National ID/Passport, KRA PIN certificate, proof of residence, and a passport photo."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A237E] to-[#151C66] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-md z-50 border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-[#FFD600]"
            >
              ATM Genesis
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="hover:text-[#FFD600] transition-colors">Home</a>
              <a href="#products" className="hover:text-[#FFD600] transition-colors">Products</a>
              <a href="#loans" className="hover:text-[#FFD600] transition-colors">Loans</a>
              <a href="#contact" className="hover:text-[#FFD600] transition-colors">Contact</a>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-[#FF4081] hover:bg-[#CC3368] text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 mb-12 lg:mb-0"
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Banking
                <span className="text-[#FFD600]"> Reimagined</span>
                <br />for Kenya
              </h1>
              <p className="text-xl mb-8 text-gray-300 leading-relaxed">
                Experience the future of banking with M-Pesa integration, instant loans, 
                and secure transactions. Built specifically for Kenyan needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/signup')}
                  className="bg-[#FFD600] hover:bg-[#CCAD00] text-[#1A237E] font-semibold"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="border-white text-white hover:bg-white hover:text-[#1A237E]"
                >
                  Sign In
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-[#FF4081] to-[#FFD600] p-8 rounded-3xl transform rotate-3 shadow-2xl">
                  <div className="bg-white rounded-2xl p-6 -rotate-3">
                    <div className="text-[#1A237E] text-center">
                      <div className="text-4xl font-bold mb-2">KSh 125,450</div>
                      <div className="text-gray-600">Available Balance</div>
                      <div className="mt-4 flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-[#00C853] rounded-full"></div>
                        <div className="w-3 h-3 bg-[#FF4081] rounded-full"></div>
                        <div className="w-3 h-3 bg-[#FFD600] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300">Everything you need for modern banking</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-center mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 mb-12 lg:mb-0"
            >
              <h2 className="text-4xl font-bold mb-6">Why Choose ATM Genesis?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <CheckCircle className="w-6 h-6 text-[#00C853] mr-4 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-[#FF4081] to-[#FFD600] p-1 rounded-3xl">
                  <div className="bg-[#1A237E] p-8 rounded-3xl">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-[#FFD600] mb-2">99.9%</div>
                      <div className="text-xl text-white mb-4">Uptime Guarantee</div>
                      <div className="text-gray-300">Your money, always accessible</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-300">Get started in just three simple steps</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF4081] to-[#FFD600] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-300">Real stories from real people</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#FFD600] fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-gray-400">{testimonial.role}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FF4081] to-[#FFD600]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Transform Your Banking?</h2>
            <p className="text-xl mb-8 text-white/90">Join thousands of satisfied customers today</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="bg-white text-[#1A237E] hover:bg-gray-100 font-semibold"
              >
                Create Account
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="bg-white text-[#1A237E] hover:bg-gray-100 font-semibold"
              >
                Sign In Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Everything you need to know</p>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-6"
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <h3 className="text-xl font-bold mb-3 text-white">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">About ATM Genesis</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                ATM Genesis is Kenya's premier digital banking platform, designed specifically for the modern Kenyan. 
                Our mission is to democratize financial services and make banking accessible, secure, and convenient for everyone.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Founded by financial technology experts with deep understanding of the Kenyan market, we combine 
                cutting-edge technology with local insights to deliver banking solutions that truly serve our customers' needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-black/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-gray-300">We're here to help you succeed</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#FFD600] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#1A237E]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-gray-300">+254 700 123 456</p>
              <p className="text-gray-300">Available 24/7</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#FF4081] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-gray-300">support@atmgenesis.co.ke</p>
              <p className="text-gray-300">Response within 2 hours</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-gray-300">Westlands, Nairobi</p>
              <p className="text-gray-300">Mon-Fri 8AM-6PM</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#151C66] py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-[#FFD600] mb-4">ATM Genesis</div>
              <p className="text-gray-400">
                Banking reimagined for the modern Kenyan. Secure, fast, and always available.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li>M-Pesa Banking</li>
                <li>Personal Loans</li>
                <li>Business Accounts</li>
                <li>Savings Accounts</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Security Center</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ATM Genesis. All rights reserved. Licensed by Central Bank of Kenya.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
