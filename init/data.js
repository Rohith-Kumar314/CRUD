const daysAgo = (days, hours = 0) =>
  new Date(Date.now() - days * 86_400_000 - hours * 3_600_000);

export const usersData = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    role: "admin",
    age: 60,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  },
  {
    name: "Priya Reddy",
    email: "priya.reddy@example.com",
    role: "seller",
    age: 29,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500034" },
  },
  {
    name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    role: "seller",
    age: 34,
    isActive: false,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    role: "seller",
    age: 27,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  },
  {
    name: "Vikram Patel",
    email: "vikram.patel@example.com",
    role: "seller",
    age: 38,
    isActive: false,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  },
  {
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@example.com",
    role: "user",
    age: 26,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560076" },
  },
  {
    name: "Arjun Nair",
    email: "arjun.nair@example.com",
    role: "user",
    age: 31,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500016" },
  },
  {
    name: "Meera Krishnan",
    email: "meera.krishnan@example.com",
    role: "user",
    age: 15,
    isActive: false,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400020" },
  },
  {
    name: "Rohan Desai",
    email: "rohan.desai@example.com",
    role: "user",
    age: 35,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560034" },
  },
  {
    name: "Kavya Menon",
    email: "kavya.menon@example.com",
    role: "user",
    age: 28,
    isActive: true,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600018" },
  },
  {
    name: "Aditya Verma",
    email: "aditya.verma@example.com",
    role: "user",
    age: 30,
    isActive: false,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500032" },
  },
  {
    name: "Ishita Bose",
    email: "ishita.bose@example.com",
    role: "user",
    age: 23,
    isActive: true,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400050" },
  },
  {
    name: "Karan Malhotra",
    email: "karan.malhotra@example.com",
    role: "admin",
    age: 37,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560100" },
  },
  {
    name: "Divya Srinivasan",
    email: "divya.srinivasan@example.com",
    role: "user",
    age: 33,
    isActive: false,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "641001" },
  },
  {
    name: "Nikhil Joshi",
    email: "nikhil.joshi@example.com",
    role: "user",
    age: 25,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500081" },
  },
  {
    name: "Pooja Chatterjee",
    email: "pooja.chatterjee@example.com",
    role: "user",
    age: 29,
    isActive: true,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400070" },
  },
  {
    name: "Siddharth Rao",
    email: "siddharth.rao@example.com",
    role: "user",
    age: 40,
    isActive: false,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  },
  {
    name: "Neha Kapoor",
    email: "neha.kapoor@example.com",
    role: "user",
    age: 22,
    isActive: true,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600040" },
  },
  // Intentionally NO address field at all.
  {
    name: "Manish Gupta",
    email: "manish.gupta@example.com",
    role: "user",
    age: 36,
    isActive: true,
  },
  // Inactive AND soft-deleted.
  {
    name: "Tanvi Shah",
    email: "tanvi.shah@example.com",
    role: "user",
    age: 19,
    isActive: false,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500084" },
    deletedAt: daysAgo(10),
  },
];

// ======================================================
// 5. PRODUCTS: 25 records
// sellerIndex refers to the position in the list of users whose role is "seller"
// (0 = Priya, 1 = Rahul, 2 = Ananya, 3 = Vikram).
// Includes: 3 zero-stock, 2 soft-deleted, duplicate prices
// (2499, 899, 499, and 599 incl. a deleted one), one unrated product.
// ======================================================

export const productsData = [
  {
    title: "Wireless Bluetooth Headphones",
    description: "Over-ear headphones for music, calls, and commuting.",
    price: 2499,
    stock: 45,
    category: "Electronics",
    tags: ["audio", "wireless", "bluetooth"],
    sellerIndex: 0,
    rating: { avg: 4.4, count: 128 },
  },
  {
    title: "Mechanical Gaming Keyboard",
    description: "RGB keyboard with tactile switches for gaming and typing.",
    price: 3499,
    stock: 30,
    category: "Electronics",
    tags: ["gaming", "keyboard", "computer"],
    sellerIndex: 1,
    rating: { avg: 4.6, count: 86 },
  },
  {
    title: "Stainless Steel Water Bottle",
    description: "Reusable insulated bottle for work and travel.",
    price: 799,
    stock: 100,
    category: "Home",
    tags: ["bottle", "reusable", "travel"],
    sellerIndex: 2,
    rating: { avg: 4.2, count: 64 },
  },
  {
    title: "Cotton Casual T-Shirt",
    description: "Everyday cotton T-shirt with a regular fit.",
    price: 599,
    stock: 80,
    category: "Fashion",
    tags: ["clothing", "cotton", "casual"],
    sellerIndex: 3,
    rating: { avg: 4.1, count: 52 },
  },
  {
    title: "Running Shoes",
    description: "Lightweight athletic shoes for everyday running.",
    price: 2299,
    stock: 35,
    category: "Footwear",
    tags: ["shoes", "running", "sports"],
    sellerIndex: 0,
    rating: { avg: 4.3, count: 91 },
  },
  {
    title: "Ceramic Coffee Mug Set",
    description: "Two ceramic mugs for coffee and tea.",
    price: 499,
    stock: 60,
    category: "Home",
    tags: ["kitchen", "coffee", "ceramic"],
    sellerIndex: 1,
    rating: { avg: 4.5, count: 38 },
  },
  {
    title: "Laptop Backpack",
    description: "Water-resistant backpack with a padded laptop compartment.",
    price: 1599,
    stock: 42,
    category: "Accessories",
    tags: ["backpack", "laptop", "travel"],
    sellerIndex: 2,
    rating: { avg: 4.4, count: 73 },
  },
  {
    title: "Yoga Exercise Mat",
    description: "Non-slip exercise mat for yoga and stretching.",
    price: 999,
    stock: 0,
    category: "Fitness",
    tags: ["yoga", "fitness", "exercise"],
    sellerIndex: 3,
    rating: { avg: 4.2, count: 46 },
  },
  {
    title: "LED Desk Lamp",
    description: "Adjustable LED lamp for reading and office desks.",
    price: 1199,
    stock: 28,
    category: "Home",
    tags: ["lighting", "desk", "office"],
    sellerIndex: 0,
    rating: { avg: 4.3, count: 57 },
  },
  {
    title: "Portable Power Bank",
    description: "Compact power bank for charging mobile devices.",
    price: 1399,
    stock: 50,
    category: "Electronics",
    tags: ["charging", "mobile", "travel"],
    sellerIndex: 1,
    rating: { avg: 4.1, count: 103 },
  },
  {
    title: "Classic Analog Wristwatch",
    description: "Minimal analog watch with a stainless steel case.",
    price: 2799,
    stock: 22,
    category: "Accessories",
    tags: ["watch", "fashion", "accessories"],
    sellerIndex: 2,
    rating: { avg: 4.5, count: 41 },
  },
  {
    title: "Non-Stick Frying Pan",
    description: "Everyday frying pan for home cooking.",
    price: 899,
    stock: 40,
    category: "Kitchen",
    tags: ["cookware", "kitchen", "cooking"],
    sellerIndex: 3,
    rating: { avg: 4.0, count: 32 },
  },
  {
    title: "Organic Green Tea",
    description: "Green tea leaves for a refreshing hot beverage.",
    price: 349,
    stock: 75,
    category: "Grocery",
    tags: ["tea", "beverage", "organic"],
    sellerIndex: 0,
    rating: { avg: 4.3, count: 66 },
  },
  {
    title: "Travel Neck Pillow",
    description: "Soft neck pillow for long journeys.",
    price: 699,
    stock: 0,
    category: "Travel",
    tags: ["travel", "comfort", "pillow"],
    sellerIndex: 1,
    rating: { avg: 4.2, count: 29 },
  },
  {
    title: "Wireless Computer Mouse",
    description: "Ergonomic wireless mouse for home and office.",
    price: 899,
    stock: 65,
    category: "Electronics",
    tags: ["computer", "mouse", "wireless"],
    sellerIndex: 2,
    rating: { avg: 4.4, count: 112 },
  },
  {
    title: "Printed Cotton Bedsheet",
    description: "Cotton bedsheet with a contemporary printed design.",
    price: 1299,
    stock: 27,
    category: "Home",
    tags: ["bedding", "cotton", "bedroom"],
    sellerIndex: 3,
    rating: { avg: 4.1, count: 35 },
  },
  // Brand-new listing: no ratings yet.
  {
    title: "Insulated Lunch Box",
    description: "Compact lunch box for work, school, and travel.",
    price: 649,
    stock: 48,
    category: "Kitchen",
    tags: ["lunch", "food-storage", "office"],
    sellerIndex: 0,
    rating: { avg: 0, count: 0 },
  },
  {
    title: "Resistance Band Set",
    description: "Multiple resistance levels for home workouts.",
    price: 549,
    stock: 58,
    category: "Fitness",
    tags: ["fitness", "workout", "exercise"],
    sellerIndex: 1,
    rating: { avg: 4.3, count: 49 },
  },
  {
    title: "Hardcover Notebook",
    description: "Ruled notebook for notes, planning, and journaling.",
    price: 299,
    stock: 90,
    category: "Stationery",
    tags: ["notebook", "writing", "office"],
    sellerIndex: 2,
    rating: { avg: 4.2, count: 44 },
  },
  {
    title: "UV Protection Sunglasses",
    description: "Everyday sunglasses with UV-protective lenses.",
    price: 1099,
    stock: 31,
    category: "Accessories",
    tags: ["sunglasses", "fashion", "outdoor"],
    sellerIndex: 3,
    rating: { avg: 4.1, count: 37 },
  },
  // Same price as the first headphones (2499) and out of stock.
  {
    title: "Bluetooth Gaming Headset",
    description: "Wireless headset for gaming and online calls.",
    price: 2499,
    stock: 0,
    category: "Electronics",
    tags: ["wireless", "bluetooth", "gaming"],
    sellerIndex: 0,
    rating: { avg: 4.5, count: 94 },
  },
  {
    title: "Portable Bluetooth Speaker",
    description: "Compact wireless speaker for indoor and outdoor listening.",
    price: 1799,
    stock: 36,
    category: "Electronics",
    tags: ["wireless", "bluetooth", "audio"],
    sellerIndex: 1,
    rating: { avg: 4.3, count: 71 },
  },
  {
    title: "Gaming Mouse Pad",
    description: "Extended desk mat with a smooth surface for gaming.",
    price: 499,
    stock: 54,
    category: "Electronics",
    tags: ["gaming", "computer", "accessories"],
    sellerIndex: 2,
    rating: { avg: 4.2, count: 62 },
  },
  // Soft-deleted.
  {
    title: "Classic Cotton T-Shirt",
    description: "Cotton crew-neck T-shirt for everyday wear.",
    price: 599,
    stock: 24,
    category: "Fashion",
    tags: ["clothing", "cotton", "casual"],
    sellerIndex: 3,
    rating: { avg: 3.9, count: 18 },
    isDeleted: true,
  },
  // Soft-deleted.
  {
    title: "Wireless Charging Stand",
    description: "Desk charging stand for compatible wireless devices.",
    price: 1499,
    stock: 12,
    category: "Electronics",
    tags: ["wireless", "charging", "mobile"],
    sellerIndex: 0,
    rating: { avg: 4.0, count: 21 },
    isDeleted: true,
  },
];

// ======================================================
// 6. POSTS: 20 records (4 drafts, 16 published)
// ======================================================

export const postsData = [
  {
    title: "How to Build a Productive Morning Routine",
    content:
      "Start with a realistic wake-up time, drink water, and plan three priorities for the day.",
    tags: ["productivity", "habits", "lifestyle"],
  },
  {
    title: "A Beginner's Guide to Mechanical Keyboards",
    content:
      "Compare switch feel, sound, layout, and typing comfort before choosing a keyboard.",
    tags: ["technology", "keyboards", "computers"],
  },
  {
    title: "Simple Ways to Reduce Household Waste",
    content:
      "Reusable bottles, shopping bags, meal planning, and careful purchasing can reduce waste.",
    tags: ["sustainability", "home", "environment"],
  },
  {
    title: "Planning a Weekend Trip on a Budget",
    content:
      "Choose a nearby destination, compare transport options, and set a realistic spending limit.",
    tags: ["travel", "budget", "planning"],
  },
  {
    title: "Setting Up a Comfortable Home Office",
    content:
      "Good lighting, a suitable chair, and a properly positioned monitor can improve a workspace.",
    tags: ["office", "work", "productivity"],
  },
  {
    title: "Everyday Fitness Without a Gym",
    content:
      "Walking, bodyweight exercises, and resistance bands offer flexible ways to exercise at home.",
    tags: ["fitness", "health", "exercise"],
  },
  {
    title: "Choosing the Right Backpack",
    content:
      "Consider carrying comfort, laptop size, pockets, and weather resistance when choosing a bag.",
    tags: ["accessories", "travel", "shopping"],
  },
  {
    title: "Making Better Coffee at Home",
    content:
      "Fresh coffee, clean equipment, and consistent measurements can improve your daily brew.",
    tags: ["coffee", "food", "lifestyle"],
  },
  {
    title: "Organizing a Small Kitchen",
    content:
      "Group similar tools together and store everyday items near where you use them.",
    tags: ["kitchen", "organization", "home"],
  },
  {
    title: "Getting Started with Personal Budgeting",
    content:
      "Track expenses, identify essential costs, and set a savings goal you can review regularly.",
    tags: ["finance", "budget", "planning"],
  },
  {
    title: "A Practical Guide to Laptop Care",
    content:
      "Keep ventilation clear, install security updates, and back up important files regularly.",
    tags: ["technology", "laptops", "maintenance"],
  },
  {
    title: "Creating a Reading Habit",
    content: "Keep a book nearby and begin with a small daily reading target.",
    tags: ["books", "habits", "learning"],
  },
  {
    title: "Packing Light for a Short Holiday",
    content:
      "Plan versatile outfits, check the forecast, and keep documents and chargers accessible.",
    tags: ["travel", "packing", "tips"],
  },
  {
    title: "Simple Indoor Plant Care Tips",
    content:
      "Learn each plant's light needs, check soil moisture, and use pots with suitable drainage.",
    tags: ["plants", "gardening", "home"],
  },
  {
    title: "Making Online Shopping More Thoughtful",
    content:
      "Compare specifications, read descriptions, and check return policies before ordering.",
    tags: ["shopping", "consumer-tips", "lifestyle"],
  },
  {
    title: "Why Walking Breaks Matter During Work",
    content:
      "Short breaks offer opportunities to stretch, change posture, and rest your eyes.",
    tags: ["wellness", "work", "fitness"],
  },
  {
    title: "Building a Simple Weekly Meal Plan",
    content:
      "Plan a few meals, reuse ingredients, and make a shopping list before visiting the store.",
    tags: ["cooking", "meal-planning", "food"],
  },
  {
    title: "Keeping Digital Files Organized",
    content:
      "Descriptive file names and consistent folder structures make documents easier to find.",
    tags: ["technology", "organization", "productivity"],
  },
  {
    title: "What to Look for in Wireless Headphones",
    content:
      "Compare battery life, comfort, microphone quality, and device compatibility.",
    tags: ["audio", "technology", "buying-guide"],
  },
  {
    title: "Creating a Relaxing Evening Routine",
    content:
      "Preparing for tomorrow and choosing a relaxing activity can create a calmer evening.",
    tags: ["sleep", "habits", "lifestyle"],
  },
];

// ======================================================
// 7. COMMENTS: 30 records (first 16 top-level, then a mix of replies/top-level)
// ======================================================

export const commentTexts = [
  "This is a useful guide. Thanks for sharing!",
  "I have been looking for practical advice like this.",
  "The tips are simple and easy to follow.",
  "I would recommend starting with a small change.",
  "Great explanation. I will try this approach.",
  "This worked well for my everyday routine.",
  "Could you share more examples on this topic?",
  "I appreciate the clear breakdown.",
  "Good point about choosing what works for your needs.",
  "This is a helpful reminder.",
  "Consistency makes a big difference.",
  "Thanks for putting these ideas together.",
  "I learned something new from this post.",
  "The examples make this easier to understand.",
  "Looking forward to reading more posts like this.",
  "That is a good suggestion for beginners.",
  "I would love to see a follow-up article.",
  "This gives me a few ideas to try this week.",
  "Clear and informative. Thanks!",
  "I like how you kept the advice straightforward.",
  "A very useful perspective on the subject.",
  "I will share this with a friend.",
  "This is worth bookmarking for later.",
  "The checklist idea is especially helpful.",
  "Nice summary of the important points.",
  "Could you explain this in more detail?",
  "I tried something similar and found it helpful.",
  "Thanks! This is easy to understand.",
  "I agree with your point about keeping things simple.",
  "I will keep these suggestions in mind.",
];