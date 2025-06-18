
# ATM Genesis System

A comprehensive, full-featured modern ATM system built with React, TypeScript, and Tailwind CSS. This system provides a complete banking experience with security features, multi-language support, and comprehensive transaction capabilities.

## 🏗️ System Architecture

```
atm-genesis-system/
├── src/
│   ├── components/         → UI Components
│   │   ├── LoginScreen.tsx
│   │   ├── MainMenu.tsx
│   │   ├── WithdrawalScreen.tsx
│   │   └── ...
│   ├── contexts/          → React Context for state management
│   │   └── ATMContext.tsx
│   ├── services/          → Business logic and data access
│   │   └── atmService.ts
│   ├── types/            → TypeScript type definitions
│   │   └── atm.ts
│   ├── utils/            → Utility functions
│   │   └── translations.ts
│   └── App.tsx           → Main application component
├── public/               → Static assets
└── README.md            → This file
```

## 🚀 Features

### 🏦 Core Banking Operations
- **Cash Withdrawal** - Support for quick amounts and custom amounts
- **Cash Deposit** - Secure deposit functionality with validation
- **Balance Inquiry** - Real-time balance checking
- **Funds Transfer** - Transfer money between accounts
- **Transaction History** - Complete transaction log with filtering
- **Bill Payment** - Pay various types of bills (utilities, subscriptions, etc.)
- **PIN Management** - Secure PIN change functionality

### 🔐 Security & Compliance
- **Multi-factor Authentication** - Account number + PIN verification
- **Account Lockout Protection** - Automatic lockout after failed attempts
- **Fraud Detection** - Real-time suspicious activity monitoring
- **Audit Logging** - Complete audit trail for all operations
- **Role-based Access** - User and Admin role separation
- **Session Management** - Secure session handling with timeouts
- **PCI DSS Compliance** - Security standards implementation
- **Data Encryption** - Secure data handling practices

### 🌍 Internationalization
- **Multi-language Support** - English, Spanish, French
- **Localized UI** - Complete translation of all interface elements
- **Cultural Adaptations** - Date, currency, and number formatting

### 🎨 User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Accessibility Features** - Keyboard navigation and screen reader support
- **Intuitive Interface** - Clean, modern ATM-style interface
- **Visual Feedback** - Clear success/error messaging
- **Loading States** - Progress indicators for all operations

### 👨‍💼 Administrative Features
- **User Management** - View and manage user accounts
- **Transaction Monitoring** - Real-time transaction oversight
- **Fraud Alerts** - Automated fraud detection and alerting
- **Audit Reports** - Comprehensive logging and reporting
- **Account Recovery** - Admin tools for account unlocking

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Data Storage**: In-memory with local persistence simulation
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm/yarn/pnpm

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or pnpm package manager

## 🚀 Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd atm-genesis-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - The ATM system will be ready to use

## 🔑 Demo Accounts

The system comes with pre-configured demo accounts for testing:

### Regular Users
- **Account**: `1234567890` | **PIN**: `1234` | **Balance**: $5,000
- **Account**: `0987654321` | **PIN**: `5678` | **Balance**: $3,500

### Administrator
- **Account**: `ADMIN001` | **PIN**: `0000` | **Role**: Admin

## 🎯 How to Use

### For Regular Users
1. **Login** - Enter your account number and PIN
2. **Select Transaction** - Choose from the main menu options
3. **Complete Operation** - Follow the on-screen prompts
4. **Logout** - Always logout when finished

### For Administrators
1. **Login** with admin credentials
2. **Access Admin Panel** - Available from the main menu
3. **Monitor System** - View users, transactions, and alerts
4. **Manage Accounts** - Unlock accounts, reset PINs, etc.

## 🔒 Security Features

### Authentication
- Account number and PIN verification
- Failed attempt tracking with automatic lockout
- Session timeout for inactive users

### Fraud Prevention
- Large transaction amount monitoring
- Rapid transaction pattern detection
- Suspicious activity alerting
- Real-time risk assessment

### Data Protection
- No persistent storage of sensitive data
- Encrypted PIN handling
- Secure session management
- Audit trail for all operations

## 🌐 Language Support

Switch between languages using the settings menu:
- **English** (default)
- **Spanish** (Español)
- **French** (Français)

## 🏗️ Architecture Details

### Component Structure
- **Presentational Components** - Pure UI components
- **Container Components** - Components with business logic
- **Context Providers** - Global state management
- **Service Layer** - Business logic and data access

### Data Flow
1. User interaction triggers component event
2. Component calls service method
3. Service validates and processes request
4. Service updates data and logs audit trail
5. Component receives response and updates UI

### State Management
- **ATM Context** - Current user, authentication state, language
- **Local State** - Component-specific state (forms, UI state)
- **Service State** - Business data (users, transactions, logs)

## 📊 Available Transactions

| Transaction Type | Description | Features |
|-----------------|-------------|----------|
| Cash Withdrawal | Withdraw money from account | Quick amounts, custom amounts, balance validation |
| Cash Deposit | Deposit money to account | Amount validation, confirmation |
| Balance Inquiry | Check current balance | Real-time balance display |
| Funds Transfer | Transfer between accounts | Account validation, transfer limits |
| Transaction History | View past transactions | Filtering, pagination, export |
| Bill Payment | Pay various bills | Bill lookup, payment confirmation |
| PIN Change | Update account PIN | Current PIN verification, validation |

## 🔧 Configuration

### Environment Setup
The system runs entirely in the browser with no external dependencies. All configuration is handled through the service layer.

### Customization
- **Languages**: Add new languages in `src/utils/translations.ts`
- **Business Rules**: Modify rules in `src/services/atmService.ts`
- **UI Theme**: Customize styling in Tailwind CSS classes

## 🧪 Testing

### Manual Testing
1. **Authentication Testing**
   - Valid/invalid credentials
   - Account lockout scenarios
   - Session management

2. **Transaction Testing**
   - All transaction types
   - Error conditions
   - Boundary conditions

3. **Security Testing**
   - Fraud detection triggers
   - Input validation
   - Session security

### Test Scenarios
- **Happy Path**: Complete successful transactions
- **Error Handling**: Invalid inputs, insufficient funds
- **Security**: Multiple failed logins, suspicious transactions
- **Admin Functions**: User management, system monitoring

## 📈 Monitoring & Logging

### Audit Trail
All system activities are logged with:
- User identification
- Action performed
- Timestamp
- Result (success/failure)
- Additional context

### Fraud Detection
The system monitors for:
- Large withdrawal amounts (>$2,000)
- Multiple rapid transactions
- Unusual transaction patterns
- Failed authentication attempts

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Static Hosting
The built application can be deployed to any static hosting provider:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server

## 🤝 Contributing

This is a demonstration project showcasing ATM system capabilities. For production use, consider:

1. **Backend Integration** - Connect to real banking APIs
2. **Database Integration** - Use persistent database storage
3. **Enhanced Security** - Add encryption, HSM integration
4. **Real Fraud Detection** - Implement ML-based fraud detection
5. **Regulatory Compliance** - Full PCI DSS, AML compliance

## 📜 License

This project is provided as-is for demonstration and educational purposes.

## 🆘 Support

For questions or issues:
1. Check the demo accounts section
2. Review the transaction flow
3. Ensure all dependencies are installed
4. Check browser console for errors

## 🔮 Future Enhancements

- **Biometric Authentication** - Fingerprint/facial recognition
- **Cardless Transactions** - QR code and mobile integration
- **Advanced Reporting** - Analytics dashboard
- **Real-time Notifications** - SMS/email alerts
- **Multi-account Support** - Multiple accounts per user
- **Investment Services** - Portfolio management
- **Loan Services** - Application and management

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
