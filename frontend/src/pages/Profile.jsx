import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FaUser, FaCamera, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function Profile() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    phone: user?.phoneNumbers[0]?.phoneNumber || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      phone: user?.phoneNumbers[0]?.phoneNumber || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={user?.imageUrl || "/placeholder-avatar.png"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-white object-cover"
                    />
                    <button
                      onClick={() => openUserProfile()}
                      className="absolute -bottom-2 -right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                    >
                      <FaCamera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-green-100">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Personal Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.firstName || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.lastName || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900">{user?.emailAddresses[0]?.emailAddress}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed here. Use account settings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900">
                      {user?.phoneNumbers[0]?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Account Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Sign In
                    </label>
                    <p className="text-gray-900">
                      {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Verified
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.emailAddresses[0]?.verification?.status === "verified" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user?.emailAddresses[0]?.verification?.status === "verified" ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}

              {/* Additional Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Account Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => openUserProfile()}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <h4 className="font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </button>
                  
                  <button
                    onClick={() => openUserProfile()}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <h4 className="font-medium text-gray-900">Profile Picture</h4>
                    <p className="text-sm text-gray-500">Upload or change your profile picture</p>
                  </button>
                  
                  <button
                    onClick={() => openUserProfile()}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <h4 className="font-medium text-gray-900">Email Settings</h4>
                    <p className="text-sm text-gray-500">Manage email notifications</p>
                  </button>
                  
                  <button
                    onClick={() => openUserProfile()}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <h4 className="font-medium text-gray-900">Privacy Settings</h4>
                    <p className="text-sm text-gray-500">Control your privacy preferences</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
