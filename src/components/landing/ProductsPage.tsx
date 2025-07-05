
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, CreditCard, PiggyBank, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ProductsPage = () => {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-[#FFD600]" />,
      title: "M-Pesa Integration",
      description: "Seamless integration with M-Pesa for all your mobile money needs"
    },
    {
      icon: <CreditCard className="w-12 h-12 text-[#FF4081]" />,
      title: "Instant Loans",
      description: "Get approved for loans in minutes with competitive rates"
    },
    {
      icon: <Shield className="w-12 h-12 text-[#00C853]" />,
      title: "Overdraft Protection",
      description: "Never worry about insufficient funds with automatic overdraft"
    },
    {
      icon: <PiggyBank className="w-12 h-12 text-[#1A237E]" />,
      title: "Smart Savings",
      description: "Automated savings with high-yield returns and goal tracking"
    }
  ];

  const mpesaFeatures = [
    "Send money to any M-Pesa user instantly",
    "Pay bills directly from your account",
    "Buy airtime and data bundles",
    "Withdraw cash from any M-Pesa agent",
    "Deposit funds using M-Pesa",
    "Zero transaction fees for basic transfers"
  ];

  const loanTypes = [
    {
      type: "Personal Loans",
      rate: "12% - 18%",
      amount: "KSh 5,000 - 1,000,000",
      period: "3 - 36 months"
    },
    {
      type: "Business Loans",
      rate: "15% - 22%",
      amount: "KSh 10,000 - 5,000,000",
      period: "6 - 60 months"
    },
    {
      type: "Emergency Loans",
      rate: "18% - 25%",
      amount: "KSh 1,000 - 100,000",
      period: "1 - 12 months"
    }
  ];

  const benefits = [
    "Competitive interest rates starting from 12%",
    "Instant loan approvals with AI credit scoring",
    "Flexible repayment terms up to 5 years",
    "No hidden fees or charges",
    "24/7 customer support",
    "Mobile-first banking experience"
  ];

  const testimonials = [
    {
      name: "Mary Njeri",
      role: "Small Business Owner",
      content: "The M-Pesa integration is seamless. I can manage all my business payments from one place.",
      rating: 5
    },
    {
      name: "David Kiprotich",
      role: "Freelancer",
      content: "Got my emergency loan approved in 5 minutes. The app is incredibly user-friendly.",
      rating: 5
    },
    {
      name: "Susan Wanjiku",
      role: "Teacher",
      content: "The overdraft feature saved me from embarrassment. Highly recommended!",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How does M-Pesa integration work?",
      answer: "Our platform connects directly with M-Pesa, allowing you to send money, pay bills, and manage transactions seamlessly from your ATM Genesis account."
    },
    {
      question: "What are the loan requirements?",
      answer: "You need to be 18+ years old, have a valid ID, proof of income, and a good credit history with us or other financial institutions."
    },
    {
      question: "How does overdraft protection work?",
      answer: "When you don't have sufficient funds for a transaction, we automatically provide a small loan to cover the amount, up to your approved limit."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees! All charges are clearly stated upfront. We believe in transparent pricing for all our services."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-[#1A237E]">ATM Genesis</div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-[#1A237E] transition-colors">Home</a>
              <a href="/products" className="text-[#1A237E] font-semibold">Products</a>
              <a href="/loans" className="text-gray-600 hover:text-[#1A237E] transition-colors">Loans</a>
              <a href="/contact" className="text-gray-600 hover:text-[#1A237E] transition-colors">Contact</a>
              <Button className="bg-[#FF4081] hover:bg-[#CC3368] text-white">Sign In</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-[#1A237E] to-[#151C66] text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-bold mb-6">Banking Products & Services</h1>
            <p className="text-xl text-gray-300 mb-8">
              Comprehensive financial solutions designed for modern Kenya
            </p>
            <Button size="lg" className="bg-[#FFD600] hover:bg-[#CCAD00] text-[#1A237E] font-semibold">
              Explore Products <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1A237E] mb-4">Our Core Products</h2>
            <p className="text-xl text-gray-600">Everything you need for comprehensive banking</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-[#1A237E]">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* M-Pesa Feature Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-4xl font-bold text-[#1A237E] mb-6">M-Pesa Integration</h2>
              <p className="text-xl text-gray-600 mb-8">
                Experience seamless mobile money transactions with our comprehensive M-Pesa integration.
              </p>
              
              <div className="space-y-4">
                {mpesaFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <div className="w-3 h-3 bg-[#FFD600] rounded-full mr-4"></div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#FFD600] to-[#CCAD00] p-8 rounded-3xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#1A237E] mb-4">M-Pesa Dashboard</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>Send Money</span>
                        <span className="text-[#00C853]">Available</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>Pay Bills</span>
                        <span className="text-[#00C853]">Available</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>Buy Airtime</span>
                        <span className="text-[#00C853]">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Loans Feature Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1A237E] mb-4">Loan Products</h2>
            <p className="text-xl text-gray-600">Flexible financing solutions for every need</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {loanTypes.map((loan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-[#1A237E] mb-4">{loan.type}</h3>
                  <div className="space-y-3 text-gray-600">
                    <div>
                      <span className="font-semibold">Rate:</span> {loan.rate}
                    </div>
                    <div>
                      <span className="font-semibold">Amount:</span> {loan.amount}
                    </div>
                    <div>
                      <span className="font-semibold">Period:</span> {loan.period}
                    </div>
                  </div>
                  <Button className="mt-6 w-full bg-[#FF4081] hover:bg-[#CC3368]">
                    Apply Now
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Overdraft Feature Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#FF4081] to-[#CC3368] p-8 rounded-3xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#1A237E] mb-4">Overdraft Protection</h3>
                    <div className="text-4xl font-bold text-[#00C853] mb-2">KSh 50,000</div>
                    <div className="text-gray-600 mb-4">Available Overdraft</div>
                    <div className="bg-gray-100 rounded-full h-3 mb-4">
                      <div className="bg-[#00C853] h-3 rounded-full w-3/4"></div>
                    </div>
                    <div className="text-sm text-gray-500">75% available</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-4xl font-bold text-[#1A237E] mb-6">Overdraft Protection</h2>
              <p className="text-xl text-gray-600 mb-8">
                Never worry about insufficient funds again. Our overdraft protection automatically covers your transactions.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-[#00C853] mr-4" />
                  <span className="text-gray-700">Automatic protection up to KSh 100,000</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-[#00C853] mr-4" />
                  <span className="text-gray-700">Competitive interest rates</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-[#00C853] mr-4" />
                  <span className="text-gray-700">No penalties for occasional use</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-[#00C853] mr-4" />
                  <span className="text-gray-700">Flexible repayment options</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1A237E] mb-4">Why Choose Our Products?</h2>
            <p className="text-xl text-gray-600">Benefits that make a difference</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="w-3 h-3 bg-[#FFD600] rounded-full mr-4 flex-shrink-0"></div>
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1A237E] mb-4">Customer Success Stories</h2>
            <p className="text-xl text-gray-600">Real experiences with our products</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#FFD600] fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                  <div>
                    <div className="font-bold text-[#1A237E]">{testimonial.name}</div>
                    <div className="text-gray-500">{testimonial.role}</div>
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
          >
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Experience Better Banking?</h2>
            <p className="text-xl mb-8 text-white/90">Join thousands who trust ATM Genesis for their financial needs</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#1A237E] hover:bg-gray-100 font-semibold">
                <Download className="mr-2 w-5 h-5" /> Download App
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1A237E]">
                Open Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1A237E] mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Get answers about our products</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-6"
              >
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-[#1A237E]">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A237E] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-[#FFD600] mb-4">ATM Genesis</div>
              <p className="text-gray-300">Banking products designed for modern Kenya</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-300">
                <li>M-Pesa Banking</li>
                <li>Personal Loans</li>
                <li>Overdraft Protection</li>
                <li>Savings Accounts</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Security</li>
                <li>Privacy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ATM Genesis. Licensed by Central Bank of Kenya.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductsPage;
