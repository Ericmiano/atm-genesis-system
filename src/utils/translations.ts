import { Language } from '../types/atm';

export const translations = {
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
    loans: 'Loans',
    settings: 'Settings',
    logout: 'Logout',
    
    // Common
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    processing: 'Processing...',
    success: 'Success',
    error: 'Error',
    
    // Withdrawal & Deposit
    quickAmounts: 'Quick Amounts',
    customAmount: 'Custom Amount',
    enterAmount: 'Enter Amount',
    withdraw: 'Withdraw',
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
    fraudAlerts: 'Fraud Alerts',
    
    // New loan-related translations
    loanApplication: 'Loan Application',
    myLoans: 'My Loans',
    loanPayments: 'Loan Payments',
    applyForLoan: 'Apply for Loan',
    loanType: 'Loan Type',
    loanAmount: 'Loan Amount',
    loanTerm: 'Loan Term',
    interestRate: 'Interest Rate',
    monthlyPayment: 'Monthly Payment',
    remainingBalance: 'Remaining Balance',
    loanStatus: 'Loan Status',
    personalLoan: 'Personal Loan',
    businessLoan: 'Business Loan',
    emergencyLoan: 'Emergency Loan',
    educationLoan: 'Education Loan',
    loanPurpose: 'Loan Purpose',
    collateral: 'Collateral',
    makePayment: 'Make Payment',
    paymentAmount: 'Payment Amount',
    nextPaymentDue: 'Next Payment Due',
    loanHistory: 'Loan History',
    
    // Enhanced admin translations
    userManagement: 'User Management',
    loanManagement: 'Loan Management',
    systemMonitoring: 'System Monitoring',
    suspendUser: 'Suspend User',
    activateUser: 'Activate User',
    resetPin: 'Reset PIN',
    adjustBalance: 'Adjust Balance',
    approveLoan: 'Approve Loan',
    rejectLoan: 'Reject Loan',
    resolveFraudAlert: 'Resolve Fraud Alert',
    adminActions: 'Admin Actions',
    reason: 'Reason',
    userActions: 'User Actions',
    loanApprovals: 'Loan Approvals',
    fraudMonitoring: 'Fraud Monitoring',
    systemHealth: 'System Health',
    complianceReports: 'Compliance Reports',
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
    loans: 'Préstamos',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    
    // Common
    back: 'Atrás',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    processing: 'Procesando...',
    success: 'Éxito',
    error: 'Error',
    
    // Withdrawal & Deposit
    quickAmounts: 'Cantidades Rápidas',
    customAmount: 'Cantidad Personalizada',
    enterAmount: 'Ingrese Cantidad',
    withdraw: 'Retirar',
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
    fraudAlerts: 'Alertas de Fraude',
    
    // Loan translations in Spanish
    loanApplication: 'Solicitud de Préstamo',
    myLoans: 'Mis Préstamos',
    loanPayments: 'Pagos de Préstamo',
    applyForLoan: 'Solicitar Préstamo',
    loanType: 'Tipo de Préstamo',
    loanAmount: 'Monto del Préstamo',
    loanTerm: 'Plazo del Préstamo',
    interestRate: 'Tasa de Interés',
    monthlyPayment: 'Pago Mensual',
    remainingBalance: 'Saldo Restante',
    loanStatus: 'Estado del Préstamo',
    personalLoan: 'Préstamo Personal',
    businessLoan: 'Préstamo Comercial',
    emergencyLoan: 'Préstamo de Emergencia',
    educationLoan: 'Préstamo Educativo',
    loanPurpose: 'Propósito del Préstamo',
    collateral: 'Garantía',
    makePayment: 'Realizar Pago',
    paymentAmount: 'Monto del Pago',
    nextPaymentDue: 'Próximo Pago Vence',
    loanHistory: 'Historial de Préstamos',
    
    userManagement: 'Gestión de Usuarios',
    loanManagement: 'Gestión de Préstamos',
    systemMonitoring: 'Monitoreo del Sistema',
    suspendUser: 'Suspender Usuario',
    activateUser: 'Activar Usuario',
    resetPin: 'Restablecer PIN',
    adjustBalance: 'Ajustar Saldo',
    approveLoan: 'Aprobar Préstamo',
    rejectLoan: 'Rechazar Préstamo',
    resolveFraudAlert: 'Resolver Alerta de Fraude',
    adminActions: 'Acciones de Administrador',
    reason: 'Razón',
    userActions: 'Acciones de Usuario',
    loanApprovals: 'Aprobaciones de Préstamo',
    fraudMonitoring: 'Monitoreo de Fraude',
    systemHealth: 'Salud del Sistema',
    complianceReports: 'Reportes de Cumplimiento',
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
    loans: 'Prêts',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    
    // Common
    back: 'Retour',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    processing: 'Traitement...',
    success: 'Succès',
    error: 'Erreur',
    
    // Withdrawal & Deposit
    quickAmounts: 'Montants Rapides',
    customAmount: 'Montant Personnalisé',
    enterAmount: 'Entrez le Montant',
    withdraw: 'Retirer',
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
    fraudAlerts: 'Alertes de Fraude',
    
    // Loan translations in French
    loanApplication: 'Demande de Prêt',
    myLoans: 'Mes Prêts',
    loanPayments: 'Paiements de Prêt',
    applyForLoan: 'Demander un Prêt',
    loanType: 'Type de Prêt',
    loanAmount: 'Montant du Prêt',
    loanTerm: 'Durée du Prêt',
    interestRate: 'Taux d\'Intérêt',
    monthlyPayment: 'Paiement Mensuel',
    remainingBalance: 'Solde Restant',
    loanStatus: 'Statut du Prêt',
    personalLoan: 'Prêt Personnel',
    businessLoan: 'Prêt Commercial',
    emergencyLoan: 'Prêt d\'Urgence',
    educationLoan: 'Prêt Éducatif',
    loanPurpose: 'Objectif du Prêt',
    collateral: 'Garantie',
    makePayment: 'Effectuer un Paiement',
    paymentAmount: 'Montant du Paiement',
    nextPaymentDue: 'Prochain Paiement Dû',
    loanHistory: 'Historique des Prêts',
    
    userManagement: 'Gestion des Utilisateurs',
    loanManagement: 'Gestion des Prêts',
    systemMonitoring: 'Surveillance du Système',
    suspendUser: 'Suspendre l\'Utilisateur',
    activateUser: 'Activer l\'Utilisateur',
    resetPin: 'Réinitialiser le PIN',
    adjustBalance: 'Ajuster le Solde',
    approveLoan: 'Approuver le Prêt',
    rejectLoan: 'Rejeter le Prêt',
    resolveFraudAlert: 'Résoudre l\'Alerte de Fraude',
    adminActions: 'Actions d\'Administrateur',
    reason: 'Raison',
    userActions: 'Actions Utilisateur',
    loanApprovals: 'Approbations de Prêt',
    fraudMonitoring: 'Surveillance de la Fraude',
    systemHealth: 'Santé du Système',
    complianceReports: 'Rapports de Conformité',
  }
};
