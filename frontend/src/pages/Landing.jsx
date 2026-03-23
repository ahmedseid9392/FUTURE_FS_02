import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Calendar, 
  Shield, 
  BarChart3,
  MessageSquare,
  Star,
  Zap,
  Mail,
  Phone,
  Clock,
  X,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  AlertCircle
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setError("");
  };

  const validateRegister = () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!registerForm.email.includes('@')) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password
      });

      if (remember) {
        localStorage.setItem("token", res.data.token);
      } else {
        sessionStorage.setItem("token", res.data.token);
      }

      setShowAuthModal(false);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegister()) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/register", {
        email: registerForm.email,
        password: registerForm.password
      });

      // Store token from registration response
      localStorage.setItem("token", res.data.token);
      setShowAuthModal(false);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Lead Management",
      description: "Centralize all your leads in one place. Track, organize, and manage client information effortlessly."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Status Tracking",
      description: "Monitor lead progress from New → Contacted → Converted with visual status indicators."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Follow-up Notes",
      description: "Add detailed notes and communication history to never miss a follow-up opportunity."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Get insights on conversion rates, lead sources, and team performance metrics."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Access",
      description: "JWT-based authentication ensures only authorized users can access sensitive client data."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Timestamp Tracking",
      description: "Automatic tracking of lead creation and updates for better accountability."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "Digital Agency Co.",
      content: "This CRM transformed how we handle leads. We've increased our conversion rate by 40% in just 3 months!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Freelance Consultant",
      company: "Self-employed",
      content: "Simple, intuitive, and powerful. Exactly what I needed to manage my growing client base.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Sales Manager",
      company: "TechStart Solutions",
      content: "The follow-up notes feature is a game-changer. Never missed a client follow-up since using this system.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: <Users className="w-5 h-5" /> },
    { number: "50K+", label: "Leads Managed", icon: <TrendingUp className="w-5 h-5" /> },
    { number: "95%", label: "Satisfaction Rate", icon: <Star className="w-5 h-5" /> },
    { number: "24/7", label: "Support Available", icon: <Clock className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LeadCRM
                </h1>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">Testimonials</a>
              <a href="#stats" className="text-gray-700 hover:text-blue-600 transition">Stats</a>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setShowAuthModal(true);
                  setError("");
                  setLoginForm({ email: "", password: "" });
                }}
                className="text-gray-700 hover:text-blue-600 transition px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setShowAuthModal(true);
                  setError("");
                  setRegisterForm({ email: "", password: "", confirmPassword: "" });
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-1" />
              Boost Your Sales by 40%
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Transform Your Lead
              <br />
              Management Process
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The all-in-one CRM solution for agencies, freelancers, and small businesses. 
              Track, manage, and convert leads into loyal clients effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setShowAuthModal(true);
                  setRegisterForm({ email: "", password: "", confirmPassword: "" });
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl inline-flex items-center justify-center group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <a
                href="#features"
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-blue-600 hover:text-blue-600 transition inline-flex items-center justify-center"
              >
                Learn More
              </a>
            </div>
            
            {/* Dashboard Preview Placeholder */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-2xl border border-gray-200 h-96 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section id="stats" className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center text-blue-600 mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Modern Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage leads effectively and grow your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about their experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Streamline Your Lead Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses that have improved their conversion rates with our CRM
          </p>
          <button
            onClick={() => {
              setIsLoginMode(false);
              setShowAuthModal(true);
              setRegisterForm({ email: "", password: "", confirmPassword: "" });
            }}
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl font-semibold"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <p className="text-sm text-blue-100 mt-4">
            No credit card required • Free 14-day trial
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LeadCRM</h3>
              <p className="text-gray-400 text-sm">
                Transforming lead management for modern businesses since 2024.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 LeadCRM. All rights reserved. Built for modern businesses.</p>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {isLoginMode ? (
                  <LogIn className="w-5 h-5 text-blue-600" />
                ) : (
                  <UserPlus className="w-5 h-5 text-green-600" />
                )}
                <h2 className="text-xl font-bold">
                  {isLoginMode ? "Welcome Back" : "Create Account"}
                </h2>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {isLoginMode ? (
                // Login Form
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot")}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginMode(false);
                          setError("");
                          setLoginForm({ email: "", password: "" });
                          setRegisterForm({ email: "", password: "", confirmPassword: "" });
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                // Register Form (matching your Register component)
                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Create a password (min. 6 characters)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginMode(true);
                          setError("");
                          setRegisterForm({ email: "", password: "", confirmPassword: "" });
                          setLoginForm({ email: "", password: "" });
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;