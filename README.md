# Loto Bayii Yönetim Sistemi (Lottery Store Management System)

A comprehensive web application designed specifically for Turkish lottery store businesses to manage multiple stores, track income and expenses, and monitor employee activities. Features role-based access control, multi-store management, and detailed financial reporting.

## 🎯 Features

### 🏢 For Business Owners
- **Multi-Store Management**: Create and manage multiple lottery stores
- **Dashboard Overview**: Aggregated financial statistics across all stores
- **Employee Management**: Add and manage employee accounts (employees work across all stores)
- **Comprehensive Reports**: Store-specific financial reports with date range filtering
- **Income & Expense Tracking**: Full control over all financial entries
- **Password Recovery**: Plain text password storage for easy account recovery

### 👥 For Employees
- **Multi-Store Access**: Add income and expense entries for any store
- **Lottery Income Types**: Support for all Turkish lottery income categories
- **Expense Management**: Add both expenses (harcamalar) and payments (ödemeler)
- **Entry History**: View and edit your own financial entries
- **Mobile-Optimized**: Easy data entry on mobile devices

## 💰 Income Categories

### Gelir Türleri (Income Types)
- **Nakit Geliri** - Cash income
- **POS Geliri** - POS/Card income  
- **Amorti (Bilet) Geliri** - Ticket amortization income
- **Amorti (Kazıkazan) Geliri** - Scratchcard amortization income
- **Amorti (Sayısal Loto) Geliri** - Numerical lottery amortization income

### Gider Türleri (Expense Types)
- **Harcamalar** - General expenses
- **Ödemeler** - Payments

## 🏪 Store Management

- **Store Creation**: Simple store setup requiring only a name
- **Multi-Store Operations**: All income and expenses are linked to specific stores
- **Store Filtering**: Filter reports and data by individual stores
- **Employee Access**: All employees can access and add entries for any store

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Language**: Turkish interface (internationalization removed)
- **Design**: Mobile-first responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lottery-app
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
   MONGODB_URL=mongodb://localhost:27017/lottery-management
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
   - Click "Yeni işletme mi? Buradan kayıt olun"
   - Enter your company name, username, and password
   - You'll be automatically logged in

2. **Create Stores**
   - Go to the "Mağazalar" (Stores) tab
   - Click "Mağaza Ekle" (Add Store)
   - Enter store name and save

3. **Add Employees** (Optional)
   - Go to the "Çalışanlar" (Employees) tab
   - Click "Çalışan Ekle" (Add Employee)
   - Provide name, username, and password for each employee

4. **Start Tracking**
   - Use the "Gelir Ekle" (Add Income) section to record financial entries
   - Select the appropriate store for each entry
   - Employees can log in and add entries for any store

## 📊 Reports & Analytics

### Business Dashboard
- **Genel Bakış** (Overview): Total stores, income, expenses, and profit across all stores
- **Raporlar** (Reports): Store-specific financial analysis with filtering options
- **Date Range Selection**: View data for specific time periods
- **Store Filtering**: Filter all data by individual stores
- **Employee Activity**: Track which employee made which entries

### Report Features
- **Store-specific totals**: All income types, expenses, payments, and net profit
- **Employee breakdown**: Detailed table showing entries by each employee
- **Date filtering**: Flexible date range selection
- **Real-time calculations**: Automatic profit/loss calculations

## 🔐 Security Features

- **Plain text business passwords** for easy recovery (security trade-off for convenience)
- **JWT authentication** with HTTP-only cookies
- **Role-based access control** (business vs employee)
- **Input validation** and sanitization
- **MongoDB injection protection**
- **Secure session management**

## 📱 Mobile-First Design

Optimized for Turkish lottery stores with:
- **Touch-friendly interfaces** for quick data entry
- **Responsive layouts** that work on all devices
- **Optimized tables** with horizontal scrolling
- **Large buttons** for easy mobile interaction
- **Turkish language interface**

## 🎮 Business Rules

- **No daily entry limits**: Multiple income entries allowed per day (restriction removed)
- **Store-linked entries**: All income and expenses must be associated with a store
- **Employee permissions**: Employees can add both income and expenses
- **Edit permissions**: Users can only edit their own entries
- **Date restrictions**: Entries limited to last month and current month for edits
- **Role separation**: Business owners see all data, employees see their own

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📡 API Routes

### Authentication
- `POST /api/auth/register` - Register new business
- `POST /api/auth/login` - User login (business/employee)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Store Management
- `GET /api/stores` - Get all stores for business
- `POST /api/stores` - Create new store (business only)
- `PUT /api/stores/[id]` - Update store (business only)
- `DELETE /api/stores/[id]` - Delete store (business only)

### Employee Management
- `GET /api/employees` - Get business employees (business only)
- `POST /api/employees` - Create new employee (business only)
- `PUT /api/employees/[id]` - Update employee (business only)
- `DELETE /api/employees/[id]` - Delete employee (business only)

### Financial Tracking
- `GET /api/income` - Get income entries (with store filtering)
- `POST /api/income` - Create new income entry
- `PUT /api/income/[id]` - Update income entry
- `DELETE /api/income/[id]` - Delete income entry
- `GET /api/expenses` - Get expense entries (with store/type filtering)
- `POST /api/expenses` - Create new expense entry
- `PUT /api/expenses/[id]` - Update expense entry
- `DELETE /api/expenses/[id]` - Delete expense entry

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/lottery-management` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secure-jwt-secret-key-here` |
| `NEXT_PUBLIC_APP_URL` | Application URL (for production) | `https://yourdomain.com` |

## 🚀 Deployment

1. **Database Setup**: Configure MongoDB Atlas or your preferred MongoDB hosting
2. **Environment Variables**: Update all production environment variables
3. **Platform Deployment**: Deploy to Vercel, Netlify, or your preferred platform
4. **Domain Configuration**: Ensure `NEXT_PUBLIC_APP_URL` matches your domain
5. **SSL Certificate**: Ensure HTTPS is enabled for security

## 📋 Data Models

### Business
- Company information and authentication
- Links to employees and stores
- Plain text password storage for recovery

### Store
- Store name and business association
- Links to income and expense entries

### Employee
- Employee information and authentication
- Business association (works across all stores)

### Income Entry
- All lottery income types with store association
- User tracking and date management

### Expense Entry
- Categorized expenses (harcama/ödeme) with store association
- User tracking and date management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially mobile responsiveness)
5. Ensure Turkish language consistency
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Loto Bayii Yönetim Sistemi** - Türk loto bayileri için özel olarak tasarlanmış, kapsamlı bir işletme yönetim uygulaması.