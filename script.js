    document.addEventListener('DOMContentLoaded', () => {
      // Menampilkan Splash Screen dan Loading Screen
      setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'flex';
        setTimeout(() => {
          document.getElementById('loading-screen').style.display = 'none';
          // Cek apakah pengguna sudah login
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            showWelcomeScreen(currentUser);
          } else {
            showAuthContainer();
          }
        }, 3000);
      }, 3000);

      // Toggle Password Visibility
      const togglePassword = document.getElementById('toggle-password');
      const authPasswordInput = document.getElementById('auth-password');
      togglePassword.addEventListener('click', () => {
        const type = authPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        authPasswordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye-slash');
      });

      // Handle Auth Button Click (Login/Register)
      const authBtn = document.getElementById('auth-btn');
      authBtn.addEventListener('click', () => {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value.trim();
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

      // Handle Switch to Register
      const switchToRegister = document.getElementById('switch-to-register');
      switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = false;
        switchToRegisterForm();
      });

      // Handle Switch to Login
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
          showTipsModal("Ubah ponsel ke mode dekstop untuk melihat grafik dan diagram pengeluaran dengan jelas.");
        });
      }

      if (categoryTipsButton) {
        categoryTipsButton.addEventListener('click', () => {
          showTipsModal("Tekan diagram untuk melihat komposisi barang pada kategori tersebut.");
        });
      }

      // Initialize Event Listeners untuk Menu
      initializeMenuEventListeners();
    });

    // Status autentikasi
    let isLogin = true;

    // Chart Instances
    let dailyExpenseChart;
    let categoryExpenseChart;
    let categoryDailyExpenseChart; // New chart for category daily expenses
    let historyDailyExpenseChart;
    let historyCategoryExpenseChart;

    // Fungsi untuk Menampilkan Auth Container
    function showAuthContainer() {
      const authContainer = document.getElementById('auth-container');
      authContainer.style.display = 'block';
      document.body.style.backgroundColor = '#4b0082'; // Warna ungu gelap
    }

    // Fungsi untuk Beralih ke Form Registrasi
    function switchToRegisterForm() {
      const authTitle = document.getElementById('auth-title');
      const authBtn = document.getElementById('auth-btn');
      const authSwitchLink = document.getElementById('auth-switch-link');

      authTitle.textContent = 'Register';
      authBtn.textContent = 'Register';
      authSwitchLink.innerHTML = 'Sudah punya akun? <a href="#" id="switch-to-login">Login di sini</a>';
    }

    // Fungsi untuk Beralih ke Form Login
    function switchToLoginForm() {
      const authTitle = document.getElementById('auth-title');
      const authBtn = document.getElementById('auth-btn');
      const authSwitchLink = document.getElementById('auth-switch-link');

      authTitle.textContent = 'Log in';
      authBtn.textContent = 'Login';
      authSwitchLink.innerHTML = 'Belum punya akun? <a href="#" id="switch-to-register">Register di sini</a>';
    }

    // Fungsi untuk Menampilkan Notifikasi
    function showNotification(message, type) {
      const notificationContainer = document.getElementById('notification-container');
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
      const loadingText = loadingScreen.querySelector('.loading-text');
      loadingText.textContent = text;
      loadingScreen.style.display = 'flex';
    }

    // Fungsi untuk Menyembunyikan Loading Screen
    function hideLoading() {
      const loadingScreen = document.getElementById('loading-screen');
      loadingScreen.style.display = 'none';
    }

    // Fungsi untuk Menampilkan Aplikasi Utama
    function showApp() {
      const authContainer = document.getElementById('auth-container');
      authContainer.style.display = 'none';
      const appContainer = document.getElementById('app-container');
      appContainer.style.display = 'block';
      document.body.style.backgroundColor = '#f4f6f9'; // Set body background ke #f4f6f9
      initializeApp();
    }

    // Fungsi untuk Menampilkan Welcome Screen
    function showWelcomeScreen(email) {
      const welcomeScreen = document.getElementById('welcome-screen');
      welcomeScreen.style.display = 'flex';

      // Jalankan animasi typewriter
      const welcomeText = document.getElementById('welcome-text');
      const fullText = "Meraih Masa Depan Sukses Bersama Beasiswa Unggulan dengan Menjadi Insan Cerdas dan Kompetitif.";
      welcomeText.textContent = ''; // Kosongkan teks sebelum animasi
      typeWriter(welcomeText, fullText, 30, () => {
        // Setelah teks selesai ditulis, tunggu 2 detik dan tampilkan app
        setTimeout(() => {
          welcomeScreen.style.display = 'none';
          showApp();
        }, 2000);
      });
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

    // Fungsi untuk Inisialisasi Aplikasi
    function initializeApp() {
      // Attach Event Listeners untuk Menu
      document.getElementById('menu-add-expense').addEventListener('click', () => showSection('add-expense-section'));
      document.getElementById('menu-daily-expense').addEventListener('click', () => showSection('daily-expense-section'));
      document.getElementById('menu-category-expense').addEventListener('click', () => showSection('category-expense-section'));
      document.getElementById('menu-print-expense').addEventListener('click', () => showSection('print-expense-section'));
      document.getElementById('menu-history-expense').addEventListener('click', () => showSection('history-expense-section'));

      // Back to Dashboard Buttons
      document.getElementById('back-to-dashboard').addEventListener('click', () => showSection('dashboard-section'));
      document.getElementById('back-to-dashboard-2').addEventListener('click', () => showSection('dashboard-section'));
      document.getElementById('back-to-dashboard-3').addEventListener('click', () => showSection('dashboard-section'));
      document.getElementById('back-to-dashboard-4').addEventListener('click', () => showSection('dashboard-section'));
      document.getElementById('back-to-dashboard-5').addEventListener('click', () => showSection('dashboard-section'));

      // Logout Button
      document.getElementById('logout-btn').addEventListener('click', handleLogout);

      // Handle Add Expense Form Submission
      const expenseForm = document.getElementById('expense-form');
      expenseForm.addEventListener('submit', handleAddExpense);

      // Handle Print Form Submission
      const printForm = document.getElementById('print-expense-form');
      printForm.addEventListener('submit', handlePrintExpense);

      // Initialize History Year and Month Options
      initializeHistoryYearOptions();

      // Initialize Print Year and Month Options
      initializePrintYearOptions();

      // Render Initial Charts if Login Persisted
      renderDashboard();

      // Handle Kategori Dropdown
      const kategoriButton = document.getElementById('kategori-button');
      const categoryOptions = document.getElementById('category-options');
      const addNewCategoryBtn = document.getElementById('add-new-category');
      const addCategoryInput = document.getElementById('add-category-input');
      const saveNewCategoryBtn = document.getElementById('save-new-category');
      const newCategoryInput = document.getElementById('new-category-input');

      kategoriButton.addEventListener('click', () => {
        categoryOptions.classList.toggle('show');
      });

      // Handle Category Selection
      categoryOptions.querySelectorAll('button[data-category]').forEach(button => {
        button.addEventListener('click', () => {
          const selectedCategory = button.getAttribute('data-category');
          if (button.id === 'add-new-category') {
            addCategoryInput.style.display = 'block';
          } else {
            document.getElementById('kategori-selected').value = selectedCategory;
            kategoriButton.innerHTML = `${capitalizeFirstLetter(selectedCategory)} <i class="fas fa-chevron-down float-end"></i>`;
            categoryOptions.classList.remove('show');
          }
        });
      });

      // Handle Add New Category
      saveNewCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory) {
          // Tambahkan kategori baru ke dropdown
          const newButton = document.createElement('button');
          newButton.type = 'button';
          newButton.setAttribute('data-category', newCategory.toLowerCase());
          newButton.textContent = capitalizeFirstLetter(newCategory);
          categoryOptions.insertBefore(newButton, addNewCategoryBtn);

          // Attach event listener ke tombol baru
          newButton.addEventListener('click', () => {
            const selectedCategory = newButton.getAttribute('data-category');
            document.getElementById('kategori-selected').value = selectedCategory;
            kategoriButton.innerHTML = `${capitalizeFirstLetter(selectedCategory)} <i class="fas fa-chevron-down float-end"></i>`;
            categoryOptions.classList.remove('show');
          });

          // Set kategori yang dipilih
          document.getElementById('kategori-selected').value = newCategory.toLowerCase();
          kategoriButton.innerHTML = `${capitalizeFirstLetter(newCategory)} <i class="fas fa-chevron-down float-end"></i>`;
          categoryOptions.classList.remove('show');
          addCategoryInput.style.display = 'none';
          newCategoryInput.value = '';
          showNotification(`Kategori "${capitalizeFirstLetter(newCategory)}" berhasil ditambahkan.`, 'success');
        }
      });

      // Initialize Tips Modal Close Event
      const tipsModal = new bootstrap.Modal(document.getElementById('tipsModal'));

      // Initialize Category Expense Enhanced Features
      initializeCategoryExpenseEnhanced();
    }

    // Fungsi untuk Menampilkan Section yang Dipilih
    function showSection(sectionId) {
      const sections = document.querySelectorAll('.section');
      sections.forEach(section => {
        if (section.id === sectionId) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });

      // Render Charts sesuai Section
      if (sectionId === 'daily-expense-section') {
        renderDailyExpenseChart();
      } else if (sectionId === 'category-expense-section') {
        renderCategoryExpenseChart();
      } else if (sectionId === 'history-expense-section') {
        // Grafik akan dirender saat pengguna memilih tahun dan bulan
      } else if (sectionId === 'print-expense-section') {
        // Print Content akan diisi setelah memilih tahun dan bulan
      }

      // Tampilkan atau sembunyikan tombol logout
      toggleLogoutButton(sectionId);
    }

    // Fungsi untuk Menampilkan atau Menyembunyikan Tombol Logout
    function toggleLogoutButton(sectionId) {
      const logoutBtn = document.getElementById('logout-btn');
      if (sectionId === 'dashboard-section') {
        logoutBtn.classList.add('visible');
      } else {
        logoutBtn.classList.remove('visible');
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

    // Fungsi untuk Menangani Penambahan Pengeluaran
    function handleAddExpense(e) {
      e.preventDefault();
      const barang = document.getElementById('barang').value.trim();
      const amountInput = document.getElementById('amount');
      let amount = parseFloat(amountInput.value.trim());
      const kategori = document.getElementById('kategori-selected') ? document.getElementById('kategori-selected').value.trim() : '';
      const currentUser = localStorage.getItem('currentUser');

      if (barang && amount && kategori) {
        const expense = {
          id: Date.now(),
          barang,
          kategori,
          amount: amount,
          date: new Date().toISOString()
        };

        const currentMonth = getCurrentMonth();
        const currentYear = getCurrentYear();
        const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
        const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

        // Cek barang dan kategori sama, tambahkan jumlah
        const existingExpenseIndex = expenses.findIndex(exp => exp.barang.toLowerCase() === barang.toLowerCase() && exp.kategori.toLowerCase() === kategori.toLowerCase());
        if (existingExpenseIndex !== -1) {
          expenses[existingExpenseIndex].amount += expense.amount;
        } else {
          expenses.push(expense);
        }

        localStorage.setItem(expensesKey, JSON.stringify(expenses));
        showNotification('Pengeluaran berhasil ditambahkan!', 'success');
        document.getElementById('expense-form').reset();
        // Reset kategori button text
        const kategoriButton = document.getElementById('kategori-button');
        kategoriButton.innerHTML = `Pilih Kategori <i class="fas fa-chevron-down float-end"></i>`;
        document.getElementById('kategori-selected').value = '';
        renderExpensesList();
        renderDailyExpenseChart();
        renderCategoryExpenseChart();
        // Update category dropdown options if necessary
        updateCategoryDropdownOptions();
      } else {
        showNotification('Silakan isi semua bidang dengan benar.', 'danger');
      }
    }

    // Fungsi untuk Merender Daftar Pengeluaran
    function renderExpensesList() {
      const currentUser = localStorage.getItem('currentUser');
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
      const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      const expensesUl = document.getElementById('expenses-ul');
      expensesUl.innerHTML = '';

      // Mengelompokkan pengeluaran berdasarkan kategori
      const groupedByCategory = expenses.reduce((acc, exp) => {
        acc[exp.kategori] = acc[exp.kategori] || [];
        acc[exp.kategori].push(exp);
        return acc;
      }, {});

      for (let [kategori, items] of Object.entries(groupedByCategory)) {
        const kategoriLi = document.createElement('li');
        kategoriLi.innerHTML = `
          <span>${capitalizeFirstLetter(kategori)}</span>
          <i class="fas fa-chevron-down toggle-category" data-kategori="${kategori}"></i>
        `;
        expensesUl.appendChild(kategoriLi);

        // Create sublist for items
        const subUl = document.createElement('ul');
        subUl.classList.add('ms-3', 'mt-2', 'mb-2', 'd-none');
        items.forEach(exp => {
          const itemLi = document.createElement('li');
          itemLi.innerHTML = `
            <span>${capitalizeFirstLetter(exp.barang)}: Rp${exp.amount.toLocaleString('id-ID')}</span>
            <i class="fas fa-trash" data-category="${kategori}" data-barang="${exp.barang}" title="Hapus Pengeluaran"></i>
          `;
          subUl.appendChild(itemLi);
        });
        expensesUl.appendChild(subUl);
      }

      // Attach Event Listeners untuk Toggle Kategori
      document.querySelectorAll('.toggle-category').forEach(icon => {
        icon.addEventListener('click', (e) => {
          const kategori = e.target.getAttribute('data-kategori');
          const subUl = e.target.parentElement.nextElementSibling;
          subUl.classList.toggle('d-none');
          e.target.classList.toggle('fa-chevron-down');
          e.target.classList.toggle('fa-chevron-up');
        });
      });

      // Attach Event Listeners untuk Hapus Pengeluaran
      document.querySelectorAll('i.fa-trash').forEach(icon => {
        icon.addEventListener('click', handleDeleteExpense);
      });
    }

    // Fungsi untuk Menangani Penghapusan Pengeluaran
    function handleDeleteExpense(e) {
      const kategori = e.target.getAttribute('data-category');
      const barang = e.target.getAttribute('data-barang');
      const currentUser = localStorage.getItem('currentUser');
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
      let expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      expenses = expenses.filter(exp => !(exp.barang.toLowerCase() === barang.toLowerCase() && exp.kategori.toLowerCase() === kategori.toLowerCase()));
      localStorage.setItem(expensesKey, JSON.stringify(expenses));
      showNotification(`Pengeluaran "${capitalizeFirstLetter(barang)}" pada kategori "${capitalizeFirstLetter(kategori)}" telah dihapus.`, 'success');
      renderExpensesList();
      renderDailyExpenseChart();
      renderCategoryExpenseChart();
      // Jika riwayat saat ini terbuka, perbarui grafik riwayat juga
      const activeSection = document.querySelector('.section.active');
      if (activeSection && activeSection.id === 'history-expense-section') {
        renderHistoryContent();
      }
      // Update category dropdown options if necessary
      updateCategoryDropdownOptions();
    }

    // Fungsi untuk Merender Grafik Pengeluaran Harian
    function renderDailyExpenseChart() {
      const currentUser = localStorage.getItem('currentUser');
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
      const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      // Mengelompokkan pengeluaran berdasarkan tanggal
      const grouped = expenses.reduce((acc, exp) => {
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

      const ctx = document.getElementById('daily-expense-chart').getContext('2d');

      // Destroy chart sebelumnya jika ada
      if (dailyExpenseChart instanceof Chart) {
        dailyExpenseChart.destroy();
      }

      dailyExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pengeluaran Harian (Rp)',
            data: data,
            fill: true,
            backgroundColor: 'rgba(75, 0, 130, 0.2)', /* Ungu Gelap */
            borderColor: '#4b0082', /* Ungu Gelap */
            tension: 0.4,
            pointBackgroundColor: '#4b0082',
            pointBorderColor: '#4b0082'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#333333'
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
                  const value = context.parsed.y;
                  const total = data.reduce((sum, val) => sum + val, 0);
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Tanggal',
                color: '#333333'
              }
            },
            y: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Jumlah (Rp)',
                color: '#333333'
              }
            }
          }
        },
      });

      // Menampilkan Rata-rata, Pengeluaran Tertinggi, dan Terendah
      displayDailySummary(grouped, expenses);

      // Update Total Pengeluaran per Tanggal Saat Ini
      const today = new Date();
      const formattedToday = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const totalRealisasi = data.reduce((sum, val) => sum + val, 0);
      document.getElementById('total-pengeluaran').textContent = `Total Pengeluaran per ${formattedToday} : Rp${totalRealisasi.toLocaleString('id-ID')}`;
    }

    // Fungsi untuk Menampilkan Rata-rata, Pengeluaran Tertinggi, dan Terendah
    function displayDailySummary(grouped, expenses) {
      const dailySummaryDiv = document.getElementById('daily-summary');
      dailySummaryDiv.innerHTML = '';

      const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
      const days = new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString('id-ID'))).size;
      const average = days ? (total / days).toFixed(2) : 0;

      // Cari pengeluaran tertinggi dan terendah dengan nama kategori dan barang
      let maxExpense = { amount: 0, kategori: '', barang: '' };
      let minExpense = { amount: Infinity, kategori: '', barang: '' };
      expenses.forEach(exp => {
        if (exp.amount > maxExpense.amount) {
          maxExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang };
        }
        if (exp.amount < minExpense.amount) {
          minExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang };
        }
      });

      const averageP = document.createElement('p');
      averageP.innerHTML = `<strong>Rata-rata Pengeluaran Per Hari:</strong> Rp${Number(average).toLocaleString('id-ID')}`;
      dailySummaryDiv.appendChild(averageP);

      const maxP = document.createElement('p');
      maxP.innerHTML = `<strong>Pengeluaran Tertinggi:</strong> ${capitalizeFirstLetter(maxExpense.kategori)} (${capitalizeFirstLetter(maxExpense.barang)}) - Rp${maxExpense.amount.toLocaleString('id-ID')}`;
      dailySummaryDiv.appendChild(maxP);

      const minP = document.createElement('p');
      minP.innerHTML = `<strong>Pengeluaran Terendah:</strong> ${capitalizeFirstLetter(minExpense.kategori)} (${capitalizeFirstLetter(minExpense.barang)}) - Rp${minExpense.amount.toLocaleString('id-ID')}`;
      dailySummaryDiv.appendChild(minP);
    }

    // Fungsi untuk Merender Grafik Pengeluaran per Kategori
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

      const ctx = document.getElementById('category-expense-chart').getContext('2d');

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
              labels: {
                color: '#333333'
              },
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
                  return `${context.label}: Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          onClick: (evt, activeElements) => {
            if (activeElements.length > 0) {
              const index = activeElements[0].index;
              const selectedKategori = labels[index];
              showCategoryDetails(selectedKategori);
            }
          }
        },
      });
    }

    // Fungsi untuk Menampilkan Detail Kategori
    function showCategoryDetails(kategori) {
      const currentUser = localStorage.getItem('currentUser');
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      const expensesKey = `expenses_${currentUser}_${currentYear}_${currentMonth}`;
      const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      // Filter expenses by kategori
      const filteredExpenses = expenses.filter(exp => exp.kategori.toLowerCase() === kategori.toLowerCase());

      // Create a modal to display details
      const modal = document.createElement('div');
      modal.classList.add('modal', 'fade');
      modal.setAttribute('tabindex', '-1');
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Komposisi Barang - ${capitalizeFirstLetter(kategori)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <canvas id="category-detail-chart"></canvas>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Initialize Chart in Modal
      const ctx = modal.querySelector('#category-detail-chart').getContext('2d');

      // Mengelompokkan barang dalam kategori
      const groupedBarang = filteredExpenses.reduce((acc, exp) => {
        acc[exp.barang] = acc[exp.barang] || 0;
        acc[exp.barang] += exp.amount;
        return acc;
      }, {});

      const labels = Object.keys(groupedBarang);
      const data = labels.map(label => groupedBarang[label]);

      new Chart(ctx, {
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
              labels: {
                color: '#333333'
              },
              position: 'right',
            },
            title: {
              display: true,
              text: `Komposisi Barang pada Kategori ${capitalizeFirstLetter(kategori)}`,
              color: '#333333'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = data.reduce((sum, val) => sum + val, 0);
                  const value = context.parsed;
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `${context.label}: Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
        },
      });

      // Show the modal
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();

      // Remove modal dari DOM setelah ditutup
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
      });
    }

    // Fungsi untuk Merender Grafik Pengeluaran Harian di Riwayat
    function renderHistoryContent() {
      const selectedMonth = document.getElementById('history-month').value;
      const selectedYear = document.getElementById('history-year').value;
      const historyContent = document.getElementById('history-content');
      historyContent.innerHTML = '';

      if (!selectedMonth || !selectedYear) {
        historyContent.innerHTML = '<p>Silakan pilih tahun dan bulan untuk melihat riwayat pengeluaran.</p>';
        return;
      }

      const currentUser = localStorage.getItem('currentUser');
      const expensesKey = `expenses_${currentUser}_${selectedYear}_${selectedMonth}`;
      const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      if (expenses.length === 0) {
        historyContent.innerHTML = '<p>Tidak ada data pengeluaran untuk bulan ini.</p>';
        return;
      }

      // Statistik
      const grouped = expenses.reduce((acc, exp) => {
        acc[exp.kategori] = acc[exp.kategori] || 0;
        acc[exp.kategori] += exp.amount;
        return acc;
      }, {});

      const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
      const days = new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString('id-ID'))).size;
      const average = days ? (total / days).toFixed(2) : 0;

      let maxExpense = { amount: 0, kategori: '', barang: '' };
      let minExpense = { amount: Infinity, kategori: '', barang: '' };
      expenses.forEach(exp => {
        if (exp.amount > maxExpense.amount) {
          maxExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang };
        }
        if (exp.amount < minExpense.amount) {
          minExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang };
        }
      });

      const statsHtml = `
        <p class="fw-bold">Total Pengeluaran: Rp${total.toLocaleString('id-ID')}</p>
        <p class="fw-bold">Rata-rata Pengeluaran Per Hari: Rp${Number(average).toLocaleString('id-ID')}</p>
        <p class="fw-bold">Pengeluaran Tertinggi: ${capitalizeFirstLetter(maxExpense.kategori)} (${capitalizeFirstLetter(maxExpense.barang)}) - Rp${maxExpense.amount.toLocaleString('id-ID')}</p>
        <p class="fw-bold">Pengeluaran Terendah: ${capitalizeFirstLetter(minExpense.kategori)} (${capitalizeFirstLetter(minExpense.barang)}) - Rp${minExpense.amount.toLocaleString('id-ID')}</p>
      `;
      historyContent.innerHTML += statsHtml;

      // Pengeluaran Harian
      const dailyExpenses = expenses.reduce((acc, exp) => {
        const date = new Date(exp.date).toLocaleDateString('id-ID');
        acc[date] = (acc[date] || 0) + exp.amount;
        return acc;
      }, {});

      const allDates = getAllDatesInMonth(selectedYear, selectedMonth);
      const labels = allDates.map(date => date.toLocaleDateString('id-ID'));
      const data = allDates.map(date => {
        const formattedDate = date.toLocaleDateString('id-ID');
        return dailyExpenses[formattedDate] || 0;
      });

      const historyDailyCtx = document.createElement('canvas');
      historyDailyCtx.id = 'history-daily-chart';
      historyDailyCtx.height = 300;
      historyContent.appendChild(historyDailyCtx);

      // Destroy chart sebelumnya jika ada
      if (historyDailyExpenseChart instanceof Chart) {
        historyDailyExpenseChart.destroy();
      }

      historyDailyExpenseChart = new Chart(historyDailyCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pengeluaran Harian (Rp)',
            data: data,
            fill: true,
            backgroundColor: 'rgba(75, 0, 130, 0.2)', /* Ungu Gelap */
            borderColor: '#4b0082', /* Ungu Gelap */
            tension: 0.4,
            pointBackgroundColor: '#4b0082',
            pointBorderColor: '#4b0082'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#333333'
              }
            },
            title: {
              display: true,
              text: `Grafik Pengeluaran Harian Bulan ${capitalizeFirstLetter(getMonthName(selectedMonth))} ${selectedYear}`,
              color: '#333333'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  const total = data.reduce((sum, val) => sum + val, 0);
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Tanggal',
                color: '#333333'
              }
            },
            y: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Jumlah (Rp)',
                color: '#333333'
              }
            }
          }
        },
      });

      // Pengeluaran per Kategori
      const categoryExpenses = grouped;

      const categoryLabels = Object.keys(categoryExpenses);
      const categoryData = categoryLabels.map(label => categoryExpenses[label]);

      const historyCategoryCtx = document.createElement('canvas');
      historyCategoryCtx.id = 'history-category-chart';
      historyCategoryCtx.height = 300;
      historyContent.appendChild(historyCategoryCtx);

      // Destroy chart sebelumnya jika ada
      if (historyCategoryExpenseChart instanceof Chart) {
        historyCategoryExpenseChart.destroy();
      }

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
            legend: {
              labels: {
                color: '#333333'
              },
              position: 'right',
            },
            title: {
              display: true,
              text: `Pengeluaran per Kategori Bulan ${capitalizeFirstLetter(getMonthName(selectedMonth))} ${selectedYear}`,
              color: '#333333'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = categoryData.reduce((sum, val) => sum + val, 0);
                  const value = context.parsed;
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `${context.label}: Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          onClick: (evt, activeElements) => {
            if (activeElements.length > 0) {
              const index = activeElements[0].index;
              const selectedKategori = categoryLabels[index];
              showCategoryDetails(selectedKategori);
            }
          }
        },
      });
    }

    // Fungsi untuk Menangani Cetak Pengeluaran
    function handlePrintExpense(e) {
      e.preventDefault();
      const printYear = document.getElementById('print-year').value;
  const printMonth = document.getElementById('print-month').value;
  const tujuanPengeluaran = document.getElementById('tujuan-pengeluaran').value.trim();
  const targetInput = document.getElementById('print-monthly-target').value.trim();
  const currentUser = localStorage.getItem('currentUser');

  const targetNumber = parseFloat(targetInput);
  if (isNaN(targetNumber)) {
    showNotification('Silakan isi saldo awal dengan benar.', 'danger');
    return;
  }

  if (printYear && printMonth && tujuanPengeluaran) {
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
  } else {
    showNotification('Silakan isi semua bidang dengan benar.', 'danger');
  }
    };

    // Fungsi untuk Menampilkan Animasi Cetak
    function showPrintAnimation() {
      const printAnimation = document.getElementById('print-animation');
      printAnimation.style.display = 'flex';
    }

    // Fungsi untuk Menyembunyikan Animasi Cetak
    function hidePrintAnimation() {
      const printAnimation = document.getElementById('print-animation');
      printAnimation.style.display = 'none';
    }

    // Fungsi untuk Merender Dashboard Awal
    function renderDashboard() {
      renderExpensesList();
      renderDailyExpenseChart();
      renderCategoryExpenseChart();
      updateCategoryDropdownOptions(); // Update kategori dropdown pada kategori expense
      populateCategoryExpenseMonthOptions(); // Populate month options for category expense
    }

    // Fungsi untuk Menangani Cetak Pengeluaran dengan PDF
        // Fungsi untuk Menangani Cetak Pengeluaran dengan PDF
function generateRekapDataPDF(year, month, user, expenses, targetNumber, tujuanPengeluaran) {
  // Hitung Total Pengeluaran
  const totalRealisasi = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Hitung Saldo Akhir
  const saldoAkhir = targetNumber - totalRealisasi;

  // Hitung Persentase Realisasi
  const percentage = targetNumber === 0 ? 0 : ((totalRealisasi / targetNumber) * 100).toFixed(2);

  // Hitung Rata-rata Pengeluaran Per Hari
  const grouped = expenses.reduce((acc, exp) => {
    const date = new Date(exp.date);
    const formattedDate = date.toLocaleDateString('id-ID');
    acc[formattedDate] = (acc[formattedDate] || 0) + exp.amount;
    return acc;
  }, {});
  const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
  const days = Object.keys(grouped).length;
  const average = days ? (total / days).toFixed(2) : 0;

  // Hitung Pengeluaran Tertinggi dan Terendah
  let maxExpense = { amount: 0, kategori: '', barang: '', tanggal: '' };
  let minExpense = { amount: Infinity, kategori: '', barang: '', tanggal: '' };
  expenses.forEach(exp => {
    if (exp.amount > maxExpense.amount) {
      maxExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
    }
    if (exp.amount < minExpense.amount) {
      minExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
    }
  });

  // Kelompokkan pengeluaran berdasarkan kategori
  const categoryExpenses = expenses.reduce((acc, exp) => {
    acc[exp.kategori] = acc[exp.kategori] || 0;
    acc[exp.kategori] += exp.amount;
    return acc;
  }, {});
  const categoryLabels = Object.keys(categoryExpenses);
  const categoryData = categoryLabels.map(label => categoryExpenses[label]);

  // Format Tujuan Pengeluaran dengan Huruf Kapital
  const tujuanFormatted = tujuanPengeluaran.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Buat PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Judul
  doc.setFontSize(18);
  doc.setFont('Helvetica', 'bold');
  const title = `Rekap Data Pengeluaran ${tujuanFormatted} Bulan ${capitalizeFirstLetter(getMonthName(month))} ${year}`;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 40; // 20 units margin on each side
  const titleLines = doc.splitTextToSize(title, maxWidth);
  const initialY = 20;
  doc.text(titleLines, pageWidth / 2, initialY, { align: 'center' });

  // Hitung tinggi judul berdasarkan jumlah baris
  const lineHeight = 10; // Estimasi tinggi setiap baris
  const titleHeight = lineHeight * titleLines.length;
  const saldoAwalY = initialY + titleHeight + 10; // 10 units spacing after title

  // Saldo Awal
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Saldo Awal: `, 15, saldoAwalY, { align: 'left' });
  doc.setFont('Helvetica', 'bold');
  doc.text(`Rp${targetNumber.toLocaleString('id-ID')}`, 70, saldoAwalY, { align: 'left' });
  doc.setFont('Helvetica', 'normal');

  // Total Pengeluaran
  const totalPengeluaranY = saldoAwalY + 10;
  doc.text(`Total Pengeluaran: `, 15, totalPengeluaranY, { align: 'left' });
  doc.setFont('Helvetica', 'bold');
  doc.text(`Rp${totalRealisasi.toLocaleString('id-ID')}`, 70, totalPengeluaranY, { align: 'left' });
  doc.setFont('Helvetica', 'normal');

  // Saldo Akhir
  const saldoAkhirY = totalPengeluaranY + 10;
  doc.text(`Saldo Akhir: `, 15, saldoAkhirY, { align: 'left' });
  doc.setFont('Helvetica', 'bold');
  doc.text(`Rp${saldoAkhir.toLocaleString('id-ID')}`, 70, saldoAkhirY, { align: 'left' });
  doc.setFont('Helvetica', 'normal');

  // Persentase Realisasi
  const persentaseY = saldoAkhirY + 10;
  doc.text(`Persentase Realisasi: `, 15, persentaseY, { align: 'left' });
  doc.setFont('Helvetica', 'bold');
  doc.text(`${percentage}%`, 70, persentaseY, { align: 'left' });
  doc.setFont('Helvetica', 'normal');

  // Keterangan
  const keteranganY = persentaseY + 10;
  doc.setFont('Helvetica', 'bold');
  doc.text('Keterangan:', 15, keteranganY, { align: 'left' });
  doc.setFont('Helvetica', 'normal');
  doc.text('• <100%: Total pengeluaran terlalu kecil', 20, keteranganY + 5, { align: 'left' });
  doc.text('• =100%: Total pengeluaran sesuai', 20, keteranganY + 10, { align: 'left' });
  doc.text('• >100%: Total pengeluaran terlalu besar', 20, keteranganY + 15, { align: 'left' });

  // Tabel Pengeluaran
  const tableColumn = ["Tanggal", "Barang", "Kategori", "Jumlah (Rp)"];
  const tableRows = [];

  expenses.forEach(exp => {
    const tanggal = new Date(exp.date).toLocaleDateString('id-ID');
    const barang = capitalizeFirstLetter(exp.barang);
    const kategori = capitalizeFirstLetter(exp.kategori);
    const jumlah = exp.amount.toLocaleString('id-ID');
    const rowData = [tanggal, barang, kategori, jumlah];
    tableRows.push(rowData);
  });

  // AutoTable Plugin for jsPDF
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: keteranganY + 25, // Menyesuaikan posisi tabel dengan keterangan sebelumnya
    styles: { fontSize: 10, font: 'Helvetica', halign: 'center', valign: 'middle', textColor: [0, 0, 0] },
    headStyles: { fillColor: [75, 0, 130], textColor: 255 }, // Warna ungu gelap dengan teks putih
    margin: { top: 10 },
    theme: 'striped',
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.1,
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' }
    }
  });

  // Menambahkan "by Mumy (Manage Your Money)" di bagian bawah PDF sebagai watermark
  doc.setFontSize(10);
  doc.setTextColor(75, 0, 130); // Warna ungu gelap
  doc.setFont('Helvetica', 'normal');
  doc.text('by Mumy (Manage Your Money)', 105, doc.internal.pageSize.getHeight() - 10, null, null, 'center');

  // Simpan PDF
  doc.save(`Rekap_Pengeluaran_${tujuanFormatted.replace(/\s+/g, '_')}_${capitalizeFirstLetter(getMonthName(month))}_${year}.pdf`);
}

    // Fungsi untuk Merender Riwayat Pengeluaran
    function renderHistoryContent() {
      const selectedMonth = document.getElementById('history-month').value;
      const selectedYear = document.getElementById('history-year').value;
      const historyContent = document.getElementById('history-content');
      historyContent.innerHTML = '';

      if (!selectedMonth || !selectedYear) {
        historyContent.innerHTML = '<p>Silakan pilih tahun dan bulan untuk melihat riwayat pengeluaran.</p>';
        return;
      }

      const currentUser = localStorage.getItem('currentUser');
      const expensesKey = `expenses_${currentUser}_${selectedYear}_${selectedMonth}`;
      const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      if (expenses.length === 0) {
        historyContent.innerHTML = '<p>Tidak ada data pengeluaran untuk bulan ini.</p>';
        return;
      }

      // Statistik
      const grouped = expenses.reduce((acc, exp) => {
        acc[exp.kategori] = acc[exp.kategori] || 0;
        acc[exp.kategori] += exp.amount;
        return acc;
      }, {});

      const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
      const days = new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString('id-ID'))).size;
      const average = days ? (total / days).toFixed(2) : 0;

      let maxExpense = { amount: 0, kategori: '', barang: '', tanggal: '' };
      let minExpense = { amount: Infinity, kategori: '', barang: '', tanggal: '' };
      expenses.forEach(exp => {
        if (exp.amount > maxExpense.amount) {
          maxExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
        }
        if (exp.amount < minExpense.amount) {
          minExpense = { amount: exp.amount, kategori: exp.kategori, barang: exp.barang, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
        }
      });

      const statsHtml = `
        <p class="fw-bold">Total Pengeluaran: Rp${total.toLocaleString('id-ID')}</p>
        <p class="fw-bold">Rata-rata Pengeluaran Per Hari: Rp${Number(average).toLocaleString('id-ID')}</p>
        <p class="fw-bold">Pengeluaran Tertinggi: ${capitalizeFirstLetter(maxExpense.kategori)} (${capitalizeFirstLetter(maxExpense.barang)}) - Rp${maxExpense.amount.toLocaleString('id-ID')}</p>
        <p class="fw-bold">Pengeluaran Terendah: ${capitalizeFirstLetter(minExpense.kategori)} (${capitalizeFirstLetter(minExpense.barang)}) - Rp${minExpense.amount.toLocaleString('id-ID')}</p>
      `;
      historyContent.innerHTML += statsHtml;

      // Pengeluaran Harian
      const dailyExpenses = expenses.reduce((acc, exp) => {
        const date = new Date(exp.date).toLocaleDateString('id-ID');
        acc[date] = (acc[date] || 0) + exp.amount;
        return acc;
      }, {});

      const allDates = getAllDatesInMonth(selectedYear, selectedMonth);
      const labels = allDates.map(date => date.toLocaleDateString('id-ID'));
      const data = allDates.map(date => {
        const formattedDate = date.toLocaleDateString('id-ID');
        return dailyExpenses[formattedDate] || 0;
      });

      const historyDailyCtx = document.createElement('canvas');
      historyDailyCtx.id = 'history-daily-chart';
      historyDailyCtx.height = 300;
      historyContent.appendChild(historyDailyCtx);

      // Destroy chart sebelumnya jika ada
      if (historyDailyExpenseChart instanceof Chart) {
        historyDailyExpenseChart.destroy();
      }

      historyDailyExpenseChart = new Chart(historyDailyCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pengeluaran Harian (Rp)',
            data: data,
            fill: true,
            backgroundColor: 'rgba(75, 0, 130, 0.2)', /* Ungu Gelap */
            borderColor: '#4b0082', /* Ungu Gelap */
            tension: 0.4,
            pointBackgroundColor: '#4b0082',
            pointBorderColor: '#4b0082'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#333333'
              }
            },
            title: {
              display: true,
              text: `Grafik Pengeluaran Harian Bulan ${capitalizeFirstLetter(getMonthName(selectedMonth))} ${selectedYear}`,
              color: '#333333'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  const total = data.reduce((sum, val) => sum + val, 0);
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Tanggal',
                color: '#333333'
              }
            },
            y: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Jumlah (Rp)',
                color: '#333333'
              }
            }
          }
        },
      });

      // Pengeluaran per Kategori
      const categoryExpenses = grouped;

      const categoryLabels = Object.keys(categoryExpenses);
      const categoryData = categoryLabels.map(label => categoryExpenses[label]);

      const historyCategoryCtx = document.createElement('canvas');
      historyCategoryCtx.id = 'history-category-chart';
      historyCategoryCtx.height = 300;
      historyContent.appendChild(historyCategoryCtx);

      // Destroy chart sebelumnya jika ada
      if (historyCategoryExpenseChart instanceof Chart) {
        historyCategoryExpenseChart.destroy();
      }

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
            legend: {
              labels: {
                color: '#333333'
              },
              position: 'right',
            },
            title: {
              display: true,
              text: `Pengeluaran per Kategori Bulan ${capitalizeFirstLetter(getMonthName(selectedMonth))} ${selectedYear}`,
              color: '#333333'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = categoryData.reduce((sum, val) => sum + val, 0);
                  const value = context.parsed;
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `${context.label}: Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          onClick: (evt, activeElements) => {
            if (activeElements.length > 0) {
              const index = activeElements[0].index;
              const selectedKategori = categoryLabels[index];
              showCategoryDetails(selectedKategori);
            }
          }
        },
      });
    }

    // Fungsi untuk Menginisialisasi Dropdown Bulan dan Kategori pada Category Expense Enhanced
    function initializeCategoryExpenseEnhanced() {
      const selectMonth = document.getElementById('select-category-month');
      const selectCategory = document.getElementById('select-category');
      const categoryStatistic = document.getElementById('category-statistic');

      // Populate Month Options
      populateCategoryExpenseMonthOptions();

      // Populate Category Options
      populateCategoryExpenseCategoryOptions();

      // Event Listener untuk Pemilihan Bulan
      selectMonth.addEventListener('change', () => {
        const selectedMonth = selectMonth.value;
        if (selectedMonth) {
          populateCategoryExpenseCategoryOptions(selectedMonth);
          selectCategory.disabled = false;
        } else {
          selectCategory.innerHTML = '<option value="">Pilih Kategori</option>';
          selectCategory.disabled = true;
        }
        // Reset grafik dan statistik
        if (categoryDailyExpenseChart instanceof Chart) {
          categoryDailyExpenseChart.destroy();
        }
        categoryStatistic.innerHTML = '';
      });

      // Event Listener untuk Pemilihan Kategori
      selectCategory.addEventListener('change', () => {
        const selectedMonth = selectMonth.value;
        const selectedCategory = selectCategory.value;
        if (selectedCategory) {
          renderCategoryDailyExpenseChart(selectedMonth, selectedCategory, categoryStatistic);
        } else {
          if (categoryDailyExpenseChart instanceof Chart) {
            categoryDailyExpenseChart.destroy();
          }
          categoryStatistic.innerHTML = '';
        }
      });
    }

    // Fungsi untuk Memenuhi Opsi Bulan pada Category Expense Enhanced
    function populateCategoryExpenseMonthOptions() {
      const selectMonth = document.getElementById('select-category-month');
      const currentUser = localStorage.getItem('currentUser');
      const years = new Set();

      for (let key in localStorage) {
        if (key.startsWith(`expenses_${currentUser}_`)) {
          const parts = key.split('_');
          if (parts.length === 4) { // expenses_user_year_month
            years.add(`${parts[2]}-${parts[3]}`); // Format: year-month
          }
        }
      }

      // Convert to array and sort descending
      const yearMonthArray = Array.from(years).sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return yearB - yearA || monthB - monthA;
      });

      if (yearMonthArray.length === 0) {
        selectMonth.innerHTML = '<option value="">Tidak ada data</option>';
      } else {
        selectMonth.innerHTML = '<option value="">Pilih Bulan</option>';
        yearMonthArray.forEach(ym => {
          const [year, month] = ym.split('-').map(Number);
          const option = document.createElement('option');
          option.value = month;
          option.textContent = `${getMonthName(month)} ${year}`;
          selectMonth.appendChild(option);
        });
      }
    }

    // Fungsi untuk Memenuhi Opsi Kategori pada Category Expense Enhanced
    function populateCategoryExpenseCategoryOptions(selectedMonth = null) {
      const selectCategory = document.getElementById('select-category');
      const currentUser = localStorage.getItem('currentUser');
      let expenses = [];

      if (selectedMonth) {
        const currentYear = getCurrentYear();
        const expensesKey = `expenses_${currentUser}_${currentYear}_${selectedMonth}`;
        expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
      } else {
        // Jika semua bulan, gabungkan semua data
        for (let key in localStorage) {
          if (key.startsWith(`expenses_${currentUser}_`)) {
            const parts = key.split('_');
            if (parts.length === 4) { // expenses_user_year_month
              const month = parseInt(parts[3]);
              const monthExpenses = JSON.parse(localStorage.getItem(key)) || [];
              expenses = expenses.concat(monthExpenses);
            }
          }
        }
      }

      const categories = new Set();
      expenses.forEach(exp => {
        categories.add(exp.kategori);
      });

      if (categories.size === 0) {
        selectCategory.innerHTML = '<option value="">Tidak ada kategori</option>';
      } else {
        selectCategory.innerHTML = '<option value="">Pilih Kategori</option>';
        Array.from(categories).sort().forEach(kategori => {
          const option = document.createElement('option');
          option.value = kategori.toLowerCase();
          option.textContent = capitalizeFirstLetter(kategori);
          selectCategory.appendChild(option);
        });
      }
    }

    // Fungsi untuk Merender Grafik Pengeluaran Harian per Kategori
    function renderCategoryDailyExpenseChart(selectedMonth, selectedCategory, statisticDiv) {
      const currentUser = localStorage.getItem('currentUser');
      const currentYear = getCurrentYear();
      const expensesKey = `expenses_${currentUser}_${currentYear}_${selectedMonth}`;
      const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      // Filter expenses by category
      const filteredExpenses = expenses.filter(exp => exp.kategori.toLowerCase() === selectedCategory.toLowerCase());

      // Mengelompokkan pengeluaran berdasarkan tanggal
      const grouped = filteredExpenses.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const formattedDate = date.toLocaleDateString('id-ID');
        acc[formattedDate] = (acc[formattedDate] || 0) + exp.amount;
        return acc;
      }, {});

      const allDates = getAllDatesInMonth(currentYear, selectedMonth);
      const labels = allDates.map(date => date.toLocaleDateString('id-ID'));
      const data = allDates.map(date => {
        const formattedDate = date.toLocaleDateString('id-ID');
        return grouped[formattedDate] || 0;
      });

      const ctx = document.getElementById('category-daily-chart').getContext('2d');

      // Destroy chart sebelumnya jika ada
      if (categoryDailyExpenseChart instanceof Chart) {
        categoryDailyExpenseChart.destroy();
      }

      categoryDailyExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pengeluaran Harian (Rp)',
            data: data,
            backgroundColor: 'rgba(75, 0, 130, 0.6)', /* Ungu Gelap */
            borderColor: '#4b0082', /* Ungu Gelap */
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: `Grafik Pengeluaran Harian Kategori ${capitalizeFirstLetter(selectedCategory)} Bulan ${capitalizeFirstLetter(getMonthName(selectedMonth))} ${currentYear}`,
              color: '#333333'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  const total = data.reduce((sum, val) => sum + val, 0);
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Tanggal',
                color: '#333333'
              }
            },
            y: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Jumlah (Rp)',
                color: '#333333'
              }
            }
          }
        },
      });

      // Menampilkan Statistik
      displayCategoryStatistic(filteredExpenses, selectedCategory, statisticDiv);
    }

    // Fungsi untuk Menampilkan Statistik pada Category Expense Enhanced
    function displayCategoryStatistic(expenses, kategori, statisticDiv) {
      if (expenses.length === 0) {
        statisticDiv.innerHTML = '<p>Tidak ada data pengeluaran untuk kategori ini pada bulan yang dipilih.</p>';
        return;
      }

      // Hitung Total dan Rata-rata
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const days = new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString('id-ID'))).size;
      const average = days ? (total / days).toFixed(2) : 0;

      // Cari Pengeluaran Tertinggi dan Terendah
      let maxExpense = { amount: 0, tanggal: '' };
      let minExpense = { amount: Infinity, tanggal: '' };
      expenses.forEach(exp => {
        if (exp.amount > maxExpense.amount) {
          maxExpense = { amount: exp.amount, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
        }
        if (exp.amount < minExpense.amount) {
          minExpense = { amount: exp.amount, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
        }
      });

      // Format Statistik
      const statsHtml = `
        <p class="fw-bold">Total Pengeluaran Kategori ${capitalizeFirstLetter(kategori)}: Rp${total.toLocaleString('id-ID')}</p>
        <p class="fw-bold">Rata-rata Pengeluaran Per Hari: Rp${Number(average).toLocaleString('id-ID')}</p>
        <p class="fw-bold">Pengeluaran Tertinggi kategori ${capitalizeFirstLetter(kategori)}: ${maxExpense.tanggal} - Rp${maxExpense.amount.toLocaleString('id-ID')}</p>
        <p class="fw-bold">Pengeluaran Terendah kategori ${capitalizeFirstLetter(kategori)}: ${minExpense.tanggal} - Rp${minExpense.amount.toLocaleString('id-ID')}</p>
      `;
      statisticDiv.innerHTML = statsHtml;
    }

    // Fungsi untuk Menginisialisasi Tahun untuk Riwayat
    function initializeHistoryYearOptions() {
      const historyYearSelect = document.getElementById('history-year');
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

      if (years.size === 0) {
        historyYearSelect.innerHTML = '<option value="">Tidak ada riwayat</option>';
      } else {
        historyYearSelect.innerHTML = '<option value="">Pilih Tahun</option>';
        Array.from(years).sort().forEach(year => {
          const option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          historyYearSelect.appendChild(option);
        });
      }

      historyYearSelect.addEventListener('change', () => {
        const selectedYear = historyYearSelect.value;
        populateHistoryMonthOptions(selectedYear);
      });
    }

    // Fungsi untuk Menginisialisasi Tahun untuk Cetak Rekap
    function initializePrintYearOptions() {
      const printYearSelect = document.getElementById('print-year');
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

      if (years.size === 0) {
        printYearSelect.innerHTML = '<option value="">Tidak ada riwayat</option>';
      } else {
        printYearSelect.innerHTML = '<option value="">Pilih Tahun</option>';
        Array.from(years).sort().forEach(year => {
          const option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          printYearSelect.appendChild(option);
        });
      }

      printYearSelect.addEventListener('change', () => {
        const selectedYear = printYearSelect.value;
        populatePrintMonthOptions(selectedYear);
      });
    }

    // Fungsi untuk Menginisialisasi Dropdown Bulan pada Riwayat
    function populateHistoryMonthOptions(selectedYear) {
      const historyMonthSelect = document.getElementById('history-month');
      const currentUser = localStorage.getItem('currentUser');
      const months = [];

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
        months.forEach(month => {
          const option = document.createElement('option');
          option.value = month;
          option.textContent = getMonthName(month);
          historyMonthSelect.appendChild(option);
        });
      }

      historyMonthSelect.removeEventListener('change', renderHistoryContent); // Remove existing listener to prevent multiple triggers
      historyMonthSelect.addEventListener('change', renderHistoryContent);
    }

    // Fungsi untuk Menginisialisasi Dropdown Bulan pada Cetak Rekap
    function populatePrintMonthOptions(selectedYear) {
      const printMonthSelect = document.getElementById('print-month');
      const currentUser = localStorage.getItem('currentUser');
      const months = [];

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
        months.forEach(month => {
          const option = document.createElement('option');
          option.value = month;
          option.textContent = getMonthName(month);
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

    // Fungsi untuk Menghasilkan Palet Warna Terang
    function generateBrightColorPalette(num) {
      const palette = [];
      const predefinedColors = [
        '#4b0082', // Ungu Gelap
        '#ff6584', // Merah Muda Terang
        '#ffa94d', // Oranye Terang
        '#20c997', // Hijau Terang
        '#20a8d8', // Biru Terang
        '#f66d9b', // Pink Terang
        '#e63946', // Merah Terang
        '#fd7e14', // Oranye Cerah
        '#6c63ff', // Ungu
        '#adb5bd'  // Abu-abu Terang
      ];
      for (let i = 0; i < num; i++) {
        palette.push(predefinedColors[i % predefinedColors.length]);
      }
      return palette;
    }

    // Fungsi untuk Menangani Cetak Pengeluaran
    // Sudah diimplementasikan di fungsi generateRekapDataPDF()

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
      const date = new Date();
      date.setMonth(monthNumber - 1);
      return date.toLocaleString('id-ID', { month: 'long' });
    }

    // Fungsi untuk Capitalize First Letter
    function capitalizeFirstLetter(string) {
  return string.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Fungsi untuk Inisialisasi Dropdown dan Grafik pada Category Expense Enhanced
    function initializeCategoryExpenseEnhanced() {
      const selectMonth = document.getElementById('select-category-month');
      const selectCategory = document.getElementById('select-category');
      const categoryStatistic = document.getElementById('category-statistic');

      // Populate Month Options
      populateCategoryExpenseMonthOptions();

      // Populate Category Options
      populateCategoryExpenseCategoryOptions();

      // Event Listener untuk Pemilihan Bulan
      selectMonth.addEventListener('change', () => {
        const selectedMonth = selectMonth.value;
        if (selectedMonth) {
          populateCategoryExpenseCategoryOptions(selectedMonth);
          selectCategory.disabled = false;
        } else {
          selectCategory.innerHTML = '<option value="">Pilih Kategori</option>';
          selectCategory.disabled = true;
        }
        // Reset grafik dan statistik
        if (categoryDailyExpenseChart instanceof Chart) {
          categoryDailyExpenseChart.destroy();
        }
        categoryStatistic.innerHTML = '';
      });

      // Event Listener untuk Pemilihan Kategori
      selectCategory.addEventListener('change', () => {
        const selectedMonth = selectMonth.value;
        const selectedCategory = selectCategory.value;
        if (selectedCategory) {
          renderCategoryDailyExpenseChart(selectedMonth, selectedCategory, categoryStatistic);
        } else {
          if (categoryDailyExpenseChart instanceof Chart) {
            categoryDailyExpenseChart.destroy();
          }
          categoryStatistic.innerHTML = '';
        }
      });
    }

    // Fungsi untuk Memenuhi Opsi Bulan pada Category Expense Enhanced
    function populateCategoryExpenseMonthOptions() {
      const selectMonth = document.getElementById('select-category-month');
      const currentUser = localStorage.getItem('currentUser');
      const years = new Set();

      for (let key in localStorage) {
        if (key.startsWith(`expenses_${currentUser}_`)) {
          const parts = key.split('_');
          if (parts.length === 4) { // expenses_user_year_month
            years.add(`${parts[2]}-${parts[3]}`); // Format: year-month
          }
        }
      }

      // Convert to array and sort descending
      const yearMonthArray = Array.from(years).sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return yearB - yearA || monthB - monthA;
      });

      if (yearMonthArray.length === 0) {
        selectMonth.innerHTML = '<option value="">Tidak ada data</option>';
      } else {
        selectMonth.innerHTML = '<option value="">Pilih Bulan</option>';
        yearMonthArray.forEach(ym => {
          const [year, month] = ym.split('-').map(Number);
          const option = document.createElement('option');
          option.value = month;
          option.textContent = `${getMonthName(month)} ${year}`;
          selectMonth.appendChild(option);
        });
      }
    }

    // Fungsi untuk Memenuhi Opsi Kategori pada Category Expense Enhanced
    function populateCategoryExpenseCategoryOptions(selectedMonth = null) {
      const selectCategory = document.getElementById('select-category');
      const currentUser = localStorage.getItem('currentUser');
      let expenses = [];

      if (selectedMonth) {
        const currentYear = getCurrentYear();
        const expensesKey = `expenses_${currentUser}_${currentYear}_${selectedMonth}`;
        expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
      } else {
        // Jika semua bulan, gabungkan semua data
        for (let key in localStorage) {
          if (key.startsWith(`expenses_${currentUser}_`)) {
            const parts = key.split('_');
            if (parts.length === 4) { // expenses_user_year_month
              const month = parseInt(parts[3]);
              const monthExpenses = JSON.parse(localStorage.getItem(key)) || [];
              expenses = expenses.concat(monthExpenses);
            }
          }
        }
      }

      const categories = new Set();
      expenses.forEach(exp => {
        categories.add(exp.kategori);
      });

      if (categories.size === 0) {
        selectCategory.innerHTML = '<option value="">Tidak ada kategori</option>';
      } else {
        selectCategory.innerHTML = '<option value="">Pilih Kategori</option>';
        Array.from(categories).sort().forEach(kategori => {
          const option = document.createElement('option');
          option.value = kategori.toLowerCase();
          option.textContent = capitalizeFirstLetter(kategori);
          selectCategory.appendChild(option);
        });
      }
    }

    // Fungsi untuk Merender Grafik Pengeluaran Harian per Kategori
    function renderCategoryDailyExpenseChart(selectedMonth, selectedCategory, statisticDiv) {
      const currentUser = localStorage.getItem('currentUser');
      const currentYear = getCurrentYear();
      const expensesKey = `expenses_${currentUser}_${currentYear}_${selectedMonth}`;
      const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];

      // Filter expenses by category
      const filteredExpenses = expenses.filter(exp => exp.kategori.toLowerCase() === selectedCategory.toLowerCase());

      // Mengelompokkan pengeluaran berdasarkan tanggal
      const grouped = filteredExpenses.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const formattedDate = date.toLocaleDateString('id-ID');
        acc[formattedDate] = (acc[formattedDate] || 0) + exp.amount;
        return acc;
      }, {});

      const allDates = getAllDatesInMonth(currentYear, selectedMonth);
      const labels = allDates.map(date => date.toLocaleDateString('id-ID'));
      const data = allDates.map(date => {
        const formattedDate = date.toLocaleDateString('id-ID');
        return grouped[formattedDate] || 0;
      });

      const ctx = document.getElementById('category-daily-chart').getContext('2d');

      // Destroy chart sebelumnya jika ada
      if (categoryDailyExpenseChart instanceof Chart) {
        categoryDailyExpenseChart.destroy();
      }

      categoryDailyExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pengeluaran Harian (Rp)',
            data: data,
            backgroundColor: 'rgba(75, 0, 130, 0.6)', /* Ungu Gelap */
            borderColor: '#4b0082', /* Ungu Gelap */
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: `Grafik Pengeluaran Harian Kategori ${capitalizeFirstLetter(selectedCategory)} Bulan ${capitalizeFirstLetter(getMonthName(selectedMonth))} ${currentYear}`,
              color: '#333333'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  const total = data.reduce((sum, val) => sum + val, 0);
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                  return `Rp${value.toLocaleString('id-ID')} (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Tanggal',
                color: '#333333'
              }
            },
            y: {
              ticks: {
                color: '#333333'
              },
              grid: {
                color: '#e0e0e0'
              },
              title: {
                display: true,
                text: 'Jumlah (Rp)',
                color: '#333333'
              }
            }
          }
        },
      });

      // Menampilkan Statistik
      displayCategoryStatistic(filteredExpenses, selectedCategory, statisticDiv);
    }

    // Fungsi untuk Menampilkan Statistik pada Category Expense Enhanced
    function displayCategoryStatistic(expenses, kategori, statisticDiv) {
      if (expenses.length === 0) {
        statisticDiv.innerHTML = '<p>Tidak ada data pengeluaran untuk kategori ini pada bulan yang dipilih.</p>';
        return;
      }

      // Hitung Total dan Rata-rata
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const days = new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString('id-ID'))).size;
      const average = days ? (total / days).toFixed(2) : 0;

      // Cari Pengeluaran Tertinggi dan Terendah
      let maxExpense = { amount: 0, tanggal: '' };
      let minExpense = { amount: Infinity, tanggal: '' };
      expenses.forEach(exp => {
        if (exp.amount > maxExpense.amount) {
          maxExpense = { amount: exp.amount, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
        }
        if (exp.amount < minExpense.amount) {
          minExpense = { amount: exp.amount, tanggal: new Date(exp.date).toLocaleDateString('id-ID') };
        }
      });

      // Format Statistik
      const statsHtml = `
        <p class="fw-bold">Total Pengeluaran Kategori ${capitalizeFirstLetter(kategori)}: Rp${total.toLocaleString('id-ID')}</p>
        <p class="fw-bold">Rata-rata Pengeluaran Per Hari: Rp${Number(average).toLocaleString('id-ID')}</p>
      `;
      statisticDiv.innerHTML = statsHtml;
    }

    // Fungsi untuk Memperbarui Opsi Kategori Dropdown pada Category Expense
    function updateCategoryDropdownOptions() {
      // Update category dropdown in category expense enhanced section
      const selectCategory = document.getElementById('select-category');
      const currentUser = localStorage.getItem('currentUser');
      let expenses = [];

      // Ambil semua pengeluaran untuk semua bulan
      for (let key in localStorage) {
        if (key.startsWith(`expenses_${currentUser}_`)) {
          const parts = key.split('_');
          if (parts.length === 4) { // expenses_user_year_month
            const month = parseInt(parts[3]);
            const monthExpenses = JSON.parse(localStorage.getItem(key)) || [];
            expenses = expenses.concat(monthExpenses);
          }
        }
      }

      const categories = new Set();
      expenses.forEach(exp => {
        categories.add(exp.kategori);
      });

      if (categories.size === 0) {
        selectCategory.innerHTML = '<option value="">Tidak ada kategori</option>';
      } else {
        selectCategory.innerHTML = '<option value="">Pilih Kategori</option>';
        Array.from(categories).sort().forEach(kategori => {
          const option = document.createElement('option');
          option.value = kategori.toLowerCase();
          option.textContent = capitalizeFirstLetter(kategori);
          selectCategory.appendChild(option);
        });
      }
    }

    // Fungsi untuk Merender Rekap Data PDF
    // Sudah diimplementasikan di fungsi generateRekapDataPDF()

    // Fungsi untuk Mendapatkan Nama Bulan Berdasarkan Angka
    // Sudah diimplementasikan di fungsi getMonthName()

    // Fungsi untuk Capitalize First Letter
    // Sudah diimplementasikan di fungsi capitalizeFirstLetter()

    // Fungsi untuk Inisialisasi Menu Event Listeners
    function initializeMenuEventListeners() {
      // Sudah diimplementasikan di initializeApp()
    }

    // Fungsi untuk Menampilkan Tips Modal
    function showTipsModal(message) {
      const tipsModalContent = document.querySelector('#tipsModal .modal-body');
      tipsModalContent.textContent = message;
      const tipsModal = new bootstrap.Modal(document.getElementById('tipsModal'));
      tipsModal.show();
    }

    // Fungsi untuk Merender Rekap Data PDF
    // Sudah diimplementasikan di fungsi generateRekapDataPDF()
