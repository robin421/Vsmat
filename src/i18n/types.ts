export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export interface TranslationDictionary {
  // Common / Navbar
  common: {
    appName: string;
    tagline: string;
    offlineBadge: string;
    offlineBadgeSub: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    clearSearch: string;
    navSubscriptions: string;
    navTokens: string;
    navVouchers: string;
    navAnalytics: string;
    newSubscription: string;
    switchCurrency: string;
    backupAndRestore: string;
    backupAndRestoreTitle?: string;
    dataSecurityTitle: string;
    dataSecurityDesc: string;
    exportBackup: string;
    importBackup: string;
    viewSecurityWhitepaper: string;
    settings: string;
    lockVault: string;
    vaultLocked: string;
    language: string;
    saveFailed: string;
    close: string;
    cancel: string;
    save: string;
    confirm: string;
    delete: string;
    edit: string;
    copy: string;
    copied: string;
    show: string;
    hide: string;
    active: string;
    footerTitle: string;
    footerSubtitle: string;
    footerWhitepaper: string;
    footerEncryption: string;
  };

  // Urgent Reminder Banner
  reminder: {
    title: string;
    pendingCount: string;
    description: string;
    airCoverClean: string;
    exportCalendar: string;
    syncCalendar: string;
    notifications: string;
    notificationGranted: string;
    notificationDenied: string;
    overdueDays: string; // e.g. "已逾期 {days} 天"
    dueToday: string;
    daysLeft: string; // e.g. "还剩 {days} 天"
    topUp: string;
    renewed: string;
    renewedTooltip: string;
  };

  // Subscriptions
  subscriptions: {
    categoryAll: string;
    categoryAi: string;
    categoryDev: string;
    categoryServer: string;
    filterUrgent: string;
    sortAriaLabel: string;
    sortDue: string;
    sortPrice: string;
    sortName: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyTitleFiltered: string;
    emptyDesc: string;
    emptyCta: string;
    // Card
    lifetime: string;
    moreActions: string;
    deleteSub: string;
    noAccount: string;
    copyAccount: string;
    showPassword: string;
    hidePassword: string;
    copyPassword: string;
    nextBilling: string;
    noRenewalNeeded: string;
    convertedNote: string;
    perMonth: string;
    perQuarter: string;
    perSemiAnnual: string;
    perYear: string;
    perUsage: string;
    perCycle: string;
    portal: string;
    deleteConfirm: string;
    undoRenewal: string;
    markRenewedBtn: string;
    catAiLabel: string;
    catDevLabel: string;
    catServerLabel: string;
    catProdLabel: string;
    catEntLabel: string;
    catOtherLabel: string;
  };

  // Subscription Modal
  subModal: {
    titleNew: string;
    titleEdit: string;
    descNew: string;
    descEdit: string;
    tabSmart: string;
    tabManual: string;
    ocrDropzoneText: string;
    ocrShortcutText: string;
    ocrProcessing: string;
    ocrRechoose: string;
    ocrSuccess: string;
    fieldServiceName: string;
    servicePlaceholder: string;
    quickPresets: string;
    customService: string;
    fieldCategory: string;
    fieldCycle: string;
    fieldPrice: string;
    fieldCurrency: string;
    fieldNextDate: string;
    fieldAccount: string;
    fieldPassword: string;
    field2FA: string;
    fieldAutoRenew: string;
    fieldPaymentMethod: string;
    paymentMethodPlaceholder: string;
    fieldPortalUrl: string;
    fieldRechargeUrl: string;
    fieldNotes: string;
    notesPlaceholder: string;
    saveTokenAlso: string;
    renewalHistory: string;
    cycleMonthly: string;
    cycleQuarterly: string;
    cycleSemiAnnually: string;
    cycleAnnually: string;
    cyclePrepaid: string;
    cycleLifetime: string;
    urgentBadgeToday: string;
    urgentBadgeDays: string;
    confirmAndAdd: string;
    saveChanges: string;
    moreOptions: string;
    hideMoreOptions: string;
    quickAdd1Month: string;
    quickAdd1Year: string;
  };

  // Tokens
  tokens: {
    headerTotal: string;
    addNew: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyTitleFiltered: string;
    emptyDesc: string;
    emptyCta: string;
    copyKey: string;
    copiedKey: string;
    tokenLabel: string;
    statusOk: string;
    moreActions: string;
    deleteToken: string;
    editToken: string;
    placeholderName: string;
    searchAriaLabel: string;
    modalTitleNew: string;
    modalTitleEdit: string;
    modalDesc: string;
    fieldName: string;
    fieldService: string;
    fieldKey: string;
    fieldBaseUrl: string;
    fieldModel: string;
    modelPlaceholder: string;
    baseUrlPlaceholder: string;
    fieldEmail: string;
    fieldOrgId: string;
    fieldBalance: string;
    fieldTags: string;
    fieldNotes: string;
    fieldConsoleUrl: string;
    deleteConfirm: string;
    copyConfig: string;
    copyConfigText: string;
    copyConfigJson: string;
    copyConfigEnv: string;
    copyKeyOnly: string;
    copyUrlOnly: string;
    copyModelOnly: string;
    moreOptions: string;
    hideMoreOptions: string;
    toastConfigCopied: string;
  };

  // Vouchers / Recharge
  vouchers: {
    quickTitle: string;
    quickBadge: string;
    quickDesc: string;
    pasteBtn: string;
    inputPlaceholder: string;
    autoDetect: string;
    rechargeBtn: string;
    filterAll: string;
    filterUnredeemed: string;
    filterRedeemed: string;
    addNew: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyCta: string;
    modalTitleNew: string;
    modalTitleEdit: string;
    fieldCode: string;
    fieldAmount: string;
    fieldStatus: string;
    statusUnredeemed: string;
    statusRedeemed: string;
    statusExpired: string;
    markAsRedeemed: string;
    markAsUnredeemed: string;
    undoRedeemed: string;
    oneClickRecharge: string;
    editVoucher: string;
    deleteVoucher: string;
    deleteConfirm: string;
    quickStoredConfirm: string;
    unrecognizedCode: string;
    cannotRecognizeCode: string;
    saveChanges: string;
    pendingConfirmNotice: string;
    pendingConfirmBtn: string;
    confirmRedeemedToast: string;
    confirmRedeemedAction: string;
    appleWebModalTitle: string;
    appleWebModalDesc: string;
    appleStep1: string;
    appleStep2: string;
    appleStep3: string;
    appleCopyCode: string;
    appleCopyAccount: string;
    appleOpenPage: string;
    appleConfirmDone: string;
  };

  // Analytics
  analytics: {
    cardMonthlySpend: string;
    cardAnnualSpend: string;
    cardTokens: string;
    cardVouchers: string;
    convertedEquivalent: string;
    activeSubsCount: string;
    tokensCount: string;
    vouchersCount: string;
    vouchersSub: string;
    distributionTitle: string;
    distributionDesc: string;
    totalMonthlySpend: string;
  };

  // Settings Modal
  settings: {
    title: string;
    languageTitle: string;
    languageDesc: string;
    autoLockTitle: string;
    autoLockDesc: string;
    lockNever: string;
    lock5m: string;
    lock15m: string;
    lock30m: string;
    lock60m: string;
    rememberTitle: string;
    rememberDesc: string;
    biometricsTitle: string;
    biometricsDesc: string;
    notificationsTitle: string;
    notificationsDesc: string;
    exchangeRateTitle: string;
    exchangeRateDesc: string;
    passwordSection: string;
    passwordSectionDesc: string;
    currentPwPlaceholder: string;
    newPwPlaceholder: string;
    confirmPwPlaceholder: string;
    pwStrength: string;
    pwMinLength: string;
    pwSuccess: string;
    pwSubmit: string;
    pwProcessing: string;
    errMinLength: string;
    errMismatch: string;
    errSame: string;
    errCurrentWrong: string;
  };

  // Auth / Master Password Modal
  auth: {
    titleSetup: string;
    descSetup: string;
    titleUnlock: string;
    descUnlock: string;
    pwPlaceholder: string;
    confirmPwPlaceholder: string;
    rememberUnlock: string;
    enableBio: string;
    bioBtn: string;
    btnSetup: string;
    btnUnlock: string;
    bioCancelled: string;
    bioFailed: string;
    pwRequired: string;
    pwMinLength: string;
    pwMismatch: string;
    pwWrong: string;
  };

  // Data Security Modal
  security: {
    title: string;
    badge: string;
    subtitle: string;
    corePromiseTitle: string;
    corePromiseText: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    exportCta: string;
    closeCta: string;
  };
}
