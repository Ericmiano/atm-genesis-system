
import { Language } from '../types/atm';

export interface Translations {
  // Basic system
  atmSystem: string;
  secureLogin: string;
  accountNumber: string;
  pin: string;
  login: string;
  loggingIn: string;
  demoAccounts: string;
  welcome: string;
  selectTransaction: string;
  cashWithdrawal: string;
  cashDeposit: string;
  balanceInquiry: string;
  fundsTransfer: string;
  loans: string;
  transactionHistory: string;
  billPayment: string;
  settings: string;
  logout: string;
  
  // Authentication
  username: string;
  password: string;
  cardNumber: string;
  expiryDate: string;
  balance: string;
  keepCardSecure: string;
  verifyPin: string;
  enterPinToAuthorize: string;
  cancel: string;
  verify: string;
  verifying: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordRequirements: string;
  accountLocked: string;
  unlockAccount: string;
  lockReason: string;
  securitySettings: string;
  passwordSecurity: string;
  sessionSecurity: string;
  fraudProtection: string;
  
  // Common UI
  back: string;
  processing: string;
  language: string;
  
  // Transaction specific
  currentBalance: string;
  quickAmounts: string;
  customAmount: string;
  enterAmount: string;
  deposit: string;
  withdraw: string;
  transfer: string;
  recipientAccount: string;
  transferAmount: string;
  
  // PIN management
  changePin: string;
  currentPin: string;
  newPin: string;
  confirmPin: string;
  
  // Admin
  adminPanel: string;
  users: string;
  transactions: string;
  auditLogs: string;
  fraudAlerts: string;
}

export const translations: Record<string, Translations> = {
  en: {
    // Basic system
    atmSystem: "ATM Banking System",
    secureLogin: "Secure Login Portal",
    accountNumber: "Account Number",
    pin: "PIN",
    login: "Login",
    loggingIn: "Logging in...",
    demoAccounts: "Demo Accounts:",
    welcome: "Welcome",
    selectTransaction: "Please select a transaction",
    cashWithdrawal: "Cash Withdrawal",
    cashDeposit: "Cash Deposit",
    balanceInquiry: "Balance Inquiry",
    fundsTransfer: "Funds Transfer",
    loans: "Loans",
    transactionHistory: "Transaction History",
    billPayment: "Bill Payment",
    settings: "Settings",
    logout: "Logout",
    
    // Authentication
    username: "Username",
    password: "Password",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    balance: "Balance",
    keepCardSecure: "Keep your card details secure",
    verifyPin: "Verify PIN",
    enterPinToAuthorize: "Enter your PIN to authorize",
    cancel: "Cancel",
    verify: "Verify",
    verifying: "Verifying...",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    passwordRequirements: "Password Requirements",
    accountLocked: "Account Locked",
    unlockAccount: "Unlock Account",
    lockReason: "Lock Reason",
    securitySettings: "Security Settings",
    passwordSecurity: "Password Security",
    sessionSecurity: "Session Security",
    fraudProtection: "Fraud Protection",
    
    // Common UI
    back: "Back",
    processing: "Processing...",
    language: "Language",
    
    // Transaction specific
    currentBalance: "Current Balance",
    quickAmounts: "Quick Amounts",
    customAmount: "Custom Amount",
    enterAmount: "Enter Amount",
    deposit: "Deposit",
    withdraw: "Withdraw",
    transfer: "Transfer",
    recipientAccount: "Recipient Account",
    transferAmount: "Transfer Amount",
    
    // PIN management
    changePin: "Change PIN",
    currentPin: "Current PIN",
    newPin: "New PIN",
    confirmPin: "Confirm PIN",
    
    // Admin
    adminPanel: "Admin Panel",
    users: "Users",
    transactions: "Transactions",
    auditLogs: "Audit Logs",
    fraudAlerts: "Fraud Alerts",
  },
  es: {
    // Basic system
    atmSystem: "Sistema Bancario ATM",
    secureLogin: "Portal de Acceso Seguro",
    accountNumber: "Número de Cuenta",
    pin: "PIN",
    login: "Iniciar Sesión",
    loggingIn: "Iniciando sesión...",
    demoAccounts: "Cuentas Demo:",
    welcome: "Bienvenido",
    selectTransaction: "Por favor seleccione una transacción",
    cashWithdrawal: "Retiro de Efectivo",
    cashDeposit: "Depósito de Efectivo",
    balanceInquiry: "Consulta de Saldo",
    fundsTransfer: "Transferencia de Fondos",
    loans: "Préstamos",
    transactionHistory: "Historial de Transacciones",
    billPayment: "Pago de Facturas",
    settings: "Configuración",
    logout: "Cerrar Sesión",
    
    // Authentication
    username: "Nombre de Usuario",
    password: "Contraseña",
    cardNumber: "Número de Tarjeta",
    expiryDate: "Fecha de Vencimiento",
    balance: "Saldo",
    keepCardSecure: "Mantenga los detalles de su tarjeta en seguridad",
    verifyPin: "Verificar PIN",
    enterPinToAuthorize: "Ingrese su PIN para autorizar",
    cancel: "Cancelar",
    verify: "Verificar",
    verifying: "Verificando...",
    changePassword: "Cambiar Contraseña",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmPassword: "Confirmar Contraseña",
    passwordRequirements: "Requisitos de Contraseña",
    accountLocked: "Cuenta Bloqueada",
    unlockAccount: "Desbloquear Cuenta",
    lockReason: "Razón del Bloqueo",
    securitySettings: "Configuración de Seguridad",
    passwordSecurity: "Seguridad de Contraseña",
    sessionSecurity: "Seguridad de Sesión",
    fraudProtection: "Protección contra Fraude",
    
    // Common UI
    back: "Atrás",
    processing: "Procesando...",
    language: "Idioma",
    
    // Transaction specific
    currentBalance: "Saldo Actual",
    quickAmounts: "Montos Rápidos",
    customAmount: "Monto Personalizado",
    enterAmount: "Ingresar Monto",
    deposit: "Depositar",
    withdraw: "Retirar",
    transfer: "Transferir",
    recipientAccount: "Cuenta del Destinatario",
    transferAmount: "Monto a Transferir",
    
    // PIN management
    changePin: "Cambiar PIN",
    currentPin: "PIN Actual",
    newPin: "Nuevo PIN",
    confirmPin: "Confirmar PIN",
    
    // Admin
    adminPanel: "Panel de Administración",
    users: "Usuarios",
    transactions: "Transacciones",
    auditLogs: "Registros de Auditoría",
    fraudAlerts: "Alertas de Fraude",
  },
  fr: {
    // Basic system
    atmSystem: "Système Bancaire GAB",
    secureLogin: "Portail de Connexion Sécurisé",
    accountNumber: "Numéro de Compte",
    pin: "Code PIN",
    login: "Connexion",
    loggingIn: "Connexion en cours...",
    demoAccounts: "Comptes Démo:",
    welcome: "Bienvenue",
    selectTransaction: "Veuillez sélectionner une transaction",
    cashWithdrawal: "Retrait d'Espèces",
    cashDeposit: "Dépôt d'Espèces",
    balanceInquiry: "Consultation de Solde",
    fundsTransfer: "Transfert de Fonds",
    loans: "Prêts",
    transactionHistory: "Historique des Transactions",
    billPayment: "Paiement de Factures",
    settings: "Paramètres",
    logout: "Déconnexion",
    
    // Authentication
    username: "Nom d'Utilisateur",
    password: "Mot de Passe",
    cardNumber: "Numéro de Carte",
    expiryDate: "Date d'Expiration",
    balance: "Solde",
    keepCardSecure: "Gardez les détails de votre carte en sécurité",
    verifyPin: "Vérifier le PIN",
    enterPinToAuthorize: "Entrez votre PIN pour autoriser",
    cancel: "Annuler",
    verify: "Vérifier",
    verifying: "Vérification...",
    changePassword: "Changer le Mot de Passe",
    currentPassword: "Mot de Passe Actuel",
    newPassword: "Nouveau Mot de Passe",
    confirmPassword: "Confirmer le Mot de Passe",
    passwordRequirements: "Exigences du Mot de Passe",
    accountLocked: "Compte Verrouillé",
    unlockAccount: "Déverrouiller le Compte",
    lockReason: "Raison du Verrouillage",
    securitySettings: "Paramètres de Sécurité",
    passwordSecurity: "Sécurité du Mot de Passe",
    sessionSecurity: "Sécurité de Session",
    fraudProtection: "Protection contre la Fraude",
    
    // Common UI
    back: "Retour",
    processing: "Traitement en cours...",
    language: "Langue",
    
    // Transaction specific
    currentBalance: "Solde Actuel",
    quickAmounts: "Montants Rapides",
    customAmount: "Montant Personnalisé",
    enterAmount: "Entrer le Montant",
    deposit: "Déposer",
    withdraw: "Retirer",
    transfer: "Transférer",
    recipientAccount: "Compte du Destinataire",
    transferAmount: "Montant à Transférer",
    
    // PIN management
    changePin: "Changer le PIN",
    currentPin: "PIN Actuel",
    newPin: "Nouveau PIN",
    confirmPin: "Confirmer le PIN",
    
    // Admin
    adminPanel: "Panneau d'Administration",
    users: "Utilisateurs",
    transactions: "Transactions",
    auditLogs: "Journaux d'Audit",
    fraudAlerts: "Alertes de Fraude",
  }
};
