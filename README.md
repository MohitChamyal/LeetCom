# 🚀 LeetCom - Company-Wise LeetCode Questions Platform

A full-stack web application that helps developers practice coding questions organized by companies. Upload CSV files with company-specific questions and let users browse, filter, and practice questions by their target companies.

![LeetCom Banner](https://via.placeholder.com/1200x400/2563eb/ffffff?text=LeetCom+-+Company+Wise+LeetCode+Questions)

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
- **React.js 18** - Modern React with Hooks
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with animations
- **Font Awesome** - Icons and social media links

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **CSV Parser** - CSV file processing
- **CORS** - Cross-origin resource sharing
  
### Access Application
- **Frontend:** http://localhost:5173 (or 3000)
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:5173/admin

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


## 🔐 Admin Access

1. **Create Admin Account:**
   - Go to `/login`
   - Click "Register" 
   - Use the `ADMIN_SECRET_KEY` from your `.env` file

2. **Upload Questions:**
   - Login to admin panel
   - Choose CSV file (filename should match company name)
   - Enter company name
   - Click "Upload Questions"

3. **Manage Data:**
   - View uploaded companies
   - Monitor question counts
   - Update admin profile

## 🌐 API Endpoints

### Authentication
- `POST /api/admin/signup` - Register new admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile/:id` - Get admin profile

### Questions Management
- `POST /api/questions/upload` - Upload CSV file
- `GET /api/questions` - Get all companies
- `GET /api/questions/:company` - Get company questions

### Health Check
- `GET /health` - Server health status

## 🎨 Key Features Demo

### 🏠 Homepage
- Browse all available companies
- Search companies by name
- View question counts per company

### 📊 Company Questions
- Filter by difficulty level
- Sort by frequency, name, or acceptance rate
- Direct links to LeetCode problems
- Topic tags for each question

### 👨‍💼 Admin Dashboard
- Secure authentication system
- Bulk CSV upload with validation
- Real-time upload progress
- Data deduplication (no duplicate questions)

### 🔍 Smart Features
- **Responsive Design** - Works on all devices
- **Error Handling** - User-friendly error messages
- **Loading States** - Smooth user experience
- **Route Protection** - Secure admin access
- **404 Handling** - Custom not found pages

## 🚀 Deployment

### Deploy Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy from `server` folder

### Deploy Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Update `VITE_BACKEND_URL` to your deployed backend

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Update `MONGODB_URL` in environment variables

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

- [ ] User authentication and progress tracking
- [ ] Bookmarking favorite questions
- [ ] Discussion forums for each question
- [ ] Difficulty-based progress analytics
- [ ] Email notifications for new questions
- [ ] API rate limiting and caching
- [ ] Dark mode theme support

## 🐛 Known Issues

- CSV upload requires exact filename matching company name
- Large CSV files (>5MB) are rejected
- Admin session expires on browser refresh

## 📞 Support

If you encounter any issues or have questions:

1. **Check existing issues** in GitHub
2. **Create new issue** with detailed description
3. **Contact via email** or LinkedIn

---

## 🌐 Production Deployment

### Quick Deploy
- **Deployment Guide:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Checklist:** See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Backend Guide:** See [server/DEPLOYMENT.md](./server/DEPLOYMENT.md)

### Deploy to Vercel
```bash
# Backend
cd server && vercel --prod

# Frontend  
cd client && vercel --prod
```

**Environment Variables Required:**
- Backend: `SUPABASE_URL`, `SUPABASE_KEY`, `ADMIN_SECRET_KEY`, `JWT_SECRET`, `CORS_ORIGIN`
- Frontend: `VITE_BACKEND_URL`

---

⭐ **Don't forget to star this repository if you found it helpful!**


