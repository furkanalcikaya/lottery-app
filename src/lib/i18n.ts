import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Define all translations inline since JSON imports can be tricky with Next.js
const enTranslations = {
  "navbar": {
    "logout": "Logout"
  },
  "login": {
    "title": "Income Management",
    "subtitle_login": "Sign in to your account",
    "subtitle_register": "Register your business",
    "business_owner_name": "Business Owner Name",
    "company_name": "Company Name",
    "username": "Username",
    "password": "Password",
    "login_button": "Sign In",
    "register_button": "Register",
    "switch_to_register": "New business? Register here",
    "switch_to_login": "Already have an account? Sign in",
    "placeholder_business_owner_name": "Enter business owner name",
    "placeholder_company": "Enter your company name",
    "placeholder_username": "Enter your username",
    "placeholder_password": "Enter your password",
    "confirm_password": "Confirm Password",
    "placeholder_confirm_password": "Confirm your password",
    "current_password": "Current Password",
    "new_password": "New Password",
    "placeholder_current_password": "Enter current password",
    "placeholder_new_password": "Enter new password"
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
    "enter_password": "Enter password",
    "business_owner": "Business Owner",
    "change_password": "Change Password"
  },
  "income": {
    "add_button": "Add Today's End of Day",
    "edit_title": "Edit Entry",
    "add_title": "Add New Entry",
    "date": "Income Date",
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
    "net_profit": "Net Profit",
    "management": "Income Management",
    "add_entry": "Add Income Entry",
    "edit_entry": "Edit Income Entry",
    "update_entry": "Update Entry",
    "total": "Total Income",
    "cash": "Cash Income",
    "pos": "POS Income"
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
    "user_breakdown_income": "User Breakdown - Incomes",
    "user_breakdown_expenses": "User Breakdown - Expenses",
    "user": "User",
    "total_header": "Total",
    "description": "Reports for the Selected Date Range",
    "this_month": "This Month",
    "today": "Today"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "confirm_delete": "Are you sure you want to delete this entry?",
    "failed_to_save": "Failed to save entry",
    "failed_to_delete": "Failed to delete entry",
    "failed_to_create": "Failed to create employee",
    "failed_to_update": "Failed to update employee",
    "password_mismatch": "Passwords do not match",
    "password_too_short": "Password must be at least 6 characters long"
  },
  "expense": {
    "management": "Expense Management",
    "add_button": "Add Expense",
    "edit_button": "Edit Expense",
    "update": "Update Expense",
    "description": "Expense Description",
    "description_placeholder": "Enter Expense Details",
    "amount": "Expense Amount",
    "date": "Expense Date",
    "no_expenses": "No expenses found.",
    "actions": "Actions",
    "edit": "Edit",
    "delete": "Delete",
    "cancel": "Cancel"
  },
  "footer": { 
    "all_rights_reserved": "All Rights Reserved.",
    "website_by": "This website was developed by",
    "website_by_furkan_alcikaya": "."
  }
};

const trTranslations = {
  "navbar": {
    "logout": "Çıkış"
  },
  "login": {
    "title": "Income Management",
    "subtitle_login": "Hesabınıza giriş yapın",
    "subtitle_register": "İşletmenizle hesap oluşturun",
    "business_owner_name": "İşletme Sahibi Adı",
    "company_name": "Şirket Adı",
    "username": "Kullanıcı Adı",
    "password": "Şifre",
    "login_button": "Giriş Yap",
    "register_button": "Kayıt Ol",
    "switch_to_register": "Yeni işletme? Buradan kayıt olun",
    "switch_to_login": "Zaten hesabınız var mı? Giriş yapın",
    "placeholder_business_owner_name": "İşletme sahibi adını girin",
    "placeholder_company": "Şirket adınızı girin",
    "placeholder_username": "Kullanıcı adınızı girin",
    "placeholder_password": "Şifrenizi girin",
    "confirm_password": "Şifre Onayı",
    "placeholder_confirm_password": "Şifrenizi tekrar girin",
    "current_password": "Mevcut Şifre",
    "new_password": "Yeni Şifre",
    "placeholder_current_password": "Mevcut şifrenizi girin",
    "placeholder_new_password": "Yeni şifrenizi girin"
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
    "enter_password": "Şifre girin",
    "business_owner": "İşletme Sahibi",
    "change_password": "Şifre Değiştir"
  },
  "income": {
    "add_button": "Bugünün Kapanışını Ekle",
    "edit_title": "Girişi Düzenle",
    "add_title": "Yeni Giriş Ekle",
    "date": "Gelir Tarih",
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
    "net_profit": "Net Kar",
    "management": "Gelir Yönetimi",
    "add_entry": "Gelir Girişi Ekle",
    "edit_entry": "Gelir Girişini Düzenle",
    "update_entry": "Girişi Güncelle",
    "total": "Toplam Gelir",
    "cash": "Nakit Gelir",
    "pos": "POS Gelir"
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
    "user_breakdown_income": "Kullanıcı Dökümü - Gelirler",
    "user_breakdown_expenses": "Kullanıcı Dökümü - Giderler",
    "user": "Kullanıcı",
    "total_header": "Toplam",
    "description": "Seçilen Tarih Aralığındaki Raporlar",
    "this_month": "Bu Ay",
    "today": "Bugün"
  },
  "common": {
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu",
    "success": "Başarılı",
    "confirm_delete": "Bu girişi silmek istediğinizden emin misiniz?",
    "failed_to_save": "Giriş kaydedilemedi",
    "failed_to_delete": "Giriş silinemedi",
    "failed_to_create": "Çalışan oluşturulamadı",
    "failed_to_update": "Çalışan güncellenemedi",
    "password_mismatch": "Şifreler eşleşmiyor",
    "password_too_short": "Şifre en az 6 karakter olmalıdır"
  },
  "expense": {
    "management": "Gider Yönetimi",
    "add_button": "Gider Ekle",
    "edit_button": "Gider Düzenle",
    "update": "Gider Güncelle",
    "description": "Gider Açıklaması",
    "description_placeholder": "Gider Detayını Giriniz",
    "amount": "Gider Tutarı",
    "date": "Gider Tarihi",
    "no_expenses": "Hiç gider bulunamadı.",
    "actions": "İşlemler",
    "edit": "Düzenle",
    "delete": "Sil",
    "cancel": "İptal"
  },
  "footer": {
    "all_rights_reserved": "Tüm Hakları Saklıdır.",
    "website_by": "Bu web sitesi",
    "website_by_furkan_alcikaya": " tarafından geliştirilmiştir."
  }
};

const resources = {
  EN: { translation: enTranslations },
  TR: { translation: trTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "TR",
    fallbackLng: "TR",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n; 