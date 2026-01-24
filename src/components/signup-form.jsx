"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import authService from "../services/authService";

export default function SignupForm({
  onBackToLogin,
  onSignupComplete,
  onUserTypeChange,
}) {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("consumer");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    shopName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const handleChangeUserType = (type) => {
    setUserType(type);
    onUserTypeChange(type);
    setFormData((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      shopName: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordError("");
    setError("");
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      if (name === "password" || name === "confirmPassword") {
        if (
          newData.password &&
          newData.confirmPassword &&
          newData.password === newData.confirmPassword
        ) {
          setPasswordError("");
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    // Validate passwords
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    
    const errors = [];
    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/\d/.test(password)) {
      errors.push("one digit (0-9)");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("one uppercase letter (A-Z)");
    }
    
    if (errors.length > 0) {
      setPasswordError(`Password must contain: ${errors.join(", ")}`);
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate required fields
    if (userType === "consumer") {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError("Please fill in all required fields");
        return;
      }
    } else {
      if (!formData.shopName || !formData.email) {
        setError("Please fill in all required fields");
        return;
      }
    }

    setLoading(true);

    try {
      let registrationData;

      if (userType === "producer") {
        registrationData = {
          email: formData.email,
          password: password,
          first_name: formData.shopName,
          last_name: formData.shopName,
          phone: "",
          shop_name: formData.shopName,
          description: "",
          address: "",
          wilaya: "",
          city: "",
          is_bio_certified: false,
        };
      } else {
        registrationData = {
          email: formData.email,
          password: password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: "",
          address: "",
          wilaya: "",
          city: "",
        };
      }

      console.log("Sending registration data:", registrationData);

      const response = await authService.register(registrationData, userType);

      // Registration successful - redirect to secondary form
      onSignupComplete({ ...formData, userType });
      
    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.email) {
        errorMessage = `Email: ${Array.isArray(err.email) ? err.email[0] : err.email}`;
      } else if (err.password) {
        errorMessage = `Password: ${Array.isArray(err.password) ? err.password[0] : err.password}`;
      } else if (err.phone) {
        errorMessage = `Phone: ${Array.isArray(err.phone) ? err.phone[0] : err.phone}`;
      } else if (err.shop_name) {
        errorMessage = `Shop name: ${Array.isArray(err.shop_name) ? err.shop_name[0] : err.shop_name}`;
      } else if (err.error) {
        errorMessage = err.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-[#285153] mb-3 font-sans">
          Create Account
        </h1>
        <p className="text-[#285153]/80 text-lg font-medium font-sans">
          One Step Away from Something Great!
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[#B0C4C2] p-1.5 rounded-full flex relative mb-6">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
              userType === "consumer" ? "left-1.5" : "left-[calc(50%+4.5px)]"
            }`}
          />
          <button
            type="button"
            onClick={() => handleChangeUserType("consumer")}
            className={`flex-1 py-3 text-center z-10 font-bold text-lg transition-colors duration-300 ${
              userType === "consumer" ? "text-[#285153]" : "text-[#285153]/60"
            }`}
          >
            consumer
          </button>
          <button
            type="button"
            onClick={() => handleChangeUserType("producer")}
            className={`flex-1 py-3 text-center z-10 font-bold text-lg transition-colors duration-300 ${
              userType === "producer" ? "text-[#285153]" : "text-[#285153]/60"
            }`}
          >
            Producer
          </button>
        </div>

        {userType === "consumer" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#E0E0E0] text-gray-900 placeholder-gray-500 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#285153]"
              />
            </div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#E0E0E0] text-gray-900 placeholder-gray-500 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#285153]"
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <User className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <input
              type="text"
              name="shopName"
              placeholder="Shop/Farm Name *"
              value={formData.shopName}
              onChange={handleChange}
              required
              className="w-full pl-14 pr-6 py-4 bg-[#E0E0E0] text-gray-900 placeholder-gray-500 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#285153]"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-14 pr-6 py-4 bg-[#E0E0E0] text-gray-900 placeholder-gray-500 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#285153]"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-14 pr-6 py-4 bg-[#E0E0E0] text-gray-900 placeholder-gray-500 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#285153]"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full pl-14 pr-6 py-4 bg-[#E0E0E0] text-gray-900 placeholder-gray-500 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#285153]"
          />
        </div>

        {passwordError && (
          <p className="text-red-600 text-sm mt-1">{passwordError}</p>
        )}

        <p className="text-xs text-gray-500">
          * Required fields | Password must be at least 8 characters with one digit and one uppercase letter
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full max-w-sm mx-auto bg-[#285153] hover:bg-[#1a3839] text-white px-10 py-3 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <span>→</span>
          <span>{loading ? "Creating Account..." : "Sign up"}</span>
        </button>
      </form>

      <div className="mt-6 text-center md:hidden">
        <p className="text-gray-600 text-sm">
          Already have an account?{" "}
          <a
            href="#"
            onClick={onBackToLogin}
            className="text-teal-700 font-semibold hover:text-teal-900"
          >
            Log in
          </a>
        </p>
      </div>
    </motion.div>
  );
}