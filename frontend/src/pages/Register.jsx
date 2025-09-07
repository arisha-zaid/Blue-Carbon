import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import apiService from "../services/api";
import { useUser } from "../context/UserContext";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    organization: {
      name: "",
      type: "",
      website: "",
    },
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const navigate = useNavigate();
  const { setRole } = useUser();

  // Check if user is already logged in
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      const role = apiService.getUserRole();
      navigate(`/${role === "ngo" ? "government" : role}`);
    }
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle next step
  const handleNext = () => {
    // Validate step 1 before proceeding
    if (step === 1) {
      const stepErrors = {};
      
      if (!formData.firstName.trim()) {
        stepErrors.firstName = "First name is required";
      }
      
      if (!formData.lastName.trim()) {
        stepErrors.lastName = "Last name is required";
      }
      
      if (!formData.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        stepErrors.email = "Please enter a valid email";
      }
      
      if (!formData.password) {
        stepErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        stepErrors.password = "Password must be at least 8 characters";
      }
      
      if (formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = "Passwords don't match";
      }
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }
    
    setStep(step + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (!formData.role) {
      newErrors.role = "Please select your role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission → register user via API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Clean up formData for API - remove empty optional fields
      const cleanFormData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };
      
      // Add optional fields only if they have values
      if (formData.organization?.name?.trim()) {
        cleanFormData.organization = {
          name: formData.organization.name.trim(),
          ...(formData.organization.type && { type: formData.organization.type }),
          ...(formData.organization.website && { website: formData.organization.website }),
        };
      }
      
      if (formData.phone?.trim()) {
        cleanFormData.phone = formData.phone.trim();
      }

      const response = await apiService.register(cleanFormData);
      if (response.success) {
        console.log("Account created successfully! Welcome to Blue Carbon.");
        const role = response.data.user.role;
        setRole(role); // Update context
        let redirectPath;
        switch (role) {
          case "admin":
            redirectPath = "/admin";
            break;
          case "government":
            redirectPath = "/government";
            break;
          case "industry":
            redirectPath = "/industry";
            break;
          case "community":
          default:
            redirectPath = "/dashboard";
        }
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle specific error cases
      if (error.message.includes("already exists")) {
        setErrors({ email: "An account with this email already exists" });
      } else if (error.message.includes("validation")) {
        console.error("Please check your information and try again.");
      } else {
        console.error("Registration failed:", error.message || "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Role options
  const roleOptions = [
    {
      value: "community",
      label: "Community",
      icon: "🌱",
      description: "Upload plantation details and track progress",
    },
    {
      value: "industry",
      label: "Industry",
      icon: "🏭",
      description: "Buy carbon credits and offset emissions",
    },
    {
      value: "government",
      label: "Government",
      icon: "🏛️",
      description: "Monitor and verify projects",
    },
    {
      value: "admin",
      label: "Admin",
      icon: "👑",
      description: "System administration and management",
    },
  ];

  return (
    // <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
    //   <div className="max-w-2xl w-full space-y-8">
    //     {/* Header */}
    //     <div className="text-center">
    //       <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
    //         <span className="text-2xl font-bold text-white">C</span>
    //       </div>
    //       <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
    //       <p className="mt-2 text-sm text-gray-600">
    //         Join Carbon SIH and start making a difference
    //       </p>
    //     </div>

    //     {/* Progress Steps */}
    //     <div className="flex items-center justify-center space-x-4">
    //       {[1, 2].map((stepNumber) => (
    //         <div key={stepNumber} className="flex items-center">
    //           <div
    //             className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
    //               step >= stepNumber
    //                 ? "bg-emerald-600 text-white"
    //                 : "bg-gray-200 text-gray-600"
    //             }`}
    //           >
    //             {step > stepNumber ? (
    //               <CheckCircle className="w-5 h-5" />
    //             ) : (
    //               stepNumber
    //             )}
    //           </div>
    //           {stepNumber < 2 && (
    //             <div
    //               className={`w-16 h-1 mx-2 ${
    //                 step > stepNumber ? "bg-emerald-600" : "bg-gray-200"
    //               }`}
    //             />
    //           )}
    //         </div>
    //       ))}
    //     </div>

    //     {/* Registration Form */}
    //     <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
    //       {step === 1 && (
    //         <div className="space-y-4">
    //           {/* First Name & Last Name */}
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-2">
    //                 First Name
    //               </label>
    //               <div className="relative">
    //                 <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    //                 <input
    //                   name="firstName"
    //                   value={formData.firstName}
    //                   onChange={handleChange}
    //                   className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm ${
    //                     errors.firstName ? "border-red-300" : "border-gray-300"
    //                   }`}
    //                   placeholder="Enter your first name"
    //                 />
    //               </div>
    //               {errors.firstName && (
    //                 <div className="text-red-600 text-sm mt-1 flex items-center">
    //                   <AlertCircle className="h-4 w-4 mr-1" /> {errors.firstName}
    //                 </div>
    //               )}
    //             </div>
    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-2">
    //                 Last Name
    //               </label>
    //               <div className="relative">
    //                 <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    //                 <input
    //                   name="lastName"
    //                   value={formData.lastName}
    //                   onChange={handleChange}
    //                   className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm ${
    //                     errors.lastName ? "border-red-300" : "border-gray-300"
    //                   }`}
    //                   placeholder="Enter your last name"
    //                 />
    //               </div>
    //               {errors.lastName && (
    //                 <div className="text-red-600 text-sm mt-1 flex items-center">
    //                   <AlertCircle className="h-4 w-4 mr-1" /> {errors.lastName}
    //                 </div>
    //               )}
    //             </div>
    //           </div>

    //           {/* Email */}
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-2">
    //               Email
    //             </label>
    //             <div className="relative">
    //               <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    //               <input
    //                 name="email"
    //                 type="email"
    //                 value={formData.email}
    //                 onChange={handleChange}
    //                 className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm ${
    //                   errors.email ? "border-red-300" : "border-gray-300"
    //                 }`}
    //                 placeholder="Enter your email"
    //               />
    //             </div>
    //             {errors.email && (
    //               <div className="text-red-600 text-sm mt-1 flex items-center">
    //                 <AlertCircle className="h-4 w-4 mr-1" /> {errors.email}
    //               </div>
    //             )}
    //           </div>

    //           {/* Password */}
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-2">
    //                 Password
    //               </label>
    //               <div className="relative">
    //                 <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    //                 <input
    //                   name="password"
    //                   type={showPassword ? "text" : "password"}
    //                   value={formData.password}
    //                   onChange={handleChange}
    //                   className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm ${
    //                     errors.password ? "border-red-300" : "border-gray-300"
    //                   }`}
    //                   placeholder="Create a password"
    //                 />
    //                 <button
    //                   type="button"
    //                   className="absolute right-3 top-3"
    //                   onClick={() => setShowPassword(!showPassword)}
    //                 >
    //                   {showPassword ? <EyeOff /> : <Eye />}
    //                 </button>
    //               </div>
    //               {errors.password && (
    //                 <div className="text-red-600 text-sm mt-1 flex items-center">
    //                   <AlertCircle className="h-4 w-4 mr-1" /> {errors.password}
    //                 </div>
    //               )}
    //             </div>
    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-2">
    //                 Confirm Password
    //               </label>
    //               <div className="relative">
    //                 <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    //                 <input
    //                   name="confirmPassword"
    //                   type={showConfirmPassword ? "text" : "password"}
    //                   value={formData.confirmPassword}
    //                   onChange={handleChange}
    //                   className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm ${
    //                     errors.confirmPassword ? "border-red-300" : "border-gray-300"
    //                   }`}
    //                   placeholder="Confirm password"
    //                 />
    //                 <button
    //                   type="button"
    //                   className="absolute right-3 top-3"
    //                   onClick={() =>
    //                     setShowConfirmPassword(!showConfirmPassword)
    //                   }
    //                 >
    //                   {showConfirmPassword ? <EyeOff /> : <Eye />}
    //                 </button>
    //               </div>
    //               {errors.confirmPassword && (
    //                 <div className="text-red-600 text-sm mt-1 flex items-center">
    //                   <AlertCircle className="h-4 w-4 mr-1" /> {errors.confirmPassword}
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //       )}

    //       {step === 2 && (
    //         <div className="space-y-6">
    //           {/* Role Selection */}
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-4">
    //               Select Your Role
    //             </label>
    //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //               {roleOptions.map((role) => (
    //                 <div
    //                   key={role.value}
    //                   className={`p-4 border-2 rounded-lg cursor-pointer ${
    //                     formData.role === role.value
    //                       ? "border-emerald-500 bg-emerald-50"
    //                       : "border-gray-200"
    //                   }`}
    //                   onClick={() =>
    //                     setFormData((prev) => ({ ...prev, role: role.value }))
    //                   }
    //                 >
    //                   <div className="flex items-center justify-between">
    //                     <span>
    //                       {role.icon} {role.label}
    //                     </span>
    //                     {formData.role === role.value && (
    //                       <CheckCircle className="w-5 h-5 text-emerald-500" />
    //                     )}
    //                   </div>
    //                   <p className="text-sm text-gray-600 mt-1">
    //                     {role.description}
    //                   </p>
    //                 </div>
    //               ))}
    //             </div>
    //             {errors.role && (
    //               <div className="text-red-600 text-sm mt-2 flex items-center">
    //                 <AlertCircle className="h-4 w-4 mr-1" /> {errors.role}
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       )}

    //       {/* Buttons */}
    //       <div className="flex justify-between">
    //         {step > 1 && (
    //           <button
    //             type="button"
    //             onClick={handlePrevious}
    //             className="px-6 py-3 border rounded-lg"
    //           >
    //             Previous
    //           </button>
    //         )}
    //         {step < 2 ? (
    //           <button
    //             type="button"
    //             onClick={handleNext}
    //             className="px-6 py-3 bg-emerald-600 text-white rounded-lg"
    //           >
    //             Next
    //           </button>
    //         ) : (
    //           <button
    //             type="submit"
    //             disabled={loading}
    //             className="px-8 py-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
    //           >
    //             {loading ? "Redirecting..." : "Create Account"}
    //           </button>
    //         )}
    //       </div>
    //     </form>

    //     {/* Sign In */}
    //     <div className="text-center">
    //       <p className="text-sm text-gray-600">
    //         Already have an account?{" "}
    //         <Link to="/login" className="text-emerald-600 font-medium">
    //           Sign in here
    //         </Link>
    //       </p>
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen bg-[#121110] flex items-center justify-center p-4">
  <div className="max-w-2xl w-full space-y-8">
    {/* Header */}
    <div className="text-center">
      <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-white">C</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-100">Create Account</h2>
      <p className="mt-2 text-sm text-gray-400">
        Join Carbon SIH and start making a difference
      </p>
    </div>

    {/* Progress Steps */}
    <div className="flex items-center justify-center space-x-4">
      {[1, 2].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
              step >= stepNumber
                ? "bg-emerald-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {step > stepNumber ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 2 && (
            <div
              className={`w-16 h-1 mx-2 transition ${
                step > stepNumber ? "bg-emerald-600" : "bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>

    {/* Registration Form */}
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {step === 1 && (
        <div className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm bg-[#1a1a1a] text-gray-200 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-500 transition ${
                      errors.firstName ? "border-red-500" : "border-gray-700"
                    }`}
                  placeholder="Enter your first name"
                />
              </div>
              {errors.firstName && (
                <div className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.firstName}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm bg-[#1a1a1a] text-gray-200 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-500 transition ${
                      errors.lastName ? "border-red-500" : "border-gray-700"
                    }`}
                  placeholder="Enter your last name"
                />
              </div>
              {errors.lastName && (
                <div className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.lastName}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm bg-[#1a1a1a] text-gray-200 placeholder-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-500 transition ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <div className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.email}
              </div>
            )}
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 rounded-lg shadow-sm bg-[#1a1a1a] text-gray-200 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-500 transition ${
                      errors.password ? "border-red-500" : "border-gray-700"
                    }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <div className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.password}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 rounded-lg shadow-sm bg-[#1a1a1a] text-gray-200 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-500 transition ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-700"
                    }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                    formData.role === role.value
                      ? "border-teal-500 bg-[#1a1a1a]/50"
                      : "border-gray-700 bg-[#1a1a1a]"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: role.value }))
                  }
                >
                  <div className="flex items-center justify-between text-gray-200">
                    <span>
                      {role.icon} {role.label}
                    </span>
                    {formData.role === role.value && (
                      <CheckCircle className="w-5 h-5 text-teal-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
            {errors.role && (
              <div className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.role}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="px-6 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1a1a1a]"
          >
            Previous
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Create Account"}
          </button>
        )}
      </div>
    </form>

    {/* Sign In */}
    <div className="text-center">
      <p className="text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-teal-400 hover:text-teal-300 font-medium"
        >
          Sign in here
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}
