import React, { createContext, useContext, useState, useEffect } from 'react';

// Language Context
const LanguageContext = createContext();

// Available languages
const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  sw: {
    code: 'sw',
    name: 'Kiswahili',
    flag: '🇰🇪',
    direction: 'ltr'
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    direction: 'ltr'
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl'
  }
};

// Translation dictionaries
const TRANSLATIONS = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    wishlist: 'Wishlist',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    search: 'Search products...',
    trackOrder: 'Track Order',

    // Product
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    reviews: 'reviews',
    writeReview: 'Write a Review',
    price: 'Price',
    category: 'Category',
    brand: 'Brand',
    description: 'Description',
    specifications: 'Specifications',
    relatedProducts: 'Related Products',

    // Cart
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    subtotal: 'Subtotal',
    total: 'Total',
    checkout: 'Checkout',
    continueShopping: 'Continue Shopping',
    remove: 'Remove',

    // Checkout
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    country: 'Country',

    // Admin
    adminDashboard: 'Admin Dashboard',
    manageProducts: 'Manage Products',
    manageOrders: 'Manage Orders',
    manageUsers: 'Manage Users',
    analytics: 'Analytics',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',

    // Messages
    itemAddedToCart: 'Item added to cart',
    itemRemovedFromCart: 'Item removed from cart',
    orderPlaced: 'Order placed successfully',
    reviewSubmitted: 'Review submitted successfully',
    loginRequired: 'Please login to continue',
    networkError: 'Network error. Please try again.',

    // Footer
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    followUs: 'Follow Us',

    // Search & Filters
    filters: 'Filters',
    sortBy: 'Sort by',
    priceRange: 'Price Range',
    allCategories: 'All Categories',
    allBrands: 'All Brands',
    featured: 'Featured',
    onSale: 'On Sale',
    clearFilters: 'Clear Filters',

    // Product variants
    size: 'Size',
    color: 'Color',
    selectSize: 'Select Size',
    selectColor: 'Select Color',
    quantity: 'Quantity',

    // Reviews
    customerReviews: 'Customer Reviews',
    averageRating: 'Average Rating',
    basedOn: 'Based on',
    verifiedPurchase: 'Verified Purchase',
    helpful: 'Helpful',
    report: 'Report',

    // Notifications
    notifications: 'Notifications',
    enableNotifications: 'Enable Notifications',
    notificationsOn: 'Notifications On',
    testNotification: 'Test Notification',

    // Wishlist
    myWishlist: 'My Wishlist',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    wishlistEmpty: 'Your wishlist is empty',
    saveForLater: 'Save items you love for later',

    // Order tracking
    orderTracking: 'Order Tracking',
    orderStatus: 'Order Status',
    trackingNumber: 'Tracking Number',
    estimatedDelivery: 'Estimated Delivery',
    orderDetails: 'Order Details',
    orderHistory: 'Order History',

    // Profile
    personalInfo: 'Personal Information',
    accountSettings: 'Account Settings',
    changePassword: 'Change Password',
    addresses: 'Addresses',

    // Loyalty
    loyaltyPoints: 'Loyalty Points',
    earnPoints: 'Earn points with every purchase',
    redeemPoints: 'Redeem Points',
    pointsBalance: 'Points Balance',

    // Coupons
    couponCode: 'Coupon Code',
    applyCoupon: 'Apply Coupon',
    couponApplied: 'Coupon applied successfully',
    invalidCoupon: 'Invalid coupon code',

    // Recommendations
    recommendedForYou: 'Recommended for You',
    youMightAlsoLike: 'You Might Also Like',
    trending: 'Trending',
    bestSellers: 'Best Sellers',

    // Social
    share: 'Share',
    shareOnFacebook: 'Share on Facebook',
    shareOnTwitter: 'Share on Twitter',
    shareOnWhatsApp: 'Share on WhatsApp',

    // Inventory
    lowStock: 'Low Stock',
    limitedStock: 'Limited Stock',
    stockLevel: 'Stock Level'
  },

  sw: {
    // Navigation
    home: 'Nyumbani',
    products: 'Bidhaa',
    cart: 'Rukwama',
    wishlist: 'Orodha ya Matamanio',
    profile: 'Wasifu',
    login: 'Ingia',
    register: 'Jisajili',
    logout: 'Toka',
    search: 'Tafuta bidhaa...',
    trackOrder: 'Fuatilia Oda',

    // Product
    addToCart: 'Ongeza kwenye Rukwama',
    buyNow: 'Nunua Sasa',
    outOfStock: 'Imekwisha',
    inStock: 'Inapatikana',
    reviews: 'maoni',
    writeReview: 'Andika Maoni',
    price: 'Bei',
    category: 'Kategoria',
    brand: 'Chapa',
    description: 'Maelezo',
    specifications: 'Vipimo',
    relatedProducts: 'Bidhaa Zinazohusiana',

    // Cart
    shoppingCart: 'Rukwama ya Ununuzi',
    emptyCart: 'Rukwama yako iko tupu',
    subtotal: 'Jumla Ndogo',
    total: 'Jumla',
    checkout: 'Lipa',
    continueShopping: 'Endelea Kununua',
    remove: 'Ondoa',

    // Checkout
    shippingAddress: 'Anwani ya Usafirishaji',
    paymentMethod: 'Njia ya Malipo',
    orderSummary: 'Muhtasari wa Oda',
    placeOrder: 'Weka Oda',
    firstName: 'Jina la Kwanza',
    lastName: 'Jina la Mwisho',
    email: 'Barua Pepe',
    phone: 'Simu',
    address: 'Anwani',
    city: 'Jiji',
    country: 'Nchi',

    // Admin
    adminDashboard: 'Dashibodi ya Msimamizi',
    manageProducts: 'Simamia Bidhaa',
    manageOrders: 'Simamia Oda',
    manageUsers: 'Simamia Watumiaji',
    analytics: 'Takwimu',
    addProduct: 'Ongeza Bidhaa',
    editProduct: 'Hariri Bidhaa',
    deleteProduct: 'Futa Bidhaa',

    // Common
    loading: 'Inapakia...',
    error: 'Kosa',
    success: 'Mafanikio',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    confirm: 'Thibitisha',
    yes: 'Ndio',
    no: 'Hapana',
    close: 'Funga',
    back: 'Nyuma',
    next: 'Ijayo',
    previous: 'Iliyopita',

    // Messages
    itemAddedToCart: 'Bidhaa imeongezwa kwenye rukwama',
    itemRemovedFromCart: 'Bidhaa imeondolewa kwenye rukwama',
    orderPlaced: 'Oda imewekwa kwa mafanikio',
    reviewSubmitted: 'Maoni yametumwa kwa mafanikio',
    loginRequired: 'Tafadhali ingia kuendelea',
    networkError: 'Kosa la mtandao. Jaribu tena.',

    // Footer
    aboutUs: 'Kuhusu Sisi',
    contactUs: 'Wasiliana Nasi',
    privacyPolicy: 'Sera ya Faragha',
    termsOfService: 'Sheria na Masharti',
    followUs: 'Tufuate',

    // Search & Filters
    filters: 'Vichujio',
    sortBy: 'Panga kwa',
    priceRange: 'Masafa ya Bei',
    allCategories: 'Makategoria Yote',
    allBrands: 'Makampuni Yote',
    featured: 'Maarufu',
    onSale: 'Kwenye Punguzo',
    clearFilters: 'Ondoa Vichujio',

    // Product variants
    size: 'Ukubwa',
    color: 'Rangi',
    selectSize: 'Chagua Ukubwa',
    selectColor: 'Chagua Rangi',
    quantity: 'Kiasi',

    // Reviews
    customerReviews: 'Maoni ya Wateja',
    averageRating: 'Wastani wa Ukadiriaji',
    basedOn: 'Kulingana na',
    verifiedPurchase: 'Ununuzi Uliothibitishwa',
    helpful: 'Msaada',
    report: 'Ripoti',

    // Notifications
    notifications: 'Arifa',
    enableNotifications: 'Wezesha Arifa',
    notificationsOn: 'Arifa Zimewashwa',
    testNotification: 'Jaribu Arifa',

    // Wishlist
    myWishlist: 'Orodha Yangu ya Matamanio',
    addToWishlist: 'Ongeza kwenye Orodha ya Matamanio',
    removeFromWishlist: 'Ondoa kwenye Orodha ya Matamanio',
    wishlistEmpty: 'Orodha yako ya matamanio iko tupu',
    saveForLater: 'Hifadhi bidhaa unazozipenda kwa baadaye',

    // Order tracking
    orderTracking: 'Kufuatilia Oda',
    orderStatus: 'Hali ya Oda',
    trackingNumber: 'Nambari ya Kufuatilia',
    estimatedDelivery: 'Uwasilishaji Unaotarajiwa',
    orderDetails: 'Maelezo ya Oda',
    orderHistory: 'Historia ya Oda',

    // Profile
    personalInfo: 'Maelezo Binafsi',
    accountSettings: 'Mipangilio ya Akaunti',
    changePassword: 'Badilisha Nenosiri',
    addresses: 'Anwani',

    // Loyalty
    loyaltyPoints: 'Pointi za Uaminifu',
    earnPoints: 'Pata pointi kwa kila ununuzi',
    redeemPoints: 'Tumia Pointi',
    pointsBalance: 'Salio la Pointi',

    // Coupons
    couponCode: 'Msimbo wa Kuponi',
    applyCoupon: 'Tumia Kuponi',
    couponApplied: 'Kuponi imetumika kwa mafanikio',
    invalidCoupon: 'Msimbo batili wa kuponi',

    // Recommendations
    recommendedForYou: 'Inapendekezwa Kwa Ajili Yako',
    youMightAlsoLike: 'Unaweza Pia Kupenda',
    trending: 'Inayopanda',
    bestSellers: 'Zinazouzwa Zaidi',

    // Social
    share: 'Shiriki',
    shareOnFacebook: 'Shiriki kwenye Facebook',
    shareOnTwitter: 'Shiriki kwenye Twitter',
    shareOnWhatsApp: 'Shiriki kwenye WhatsApp',

    // Inventory
    lowStock: 'Stocki Ndogo',
    limitedStock: 'Stocki Ndogo',
    stockLevel: 'Kiwango cha Stocki'
  },

  fr: {
    // Navigation
    home: 'Accueil',
    products: 'Produits',
    cart: 'Panier',
    wishlist: 'Liste de souhaits',
    profile: 'Profil',
    login: 'Connexion',
    register: 'S\'inscrire',
    logout: 'Déconnexion',
    search: 'Rechercher des produits...',
    trackOrder: 'Suivre la commande',

    // Product
    addToCart: 'Ajouter au panier',
    buyNow: 'Acheter maintenant',
    outOfStock: 'Rupture de stock',
    inStock: 'En stock',
    reviews: 'avis',
    writeReview: 'Écrire un avis',
    price: 'Prix',
    category: 'Catégorie',
    brand: 'Marque',
    description: 'Description',
    specifications: 'Spécifications',
    relatedProducts: 'Produits connexes',

    // Cart
    shoppingCart: 'Panier d\'achat',
    emptyCart: 'Votre panier est vide',
    subtotal: 'Sous-total',
    total: 'Total',
    checkout: 'Paiement',
    continueShopping: 'Continuer les achats',
    remove: 'Supprimer',

    // Checkout
    shippingAddress: 'Adresse de livraison',
    paymentMethod: 'Mode de paiement',
    orderSummary: 'Résumé de la commande',
    placeOrder: 'Passer la commande',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    city: 'Ville',
    country: 'Pays',

    // Admin
    adminDashboard: 'Tableau de bord admin',
    manageProducts: 'Gérer les produits',
    manageOrders: 'Gérer les commandes',
    manageUsers: 'Gérer les utilisateurs',
    analytics: 'Analyses',
    addProduct: 'Ajouter un produit',
    editProduct: 'Modifier le produit',
    deleteProduct: 'Supprimer le produit',

    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',

    // Messages
    itemAddedToCart: 'Article ajouté au panier',
    itemRemovedFromCart: 'Article retiré du panier',
    orderPlaced: 'Commande passée avec succès',
    reviewSubmitted: 'Avis soumis avec succès',
    loginRequired: 'Veuillez vous connecter pour continuer',
    networkError: 'Erreur réseau. Veuillez réessayer.',

    // Footer
    aboutUs: 'À propos de nous',
    contactUs: 'Contactez-nous',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation',
    followUs: 'Suivez-nous',

    // Search & Filters
    filters: 'Filtres',
    sortBy: 'Trier par',
    priceRange: 'Fourchette de prix',
    allCategories: 'Toutes les catégories',
    allBrands: 'Toutes les marques',
    featured: 'En vedette',
    onSale: 'En promotion',
    clearFilters: 'Effacer les filtres',

    // Product variants
    size: 'Taille',
    color: 'Couleur',
    selectSize: 'Sélectionner la taille',
    selectColor: 'Sélectionner la couleur',
    quantity: 'Quantité',

    // Reviews
    customerReviews: 'Avis clients',
    averageRating: 'Note moyenne',
    basedOn: 'Basé sur',
    verifiedPurchase: 'Achat vérifié',
    helpful: 'Utile',
    report: 'Signaler',

    // Notifications
    notifications: 'Notifications',
    enableNotifications: 'Activer les notifications',
    notificationsOn: 'Notifications activées',
    testNotification: 'Notification de test',

    // Wishlist
    myWishlist: 'Ma liste de souhaits',
    addToWishlist: 'Ajouter à la liste de souhaits',
    removeFromWishlist: 'Retirer de la liste de souhaits',
    wishlistEmpty: 'Votre liste de souhaits est vide',
    saveForLater: 'Sauvegardez les articles que vous aimez pour plus tard',

    // Order tracking
    orderTracking: 'Suivi de commande',
    orderStatus: 'Statut de la commande',
    trackingNumber: 'Numéro de suivi',
    estimatedDelivery: 'Livraison estimée',
    orderDetails: 'Détails de la commande',
    orderHistory: 'Historique des commandes',

    // Profile
    personalInfo: 'Informations personnelles',
    accountSettings: 'Paramètres du compte',
    changePassword: 'Changer le mot de passe',
    addresses: 'Adresses',

    // Loyalty
    loyaltyPoints: 'Points de fidélité',
    earnPoints: 'Gagnez des points à chaque achat',
    redeemPoints: 'Échanger des points',
    pointsBalance: 'Solde des points',

    // Coupons
    couponCode: 'Code promo',
    applyCoupon: 'Appliquer le coupon',
    couponApplied: 'Coupon appliqué avec succès',
    invalidCoupon: 'Code promo invalide',

    // Recommendations
    recommendedForYou: 'Recommandé pour vous',
    youMightAlsoLike: 'Vous pourriez aussi aimer',
    trending: 'Tendances',
    bestSellers: 'Meilleures ventes',

    // Social
    share: 'Partager',
    shareOnFacebook: 'Partager sur Facebook',
    shareOnTwitter: 'Partager sur Twitter',
    shareOnWhatsApp: 'Partager sur WhatsApp',

    // Inventory
    lowStock: 'Stock faible',
    limitedStock: 'Stock limité',
    stockLevel: 'Niveau de stock'
  },

  ar: {
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    cart: 'السلة',
    wishlist: 'قائمة الرغبات',
    profile: 'الملف الشخصي',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',
    search: 'البحث عن المنتجات...',
    trackOrder: 'تتبع الطلب',

    // Product
    addToCart: 'إضافة إلى السلة',
    buyNow: 'اشترِ الآن',
    outOfStock: 'غير متوفر',
    inStock: 'متوفر',
    reviews: 'تقييمات',
    writeReview: 'اكتب تقييماً',
    price: 'السعر',
    category: 'الفئة',
    brand: 'العلامة التجارية',
    description: 'الوصف',
    specifications: 'المواصفات',
    relatedProducts: 'منتجات ذات صلة',

    // Cart
    shoppingCart: 'سلة التسوق',
    emptyCart: 'سلة التسوق فارغة',
    subtotal: 'المجموع الفرعي',
    total: 'المجموع',
    checkout: 'الدفع',
    continueShopping: 'متابعة التسوق',
    remove: 'إزالة',

    // Checkout
    shippingAddress: 'عنوان الشحن',
    paymentMethod: 'طريقة الدفع',
    orderSummary: 'ملخص الطلب',
    placeOrder: 'تقديم الطلب',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    city: 'المدينة',
    country: 'البلد',

    // Admin
    adminDashboard: 'لوحة تحكم المدير',
    manageProducts: 'إدارة المنتجات',
    manageOrders: 'إدارة الطلبات',
    manageUsers: 'إدارة المستخدمين',
    analytics: 'التحليلات',
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل المنتج',
    deleteProduct: 'حذف المنتج',

    // Common
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    success: 'نجح',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',

    // Messages
    itemAddedToCart: 'تم إضافة المنتج إلى السلة',
    itemRemovedFromCart: 'تم إزالة المنتج من السلة',
    orderPlaced: 'تم تقديم الطلب بنجاح',
    reviewSubmitted: 'تم إرسال التقييم بنجاح',
    loginRequired: 'يرجى تسجيل الدخول للمتابعة',
    networkError: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.',

    // Footer
    aboutUs: 'من نحن',
    contactUs: 'اتصل بنا',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    followUs: 'تابعنا',

    // Search & Filters
    filters: 'الفلاتر',
    sortBy: 'ترتيب حسب',
    priceRange: 'نطاق السعر',
    allCategories: 'جميع الفئات',
    allBrands: 'جميع العلامات التجارية',
    featured: 'مميز',
    onSale: 'عرض خاص',
    clearFilters: 'مسح الفلاتر',

    // Product variants
    size: 'الحجم',
    color: 'اللون',
    selectSize: 'اختر الحجم',
    selectColor: 'اختر اللون',
    quantity: 'الكمية',

    // Reviews
    customerReviews: 'تقييمات العملاء',
    averageRating: 'متوسط التقييم',
    basedOn: 'بناءً على',
    verifiedPurchase: 'شراء موثق',
    helpful: 'مفيد',
    report: 'إبلاغ',

    // Notifications
    notifications: 'الإشعارات',
    enableNotifications: 'تفعيل الإشعارات',
    notificationsOn: 'الإشعارات مفعلة',
    testNotification: 'اختبار الإشعار',

    // Wishlist
    myWishlist: 'قائمة رغباتي',
    addToWishlist: 'إضافة إلى قائمة الرغبات',
    removeFromWishlist: 'إزالة من قائمة الرغبات',
    wishlistEmpty: 'قائمة رغباتك فارغة',
    saveForLater: 'احفظ المنتجات التي تحبها لوقت لاحق',

    // Order tracking
    orderTracking: 'تتبع الطلب',
    orderStatus: 'حالة الطلب',
    trackingNumber: 'رقم التتبع',
    estimatedDelivery: 'التسليم المتوقع',
    orderDetails: 'تفاصيل الطلب',
    orderHistory: 'تاريخ الطلبات',

    // Profile
    personalInfo: 'المعلومات الشخصية',
    accountSettings: 'إعدادات الحساب',
    changePassword: 'تغيير كلمة المرور',
    addresses: 'العناوين',

    // Loyalty
    loyaltyPoints: 'نقاط الولاء',
    earnPoints: 'اكسب نقاطاً مع كل شراء',
    redeemPoints: 'استبدال النقاط',
    pointsBalance: 'رصيد النقاط',

    // Coupons
    couponCode: 'رمز الكوبون',
    applyCoupon: 'تطبيق الكوبون',
    couponApplied: 'تم تطبيق الكوبون بنجاح',
    invalidCoupon: 'رمز كوبون غير صحيح',

    // Recommendations
    recommendedForYou: 'موصى به لك',
    youMightAlsoLike: 'قد يعجبك أيضاً',
    trending: 'الرائج',
    bestSellers: 'الأكثر مبيعاً',

    // Social
    share: 'مشاركة',
    shareOnFacebook: 'مشاركة على فيسبوك',
    shareOnTwitter: 'مشاركة على تويتر',
    shareOnWhatsApp: 'مشاركة على واتساب',

    // Inventory
    lowStock: 'مخزون منخفض',
    limitedStock: 'مخزون محدود',
    stockLevel: 'مستوى المخزون'
  }
};

// Translation hook
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    const saved = localStorage.getItem('benmarket-language');
    return saved && LANGUAGES[saved] ? saved : 'en';
  });

  const [direction, setDirection] = useState(LANGUAGES[currentLanguage].direction);

  // Update direction when language changes
  useEffect(() => {
    setDirection(LANGUAGES[currentLanguage].direction);
    // Update document direction for RTL languages
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, direction]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('benmarket-language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const t = (key, fallback = '') => {
    const translations = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    return translations[key] || fallback || key;
  };

  const value = {
    currentLanguage,
    languages: LANGUAGES,
    direction,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;