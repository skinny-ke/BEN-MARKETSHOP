// Sample downloadable files for demonstration
export const sampleDownloadableFiles = {
  electronics: [
    {
      name: "User Manual.pdf",
      size: 2048576, // 2MB
      url: "#",
      description: "Complete user manual with setup instructions",
      type: "manual"
    },
    {
      name: "Warranty Certificate.pdf",
      size: 512000, // 512KB
      url: "#",
      description: "Official warranty certificate",
      type: "warranty"
    },
    {
      name: "Product Images.zip",
      size: 5242880, // 5MB
      url: "#",
      description: "High-resolution product images",
      type: "images"
    }
  ],
  books: [
    {
      name: "Sample Chapter.pdf",
      size: 1024000, // 1MB
      url: "#",
      description: "Read the first chapter for free",
      type: "preview"
    },
    {
      name: "Study Guide.pdf",
      size: 1536000, // 1.5MB
      url: "#",
      description: "Comprehensive study guide",
      type: "guide"
    }
  ],
  software: [
    {
      name: "Installation Guide.pdf",
      size: 768000, // 768KB
      url: "#",
      description: "Step-by-step installation instructions",
      type: "guide"
    },
    {
      name: "API Documentation.pdf",
      size: 3072000, // 3MB
      url: "#",
      description: "Complete API reference documentation",
      type: "documentation"
    },
    {
      name: "Sample Code.zip",
      size: 2048000, // 2MB
      url: "#",
      description: "Example code snippets and templates",
      type: "code"
    }
  ],
  clothing: [
    {
      name: "Size Chart.pdf",
      size: 256000, // 256KB
      url: "#",
      description: "Detailed size measurements and fit guide",
      type: "guide"
    },
    {
      name: "Care Instructions.pdf",
      size: 128000, // 128KB
      url: "#",
      description: "How to care for your garment",
      type: "care"
    }
  ],
  home: [
    {
      name: "Assembly Instructions.pdf",
      size: 1536000, // 1.5MB
      url: "#",
      description: "Step-by-step assembly guide",
      type: "instructions"
    },
    {
      name: "Safety Guidelines.pdf",
      size: 512000, // 512KB
      url: "#",
      description: "Important safety information",
      type: "safety"
    }
  ]
};

// Function to add downloadable files to products based on category
export const addDownloadableFilesToProduct = (product) => {
  if (!product.category) return product;

  const categoryFiles = sampleDownloadableFiles[product.category.toLowerCase()];
  if (categoryFiles) {
    return {
      ...product,
      downloadableFiles: categoryFiles
    };
  }

  // Add some default files for products without specific category files
  if (Math.random() > 0.7) { // 30% chance of having downloadable files
    return {
      ...product,
      downloadableFiles: [
        {
          name: "Product Information.pdf",
          size: 512000,
          url: "#",
          description: "Detailed product information and specifications",
          type: "info"
        }
      ]
    };
  }

  return product;
};

// Function to enhance all products with downloadable files
export const enhanceProductsWithDownloads = (products) => {
  return products.map(addDownloadableFilesToProduct);
};
