/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti seluruh blok ini)
 * ==========================================================
 * (DIMODIFIKASI: Memperbaiki error sintaks dan menggabungkan 
 * logika fade-out splash screen)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Menampilkan Splash Screen dan Loading Screen
  setTimeout(() => { // <--- Ini setTimeout untuk SPLASH (3 detik)
    const splashScreen = document.getElementById('splash-screen');
    
    // 1. PERBAIKAN: Gunakan animasi CSS (fade-out)
    if (splashScreen) {
        splashScreen.classList.add('fade-out');
    }
    document.getElementById('loading-screen').style.display = 'flex';

    // 2. Sembunyikan div splash screen setelah animasinya selesai (1s)
    setTimeout(() => {
        if (splashScreen) splashScreen.style.display = 'none';
    }, 1000); 

    // ==========================================================
    // ===== INI ADALAH BLOK YANG HILANG/ERROR DI KODE ANDA =====
    // ==========================================================
    // 3. Logika untuk LOADING SCREEN (berjalan paralel)
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      
      // Cek apakah pengguna sudah login
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        showWelcomeScreen(currentUser);
      } else {
        showAuthContainer();
      }
    }, 3000); // <--- Durasi 3 detik untuk loading screen
    // ==========================================================

  }, 3000); // <--- Durasi 3 detik untuk splash screen

  
  // Toggle Password Visibility
  const togglePassword = document.getElementById('toggle-password');
  const authPasswordInput = document.getElementById('auth-password');
  if (togglePassword && authPasswordInput) {
    togglePassword.addEventListener('click', () => {
      const type = authPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      authPasswordInput.setAttribute('type', type);
      togglePassword.classList.toggle('fa-eye-slash');
    });
  }


  // Handle Auth Button Click (Login/Register)
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('auth-email');
      const passwordInput = document.getElementById('auth-password');
      if (!emailInput || !passwordInput) return; // Guard clause

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const users = JSON.parse(localStorage.getItem('users')) || {};

      if (isLogin) {
        // Proses Login
        if (users[email] && users[email] === password) {
          showLoading('Menyambung...');
          setTimeout(() => {
            localStorage.setItem('currentUser', email);
            showWelcomeScreen(email);
            hideLoading();
          }, 3000);
        } else {
          showNotification('Email atau password salah', 'danger');
        }
      } else {
        // Proses Registrasi
        if (users[email]) {
          showNotification('Email sudah terdaftar', 'danger');
        } else {
          users[email] = password;
          localStorage.setItem('users', JSON.stringify(users));
          showNotification('Registrasi berhasil! Silakan login.', 'success');
          isLogin = true;
          switchToLoginForm();
        }
      }
    });
  }


  // Handle Switch to Register
  const switchToRegister = document.getElementById('switch-to-register');
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = false;
      switchToRegisterForm();
    });
  }


  // Handle Switch to Login (delegated)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'switch-to-login') {
      e.preventDefault();
      isLogin = true;
      switchToLoginForm();
    }
  });

  // Handle Tips Buttons
  const dailyTipsButton = document.getElementById('daily-tips-button');
  const categoryTipsButton = document.getElementById('category-tips-button');

  if (dailyTipsButton) {
    dailyTipsButton.addEventListener('click', () => {
      showTipsModal("Ketuk titik pada grafik untuk detail harian, atau tombol expand untuk layar penuh.");
    });
  }

  if (categoryTipsButton) {
    categoryTipsButton.addEventListener('click', () => {
      showTipsModal("Tekan diagram untuk komposisi barang, atau tombol expand untuk layar penuh.");
    });
  }
});

// Status autentikasi
let isLogin = true;

// Chart Instances
let dailyExpenseChart;
let categoryExpenseChart;
let categoryDailyExpenseChart;
let historyDailyExpenseChart;
let historyCategoryExpenseChart;


// BARU: Variabel untuk Modal dan State Animasi
let zoomModal;
let zoomChartInstance;
let dailyDetailModal;
let isDailyChartAnimating = false; // Untuk tombol Animasikan
let dailyChartAnimationTimeout; // Untuk mengontrol animasi

// ===== TAMBAHKAN VARIABEL BARU UNTUK ANALISIS =====
let anomalyChart; // Instance chart anomali (Scatter)
let predictionChart; // Instance chart prediksi (Bar)
let allUserExpensesCache = []; // Cache untuk semua data user
let analysisDataLoaded = false; // Flag apakah data sudah dimuat
let infoModalInstance = null;
let budgetAlertShownThisMonth = false;
let budgetModal; // BARU
let pemasukanModal; // BARU
let transferModal; // BARU
let pdfConfigModal; // BARU: Untuk modal di riwayat
let customConfirmModal; // BARU: Untuk modal konfirmasi kustom
const EXP_SALDO_DEFAULT_VIEW = 'tunai'; // BARU: Menyimpan state default
let onConfirmCallback = () => {};

// Fungsi untuk Menampilkan Auth Container
function showAuthContainer() {
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
      authContainer.style.display = 'block';
      document.body.style.backgroundColor = '#4b0082'; // Warna ungu gelap
  }
}

// Fungsi untuk Beralih ke Form Registrasi
function switchToRegisterForm() {
  const authTitle = document.getElementById('auth-title');
  const authBtn = document.getElementById('auth-btn');
  const authSwitchLink = document.getElementById('auth-switch-link');
  if (authTitle && authBtn && authSwitchLink) {
    authTitle.textContent = 'Register';
    authBtn.textContent = 'Register';
    authSwitchLink.innerHTML = 'Sudah punya akun? <a href="#" id="switch-to-login">Login di sini</a>';
  }
}

// Fungsi untuk Beralih ke Form Login
function switchToLoginForm() {
  const authTitle = document.getElementById('auth-title');
  const authBtn = document.getElementById('auth-btn');
  const authSwitchLink = document.getElementById('auth-switch-link');
  if (authTitle && authBtn && authSwitchLink) {
    authTitle.textContent = 'Log in';
    authBtn.textContent = 'Login';
    authSwitchLink.innerHTML = 'Belum punya akun? <a href="#" id="switch-to-register">Register di sini</a>';
  }
}

// Fungsi untuk Menampilkan Notifikasi
function showNotification(message, type) {
  const notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) return;

  const notification = document.createElement('div');
  notification.classList.add('notification');
  if (type === 'success') {
    notification.style.backgroundColor = '#28a745'; // Hijau
  } else if (type === 'danger') {
    notification.style.backgroundColor = '#dc3545'; // Merah
  }
  notification.textContent = message;
  notificationContainer.appendChild(notification);

  // Animasi Slide Out
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.5s forwards';
    notification.addEventListener('animationend', () => {
      notification.remove();
    });
  }, 3000); // Tampil selama 3 detik
}

// Fungsi untuk Menampilkan Loading Screen dengan Teks
function showLoading(text) {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;
  const loadingText = loadingScreen.querySelector('.loading-text');
  if (loadingText) {
      loadingText.textContent = text;
  }
  loadingScreen.style.display = 'flex';
}

// Fungsi untuk Menyembunyikan Loading Screen
function hideLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
      loadingScreen.style.display = 'none';
  }
}

// Fungsi untuk Menampilkan Aplikasi Utama
function showApp() {
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');
  if (authContainer) authContainer.style.display = 'none';
  if (appContainer) appContainer.style.display = 'block';
  document.body.style.backgroundColor = '#f4f6f9';
  initializeApp();
}
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi lama Anda dengan ini)
 * ==========================================================
 * Fungsi ini menyuntikkan semua perbaikan CSS secara dinamis
 * untuk memperbaiki tampilan form dan statistik.
 */
function applyDynamicStyles() {
    const styleId = 'dynamic-mumy-styles';
    // Hapus style lama jika ada, untuk memastikan pembaruan
    const oldStyle = document.getElementById(styleId);
    if (oldStyle) {
        oldStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        /* 1. PERBAIKAN: Konsistensi Form Tambah Pengeluaran (Barang, Jumlah, Kategori) */
        .expense-form #barang,
        .expense-form #amount,
        .category-dropdown > button#kategori-button {
            /* Paksa style agar sama dengan input bootstrap default */
            padding: 12px 16px !important; 
            margin-bottom: 15px !important;
            background-color: #ffffff !important;
            color: #333333 !important;
            border: 1px solid #d1d3e2 !important;
            border-radius: 8px !important;
            font-size: 1rem !important; /* Menyamakan font-size (bawaan button 0.9rem) */
            height: calc(1.5em + 0.75rem + 2px) !important; /* Menyamakan tinggi */
            box-sizing: border-box !important;
        }
        
        /* Style khusus untuk button kategori agar teksnya rapi */
        .category-dropdown > button#kategori-button {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            text-align: left !important;
            width: 100% !important;
            line-height: 1.5 !important; /* Menyamakan line-height input */
        }

        /* 2. PERBAIKAN: Konsistensi List Riwayat (Container Luar) */
        div.expenses-list {
            /* Paksa style agar sama dengan input */
            padding: 12px 16px !important; 
            margin-top: 15px !important;
            background-color: #ffffff !important;
            border: 1px solid #d1d3e2 !important; /* Border disamakan */
            border-radius: 8px !important; /* Radius disamakan */
            text-align: left;
            max-height: 200px; 
            overflow-y: auto; 
        }

        /* ============================================================= */
        /* 3. PERBAIKAN BARU: Mengecilkan Header Tanggal (Item di dalam Riwayat) */
        /* ============================================================= */
        ul#expenses-ul > li {
            /* Meng-override style inline dari renderExpensesList */
            background-color: #f0f0f0 !important; /* Latar abu-abu */
            font-weight: 600 !important; /* Sedikit tebal */
            
            /* Ini perbaikan utamanya: padding lebih kecil */
            padding: 10px 15px !important; 
            margin-bottom: 8px !important;
            
            /* Style lain dari .expenses-list li yg ingin dipertahankan */
            border-radius: 8px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
            cursor: pointer; /* Menandakan bisa diklik */
        }

        /* Target ikon chevron di dalam header tanggal */
        ul#expenses-ul > li i.toggle-category {
            color: #4b0082 !important; /* Ubah warna ikon agar lebih jelas */
            transition: transform 0.2s ease;
        }
        
        /* Atur ikon saat terbuka */
        ul#expenses-ul > li.expanded i.toggle-category {
            transform: rotate(180deg);
        }

        /* Atur style untuk sub-item (expense-item) agar tidak terpengaruh */
        ul#expenses-ul ul li {
            background: #ffffff !important;
            padding: 10px 15px !important; /* Padding normal */
            margin-bottom: 5px !important;
            box-shadow: none !important; /* Hapus shadow di sub-item */
            font-weight: normal !important;
            cursor: default;
        }
        /* ============================================================= */
        /* AKHIR PERBAIKAN BARU */
        /* ============================================================= */


        /* 4. PERBAIKAN: Badge Statistik (Anti-wrap) */
        #daily-stats-container .badge,
        #history-content .badge,
        .category-expense-enhanced .badge {
            max-width: none !important; /* Hapus batasan lebar */
            white-space: nowrap !important; /* Paksa tetap satu baris */
            display: inline-block !important;
        }
        #daily-stats-container .list-group-item > div:first-child,
        #history-content .list-group-item > div:first-child,
        .category-expense-enhanced .list-group-item > div:first-child {
            flex-shrink: 1; 
            margin-right: 8px; /* Beri jarak ke badge */
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* 5. PERBAIKAN: Re-skin Statistik Kategori & Riwayat (Copas dari Daily) */
        .category-expense-enhanced .statistic,
        #history-content .statistic-container {
            padding: 0 !important; 
            background-color: transparent !important;
            border: none !important;
            text-align: left !important;
            margin-top: 20px !important; 
        }
        
        /* Style list-group bersama */
        .category-expense-enhanced .list-group,
        #history-content .list-group {
            border: 1px solid #dee2e6; 
            border-radius: 0.375rem; 
            overflow: hidden; 
        }

        /* Style list-item bersama */
        .category-expense-enhanced .list-group-item,
        #history-content .list-group-item {
          border-bottom: 1px solid #eee;
          padding: 0.8rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
          min-height: 50px;
        }
        .category-expense-enhanced .list-group-item:last-child,
        #history-content .list-group-item:last-child {
            border-bottom: none;
        }
        
        /* Grup Kiri (Ikon + Teks) */
        .category-expense-enhanced .list-group-item > div:first-child,
        #history-content .list-group-item > div:first-child {
          display: flex;
          align-items: center;
          flex-grow: 1;
          flex-shrink: 1;
          padding-right: 8px;
          text-align: left;
        }

        /* Ikon Kiri (Wallet, etc.) */
        .category-expense-enhanced .list-group-item > div:first-child i:first-of-type,
        #history-content .list-group-item > div:first-child i:first-of-type {
          width: 16px;
          text-align: center;
          margin-right: 5px;
          font-size: 1em;
          color: #6c757d;
          flex-shrink: 0;
        }

        /* Grup Kanan (Badge) */
        .category-expense-enhanced .list-group-item > div:last-child,
        #history-content .list-group-item > div:last-child {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        
        /* Badge di Grup Kanan */
        .category-expense-enhanced .badge,
        #history-content .badge {
          font-size: 1rem;
          font-weight: 600;
          padding: 0.35em 0.6em;
          text-align: right;
        }

        /* Warna Ikon Spesifik (copy dari daily-stats) */
        .category-expense-enhanced i.text-primary, #history-content i.text-primary { color: #4b0082 !important; }
        .category-expense-enhanced i.text-secondary, #history-content i.text-secondary { color: #6c757d !important; }
        .category-expense-enhanced i.text-danger, #history-content i.text-danger { color: #dc3545 !important; }
        .category-expense-enhanced i.text-success, #history-content i.text-success { color: #198754 !important; }
        .category-expense-enhanced i.text-warning, #history-content i.text-warning { color: #fd7e14 !important; }
        .category-expense-enhanced i.text-info, #history-content i.text-info { color: #0dcaf0 !important; }
    `;
    // Tambahkan style ini ke <head>
    document.head.appendChild(style);
}
// Fungsi untuk Menampilkan Welcome Screen
function showWelcomeScreen(email) {
  const welcomeScreen = document.getElementById('welcome-screen');
  if (!welcomeScreen) {
      showApp(); // Langsung tampilkan app jika welcome screen tidak ada
      return;
  }
  welcomeScreen.style.display = 'flex';

  // Jalankan animasi typewriter
  const welcomeText = document.getElementById('welcome-text');
  const fullText = "Meraih Masa Depan Sukses Bersama Beasiswa Unggulan dengan Menjadi Insan Cerdas dan Kompetitif.";
  if (welcomeText) {
    welcomeText.textContent = ''; // Kosongkan teks sebelum animasi
    typeWriter(welcomeText, fullText, 30, () => {
      // Setelah teks selesai ditulis, tunggu 2 detik dan tampilkan app
      setTimeout(() => {
        welcomeScreen.style.display = 'none';
        showApp();
      }, 2000);
    });
  } else {
      // Jika teks welcome tidak ada, langsung lanjut setelah delay
      setTimeout(() => {
        welcomeScreen.style.display = 'none';
        showApp();
      }, 2000);
  }
}

// Fungsi untuk Efek Typewriter
function typeWriter(element, text, speed, callback) {
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      if (callback) callback();
    }
  }
  type();
}

// BARU: Fungsi untuk Masuk Mode Fullscreen dan Rotasi (Modifikasi A)
async function enterFullscreen(element) {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) { /* Safari */
      await element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE11 */
      await element.msRequestFullscreen();
    }

    // Coba paksa rotasi ke landscape HANYA di HP
    if (window.screen.orientation && window.innerWidth < 768) {
        await window.screen.orientation.lock('landscape');
    }
  } catch (err) {
    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    showNotification("Gagal masuk mode layar penuh.", "danger");
  }
}

// BARU: Fungsi untuk Keluar Mode Fullscreen dan Rotasi (Modifikasi A)
async function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      await document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      await document.msExitFullscreen();
    }
    // Coba unlock rotasi
    if (window.screen.orientation) {
      window.screen.orientation.unlock();
    }
  } catch (err) {
    console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
  }
}

// BARU: Fungsi untuk Menangani Klik Tombol Fullscreen (Modifikasi A)
function handleFullscreenClick(chartInstance) {
    const modalElement = document.getElementById('zoomModal');
    if (!modalElement || !chartInstance) return;

    // Masuk fullscreen & lock orientasi saat modal ditampilkan
    modalElement.addEventListener('shown.bs.modal', async () => {
        await enterFullscreen(modalElement);
        // Re-render chart di dalam modal setelah fullscreen agar ukurannya pas
        renderChartInZoomModal(chartInstance);
    }, { once: true }); // Hanya trigger sekali

    // Keluar fullscreen & unlock orientasi saat modal ditutup
    modalElement.addEventListener('hidden.bs.modal', async () => {
        await exitFullscreen();
        // Hancurkan chart di modal saat ditutup
        if (zoomChartInstance instanceof Chart) {
            zoomChartInstance.destroy();
            zoomChartInstance = null;
        }
    }, { once: true }); // Hanya trigger sekali

    // Tampilkan modal (yang akan memicu listener 'shown.bs.modal')
    zoomModal.show();
}

// BARU: Fungsi untuk Merender Chart di Modal Zoom (Modifikasi A)
function renderChartInZoomModal(originalChartInstance) {
  const zoomCtx = document.getElementById('zoom-chart-canvas').getContext('2d');

  // Hancurkan instance chart di modal sebelumnya (jika ada)
  if (zoomChartInstance instanceof Chart) {
    zoomChartInstance.destroy();
  }

  // Salin konfigurasi dari chart asli
  const newConfig = structuredClone(originalChartInstance.config);

  // Pastikan plugins ada
  if (!newConfig.options.plugins) {
    newConfig.options.plugins = {};
  }

  // Tambahkan konfigurasi plugin zoom
  newConfig.options.plugins.zoom = {
    pan: {
      enabled: true,
      mode: 'xy',
      threshold: 5,
    },
    zoom: {
      wheel: { enabled: true },
      pinch: { enabled: true },
      mode: 'xy',
    }
  };

  // Paksa chart agar responsif dan mengisi area modal
  newConfig.options.responsive = true;
  newConfig.options.maintainAspectRatio = false;

  // Hapus onClick bawaan agar tidak memicu modal detail saat di dalam modal zoom
  if (newConfig.options.onClick) {
    delete newConfig.options.onClick;
  }
  if (newConfig.options.onHover) {
    delete newConfig.options.onHover;
  }

  // Buat chart baru di modal
  zoomChartInstance = new Chart(zoomCtx, newConfig);
}


// BARU: Fungsi untuk Menampilkan Modal Detail Harian (Poin C)
function showDailyDetailModal(date) {
  const currentUser = localStorage.getItem('currentUser');
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

  // Filter pengeluaran untuk tanggal yang dipilih
  const expensesOnDate = expenses.filter(exp => {
    // Gunakan tanggal yang disimpan di expense, bukan tanggal hari ini
    const expDateOnly = new Date(exp.date).toLocaleDateString('id-ID');
    return expDateOnly === date;
  });

  const detailList = document.getElementById('daily-detail-list');
  const detailTotal = document.getElementById('daily-detail-total');
  const modalLabel = document.getElementById('dailyDetailModalLabel');
  if (!detailList || !detailTotal || !modalLabel) return; // Guard clause

  modalLabel.textContent = `Detail Pengeluaran - ${date}`;
  detailList.innerHTML = ''; // Kosongkan list

  if (expensesOnDate.length === 0) {
    detailList.innerHTML = '<li class="list-group-item text-center">Tidak ada pengeluaran pada hari ini.</li>';
    detailTotal.textContent = 'Total: Rp0';
    dailyDetailModal.show();
    return;
  }

  // ... (akhir dari fungsi showDailyDetailModal)
  dailyDetailModal.show();
}

/**
 * ==========================================================
 * FUNGSI BARU: (Tambahkan Blok Ini)
 * ==========================================================
 * FUNGSI-FUNGSI BARU UNTUK SALDO & BUDGET
 */

/**
 * Mengambil data saldo (Tunai & Bank) dari localStorage
 * @returns {object} - { tunai: number, bank: number }
 */
function getSaldo() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return { tunai: 0, bank: 0 };
    const key = `saldo_${currentUser}`;
    try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && typeof data.tunai === 'number' && typeof data.bank === 'number') {
            return data;
        }
    } catch (e) {
        console.error("Gagal parsing data saldo:", e);
    }
    // Default jika tidak ada data atau error
    return { tunai: 0, bank: 0 };
}

/**
 * Menyimpan data saldo (Tunai & Bank) ke localStorage
 * @param {object} saldo - { tunai: number, bank: number }
 */
function saveSaldo(saldo) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    const key = `saldo_${currentUser}`;
    try {
        localStorage.setItem(key, JSON.stringify(saldo));
    } catch (e) {
        console.error("Gagal menyimpan data saldo:", e);
        showNotification("Error: Gagal menyimpan saldo.", "danger");
    }
}

/**
 * Mengambil data budget bulanan dari localStorage
 * @returns {number} - Jumlah budget, atau null jika belum diatur
 */
function getBudget() {
    const currentUser = localStorage.getItem('currentUser');
    const currentMonthKey = `${getCurrentYear()}-${getCurrentMonth()}`;
    if (!currentUser) return null;
    const key = `budget_${currentUser}_${currentMonthKey}`; // Budget unik per bulan
    try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && typeof data.budget === 'number') {
            return data.budget;
        }
    } catch (e) {
        console.error("Gagal parsing data budget:", e);
    }
    return null; // Default jika belum diatur
}

/**
 * Menyimpan data budget bulanan ke localStorage
 * @param {number} budgetAmount - Jumlah budget
 */
function saveBudget(budgetAmount) {
    const currentUser = localStorage.getItem('currentUser');
    const currentMonthKey = `${getCurrentYear()}-${getCurrentMonth()}`;
    if (!currentUser) return;
    const key = `budget_${currentUser}_${currentMonthKey}`;
    try {
        localStorage.setItem(key, JSON.stringify({ budget: budgetAmount }));
    } catch (e) {
        console.error("Gagal menyimpan data budget:", e);
        showNotification("Error: Gagal menyimpan budget.", "danger");
    }
}

/**
 * Mengambil total pengeluaran untuk bulan ini
 * @returns {number} - Total pengeluaran
 */
function getTotalPengeluaranBulanIni() {
    const currentUser = localStorage.getItem('currentUser');
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
    let expenses = [];
    try {
        expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
    } catch (e) {
        console.error("Gagal parsing data pengeluaran:", e);
    }    
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

/**
 * (Helper BARU) Memperbarui tampilan Saldo di Halaman Dompet
 */
function updateSaldoDisplay() {
    const saldo = getSaldo();
    const saldoTunaiEl = document.getElementById('saldo-tunai-display');
    const saldoBankEl = document.getElementById('saldo-bank-display');
    
    if (saldoTunaiEl) saldoTunaiEl.textContent = `Rp${saldo.tunai.toLocaleString('id-ID')}`;
    if (saldoBankEl) saldoBankEl.textContent = `Rp${saldo.bank.toLocaleString('id-ID')}`;

    // Update juga info saldo di modal transfer
    const transferSaldoBankEl = document.getElementById('transfer-saldo-bank');
    if (transferSaldoBankEl) transferSaldoBankEl.textContent = `Rp${saldo.bank.toLocaleString('id-ID')}`;
}


/**
 * (Helper BARU) Memperbarui tampilan Widget Budget di Halaman Dompet
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * (Helper BARU) Memperbarui tampilan Widget Budget di Halaman Dompet
 * (DIMODIFIKASI untuk mengisi Dropdown Statistik)
 */
function updateBudgetDisplay() {
    const budget = getBudget();
    
    // Referensi ke elemen HTML baru
    const budgetSummaryHeader = document.getElementById('budget-summary-header');
    const budgetStatsContent = document.getElementById('budget-stats-content');
    const budgetSisaEl = document.getElementById('budget-sisa');
    const budgetProgressEl = document.getElementById('budget-progress-bar');
    const budgetPercentageEl = document.getElementById('budget-percentage');
    const btnAturBudget = document.getElementById('btn-atur-budget');

    if (!budgetSummaryHeader || !budgetStatsContent || !budgetSisaEl || !budgetProgressEl || !budgetPercentageEl || !btnAturBudget) {
        console.error("Elemen widget budget baru tidak ditemukan!");
        return;
    }
    
    // ==========================================================
    // ===== PERBAIKAN: PANGGIL FUNGSI BAR BARU (Poin 4) =====
    // ==========================================================
    updateExpenditureVsSaldoBar(); // Panggil update bar pengeluaran vs saldo
    // ==========================================================

    if (!budget) {
        // Jika budget BELUM diatur
        if (budgetSisaEl) budgetSisaEl.textContent = "Budget belum diatur";
        if (budgetProgressEl) {
            budgetProgressEl.style.width = '0%';
            budgetProgressEl.classList.remove('color-warn', 'color-danger');
        }
        if (budgetPercentageEl) budgetPercentageEl.textContent = "Atur";
        if (btnAturBudget) btnAturBudget.textContent = "Atur Budget Bulanan";
        
        budgetStatsContent.innerHTML = '<p class="text-muted small text-center">Atur budget Anda untuk melihat statistik detail.</p>';
        return;
    }

    // --- Jika budget SUDAH diatur, hitung semua statistik ---
    
    // 1. Ambil Data Dasar
    const saldo = getSaldo();
    const { expenses, pengeluaranTunai, pengeluaranBank } = getMonthlyExpenseDetails(); // Gunakan helper baru
    const totalPengeluaran = pengeluaranTunai + pengeluaranBank;
    
    // 3. Hitung Statistik Utama
    const sisaBudget = budget - totalPengeluaran;
    const persentaseTerpakai = (budget > 0) ? (totalPengeluaran / budget) * 100 : 0;
    const persentaseTampil = Math.min(100, persentaseTerpakai);

    // 4. Hitung Statistik Detail
    const today = new Date();
    const hariDiBulan = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const hariTelahLewat = today.getDate();
    const sisaHari = Math.max(0, hariDiBulan - hariTelahLewat);

    const avgAktual = (hariTelahLewat > 0) ? (totalPengeluaran / hariTelahLewat) : 0;
    const avgTarget = (sisaHari > 0 && sisaBudget > 0) ? (sisaBudget / sisaHari) : 0;

    const totalTunaiDimiliki = saldo.tunai + pengeluaranTunai;
    const persentasePengeluaranTunai = (totalTunaiDimiliki > 0) ? (pengeluaranTunai / totalTunaiDimiliki) * 100 : 0;

    // --- Update UI ---

    // 1. Update Header Ringkas (<summary>)
    if (budgetSisaEl) {
        budgetSisaEl.textContent = sisaBudget >= 0 
            ? `Sisa: Rp${sisaBudget.toLocaleString('id-ID')}`
            : `Lebih: Rp${Math.abs(sisaBudget).toLocaleString('id-ID')}`;
        budgetSisaEl.style.color = sisaBudget >= 0 ? '#6c757d' : '#dc3545';
    }
    if (budgetPercentageEl) budgetPercentageEl.textContent = `${persentaseTerpakai.toFixed(0)}%`;
    if (btnAturBudget) btnAturBudget.textContent = "Atur/Edit Budget"; // Ubah teks tombol

    // Atur style progress bar
    if (budgetProgressEl) {
        budgetProgressEl.style.width = `${persentaseTampil}%`;
        budgetProgressEl.classList.remove('color-warn', 'color-danger');
        if (persentaseTerpakai >= 90) {
            budgetProgressEl.classList.add('color-danger');
        } else if (persentaseTerpakai >= 70) {
            budgetProgressEl.classList.add('color-warn');
        }
    }
    
    // 2. Update Statistik Detail (Dropdown Content)
    budgetStatsContent.innerHTML = `
        <ul>
            <li>
                <span><i class="fas fa-bullseye me-2 text-primary"></i>Total Budget</span>
                <strong>Rp${budget.toLocaleString('id-ID')}</strong>
            </li>
            <li>
                <span><i class="fas fa-shopping-cart me-2 text-danger"></i>Total Pengeluaran</span>
                <strong>Rp${totalPengeluaran.toLocaleString('id-ID')}</strong>
            </li>
            <li>
                <span><i class="fas fa-check-circle me-2 text-success"></i>Sisa Budget</span>
                <strong style="color: ${sisaBudget >= 0 ? '#198754' : '#dc3545'}">Rp${sisaBudget.toLocaleString('id-ID')}</strong>
            </li>
            <li>
                <span><i class="fas fa-wallet me-2 text-info"></i>Pengeluaran Tunai</span>
                <strong>Rp${pengeluaranTunai.toLocaleString('id-ID')}</strong>
            </li>
            <li>
                <span><i class="fas fa-university me-2 text-secondary"></i>Pengeluaran Bank</span>
                <strong>Rp${pengeluaranBank.toLocaleString('id-ID')}</strong>
            </li>
            <li>
                <span><i class="fas fa-percentage me-2 text-warning"></i>% Pengeluaran dari Tunai</span>
                <strong>${persentasePengeluaranTunai.toFixed(0)}% <small>(dari total tunai bulan ini)</small></strong>
            </li>
            <li>
                <span><i class="fas fa-calculator me-2"></i>Rata-rata/hari (Target)</span>
                <strong style="color: #198754">Rp${avgTarget.toLocaleString('id-ID', {maximumFractionDigits: 0})} <small>(${sisaHari} hari lagi)</small></strong>
            </li>
            <li>
                <span><i class="fas fa-calculator me-2"></i>Rata-rata/hari (Aktual)</span>
                <strong style="color: #dc3545">Rp${avgAktual.toLocaleString('id-ID', {maximumFractionDigits: 0})} <small>(${hariTelahLewat} hari lewat)</small></strong>
            </li>
        </ul>
    `;
}
function updateSaldoInfoDiForm() {
    const saldo = getSaldo();
    const tunaiInfoEl = document.getElementById('sumber-tunai-info');
    const bankInfoEl = document.getElementById('sumber-bank-info');
    
    if (tunaiInfoEl) tunaiInfoEl.textContent = `Sisa: Rp${saldo.tunai.toLocaleString('id-ID')}`;
    if (bankInfoEl) bankInfoEl.textContent = `Sisa: Rp${saldo.bank.toLocaleString('id-ID')}`;
}

/**
 * (Helper BARU) Cek dan tampilkan peringatan budget 70%
 */
function checkBudgetAlert() {
    const currentUser = localStorage.getItem('currentUser');
    const currentMonthKey = `${getCurrentYear()}-${getCurrentMonth()}`;
    const alertKey = `budgetAlert_${currentUser}_${currentMonthKey}`;

    // Cek apakah alert sudah ditampilkan bulan ini
    if (localStorage.getItem(alertKey)) {
        budgetAlertShownThisMonth = true;
        return;
    }

    const budget = getBudget();
    if (!budget || budget === 0) return; // Tidak ada budget, tidak ada alert

    const totalPengeluaran = getTotalPengeluaranBulanIni();
    const persentaseTerpakai = (totalPengeluaran / budget) * 100;

    if (persentaseTerpakai >= 70 && !budgetAlertShownThisMonth) {
        const sisaBudget = budget - totalPengeluaran;
        const sisaSaldoTunai = getSaldo().tunai; // Ambil sisa tunai
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const sisaHari = Math.max(0, daysInMonth - today.getDate()); // Sisa hari

        // Pesan peringatan sesuai permintaan
        const pesan = `Pengeluaranmu bulan ini sudah <strong>${persentaseTerpakai.toFixed(0)}%</strong>.
                  <br><br>
                     Saat ini anda hanya memiliki sisa uang sebesar <strong>Rp${sisaSaldoTunai.toLocaleString('id-ID')}</strong> (di dompet tunai) yang digunakan selama <strong>${sisaHari} hari</strong> lagi.
                     <br><br>
                     (Total sisa budget Anda: Rp${sisaBudget.toLocaleString('id-ID')})
                     <br><br>
                     Yuk, lebih hemat!`;

        // Tampilkan modal alert
        showInfoModal(
            "⚠️ Peringatan Budget!",
            pesan
        );

        // Tandai bahwa alert sudah muncul bulan ini
        budgetAlertShownThisMonth = true;
        localStorage.setItem(alertKey, 'true');
    }
}

/**
 * Menampilkan animasi transfer internal
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Menampilkan animasi transfer internal
 * (DIMODIFIKASI untuk mengubah teks sesuai permintaan)
 */
function showTransferAnimation() {
    const overlay = document.getElementById('transfer-animation');
    if (overlay) {
        
        // BARU: Ambil elemen teks dan ubah isinya
        const textElement = overlay.querySelector('.transfer-animation-text');
        if (textElement) {
            textElement.textContent = "Mengirim ke dompet anda..."; // Teks sesuai permintaan
        }
        
        overlay.style.display = 'flex';
        
        // Sembunyikan setelah animasi selesai (CSS-nya 2 detik)
        setTimeout(() => {
            overlay.style.display = 'none';
            // Opsional: Kembalikan teks ke default jika perlu
            if (textElement) {
                 textElement.textContent = "Mengirim uang ke dompet..."; 
            }
        }, 2500); // Beri sedikit buffer
    }
}

  // Kelompokkan berdasarkan barang dalam kategori
  const groupedByItem = expensesOnDate.reduce((acc, exp) => {
    const key = `${exp.kategori}#${exp.barang}`;
    if (!acc[key]) {
      acc[key] = {
        kategori: exp.kategori,
        barang: exp.barang,
        amount: 0
      };
    }
    acc[key].amount += exp.amount;
    return acc;
  }, {});

  let totalAmount = 0;

  // Urutkan berdasarkan kategori
  const sortedExpenses = Object.values(groupedByItem).sort((a, b) => a.kategori.localeCompare(b.kategori));

  sortedExpenses.forEach(exp => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <div>
        <strong>${capitalizeFirstLetter(exp.kategori)}</strong>
        <small class="d-block text-muted">${capitalizeFirstLetter(exp.barang)}</small>
      </div>
      <span>Rp${exp.amount.toLocaleString('id-ID')}</span>
    `;
    detailList.appendChild(li);
    totalAmount += exp.amount;
  });

  detailTotal.textContent = `Total: Rp${totalAmount.toLocaleString('id-ID')}`;
  dailyDetailModal.show();


// Fungsi untuk Inisialisasi Aplikasi
// Fungsi untuk Inisialisasi Aplikasi
// Fungsi untuk Inisialisasi Aplikasi
// Fungsi untuk Inisialisasi Aplikasi
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * (DIMODIFIKASI: Mendaftarkan 'TimeScale' agar sumbu-X anomali muncul)
 */
function initializeApp() {
  // ==========================================================
  // ===== PERBAIKAN: DAFTARKAN JUGA 'TimeScale' =====
  // ==========================================================
  // Daftarkan Plugin Zoom DAN Skala Waktu (TimeScale)
  // TimeScale diperlukan untuk grafik anomali (type: 'time')
  Chart.register(ChartZoom, Chart.TimeScale);
  // ==========================================================

  // Inisialisasi Modal Utama
  zoomModal = new bootstrap.Modal(document.getElementById('zoomModal'));
  dailyDetailModal = new bootstrap.Modal(document.getElementById('dailyDetailModal'));
  
  // Inisialisasi Modal Dompet, Pemasukan, dan Transfer
  if (document.getElementById('budgetModal')) {
      budgetModal = new bootstrap.Modal(document.getElementById('budgetModal'));
  }
  if (document.getElementById('pemasukanModal')) {
      pemasukanModal = new bootstrap.Modal(document.getElementById('pemasukanModal'));
  }
  if (document.getElementById('transferModal')) {
      transferModal = new bootstrap.Modal(document.getElementById('transferModal'));
  }
  
  // Inisialisasi Info Modal
  if (document.getElementById('infoModal')) { 
      infoModalInstance = new bootstrap.Modal(document.getElementById('infoModal')); 
  }

  // Inisialisasi Modal Konfirmasi Kustom
  if (document.getElementById('customConfirmModal')) {
      customConfirmModal = new bootstrap.Modal(document.getElementById('customConfirmModal'));
  }
  
  // Listener untuk tombol "Ya" di modal konfirmasi
  document.getElementById('custom-confirm-yes-btn')?.addEventListener('click', () => {
      if (typeof onConfirmCallback === 'function') {
          onConfirmCallback();
      }
      customConfirmModal.hide();
      onConfirmCallback = () => {};
  });

  // Attach Event Listeners untuk Menu
  document.getElementById('menu-add-expense')?.addEventListener('click', () => showSection('add-expense-section'));
  document.getElementById('menu-daily-expense')?.addEventListener('click', () => showSection('daily-expense-section'));
  document.getElementById('menu-category-expense')?.addEventListener('click', () => showSection('category-expense-section'));
  document.getElementById('menu-print-expense')?.addEventListener('click', () => showSection('print-expense-section'));
  document.getElementById('menu-export-excel')?.addEventListener('click', handleExportExcel);
  document.getElementById('menu-history-expense')?.addEventListener('click', () => showSection('history-expense-section'));
  document.getElementById('menu-dompet')?.addEventListener('click', () => showSection('dompet-section'));

  // Back to Dashboard Buttons
  document.querySelectorAll('[id^="back-to-dashboard"], [id^="back-dompet-to-dashboard"], #back-analisis-to-dashboard').forEach(button => {
    button?.addEventListener('click', () => showSection('dashboard-section'));
  });
  document.getElementById('back-anomali-to-analisis')?.addEventListener('click', () => showSection('analisis-section'));
  document.getElementById('back-prediksi-to-analisis')?.addEventListener('click', () => showSection('analisis-section'));
  
  // Listener Form Saldo & Budget
  document.getElementById('budget-form')?.addEventListener('submit', handleSaveBudget);
  document.getElementById('pemasukan-form')?.addEventListener('submit', handleTambahPemasukan);
  document.getElementById('transfer-form')?.addEventListener('submit', handleTransferInternal);
  
  // Listener Reset Saldo & Budget
  document.getElementById('btn-reset-tunai')?.addEventListener('click', handleResetTunai);
  document.getElementById('btn-reset-bank')?.addEventListener('click', handleResetBank);
  document.getElementById('btn-reset-budget')?.addEventListener('click', handleResetBudget);
  
  // Listener Dropdown Bar Pengeluaran
  const expSaldoDropdown = document.querySelector('.exp-saldo-dropdown .dropdown-menu');
  if (expSaldoDropdown) {
      expSaldoDropdown.addEventListener('click', (e) => {
          e.preventDefault();
          if (e.target.classList.contains('dropdown-item')) {
              const value = e.target.getAttribute('data-value');
              const button = document.getElementById('expenditure-saldo-select');
              
              if (value === 'tunai') button.textContent = "Total Keluar vs Tunai";
              else if (value === 'bank') button.textContent = "Total Keluar vs Bank";
              else button.textContent = "Total Keluar vs Total";
              
              expSaldoDropdown.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
              e.target.classList.add('active');
              button.setAttribute('data-current-value', value); 
              updateExpenditureVsSaldoBar();
          }
      });
  }

  // Listener Reset Filter Bar
  document.getElementById('btn-reset-exp-saldo')?.addEventListener('click', handleResetExpSaldoFilter);
  
  // Listener Reset Data Pengeluaran Bulanan
  document.getElementById('btn-reset-monthly-expenses')?.addEventListener('click', handleResetMonthlyExpenses);

  // Listener untuk Filter Anomali Kategori
  document.getElementById('anomali-kategori-filter')?.addEventListener('change', filterAnomalyChart);

  // Logout Button
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

  // Handle Add Expense Form Submission
  const expenseForm = document.getElementById('expense-form');
  if (expenseForm) expenseForm.addEventListener('submit', handleAddExpense);

  // Handle Print Form Submission
  const printForm = document.getElementById('print-expense-form');
  if (printForm) printForm.addEventListener('submit', handlePrintExpense);

  // Listener Tombol Menu Analisis
  document.getElementById('menu-analisis')?.addEventListener('click', () => showSection('analisis-section'));
  document.getElementById('goto-anomali')?.addEventListener('click', () => showSection('anomali-detail-section'));
  document.getElementById('goto-prediksi')?.addEventListener('click', () => showSection('prediksi-detail-section'));
  
  // Listener daftar pengeluaran (ul#expenses-ul)
  const expensesUl = document.getElementById('expenses-ul');
  if (expensesUl) {
      expensesUl.removeEventListener('click', handleExpenseListClick);
      expensesUl.addEventListener('click', handleExpenseListClick);
  }

  // Initialize History & Print
  initializeHistoryYearOptions();
  initializePrintYearOptions();

  // Set default Tanggal & Jam
  setDefaultDateTime();

  // Render Initial
  renderDashboard();
  
  // Handle Kategori Dropdown
  loadSavedCategories();
  initializeDropdown('kategori-button', 'category-options', 'kategori-selected', 'add-new-category', 'add-category-input', 'new-category-input', 'save-new-category', 'category');

  // Initialize Tips Modal
  if (document.getElementById('tipsModal')) {
    new bootstrap.Modal(document.getElementById('tipsModal'));
  }

  // Initialize Category Expense
  initializeCategoryExpenseEnhanced();

  // Event listener tombol chart (avg, animate, fullscreen)
  const toggleAvgButton = document.getElementById('toggle-average-line');
  if (toggleAvgButton) {
      toggleAvgButton.addEventListener('click', (e) => {
          if (dailyExpenseChart) {
              const button = e.currentTarget;
              const isToggled = button.getAttribute('data-toggled') === 'true';
              const newState = !isToggled;
              button.setAttribute('data-toggled', newState);
              button.innerHTML = newState ? '<i class="fas fa-check-circle"></i> Garis Rata-rata' : '<i class="fas fa-times-circle"></i> Garis Rata-rata';
              dailyExpenseChart.setDatasetVisibility(1, newState);
              dailyExpenseChart.update();
          }
      });
  }
  const animateButton = document.getElementById('animate-daily-chart');
  if (animateButton) {
      animateButton.addEventListener('click', animateDailyChart);
  }
  document.addEventListener('click', (e) => {
      const fullscreenBtn = e.target.closest('.fullscreen-button');
      if (fullscreenBtn) {
          const chartTargetId = fullscreenBtn.getAttribute('data-chart-target');
          let targetChartInstance = null;
          switch(chartTargetId) {
              case 'daily-expense-chart': targetChartInstance = dailyExpenseChart; break;
              case 'category-expense-chart': targetChartInstance = categoryExpenseChart; break;
              case 'category-daily-chart': targetChartInstance = categoryDailyExpenseChart; break;
              case 'history-daily-chart': targetChartInstance = historyDailyExpenseChart; break;
              case 'history-category-chart': targetChartInstance = historyCategoryExpenseChart; break;
          }
          if (targetChartInstance) {
              handleFullscreenClick(targetChartInstance);
          }
      }
  });

  // Terapkan perbaikan visual
  applyDynamicStyles();
}
// BARU: Fungsi untuk set default tanggal dan jam (Poin D)
function setDefaultDateTime() {
    const dateInput = document.getElementById('expense-date');
    const timeInput = document.getElementById('expense-time');
    
    if (dateInput && timeInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        dateInput.value = `${year}-${month}-${day}`;
        timeInput.value = `${hours}:${minutes}`;
    }
}

// BARU: Fungsi generik untuk inisialisasi dropdown (Kategori & Sumber Dana)
function initializeDropdown(buttonId, optionsId, selectedInputId, addNewBtnId, addInputContainerId, newInputId, saveBtnId, type) {
    const dropdownButton = document.getElementById(buttonId);
    const optionsContainer = document.getElementById(optionsId);
    const selectedInput = document.getElementById(selectedInputId);
    const addNewButton = document.getElementById(addNewBtnId);
    const addInputContainer = document.getElementById(addInputContainerId);
    const newInput = document.getElementById(newInputId);
    const saveButton = document.getElementById(saveBtnId);

    if (!dropdownButton || !optionsContainer || !selectedInput || !addNewButton || !addInputContainer || !newInput || !saveButton) {
        // console.error(`Missing elements for dropdown type: ${type}`);
        return; // Guard clause jika ada elemen yang hilang
    }
    
    // Toggle dropdown
    dropdownButton.addEventListener('click', () => {
        optionsContainer.classList.toggle('show');
    });

    // Handle option selection (delegated)
    optionsContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest(`button[data-${type}]`);
        if (targetButton) {
            const selectedValue = targetButton.getAttribute(`data-${type}`);
            if (selectedValue === `add-new-${type}`) {
                addInputContainer.style.display = 'block';
            } else {
                selectedInput.value = selectedValue;
                dropdownButton.innerHTML = `${capitalizeFirstLetter(selectedValue)} <i class="fas fa-chevron-down float-end"></i>`;
                optionsContainer.classList.remove('show');
                addInputContainer.style.display = 'none'; // Sembunyikan input tambah
                newInput.value = ''; // Kosongkan input tambah
            }
        }
    });

    // Handle save new item
    saveButton.addEventListener('click', () => {
        const newValue = newInput.value.trim();
        if (newValue) {
            const lowerCaseValue = newValue.toLowerCase();
            
            // Cek duplikasi sebelum menambah
            const existingOptions = optionsContainer.querySelectorAll(`button[data-${type}]`);
            let isDuplicate = false;
            existingOptions.forEach(opt => {
                if (opt.getAttribute(`data-${type}`) === lowerCaseValue) {
                    isDuplicate = true;
                }
            });

            if (isDuplicate) {
                showNotification(`${capitalizeFirstLetter(type)} "${capitalizeFirstLetter(newValue)}" sudah ada.`, 'danger');
                return;
            }
            
            // Tambahkan item baru ke dropdown
            const newButton = document.createElement('button');
            newButton.type = 'button';
            newButton.setAttribute(`data-${type}`, lowerCaseValue);
            newButton.textContent = capitalizeFirstLetter(newValue);
            optionsContainer.insertBefore(newButton, addNewButton);

            if (type === 'category') {
                console.log(`Saving new category: ${newValue}`); // Log
                saveCategory(newValue); // Simpan dengan case asli
            }

            // Set item baru sebagai yang dipilih
            selectedInput.value = lowerCaseValue;
            dropdownButton.innerHTML = `${capitalizeFirstLetter(newValue)} <i class="fas fa-chevron-down float-end"></i>`;
            optionsContainer.classList.remove('show');
            addInputContainer.style.display = 'none';
            newInput.value = '';
            showNotification(`${capitalizeFirstLetter(type)} "${capitalizeFirstLetter(newValue)}" berhasil ditambahkan.`, 'success');
        }
    });
}

/**
 * ==========================================================
 * FUNGSI BARU: (Tambahkan Fungsi Ini)
 * ==========================================================
 * BARU: Menangani Reset Filter Bar Pengeluaran
 */
function handleResetExpSaldoFilter() {
    const button = document.getElementById('expenditure-saldo-select');
    const dropdownMenu = document.querySelector('.exp-saldo-dropdown .dropdown-menu');
    
    if (!button || !dropdownMenu) return;

    // 1. Set state & teks tombol ke default
    button.setAttribute('data-current-value', EXP_SALDO_DEFAULT_VIEW);
    button.textContent = "Total Keluar vs Tunai"; // Teks default
    
    // 2. Update kelas 'active' di dropdown
    dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-value') === EXP_SALDO_DEFAULT_VIEW) {
            item.classList.add('active');
        }
    });
    
    // 3. Render ulang bar
    updateExpenditureVsSaldoBar();
    
    showNotification("Filter bar telah direset.", "success");
}

// ===== KODE BARU: Fungsi untuk menyimpan Kategori ke localStorage =====
function saveCategory(categoryValue) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return; // Jangan simpan jika tidak ada user
    const key = `categories_${currentUser}`; // Kunci unik per user
    let savedCategories = [];
    try {
        // Coba ambil data yang sudah ada, pastikan itu array
        const existingData = localStorage.getItem(key);
        savedCategories = existingData ? JSON.parse(existingData) : [];
        if (!Array.isArray(savedCategories)) savedCategories = [];
    } catch (error) {
        console.error("Error parsing saved categories:", error);
        savedCategories = []; // Reset jika error
    }

    // Pastikan unik sebelum menyimpan (case-insensitive)
    const lowerCaseValue = categoryValue.toLowerCase();
    if (!savedCategories.some(cat => cat.toLowerCase() === lowerCaseValue)) {
        savedCategories.push(categoryValue); // Simpan dengan case asli
        try {
            localStorage.setItem(key, JSON.stringify(savedCategories));
            console.log("Saved categories:", savedCategories); // Log untuk debug
        } catch (e) {
            console.error("Error saving categories to localStorage:", e);
            showNotification("Gagal menyimpan kategori baru.", "danger");
        }
    }
}

// ===== KODE BARU: Fungsi untuk memuat Kategori dari localStorage =====
function loadSavedCategories() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return; // Jangan load jika tidak ada user

    const key = `categories_${currentUser}`;
    let savedCategories = [];
     try {
        const existingData = localStorage.getItem(key);
        savedCategories = existingData ? JSON.parse(existingData) : [];
        if (!Array.isArray(savedCategories)) savedCategories = [];
    } catch (error) {
        console.error("Error parsing saved categories:", error);
        savedCategories = []; // Reset jika error
    }

    const optionsContainer = document.getElementById('category-options');
    const addNewButton = document.getElementById('add-new-category');

    if (!optionsContainer || !addNewButton) {
        console.error("Category options container or add new button not found during load.");
        return; // Pastikan elemen ada
    }

    // Dapatkan daftar kategori default dari HTML untuk mencegah duplikasi
    const defaultCategories = new Set();
    optionsContainer.querySelectorAll('button[data-category]:not(#add-new-category)')
        .forEach(btn => defaultCategories.add(btn.getAttribute('data-category')));

    console.log("Loading saved categories:", savedCategories); // Log untuk debug
    savedCategories.forEach(category => {
        const lowerCaseCategory = category.toLowerCase();
        // Hanya tambahkan jika BUKAN default DAN belum ada di DOM
        if (!defaultCategories.has(lowerCaseCategory) && !optionsContainer.querySelector(`button[data-category="${lowerCaseCategory}"]`)) {
            console.log(`Adding saved category to DOM: ${category}`); // Log penambahan
            const newButton = document.createElement('button');
            newButton.type = 'button';
            newButton.setAttribute('data-category', lowerCaseCategory);
            newButton.textContent = capitalizeFirstLetter(category); // Tampilkan dengan case asli
            // Sisipkan sebelum tombol "Tambah Kategori Baru"
            optionsContainer.insertBefore(newButton, addNewButton);
        } else {
             console.log(`Skipping duplicate/default category: ${category}`); // Log jika duplikat
        }
    });
}

// BARU: Fungsi untuk menyimpan Sumber Dana ke localStorage (Poin D)
// BARU: Fungsi untuk memuat Sumber Dana dari localStorage (Poin D)

// Fungsi untuk Menampilkan Section yang Dipilih
// Fungsi untuk Menampilkan Section yang Dipilih
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Menampilkan Section yang Dipilih
 * (DIMODIFIKASI untuk Saldo & Budget)
 */
function showSection(sectionId) {
  console.log(`Navigating to section: ${sectionId}`);
  document.querySelectorAll('.section').forEach(section => {
    section.classList.toggle('active', section.id === sectionId);
  });

  // Reset flag data analisis jika kembali ke dashboard atau sub-menu
  if (sectionId === 'dashboard-section' || sectionId === 'analisis-section') {
      analysisDataLoaded = false;
      allUserExpensesCache = []; // Kosongkan cache
      resetAnalysisViews(); // Panggil fungsi reset (ada di Bagian 3)
  }
  
  // Perbarui UI dinamis berdasarkan section
  switch (sectionId) {
    case 'dashboard-section':
      renderDashboard(); // Update saldo & budget saat kembali ke dashboard
      break;
    case 'dompet-section': // BARU
      renderDompetPage(); // Update saldo & budget di halaman dompet
      break;
    case 'daily-expense-section':
      renderDailyExpenseChart();
      break;
    case 'category-expense-section':
      renderCategoryExpenseChart();
      initializeCategoryExpenseEnhanced();
      break;
    case 'history-expense-section':
      initializeHistoryYearOptions();
      // Kosongkan konten riwayat saat pindah halaman
      const historyContent = document.getElementById('history-content');
      if (historyContent) {
          historyContent.innerHTML = '<p class="text-muted">Pilih tahun dan bulan.</p>';
      }
      // Sembunyikan tombol ekspor (akan muncul saat data di-load)
      const exportButtons = document.getElementById('history-export-buttons');
      if (exportButtons) exportButtons.style.display = 'none';
      break;
    case 'print-expense-section':
      initializePrintYearOptions();
      break;
    case 'add-expense-section':
      renderExpensesList();
      loadSavedCategories();
      updateSaldoInfoDiForm(); // BARU: Tampilkan sisa saldo di form
      break;
    case 'analisis-section':
      // Tidak perlu load data di sub-menu
      break;
    case 'anomali-detail-section':
      loadAndRunAnomalyDetection(); // Panggil fungsi (ada di Bagian 3)
      break;
    case 'prediksi-detail-section':
      loadAndSetupPrediction(); // Panggil fungsi (ada di Bagian 3)
      break;
  }
  
  toggleLogoutButton(sectionId);
}

// Fungsi untuk Menampilkan atau Menyembunyikan Tombol Logout
function toggleLogoutButton(sectionId) {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    if (sectionId === 'dashboard-section') {
      logoutBtn.classList.add('visible');
    } else {
      logoutBtn.classList.remove('visible');
    }
  }
}

// Fungsi untuk Menangani Logout
function handleLogout() {
  showNotification('Keluar dari akun...', 'success'); // Notifikasi keluar
  setTimeout(() => {
    localStorage.removeItem('currentUser');
    location.reload();
  }, 2000); // Delay 2 detik sebelum logout
}

// MODIFIKASI: Fungsi untuk Menangani Penambahan Pengeluaran (Poin D)
// MODIFIKASI: Fungsi untuk Menangani Penambahan Pengeluaran (TANPA SUMBER DANA)
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Menangani Penambahan Pengeluaran (DIMODIFIKASI DENGAN SUMBER PEMBAYARAN)
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Menangani Penambahan Pengeluaran (DIMODIFIKASI DENGAN SUMBER PEMBAYARAN)
 */
function handleAddExpense(e) {
  e.preventDefault();
  const dateInput = document.getElementById('expense-date');
  const timeInput = document.getElementById('expense-time');
  const barangInput = document.getElementById('barang');
  const amountInput = document.getElementById('amount');
  const kategoriInput = document.getElementById('kategori-selected');
  const currentUser = localStorage.getItem('currentUser');
  
  // BARU: Ambil sumber pembayaran
  const sumberPembayaranEl = document.querySelector('input[name="sumber-pembayaran"]:checked');
  
  if (!dateInput || !timeInput || !barangInput || !amountInput || !kategoriInput || !currentUser || !sumberPembayaranEl) {
      console.error("Missing required expense form elements.");
      showNotification('Terjadi kesalahan pada form. Pastikan semua terisi.', 'danger');
      return;
  }

  const tanggal = dateInput.value;
  const jam = timeInput.value;
  const barang = barangInput.value.trim();
  let amount = parseFloat(amountInput.value.trim());
  const kategori = kategoriInput.value.trim();
  const sumberPembayaran = sumberPembayaranEl.value; // 'tunai' atau 'bank'

  // Validasi input
  if (barang && !isNaN(amount) && amount > 0 && kategori && tanggal && jam && sumberPembayaran) {
    
    // BARU: Validasi Saldo Cukup
    let saldo = getSaldo();
    if (sumberPembayaran === 'tunai' && amount > saldo.tunai) {
        showNotification("Gagal! Saldo Dompet (Tunai) Anda tidak mencukupi.", "danger");
        return;
    }
    if (sumberPembayaran === 'bank' && amount > saldo.bank) {
        showNotification("Gagal! Saldo Bank (Non-Tunai) Anda tidak mencukupi.", "danger");
        return;
    }

    const dateTimeString = `${tanggal}T${jam}:00`;
    const expenseDate = new Date(dateTimeString);

    if (isNaN(expenseDate.getTime())) {
         showNotification('Format tanggal atau jam tidak valid.', 'danger');
         return;
    }

    // Buat objek expense (BARU: tambahkan sumber)
    const expense = {
      id: Date.now(),
      barang,
      kategori,
      amount: amount,
      date: expenseDate.toISOString(),
      sumber: sumberPembayaran // Simpan sumber pembayarannya
    };

    // Simpan data pengeluaran
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();
    const expensesKey = `expenses_${currentUser}_${expenseYear}_${expenseMonth}`;
    let expenses = [];
    try {
        expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
        if (!Array.isArray(expenses)) expenses = [];
    } catch (error) {
        console.error("Error parsing expenses from localStorage:", error);
        expenses = [];
    }
    expenses.push(expense);
    try {
        localStorage.setItem(expensesKey, JSON.stringify(expenses));
    } catch (error) {
        console.error("Error saving expenses to localStorage:", error);
        showNotification('Gagal menyimpan pengeluaran.', 'danger');
        return;
    }

    // BARU: Kurangi Saldo
    if (sumberPembayaran === 'tunai') {
        saldo.tunai -= amount;
    } else {
        saldo.bank -= amount;
    }
    saveSaldo(saldo); // Simpan saldo baru

    // Reset form
    // showNotification('Pengeluaran berhasil ditambahkan!', 'success'); // Notifikasi dipindah ke bawah
    document.getElementById('expense-form').reset();
    document.getElementById('kategori-button').innerHTML = `Pilih Kategori <i class="fas fa-chevron-down float-end"></i>`;
    setDefaultDateTime();
    updateSaldoInfoDiForm(); // Update info sisa saldo di form

    // =================================================================
    // ===== PERBAIKAN: LOGIKA UNTUK NOTIFIKASI & RENDER ULANG LIST =====
    // =================================================================
    // Cek apakah data yang baru dimasukkan adalah untuk bulan & tahun ini
    if (expenseMonth === getCurrentMonth() && expenseYear === getCurrentYear()) {
        // Jika ya, tampilkan notifikasi standar DAN render ulang daftar di halaman ini
        showNotification('Pengeluaran berhasil ditambahkan!', 'success');
        renderExpensesList();
    } else {
        // Jika tidak (misal, input data bulan lalu), beri notifikasi khusus
        // Daftar TIDAK di-render ulang, karena daftar ini hanya untuk bulan ini
        const monthName = getMonthName(expenseMonth);
        showNotification(`Data disimpan di Riwayat (Bulan ${monthName} ${expenseYear}).`, 'success');
    }
    // =================================================================
    
    // Update data di halaman lain
    updateCategoryDropdownOptions();
    populateCategoryExpenseMonthOptions();
    
    // Perbarui UI Dashboard/Dompet jika sedang dilihat
    const activeSection = document.querySelector('.section.active')?.id;
    if (activeSection === 'dashboard-section') renderDashboard();
    if (activeSection === 'dompet-section') renderDompetPage();
    // Cek budget
    checkBudgetAlert();

  } else {
    // Pesan error
    let errorMessage = 'Silakan isi semua bidang dengan benar.';
    if (isNaN(amount) || amount <= 0) errorMessage = 'Jumlah pengeluaran harus berupa angka positif.';
    else if (!kategori) errorMessage = 'Kategori belum dipilih.';
    else if (!sumberPembayaran) errorMessage = 'Sumber pembayaran belum dipilih.';
    showNotification(errorMessage, 'warning');
  }
}
// ===== FUNGSI BARU: Handler untuk klik di dalam daftar pengeluaran =====
function handleExpenseListClick(e) {
    // Cek apakah yang diklik adalah ikon toggle tanggal
    const toggleIcon = e.target.closest('.toggle-category');
    if (toggleIcon) {
        const dateLi = toggleIcon.closest('li'); // Cari header tanggal (li) terdekat
        if (dateLi) {
            const subUl = dateLi.nextElementSibling; // Cari sub-list (ul) setelahnya
            if (subUl && subUl.tagName === 'UL') {
                subUl.classList.toggle('d-none'); // Tampilkan/sembunyikan
                dateLi.classList.toggle('expanded'); // Toggle class 'expanded' di header
                toggleIcon.classList.toggle('fa-chevron-down'); // Toggle ikon
                toggleIcon.classList.toggle('fa-chevron-up');
            } else {
                console.warn("Sub-list tidak ditemukan setelah header tanggal.");
            }
        }
    }
    // Cek apakah yang diklik adalah tombol hapus
    else {
        const deleteButton = e.target.closest('.expense-delete-btn');
        if (deleteButton) {
            handleDeleteExpenseById(e); // Panggil fungsi hapus yang sudah ada
        }
    }
}
// ===================================================================

// Fungsi untuk Merender Daftar Pengeluaran (di hal 'Tambah Pengeluaran')
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Merender Daftar Pengeluaran (Menambahkan Ikon Sumber Pembayaran)
 */
function renderExpensesList() {
  const currentUser = localStorage.getItem('currentUser');
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
  const expensesUl = document.getElementById('expenses-ul');
  if (!expensesUl) return;
  expensesUl.innerHTML = '';
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  const groupedByDate = expenses.reduce((acc, exp) => {
      const dateKey = new Date(exp.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(exp);
      return acc;
  }, {});
  for (const [dateKey, itemsOnDate] of Object.entries(groupedByDate)) {
      const dateLi = document.createElement('li');
      // Hapus style inline, biarkan CSS yang mengatur
      dateLi.innerHTML = `
          <span>${dateKey}</span>
          <i class="fas fa-chevron-down toggle-category"></i> 
      `;
      expensesUl.appendChild(dateLi);
      const subUl = document.createElement('ul');
      subUl.classList.add('ms-3', 'mt-2', 'mb-2', 'd-none');
      itemsOnDate.forEach(exp => {
          const itemLi = document.createElement('li');
          // Hapus className lama, biarkan CSS yang mengatur
          
          // BARU: Tambahkan ikon sumber pembayaran
          const sumberIkon = exp.sumber === 'tunai' 
              ? '<i class="fas fa-wallet fa-xs me-2 text-info"></i>' 
              : '<i class="fas fa-university fa-xs me-2 text-primary"></i>';
          
          itemLi.innerHTML = `
              <span>
                  ${sumberIkon}
                  ${capitalizeFirstLetter(exp.barang)}: Rp${exp.amount.toLocaleString('id-ID')}
              </span>
              <i class="fas fa-trash text-danger expense-delete-btn" data-id="${exp.id}" title="Hapus" style="cursor:pointer;"></i>
          `;
          subUl.appendChild(itemLi);
      });
      expensesUl.appendChild(subUl);
  }
}

// MODIFIKASI: Fungsi untuk Menangani Penghapusan berdasarkan ID (Poin D)
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Menangani Penghapusan (DIMODIFIKASI untuk Mengembalikan Saldo)
 */
function handleDeleteExpenseById(e) {
  const expenseId = e.target.getAttribute('data-id');
  if (!expenseId) return;

  // Konfirmasi sebelum hapus
  if (!confirm("Apakah Anda yakin ingin menghapus pengeluaran ini? Saldo Anda akan dikembalikan.")) {
      return;
  }

  const idToDelete = parseInt(expenseId);
  const currentUser = localStorage.getItem('currentUser');
  let expenseDeleted = false;
  let deletedItemInfo = "";
  let amountToRestore = 0;
  let sumberToRestore = null;

  // Cari di SEMUA kunci localStorage pengguna
  for (let key in localStorage) {
    if (key.startsWith(`expenses_${currentUser}_`)) {
      let expensesInMonth = JSON.parse(localStorage.getItem(key)) || [];
      const initialLength = expensesInMonth.length;
      
      expensesInMonth = expensesInMonth.filter(exp => {
          if (exp.id === idToDelete) {
              deletedItemInfo = `"${capitalizeFirstLetter(exp.barang)}"`;
              amountToRestore = exp.amount; // Simpan jumlah
              sumberToRestore = exp.sumber; // Simpan sumber
              return false;
          }
          return true;
      });

      if (expensesInMonth.length < initialLength) {
        if (expensesInMonth.length > 0) {
          localStorage.setItem(key, JSON.stringify(expensesInMonth));
        } else {
          localStorage.removeItem(key);
        }
        expenseDeleted = true;
        break;
      }
    }
  }

  if (expenseDeleted) {
    
    // BARU: Kembalikan Saldo
    if (amountToRestore > 0 && sumberToRestore) {
        let saldo = getSaldo();
        if (sumberToRestore === 'tunai') {
            saldo.tunai += amountToRestore;
        } else {
            saldo.bank += amountToRestore;
        }
        saveSaldo(saldo);
        showNotification(`Pengeluaran ${deletedItemInfo} dihapus. Saldo dikembalikan.`, 'success');
    } else {
        // Fallback jika item lama tidak punya 'sumber'
        showNotification(`Pengeluaran ${deletedItemInfo} telah dihapus.`, 'success');
    }
    
    // Render ulang list bulan ini
    const activeSection = document.querySelector('.section.active');
    if (activeSection && activeSection.id === 'add-expense-section') {
      renderExpensesList();
      updateSaldoInfoDiForm(); // Update info saldo di form
    }
    
    // Update data di halaman lain
    updateCategoryDropdownOptions();
    populateCategoryExpenseMonthOptions();
    initializeHistoryYearOptions();
    initializePrintYearOptions();

    // Jika riwayat terbuka, render ulang
    if (activeSection && activeSection.id === 'history-expense-section') {
      renderHistoryContent();
    }
    // Perbarui UI Dashboard/Dompet
    if (activeSection === 'dashboard-section') renderDashboard();
    if (activeSection === 'dompet-section') renderDompetPage();

  } else {
    showNotification('Gagal menghapus pengeluaran. Item tidak ditemukan.', 'danger');
  }
}

  if (expenseDeleted) {
    showNotification(`Pengeluaran ${deletedItemInfo} telah dihapus.`, 'success');
    
    // Render ulang list bulan ini jika kita ada di halaman 'Tambah'
    const activeSection = document.querySelector('.section.active');
    if (activeSection && activeSection.id === 'add-expense-section') {
      renderExpensesList();
    }
    
    // Update data dropdown & bulan (karena data mungkin berubah)
    updateCategoryDropdownOptions();
    populateCategoryExpenseMonthOptions();
    initializeHistoryYearOptions(); // Update opsi tahun/bulan riwayat
    initializePrintYearOptions(); // Update opsi tahun/bulan cetak

    // Jika riwayat terbuka, render ulang jika perlu
    if (activeSection && activeSection.id === 'history-expense-section') {
      renderHistoryContent(); // Render ulang konten riwayat
    }
  } else {
    showNotification('Gagal menghapus pengeluaran. Item tidak ditemukan.', 'danger');
  }


// MODIFIKASI BESAR: Fungsi untuk Merender Grafik Pengeluaran Harian (Poin C & Mod A)
function renderDailyExpenseChart() {
  const currentUser = localStorage.getItem('currentUser');
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

  // Mengelompokkan pengeluaran berdasarkan tanggal
  const grouped = expenses.reduce((acc, exp) => {
    // Gunakan tanggal dari data expense, bukan tanggal hari ini
    const date = new Date(exp.date);
    const formattedDate = date.toLocaleDateString('id-ID');
    acc[formattedDate] = (acc[formattedDate] || 0) + exp.amount;
    return acc;
  }, {});

  const allDates = getAllDatesInMonth(currentYear, currentMonth);
  const labels = allDates.map(date => date.toLocaleDateString('id-ID'));
  const data = allDates.map(date => {
    const formattedDate = date.toLocaleDateString('id-ID');
    return grouped[formattedDate] || 0;
  });

  const ctx = document.getElementById('daily-expense-chart')?.getContext('2d');
  if (!ctx) return; // Guard clause

  // Hitung statistik untuk garis rata-rata (Poin C)
  const totalPengeluaran = data.reduce((sum, val) => sum + val, 0);
  const daysWithExpenses = data.filter(val => val > 0).length;
  const average = daysWithExpenses > 0 ? (totalPengeluaran / daysWithExpenses) : 0;
  
  const averageData = new Array(labels.length).fill(average);
  
  // Gradient Fill (Poin C)
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(75, 0, 130, 0.4)');
  gradient.addColorStop(1, 'rgba(75, 0, 130, 0)');

  // Destroy chart sebelumnya jika ada
  if (dailyExpenseChart instanceof Chart) {
    dailyExpenseChart.destroy();
  }

  dailyExpenseChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pengeluaran Harian (Rp)',
          data: data,
          fill: true,
          backgroundColor: gradient, // Gradient (Poin C)
          borderColor: '#4b0082',
          tension: 0.4,
          pointBackgroundColor: '#4b0082', // Warna titik default (Poin C - Hapus Highlight)
          pointBorderColor: '#4b0082',   // Warna border titik default
          pointRadius: 3,                 // Radius titik default
          pointHoverRadius: 8,
        },
        {
          label: 'Rata-rata Pengeluaran',
          data: averageData,
          fill: false,
          borderColor: '#fd7e14', // Oranye
          borderDash: [5, 5], // Garis putus-putus
          pointRadius: 0, // Sembunyikan titik
          borderWidth: 2,
          // Visibilitas dikontrol oleh tombol toggle
          hidden: !(document.getElementById('toggle-average-line')?.getAttribute('data-toggled') === 'true')
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { // Animasi lebih halus (Poin C)
        duration: 800, 
        easing: 'easeInOutQuad'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333333',
            // Sembunyikan legenda garis rata-rata
            filter: (legendItem, chartData) => legendItem.datasetIndex === 0
          }
        },
        title: {
          display: true,
          text: 'Grafik Pengeluaran Harian',
          color: '#333333'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 1) {
                return `Rata-rata: Rp${Math.round(context.parsed.y).toLocaleString('id-ID')}`;
              }
              const value = context.parsed.y;
              return `Pengeluaran: Rp${value.toLocaleString('id-ID')}`;
            }
          }
        },
        // HAPUS plugin zoom bawaan (karena pakai tombol fullscreen)
        // zoom: { /* Konfigurasi zoom dihapus */ }
      },
      scales: {
        x: {
          ticks: { color: '#333333' },
          grid: { color: '#e0e0e0' },
          title: { display: true, text: 'Tanggal', color: '#333333' }
        },
        y: {
          ticks: { color: '#333333' },
          grid: { color: '#e0e0e0' },
          title: { display: true, text: 'Jumlah (Rp)', color: '#333333' }
        }
      },
      // MODIFIKASI: Hanya picu modal detail saat titik diklik (Poin C)
      onClick: (evt, activeElements) => {
        if (activeElements.length > 0) {
          // Pastikan kliknya di dataset utama (index 0)
          if (activeElements[0].datasetIndex === 0) { 
            const dataIndex = activeElements[0].index;
            const selectedDate = labels[dataIndex];
            showDailyDetailModal(selectedDate);
          }
        } 
        // Klik di latar tidak melakukan apa-apa lagi
      },
      // MODIFIKASI: Hanya ubah kursor saat di atas titik (Poin C)
      onHover: (event, chartElement) => {
        const canvas = event.native.target;
        // Kursor pointer hanya jika di atas titik data utama
        canvas.style.cursor = (chartElement[0] && chartElement[0].datasetIndex === 0) ? 'pointer' : 'default';
      }
    },
  });

  // Menampilkan Statistik Ringkas yang Baru (Poin C)
  displayDailyStats(grouped, expenses);
}


// BARU: Fungsi untuk Animasikan Grafik Harian (Poin C)
function animateDailyChart() {
    if (!dailyExpenseChart || isDailyChartAnimating) return; // Jangan animasikan jika sedang berjalan

    isDailyChartAnimating = true;
    const animateButton = document.getElementById('animate-daily-chart');
    if (animateButton) {
        animateButton.disabled = true;
        animateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganimasikan...';
    }
    
    // Reset data grafik
    const originalData = structuredClone(dailyExpenseChart.data.datasets[0].data);
    const dataLength = originalData.length;
    const emptyData = new Array(dataLength).fill(0);
    dailyExpenseChart.data.datasets[0].data = emptyData;
    dailyExpenseChart.update('none'); // Update tanpa animasi

    let currentStep = 0;
    const animationSpeed = 150; // ms per step (sesuaikan)

    function animationStep() {
        if (currentStep < dataLength) {
            // Tampilkan data sampai step saat ini
            const newData = originalData.slice(0, currentStep + 1).concat(new Array(dataLength - (currentStep + 1)).fill(null)); // null agar tidak digambar
            dailyExpenseChart.data.datasets[0].data = newData;
            dailyExpenseChart.update('none'); // Update cepat
            currentStep++;
            dailyChartAnimationTimeout = setTimeout(animationStep, animationSpeed);
        } else {
            // Animasi selesai
            isDailyChartAnimating = false;
            if (animateButton) {
                animateButton.disabled = false;
                animateButton.innerHTML = '<i class="fas fa-play-circle"></i> Animasikan Ulang';
            }
            // Pastikan data terakhir ditampilkan penuh
            dailyExpenseChart.data.datasets[0].data = originalData;
            dailyExpenseChart.update('none');
        }
    }

    // Hentikan animasi sebelumnya jika ada
    clearTimeout(dailyChartAnimationTimeout);
    // Mulai animasi
    animationStep();
}
// MODIFIKASI BESAR: Fungsi untuk Menampilkan Statistik Harian (Poin C)
// (Menggantikan displayDailySummary)
function displayDailyStats(groupedDaily, expenses) {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return; // Guard clause

  // 1. Ambil data bulan ini
  const totalBulanIni = Object.values(groupedDaily).reduce((sum, val) => sum + val, 0);
  const daysWithExpenses = Object.keys(groupedDaily).length;
  const avgBulanIni = daysWithExpenses > 0 ? (totalBulanIni / daysWithExpenses) : 0;

  // 2. Ambil data bulan lalu untuk perbandingan
  const [prevYear, prevMonth] = getPreviousMonth();
  const prevExpensesKey = `expenses_${currentUser}_${prevYear}_${prevMonth}`;
  const prevExpenses = JSON.parse(localStorage.getItem(prevExpensesKey)) || [];

  let totalBulanLalu = 0;
  let avgBulanLalu = 0;
  if (prevExpenses.length > 0) {
    totalBulanLalu = prevExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const prevGrouped = prevExpenses.reduce((acc, exp) => {
      // Pastikan tanggal valid sebelum memproses
      const dateObj = new Date(exp.date);
      if (isNaN(dateObj.getTime())) return acc; 
      const date = dateObj.toLocaleDateString('id-ID');
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {});
    const prevDaysWithExpenses = Object.keys(prevGrouped).length;
    avgBulanLalu = prevDaysWithExpenses > 0 ? (totalBulanLalu / prevDaysWithExpenses) : 0;
  }

  // 3. Hitung Perbandingan
  const [totalComparisonHtml, totalComparisonClass] = getComparisonHtml(totalBulanIni, totalBulanLalu);
  const [avgComparisonHtml, avgComparisonClass] = getComparisonHtml(avgBulanIni, avgBulanLalu);

  // 4. Hitung Hari Terboros & Terhemat
  let hariTerboros = { date: '-', amount: -1 }; // Mulai dari -1 agar 0 bisa jadi terendah
  let hariTerhemat = { date: '-', amount: Infinity };

  if (daysWithExpenses > 0) {
    for (const [date, amount] of Object.entries(groupedDaily)) {
      if (amount > hariTerboros.amount) {
        hariTerboros = { date, amount };
      }
      // Hanya update terhemat jika amount > 0 dan lebih kecil dari minimum saat ini
      if (amount > 0 && amount < hariTerhemat.amount) {
        hariTerhemat = { date, amount };
      }
    }
    // Jika tidak ada hari > 0, hari terhemat tetap '-'
     if (hariTerhemat.amount === Infinity) hariTerhemat = { date: '-', amount: Infinity };
  }


  // 5. Hitung Transaksi Tertinggi & Terendah
  let transTertinggi = { barang: '-', kategori: '-', amount: 0 };
  let transTerendah = { barang: '-', kategori: '-', amount: Infinity };

  if (expenses.length > 0) {
    expenses.forEach(exp => {
      if (exp.amount > transTertinggi.amount) {
        transTertinggi = exp;
      }
      // Hanya update terendah jika amount > 0 dan lebih kecil dari minimum saat ini
      if (exp.amount > 0 && exp.amount < transTerendah.amount) {
        transTerendah = exp;
      }
    });
     // Jika tidak ada transaksi > 0, terendah tetap '-'
     if (transTerendah.amount === Infinity) transTerendah = { barang: '-', kategori: '-', amount: Infinity };
  }

  // 6. Update UI
  // Total
  const totalBadge = document.getElementById('total-pengeluaran');
  if (totalBadge) {
      totalBadge.innerHTML = `Rp${totalBulanIni.toLocaleString('id-ID')}`;
      // Hapus perbandingan lama jika ada
      const oldTotalComp = totalBadge.closest('li')?.querySelector('.stat-comparison');
      if(oldTotalComp) oldTotalComp.remove();
      if (totalBulanLalu > 0) {
        totalBadge.insertAdjacentHTML('afterend', `<span class="stat-comparison ${totalComparisonClass}">${totalComparisonHtml}</span>`);
      }
  }


  // Rata-rata
  const avgBadge = document.getElementById('rata-rata-harian');
  if(avgBadge) {
      avgBadge.innerHTML = `Rp${Math.round(avgBulanIni).toLocaleString('id-ID')}`;
      const oldAvgComp = avgBadge.closest('li')?.querySelector('.stat-comparison');
      if(oldAvgComp) oldAvgComp.remove();
      if (avgBulanLalu > 0) {
        avgBadge.insertAdjacentHTML('afterend', `<span class="stat-comparison ${avgComparisonClass}">${avgComparisonHtml}</span>`);
      }
  }

  // Hari Terboros
  const borosBadge = document.getElementById('hari-terboros');
  if (borosBadge) {
    if (hariTerboros.amount > 0) {
      borosBadge.innerHTML = `${hariTerboros.date} <small>(Rp${hariTerboros.amount.toLocaleString('id-ID')})</small>`;
    } else {
      borosBadge.textContent = '-';
    }
  }

  // Hari Terhemat
  const hematBadge = document.getElementById('hari-terhemat');
   if (hematBadge) {
    if (hariTerhemat.amount !== Infinity) {
      hematBadge.innerHTML = `${hariTerhemat.date} <small>(Rp${hariTerhemat.amount.toLocaleString('id-ID')})</small>`;
    } else {
      hematBadge.textContent = '-';
    }
  }

  // Transaksi Tertinggi
  const tinggiBadge = document.getElementById('pengeluaran-tertinggi');
  if (tinggiBadge) {
    if (transTertinggi.amount > 0) {
      tinggiBadge.innerHTML = `${capitalizeFirstLetter(transTertinggi.barang)} <small>(Rp${transTertinggi.amount.toLocaleString('id-ID')})</small>`;
    } else {
      tinggiBadge.textContent = '-';
    }
  }

  // Transaksi Terendah
  const rendahBadge = document.getElementById('pengeluaran-terendah');
  if (rendahBadge) {
    if (transTerendah.amount !== Infinity && transTerendah.amount > 0) {
      rendahBadge.innerHTML = `${capitalizeFirstLetter(transTerendah.barang)} <small>(Rp${transTerendah.amount.toLocaleString('id-ID')})</small>`;
    } else {
      rendahBadge.textContent = '-';
    }
  }
}

// BARU: Helper untuk perbandingan (Poin C)
function getComparisonHtml(current, previous) {
  if (previous === 0) {
    return ['', ''];
  }

  const diff = current - previous;
  // Handle case where previous is positive and current is zero or negative (infinite percentage)
  if (previous > 0 && current <= 0) {
      return [`<i class="fas fa-arrow-down"></i> Turun 100%+ vs bln lalu`, 'stat-up'];
  }
  // Handle case where previous is zero or negative and current is positive (infinite percentage)
   if (previous <= 0 && current > 0) {
       return [`<i class="fas fa-arrow-up"></i> Naik vs bln lalu`, 'stat-down'];
   }
  // Handle case where both are zero or negative
  if (previous <= 0 && current <= 0) {
       return ['<i class="fas fa-equals"></i> Sama vs bln lalu', 'stat-same'];
  }

  // Normal calculation
  const percentage = Math.abs((diff / previous) * 100);

  if (diff > 0) {
    // Pengeluaran naik = panah merah (negatif)
    return [`<i class="fas fa-arrow-up"></i> Naik ${percentage.toFixed(0)}% vs bln lalu`, 'stat-down'];
  } else if (diff < 0) {
    // Pengeluaran turun = panah hijau (positif)
    return [`<i class="fas fa-arrow-down"></i> Turun ${Math.abs(percentage).toFixed(0)}% vs bln lalu`, 'stat-up'];
  } else {
    return ['<i class="fas fa-equals"></i> Sama vs bln lalu', 'stat-same'];
  }
}

// BARU: Helper untuk dapat bulan lalu (Poin C)
function getPreviousMonth() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-11

  if (currentMonthIndex === 0) { // Jika Januari (0)
    return [currentYear - 1, 12]; // Tahun lalu, Desember (12)
  } else {
    // currentMonthIndex sudah merupakan index bulan lalu (karena index 0 = Januari)
    return [currentYear, currentMonthIndex]; // Tahun ini, bulan lalu (index + 1 - 1 = index)
  }
}

function showInfoModal(title, message) {
    const modalEl = document.getElementById('infoModal');
    if (!modalEl) return;

    const modalTitleEl = document.getElementById('infoModalLabel');
    const modalBodyEl = document.getElementById('infoModalBody');

    if (modalTitleEl) modalTitleEl.textContent = title;
    if (modalBodyEl) modalBodyEl.innerHTML = message; // Gunakan innerHTML agar bisa pakai <br>

    if (!infoModalInstance) {
        infoModalInstance = new bootstrap.Modal(modalEl);
    }
    infoModalInstance.show();
}

// Fungsi untuk Merender Grafik Pengeluaran per Kategori (Pie Chart Utama)
function renderCategoryExpenseChart() {
  const currentUser = localStorage.getItem('currentUser');
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

  // Pastikan expenses adalah array
  if (!Array.isArray(expenses)) {
    console.error('Data pengeluaran per kategori tidak valid.');
    return;
  }

  // Mengelompokkan pengeluaran berdasarkan kategori
  const grouped = expenses.reduce((acc, exp) => {
    acc[exp.kategori] = acc[exp.kategori] || 0;
    acc[exp.kategori] += exp.amount;
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const data = labels.map(label => grouped[label]);

  const ctx = document.getElementById('category-expense-chart')?.getContext('2d');
   if (!ctx) return; // Guard clause

  // Destroy chart sebelumnya jika ada
  if (categoryExpenseChart instanceof Chart) {
    categoryExpenseChart.destroy();
  }

  categoryExpenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pengeluaran per Kategori (Rp)',
        data: data,
        backgroundColor: generateBrightColorPalette(labels.length),
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#333333' },
          position: 'right',
        },
        title: {
          display: true,
          text: 'Pengeluaran per Kategori',
          color: '#333333'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = data.reduce((sum, val) => sum + val, 0);
              const value = context.parsed;
              const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
              // Capitalize label
              const label = context.label ? capitalizeFirstLetter(context.label) : '';
              return `${label}: Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
            }
          }
        }
      },
      // MODIFIKASI: Hanya picu modal detail saat slice diklik (Mod A dihapus)
      onClick: (evt, activeElements) => {
        if (activeElements.length > 0) {
          // Pengguna mengklik SEGMEN/SLICE
          const index = activeElements[0].index;
          const selectedKategori = labels[index];
          showCategoryDetails(selectedKategori); // Tampilkan modal doughnut
        }
        // Klik di latar tidak melakukan apa-apa lagi
      },
      // MODIFIKASI: Ubah kursor hanya saat di atas slice (Mod A dihapus)
      onHover: (event, chartElement) => {
        const canvas = event.native.target;
        canvas.style.cursor = chartElement[0] ? 'pointer' : 'default';
      }
    },
  });
}

// Fungsi untuk Menampilkan Detail Kategori (saat slice pie diklik)
function showCategoryDetails(kategori) {
  const currentUser = localStorage.getItem('currentUser');
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

  // Filter expenses by kategori
  const filteredExpenses = expenses.filter(exp => exp.kategori.toLowerCase() === kategori.toLowerCase());

  // Hapus modal lama jika ada
  const oldModal = document.getElementById('categoryDetailModal');
  if (oldModal) {
    // Pastikan modal ditutup sebelum dihapus jika masih terbuka
     const modalInstance = bootstrap.Modal.getInstance(oldModal);
     if (modalInstance) {
         modalInstance.hide();
     }
    oldModal.remove();
  }


  // Create a modal to display details
  const modal = document.createElement('div');
  modal.classList.add('modal', 'fade');
  modal.setAttribute('tabindex', '-1');
  modal.id = 'categoryDetailModal'; // Beri ID agar bisa dihapus
  modal.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Komposisi Barang - ${capitalizeFirstLetter(kategori)}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
           <div class="chart-container" style="height: 400px; width: 100%; margin-top: 0; padding: 10px; position: relative;">
             <button class="fullscreen-button category-detail-fullscreen-btn">
                <i class="fas fa-expand"></i>
             </button>
             <canvas id="category-detail-chart"></canvas>
           </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Initialize Chart in Modal
  const ctx = modal.querySelector('#category-detail-chart')?.getContext('2d');
  if (!ctx) return; // Guard clause

  // Mengelompokkan barang dalam kategori
  const groupedBarang = filteredExpenses.reduce((acc, exp) => {
    acc[exp.barang] = acc[exp.barang] || 0;
    acc[exp.barang] += exp.amount;
    return acc;
  }, {});

  const labels = Object.keys(groupedBarang);
  const data = labels.map(label => groupedBarang[label]);

  // Simpan chart ke variabel
  const detailChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pengeluaran Barang (Rp)',
        data: data,
        backgroundColor: generateBrightColorPalette(labels.length),
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#333333' },
          position: 'right',
        },
        title: {
          display: true,
          text: `Komposisi Barang: ${capitalizeFirstLetter(kategori)}`,
          color: '#333333'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = data.reduce((sum, val) => sum + val, 0);
              const value = context.parsed;
              const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
               // Capitalize label
              const label = context.label ? capitalizeFirstLetter(context.label) : '';
              return `${label}: Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
            }
          }
        }
      },
      // Klik tidak melakukan apa-apa di sini (zoom via tombol)
      onClick: null,
      onHover: null
    },
  });

   // Tambahkan event listener untuk tombol fullscreen di modal detail
   modal.querySelector('.category-detail-fullscreen-btn')?.addEventListener('click', () => {
       handleFullscreenClick(detailChart);
   });


  // Show the modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Remove modal dari DOM setelah ditutup
  modal.addEventListener('hidden.bs.modal', () => {
    if (detailChart) detailChart.destroy(); // Hancurkan chart
    modal.remove();
  });
}

// Fungsi untuk Merender Riwayat Pengeluaran
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Fungsi untuk Merender Riwayat Pengeluaran
 * (Menggunakan format list-group seperti Pengeluaran Harian)
 */
function renderHistoryContent() {
  const selectedMonth = document.getElementById('history-month')?.value;
  const selectedYear = document.getElementById('history-year')?.value;
  const historyContent = document.getElementById('history-content');
  if (!historyContent) return; // Guard clause
  historyContent.innerHTML = ''; // Selalu bersihkan konten

  // 1. Cek jika user belum memilih
  if (!selectedMonth || !selectedYear) {
    historyContent.innerHTML = '<p class="text-muted text-center">Silakan pilih tahun dan bulan untuk melihat riwayat pengeluaran.</p>';
    return;
  }

  // 2. Ambil data dari localStorage
  const currentUser = localStorage.getItem('currentUser');
  const expensesKey = `expenses_${currentUser}_${selectedYear}_${selectedMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

  // 3. Cek jika data untuk bulan itu kosong
  if (expenses.length === 0) {
    historyContent.innerHTML = '<p class="text-muted text-center">Tidak ada data pengeluaran untuk bulan ini.</p>';
    return;
  }

  // 4. Kalkulasi Statistik
  // Group by category untuk total
  const groupedByCategory = expenses.reduce((acc, exp) => {
    acc[exp.kategori] = acc[exp.kategori] || 0;
    acc[exp.kategori] += exp.amount;
    return acc;
  }, {});
  const total = Object.values(groupedByCategory).reduce((sum, val) => sum + val, 0);
  
  // Hitung hari unik yang ada pengeluaran
  const daysWithExpenses = new Set(expenses.map(exp => {
      const dateObj = new Date(exp.date);
      // Hanya hitung tanggal valid
      return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID') : null;
  })).size;
  
  // Hitung rata-rata harian (berdasarkan hari yang ada pengeluaran)
  const average = daysWithExpenses > 0 ? (total / daysWithExpenses) : 0;

  // Cari transaksi (1x) tertinggi dan terendah
  let maxExpense = { amount: 0, kategori: '-', barang: '-', date: '' };
  let minExpense = { amount: Infinity, kategori: '-', barang: '-', date: '' };
  expenses.forEach(exp => {
    if (exp.amount > maxExpense.amount) {
      maxExpense = { ...exp, date: new Date(exp.date).toLocaleDateString('id-ID') };
    }
     // Hanya update terendah jika > 0
    if (exp.amount > 0 && exp.amount < minExpense.amount) {
      minExpense = { ...exp, date: new Date(exp.date).toLocaleDateString('id-ID') };
    }
  });
   // Handle jika tidak ada pengeluaran > 0
   if (minExpense.amount === Infinity) minExpense = { amount: Infinity, kategori: '-', barang: '-', date: '-' };


  // 5. Buat HTML untuk Statistik (Format BARU)
  const statsHtml = `
    <div class="statistic-container mb-3">
        <h5 class="mb-3 text-primary text-center">Ringkasan Bulan ${capitalizeFirstLetter(getMonthName(selectedMonth))} ${selectedYear}</h5>
        <ul class="list-group">
            <li class="list-group-item">
                <div><i class="fas fa-wallet me-2 text-primary"></i>Total Pengeluaran</div>
                <div><span class="badge bg-primary rounded-pill">Rp${total.toLocaleString('id-ID')}</span></div>
            </li>
            <li class="list-group-item">
                <div><i class="fas fa-calculator me-2 text-secondary"></i>Rata-rata Harian</div>
                <div><span class="badge bg-secondary rounded-pill">Rp${Math.round(average).toLocaleString('id-ID')}</span></div>
            </li>
            <li class="list-group-item">
                <div><i class="fas fa-arrow-trend-up me-2 text-danger"></i>Pengeluaran Tertinggi (1x)</div>
                <div><span class="badge bg-danger rounded-pill">${capitalizeFirstLetter(maxExpense.barang)} <small>(${maxExpense.date})</small></span></div>
            </li>
            <li class="list-group-item">
                <div><i class="fas fa-arrow-trend-down me-2 text-success"></i>Pengeluaran Terendah (1x)</div>
                <div><span class="badge bg-success rounded-pill">${capitalizeFirstLetter(minExpense.barang)} <small>(Rp${minExpense.amount !== Infinity ? minExpense.amount.toLocaleString('id-ID') : '0'})</small></span></div>
            </li>
        </ul>
    </div>
  `;
  historyContent.innerHTML += statsHtml;

  // 6. Render Chart Pengeluaran Harian (Line Chart)
  const dailyExpenses = expenses.reduce((acc, exp) => {
    const dateObj = new Date(exp.date);
     if (isNaN(dateObj.getTime())) return acc; 
    const date = dateObj.toLocaleDateString('id-ID');
    acc[date] = (acc[date] || 0) + exp.amount;
    return acc;
  }, {});

  const allDates = getAllDatesInMonth(selectedYear, selectedMonth);
  const labelsDaily = allDates.map(date => date.toLocaleDateString('id-ID'));
  const dataDaily = allDates.map(date => {
    const formattedDate = date.toLocaleDateString('id-ID');
    return dailyExpenses[formattedDate] || 0;
  });

  // Buat kontainer dan canvas untuk line chart
  const historyDailyContainer = document.createElement('div');
  historyDailyContainer.className = 'chart-container';
  historyDailyContainer.style.height = '300px';
  historyDailyContainer.innerHTML = `
      <button class="fullscreen-button" data-chart-target="history-daily-chart">
          <i class="fas fa-expand"></i>
      </button>
      <canvas id="history-daily-chart"></canvas>
  `;
  historyContent.appendChild(historyDailyContainer);
  const historyDailyCtx = historyDailyContainer.querySelector('#history-daily-chart')?.getContext('2d');

  // Hancurkan chart lama jika ada
  if (historyDailyExpenseChart instanceof Chart) {
    historyDailyExpenseChart.destroy();
  }

  // Buat chart baru
  if (historyDailyCtx) {
    historyDailyExpenseChart = new Chart(historyDailyCtx, {
      type: 'line',
      data: {
        labels: labelsDaily,
        datasets: [{
          label: 'Pengeluaran Harian (Rp)',
          data: dataDaily,
          fill: true,
          backgroundColor: 'rgba(75, 0, 130, 0.2)',
          borderColor: '#4b0082',
          tension: 0.4,
          pointBackgroundColor: '#4b0082',
          pointBorderColor: '#4b0082'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#333333' } },
          title: { display: true, text: `Grafik Harian (${getMonthName(selectedMonth)} ${selectedYear})`, color: '#333333' },
          tooltip: {
            callbacks: { label: (c) => `Rp${c.parsed.y.toLocaleString('id-ID')}` }
          }
        },
        scales: {
          x: { ticks: { color: '#333333' }, grid: { color: '#e0e0e0' } },
          y: { ticks: { color: '#333333' }, grid: { color: '#e0e0e0' }, title: { display: true, text: 'Jumlah (Rp)' } }
        },
        onClick: null,
        onHover: null
      },
    });
  }


  // 7. Render Chart Pengeluaran per Kategori (Pie Chart)
  const categoryLabels = Object.keys(groupedByCategory);
  const categoryData = categoryLabels.map(label => groupedByCategory[label]);

  // Buat kontainer dan canvas untuk pie chart
  const historyCategoryContainer = document.createElement('div');
  historyCategoryContainer.className = 'chart-container';
  historyCategoryContainer.style.height = '300px';
  historyCategoryContainer.innerHTML = `
      <button class="fullscreen-button" data-chart-target="history-category-chart">
          <i class="fas fa-expand"></i>
      </button>
      <canvas id="history-category-chart"></canvas>
  `;
  historyContent.appendChild(historyCategoryContainer);
  const historyCategoryCtx = historyCategoryContainer.querySelector('#history-category-chart')?.getContext('2d');

  // Hancurkan chart lama jika ada
  if (historyCategoryExpenseChart instanceof Chart) {
    historyCategoryExpenseChart.destroy();
  }

  // Buat chart baru
  if (historyCategoryCtx) {
    historyCategoryExpenseChart = new Chart(historyCategoryCtx, {
      type: 'pie',
      data: {
        labels: categoryLabels,
        datasets: [{
          label: 'Pengeluaran per Kategori (Rp)',
          data: categoryData,
          backgroundColor: generateBrightColorPalette(categoryLabels.length),
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#333333' }, position: 'right' },
          title: { display: true, text: `Kategori (${getMonthName(selectedMonth)} ${selectedYear})`, color: '#333333' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = categoryData.reduce((sum, val) => sum + val, 0);
                const value = context.parsed;
                const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                const label = context.label ? capitalizeFirstLetter(context.label) : '';
                return `${label}: Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
              }
            }
          }
        },
        onClick: null,
        onHover: null
      },
    });
  }
}


// Fungsi untuk Menangani Cetak Pengeluaran PDF
function handlePrintExpense(e) {
  e.preventDefault();
  const printYear = document.getElementById('print-year')?.value;
  const printMonth = document.getElementById('print-month')?.value;
  const tujuanPengeluaran = document.getElementById('tujuan-pengeluaran')?.value.trim();
  const targetInput = document.getElementById('print-monthly-target')?.value.trim();
  const currentUser = localStorage.getItem('currentUser');
  if (!printYear || !printMonth || !tujuanPengeluaran || !targetInput || !currentUser) {
       showNotification('Silakan isi semua bidang dengan benar.', 'danger');
       return;
  }


  const targetNumber = parseFloat(targetInput);
  if (isNaN(targetNumber)) {
    showNotification('Silakan isi saldo awal dengan benar.', 'danger');
    return;
  }

  const expensesKey = `expenses_${currentUser}_${printYear}_${printMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

  if (expenses.length === 0) {
    showNotification('Tidak ada data pengeluaran untuk periode ini.', 'danger');
    return;
  }

  // Tampilkan Animasi Cetak
  showPrintAnimation();

  // Tunggu selama 4 detik sebelum mencetak
  setTimeout(() => {
    generateRekapDataPDF(printYear, printMonth, currentUser, expenses, targetNumber, tujuanPengeluaran);
    hidePrintAnimation();
  }, 4000);
};

// Fungsi untuk Menampilkan Animasi Cetak
function showPrintAnimation() {
  const printAnimation = document.getElementById('print-animation');
  if (printAnimation) printAnimation.style.display = 'flex';
}

// Fungsi untuk Menyembunyikan Animasi Cetak
function hidePrintAnimation() {
  const printAnimation = document.getElementById('print-animation');
   if (printAnimation) printAnimation.style.display = 'none';
}

// Fungsi untuk Merender Dashboard Awal
function renderDashboard() {
  // Hanya panggil fungsi render jika elemennya ada
  if (document.getElementById('expenses-ul')) renderExpensesList();
  if (document.getElementById('daily-expense-chart')) renderDailyExpenseChart();
  if (document.getElementById('category-expense-chart')) renderCategoryExpenseChart();
  
  initializeCategoryExpenseEnhanced();
  checkBudgetAlert(); // Panggil ini untuk inisialisasi dropdown kategori enhanced
}

// ===== SEMUA FUNGSI BARU DI BAWAH INI =====

// ==========================================================
// ===== FUNGSI-FUNGSI BARU UNTUK FITUR ANALISIS LANJUTAN =====
// ==========================================================

/**
 * Mereset tampilan visualisasi analisis (grafik, loading, no-data)
 */
/**
 * Mereset tampilan visualisasi analisis (grafik, loading, no-data)
 * GANTI FUNGSI INI.
 */
/**
 * ==========================================================
 * FUNGSI BARU: (Tambahkan Blok Ini)
 * ==========================================================
 * FUNGSI-FUNGSI HANDLER BARU UNTUK SALDO & BUDGET
 */

/**
 * (Helper BARU) Merender data di halaman Dom
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * (Helper BARU) Merender data di halaman Dompet
 */
function renderDompetPage() {
    // 1. Update Tampilan Kartu Saldo
    updateSaldoDisplay(); // Panggil helper update saldo

    // 2. Update Tampilan Widget Budget
    updateBudgetDisplay(); // Panggil helper update budget
    
    // 3. Cek Peringatan Budget
    checkBudgetAlert();
}
/**
 * Menangani penyimpanan Budget baru dari modal
 */
/**
 * ==========================================================
 * FUNGSI BARU: (Tambahkan Blok Ini)
 * ==========================================================
 * FUNGSI-FUNGSI BARU UNTUK MERESET SALDO
 */

/**
 * Menangani Reset Saldo Tunai
 */
function handleResetTunai() {
    // Panggil modal konfirmasi kustom
    showCustomConfirm(
        "Konfirmasi Reset Saldo", // Judul
        "Anda yakin ingin mereset saldo <strong>Dompet (Tunai)</strong> menjadi Rp0?", // Pesan
        () => { // Fungsi yg dijalankan jika "Ya"
            let saldo = getSaldo();
            saldo.tunai = 0;
            saveSaldo(saldo);
            renderDompetPage(); // Render ulang halaman dompet
            showNotification("Saldo Dompet (Tunai) berhasil direset.", "success");
        }
    );
}

/**
 * Menangani Reset Saldo Bank
 */
function handleResetBank() {
    // Panggil modal konfirmasi kustom
    showCustomConfirm(
        "Konfirmasi Reset Saldo", // Judul
        "Anda yakin ingin mereset saldo <strong>Bank (Non-Tunai)</strong> menjadi Rp0?", // Pesan
        () => { // Fungsi yg dijalankan jika "Ya"
            let saldo = getSaldo();
            saldo.bank = 0;
            saveSaldo(saldo);
            renderDompetPage(); // Render ulang halaman dompet
            showNotification("Saldo Bank (Non-Tunai) berhasil direset.", "success");
        }
    );
}



/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Menangani penyimpanan Budget baru dari modal
 * (DIMODIFIKASI: Menambahkan validasi terhadap Total Saldo)
 */
function handleSaveBudget(e) {
    e.preventDefault();
    const budgetInput = document.getElementById('budget-jumlah');
    if (!budgetInput) return;

    const budgetAmount = parseFloat(budgetInput.value);
    if (isNaN(budgetAmount) || budgetAmount < 0) {
        showNotification("Masukkan jumlah budget yang valid.", "warning");
        return;
    }

    // ==========================================================
    // ===== PERBAIKAN: VALIDASI BUDGET VS TOTAL SALDO =====
    // ==========================================================
    const saldo = getSaldo(); // Ambil saldo (tunai & bank)
    const totalSaldo = saldo.tunai + saldo.bank;

    if (budgetAmount > totalSaldo) {
        showNotification(`Budget (Rp${budgetAmount.toLocaleString('id-ID')}) tidak boleh melebihi Total Saldo Anda (Rp${totalSaldo.toLocaleString('id-ID')}).`, "danger");
        return; // Hentikan penyimpanan jika budget terlalu besar
    }
    // ==========================================================


    saveBudget(budgetAmount); // Simpan budget jika lolos validasi
    showNotification("Budget bulanan berhasil disimpan!", "success");
    budgetModal.hide(); // Sembunyikan modal
    
    // Perbarui UI di halaman dompet
    renderDompetPage();
}

/**
 * ==========================================================
 * FUNGSI BARU: (Tambahkan Blok Ini)
 * ==========================================================
 * FUNGSI-FUNGSI BARU UNTUK FITUR TAMBAHAN
 */

/**
 * BARU (Poin 3): Menampilkan modal konfirmasi kustom
 * @param {string} title - Judul modal
 * @param {string} message - Isi pesan (bisa HTML)
 * @param {function} onConfirm - Fungsi yg dijalankan jika "Ya"
 */
function showCustomConfirm(title, message, onConfirm) {
    const titleEl = document.getElementById('custom-confirm-title');
    const bodyEl = document.getElementById('custom-confirm-body');
    const headerEl = document.getElementById('custom-confirm-header');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = message; // innerHTML agar bisa pakai <strong>

    // Ubah warna header jadi 'danger' (merah)
    if(headerEl) {
        headerEl.classList.add('bg-danger', 'text-white');
    }

    onConfirmCallback = onConfirm; // Simpan aksi
    if (customConfirmModal) customConfirmModal.show();
}

/**
 * BARU (Poin 2): Menangani Reset Budget
 */
function handleResetBudget() {
    showCustomConfirm(
        "Konfirmasi Reset Budget",
        "Anda yakin ingin mereset <strong>Budget Bulan Ini</strong>? Anda harus mengaturnya lagi.",
        () => { // Ini adalah onConfirm callback
            const currentUser = localStorage.getItem('currentUser');
            const currentMonthKey = `${getCurrentYear()}-${getCurrentMonth()}`;
            if (!currentUser) return;
            const key = `budget_${currentUser}_${currentMonthKey}`;
            
            localStorage.removeItem(key); // Hapus budget dari localStorage
            
            renderDompetPage(); // Render ulang
            showNotification("Budget bulan ini telah direset.", "success");
        }
    );
}

/**
 * BARU (Poin 1): Menampilkan animasi Pemasukan
 * @param {string} tipeTujuan - 'tunai' atau 'bank'
 */
function showPemasukanAnimation(tipeTujuan) {
    const overlay = document.getElementById('pemasukan-animation');
    const textElement = document.getElementById('pemasukan-anim-text');
    
    if (overlay) {
        // Hapus kelas animasi lama & set teks
        overlay.classList.remove('anim-tunai', 'anim-bank');
        
        if (tipeTujuan === 'tunai') {
            if(textElement) textElement.textContent = "Menyimpan ke Dompet...";
            overlay.classList.add('anim-tunai'); // Trigger animasi ke dompet
        } else {
            if(textElement) textElement.textContent = "Menyimpan ke Bank...";
            overlay.classList.add('anim-bank'); // Trigger animasi ke bank
        }
        
        overlay.style.display = 'flex';
        
        // Sembunyikan setelah animasi selesai
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('anim-tunai', 'anim-bank');
        }, 2500); // Durasi animasi
    }
}

/**
 * BARU (Poin 4): Helper untuk mengambil detail pengeluaran bulan ini
 */
function getMonthlyExpenseDetails() {
    const currentUser = localStorage.getItem('currentUser');
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
    let expenses = [];
    try {
        expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
    } catch (e) { expenses = []; }
    
    const pengeluaranTunai = expenses
        .filter(exp => exp.sumber === 'tunai')
        .reduce((sum, exp) => sum + exp.amount, 0);
    const pengeluaranBank = expenses
        .filter(exp => exp.sumber === 'bank')
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    return { expenses, pengeluaranTunai, pengeluaranBank };
}


/**
 * BARU (Poin 4): Mengupdate Bar Pengeluaran vs Saldo
 */
function updateExpenditureVsSaldoBar() {
    const selectBtn = document.getElementById('expenditure-saldo-select');
    const compareType = selectBtn ? selectBtn.getAttribute('data-current-value') || 'tunai' : 'tunai';

    const bar = document.getElementById('exp-saldo-progress-bar');
    const percentText = document.getElementById('exp-saldo-percentage');
    const infoText = document.getElementById('exp-saldo-info-text');

    if (!bar || !percentText || !infoText) return; // Guard clause

    const { pengeluaranTunai, pengeluaranBank } = getMonthlyExpenseDetails();
    const totalPengeluaran = pengeluaranTunai + pengeluaranBank;
    const saldo = getSaldo();

    const totalAvailableTunai = saldo.tunai + pengeluaranTunai;
    const totalAvailableBank = saldo.bank + pengeluaranBank;
    const totalAvailableGabungan = totalAvailableTunai + totalAvailableBank;

    let totalAvailable = 0;
    let label = "Tunai";

    if (compareType === 'tunai') {
        totalAvailable = totalAvailableTunai;
        label = "Total Tunai";
    } else if (compareType === 'bank') {
        totalAvailable = totalAvailableBank;
        label = "Total Bank";
    } else { // 'total'
        totalAvailable = totalAvailableGabungan;
        label = "Total Saldo";
    }

    const percentage = (totalAvailable > 0) ? (totalPengeluaran / totalAvailable) * 100 : 0;
    
    // Update UI Bar
    bar.style.width = `${Math.min(100, percentage)}%`;
    percentText.textContent = `${percentage.toFixed(0)}%`;
    infoText.textContent = `Total Keluar Rp${totalPengeluaran.toLocaleString('id-ID')} / ${label} Rp${totalAvailable.toLocaleString('id-ID')}`;
    
    // ==========================================================
    // ===== PERBAIKAN: LOGIKA WARNA BARU (DEFAULT UNGU) =====
    // ==========================================================
    bar.classList.remove('bg-danger', 'bg-warning'); // Reset
    
    // Default adalah ungu (dari CSS), hanya tambahkan kelas jika warning/danger
    if (percentage >= 90) {
        bar.classList.add('bg-danger');
    } else if (percentage >= 70) {
        bar.classList.add('bg-warning');
    }
    // Jika di bawah 70%, tidak ada kelas yg ditambahkan,
    // sehingga warna default #4b0082 dari CSS akan dipakai.
    // ==========================================================
}

/**
 * Menangani penambahan Pemasukan dari modal
 */
function handleTambahPemasukan(e) {
    e.preventDefault();
    const jumlahInput = document.getElementById('pemasukan-jumlah');
    const keteranganInput = document.getElementById('pemasukan-keterangan');
    const tujuan = document.querySelector('input[name="pemasukan-tujuan"]:checked');
    
    if (!jumlahInput || !tujuan) return;

    const jumlah = parseFloat(jumlahInput.value);
    if (isNaN(jumlah) || jumlah <= 0) {
        showNotification("Masukkan jumlah pemasukan yang valid.", "warning");
        return;
    }

    const keterangan = keteranganInput.value || "Pemasukan";
    const tipeTujuan = tujuan.value; // 'tunai' atau 'bank'

    let saldo = getSaldo();

    if (tipeTujuan === 'tunai') {
        saldo.tunai += jumlah;
    } else {
        saldo.bank += jumlah;
    }

    saveSaldo(saldo);
    
    // ==========================================================
    // ===== PERBAIKAN: TAMPILKAN ANIMASI (Poin 1) =====
    // ==========================================================
    pemasukanModal.hide(); // Sembunyikan modal dulu
    showPemasukanAnimation(tipeTujuan); // Jalankan animasi
    
    // Tampilkan notifikasi & update UI setelah animasi selesai
    setTimeout(() => {
        showNotification(`Pemasukan Rp${jumlah.toLocaleString('id-ID')} ke ${tipeTujuan} berhasil!`, "success");
        // Perbarui UI di halaman dompet
        renderDompetPage();
    }, 2500); // Sesuaikan durasi dengan animasi
    // ==========================================================

    document.getElementById('pemasukan-form').reset();
}

/**
 * Menangani transfer internal (Bank -> Dompet) dari modal
 */
function handleTransferInternal(e) {
    e.preventDefault();
    const jumlahInput = document.getElementById('transfer-jumlah');
    if (!jumlahInput) return;

    const jumlah = parseFloat(jumlahInput.value);
    let saldo = getSaldo();

    if (isNaN(jumlah) || jumlah <= 0) {
        showNotification("Masukkan jumlah transfer yang valid.", "warning");
        return;
    }
    if (jumlah > saldo.bank) {
        showNotification("Saldo Bank Anda tidak mencukupi untuk transfer ini.", "danger");
        return;
    }

    // Proses transfer
    saldo.bank -= jumlah;
    saldo.tunai += jumlah;

    // Simpan saldo baru
    saveSaldo(saldo);
    
    // Sembunyikan modal dan jalankan animasi
    transferModal.hide();
    showTransferAnimation(); // Panggil animasi "Mengirim uang..."
    
    // Tampilkan notifikasi SETELAH animasi
    setTimeout(() => {
        showNotification(`Rp${jumlah.toLocaleString('id-ID')} berhasil dipindah ke Dompet.`, "success");
        // Perbarui UI
        renderDompetPage();
    }, 2500); // Sesuaikan dengan durasi animasi

    document.getElementById('transfer-form').reset();
}

function resetAnalysisViews() {
    // Reset Anomali
    const anomalyLoading = document.getElementById('anomali-loading');
    const anomalyNoData = document.getElementById('anomali-no-data');
    const chartContainer = document.getElementById('anomali-chart-container');
    if (anomalyChart instanceof Chart) { anomalyChart.destroy(); anomalyChart = null; }
    if (chartContainer) chartContainer.style.height = '400px'; // Kembalikan tinggi
    if (anomalyLoading) anomalyLoading.style.display = 'none';
    if (anomalyNoData) anomalyNoData.style.display = 'none';
    const anomDescCollapse = document.getElementById('anomali-description-collapse');
    if (anomDescCollapse) {
        const bsCollapse = bootstrap.Collapse.getInstance(anomDescCollapse);
        if (bsCollapse) bsCollapse.hide();
    }
    const insightContent = document.getElementById('anomali-insight-content');
    if(insightContent) insightContent.innerHTML = '';

    // Reset Prediksi (Versi BARU)
    const predictionResults = document.getElementById('prediksi-results-container');
    const predictionAnimation = document.getElementById('prediksi-processing-animation'); // Elemen baru
    const predictionInsight = document.getElementById('prediksi-insight-content'); // Elemen baru
    const predictionNoData = document.getElementById('prediksi-no-data');
    const predictionForm = document.getElementById('prediksi-form');

    // Reset elemen BARU
    if (predictionResults) predictionResults.style.display = 'none';
    if (predictionAnimation) predictionAnimation.style.display = 'none';
    if (predictionInsight) {
        predictionInsight.style.display = 'none';
        predictionInsight.innerHTML = ''; // Kosongkan konten
    }
    if (predictionNoData) predictionNoData.style.display = 'none';

    // Reset form prediksi
    if (predictionForm) {
        document.getElementById('prediksi-kriteria-1').value = '';
        document.getElementById('enable-kriteria-2').checked = false;
        
        if (typeof updatePredictionValueOptions === 'function') {
            updatePredictionValueOptions(document.getElementById('prediksi-kriteria-1'), document.getElementById('prediksi-nilai-1'), allUserExpensesCache);
        }
        if (typeof handleEnableKriteria2Change === 'function') { 
             handleEnableKriteria2Change();
        }
        // Panggil update state tombol untuk menonaktifkannya
        if (typeof updatePredictionButtonState === 'function') {
            updatePredictionButtonState();
        }
    }
}

/**
 * Memuat data (jika belum) dan menjalankan deteksi anomali
 */
// script.js

/**
 * MODIFIKASI: Memuat data & menjalankan deteksi anomali
 * HANYA untuk BULAN INI (otomatis).
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * MODIFIKASI: Memuat data & menjalankan deteksi anomali
 * HANYA untuk BULAN INI (otomatis).
 */
function loadAndRunAnomalyDetection() {
    const loadingEl = document.getElementById('anomali-loading');
    const noDataEl = document.getElementById('anomali-no-data');
    const chartContainer = document.getElementById('anomali-chart-container');
    const insightContent = document.getElementById('anomali-insight-content');

    const collapseEl = document.getElementById('anomali-description-collapse');
    const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);

    // Tampilkan loading, sembunyikan pesan error, reset chart & insight
    if (loadingEl) loadingEl.style.display = 'flex';
    if (noDataEl) noDataEl.style.display = 'none';
    if (anomalyChart instanceof Chart) { anomalyChart.destroy(); anomalyChart = null; }
    if (chartContainer) chartContainer.style.height = '400px';

    if (insightContent) insightContent.innerHTML = ''; // Kosongkan insight
    if (bsCollapse) bsCollapse.hide(); // Selalu tutup panel penjelasan

    // Ambil bulan & tahun SAAT INI
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();

    // Gunakan setTimeout agar loading spinner sempat terlihat
    setTimeout(() => {
        // 1. Muat SEMUA data untuk perbandingan historis (IQR)
        if (!analysisDataLoaded || allUserExpensesCache.length === 0) {
            console.log("Loading all user expenses for anomaly detection...");
            allUserExpensesCache = getAllUserExpenses();
            analysisDataLoaded = true;
        }

        if (loadingEl) loadingEl.style.display = 'none';

        // 2. Cek data historis (total)
        if (allUserExpensesCache.length < 10) {
            console.log("Not enough total data for anomaly detection.");
            if (noDataEl) {
                noDataEl.style.display = 'flex';
                noDataEl.querySelector('p').textContent = "Data historis total (min. 10) tidak cukup.";
            }
            if (chartContainer) chartContainer.style.height = '150px';
            return;
        }

        // 3. Filter data HANYA untuk bulan INI
        const expensesForCurrentMonth = allUserExpensesCache.filter(exp => {
            const date = new Date(exp.date);
            return date.getFullYear() == currentYear && (date.getMonth() + 1) == currentMonth;
        });

        // 4. Cek data di bulan terpilih
        if (expensesForCurrentMonth.length < 5) {
             console.log("Not enough data for current month.");
             if (noDataEl) {
                noDataEl.style.display = 'flex';
                noDataEl.querySelector('p').textContent = "Data bulan ini tidak cukup untuk analisis (min. 5).";
            }
             if (chartContainer) chartContainer.style.height = '150px';
             return;
        }

        // ========================================================
        // ===== PERBAIKAN: POPULASIKAN DROPDOWN FILTER =====
        // ========================================================
        populateAnomalyCategoryFilter(expensesForCurrentMonth);
        // ========================================================

        // 5. Jalankan Deteksi (Terima objek hasil)
        const { anomalies, categoryBounds } = detectSpendingAnomalies(allUserExpensesCache, expensesForCurrentMonth);
        
        // 6. Render Grafik (Kirim anomali DAN batas)
        renderAnomalyChart(anomalies, expensesForCurrentMonth, categoryBounds); 
        
        // 7. Render Insight (Fungsi ini dari file Anda)
        renderAnomalyInsight(anomalies, expensesForCurrentMonth.length);

    }, 250); 
}
/**
 * Memuat data (jika belum) dan menyiapkan form prediksi
 */
function loadAndSetupPrediction() {
    const kriteria1Select = document.getElementById('prediksi-kriteria-1');
    const predictButton = document.getElementById('btn-prediksi');
    const noDataEl = document.getElementById('prediksi-no-data'); // Referensi ke elemen no-data

    // Reset hasil sebelumnya
    const predictionResultsContainer = document.getElementById('prediksi-results-container');
    if (predictionResultsContainer) predictionResultsContainer.style.display = 'none';
    if (predictionChart instanceof Chart) { predictionChart.destroy(); predictionChart = null; }
    const predictionDescContent = document.getElementById('prediksi-description-content');
    if (predictionDescContent) predictionDescContent.innerHTML = '';
    const predDescCollapse = document.getElementById('prediksi-description-collapse');
    if (predDescCollapse) bootstrap.Collapse.getInstance(predDescCollapse)?.hide();
    
    if (noDataEl) noDataEl.style.display = 'none'; // Sembunyikan pesan no-data

    if (!analysisDataLoaded || allUserExpensesCache.length === 0) {
        console.log("Loading all user expenses for prediction setup...");
        showLoading("Memuat data histori...");
        setTimeout(() => {
            allUserExpensesCache = getAllUserExpenses();
            analysisDataLoaded = true;
            hideLoading();
            if (allUserExpensesCache.length < 10) { // Cek data minimal
                showNotification("Data historis belum cukup untuk prediksi.", "warning");
                if (kriteria1Select) kriteria1Select.disabled = true;
                if (predictButton) predictButton.disabled = true;
            } else {
                setupPredictionForm(allUserExpensesCache);
            }
        }, 100);
    } else {
        console.log("Using cached user expenses for prediction setup.");
        if (allUserExpensesCache.length < 10) {
            showNotification("Data historis belum cukup untuk prediksi.", "warning");
            if (kriteria1Select) kriteria1Select.disabled = true;
            if (predictButton) predictButton.disabled = true;
        } else {
            setupPredictionForm(allUserExpensesCache);
        }
    }
}


/**
 * Logika Deteksi Anomali (IQR)
 * @param {Array} allExpenses - Semua data historis
 * @param {Array} currentMonthExpenses - Data bulan ini saja
 * @returns {Array} - Array berisi objek anomali
 */
function detectSpendingAnomalies(allExpenses, currentMonthExpenses) {
    console.log("Detecting anomalies...");
    const anomalies = [];
    const expensesByCategory = allExpenses.reduce((acc, exp) => {
        // Normalisasi key kategori di sini agar konsisten
        const key = exp.kategori ? exp.kategori.toLowerCase() : 'tanpa_kategori'; 
        if (!acc[key]) acc[key] = [];
        // Pastikan amount adalah angka sebelum di-push
        const amount = parseFloat(exp.amount);
        if (!isNaN(amount)) {
             acc[key].push(amount);
        }
        return acc;
    }, {});

    const categoryBounds = {}; // Tetap simpan bounds di sini

    for (const category in expensesByCategory) {
        const prices = expensesByCategory[category].sort((a, b) => a - b);
        if (prices.length < 5) continue; 

        const q1Index = Math.floor(prices.length / 4);
        const q3Index = Math.ceil(prices.length * (3 / 4)) - 1; 
        const q1 = prices[q1Index];
        const q3 = prices[q3Index];
        const iqr = q3 - q1;
        
        const lowerBound = Math.max(0, q1 - (1.5 * iqr)); 
        const upperBound = q3 + (1.5 * iqr);

        // Simpan batas yang dihitung
        categoryBounds[category] = { 
            lower: Math.round(lowerBound), // Bulatkan agar mudah dibaca
            upper: Math.round(upperBound)  // Bulatkan
        };

        // Cek anomali HANYA pada data BULAN INI
        currentMonthExpenses.forEach(exp => {
            const expCategoryKey = exp.kategori ? exp.kategori.toLowerCase() : 'tanpa_kategori';
            const expAmount = parseFloat(exp.amount); // Pastikan amount adalah angka

            // Cek jika kategori cocok DAN amount valid
            if (expCategoryKey === category && !isNaN(expAmount)) { 
                // ===== PERHATIKAN KONDISI INI (Sudah Benar) =====
                // Mengecek apakah amount DI LUAR rentang (lebih kecil ATAU lebih besar)
                if (expAmount < lowerBound || expAmount > upperBound) {
                // ===============================================
                    console.log("Anomaly found:", exp);
                    anomalies.push({
                        ...exp, // Salin semua data expense asli
                        // Simpan batas normal spesifik untuk anomali ini
                        normalLower: Math.round(lowerBound), 
                        normalUpper: Math.round(upperBound)
                    });
                }
            }
        });
    }
    console.log("Category bounds calculated:", categoryBounds);
    console.log("Total anomalies found:", anomalies.length);
    
    // ===== KEMBALIKAN KEDUANYA =====
    return { anomalies, categoryBounds }; 
}

/**
 * Render Grafik Anomali (Scatter Plot)
 * @param {Array} anomalies - Array objek anomali
 * @param {Array} currentMonthExpenses - Semua data bulan ini
 */
/**
 * Render Grafik Anomali (Scatter Plot)
 * @param {Array} anomalies - Array objek anomali
 * @param {Array} currentMonthExpenses - Semua data bulan ini
 */
/**
 * Render Grafik Anomali (Scatter Plot)
 * @param {Array} anomalies - Array objek anomali
 * @param {Array} currentMonthExpenses - Semua data bulan ini
 
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Render Grafik Anomali (Scatter Plot)
 * @param {Array} anomalies - Array objek anomali
 * @param {Array} currentMonthExpenses - Semua data bulan ini
 * @param {Object} categoryBounds - Objek berisi batas normal per kategori
 */

/**
 * ==========================================================
 * FUNGSI BARU: (Tambahkan Blok Ini)
 * ==========================================================
 * FUNGSI-FUNGSI BARU UNTUK FILTER ANOMALI
 */

/**
 * BARU: Mempopulasikan dropdown filter kategori di hal. Anomali
 * @param {Array} currentMonthExpenses - Data pengeluaran bulan ini
 */
function populateAnomalyCategoryFilter(currentMonthExpenses) {
    const filterSelect = document.getElementById('anomali-kategori-filter');
    if (!filterSelect) return;

    // 1. Simpan value yang sedang dipilih (jika ada)
    const currentValue = filterSelect.value;

    // 2. Kumpulkan semua kategori unik dari data bulan ini
    // Kita gunakan nama yang sudah di-capitalize agar konsisten
    const categories = new Set(currentMonthExpenses.map(exp => 
        exp.kategori ? capitalizeFirstLetter(exp.kategori) : 'Lainnya'
    ));

    // 3. Kosongkan (tapi sisakan "Tampilkan Semua")
    filterSelect.innerHTML = '<option value="semua" selected>Tampilkan Semua Kategori</option>';

    // 4. Isi dengan kategori yang ditemukan, urutkan A-Z
    Array.from(categories).sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat; // Gunakan nama yg sudah di-capitalize
        option.textContent = cat;
        filterSelect.appendChild(option);
    });

    // 5. Set kembali ke value yg tadi dipilih (jika masih ada)
    // Ini berguna agar filter tidak reset jika data di-refresh
    if (filterSelect.querySelector(`option[value="${currentValue}"]`)) {
        filterSelect.value = currentValue;
    }
}

/**
 * BARU: Fungsi untuk memfilter chart anomali berdasarkan kategori
 * (Dipanggil oleh event listener 'change' pada dropdown)
 */
function filterAnomalyChart() {
    // Pastikan chart dan data aslinya ada
    if (!anomalyChart || !anomalyChart.originalData) {
        return; 
    }

    const filterSelect = document.getElementById('anomali-kategori-filter');
    if (!filterSelect) return;

    const selectedCategory = filterSelect.value;

    // Ambil data asli yang kita simpan di 'renderAnomalyChart'
    const originalNormalData = anomalyChart.originalData.normal;
    const originalAnomalyData = anomalyChart.originalData.anomaly;

    if (selectedCategory === 'semua') {
        // Kembalikan ke data asli (tanpa filter)
        anomalyChart.data.datasets[0].data = originalNormalData;
        anomalyChart.data.datasets[1].data = originalAnomalyData;
    } else {
        // Terapkan filter berdasarkan properti 'category' di data point
        const filteredNormal = originalNormalData.filter(p => p.category === selectedCategory);
        const filteredAnomaly = originalAnomalyData.filter(p => p.category === selectedCategory);
        
        // Ganti data chart dengan data yang sudah difilter
        anomalyChart.data.datasets[0].data = filteredNormal;
        anomalyChart.data.datasets[1].data = filteredAnomaly;
    }

    // Perbarui tampilan chart
    anomalyChart.update();
}

/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Render Grafik Anomali (Scatter Plot)
 * (DIMODIFIKASI: Menambahkan 'ticks' pada sumbu-X agar tanggal muncul)
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Render Grafik Anomali (Scatter Plot)
 * (DIMODIFIKASI: Memperbaiki sumbu-X agar menampilkan label tanggal)
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Render Grafik Anomali (Scatter Plot)
 * (DIMODIFIKASI: Menambahkan 'maxRotation' untuk memaksa label muncul)
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Render Grafik Anomali (Scatter Plot)
 * (PERBAIKAN FINAL: Menghapus 'maxTicksLimit' & 'source: auto' 
 * agar TimeScale dapat bekerja dengan benar)
 */
/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi ini)
 * ==========================================================
 * Render Grafik Anomali (Scatter Plot)
 * (PERBAIKAN FINAL V2: Mengganti tipe chart dari 'scatter' ke 'line'
 * dan menyembunyikan garisnya. Ini cara paling ampuh
 * untuk memaksa 'TimeScale' bekerja dengan benar.)
 */
function renderAnomalyChart(anomalies, currentMonthExpenses, categoryBounds) {
    const ctx = document.getElementById('anomali-chart')?.getContext('2d');
    if (!ctx) { 
        console.error("Anomaly chart canvas not found!"); 
        return; 
    }
    if (anomalyChart instanceof Chart) { 
        anomalyChart.destroy(); 
    }

    const normalData = [];
    const anomalyData = [];
    const anomalyIds = new Set(anomalies.map(a => a.id));

    currentMonthExpenses.forEach(exp => {
        try {
            const expenseDate = new Date(exp.date);
            const expenseAmount = parseFloat(exp.amount);

            if (!exp || !exp.date || !exp.amount || isNaN(expenseDate.getTime()) || isNaN(expenseAmount) || expenseAmount <= 0) {
                console.warn("Skipping invalid expense:", exp);
                return;
            }
            
            const expCategoryKey = (exp.kategori || 'tanpa_kategori').toLowerCase();
            const bounds = categoryBounds ? categoryBounds[expCategoryKey] : null;

            const dataPoint = {
                x: expenseDate, // Harus objek Date
                y: expenseAmount,
                label: `${capitalizeFirstLetter(exp.barang || 'Unknown')} (${capitalizeFirstLetter(exp.kategori || 'Unknown')})`,
                category: capitalizeFirstLetter(exp.kategori || 'Lainnya'),
                normalLower: bounds ? bounds.lower : 0,
                normalUpper: bounds ? bounds.upper : Infinity 
            };

            if (anomalyIds.has(exp.id)) {
                anomalyData.push(dataPoint);
            } else {
                normalData.push(dataPoint);
            }
        } catch (error) {
            console.error("Error processing expense for chart:", exp, error);
        }
    });

    try {
        anomalyChart = new Chart(ctx, {
            // ================================================
            // ===== 1. PERUBAHAN UTAMA ADA DI SINI =====
            // ================================================
            type: 'line', // <-- Ganti dari 'scatter' ke 'line'
            // ================================================

            data: {
                datasets: [
                    {
                        label: 'Normal',
                        data: normalData,
                        backgroundColor: 'rgba(15, 12, 227, 0.7)',
                        borderColor:  'rgba(15, 12, 227, 0.7)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointStyle: 'circle',
                        // ================================================
                        // ===== 2. SEMBUNYIKAN GARISNYA =====
                        // ================================================
                        showLine: false // <-- Tambahkan ini
                    },
                    {
                        label: 'Anomali',
                        data: anomalyData,
                        backgroundColor: 'rgba(255, 0, 25, 0.7)',
                        borderColor: 'rgba(255, 0, 25, 0.7)',
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        pointStyle: 'triangle',
                        // ================================================
                        // ===== 3. SEMBUNYIKAN GARISNYA =====
                        // ================================================
                        showLine: false // <-- Tambahkan ini
                    }
                ]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                // Interaksi tetap sama
                onClick: (evt, activeElements) => {
                    if (activeElements.length > 0) {
                        const dataIndex = activeElements[0].index;
                        const datasetIndex = activeElements[0].datasetIndex;
                        const clickedPoint = anomalyChart.data.datasets[datasetIndex].data[dataIndex];
                        
                        if (clickedPoint) {
                            const category = clickedPoint.category;
                            const lower = clickedPoint.normalLower;
                            const upper = clickedPoint.normalUpper;
                            const amount = clickedPoint.y;
                            const item = clickedPoint.label.split(' (')[0]; 
                            const dateObj = clickedPoint.x;
                            const formattedDate = dateObj.toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            });

                            const title = `Detail Transaksi`;
                            const message = `
                                <div style="text-align: left; line-height: 1.6;">
                                    <strong>Barang:</strong> ${item}<br>
                                    <strong>Tanggal:</strong> ${formattedDate}<br>
                                    <strong>Jumlah:</strong> Rp${amount.toLocaleString('id-ID')}
                                    <hr style="margin: 8px 0;">
                                    <strong>Kategori:</strong> ${category}<br>
                                    <strong>Batas Normal Kategori:</strong><br>
                                    Rp${lower.toLocaleString('id-ID')} - Rp${upper.toLocaleString('id-ID')}
                                </div>
                            `;
                            showInfoModal(title, message);
                        }
                    }
                },
                onHover: (event, chartElement) => {
                    const canvas = event.native.target;
                    canvas.style.cursor = chartElement[0] ? 'pointer' : 'default';
                },
                scales: {
                    x: {
                        type: 'time', 
                        time: { 
                            unit: 'day', // Unit waktu 'day'
                            tooltipFormat: 'dd MMM yyyy',
                            displayFormats: {
                                day: 'dd MMM'
                            }
                        },
                        title: { display: true, text: 'Tanggal' },
                        grid: {
                            color: '#e9ecef',
                            drawBorder: false,
                            borderDash: [2, 3]
                        },
                        // Konfigurasi ticks ini sekarang akan bekerja dgn benar
                        ticks: {
                            display: true,
                            color: '#333333',
                            autoSkip: true, // <-- Ini akan melompati HARI (bukan data)
                            autoSkipPadding: 15, 
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Jumlah Pengeluaran (Rp)' },
                        ticks: { 
                            callback: value => `Rp${Math.round(value).toLocaleString('id-ID')}` 
                        },
                        grid: {
                            color: '#e9ecef',
                            drawBorder: false,
                            borderDash: [2, 3]
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.raw.label || '';
                                return `${label}: Rp${Math.round(context.parsed.y).toLocaleString('id-ID')}`;
                            }
                        }
                    },
                    legend: { position: 'top' }
                }
            }
        });
        
        anomalyChart.originalData = {
            normal: normalData,
            anomaly: anomalyData
        };

    } catch (error) {
        console.error("Error creating anomaly chart:", error);
        showNotification("Gagal membuat grafik anomali.", "danger");
    }
}
/** // <-- AWAL Blok Komentar JSDoc
 * BARU: Menampilkan insight ringkas di bawah grafik anomali
 * @param {Array} anomalies - Array objek anomali yang ditemukan
 * @param {number} totalTransactionsInMonth - Jumlah total transaksi di bulan itu
 */ // <-- AKHIR Blok Komentar JSDoc 
function renderAnomalyInsight(anomalies, totalTransactionsInMonth) {
    const insightContent = document.getElementById('anomali-insight-content');
    if (!insightContent) return;

    let insightHtml = '';
    const anomalyCount = anomalies.length;

    if (anomalyCount === 0) {
        // --- KASUS JIKA TIDAK ADA ANOMALI ---
        insightHtml = `
            <div class="alert alert-success p-2" role="alert">
                <h5 class="alert-heading mb-1" style="font-size: 1.1rem;">🎉 Luar Biasa!</h5>
                <p class="mb-0 small">
                    Tidak ada anomali terdeteksi dari <strong>${totalTransactionsInMonth}</strong> transaksi bulan ini. 
                    Pola pengeluaran Anda sangat konsisten!
                </p>
            </div>
        `;
    } else {
        // --- KASUS JIKA ADA ANOMALI ---
        // Temukan anomali termahal untuk insight
        const mostExpensiveAnomaly = anomalies.reduce((max, a) => a.amount > max.amount ? a : max, anomalies[0]);
        
        insightHtml = `
            <div class="alert alert-warning p-2" role="alert">
                <h5 class="alert-heading mb-1" style="font-size: 1.1rem;">🧐 Perhatian!</h5>
                <p class="mb-0 small">
                    Sistem mendeteksi <strong>${anomalyCount}</strong> transaksi anomali (ditandai 🌟) 
                    dari total <strong>${totalTransactionsInMonth}</strong> transaksi bulan ini.
                </p>
                <hr class="my-1 py-0">
                <p class="mb-0 small">
                    Anomali terbesar adalah pembelian <strong>"${capitalizeFirstLetter(mostExpensiveAnomaly.barang)}"</strong> 
                    seharga <strong>Rp${mostExpensiveAnomaly.amount.toLocaleString('id-ID')}</strong>.
                    <br>
                    Anda bisa <strong>klik titik</strong> di grafik untuk melihat detailnya.
                </p>
            </div>
        `;
    }
    
    insightContent.innerHTML = insightHtml;
  // ===== TAMBAHKAN LOGIKA AUTO-OPEN =====
    // Jika ada anomali, buka panel penjelasan secara otomatis
    if (anomalyCount > 0) {
        const collapseEl = document.getElementById('anomali-description-collapse');
        // Gunakan 'getOrCreateInstance' untuk keamanan
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
        bsCollapse.show();
    }
}

/**
 * Fungsi terpusat untuk memeriksa status form dan mengaktifkan/menonaktifkan tombol "Lihat Hasil".
 */
function updatePredictionButtonState() {
    // Ambil nilai dari semua elemen form yang relevan
    const kriteria1Select = document.getElementById('prediksi-kriteria-1');
    const nilai1Select = document.getElementById('prediksi-nilai-1');
    const enableKriteria2Checkbox = document.getElementById('enable-kriteria-2');
    const kriteria2Select = document.getElementById('prediksi-kriteria-2');
    const nilai2Select = document.getElementById('prediksi-nilai-2');
    const predictButton = document.getElementById('btn-prediksi');

    if (!kriteria1Select || !nilai1Select || !enableKriteria2Checkbox || !kriteria2Select || !nilai2Select || !predictButton) {
        console.error("Elemen form prediksi hilang saat update state tombol.");
        return;
    }

    const k1 = kriteria1Select.value;
    const v1 = nilai1Select.value;
    const enabled2 = enableKriteria2Checkbox.checked;
    const k2 = kriteria2Select.value;
    const v2 = nilai2Select.value;

    let isButtonDisabled = true; // Mulai dengan nonaktif

    if (k1 && v1) { // Kriteria 1 dan Nilai 1 harus terisi
        if (enabled2) { // Jika Kriteria 2 diaktifkan
            if (k2 && v2) { // Kriteria 2 dan Nilai 2 juga harus terisi
                isButtonDisabled = false;
            }
        } else { // Jika Kriteria 2 tidak diaktifkan
            isButtonDisabled = false;
        }
    }

    predictButton.disabled = isButtonDisabled;
}

/**
 * Handler BARU saat Nilai Kombinasi (Nilai 2) berubah.
 * Ini adalah kunci perbaikan bug.
 */
function handleNilai2Change() {
    updatePredictionButtonState(); // Cukup panggil fungsi state terpusat
}

/**
 * Menyiapkan Event Listener untuk Form Prediksi
/**
 * Menyiapkan Event Listener untuk Form Prediksi
 * @param {Array} allExpenses - Semua data historis
 */
/**
 * Menyiapkan Event Listener untuk Form Prediksi
 * GANTI FUNGSI INI.
 */
function setupPredictionForm(allExpenses) {
    const kriteria1Select = document.getElementById('prediksi-kriteria-1');
    const nilai1Select = document.getElementById('prediksi-nilai-1');
    const enableKriteria2Checkbox = document.getElementById('enable-kriteria-2');
    const kriteria2Group = document.getElementById('prediksi-kriteria-2-group'); 
    const kriteria2Inputs = document.getElementById('prediksi-kriteria-2-inputs');
    const kriteria2Select = document.getElementById('prediksi-kriteria-2');
    const nilai2Select = document.getElementById('prediksi-nilai-2');
    const predictButton = document.getElementById('btn-prediksi');

    if (!kriteria1Select || !nilai1Select || !enableKriteria2Checkbox || !kriteria2Inputs || !kriteria2Select || !nilai2Select || !predictButton) {
        console.error("Prediction form elements missing during setup!");
        return; 
    }

    // Reset form state awal
    kriteria1Select.disabled = false;
    kriteria1Select.value = '';
    nilai1Select.disabled = true;
    nilai1Select.innerHTML = '<option value="">(Pilih Kriteria Utama Dulu)</option>';
    enableKriteria2Checkbox.checked = false;
    enableKriteria2Checkbox.disabled = true;
    if (kriteria2Group) kriteria2Group.style.display = 'block';
    kriteria2Inputs.style.display = 'none';
    kriteria2Select.disabled = true;
    kriteria2Select.innerHTML = '';
    nilai2Select.disabled = true;
    nilai2Select.innerHTML = '<option value="">(Pilih Kriteria Kombinasi Dulu)</option>';
    predictButton.disabled = true;

    // --- Manajemen Event Listener ---

    // Listener untuk Kriteria 1
    kriteria1Select.addEventListener('change', () => {
        handleKriteria1Change(allExpenses); 
    });
    
    // Listener untuk Nilai 1
    nilai1Select.addEventListener('change', handleNilai1Change);

    // Listener untuk Checkbox Kriteria 2
    enableKriteria2Checkbox.addEventListener('change', handleEnableKriteria2Change);

    // Listener untuk Kriteria 2
    kriteria2Select.addEventListener('change', () => {
        handleKriteria2Change(allExpenses); 
    });
    
    // LISTENER BARU YANG MEMPERBAIKI BUG
    if (nilai2Select) {
        nilai2Select.addEventListener('change', handleNilai2Change);
    }

    // Listener untuk Tombol Prediksi
    predictButton.addEventListener('click', runPredictionHandler);
}
// --- Handler untuk Form Prediksi (didefinisikan di luar setup) ---

/**
 * Handler saat Kriteria Utama berubah. Menerima data expense sebagai parameter.
 *
 /**
 * Handler saat Kriteria Utama berubah.
 * GANTI FUNGSI INI.
 * @param {Array} allExpenses - Array berisi semua data historis pengeluaran.
 */
function handleKriteria1Change(allExpenses) {
    const kriteria1Select = document.getElementById('prediksi-kriteria-1');
    const nilai1Select = document.getElementById('prediksi-nilai-1');
    const enableKriteria2Checkbox = document.getElementById('enable-kriteria-2');
    const kriteria2Select = document.getElementById('prediksi-kriteria-2');
    const predictButton = document.getElementById('btn-prediksi');

    if (!kriteria1Select || !nilai1Select || !enableKriteria2Checkbox || !kriteria2Select || !predictButton) {
        console.error("Missing elements in handleKriteria1Change");
        return;
    }

    const kriteria1Value = kriteria1Select.value;

    updatePredictionValueOptions(kriteria1Select, nilai1Select, allExpenses);

    enableKriteria2Checkbox.checked = false;
    handleEnableKriteria2Change(); // Panggil handler checkbox untuk reset tampilan

    enableKriteria2Checkbox.disabled = !kriteria1Value; // Checkbox aktif jika Kriteria 1 dipilih

    if (kriteria1Value) {
        updatePredictionKriteriaOptions(kriteria2Select, kriteria1Value);
    } else {
        kriteria2Select.innerHTML = ''; // Kosongkan opsi Kriteria 2 jika Kriteria 1 kosong
        kriteria2Select.disabled = true; // Nonaktifkan Kriteria 2
    }
    
    // Panggil fungsi state terpusat di akhir
    updatePredictionButtonState();
}

/**
 * Handler saat Nilai Utama (Nilai 1) berubah.
 * GANTI FUNGSI INI.
 */
function handleNilai1Change() {
    // Cukup panggil fungsi state terpusat
    updatePredictionButtonState();
}


/**
 * Handler saat Checkbox "Gunakan Kriteria Kombinasi" berubah.
 * GANTI FUNGSI INI.
 */
function handleEnableKriteria2Change() {
    const enableKriteria2Checkbox = document.getElementById('enable-kriteria-2');
    const kriteria2Inputs = document.getElementById('prediksi-kriteria-2-inputs');
    const kriteria2Select = document.getElementById('prediksi-kriteria-2');
    const nilai2Select = document.getElementById('prediksi-nilai-2');
    const predictButton = document.getElementById('btn-prediksi');
    const nilai1Select = document.getElementById('prediksi-nilai-1'); // Dibutuhkan untuk cek status tombol

    if (!enableKriteria2Checkbox || !kriteria2Inputs || !kriteria2Select || !nilai2Select || !predictButton || !nilai1Select) {
         console.error("Missing elements in handleEnableKriteria2Change");
         return;
    }

    const isEnabled = enableKriteria2Checkbox.checked;
    kriteria2Inputs.style.display = isEnabled ? 'flex' : 'none'; // Tampilkan/sembunyikan input Kriteria 2
    kriteria2Select.disabled = !isEnabled; // Aktifkan/nonaktifkan dropdown Kriteria 2
    nilai2Select.disabled = true; // Selalu nonaktifkan Nilai 2 saat checkbox berubah

    if (!isEnabled) {
         kriteria2Select.value = '';
         nilai2Select.innerHTML = '<option value="">(Pilih Kriteria Kombinasi Dulu)</option>';
         nilai2Select.value = ''; // Pastikan value kosong
    }

    // Panggil fungsi state terpusat di akhir
    updatePredictionButtonState();
}

/**
 * Handler saat Kriteria Kombinasi (Kriteria 2) berubah.
 * GANTI FUNGSI INI.
 * @param {Array} allExpenses - Array berisi semua data historis pengeluaran.
 */
function handleKriteria2Change(allExpenses) {
    const kriteria2Select = document.getElementById('prediksi-kriteria-2');
    const nilai2Select = document.getElementById('prediksi-nilai-2');
    const predictButton = document.getElementById('btn-prediksi');
    const nilai1Select = document.getElementById('prediksi-nilai-1'); 

    if (!kriteria2Select || !nilai2Select || !predictButton || !nilai1Select) {
        console.error("Missing elements in handleKriteria2Change");
        return;
    }

    updatePredictionValueOptions(kriteria2Select, nilai2Select, allExpenses);

    // Panggil fungsi state terpusat di akhir
    updatePredictionButtonState();
}

function runPredictionHandler() {
    runPrediction(allUserExpensesCache); // Panggil fungsi prediksi utama
}

/**
 * Mengisi dropdown Nilai berdasarkan Kriteria yang dipilih
 */
/**
 * Mengisi dropdown Nilai berdasarkan Kriteria yang dipilih
 * GANTI FUNGSI INI. (Menambahkan case 'Bagian Hari')
 */
function updatePredictionValueOptions(selectKriteriaElement, selectNilaiElement, allExpenses) {
    const selectedKriteria = selectKriteriaElement.value;
    const currentNilai = selectNilaiElement.value; // Simpan nilai lama
    selectNilaiElement.innerHTML = '';
    selectNilaiElement.disabled = true;

    if (!selectedKriteria) {
        selectNilaiElement.innerHTML = `<option value="">(Pilih Kriteria Dulu)</option>`;
        return;
    }

    let options = new Set();
    try {
        switch (selectedKriteria) {
            case 'Nama Hari': options = new Set(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']); break;
            case 'Jenis Hari': options = new Set(['Weekday', 'Weekend']); break;
            // OPSI BARU
            case 'Bagian Hari': options = new Set(['Pagi', 'Siang', 'Sore', 'Malam']); break;
            case 'Bagian Bulan': options = new Set(['Awal Bulan', 'Tengah Bulan', 'Akhir Bulan']); break;
            case 'Minggu ke-': options = new Set(['1', '2', '3', '4', '5']); break;
            case 'Kategori':
                // Ambil dari kategori yang sudah disimpan
                const savedCategoriesKey = `categories_${localStorage.getItem('currentUser')}`;
                const savedCategories = JSON.parse(localStorage.getItem(savedCategoriesKey)) || [];
                savedCategories.forEach(cat => options.add(capitalizeFirstLetter(cat)));
                
                // Ambil kategori dari data expense historis (allExpenses)
                allExpenses.forEach(exp => {
                    if (exp.kategori) {
                        options.add(capitalizeFirstLetter(exp.kategori));
                    }
                });
                break;
            default:
                 selectNilaiElement.innerHTML = `<option value="">(Kriteria Tdk Valid)</option>`;
                 return;
        }
    } catch (e) {
        console.error("Error populating prediction values:", e);
        showNotification("Gagal memuat opsi nilai.", "danger");
    }

    selectNilaiElement.innerHTML = `<option value="" selected>(Pilih Nilai)</option>`;
    // Menambahkan 'Bagian Hari' ke daftar yang tidak perlu di-sort
    const doNotSort = ['Nama Hari', 'Minggu ke-', 'Bagian Bulan', 'Bagian Hari'];
    const sortedOptions = doNotSort.includes(selectedKriteria) ? Array.from(options) : Array.from(options).sort();
    
    sortedOptions.forEach(opt => {
        if(opt) selectNilaiElement.add(new Option(opt, opt)); // Tambah opsi
    });
    selectNilaiElement.value = currentNilai; // Coba set ke nilai lama
    selectNilaiElement.disabled = false;
}

/**
 * Mengisi dropdown Kriteria 2 (tanpa duplikat Kriteria 1)
 * GANTI FUNGSI INI. (Menambahkan 'Bagian Hari' ke daftar)
 */
function updatePredictionKriteriaOptions(selectKriteria2Element, excludeKriteria) {
     const allKriteria = ["Nama Hari", "Jenis Hari", "Bagian Hari", "Bagian Bulan", "Minggu ke-", "Kategori"];
     selectKriteria2Element.innerHTML = '<option value="" selected>(Pilih Kriteria Kombinasi)</option>';
     allKriteria.forEach(kriteria => {
         if (kriteria !== excludeKriteria) {
            selectKriteria2Element.add(new Option(kriteria, kriteria));
         }
     });
}

/**
 * Logika Inti Prediksi Pengeluaran
 * @param {Array} allExpenses - Semua data historis
 */
/**
 * PERBAIKAN: Logika Inti Prediksi Pengeluaran
 * - Menangani kasus data filter kosong
 * - Menangani kasus hasil perhitungan NaN
 * - Membuat insight lebih cerdas dan fleksibel
 */
/**
 * Logika Inti Prediksi Pengeluaran
 * GANTI FUNGSI INI SEPENUHNYA.
 */
function runPrediction(allExpenses) {
    const kriteria1 = document.getElementById('prediksi-kriteria-1').value;
    const nilai1 = document.getElementById('prediksi-nilai-1').value;
    const useKriteria2 = document.getElementById('enable-kriteria-2').checked;
    const kriteria2 = useKriteria2 ? document.getElementById('prediksi-kriteria-2').value : null;
    const nilai2 = useKriteria2 ? document.getElementById('prediksi-nilai-2').value : null;

    // Ambil elemen BARU dari HTML
    const resultsContainer = document.getElementById('prediksi-results-container');
    const animationEl = document.getElementById('prediksi-processing-animation');
    const insightEl = document.getElementById('prediksi-insight-content');
    const noDataEl = document.getElementById('prediksi-no-data');

    // Validasi input awal (sudah dicek oleh tombol, tapi baik untuk keamanan)
    if (!kriteria1 || !nilai1 || (useKriteria2 && (!kriteria2 || !nilai2))) {
        showNotification("Pilih kriteria dan nilai prediksi yang valid.", "warning"); return;
    }

    console.log(`Running prediction for: ${kriteria1}=${nilai1}` + (useKriteria2 ? ` AND ${kriteria2}=${nilai2}` : ''));

    // 1. Reset tampilan: Tampilkan kontainer, Tampilkan Animasi, Sembunyikan hasil/no-data
    if (resultsContainer) resultsContainer.style.display = 'block';
    if (animationEl) animationEl.style.display = 'flex'; // 'flex' sesuai CSS
    if (insightEl) insightEl.style.display = 'none';
    if (noDataEl) noDataEl.style.display = 'none';

    // Beri jeda 1.5 detik untuk animasi
    setTimeout(() => {
        // 2. Filter data (DENGAN LOGIKA BARU 'Bagian Hari')
        const filteredExpenses = allExpenses.filter(exp => {
            const dateObj = new Date(exp.date);
            if (isNaN(dateObj.getTime())) return false;
            
            // Ambil semua bagian tanggal
            const parts = getDateParts(dateObj); // { tanggal, bulan, mingguKe, bagianBulan, tahun, jam }
            const namaHari = getNamaHari(dateObj);
            const jenisHari = getJenisHari(namaHari);
            const bagianHari = getBagianHari(dateObj); // <-- Ambil Bagian Hari

            let match1 = false;
            switch (kriteria1) {
                case 'Nama Hari': match1 = namaHari === nilai1; break;
                case 'Jenis Hari': match1 = jenisHari === nilai1; break;
                case 'Bagian Hari': match1 = bagianHari === nilai1; break; // <-- LOGIKA BARU
                case 'Bagian Bulan': match1 = parts.bagianBulan === nilai1; break;
                case 'Minggu ke-': match1 = parts.mingguKe.toString() === nilai1; break;
                case 'Kategori': match1 = capitalizeFirstLetter(exp.kategori) === nilai1; break;
            }

            let match2 = true; // Asumsikan lolos jika Kriteria 2 tidak aktif
            if (useKriteria2 && kriteria2 && nilai2) {
                match2 = false; // Set ke false dan buktikan true jika Kriteria 2 aktif
                 switch (kriteria2) {
                    case 'Nama Hari': match2 = namaHari === nilai2; break;
                    case 'Jenis Hari': match2 = jenisHari === nilai2; break;
                    case 'Bagian Hari': match2 = bagianHari === nilai2; break; // <-- LOGIKA BARU
                    case 'Bagian Bulan': match2 = parts.bagianBulan === nilai2; break;
                    case 'Minggu ke-': match2 = parts.mingguKe.toString() === nilai2; break;
                    case 'Kategori': match2 = capitalizeFirstLetter(exp.kategori) === nilai2; break;
                }
            }
            return match1 && match2;
        });

        // 3. Cek jika hasil filter kosong
        if (filteredExpenses.length === 0) {
            console.warn("No historical data matches the prediction criteria.");
            if (animationEl) animationEl.style.display = 'none'; // Sembunyikan animasi
            if (noDataEl) noDataEl.style.display = 'block'; // Tampilkan no data
            if (insightEl) insightEl.style.display = 'none'; // Pastikan insight tersembunyi
            return; // HENTIKAN eksekusi
        }

        // 4. Hitung total per hari unik (untuk rata-rata harian)
        const dailyTotals = filteredExpenses.reduce((acc, exp) => {
            const dateString = new Date(exp.date).toDateString();
            acc[dateString] = (acc[dateString] || 0) + exp.amount;
            return acc;
        }, {});
        const dailyTotalValues = Object.values(dailyTotals);
        const totalDays = dailyTotalValues.length; // Jumlah hari unik

        // 5. Hitung Metrik Utama
        const totalTransactions = filteredExpenses.length;
        const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        // Pastikan totalDays > 0 untuk menghindari pembagian dengan nol
        const predictedAverage = totalDays > 0 ? (totalAmount / totalDays) : 0; // Rata-rata per HARI
        
        // 6. Hitung Min/Max (Rentang)
        let minHist = Infinity, maxHist = 0;
        if (dailyTotalValues.length > 0) {
            minHist = Math.min(...dailyTotalValues);
            maxHist = Math.max(...dailyTotalValues);
        }
        const minAmount = (minHist === Infinity) ? 0 : minHist;
        const maxAmount = maxHist;

        // 7. Hitung Insight Tambahan
        const avgPerTransaction = totalTransactions > 0 ? (totalAmount / totalTransactions) : 0;

        // Kategori Paling Umum
        const categoryCounts = filteredExpenses.reduce((acc, exp) => {
            const cat = capitalizeFirstLetter(exp.kategori || 'Lainnya');
            acc[cat] = (acc[cat] || 0) + 1; return acc;
        }, {});
        const dominantCategory = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])[0]; // [Nama, Jumlah]

        // Item Paling Umum
        const itemCounts = filteredExpenses.reduce((acc, exp) => {
            const item = capitalizeFirstLetter(exp.barang || 'Item');
            acc[item] = (acc[item] || 0) + 1; return acc;
        }, {});
        const dominantItem = Object.entries(itemCounts).sort((a,b) => b[1] - a[1])[0]; // [Nama, Jumlah]

        // 8. Buat Teks Kriteria untuk Judul
        let criteriaText = `${kriteria1}: ${nilai1}`;
        if (useKriteria2 && kriteria2 && nilai2) {
            criteriaText += ` & ${kriteria2}: ${nilai2}`;
        }

        // 9. Buat HTML untuk Insight
        const insightHTML = `
            <div class="insight-header">
                Gambaran untuk: <strong>${criteriaText}</strong>
            </div>

            <div class="insight-main-metric">
                <span class="metric-label">Rata-Rata Pengeluaran per Hari</span>
                <span class="metric-value">Rp${predictedAverage.toLocaleString('id-ID', {maximumFractionDigits: 0})}</span>
            </div>

            <div class="insight-grid">
                <div class="insight-card">
                    <span class="metric-label">Nilai Minimal Pengeluaran</span>
                    <span class="metric-value">Rp${minAmount.toLocaleString('id-ID')}</span>
                </div>
                <div class="insight-card">
                    <span class="metric-label">Nilai Maksimal Pengeluaran</span>
                    <span class="metric-value">Rp${maxAmount.toLocaleString('id-ID')}</span>
                </div>
            </div>

            <ul class="list-group list-group-flush insight-list-group">
                <li class="list-group-item">
                    <span>Total Transaksi</span>
                    <strong>${totalTransactions}</strong>
                </li>
                <li class="list-group-item">
                    <span>Jumlah Hari (Unik)</span>
                    <strong>${totalDays}</strong>
                </li>
                <li class="list-group-item">
                    <span>Rata-Rata per Transaksi</span>
                    <strong>Rp${avgPerTransaction.toLocaleString('id-ID', {maximumFractionDigits: 0})}</strong>
                </li>
                <li class="list-group-item">
                    <span>Kategori Paling Sering</span>
                    <strong>${dominantCategory[0]} <small>(${dominantCategory[1]}x)</small></strong>
                </li>
                <li class="list-group-item">
                    <span>Item Paling Sering</span>
                    <strong>${dominantItem[0]} <small>(${dominantItem[1]}x)</small></strong>
                </li>
            </ul>
            
            <div class="insight-footer">
                *Berdasarkan ${totalTransactions} riwayat transaksi yang sesuai kriteria.
            </div>
        `;

        // 10. Tampilkan Hasil
        if (animationEl) animationEl.style.display = 'none'; // Sembunyikan animasi
        if (noDataEl) noDataEl.style.display = 'none'; // Pastikan no data tersembunyi
        if (insightEl) {
            insightEl.innerHTML = insightHTML; // Masukkan HTML
            insightEl.style.display = 'block'; // Tampilkan insight
        }

    }, 1500); // Delay 1.5 detik untuk animasi
}
/**
 * Render Grafik Prediksi (Bar Chart)
 * @param {number} predictedAverage - Rata2 hasil prediksi
 * @param {number} overallAverage - Rata2 pembanding
 * @param {string} criteriaText - Label untuk prediksi
 */
/**
 * PERBAIKAN: Render Grafik Prediksi (Bar Chart)
 * - Menambahkan validasi NaN di awal
 */

// Fungsi untuk Menangani Cetak Pengeluaran dengan PDF
// Fungsi untuk Menangani Cetak Pengeluaran dengan PDF
// Fungsi untuk Menangani Cetak Pengeluaran dengan PDF
function generateRekapDataPDF(year, month, user, expenses, targetNumber, tujuanPengeluaran) {
  // --- Kalkulasi Data ---
  const totalRealisasi = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const saldoAkhir = targetNumber - totalRealisasi;
  const percentage = targetNumber === 0 ? 0 : ((totalRealisasi / targetNumber) * 100).toFixed(2);
  const tujuanFormatted = capitalizeFirstLetter(tujuanPengeluaran);
  const monthName = capitalizeFirstLetter(getMonthName(month));

  // --- Inisialisasi PDF ---
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageMargin = 15;
  let currentY = pageMargin; // Posisi Y saat ini

  // ===== PERBAIKAN 1: Pastikan Judul & Subjudul Ada =====
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = `Rekap Pengeluaran ${tujuanFormatted}`;
  const subtitle = `Bulan ${monthName} ${year}`; // Menggunakan tahun dan bulan dari parameter
  doc.text(title, pageWidth / 2, currentY, { align: 'center' });
  currentY += 7; // Jarak
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
  currentY += 12; // Spasi setelah subjudul
  // ======================================================

  // ===== PERBAIKAN 2: Pastikan Ringkasan Keuangan Ada =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Keuangan:', pageMargin, currentY);
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Saldo Awal`, pageMargin, currentY);
  doc.text(`: Rp${targetNumber.toLocaleString('id-ID')}`, pageMargin + 50, currentY);
  currentY += 6;
  doc.text(`Total Pengeluaran`, pageMargin, currentY);
  doc.text(`: Rp${totalRealisasi.toLocaleString('id-ID')}`, pageMargin + 50, currentY);
  currentY += 6;
  doc.text(`Saldo Akhir`, pageMargin, currentY);
  doc.text(`: Rp${saldoAkhir.toLocaleString('id-ID')}`, pageMargin + 50, currentY);
  currentY += 6;
  doc.text(`Persentase Realisasi`, pageMargin, currentY);
  doc.text(`: ${percentage}%`, pageMargin + 50, currentY);
  currentY += 10; // Spasi sebelum tabel detail
  // =======================================================

  // --- Tabel Pengeluaran ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Transaksi:', pageMargin, currentY);
  currentY += 6;

  const tableColumn = ["Tanggal", "Barang", "Kategori", "Jumlah (Rp)"];
  const tableRows = [];

  expenses.sort((a, b) => new Date(a.date) - new Date(b.date));

  expenses.forEach(exp => {
    const dateObj = new Date(exp.date);
    const tanggal = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID') : '-';
    const barang = capitalizeFirstLetter(exp.barang);
    const kategori = capitalizeFirstLetter(exp.kategori);
    const jumlah = exp.amount.toLocaleString('id-ID');
    const rowData = [tanggal, barang, kategori, jumlah]; // Sudah benar (4 kolom)
    tableRows.push(rowData);
  });

  // ===== PERBAIKAN 3: Hapus Baris Total di Akhir Tabel =====
  // tableRows.push([
  //   { content: 'Total Pengeluaran', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
  //   { content: `Rp${totalRealisasi.toLocaleString('id-ID')}`, styles: { halign: 'right', fontStyle: 'bold' } }
  // ]); // Baris ini dihapus/dikomentari
  // ========================================================

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: currentY,
    theme: 'striped',
    headStyles: { fillColor: [75, 0, 130], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: { // Lebar kolom disesuaikan
      0: { halign: 'center', cellWidth: 28 },
      1: { halign: 'left', cellWidth: 'auto' }, // Biarkan barang otomatis
      2: { halign: 'left', cellWidth: 45 },
      3: { halign: 'right', cellWidth: 35 }
    },
    didDrawPage: function (data) {
       // Footer
       const pageCount = doc.internal.getNumberOfPages(); doc.setFontSize(9); doc.setTextColor(150);
       doc.text(`Generated by Mumy - Halaman ${data.pageNumber} dari ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
  });

  // --- Simpan PDF ---
  const fileName = `Rekap_Pengeluaran_${tujuanFormatted.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`;
  doc.save(fileName);
}
// Fungsi untuk Menginisialisasi Dropdown Bulan dan Kategori pada Category Expense Enhanced
function initializeCategoryExpenseEnhanced() {
  const selectMonth = document.getElementById('select-category-month');
  const selectCategory = document.getElementById('select-category');
  const categoryStatistic = document.getElementById('category-statistic');
  const toggleStatsButton = document.getElementById('toggle-category-stats'); // Tombol Lihat Detail (Poin E)

  if (!selectMonth || !selectCategory || !categoryStatistic || !toggleStatsButton) return; // Guard clause

  // Populate Month Options
  populateCategoryExpenseMonthOptions();

  // Populate Category Options
  populateCategoryExpenseCategoryOptions(); // Panggil tanpa argumen untuk load semua kategori awal

  // Event Listener untuk Pemilihan Bulan
  selectMonth.addEventListener('change', () => {
    const selectedOption = selectMonth.options[selectMonth.selectedIndex];
    const selectedMonth = selectedOption.value;
    const selectedYear = selectedOption.getAttribute('data-year');

    // Sembunyikan statistik saat bulan berubah
    const collapseElement = document.getElementById('category-stats-collapse');
    if (collapseElement) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement, {toggle: false});
        bsCollapse.hide();
        toggleStatsButton.innerHTML = '<i class="fas fa-info-circle me-2"></i> Lihat Detail Statistik'; // Reset teks tombol
        toggleStatsButton.setAttribute('aria-expanded', 'false');
    }


    if (selectedMonth && selectedYear) {
      populateCategoryExpenseCategoryOptions(selectedMonth, selectedYear);
      selectCategory.disabled = false;
    } else {
      // Jika "Pilih Bulan" dipilih, reset kategori
      populateCategoryExpenseCategoryOptions(); // Load semua kategori lagi
      selectCategory.innerHTML = '<option value="">Pilih Kategori</option>';
      selectCategory.disabled = true;
    }
    // Reset grafik dan statistik
    if (categoryDailyExpenseChart instanceof Chart) {
      categoryDailyExpenseChart.destroy();
      categoryDailyExpenseChart = null; // Set ke null
    }
    categoryStatistic.innerHTML = ''; // Kosongkan statistik
  });

  // Event Listener untuk Pemilihan Kategori
  selectCategory.addEventListener('change', () => {
    const selectedOption = selectMonth.options[selectMonth.selectedIndex];
    const selectedMonth = selectedOption.value;
    const selectedYear = selectedOption.getAttribute('data-year');
    const selectedCategory = selectCategory.value;

    // Sembunyikan statistik saat kategori berubah
    const collapseElement = document.getElementById('category-stats-collapse');
     if (collapseElement) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement, {toggle: false});
        bsCollapse.hide();
        toggleStatsButton.innerHTML = '<i class="fas fa-info-circle me-2"></i> Lihat Detail Statistik';
        toggleStatsButton.setAttribute('aria-expanded', 'false');
     }

    if (selectedCategory && selectedMonth && selectedYear) {
      renderCategoryDailyExpenseChart(selectedMonth, selectedYear, selectedCategory, categoryStatistic);
      toggleStatsButton.disabled = false; // Aktifkan tombol detail
    } else {
      if (categoryDailyExpenseChart instanceof Chart) {
        categoryDailyExpenseChart.destroy();
         categoryDailyExpenseChart = null; // Set ke null
      }
      categoryStatistic.innerHTML = ''; // Kosongkan statistik
      toggleStatsButton.disabled = true; // Nonaktifkan tombol detail
    }
  });

   // BARU: Event listener untuk tombol "Lihat Detail Statistik" (Poin E)
   toggleStatsButton.addEventListener('click', (e) => {
        const isExpanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
        // Toggle teks tombol berdasarkan state SETELAH klik
        e.currentTarget.innerHTML = !isExpanded
            ? '<i class="fas fa-eye-slash me-2"></i> Sembunyikan Detail'
            : '<i class="fas fa-info-circle me-2"></i> Lihat Detail Statistik';
   });
}

// Fungsi untuk Memenuhi Opsi Bulan pada Category Expense Enhanced
function populateCategoryExpenseMonthOptions() {
  const selectMonth = document.getElementById('select-category-month');
  if (!selectMonth) return;
  const currentUser = localStorage.getItem('currentUser');
  const yearMonths = new Set();

  for (let key in localStorage) {
    if (key.startsWith(`expenses_${currentUser}_`)) {
      const parts = key.split('_');
      if (parts.length === 4) {
        yearMonths.add(`${parts[2]}-${parts[3]}`); // Format: year-month
      }
    }
  }

  // Convert to array and sort descending
  const yearMonthArray = Array.from(yearMonths).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    return yearB - yearA || monthB - monthA; // Sort by year desc, then month desc
  });

  const currentSelection = selectMonth.value + '-' + selectMonth.options[selectMonth.selectedIndex]?.getAttribute('data-year'); // Simpan value & tahun
  selectMonth.innerHTML = '<option value="">Pilih Bulan</option>'; // Default

  if (yearMonthArray.length === 0) {
    selectMonth.innerHTML = '<option value="">Tidak ada data</option>';
  } else {
    yearMonthArray.forEach(ym => {
      const [year, month] = ym.split('-');
      const option = document.createElement('option');
      option.value = month; // Value adalah bulan
      option.setAttribute('data-year', year); // Simpan tahun di data attribute
      option.textContent = `${getMonthName(month)} ${year}`;
       // Cek jika ini adalah pilihan sebelumnya
       if (`${month}-${year}` === currentSelection) {
           option.selected = true;
       }
      selectMonth.appendChild(option);
    });
  }
}

// Fungsi untuk Memenuhi Opsi Kategori pada Category Expense Enhanced
function populateCategoryExpenseCategoryOptions(selectedMonth = null, selectedYear = null) {
  const selectCategory = document.getElementById('select-category');
  if (!selectCategory) return;
  const currentUser = localStorage.getItem('currentUser');
  let expenses = [];

  if (selectedMonth && selectedYear) {
    // Ambil data untuk bulan & tahun spesifik
    const expensesKey = `expenses_${currentUser}_${selectedYear}_${selectedMonth}`;
    expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
  } else {
    // Ambil SEMUA data jika tidak ada bulan/tahun dipilih (untuk inisialisasi)
    for (let key in localStorage) {
      if (key.startsWith(`expenses_${currentUser}_`)) {
        const monthExpenses = JSON.parse(localStorage.getItem(key)) || [];
        expenses = expenses.concat(monthExpenses);
      }
    }
  }

  const categories = new Set(expenses.map(exp => exp.kategori));
  const currentSelection = selectCategory.value; // Simpan pilihan saat ini
  selectCategory.innerHTML = ''; // Kosongkan

  if (categories.size === 0) {
    selectCategory.innerHTML = '<option value="">Tidak ada kategori</option>';
    selectCategory.disabled = true;
  } else {
    selectCategory.innerHTML = '<option value="">Pilih Kategori</option>';
    Array.from(categories).sort().forEach(kategori => {
      const option = document.createElement('option');
      option.value = kategori.toLowerCase();
      option.textContent = capitalizeFirstLetter(kategori);
       // Cek jika ini adalah pilihan sebelumnya
       if (kategori.toLowerCase() === currentSelection) {
           option.selected = true;
       }
      selectCategory.appendChild(option);
    });
    // Hanya disable jika TIDAK ada bulan/tahun yang dipilih
    selectCategory.disabled = !(selectedMonth && selectedYear);
  }
}

// MODIFIKASI: Fungsi Merender Grafik Harian per Kategori (Jadi Line Chart - Poin E)
function renderCategoryDailyExpenseChart(selectedMonth, selectedYear, selectedCategory, statisticDiv) {
  const currentUser = localStorage.getItem('currentUser');
  const expensesKey = `expenses_${currentUser}_${selectedYear}_${selectedMonth}`;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
  const totalExpensesMonthKey = `expenses_${currentUser}_${selectedYear}_${selectedMonth}`; // Key yang sama
  const totalExpensesInMonth = JSON.parse(localStorage.getItem(totalExpensesMonthKey)) || [];

  // Filter expenses by category
  const filteredExpenses = expenses.filter(exp => exp.kategori.toLowerCase() === selectedCategory.toLowerCase());

  // Mengelompokkan pengeluaran berdasarkan tanggal
  const grouped = filteredExpenses.reduce((acc, exp) => {
    const dateObj = new Date(exp.date);
    if (isNaN(dateObj.getTime())) return acc;
    const formattedDate = dateObj.toLocaleDateString('id-ID');
    acc[formattedDate] = (acc[formattedDate] || 0) + exp.amount;
    return acc;
  }, {});

  const allDates = getAllDatesInMonth(selectedYear, selectedMonth);
  const labels = allDates.map(date => date.toLocaleDateString('id-ID'));
  const data = allDates.map(date => {
    const formattedDate = date.toLocaleDateString('id-ID');
    return grouped[formattedDate] || 0;
  });

  const ctx = document.getElementById('category-daily-chart')?.getContext('2d');
  if (!ctx) return; // Guard clause

  // Destroy chart sebelumnya jika ada
  if (categoryDailyExpenseChart instanceof Chart) {
    categoryDailyExpenseChart.destroy();
    categoryDailyExpenseChart = null;
  }

  categoryDailyExpenseChart = new Chart(ctx, {
    type: 'line', // <-- UBAH KE LINE CHART (Poin E)
    data: {
      labels: labels,
      datasets: [{
        label: `Pengeluaran Harian (${capitalizeFirstLetter(selectedCategory)})`,
        data: data,
        fill: true, // Beri area fill
        backgroundColor: 'rgba(75, 0, 130, 0.2)',
        borderColor: '#4b0082',
        tension: 0.4, // Buat garis lebih melengkung
        pointBackgroundColor: '#4b0082',
        pointBorderColor: '#4b0082',
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }, // Sembunyikan legend
        title: {
          display: true,
          text: `Grafik Harian Kategori ${capitalizeFirstLetter(selectedCategory)} (${capitalizeFirstLetter(getMonthName(selectedMonth))} ${selectedYear})`,
          color: '#333333'
        },
        tooltip: {
            callbacks: { label: (c) => `Rp${c.parsed.y.toLocaleString('id-ID')}` }
        }
      },
      scales: {
        x: { ticks: { color: '#333333' }, grid: { color: '#e0e0e0' }, title: { display: true, text: 'Tanggal' } },
        y: { ticks: { color: '#333333' }, grid: { color: '#e0e0e0' }, title: { display: true, text: 'Jumlah (Rp)' } }
      },
      // Klik tidak melakukan apa-apa (zoom via tombol)
      onClick: null,
      onHover: null
    },
  });

  // Menampilkan Statistik (dipanggil setelah chart render) - Poin E
  displayCategoryStatistic(filteredExpenses, totalExpensesInMonth, selectedCategory, statisticDiv);
}

// MODIFIKASI: Fungsi Menampilkan Statistik Kategori Enhanced (Poin E)
function displayCategoryStatistic(categoryExpenses, totalMonthExpenses, kategori, statisticDiv) {
   if (!statisticDiv) return; // Guard clause
   
  if (categoryExpenses.length === 0) {
    statisticDiv.innerHTML = '<p class="text-center text-muted">Tidak ada data pengeluaran untuk kategori ini pada bulan yang dipilih.</p>';
    return;
  }

  // 1. Total Pengeluaran Kategori
  const totalKategori = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 2. Kontribusi Pengeluaran (%)
  const totalBulan = totalMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const kontribusi = totalBulan > 0 ? ((totalKategori / totalBulan) * 100).toFixed(1) : 0;

  // 3. Rata-rata Pengeluaran Kategori Harian
  const daysWithCategoryExpenses = new Set(categoryExpenses.map(exp => {
      const dateObj = new Date(exp.date);
      return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID') : null;
  })).size;
  const avgKategoriHarian = daysWithCategoryExpenses > 0 ? (totalKategori / daysWithCategoryExpenses) : 0;

  // 4. Pengeluaran Harian Tertinggi (untuk kategori ini)
   const groupedDailyCategory = categoryExpenses.reduce((acc, exp) => {
    const dateObj = new Date(exp.date);
    if (isNaN(dateObj.getTime())) return acc;
    const formattedDate = dateObj.toLocaleDateString('id-ID');
    acc[formattedDate] = (acc[formattedDate] || 0) + exp.amount;
    return acc;
  }, {});
  const maxDailyAmount = Math.max(...Object.values(groupedDailyCategory), 0);
  const maxDailyDate = Object.keys(groupedDailyCategory).find(date => groupedDailyCategory[date] === maxDailyAmount) || '-';

  // Format Statistik BARU (Mirip Pengeluaran Harian)
  const statsHtml = `
    <ul class="list-group">
        <li class="list-group-item">
            <div><i class="fas fa-wallet me-2 text-primary"></i>Total Kategori ${capitalizeFirstLetter(kategori)}</div>
            <div><span class="badge bg-primary rounded-pill">Rp${totalKategori.toLocaleString('id-ID')}</span></div>
        </li>
        <li class="list-group-item">
            <div><i class="fas fa-chart-pie me-2 text-info"></i>Kontribusi</div>
            <div><span class="badge bg-info rounded-pill">${kontribusi}%</span></div>
        </li>
        <li class="list-group-item">
            <div><i class="fas fa-calculator me-2 text-secondary"></i>Rata-rata Harian Kategori</div>
            <div><span class="badge bg-secondary rounded-pill">Rp${Math.round(avgKategoriHarian).toLocaleString('id-ID')}</span></div>
        </li>
        <li class="list-group-item">
            <div><i class="fas fa-arrow-trend-up me-2 text-danger"></i>Pengeluaran Harian Tertinggi</div>
            <div><span class="badge bg-danger rounded-pill">Rp${maxDailyAmount.toLocaleString('id-ID')} <small>(${maxDailyDate})</small></span></div>
        </li>
    </ul>
  `;
  statisticDiv.innerHTML = statsHtml;
}

// Fungsi untuk Menginisialisasi Tahun untuk Riwayat
function initializeHistoryYearOptions() {
  const historyYearSelect = document.getElementById('history-year');
  if (!historyYearSelect) return; // Guard clause
  const currentUser = localStorage.getItem('currentUser');
  const years = new Set();

  for (let key in localStorage) {
    if (key.startsWith(`expenses_${currentUser}_`)) {
      const parts = key.split('_');
      if (parts.length === 4) { // expenses_user_year_month
        years.add(parts[2]);
      }
    }
  }

  const currentSelection = historyYearSelect.value; // Simpan pilihan saat ini
  historyYearSelect.innerHTML = ''; // Kosongkan

  if (years.size === 0) {
    historyYearSelect.innerHTML = '<option value="">Tidak ada riwayat</option>';
  } else {
    historyYearSelect.innerHTML = '<option value="">Pilih Tahun</option>';
    Array.from(years).sort((a,b) => b - a).forEach(year => { // Sort descending
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      historyYearSelect.appendChild(option);
    });
  }

  historyYearSelect.value = currentSelection; // Coba set ke pilihan lama
  if (!historyYearSelect.value) { // Jika pilihan lama tidak ada lagi atau belum dipilih
      populateHistoryMonthOptions(null); // Reset bulan
      document.getElementById('history-content').innerHTML = '<p>Silakan pilih tahun dan bulan untuk melihat riwayat pengeluaran.</p>'; // Reset konten
  } else {
       // Jika tahun sudah terpilih, populate bulan
       populateHistoryMonthOptions(historyYearSelect.value);
  }


  historyYearSelect.removeEventListener('change', historyYearChangeListener); // Hapus listener lama
  historyYearSelect.addEventListener('change', historyYearChangeListener); // Tambah listener baru
}

function historyYearChangeListener() {
    const selectedYear = document.getElementById('history-year').value;
    populateHistoryMonthOptions(selectedYear);
    // Reset konten jika tahun diubah
    const historyContent = document.getElementById('history-content');
    if (historyContent) historyContent.innerHTML = '<p>Silakan pilih tahun dan bulan untuk melihat riwayat pengeluaran.</p>';
}

// Fungsi untuk Menginisialisasi Tahun untuk Cetak Rekap
function initializePrintYearOptions() {
  const printYearSelect = document.getElementById('print-year');
   if (!printYearSelect) return; // Guard clause
  const currentUser = localStorage.getItem('currentUser');
  const years = new Set();

  for (let key in localStorage) {
    if (key.startsWith(`expenses_${currentUser}_`)) {
      const parts = key.split('_');
      if (parts.length === 4) { // expenses_user_year_month
        years.add(parts[2]);
      }
    }
  }

  const currentSelection = printYearSelect.value; // Simpan pilihan saat ini
  printYearSelect.innerHTML = ''; // Kosongkan

  if (years.size === 0) {
    printYearSelect.innerHTML = '<option value="">Tidak ada riwayat</option>';
  } else {
    printYearSelect.innerHTML = '<option value="">Pilih Tahun</option>';
    Array.from(years).sort((a,b) => b - a).forEach(year => { // Sort descending
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      printYearSelect.appendChild(option);
    });
  }

  printYearSelect.value = currentSelection; // Coba set ke pilihan lama
  if (!printYearSelect.value) {
      populatePrintMonthOptions(null); // Reset bulan
  } else {
      populatePrintMonthOptions(printYearSelect.value); // Populate bulan jika tahun ada
  }

  printYearSelect.removeEventListener('change', printYearChangeListener); // Hapus listener lama
  printYearSelect.addEventListener('change', printYearChangeListener); // Tambah listener baru
}

function printYearChangeListener() {
    const selectedYear = document.getElementById('print-year').value;
    populatePrintMonthOptions(selectedYear);
}

// Fungsi untuk Menginisialisasi Dropdown Bulan pada Riwayat
function populateHistoryMonthOptions(selectedYear) {
  const historyMonthSelect = document.getElementById('history-month');
   if (!historyMonthSelect) return; // Guard clause
  const currentUser = localStorage.getItem('currentUser');
  const months = [];

  const currentSelection = historyMonthSelect.value; // Simpan pilihan bulan
  historyMonthSelect.innerHTML = ''; // Kosongkan

  if (!selectedYear) {
    historyMonthSelect.innerHTML = '<option value="">Pilih Tahun Dulu</option>';
    return;
  }

  for (let i = 1; i <= 12; i++) {
    const key = `expenses_${currentUser}_${selectedYear}_${i}`;
    if (localStorage.getItem(key)) {
      months.push(i);
    }
  }

  if (months.length === 0) {
    historyMonthSelect.innerHTML = '<option value="">Tidak ada riwayat</option>';
  } else {
    historyMonthSelect.innerHTML = '<option value="">Pilih Bulan</option>';
    // Sort bulan secara descending
    months.sort((a, b) => b - a).forEach(month => {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = getMonthName(month);
       // Coba set ke pilihan lama
       if (month == currentSelection) {
           option.selected = true;
       }
      historyMonthSelect.appendChild(option);
    });
  }
   
   // Jika ada pilihan bulan sebelumnya dan bulan itu ada, panggil render
   if (historyMonthSelect.value) {
       renderHistoryContent();
   }


  historyMonthSelect.removeEventListener('change', renderHistoryContent); // Hapus listener lama
  historyMonthSelect.addEventListener('change', renderHistoryContent); // Tambah listener baru
}

// Fungsi untuk Menginisialisasi Dropdown Bulan pada Cetak Rekap
function populatePrintMonthOptions(selectedYear) {
  const printMonthSelect = document.getElementById('print-month');
  if (!printMonthSelect) return; // Guard clause
  const currentUser = localStorage.getItem('currentUser');
  const months = [];

  const currentSelection = printMonthSelect.value; // Simpan pilihan bulan
  printMonthSelect.innerHTML = ''; // Kosongkan

  if (!selectedYear) {
    printMonthSelect.innerHTML = '<option value="">Pilih Tahun Dulu</option>';
    return;
  }

  for (let i = 1; i <= 12; i++) {
    const key = `expenses_${currentUser}_${selectedYear}_${i}`;
    if (localStorage.getItem(key)) {
      months.push(i);
    }
  }

  if (months.length === 0) {
    printMonthSelect.innerHTML = '<option value="">Tidak ada riwayat</option>';
  } else {
    printMonthSelect.innerHTML = '<option value="">Pilih Bulan</option>';
    // Sort bulan secara descending
    months.sort((a, b) => b - a).forEach(month => {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = getMonthName(month);
      // Coba set ke pilihan lama
       if (month == currentSelection) {
           option.selected = true;
       }
      printMonthSelect.appendChild(option);
    });
  }
}

// Fungsi untuk Mendapatkan Semua Tanggal dalam Bulan Tertentu
function getAllDatesInMonth(year, month) {
  const date = new Date(year, month - 1, 1);
  const dates = [];
  while (date.getMonth() === month - 1) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

/**
 * ==========================================================
 * FUNGSI UNTUK DIGANTI: (Ganti fungsi lama Anda dengan ini)
 * ==========================================================
 * Fungsi untuk Menghasilkan Palet Warna Terang (Diperbanyak jadi 40)
 * @param {number} num - Jumlah warna yang dibutuhkan (meskipun array ini berisi 40)
 * @returns {Array} - Array berisi kode warna hex
 */
function generateBrightColorPalette(num) {
  const palette = [];
  // --- DAFTAR WARNA DIPERBANYAK MENJADI 40 ---
  const predefinedColors = [
    // Original 10 + Expanded 15 = 25 colors
    '#4b0082', // 1. Ungu Gelap
    '#E91E63', // 2. Pink Cerah
    '#FF9800', // 3. Oranye
    '#20c997', // 4. Hijau Mint
    '#03A9F4', // 5. Biru Langit
    '#FBC02D', // 6. Kuning Mustard
    '#e63946', // 7. Merah Terang
    '#9C27B0', // 8. Ungu Terong
    '#4CAF50', // 9. Hijau Daun
    '#2196F3', // 10. Biru Cerah
    '#FF5722', // 11. Oranye Tua
    '#8BC34A', // 12. Hijau Muda
    '#00BCD4', // 13. Cyan
    '#673AB7', // 14. Ungu Violet
    '#CDDC39', // 15. Hijau Limau
    '#FFEB3B', // 16. Kuning Cerah
    '#795548', // 17. Coklat
    '#009688', // 18. Teal
    '#FFC107', // 19. Amber
    '#607D8B', // 20. Abu Kebiruan
    '#EC407A', // 21. Pink Medium
    '#FFEE58', // 22. Kuning Pucat
    '#9CCC65', // 23. Hijau Apel
    '#29B6F6', // 24. Biru Langit Cerah
    '#AB47BC', // 25. Ungu Anggrek
    '#FFA726', // 26. Oranye Aprikot
    '#7E57C2', // 27. Ungu Lavender Tua
    '#EF5350', // 28. Merah Bata Muda
    '#66BB6A', // 29. Hijau Laut Medium
    '#42A5F5', // 30. Biru Dodger Medium
    '#FF7043', // 31. Oranye Koral
    '#D4E157', // 32. Hijau Limau Terang
    '#26C6DA', // 33. Cyan Terang
    '#BDBDBD', // 34. Abu-abu Medium
    '#8D6E63', // 35. Coklat Muda
    '#5C6BC0', // 36. Biru Indigo Muda
    '#D81B60', // 37. Magenta Tua
    '#FDD835', // 38. Kuning Lemon
    '#00897B', // 39. Teal Tua
    '#C2185B'  // 40. Pink Tua
  ];
  // --- AKHIR DAFTAR WARNA ---

  // Logika untuk mengambil warna tetap sama (modulo)
  for (let i = 0; i < num; i++) {
    palette.push(predefinedColors[i % predefinedColors.length]);
  }
  return palette;
}

// Fungsi untuk Mendapatkan Bulan Saat Ini dalam Format Angka
function getCurrentMonth() {
  const now = new Date();
  return now.getMonth() + 1; // Januari = 1
}

// Fungsi untuk Mendapatkan Tahun Saat Ini
function getCurrentYear() {
  const now = new Date();
  return now.getFullYear();
}

// Fungsi untuk Mendapatkan Nama Bulan Berdasarkan Angka
function getMonthName(monthNumber) {
   if (!monthNumber || monthNumber < 1 || monthNumber > 12) return ''; // Handle invalid input
  const date = new Date();
  // Set ke tanggal 1 bulan itu untuk menghindari masalah tanggal 31
  date.setDate(1); 
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('id-ID', { month: 'long' });
}

// Fungsi untuk Capitalize First Letter
function capitalizeFirstLetter(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/\b\w/g, char => char.toUpperCase());
}

// Fungsi untuk Memperbarui Opsi Kategori Dropdown pada Category Expense
function updateCategoryDropdownOptions() {
  // Panggil fungsi populate yang lebih spesifik
  populateCategoryExpenseCategoryOptions();
}

// Fungsi untuk Inisialisasi Menu Event Listeners (Kosong, karena sudah di initializeApp)
function initializeMenuEventListeners() {
  // Event listeners dipindahkan ke initializeApp()
}

// Fungsi untuk Menampilkan Tips Modal
function showTipsModal(message) {
  const tipsModalContent = document.querySelector('#tipsModal .modal-body');
  if(tipsModalContent) {
      tipsModalContent.textContent = message;
  }
  // Pastikan instance modal sudah ada atau buat baru jika perlu
  const tipsModalEl = document.getElementById('tipsModal');
  if(tipsModalEl) {
      const tipsModal = bootstrap.Modal.getOrCreateInstance(tipsModalEl);
      tipsModal.show();
  }
}

// --- BARU: Fitur Ekspor Excel (Poin D) ---

// Fungsi utama untuk menangani ekspor Excel
function handleExportExcel() {
    showLoading("Mengumpulkan data..."); // Tampilkan loading
    setTimeout(() => { // Beri jeda agar UI loading sempat tampil
        try {
            const allExpenses = getAllUserExpenses();
            if (allExpenses.length === 0) {
                showNotification("Tidak ada data pengeluaran untuk diekspor.", "warning");
                hideLoading();
                return;
            }
            
            showLoading("Memproses dataset...");
            const excelData = transformDataForExcel(allExpenses);
            
            showLoading("Membuat file Excel...");
            generateExcelFile(excelData);
            
            hideLoading();
            showNotification("File Excel berhasil dibuat!", "success");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            hideLoading();
            showNotification("Terjadi kesalahan saat membuat file Excel.", "danger");
        }
    }, 500); // Jeda 0.5 detik
}

// Fungsi untuk mengumpulkan semua data expense pengguna dari localStorage
function getAllUserExpenses() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return [];
    
    let allExpenses = [];
    for (let key in localStorage) {
        if (key.startsWith(`expenses_${currentUser}_`)) {
            const monthExpenses = JSON.parse(localStorage.getItem(key)) || [];
            allExpenses = allExpenses.concat(monthExpenses);
        }
    }
    // Urutkan berdasarkan tanggal (terlama ke terbaru)
    allExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    return allExpenses;
}

// Fungsi untuk mengubah data expense menjadi format Excel yang diinginkan
// Fungsi untuk mengubah data expense menjadi format Excel yang diinginkan
function transformDataForExcel(expenses) {
    return expenses.map((exp, index) => {
        const dateObj = new Date(exp.date);
        // Panggil getDateParts yang sudah diperbarui untuk mendapatkan tahun dan jam
        const { tanggal, bulan, mingguKe, bagianBulan, tahun, jam } = getDateParts(dateObj); // Ambil tahun & jam
        const namaHari = getNamaHari(dateObj);
        const jenisHari = getJenisHari(namaHari);
        const bagianHari = getBagianHari(dateObj);

        // Urutan kolom baru: No, Item, Kategori, Harga, Tanggal, Jam, Hari, Jenis Hari, Bagian Hari, Minggu, Bulan, Bagian Bulan, Tahun
        return {
            "No": index + 1,
            "Nama Item": capitalizeFirstLetter(exp.barang),
            "Kategori": capitalizeFirstLetter(exp.kategori),
            "Tahun": tahun,// Pindahkan harga
            "Tanggal": tanggal,
            "Jam": jam,                      // <-- Kolom Jam ditambahkan
            "Nama Hari": namaHari,
            "Jenis Hari": jenisHari,
            "Bagian Hari": bagianHari,
            "Minggu ke-": mingguKe,
            "Bulan": bulan,
            "Bagian Bulan": bagianBulan,
            "Tahun": tahun,
            "Harga": exp.amount                              // <-- Kolom Tahun ditambahkan
            // "Sumber_Dana": Sudah Dihapus
        };
    });
}

// Fungsi untuk membuat dan mengunduh file Excel menggunakan SheetJS
function generateExcelFile(data) {
    // Buat worksheet dari array of objects
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Buat workbook baru
    const workbook = XLSX.utils.book_new();
    
    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pengeluaran"); // Nama sheet

    // Atur lebar kolom (opsional, tapi bagus untuk tampilan)
    // Dapatkan array lebar kolom berdasarkan panjang header atau data terpanjang
     const colWidths = Object.keys(data[0]).map(key => {
         const headerLength = key.length;
         const dataLengths = data.map(row => String(row[key] || '').length);
         const maxLength = Math.max(headerLength, ...dataLengths);
         return { wch: maxLength + 2 }; // Tambah padding
     });
     worksheet["!cols"] = colWidths;


    // Buat file Excel dan trigger download
    // Nama file: Dataset_Pengeluaran_YYYYMMDD_HHMM.xlsx
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const fileName = `Dataset_Pengeluaran_Mumy_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

// --- Helper Functions untuk Ekspor Excel ---

// Mendapatkan bagian-bagian tanggal
// Mendapatkan bagian-bagian tanggal, termasuk Tahun dan Jam
function getDateParts(dateObj) {
     if (isNaN(dateObj.getTime())) {
         // Kembalikan nilai default untuk semua bagian jika tanggal tidak valid
         return { tanggal: '-', bulan: '-', mingguKe: '-', bagianBulan: '-', tahun: '-', jam: '-' };
     }
    const tanggal = dateObj.getDate(); // 1-31
    const bulan = dateObj.getMonth() + 1; // 1-12
    const tahun = dateObj.getFullYear(); // <-- Ambil Tahun
    // Format Jam menjadi HH:MM (24 jam)
    const jam = dateObj.getHours().toString(); //

    const mingguKe = Math.ceil(tanggal / 7); // Minggu ke- (1-5)

    let bagianBulan;
    if (tanggal <= 10) bagianBulan = "Awal Bulan";
    else if (tanggal <= 20) bagianBulan = "Tengah Bulan";
    else bagianBulan = "Akhir Bulan";

    // Kembalikan semua nilai termasuk tahun dan jam
    return { tanggal, bulan, mingguKe, bagianBulan, tahun, jam };
}

// Mendapatkan Nama Hari
function getNamaHari(dateObj) {
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
}

// Mendapatkan Jenis Hari (Weekday/Weekend)
function getJenisHari(namaHari) {
    if (namaHari === "Sabtu" || namaHari === "Minggu") {
        return "Weekend";
    } else if (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(namaHari)){
        return "Weekday";
    } else {
        return '-';
    }
}

// Mendapatkan Bagian Hari (Pagi/Siang/Sore/Malam)
function getBagianHari(dateObj) {
     if (isNaN(dateObj.getTime())) return '-';
    const jam = dateObj.getHours(); // 0-23
    if (jam >= 5 && jam < 12) return "Pagi";
    if (jam >= 12 && jam < 15) return "Siang";
    if (jam >= 15 && jam < 19) return "Sore";
    return "Malam"; // (19 - 4)
}

// Mendapatkan Minggu ke- dalam bulan (Sudah ada di getDateParts)
// function getMingguKe(dateObj) { ... }

// Mendapatkan Bagian Bulan (Sudah ada di getDateParts)
// function getBagianBulan(tanggal) { ... }

// --- Akhir Helper Excel ---