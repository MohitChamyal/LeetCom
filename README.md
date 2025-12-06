# 🚀 LeetCom - Company-Wise LeetCode Questions Platform

A full-stack web application that helps developers practice coding questions organized by companies. Upload CSV files with company-specific questions and let users browse, filter, and practice questions by their target companies.

![LeetCom Banner](https://via.placeholder.com/1200x400/2563eb/ffffff?text=LeetCom+-+Company+Wise+LeetCode+Questions)

## 🌐 Live Demo

- **Frontend:** [https://leet-com.vercel.app](https://leet-com.vercel.app)
- **Backend API:** [https://leet-com-backend.vercel.app](https://leet-com-backend.vercel.app)
- **Admin Panel:** [https://leet-com.vercel.app/login](https://leet-com.vercel.app/login)

## ✨ Features

### 👨‍💼 Admin Features
- **Secure Authentication** - Admin login/signup with secret key protection
- **CSV Upload** - Bulk upload questions via CSV files
- **Data Management** - Add new questions while preserving existing data
- **Question Validation** - Automatic data validation and deduplication
- **Company Management** - Track multiple companies and question counts

### 👥 User Features
- **Company Browse** - Explore questions from different tech companies
- **Advanced Filtering** - Filter by difficulty (Easy, Medium, Hard)
- **Smart Sorting** - Sort by frequency, name, or acceptance rate
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Direct Links** - Quick access to original LeetCode problems

## 🛠️ Tech Stack

### Frontend
- **React.js 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with animations
- **Vercel** - Frontend hosting platform

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase PostgreSQL** - Cloud-hosted PostgreSQL database
- **Multer** - File upload handling (memory storage)
- **bcryptjs** - Password hashing
- **CSV Parser** - CSV file processing
- **CORS** - Cross-origin resource sharing
- **Vercel Serverless** - Serverless function deployment

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for database)
- Vercel account (for deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohitChamyal/LeetCom.git
   cd LeetCom
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

   Create `.env` file in `server` directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key
   ADMIN_SECRET_KEY=your_admin_secret_key
   CORS_ORIGIN=http://localhost:5173
   PORT=5000
   ```

   Initialize Supabase database:
   ```bash
   # Run the SQL schema from server/schema.sql in your Supabase SQL Editor
   ```

   Start backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   ```

   Create `.env` file in `client` directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

   Start frontend dev server:
   ```bash
   npm run dev
   ```

4. **Access Application**
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:5000
   - **Admin Panel:** http://localhost:5173/login

## 📊 Database Schema

### Supabase Tables

**users** table:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**questions** table:
```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    frequency DECIMAL(5, 2),
    acceptance_rate VARCHAR(50),
    link TEXT,
    topics TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 CSV Upload Format

To upload questions, prepare a CSV file with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `Difficulty` | Easy/Medium/Hard | Medium |
| `Title` | Question title | Two Sum |
| `Frequency` | Frequency percentage (0-100) | 85 |
| `Acceptance Rate` | Acceptance percentage | 45.2% |
| `Link` | LeetCode URL | https://leetcode.com/problems/two-sum/ |
| `Topics` | Comma-separated tags | Array,Hash Table |

**Sample CSV:**
```csv
Difficulty,Title,Frequency,Acceptance Rate,Link,Topics
Medium,Two Sum,85,45.2%,https://leetcode.com/problems/two-sum/,Array,Hash Table
Hard,Median of Two Sorted Arrays,60,35.1%,https://leetcode.com/problems/median-of-two-sorted-arrays/,Array,Binary Search
```

## 🔐 Admin Access

1. **Create Admin Account:**
   - Go to [https://leet-com.vercel.app/login](https://leet-com.vercel.app/login)
   - Click "Register" tab
   - Enter username, email, and password
   - Use the `ADMIN_SECRET_KEY` (contact admin for key)
   - Click "Sign Up"

2. **Upload Questions:**
   - Login to admin panel
   - Click "Choose File" to select CSV
   - Enter company name (e.g., "Google", "Amazon")
   - Click "Upload Questions"
   - Wait for success confirmation

3. **Manage Data:**
   - View all uploaded companies
   - Monitor question counts per company
   - Upload additional questions (no duplicates)

## 🌐 API Endpoints

### Authentication Routes
```
POST /api/auth/signup    - Register new admin
POST /api/auth/login     - Admin login
```

### Admin Routes
```
GET  /api/admin/profile/:id  - Get admin profile by ID
```

### Questions Routes
```
POST /api/questions/upload       - Upload CSV file with questions
GET  /api/questions/all          - Get all companies
GET  /api/questions/:company     - Get questions by company name
```

### Health & Diagnostics
```
GET  /                   - API information and available endpoints
GET  /health             - Server health status
GET  /api/test           - Test endpoint with environment info
GET  /api/test-db        - Test Supabase database connection
```

## 🎨 Project Structure

```
LeetCom/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Admin/           # Admin dashboard
│   │   │   ├── Company/         # Company questions view
│   │   │   ├── Footer/          # Footer component
│   │   │   ├── Home/            # Homepage
│   │   │   ├── Login/           # Auth pages
│   │   │   └── NotFound/        # 404 page
│   │   ├── services/
│   │   │   └── api.js           # Axios API configuration
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── .env                     # Environment variables
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json              # Vercel deployment config
│
├── server/                      # Backend Express application
│   ├── api/
│   │   └── index.js             # Serverless function entry point
│   ├── config/
│   │   └── index.js             # Environment configuration
│   ├── controllers/
│   │   └── adminController.js   # Admin business logic
│   ├── database/
│   │   └── userDatabase.js      # User database operations
│   ├── middleware/
│   │   └── errorHandler.js      # Error handling middleware
│   ├── models/
│   │   ├── Questions.js         # Questions model
│   │   └── User.js              # User model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── questions.js         # Questions routes
│   ├── uploads/                 # Temporary CSV uploads
│   ├── .env                     # Environment variables
│   ├── db.js                    # Supabase client
│   ├── schema.sql               # Database schema
│   ├── package.json
│   └── vercel.json              # Vercel deployment config
│
└── README.md                    # Project documentation
```

## 🎨 Key Features Demo

### 🏠 Homepage
- Browse all available companies (Google, Amazon, Microsoft, etc.)
- View question counts per company
- Clean, responsive card-based layout
- Quick navigation to company questions

### 📊 Company Questions Page
- **Filtering:** Filter by difficulty (Easy, Medium, Hard, All)
- **Sorting:** Sort by frequency, title, or acceptance rate
- **Question Cards:** Display title, difficulty, topics, and links
- **Direct Links:** Click to open LeetCode problem in new tab
- **Responsive:** Works on mobile, tablet, and desktop

### 👨‍💼 Admin Dashboard
- **Secure Login:** JWT-based authentication
- **CSV Upload:** Drag-and-drop or click to upload
- **Progress Tracking:** Real-time upload status
- **Data Management:** View all companies and question counts
- **Deduplication:** Prevents duplicate questions automatically
- **Error Handling:** Clear error messages for failed uploads

### 🔍 Smart Features
- **Responsive Design** - Mobile-first approach, works on all devices
- **Error Handling** - User-friendly error messages and fallbacks
- **Loading States** - Smooth transitions and loading indicators
- **Route Protection** - Secure admin-only routes
- **404 Handling** - Custom not found page
- **CORS Enabled** - Secure cross-origin requests
- **Serverless Architecture** - Fast, scalable deployment on Vercel

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Backend Deployment

1. **Prepare Backend:**
   - Ensure `server/api/index.js` exists as the entry point
   - Verify `server/vercel.json` is configured correctly
   - Check all environment variables are set

2. **Deploy Backend:**
   ```bash
   cd server
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon/public key
   - `JWT_SECRET` - Secret key for JWT tokens
   - `ADMIN_SECRET_KEY` - Secret key for admin registration
   - `CORS_ORIGIN` - Frontend URL (e.g., https://leet-com.vercel.app)

4. **Verify Backend:**
   - Visit `https://your-backend.vercel.app/health`
   - Check `https://your-backend.vercel.app/api/test`

#### Frontend Deployment

1. **Update Backend URL:**
   - Edit `client/.env`
   - Set `VITE_BACKEND_URL=https://your-backend.vercel.app`

2. **Deploy Frontend:**
   ```bash
   cd client
   npm run build
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - `VITE_BACKEND_URL` - Your deployed backend URL

4. **Verify Frontend:**
   - Visit your deployed frontend URL
   - Test login/signup functionality
   - Try uploading a CSV file

### Deploy to Other Platforms

#### Backend (Railway/Render)
1. Connect GitHub repository
2. Set root directory to `server`
3. Add environment variables
4. Deploy with build command: `npm install`
5. Start command: `node api/index.js`

#### Frontend (Netlify)
1. Connect GitHub repository
2. Set base directory to `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Database Setup (Supabase)

1. **Create Supabase Project:**
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project
   - Copy Project URL and API Key

2. **Create Tables:**
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `server/schema.sql`
   - Execute SQL to create tables

3. **Disable Row Level Security (for development):**
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
   ```

4. **Update Environment Variables:**
   - Update local `.env` files with Supabase credentials
   - Update Vercel environment variables

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow existing code structure
- Add comments for complex logic
- Test new features thoroughly
- Update README if needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohit Chamyal**
- GitHub: [@MohitChamyal](https://github.com/MohitChamyal)
- LinkedIn: [Mohit Chamyal](https://www.linkedin.com/in/mohit-chamyal-57254724b/)

## 🙏 Acknowledgments

- **LeetCode** - For providing the coding problems
- **React Team** - For the amazing frontend library
- **MongoDB** - For the flexible database solution
- **Open Source Community** - For all the helpful packages

## 📈 Future Enhancements

- [ ] User authentication and personal progress tracking
- [ ] Bookmarking and saving favorite questions
- [ ] Discussion forums for each question
- [ ] Difficulty-based progress analytics dashboard
- [ ] Email notifications for newly added questions
- [ ] API rate limiting and Redis caching
- [ ] Dark mode theme support
- [ ] Export questions to PDF/Excel
- [ ] Question search functionality
- [ ] Company-wise statistics and insights
- [ ] Mock interview mode with timer
- [ ] Social login (Google, GitHub)

## 🐛 Known Issues & Limitations

- CSV file size limited to 10MB
- Admin session requires re-login on page refresh
- No pagination for large question sets (100+ questions)
- Cannot edit or delete individual questions (only bulk upload)
- No user roles (all admins have same permissions)

## 💡 Tips & Best Practices

### For Admins
- Use descriptive company names (e.g., "Google" instead of "GOOG")
- Ensure CSV format matches the template exactly
- Test with small CSV files first
- Keep ADMIN_SECRET_KEY secure and don't share publicly
- Regularly backup your Supabase database

### For Developers
- Always test locally before deploying
- Keep environment variables in sync across environments
- Monitor Vercel function logs for errors
- Use Supabase dashboard to inspect database
- Check CORS settings if frontend can't reach backend

## 📞 Support & Contact

If you encounter any issues or have questions:

1. **Check Documentation:**
   - [DEPLOYMENT.md](./server/DEPLOYMENT.md) - Detailed deployment guide
   - [schema.sql](./server/schema.sql) - Database schema reference

2. **GitHub Issues:**
   - Check [existing issues](https://github.com/MohitChamyal/LeetCom/issues)
   - Create [new issue](https://github.com/MohitChamyal/LeetCom/issues/new) with detailed description

3. **Contact:**
   - **Email:** mohitchamyal@example.com
   - **LinkedIn:** [Mohit Chamyal](https://www.linkedin.com/in/mohit-chamyal-57254724b/)
   - **GitHub:** [@MohitChamyal](https://github.com/MohitChamyal)

---

## 🌐 Production URLs

- **Frontend:** [https://leet-com.vercel.app](https://leet-com.vercel.app)
- **Backend API:** [https://leet-com-backend.vercel.app](https://leet-com-backend.vercel.app)
- **GitHub Repository:** [https://github.com/MohitChamyal/LeetCom](https://github.com/MohitChamyal/LeetCom)

---

## 📊 Project Stats

- **Total Lines of Code:** ~3,000+
- **Components:** 8 React components
- **API Endpoints:** 8+ REST endpoints
- **Deployment Platform:** Vercel (Serverless)
- **Database:** Supabase PostgreSQL
- **Response Time:** <200ms average

---

⭐ **Don't forget to star this repository if you found it helpful!**

Made with ❤️ by [Mohit Chamyal](https://github.com/MohitChamyal)


