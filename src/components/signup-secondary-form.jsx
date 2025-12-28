/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Upload, Phone, MapPin, ArrowLeft } from "lucide-react";
import heroImage from "../assets/signup-hero.png";
import userService from "../services/UserService";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa",
  "Biskré", "Béchar", "Blida", "Bouïra", "Tamanrasset", "Tébessa",
  "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel",
  "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Aréridj", "Boumerdès",
  "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naama",
  "Aïn Témouchent", "Ghardaïa", "Relizane",
];

export default function SignupSecondaryForm({ userType = "producer", onComplete, onBack }) {
  const [formData, setFormData] = useState({
    avatar: "",
    phoneNumber: "",
    description: "",
    farmPhotoUrl: "",
    address: "",
    wilaya: "",
    isBioCertified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image upload (convert to base64)
  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: reader.result // base64 string
      }));
      setError(''); // Clear any errors
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Validate required fields
    if (!formData.phoneNumber || !formData.address || !formData.wilaya) {
      setError("Please fill in all required fields (Phone, Address, Wilaya)");
      setLoading(false);
      return;
    }

    try {
      // Build update data based on user type
      const updates = {
        phone: formData.phoneNumber,
        address: formData.address,
        wilaya: formData.wilaya,
      };

      if (userType === "producer") {
        // Producer-specific fields
        if (formData.avatar) updates.avatar = formData.avatar;
        if (formData.farmPhotoUrl) updates.photo_url = formData.farmPhotoUrl;
        if (formData.description) updates.description = formData.description;
        updates.is_bio_certified = formData.isBioCertified;
      } else {
        // Client-specific fields
        if (formData.avatar) updates.avatar = formData.avatar;
      }

      console.log("Updating profile with:", { ...updates, avatar: updates.avatar ? '[base64 data]' : 'none', photo_url: updates.photo_url ? '[base64 data]' : 'none' });

      // Call backend to update profile
      await userService.updateProfile(updates);

      // Success! Redirect to login
      onComplete();
    } catch (err) {
      console.error("Profile update error:", err);
      
      let errorMessage = "Failed to update profile. Please try again.";
      if (err.phone) {
        errorMessage = `Phone: ${Array.isArray(err.phone) ? err.phone[0] : err.phone}`;
      } else if (err.address) {
        errorMessage = `Address: ${Array.isArray(err.address) ? err.address[0] : err.address}`;
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
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <div className="relative w-full h-[300px] lg:h-[400px]">
        <img
          src={heroImage}
          alt="Farmer in field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 bg-white/90 hover:bg-white text-[#285153] px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg flex items-center gap-2 z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Signup
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#285153] mb-4">
            Welcome to the DZ-Fellah Family!
          </h1>
          <p className="text-lg text-[#3e5f60] font-medium">
            {userType === "producer" 
              ? "Let's get your farm shining—fill in a few details so your fresh produce reaches the right customers"
              : "Complete your profile to start shopping for fresh, local products"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {userType === "consumer" ? (
           /* CONSUMER LAYOUT */
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
             {/* LEFT COLUMN: Profile Photo Upload */}
             <div>
                <div className="border-2 border-dashed border-[#285153] rounded-3xl p-8 flex flex-col items-center justify-center text-center relative bg-white h-full min-h-[400px]">
                  {formData.avatar ? (
                    <div className="relative w-full h-64 mb-4">
                      <img
                        src={formData.avatar}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 bg-[#e8efef] p-8 rounded-full">
                      <div className="relative">
                        <Upload className="w-12 h-12 text-[#285153]" />
                        <div className="absolute -bottom-1 -right-1 bg-[#285153] text-white rounded-full p-0.5">
                          <span className="text-xs font-bold">+</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-[#285153] mb-2">Profile Photo</h3>
                  <p className="text-sm text-gray-500 font-semibold mb-4">(Optional)</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                    className="hidden"
                    id="avatar-upload-consumer"
                  />
                  <label
                    htmlFor="avatar-upload-consumer"
                    className="cursor-pointer bg-[#285153] hover:bg-[#1f3f40] text-white px-6 py-2 rounded-xl font-semibold transition"
                  >
                    Choose Photo
                  </label>
                </div>
             </div>

             {/* RIGHT COLUMN: Required Fields */}
             <div className="space-y-8">
               {/* Phone Number */}
                <div>
                  <label className="block text-xl font-bold text-black mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#285153] w-5 h-5" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#f3f4f6] text-gray-700 px-4 py-4 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#285153]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xl font-bold text-black mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Your address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#f3f4f6] text-gray-700 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#285153]"
                  />
                </div>

                {/* Wilaya */}
                <div>
                  <label className="block text-xl font-bold text-black mb-2">Wilaya *</label>
                  <select
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#f3f4f6] text-gray-700 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#285153]"
                  >
                    <option value="">Select Wilaya</option>
                    {WILAYAS.map((wilaya) => (
                      <option key={wilaya} value={wilaya}>
                        {wilaya}
                      </option>
                    ))}
                  </select>
                </div>
             </div>
           </div>
        ) : (
          /* PRODUCER LAYOUT */
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              {/* LEFT COLUMN: Photo Uploads */}
              <div className="space-y-8">
                {/* Farm Photo Upload */}
                <div className="border-2 border-dashed border-[#285153] rounded-3xl p-8 flex flex-col items-center justify-center text-center relative bg-white">
                  {formData.farmPhotoUrl ? (
                    <div className="relative w-full h-48 mb-4">
                      <img
                        src={formData.farmPhotoUrl}
                        alt="Farm preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, farmPhotoUrl: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 bg-[#e8efef] p-6 rounded-full">
                      <div className="relative">
                        <Upload className="w-10 h-10 text-[#285153]" />
                        <div className="absolute -bottom-1 -right-1 bg-[#285153] text-white rounded-full p-0.5">
                          <span className="text-[10px] font-bold">+</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-[#285153] mb-1">Farm Photo</h3>
                  <p className="text-xs text-gray-500 font-semibold mb-4">(Optional)</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'farmPhotoUrl')}
                    className="hidden"
                    id="farm-photo-upload"
                  />
                  <label
                    htmlFor="farm-photo-upload"
                    className="cursor-pointer bg-[#285153] hover:bg-[#1f3f40] text-white px-6 py-2 rounded-xl font-semibold transition"
                  >
                    Choose Photo
                  </label>
                </div>

                {/* Profile Photo Upload */}
                <div className="border-2 border-dashed border-[#285153] rounded-3xl p-8 flex flex-col items-center justify-center text-center relative bg-white">
                  {formData.avatar ? (
                    <div className="relative w-full h-48 mb-4">
                      <img
                        src={formData.avatar}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 bg-[#e8efef] p-6 rounded-full">
                      <div className="relative">
                        <Upload className="w-10 h-10 text-[#285153]" />
                        <div className="absolute -bottom-1 -right-1 bg-[#285153] text-white rounded-full p-0.5">
                          <span className="text-[10px] font-bold">+</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-[#285153] mb-1">Profile Photo</h3>
                  <p className="text-xs text-gray-500 font-semibold mb-4">(Optional)</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                    className="hidden"
                    id="avatar-upload-producer"
                  />
                  <label
                    htmlFor="avatar-upload-producer"
                    className="cursor-pointer bg-[#285153] hover:bg-[#1f3f40] text-white px-6 py-2 rounded-xl font-semibold transition"
                  >
                    Choose Photo
                  </label>
                </div>
              </div>

              {/* RIGHT COLUMN: Required Fields */}
              <div className="space-y-6">
                {/* Phone Number */}
                <div>
                  <label className="block text-xl font-bold text-black mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#285153] w-5 h-5" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#f3f4f6] text-gray-700 px-4 py-4 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#285153]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xl font-bold text-black mb-2">Farm Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#285153] w-5 h-5" />
                    <input
                      type="text"
                      name="address"
                      placeholder="Farm address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#f3f4f6] text-gray-700 px-4 py-4 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#285153]"
                    />
                  </div>
                </div>

                {/* Wilaya */}
                <div>
                  <label className="block text-xl font-bold text-black mb-2">Wilaya *</label>
                  <select
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#f3f4f6] text-gray-700 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#285153]"
                  >
                    <option value="">Select Wilaya</option>
                    {WILAYAS.map((wilaya) => (
                      <option key={wilaya} value={wilaya}>
                        {wilaya}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bio Certified */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isBioCertified"
                    name="isBioCertified"
                    checked={formData.isBioCertified}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-[#285153] rounded checked:bg-[#285153]"
                  />
                  <label htmlFor="isBioCertified" className="text-lg font-semibold text-[#285153]">
                    Bio Certified
                  </label>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-12">
              <label className="block text-3xl font-bold text-black mb-4">Description</label>
              <textarea
                name="description"
                placeholder="Tell us about your farm..."
                value={formData.description}
                onChange={handleChange}
                rows={8}
                className="w-full bg-[#f3f4f6] text-gray-700 p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#285153] resize-none"
              />
            </div>
          </>
        )}

        {/* Bottom Actions */}
        <div className="mt-12 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#3e5f60] hover:bg-[#2e4849] text-white px-12 py-3 rounded-full font-bold text-lg transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">* Required fields</p>

        {/* Footer Links */}
        <div className="mt-20 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-[#285153] font-medium">
          <a href="mailto:dz_fellah@gmail.com" className="hover:underline">dz_fellah@gmail.com</a>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:underline">Contact us</a>
            <a href="#" className="hover:underline">About Us</a>
          </div>
        </div>
      </div>
    </div>
  );
}
