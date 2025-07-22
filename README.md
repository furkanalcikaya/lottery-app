# Income Management System

A modern web application for businesses to track daily income and expenses. Features role-based access control for business owners and employees, with comprehensive reporting and analytics.

## Features

### For Business Owners
- **Dashboard Overview**: Real-time statistics and analytics
- **Employee Management**: Add and manage employee accounts
- **Income Tracking**: Record your own daily income and expenses
- **Comprehensive Reports**: Monthly breakdowns with per-user analytics
- **Date Range Filtering**: View data for specific periods

### For Employees
- **Daily Entry**: Record cash income, POS income, and expenses
- **Edit/Delete**: Modify entries from the last month
- **Personal History**: View your own income/expense history
- **Simple Interface**: Mobile-first design for easy on-the-go entry

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Security**: bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd income-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configurations:
   ```env
   MONGODB_URL=mongodb://localhost:27017/income-management
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. **Register a Business Account**
   - Click "New business? Register here"
   - Enter your company name, username, and password
   - You'll be automatically logged in

2. **Add Employees** (Optional)
   - Go to the "Employees" tab in your dashboard
   - Click "Add Employee"
   - Provide name, username, and password for each employee

3. **Start Tracking**
   - Use the "Add Today's End of Day" button to record income/expenses
   - Employees can log in with their credentials to add their own entries

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/income-management` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secure-jwt-secret-key-here` |
| `NEXT_PUBLIC_APP_URL` | Application URL (for production) | `https://yourdomain.com` |

## API Routes

- `POST /api/auth/register` - Register new business
- `POST /api/auth/login` - User login (business/employee)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `GET /api/employees` - Get business employees (business only)
- `POST /api/employees` - Create new employee (business only)
- `GET /api/income` - Get income entries (filtered by role)
- `POST /api/income` - Create new income entry
- `PUT /api/income/[id]` - Update income entry
- `DELETE /api/income/[id]` - Delete income entry

## Security Features

- Password hashing with bcryptjs
- JWT authentication with HTTP-only cookies
- Role-based access control
- Input validation and sanitization
- MongoDB injection protection
- Secure session management

## Mobile-First Design

The application is optimized for mobile devices with:
- Responsive grid layouts
- Touch-friendly buttons and forms
- Optimized table views with horizontal scrolling
- Mobile navigation patterns

## Business Rules

- Employees can only edit/delete entries from the last month
- Each user can only have one entry per date
- Business owners can see all employee data
- Employees can only see their own data
- All monetary values support decimal precision

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment

1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Update environment variables for production
3. Deploy to Vercel, Netlify, or your preferred platform
4. Ensure `NEXT_PUBLIC_APP_URL` is set to your domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
