import type { Category, LanguageMode } from '../types.ts';

export interface CopySet {
  brandWordmark: string;
  navCatalog: string;
  navSelected: string;
  navAdvisor: string;
  navMethodology: string;
  navCta: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryBtn: string;
  heroSecondaryBtn: string;
  heroMeta1: string;
  heroMeta2: string;
  heroMeta3: string;
  catalogTitle: string;
  catalogSubtitle: string;
  searchPlaceholder: string;
  clearSearch: string;
  rtlToggleLabel: string;
  showingCount: (visible: number, total: number) => string;
  categories: Record<Category, string>;
  noProductsTitle: string;
  noProductsBody: string;
  resetFilters: string;
  selectBtn: string;
  selectedBtn: string;
  detailsBtn: string;
  modalActives: string;
  modalHowToUse: string;
  modalClose: string;
  selectedPanelTitle: string;
  selectedPanelEmpty: string;
  clearAll: string;
  removeItem: string;
  generateRoutine: string;
  generatingRoutine: string;
  selectAtLeastOne: string;
  advisorTitle: string;
  advisorSubtitle: string;
  webSearchLabel: string;
  webSearchOn: string;
  webSearchOff: string;
  resetChat: string;
  chatEmptyTitle: string;
  chatEmptyBody: string;
  quickPrompts: string[];
  chatPlaceholder: string;
  sendMessage: string;
  sourcesHeading: string;
  retryBtn: string;
  methodologyTitle: string;
  methodologyItems: Array<{ title: string; body: string }>;
  footerNote: string;
}

export const COPY: Record<LanguageMode, CopySet> = {
  en: {
    brandWordmark: "L'ORÉAL ATELIER",
    navCatalog: 'Catalog',
    navSelected: 'Selection',
    navAdvisor: 'Advisor',
    navMethodology: 'Method',
    navCta: 'Build Routine',
    heroTitle: 'Precision beauty routines, tailored to your regimen.',
    heroSubtitle:
      'Curate L’Oréal Group skincare, haircare, makeup, and fragrance essentials. Build a balanced AM/PM ritual and refine it with real-time web-grounded guidance.',
    heroPrimaryBtn: 'Explore Catalog',
    heroSecondaryBtn: 'Selected',
    heroMeta1: '12 Curated Formulas',
    heroMeta2: 'AM & PM Layering',
    heroMeta3: 'Live Web Citations',
    catalogTitle: 'Formulation Catalog',
    catalogSubtitle:
      'Click any card to include it in your routine, or open Product Details to review active ingredients and application notes.',
    searchPlaceholder: 'Search by product, brand, or ingredient...',
    clearSearch: 'Clear search',
    rtlToggleLabel: 'العربية (RTL)',
    showingCount: (visible, total) => `Showing ${visible} of ${total} products`,
    categories: {
      All: 'All',
      Skincare: 'Skincare',
      Haircare: 'Haircare',
      Makeup: 'Makeup',
      Fragrance: 'Fragrance',
    },
    noProductsTitle: 'No matching formulations',
    noProductsBody: 'Try another keyword or clear your active category filter.',
    resetFilters: 'Reset Filters',
    selectBtn: 'Select for Routine',
    selectedBtn: 'Selected',
    detailsBtn: 'Details',
    modalActives: 'Key Actives & Notes',
    modalHowToUse: 'Application Protocol',
    modalClose: 'Close',
    selectedPanelTitle: 'Selected Products',
    selectedPanelEmpty:
      'Select products from the catalog above. Your list stays saved automatically across page reloads.',
    clearAll: 'Clear All',
    removeItem: 'Remove',
    generateRoutine: 'Generate Routine',
    generatingRoutine: 'Building Routine...',
    selectAtLeastOne: 'Select at least one product to generate a personalized routine.',
    advisorTitle: 'Beauty Advisor',
    advisorSubtitle:
      'Generates AM/PM routines from your selected items and answers beauty follow-up questions.',
    webSearchLabel: 'Web Search',
    webSearchOn: 'Live Web Search On',
    webSearchOff: 'Web Search Off',
    resetChat: 'New Chat',
    chatEmptyTitle: 'Ready for your personalized routine',
    chatEmptyBody:
      'Select your preferred formulas and press Generate Routine, or ask a question about skincare, haircare, makeup, or fragrance below.',
    quickPrompts: [
      'What order should I layer serums, moisturizer, and sunscreen?',
      'Which active ingredients should I avoid mixing in one routine?',
      'How can I adapt this regimen for sensitive or dry skin?',
    ],
    chatPlaceholder: 'Ask a follow-up about your routine, ingredients, or products...',
    sendMessage: 'Send',
    sourcesHeading: 'Web Sources & Citations',
    retryBtn: 'Retry',
    methodologyTitle: 'How the Atelier Works',
    methodologyItems: [
      {
        title: '01. Curate & Persist',
        body: 'Select formulas across skincare, haircare, makeup, and fragrance. Your selection is saved automatically in browser storage.',
      },
      {
        title: '02. Structured Layering',
        body: 'Generate a personalized AM and PM sequence grounded in the exact JSON specifications of your chosen products.',
      },
      {
        title: '03. Focused Follow-Ups',
        body: 'Continue the conversation with full history awareness and optional live web search citations for current beauty guidance.',
      },
    ],
    footerNote: "L'Oréal Atelier Routine Builder · Built with #ff003b & #e3a535 brand palette",
  },
  ar: {
    brandWordmark: 'لوريال أتيليه',
    navCatalog: 'المنتجات',
    navSelected: 'المختارة',
    navAdvisor: 'المستشار',
    navMethodology: 'الطريقة',
    navCta: 'أنشئ الروتين',
    heroTitle: 'روتين جمال دقيق مصمم خصيصاً لاحتياجاتك.',
    heroSubtitle:
      'اختاري مستحضرات لوريال للعناية بالبشرة والشعر والمكياج والعطور، وأنشئي روتيناً متوازناً للصباح والمساء مدعوماً بالبحث الفوري عبر الويب.',
    heroPrimaryBtn: 'استعرضي المنتجات',
    heroSecondaryBtn: 'المختارة',
    heroMeta1: '١٢ مستحضراً مختاراً',
    heroMeta2: 'ترتيب صباحي ومسائي',
    heroMeta3: 'مصادر ويب موثقة',
    catalogTitle: 'مجموعة المستحضرات',
    catalogSubtitle:
      'اضغطي على أي بطاقة لإضافتها إلى روتينك، أو افتحي التفاصيل للاطلاع على المكونات الفعالة وطريقة الاستخدام.',
    searchPlaceholder: 'ابحثي بالاسم أو العلامة أو المكون الفعال...',
    clearSearch: 'مسح البحث',
    rtlToggleLabel: 'English (LTR)',
    showingCount: (visible, total) => `عرض ${visible} من أصل ${total} منتج`,
    categories: {
      All: 'الكل',
      Skincare: 'العناية بالبشرة',
      Haircare: 'العناية بالشعر',
      Makeup: 'المكياج',
      Fragrance: 'العطور',
    },
    noProductsTitle: 'لا توجد منتجات مطابقة',
    noProductsBody: 'جربي كلمة بحث أخرى أو أعيدي ضبط الفئة المختارة.',
    resetFilters: 'إعادة ضبط الفلاتر',
    selectBtn: 'أضيفي للروتين',
    selectedBtn: 'تم الاختيار',
    detailsBtn: 'التفاصيل',
    modalActives: 'المكونات الفعالة',
    modalHowToUse: 'طريقة الاستخدام',
    modalClose: 'إغلاق',
    selectedPanelTitle: 'المنتجات المختارة',
    selectedPanelEmpty:
      'اختاري المنتجات من القائمة أعلاه. يتم حفظ اختياراتك تلقائياً حتى بعد إعادة تحميل الصفحة.',
    clearAll: 'مسح الكل',
    removeItem: 'إزالة',
    generateRoutine: 'إنشاء الروتين',
    generatingRoutine: 'جاري إعداد الروتين...',
    selectAtLeastOne: 'اختاري منتجاً واحداً على الأقل لإنشاء روتين مخصص.',
    advisorTitle: 'مستشار الجمال الذكي',
    advisorSubtitle:
      'ينشئ روتين الصباح والمساء من منتجاتك المختارة ويجيب عن أسئلة الجمال والعناية.',
    webSearchLabel: 'بحث الويب',
    webSearchOn: 'البحث المباشر مفعّل',
    webSearchOff: 'البحث المباشر متوقف',
    resetChat: 'محادثة جديدة',
    chatEmptyTitle: 'مستعد لإعداد روتينك المخصص',
    chatEmptyBody:
      'حددي المستحضرات المفضلة واضغطي على إنشاء الروتين، أو اطرحي سؤالاً حول البشرة أو الشعر أو المكياج أو العطور.',
    quickPrompts: [
      'ما هو الترتيب الصحيح لوضع السيروم والمرطب وواقي الشمس؟',
      'ما المكونات الفعالة التي يُفضّل عدم دمجها معاً؟',
      'كيف أعدّل هذا الروتين ليناسب البشرة الحساسة أو الجافة؟',
    ],
    chatPlaceholder: 'اسألي عن روتينك أو المكونات أو خطوات التطبيق...',
    sendMessage: 'إرسال',
    sourcesHeading: 'المصادر والروابط الموثقة',
    retryBtn: 'إعادة المحاولة',
    methodologyTitle: 'كيف يعمل المستشار',
    methodologyItems: [
      {
        title: '٠١. الاختيار والحفظ التلقائي',
        body: 'اختاري المستحضرات عبر جميع الفئات مع حفظ تلقائي في المتصفح لبقاء قائمتك جاهزة دائماً.',
      },
      {
        title: '٠٢. ترتيب علمي دقيق',
        body: 'أنشئي جدولاً صباحياً ومسائياً يعتمد على مواصفات ومكونات المنتجات التي اخترتِها بدقة.',
      },
      {
        title: '٠٣. متابعة تفاعلية',
        body: 'واصلي طرح الأسئلة مع تذكر كامل للمحادثة وإمكانية تفعيل البحث المباشر في الويب مع الروابط.',
      },
    ],
    footerNote: 'منصة لوريال أتيليه لتصميم الروتين · ألوان العلامة #ff003b و #e3a535',
  },
};
