import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FaCamera, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

// ---------- Header Component ----------
const ProfileHeader = ({ user, isEditing, toggleEdit, openUserProfile }) => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={user?.imageUrl || "/placeholder-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-white object-cover"
          />
          <button
            onClick={openUserProfile}
            className="absolute -bottom-2 -right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
            aria-label="Change Profile Picture"
          >
            <FaCamera className="w-3 h-3" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-green-100">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
      </div>
      <button
        onClick={toggleEdit}
        className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2"
        aria-label="Edit Profile"
      >
        <FaEdit className="w-4 h-4" />
        <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
      </button>
    </div>
  );
};

// ---------- Personal Info Component ----------
const PersonalInfo = ({ user, isEditing, formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

    {["firstName", "lastName"].map((field) => (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field === "firstName" ? "First Name" : "Last Name"}
        </label>
        {isEditing ? (
          <input
            type="text"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        ) : (
          <p className="text-gray-900">{user?.[field] || "Not provided"}</p>
        )}
      </div>
    ))}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
      <p className="text-gray-900">{user?.emailAddresses[0]?.emailAddress}</p>
      <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Use account settings.</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
      <p className="text-gray-900">{user?.phoneNumbers[0]?.phoneNumber || "Not provided"}</p>
    </div>
  </div>
);

// ---------- Account Info Component ----------
const AccountInfo = ({ user }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
      <p className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Last Sign In</label>
      <p className="text-gray-900">{user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Unknown"}</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user?.emailAddresses[0]?.verification?.status === "verified"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {user?.emailAddresses[0]?.verification?.status === "verified" ? "Verified" : "Not Verified"}
      </span>
    </div>
  </div>
);

// ---------- Action Buttons Component ----------
const ActionButtons = ({ handleSave, handleCancel }) => (
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
);

// ---------- Main Profile Component ----------
export default function Profile() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First and Last name cannot be empty");
      return;
    }

    try {
      // Optimistic UI update
      user.firstName = formData.firstName;
      user.lastName = formData.lastName;
      setIsEditing(false);

      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ProfileHeader user={user} isEditing={isEditing} toggleEdit={toggleEdit} openUserProfile={openUserProfile} />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PersonalInfo user={user} isEditing={isEditing} formData={formData} handleChange={handleChange} />
                <AccountInfo user={user} />
              </div>

              {isEditing && <ActionButtons handleSave={handleSave} handleCancel={handleCancel} />}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
