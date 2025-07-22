import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Gift, Tag, Camera, Store, Home, HandHelping, Leaf, Target, MapPin, User, Sun, Moon, ShoppingCart, Star, CreditCard, ChevronLeft, ChevronRight, Trash2, Clock, Heart, Smile, Frown, Meh } from "lucide-react";
import { createGlobalStyle } from 'styled-components';

// Mock Data for Dhaka Areas
const dhakaAreas = [
  "All Areas",
  "Hare St. Wari",
  "Dhanmondi 19",
  "Gulshan 2",
  "Khilgaon",
  "Banani",
  "Uttara",
  "Mohammadpur",
  "Mirpur",
  "Tejgaon",
  "Bashundhara",
  "Baridhara",
  "Shahbagh",
  "Farmgate",
  "Motijheel",
  "Malibagh",
  "Paltan",
  "Rampura",
  "Badda",
  "Shantinagar",
  "Kalabagan",
  "Jatrabari",
];

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #4CAF50;  /* Fresh green */
    --secondary-color: #2196F3; /* Calm blue */
    --accent-color: #FF9800;   /* Warm orange */
    --dark-color: #263238;     /* Dark slate */
    --light-color: #f5f7fa;    /* Light gray */
    --text-dark: #37474F;      /* Dark text */
    --text-light: #ECEFF1;     /* Light text */
    --success-color: #8BC34A;  /* Success green */
    --warning-color: #FFC107;  /* Warning yellow */
    --error-color: #F44336;    /* Error red */
  }

  body {
    background-color: var(--light-color);
    color: var(--text-dark);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
  }

  .dark-mode {
    --light-color: #263238;
    --text-dark: #ECEFF1;
    --text-light: #37474F;
  }
`;

// Context for Cart
const CartContext = React.createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItem => 
      cartItem.id === item.id && cartItem.type === item.type
    );
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === item.id && cartItem.type === item.type 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };
  
  const removeFromCart = (id, type) => {
    setCartItems(cartItems.filter(item => !(item.id === id && item.type === type)));
  };
  
  const updateQuantity = (id, type, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, type);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === id && item.type === type ? { ...item, quantity } : item
    ));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  const login = async (username, password) => {
    try {
      const response = await fetch("http://localhost/food_for_all/backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_user: true, username, password })
      });
      const data = await response.json();
      if (data.status === "success") {
        setUser({
          id: data.user_id,
          type: data.user_type,
          token: data.token,
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
          restaurant_name: data.restaurant_name,
          restaurant_type: data.restaurant_type
        });
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.user_id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const guestLogin = async () => {
    try {
      const response = await fetch("http://localhost/food_for_all/backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_login: true })
      });
      const data = await response.json();
      if (data.status === "success") {
        setUser({
          id: data.user_id,
          type: "guest",
          token: data.token
        });
        setIsGuest(true);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.user_id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Guest login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
  };

  // Check for existing session on load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      // Fetch user data if not guest
      if (!userId.startsWith("guest_")) {
        fetch(`http://localhost/food_for_all/backend.php?get_profile&user_id=${userId}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === "success") {
              setUser({
                id: data.user.id,
                type: data.user.user_type,
                token,
                username: data.user.username,
                email: data.user.email,
                phone: data.user.phone,
                address: data.user.address,
                restaurant_name: data.user.restaurant_name,
                restaurant_type: data.user.restaurant_type
              });
            }
          });
      } else {
        setUser({
          id: userId,
          type: "guest",
          token
        });
        setIsGuest(true);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isGuest, login, logout, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Home Page
const HomePage = ({ toggleTheme, currentTheme }) => (
  <div
    className={`w-screen min-h-screen flex items-center justify-center ${currentTheme === "dark" ? "bg-gray-900 text-white" : "bg-gradient-to-br from-green-50 to-blue-50 text-gray-800"}`}
  >
    <Helmet>
      <title>Home - Food For All</title>
    </Helmet>
    <div className="text-center space-y-6 px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold transform hover:scale-105 transition duration-300 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
        Welcome to Food For All
      </h1>
      <p className="text-lg sm:text-xl mx-auto max-w-2xl text-gray-600 hover:text-gray-800 transition duration-300">
        A community-driven platform to reduce food waste and eliminate hunger. Join us to make a difference!
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/givefood"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg shadow-md transition transform hover:-translate-y-1"
        >
          Give Food
        </Link>
        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg shadow-md transition transform hover:-translate-y-1"
        >
          Join Us
        </Link>
      </div>
    </div>
    {/* Dark/Light Mode Toggle */}
    <div
      onClick={toggleTheme}
      className="absolute bottom-8 right-8 p-3 bg-white rounded-full cursor-pointer shadow-lg hover:scale-105 transform transition duration-300"
    >
      {currentTheme === "dark" ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-gray-800" />}
    </div>
  </div>
);

// About Us Page
const AboutUsPage = () => (
  <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
    <Helmet>
      <title>About Us</title>
    </Helmet>
    <div className="max-w-6xl mx-auto text-center space-y-8">
      <h2 className="text-4xl font-extrabold text-gray-800">About Food For All</h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        Food For All is a community-driven platform committed to reducing food waste and fighting hunger. 
        We bring together individuals, businesses, and non-profits to make sure surplus food reaches those in need. 
        Join us in creating a sustainable future where no food goes to waste and no one goes hungry.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        <AboutCard
          icon={<Leaf size={48} className="text-green-600" />}
          title="Sustainability"
          description="Promoting food sustainability and environmental responsibility by reducing food waste."
        />
        <AboutCard
          icon={<HandHelping size={48} className="text-blue-600" />}
          title="Community"
          description="Building strong communities through shared resources and mutual support."
        />
        <AboutCard
          icon={<Target size={48} className="text-red-600" />}
          title="Zero Hunger"
          description="Fighting to end hunger in every community we serve through innovative solutions."
        />
      </div>
    </div>
  </div>
);

const AboutCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4 hover:scale-105 transform transition-transform duration-300 hover:shadow-xl">
    <div className="mx-auto w-16 h-16 rounded-full bg-opacity-20 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Login Page
const LoginPage = () => {
  const { login, guestLogin } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleGuestLogin = async () => {
    const success = await guestLogin();
    if (success) {
      navigate("/");
    } else {
      setError("Failed to login as guest");
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <Helmet>
        <title>Login - Food For All</title>
      </Helmet>
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Login to continue your journey with Food For All</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
              required
            />
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition duration-300 transform hover:-translate-y-1"
            >
              Login
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Continue as Guest
            </button>
          </div>
          
          <p className="text-center text-gray-600 text-sm mt-4">
            Don't have an account? <Link to="/register" className="text-green-600 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

//GiveFood Page
const GiveFoodPage = () => {
  const { user, isGuest } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [donorName, setDonorName] = useState("");
  const [foodType, setFoodType] = useState("");
  const [giveType, setGiveType] = useState("donation");
  const [expiryDate, setExpiryDate] = useState("");
  const [foodImage, setFoodImage] = useState(null);
  const [foodImageFile, setFoodImageFile] = useState(null); // Added for file handling
  const [submitted, setSubmitted] = useState(false);
  const [price, setPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state

  useEffect(() => {
    if (!user || isGuest) {
      navigate("/login");
    }
  }, [user, isGuest, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoodImageFile(file); // Store the actual file
      setFoodImage(URL.createObjectURL(file)); // Create preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Basic validation
    if (giveType === "discount" && (!price || !discountPercentage)) {
      setError("Please fill all required fields for discounted food");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("give_food", true);
      formData.append("user_id", user.id);
      formData.append("donor_name", donorName);
      formData.append("food_type", foodType);
      formData.append("give_type", giveType);
      formData.append("expiry_date", expiryDate);
      formData.append("location", location);

      if (giveType === "discount") {
        formData.append("price", price);
        formData.append("discount_percentage", discountPercentage);
      }

      if (foodImageFile) {
        formData.append("food_image", foodImageFile);
      }

      // Debugging: Log form data before submission
      console.log("Submitting form data:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch("http://localhost/food_for_all/backend.php", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when using FormData
        // The browser will set it automatically with the correct boundary
      });

      const data = await response.json();
      
      // Debugging: Log the response
      console.log("Backend response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit food");
      }

      if (data.status === "success") {
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit food");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "An unexpected error occurred during submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 md:p-12">
      <Helmet>
        <title>Give Food</title>
      </Helmet>
      {submitted ? (
        <div className="text-center bg-white p-8 rounded-xl shadow-md mx-auto max-w-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Thank You!</h2>
          <p className="text-gray-600 mt-4">
            {giveType === "donation"
              ? "Your food donation has been submitted successfully!"
              : "Your discounted food listing has been submitted successfully!"}
          </p>
          <Link
            to="/"
            className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition transform hover:-translate-y-1"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-xl mx-auto max-w-lg"
          encType="multipart/form-data" // Important for file uploads
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Give Food</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Type of Giving</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setGiveType("donation")}
                className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                  giveType === "donation" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300 hover:border-gray-400"
                } transition`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Gift size={20} />
                  <span>Donation</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGiveType("discount")}
                className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                  giveType === "discount" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 hover:border-gray-400"
                } transition`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Tag size={20} />
                  <span>Discounted</span>
                </div>
              </button>
            </div>
          </div>

          {/* Donor Name */}
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">Donor Name*</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Food Type */}
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">Food Type*</label>
            <input
              type="text"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
              placeholder="e.g., Bread, Vegetables"
              required
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">Location*</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
              required
            >
              <option value="">Select location</option>
              {dhakaAreas.filter(area => area !== "All Areas").map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">Expiry Date*</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
              required
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
          </div>

          {/* Price and Discount Fields */}
          {giveType === "discount" && (
            <>
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-gray-700">Original Price (৳)*</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
                  placeholder="e.g., 200"
                  min="1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-gray-700">Discount Percentage (%)*</label>
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
                  placeholder="e.g., 20"
                  min="1"
                  max="99"
                  required
                />
              </div>
            </>
          )}

          {/* Food Image Upload */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Food Image (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-gray-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera size={24} className="text-gray-500 mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
                <input 
                  type="file" 
                  name="food_image" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </label>
            </div>
            {foodImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={foodImage}
                  alt="Food preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition transform hover:-translate-y-1 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      )}
    </div>
  );
};
// Ongoing Donations Page
const OngoingDonationsPage = () => {
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = React.useContext(CartContext);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost/food_for_all/backend.php?get_donations");
        const data = await response.json();
        if (Array.isArray(data)) {
          setDonations(data);
        } else {
          setError("Failed to load donations");
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Filter Donations Based on Selected Area
  const filteredDonations =
    selectedArea === "All Areas"
      ? donations
      : donations.filter((donation) => donation.location === selectedArea);

  const handleAddToCart = (donation) => {
    addToCart({
      id: donation.id,
      type: 'donation',
      name: donation.food_type,
      donor: donation.donor_name,
      location: donation.location,
      image: donation.image_path,
      price: 0 // Donations are free
    });
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <Helmet>
        <title>Ongoing Donations</title>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Ongoing Donations</h2>

        {/* Filter Dropdown */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300 appearance-none bg-white pl-4 pr-8"
            >
              {dhakaAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Display Filtered Donations */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600">Loading donations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.length > 0 ? (
              filteredDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-1"
                >
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{donation.donor_name}</h3>
                    <span className="ml-2 flex items-center">
                      <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse mr-1"></span>
                      <span className="text-red-500 text-sm font-bold">Live</span>
                    </span>
                  </div>
                  {donation.image_path && (
                    <img 
                      src={donation.image_path} 
                      alt={donation.food_type} 
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-gray-600">Item: {donation.food_type}</p>
                  <p className="text-gray-600">Location: {donation.location}</p>
                  <p className="text-gray-600">Expires: {new Date(donation.expiry_date).toLocaleDateString()}</p>
                  <button 
                    onClick={() => handleAddToCart(donation)}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">
                  No donations found for the selected area. Check back later!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Ongoing Discounts Page
const OngoingDiscountsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState("All Areas");
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = React.useContext(CartContext);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost/food_for_all/backend.php?get_discounts");
        const data = await response.json();
        if (Array.isArray(data)) {
          setDiscounts(data);
        } else {
          setError("Failed to load discounts");
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  // Filter Foods Based on Selected Location
  const filteredFoods =
    selectedLocation === "All Areas"
      ? discounts
      : discounts.filter((food) => food.location === selectedLocation);

  const handleAddToCart = (food) => {
    addToCart({
      id: food.id,
      type: 'discount',
      name: food.food_type,
      donor: food.donor_name,
      location: food.location,
      price: food.price * (1 - food.discount_percentage / 100),
      originalPrice: food.price,
      discountPercentage: food.discount_percentage,
      image: food.image_path
    });
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <Helmet>
        <title>Ongoing Discounts</title>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Discounted Foods</h2>

        {/* Filter Dropdown */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300 appearance-none bg-white pl-4 pr-8"
            >
              {dhakaAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Display Filtered Foods */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600">Loading discounted foods...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-1"
                >
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{food.food_type}</h3>
                    <span className="ml-2 flex items-center">
                      <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse mr-1"></span>
                      <span className="text-red-500 text-sm font-bold">Live</span>
                    </span>
                  </div>
                  {food.image_path && (
                    <img 
                      src={food.image_path} 
                      alt={food.food_type} 
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-gray-600">Donor: {food.donor_name}</p>
                  <p className="text-gray-600">Location: {food.location}</p>
                  <p className="text-gray-600">Expires: {new Date(food.expiry_date).toLocaleDateString()}</p>
                  <div className="flex items-center mt-2">
                    <p className="text-gray-600 line-through mr-2">৳{food.price}</p>
                    <p className="text-gray-800 font-bold">৳{Math.round(food.price * (1 - food.discount_percentage / 100))}</p>
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                      {food.discount_percentage}% OFF
                    </span>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(food)}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">
                  No discounted foods found for the selected location. Check back later!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Cart Page
const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = React.useContext(CartContext);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (cartItems.length === 0) return;
    if (!user) {
      navigate("/login");
    }
  }, [cartItems, user, navigate]);

  if (cartItems.length === 0) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex flex-col items-center justify-center">
        <Helmet>
          <title>Your Cart - Food For All</title>
        </Helmet>
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} className="text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Browse our donations and discounted foods to add items to your cart.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/ongoing" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition transform hover:-translate-y-1">
              Browse Donations
            </Link>
            <Link to="/discounts" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition transform hover:-translate-y-1">
              Browse Discounts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <Helmet>
        <title>Your Cart - Food For All</title>
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h2>
        
        {checkoutError && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {checkoutError}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {cartItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b">
              <div className="flex items-center mb-4 sm:mb-0">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">Donated by: {item.donor}</p>
                  <p className="text-sm text-gray-600">Location: {item.location}</p>
                  {item.type === 'discount' && (
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-500 line-through mr-2">৳{item.originalPrice}</p>
                      <p className="text-sm font-semibold">৳{Math.round(item.price)}</p>
                      <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                        {item.discountPercentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center w-full sm:w-auto">
                <div className="flex items-center border rounded-lg mr-4">
                  <button 
                    onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id, item.type)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-lg font-semibold text-gray-800">Total: ৳{getTotalPrice()}</p>
              <p className="text-sm text-gray-600">Donated items are free of charge</p>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition transform hover:-translate-y-1"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link to="/discounts" className="text-gray-600 flex items-center hover:text-gray-800">
            <ChevronLeft size={20} className="mr-1" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

// Checkout Page
const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = React.useContext(CartContext);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (cartItems.length === 0 || !user) {
      navigate('/cart');
    }
  }, [cartItems, user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch("http://localhost/food_for_all/backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout: true,
          user_id: user.id,
          items: cartItems.map(item => ({
            food_id: item.id,
            type: item.type,
            quantity: item.quantity
          })),
          payment_method: formData.paymentMethod,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })
      });
      
      // First check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to complete checkout");
      }

      if (data.status === "success") {
        clearCart();
        navigate('/order-confirmation');
      } else {
        throw new Error(data.message || "Failed to complete checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to complete checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <Helmet>
        <title>Checkout - Food For All</title>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Cart
          </button>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Delivery Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Full Name*</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Email*</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number*</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">City*</label>
                  <select 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
                    required
                  >
                    <option value="Dhaka">Dhaka</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700">Full Address*</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                  rows="3" 
                  required 
                />
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Information</h3>
              
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="card" 
                      name="paymentMethod" 
                      value="card" 
                      checked={formData.paymentMethod === 'card'} 
                      onChange={handleChange}
                      className="mr-2" 
                    />
                    <label htmlFor="card" className="text-gray-700">Credit/Debit Card</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="cash" 
                      name="paymentMethod" 
                      value="cash" 
                      checked={formData.paymentMethod === 'cash'} 
                      onChange={handleChange}
                      className="mr-2" 
                    />
                    <label htmlFor="cash" className="text-gray-700">Cash on Delivery</label>
                  </div>
                </div>
                
                {formData.paymentMethod === 'card' && (
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Card Number*</label>
                      <input 
                        type="text" 
                        name="cardNumber" 
                        value={formData.cardNumber} 
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                        placeholder="1234 5678 9012 3456" 
                        required={formData.paymentMethod === 'card'} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Expiry Date*</label>
                        <input 
                          type="text" 
                          name="cardExpiry" 
                          value={formData.cardExpiry} 
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                          placeholder="MM/YY" 
                          required={formData.paymentMethod === 'card'} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">CVC*</label>
                        <input 
                          type="text" 
                          name="cardCvc" 
                          value={formData.cardCvc} 
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                          placeholder="123" 
                          required={formData.paymentMethod === 'card'} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition transform hover:-translate-y-1 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Complete Order'}
              </button>
            </form>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h3>
              
              <div className="border-b pb-4 mb-4">
                {cartItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{item.name} × {item.quantity}</p>
                      <p className="text-xs text-gray-500">
                        {item.type === 'donation' ? 'Donated Item' : `${item.discountPercentage}% off`}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.price > 0 ? `৳${item.price * item.quantity}` : 'Free'}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-800">৳{getTotalPrice()}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Delivery Fee</p>
                  <p className="text-gray-800">৳40</p>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                <p className="text-gray-800">Total</p>
                <p className="text-gray-800">৳{getTotalPrice() + 40}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Confirmation Page
const OrderConfirmationPage = () => {
  const { clearCart } = React.useContext(CartContext);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch("http://localhost/food_for_all/backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submit_review: true,
          user_id: user.id,
          transaction_id: 1, // In a real app, you'd get this from the order
          rating,
          comment: review
        })
      });
      
      const data = await response.json();
      if (data.status === "success") {
        setIsReviewSubmitted(true);
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (isReviewSubmitted) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex flex-col items-center justify-center">
        <Helmet>
          <title>Thank You - Food For All</title>
        </Helmet>
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your review has been submitted. We appreciate your feedback!</p>
          <Link 
            to="/" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition transform hover:-translate-y-1"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <Helmet>
        <title>Order Confirmed - Food For All</title>
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. Your items will be delivered soon.
          </p>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Order ID: FFA-{Math.floor(100000 + Math.random() * 900000)}</p>
            <p className="text-sm text-gray-500">Order Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Share Your Experience</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">How would you rate your experience?</label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      size={30} 
                      fill={star <= rating ? "#FFD700" : "none"} 
                      color={star <= rating ? "#FFD700" : "#D1D5DB"} 
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">Write your review</label>
              <textarea 
                value={review} 
                onChange={(e) => setReview(e.target.value)} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
                rows="4" 
                placeholder="Tell us about your experience with Food For All..."
                required
              />
            </div>
            
            <div className="flex justify-center">
              <button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition transform hover:-translate-y-1 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost/food_for_all/backend.php?get_profile&user_id=${user.id}`);
        const data = await response.json();
        if (data.status === "success") {
          setUserData(data.user);
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost/food_for_all/backend.php?get_transactions&user_id=${user.id}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setError("Failed to load transactions");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    
    fetchUserData();
    fetchTransactions();
  }, [user, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-6 rounded-xl shadow-lg">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <Helmet>
        <title>My Profile - Food For All</title>
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
        
        {userData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h3>
                <div className="space-y-3">
                  <p><span className="font-medium text-gray-700">Username:</span> {userData.username}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {userData.email}</p>
                  <p><span className="font-medium text-gray-700">Phone:</span> {userData.phone}</p>
                  <p><span className="font-medium text-gray-700">Address:</span> {userData.address}</p>
                  {userData.user_type === "restaurant" && (
                    <>
                      <p><span className="font-medium text-gray-700">Restaurant Name:</span> {userData.restaurant_name}</p>
                      <p><span className="font-medium text-gray-700">Restaurant Type:</span> {userData.restaurant_type}</p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Account Actions</h3>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mb-4 transition transform hover:-translate-y-1"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-4 text-gray-800">My Transactions</h3>
        {transactions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{tx.food_type}</td>
                      <td className="py-3 px-4">{tx.quantity}</td>
                      <td className="py-3 px-4">৳{tx.total_price + tx.delivery_fee}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tx.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          tx.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600">No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};


//Review Form
const ReviewFormPage = () => {
  const { transactionId } = useParams();
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch transaction details
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost/food_for_all/backend.php?get_transaction_details&id=${transactionId}`
        );
        const data = await response.json();
        if (data.status === "success") {
          setTransaction(data.transaction);
        } else {
          throw new Error(data.message || "Transaction not found");
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setError(error.message);
        navigate("/reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost/food_for_all/backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submit_review: true,
          user_id: user.id,
          transaction_id: transactionId,
          rating,
          comment
        })
      });

      const data = await response.json();
      if (data.status === "success") {
        setSuccess(true);
        setTimeout(() => {
          navigate("/reviews");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Review Submitted!</h2>
          <p className="text-gray-600 mb-6">Thank you for your feedback. Your review has been successfully submitted.</p>
          <Link 
            to="/reviews" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
          >
            View My Reviews
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !transaction) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-6 rounded-xl shadow-lg">
          <p className="text-red-500">Transaction not found</p>
          <Link 
            to="/reviews" 
            className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gray-50 p-8">
      <Helmet>
        <title>Leave a Review - Food For All</title>
      </Helmet>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Leave a Review</h2>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800">Order Details</h3>
          <p className="text-gray-600">{transaction.food_type}</p>
          <p className="text-sm text-gray-500">From {transaction.donor_name}</p>
          <p className="text-sm text-gray-500">
            Ordered on {new Date(transaction.transaction_date).toLocaleDateString()}
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <XCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star 
                    size={30} 
                    fill={star <= rating ? "#FFD700" : "none"} 
                    color={star <= rating ? "#FFD700" : "#D1D5DB"} 
                    className="transition-colors"
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Very Good</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Your Review</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300" 
              rows="4"
              placeholder="Share your experience with this order..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// Reviews Page
const ReviewsPage = () => {
  const { user } = React.useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewableTransactions, setReviewableTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all reviews
        const allResponse = await fetch("http://localhost/food_for_all/backend.php?get_all_reviews");
        if (!allResponse.ok) throw new Error("Failed to fetch reviews");
        const allData = await allResponse.json();
        setReviews(Array.isArray(allData) ? allData : []);

        // Fetch user's reviews if logged in
        if (user?.id) {
          const userResponse = await fetch(
            `http://localhost/food_for_all/backend.php?get_user_reviews&user_id=${user.id}`
          );
          if (!userResponse.ok) throw new Error("Failed to fetch user reviews");
          const userData = await userResponse.json();
          setUserReviews(Array.isArray(userData) ? userData : []);

          // Fetch transactions that can be reviewed
          const transactionsResponse = await fetch(
            `http://localhost/food_for_all/backend.php?get_reviewable_transactions&user_id=${user.id}`
          );
          if (!transactionsResponse.ok) throw new Error("Failed to fetch reviewable transactions");
          const transactionsData = await transactionsResponse.json();
          setReviewableTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <Smile size={24} className="text-green-500" />;
    if (rating >= 2) return <Meh size={24} className="text-yellow-500" />;
    return <Frown size={24} className="text-red-500" />;
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-6 rounded-xl shadow-lg">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <Helmet>
        <title>Customer Reviews - Food For All</title>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Customer Reviews</h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'text-primary-color border-b-2 border-primary-color' : 'text-gray-600'}`}
          >
            All Reviews
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('mine')}
              className={`py-2 px-4 font-medium ${activeTab === 'mine' ? 'text-primary-color border-b-2 border-primary-color' : 'text-gray-600'}`}
            >
              My Reviews
            </button>
          )}
          {user && activeTab === 'mine' && reviewableTransactions.length > 0 && (
            <div className="ml-auto">
              <Link 
                to="/profile" 
                className="bg-primary-color hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Leave a Review
              </Link>
            </div>
          )}
        </div>
        
        {/* Reviewable Transactions Section */}
        {user && activeTab === 'mine' && reviewableTransactions.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Orders Awaiting Your Review</h3>
            <div className="grid gap-4">
              {reviewableTransactions.map((tx) => (
                <div key={tx.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tx.food_type}</p>
                      <p className="text-sm text-gray-600">From {tx.donor_name}</p>
                      <p className="text-sm text-gray-500">
                        Ordered on {new Date(tx.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Link 
                      to={`/review/${tx.id}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Leave Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {(activeTab === 'all' ? reviews : userReviews).map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{review.username || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center">
                  {getRatingIcon(review.rating)}
                  <span className="ml-2 text-gray-800 font-medium">{review.rating}/5</span>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < review.rating ? "#FFD700" : "none"} 
                    color={i < review.rating ? "#FFD700" : "#D1D5DB"} 
                  />
                ))}
              </div>
              {review.comment && (
                <p className="text-gray-700 mb-2">{review.comment}</p>
              )}
              <p className="text-sm text-gray-500">Food: {review.food_type}</p>
            </div>
          ))}
          
          {activeTab === 'mine' && userReviews.length === 0 && reviewableTransactions.length === 0 && (
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit3 size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any reviews. After completing an order, you can leave a review.</p>
              <Link 
                to="/profile" 
                className="bg-primary-color hover:bg-green-600 text-white px-6 py-3 rounded-lg inline-block"
              >
                View My Orders
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// User Registration Page
const UserRegistrationPage = () => {
  const [userType, setUserType] = useState("individual");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    nationalId: "",
    restaurantName: "",
    restaurantType: "",
    businessLicense: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (userType === "individual" && !formData.nationalId) newErrors.nationalId = "National ID is required";
    
    if (userType === "restaurant") {
      if (!formData.restaurantName) newErrors.restaurantName = "Restaurant name is required";
      if (!formData.restaurantType) newErrors.restaurantType = "Restaurant type is required";
      if (!formData.businessLicense) newErrors.businessLicense = "Business license number is required";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch("http://localhost/food_for_all/backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          register_user: true,
          user_type: userType,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phoneNumber,
          address: formData.address,
          national_id: formData.nationalId,
          restaurant_name: formData.restaurantName,
          restaurant_type: formData.restaurantType,
          business_license: formData.businessLicense
        })
      });

      const data = await response.json();
      if (data.status === "success") {
        setIsSubmitted(true);
      } else {
        setErrors({ form: data.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ form: "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex flex-col items-center justify-center">
        <Helmet>
          <title>Registration Successful - Food For All</title>
        </Helmet>
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">Your account has been created. You can now log in and start using Food For All.</p>
          <Link 
            to="/login" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition transform hover:-translate-y-1"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <Helmet>
        <title>Register - Food For All</title>
      </Helmet>
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">User Registration</h2>
        
        {errors.form && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.form}
          </div>
        )}
        
        {/* User Type Selection */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-2 rounded-xl grid grid-cols-2 gap-2 w-full max-w-md">
            <button
              type="button"
              onClick={() => setUserType("individual")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                userType === "individual" 
                ? "bg-white shadow-sm border-2 border-green-500" 
                : "hover:bg-gray-200"
              }`}
            >
              <User size={20} />
              <span className="font-medium">Individual</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType("restaurant")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                userType === "restaurant" 
                ? "bg-white shadow-sm border-2 border-green-500" 
                : "hover:bg-gray-200"
              }`}
            >
              <Store size={20} />
              <span className="font-medium">Restaurant</span>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>
          
          {/* National ID Field */}
          {userType === "individual" && (
            <div>
              <label className="block font-medium mb-1 text-gray-700">National ID</label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.nationalId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your national ID number"
              />
              {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
            </div>
          )}
          
          {/* Restaurant-specific Fields */}
          {userType === "restaurant" && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Restaurant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Restaurant Name</label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.restaurantName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.restaurantName && <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>}
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Restaurant Type</label>
                  <select
                    name="restaurantType"
                    value={formData.restaurantType}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.restaurantType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select type</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Fine Dining">Fine Dining</option>
                    <option value="Café">Café</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Buffet">Buffet</option>
                    <option value="Food Truck">Food Truck</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.restaurantType && <p className="text-red-500 text-sm mt-1">{errors.restaurantType}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label className="block font-medium mb-1 text-gray-700">Business License Number</label>
                <input
                  type="text"
                  name="businessLicense"
                  value={formData.businessLicense}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.businessLicense ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.businessLicense && <p className="text-red-500 text-sm mt-1">{errors.businessLicense}</p>}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition transform hover:-translate-y-1 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account? <Link to="/login" className="text-green-600 hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

// Navigation 
const Navigation = ({ toggleTheme, currentTheme }) => {
  const { cartItems } = React.useContext(CartContext);
  const { user, isGuest, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
     <header className="bg-gradient-to-r from-primary-color to-secondary-color text-white p-4 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2 hover:text-green-200 transition">
            <Home size={24} />
            <h1 className="text-xl font-semibold">Food For All</h1>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <Link to="/" className="hover:text-green-200 transition flex items-center gap-1">
              <Home size={18} /> Home
            </Link>
          </li>
          {user && user.type !== 'guest' && (
            <li>
              <Link to="/givefood" className="hover:text-green-200 transition flex items-center gap-1">
                <Gift size={18} /> Give Food
              </Link>
            </li>
          )}
          <li>
            <Link to="/ongoing" className="hover:text-green-200 transition flex items-center gap-1">
              <HandHelping size={18} /> Donations
            </Link>
          </li>
          <li>
            <Link to="/discounts" className="hover:text-green-200 transition flex items-center gap-1">
              <Tag size={18} /> Discounts
            </Link>
          </li>
          <li>
            <Link to="/reviews" className="hover:text-green-200 transition flex items-center gap-1">
              <Star size={18} /> Reviews
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-green-200 transition flex items-center gap-1">
              <Leaf size={18} /> About
            </Link>
          </li>
          
          {!user ? (
            <>
              <li>
                <Link to="/register" className="hover:text-green-200 transition flex items-center gap-1">
                  <User size={18} /> Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-green-200 transition flex items-center gap-1">
                  <User size={18} /> Login
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/profile" className="hover:text-green-200 transition flex items-center gap-1">
                  <User size={18} /> Profile
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="hover:text-green-200 transition flex items-center gap-1"
                >
                  <User size={18} /> Logout
                </button>
              </li>
            </>
          )}
          
          <li>
            <Link to="/cart" className="hover:text-green-200 transition relative flex items-center gap-1">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              Cart
            </Link>
          </li>
          
          <li>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              {currentTheme === "dark" ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <Moon size={20} />
              )}
            </button>
          </li>
        </ul>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/cart" className="relative">
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          <button className="text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Mobile menu (would need state to toggle) */}
      {/* You would implement this with a useState for mobile menu visibility */}
    </header>
  );
};

// App Component with Routes
function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === "light" ? "dark" : "light";
      document.body.className = newTheme === "dark" ? "dark-mode" : "";
      return newTheme;
    });
  };

  return (
    <BrowserRouter>
      <GlobalStyle />
      <AuthProvider>
        <CartProvider>
          <div className={`app ${theme}`}>
            <Navigation toggleTheme={toggleTheme} currentTheme={theme} />
            <Routes>
              <Route path="/" element={<HomePage toggleTheme={toggleTheme} currentTheme={theme} />} />
              <Route path="/givefood" element={<GiveFoodPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/ongoing" element={<OngoingDonationsPage />} />
              <Route path="/discounts" element={<OngoingDiscountsPage />} />
              <Route path="/register" element={<UserRegistrationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/review/:transactionId" element={<ReviewFormPage />} />
             </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;