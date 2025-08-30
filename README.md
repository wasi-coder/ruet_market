# RUET Marketplace 🏪

A modern marketplace website for RUET (Rajshahi University of Engineering & Technology) students to buy, sell, and rent products from each other.

## ✨ Features

- **Department-based Categorization**: Browse products by CSE, Civil, Architecture, Mechanical, Electrical, Chemical, Industrial, and Textile departments
- **Product Categories**: Books, Electronics, Bikes, Furniture, Clothing, Sports, and more
- **Modern UI/UX**: Beautiful animations, transitions, and responsive design
- **Direct Contact**: Buyers can directly contact sellers via phone or WhatsApp
- **No Online Payments**: Cash on delivery system for security
- **Search & Filter**: Find products by department, category, type, and keywords
- **Checkout System**: Dedicated checkout page with seller contact information

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ruet-marketplace
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the database**
   ```bash
   # Import the SQL file into your MySQL database
   mysql -u your_username -p your_database < ruet_marketplace.sql
   ```

4. **Start the backend server**
   ```bash
   npm start
   # Server will run on http://localhost:3001
   ```

5. **Open the frontend**
   - Open `frontend/index.html` in your browser
   - Or serve the frontend folder using a local server

## 🏗️ Project Structure

```
ruet-marketplace/
├── backend/
│   ├── routes/
│   │   ├── users.js          # User authentication & management
│   │   ├── products.js       # Product CRUD operations
│   │   └── buyRequests.js    # Buy request management
│   ├── db.js                 # Database connection
│   ├── server.js             # Express server setup
│   └── ruet_marketplace.sql  # Database schema
├── frontend/
│   ├── css/
│   │   └── style.css         # Main stylesheet
│   ├── js/
│   │   ├── index.js          # Homepage functionality
│   │   ├── product.js        # Product details
│   │   ├── products.js       # Products listing
│   │   ├── post-product.js   # Add new product
│   │   ├── register.js       # User registration
│   │   └── login.js          # User authentication
│   ├── index.html            # Homepage
│   ├── products.html         # Products listing page
│   ├── product.html          # Product details page
│   ├── checkout.html         # Checkout page
│   ├── post-product.html     # Add product form
│   ├── register.html         # Registration form
│   └── login.html            # Login form
└── README.md
```

## 🎯 How It Works

### For Sellers
1. **Register** with your RUET ID and department
2. **Post Products** with photos, descriptions, and contact info
3. **Receive Inquiries** directly from interested buyers
4. **Arrange Pickup** and handle cash payments in person

### For Buyers
1. **Browse Products** by department or category
2. **Search & Filter** to find exactly what you need
3. **View Details** including seller contact information
4. **Contact Seller** directly via phone or WhatsApp
5. **Meet & Pay** in person on campus

## 🔧 API Endpoints

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/departments` - Get all departments

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add new product
- `GET /api/products/categories/list` - Get product categories
- `GET /api/products/category/:category` - Get products by category

### Buy Requests
- `GET /api/buy-requests` - Get all buy requests
- `POST /api/buy-requests` - Create buy request

## 🎨 Features in Detail

### Department Filtering
- **CSE**: Computer Science & Engineering
- **Civil**: Civil Engineering
- **Architecture**: Architecture
- **Mechanical**: Mechanical Engineering
- **Electrical**: Electrical Engineering
- **Chemical**: Chemical Engineering
- **Industrial**: Industrial Engineering
- **Textile**: Textile Engineering

### Product Categories
- **Books**: Textbooks, reference materials, novels
- **Electronics**: Laptops, phones, calculators, accessories
- **Bikes**: Bicycles, motorcycles
- **Furniture**: Chairs, tables, study desks
- **Clothing**: Uniforms, casual wear, formal attire
- **Sports**: Equipment, gear, accessories
- **Other**: Miscellaneous items

### Security Features
- **No Online Payments**: All transactions are cash-based
- **Direct Contact**: Buyers and sellers communicate directly
- **Campus Safety**: Meet in public locations on campus
- **Verification**: RUET ID required for registration

## 🚀 Future Enhancements

- [ ] User authentication with JWT tokens
- [ ] Product image upload functionality
- [ ] Real-time chat between buyers and sellers
- [ ] Product reviews and ratings
- [ ] Advanced search with price range filters
- [ ] Mobile app development
- [ ] Admin panel for moderation
- [ ] Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: wasi alsafa
- **University**: Rajshahi University of Engineering & Technology (RUET)
- **Project**: Student Marketplace Platform

## 📞 Support

For support and questions:
- Email: wasialsafa025@gmail.com
- Phone: 01760408330
- Campus: RUET, Rajshahi, Bangladesh

---

**Made with ❤️ for RUET students**
