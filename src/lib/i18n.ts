import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Define all translations inline since JSON imports can be tricky with Next.js
const enTranslations = {
  "navbar": {
    "logout": "Logout"
  },
  "login": {
    "title": "Income Manager",
    "subtitle_login": "Sign in to your account",
    "subtitle_register": "Register your business",
    "company_name": "Company Name",
    "username": "Username",
    "password": "Password",
    "login_button": "Sign In",
    "register_button": "Register",
    "switch_to_register": "New business? Register here",
    "switch_to_login": "Already have an account? Sign in",
    "placeholder_company": "Enter your company name",
    "placeholder_username": "Enter your username",
    "placeholder_password": "Enter your password"
  },
  "dashboard": {
    "business_title": "Business Dashboard",
    "employee_title": "Daily Income & Expenses",
    "tabs": {
      "overview": "Overview",
      "employees": "Employees",
      "my_income": "My Income",
      "reports": "Reports"
    }
  },
  "overview": {
    "cash_income": "Selected Range Cash Income",
    "pos_income": "Selected Range POS Income", 
    "expenses": "Selected Range Expenses",
    "net_profit": "Selected Range Net Profit",
    "total_employees": "Total Employees"
  },
  "employees": {
    "title": "Employee Management",
    "add_button": "Add Employee",
    "edit_title": "Edit Employee",
    "add_title": "Add New Employee",
    "name": "Name",
    "username": "Username",
    "password": "Password",
    "created_date": "Created Date",
    "actions": "Actions",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save Employee",
    "update": "Update Employee",
    "cancel": "Cancel",
    "no_employees": "No employees found.",
    "placeholder_name": "Enter employee name",
    "placeholder_username": "Enter username",
    "placeholder_password": "Enter password",
    "employees": "Employees",
    "no_employee": "No employees found. Add your first employee to get started!",
    "edit_employee": "Edit Employee",
    "add_employee": "Add New Employee",
    "empty_password": "Leave empty to keep current password!",
    "enter_password": "Enter password"
  },
  "income": {
    "add_button": "Add Today's End of Day",
    "edit_title": "Edit Entry",
    "add_title": "Add New Entry",
    "date": "Date",
    "cash_income": "Cash Income (₺)",
    "pos_income": "POS Income (₺)",
    "expenses": "Expenses (₺)",
    "net": "Net",
    "actions": "Actions",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save Entry",
    "update": "Update Entry",
    "cancel": "Cancel",
    "no_entries": "No entries found.",
    "recent_entries": "Recent Entries",
    "net_profit": "Net Profit"
  },
  "reports": {
    "title": "Reports",
    "date_filter": "Date Range Filter",
    "start_date": "Start Date",
    "end_date": "End Date",
    "apply_filter": "Apply Filter",
    "no_data": "No data available for the selected date range.",
    "monthly_breakdown": "Monthly Breakdown",
    "cash_income": "Cash Income (₺)",
    "pos_income": "POS Income (₺)",
    "expenses": "Expenses (₺)",
    "net_profit": "Net Profit (₺)",
    "user_breakdown": "User Breakdown",
    "user": "User",
    "total": "Total",
    "description": "Reports for the selected date range"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "confirm_delete": "Are you sure you want to delete this entry?",
    "failed_to_save": "Failed to save entry",
    "failed_to_delete": "Failed to delete entry",
    "failed_to_create": "Failed to create employee",
    "failed_to_update": "Failed to update employee"
  }
};

const trTranslations = {
  "navbar": {
    "logout": "Çıkış"
  },
  "login": {
    "title": "Income Manager",
    "subtitle_login": "Hesabınıza giriş yapın",
    "subtitle_register": "İşletmenizle hesap oluşturun",
    "company_name": "Şirket Adı",
    "username": "Kullanıcı Adı",
    "password": "Şifre",
    "login_button": "Giriş Yap",
    "register_button": "Kayıt Ol",
    "switch_to_register": "Yeni işletme? Buradan kayıt olun",
    "switch_to_login": "Zaten hesabınız var mı? Giriş yapın",
    "placeholder_company": "Şirket adınızı girin",
    "placeholder_username": "Kullanıcı adınızı girin",
    "placeholder_password": "Şifrenizi girin"
  },
  "dashboard": {
    "business_title": "İşletme Paneli",
    "employee_title": "Günlük Gelir ve Giderler",
    "tabs": {
      "overview": "Genel Bakış",
      "employees": "Çalışanlar",
      "my_income": "Benim Gelirim",
      "reports": "Raporlar"
    }
  },
  "overview": {
    "cash_income": "Seçilen Tarih Aralığındaki Nakit Gelir",
    "pos_income": "Seçilen Tarih Aralığındaki POS Gelir",
    "expenses": "Seçilen Tarih Aralığındaki Giderler",
    "net_profit": "Seçilen Tarih Aralığındaki Net Kar",
    "total_employees": "Toplam Çalışan"
  },
  "employees": {
    "title": "Çalışan Yönetimi",
    "add_button": "Çalışan Ekle",
    "edit_title": "Çalışan Düzenle",
    "add_title": "Yeni Çalışan Ekle",
    "name": "Çalışan Adı",
    "username": "Kullanıcı Adı",
    "password": "Şifre",
    "created_date": "Oluşturulma Tarihi",
    "actions": "İşlemler",
    "edit": "Düzenle",
    "delete": "Sil",
    "save": "Çalışanı Kaydet",
    "update": "Çalışanı Güncelle",
    "cancel": "İptal",
    "no_employees": "Hiç çalışan bulunamadı.",
    "placeholder_name": "Çalışan adını girin",
    "placeholder_username": "Kullanıcı adını girin",
    "placeholder_password": "Şifreyi girin",
    "employees": "Çalışanlar",
    "no_employee": "Hiç çalışan bulunamadı. Çalışan eklemek için butonuna tıklayın.",
    "edit_employee": "Çalışanı Düzenle",
    "add_employee": "Yeni Çalışan Ekle",
    "empty_password": "Aynı şifreyi kullanmak için boş bırakınız!",
    "enter_password": "Şifre girin"
  },
  "income": {
    "add_button": "Bugünün Kapanışını Ekle",
    "edit_title": "Girişi Düzenle",
    "add_title": "Yeni Giriş Ekle",
    "date": "Tarih",
    "cash_income": "Nakit Gelir (₺)",
    "pos_income": "POS Gelir (₺)",
    "expenses": "Giderler (₺)",
    "net": "Net",
    "actions": "İşlemler",
    "edit": "Düzenle",
    "delete": "Sil",
    "save": "Girişi Kaydet",
    "update": "Girişi Güncelle",
    "cancel": "İptal",
    "no_entries": "Hiç giriş bulunamadı.",
    "recent_entries": "Son Girişler",
    "net_profit": "Net Kar"
  },
  "reports": {
    "title": "Raporlar",
    "date_filter": "Tarih Aralığı Filtresi",
    "start_date": "Başlangıç Tarihi",
    "end_date": "Bitiş Tarihi",
    "apply_filter": "Filtreyi Uygula",
    "no_data": "Seçilen tarih aralığı için veri bulunamadı.",
    "monthly_breakdown": "Aylık Dökümü",
    "cash_income": "Nakit Gelir (₺)",
    "pos_income": "POS Gelir (₺)",
    "expenses": "Giderler (₺)",
    "net_profit": "Net Kar (₺)",
    "user_breakdown": "Kullanıcı Dökümü",
    "user": "Kullanıcı",
    "total": "Toplam",
    "description": "Seçilen Tarih Aralığındaki Raporlar"
  },
  "common": {
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu",
    "success": "Başarılı",
    "confirm_delete": "Bu girişi silmek istediğinizden emin misiniz?",
    "failed_to_save": "Giriş kaydedilemedi",
    "failed_to_delete": "Giriş silinemedi",
    "failed_to_create": "Çalışan oluşturulamadı",
    "failed_to_update": "Çalışan güncellenemedi"
  }
};

const resources = {
  EN: { translation: enTranslations },
  TR: { translation: trTranslations },
};

// Initialize i18n immediately
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "TR", // Default to Turkish
    fallbackLng: "TR",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n; 