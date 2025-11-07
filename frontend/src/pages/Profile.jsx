import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FaCamera, FaEdit, FaSave, FaTimes, FaShoppingBag, FaHeart, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";
import toast from "react-hot-toast";
import { useClerkContext } from "../context/ClerkContext";
import api from "../api/axios";

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

// ---------- Order History Component ----------
const OrderHistory = ({ userData }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userData?.id) return;
      try {
        const response = await api.get('/orders');
        if (response.data.success) {
          setOrders(response.data.orders.slice(0, 5)); // Show last 5 orders
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userData?.id]);

  if (loading) return <div className="text-center py-4">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaShoppingBag className="w-5 h-5" />
        Recent Orders
      </h3>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Order #{order._id.slice(-8)}</p>
                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">KSh {order.totalAmount.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Wishlist Preview Component ----------
const WishlistPreview = ({ userData }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userData?.id) return;
      try {
        const response = await api.get(`/wishlist/${userData.id}`);
        if (response.data.wishlist) {
          setWishlist(response.data.wishlist.slice(0, 4)); // Show first 4 items
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [userData?.id]);

  if (loading) return <div className="text-center py-4">Loading wishlist...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaHeart className="w-5 h-5" />
        Wishlist ({wishlist.length})
      </h3>

      {wishlist.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No items in wishlist</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {wishlist.map((item) => (
            <div key={item._id} className="bg-gray-50 rounded-lg p-3">
              <img
                src={item.image || '/placeholder.png'}
                alt={item.name}
                className="w-full h-20 object-cover rounded mb-2"
              />
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-sm text-green-600 font-semibold">KSh {item.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Main Profile Component ----------
export default function Profile() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { userData } = useClerkContext();

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaShoppingBag className="w-4 h-4" />
                      Total Orders
                    </span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaHeart className="w-4 h-4" />
                      Wishlist Items
                    </span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaCreditCard className="w-4 h-4" />
                      Total Spent
                    </span>
                    <span className="font-semibold text-green-600">KSh 45,000</span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <OrderHistory userData={userData} />
              </div>

              {/* Wishlist Preview */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <WishlistPreview userData={userData} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
