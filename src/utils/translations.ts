
import { Language } from '../types/atm';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Login Screen
    atmSystem: 'ATM System',
    secureLogin: 'Please enter your credentials to access your account',
    accountNumber: 'Account Number',
    pin: 'PIN',
    login: 'Login',
    loggingIn: 'Logging in...',
    demoAccounts: 'Demo Accounts',
    
    // Main Menu
    welcome: 'Welcome',
    selectTransaction: 'Please select a transaction',
    cashWithdrawal: 'Cash Withdrawal',
    cashDeposit: 'Cash Deposit',
    balanceInquiry: 'Balance Inquiry',
    fundsTransfer: 'Funds Transfer',
    transactionHistory: 'Transaction History',
    billPayment: 'Bill Payment',
    settings: 'Settings',
    logout: 'Logout',
    
    // Common
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    processing: 'Processing...',
    success: 'Success',
    error: 'Error',
    
    // Withdrawal
    quickAmounts: 'Quick Amounts',
    customAmount: 'Custom Amount',
    enterAmount: 'Enter Amount',
    withdraw: 'Withdraw',
    
    // Deposit
    deposit: 'Deposit',
    
    // Balance
    currentBalance: 'Current Balance',
    
    // Transfer
    recipientAccount: 'Recipient Account',
    transferAmount: 'Transfer Amount',
    transfer: 'Transfer',
    
    // Settings
    changePin: 'Change PIN',
    currentPin: 'Current PIN',
    newPin: 'New PIN',
    confirmPin: 'Confirm New PIN',
    language: 'Language',
    
    // Transaction History
    date: 'Date',
    type: 'Type',
    amount: 'Amount',
    description: 'Description',
    status: 'Status',
    
    // Admin
    adminPanel: 'Admin Panel',
    users: 'Users',
    transactions: 'Transactions',
    auditLogs: 'Audit Logs',
    fraudAlerts: 'Fraud Alerts'
  },
  es: {
    // Login Screen
    atmSystem: 'Sistema ATM',
    secureLogin: 'Ingrese sus credenciales para acceder a su cuenta',
    accountNumber: 'Número de Cuenta',
    pin: 'PIN',
    login: 'Ingresar',
    loggingIn: 'Ingresando...',
    demoAccounts: 'Cuentas Demo',
    
    // Main Menu
    welcome: 'Bienvenido',
    selectTransaction: 'Por favor seleccione una transacción',
    cashWithdrawal: 'Retiro de Efectivo',
    cashDeposit: 'Depósito de Efectivo',
    balanceInquiry: 'Consulta de Saldo',
    fundsTransfer: 'Transferencia de Fondos',
    transactionHistory: 'Historial de Transacciones',
    billPayment: 'Pago de Facturas',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    
    // Common
    back: 'Atrás',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    processing: 'Procesando...',
    success: 'Éxito',
    error: 'Error',
    
    // Withdrawal
    quickAmounts: 'Cantidades Rápidas',
    customAmount: 'Cantidad Personalizada',
    enterAmount: 'Ingrese Cantidad',
    withdraw: 'Retirar',
    
    // Deposit
    deposit: 'Depositar',
    
    // Balance
    currentBalance: 'Saldo Actual',
    
    // Transfer
    recipientAccount: 'Cuenta Destino',
    transferAmount: 'Cantidad a Transferir',
    transfer: 'Transferir',
    
    // Settings
    changePin: 'Cambiar PIN',
    currentPin: 'PIN Actual',
    newPin: 'Nuevo PIN',
    confirmPin: 'Confirmar Nuevo PIN',
    language: 'Idioma',
    
    // Transaction History
    date: 'Fecha',
    type: 'Tipo',
    amount: 'Cantidad',
    description: 'Descripción',
    status: 'Estado',
    
    // Admin
    adminPanel: 'Panel de Administración',
    users: 'Usuarios',
    transactions: 'Transacciones',
    auditLogs: 'Registros de Auditoría',
    fraudAlerts: 'Alertas de Fraude'
  },
  fr: {
    // Login Screen
    atmSystem: 'Système ATM',
    secureLogin: 'Veuillez entrer vos identifiants pour accéder à votre compte',
    accountNumber: 'Numéro de Compte',
    pin: 'PIN',
    login: 'Connexion',
    loggingIn: 'Connexion...',
    demoAccounts: 'Comptes Démo',
    
    // Main Menu
    welcome: 'Bienvenue',
    selectTransaction: 'Veuillez sélectionner une transaction',
    cashWithdrawal: 'Retrait d\'Espèces',
    cashDeposit: 'Dépôt d\'Espèces',
    balanceInquiry: 'Consultation de Solde',
    fundsTransfer: 'Transfert de Fonds',
    transactionHistory: 'Historique des Transactions',
    billPayment: 'Paiement de Factures',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    
    // Common
    back: 'Retour',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    processing: 'Traitement...',
    success: 'Succès',
    error: 'Erreur',
    
    // Withdrawal
    quickAmounts: 'Montants Rapides',
    customAmount: 'Montant Personnalisé',
    enterAmount: 'Entrez le Montant',
    withdraw: 'Retirer',
    
    // Deposit
    deposit: 'Déposer',
    
    // Balance
    currentBalance: 'Solde Actuel',
    
    // Transfer
    recipientAccount: 'Compte Destinataire',
    transferAmount: 'Montant à Transférer',
    transfer: 'Transférer',
    
    // Settings
    changePin: 'Changer PIN',
    currentPin: 'PIN Actuel',
    newPin: 'Nouveau PIN',
    confirmPin: 'Confirmer Nouveau PIN',
    language: 'Langue',
    
    // Transaction History
    date: 'Date',
    type: 'Type',
    amount: 'Montant',
    description: 'Description',
    status: 'Statut',
    
    // Admin
    adminPanel: 'Panneau d\'Administration',
    users: 'Utilisateurs',
    transactions: 'Transactions',
    auditLogs: 'Journaux d\'Audit',
    fraudAlerts: 'Alertes de Fraude'
  }
};
