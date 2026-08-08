document.addEventListener('copy', (e) => e.preventDefault());
  
  document.addEventListener('cut', (e) => e.preventDefault());

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  document.addEventListener('keydown', (e) => {
    if (
      (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 'a')) || 
      e.key === 'F12'
    ) {
      e.preventDefault();
    }
  });

    const targetInput = document.getElementById('target-amount');
    const periodInput = document.getElementById('period-amount');
    const modalEl = document.getElementById('app-modal');
    
    let mainFreq = 'hari'; // 'hari', 'minggu', 'bulan'
    let daySubMode = 'everyday'; // 'everyday', 'custom'

    function formatRupiah(angka) { return 'Rp ' + Number(angka).toLocaleString('id-ID'); }
    function formatInputRupiah(angka) {
      let number_string = angka.replace(/[^,\d]/g, '').toString();
      let split = number_string.split(',');
      let sisa = split[0].length % 3;
      let rupiah = split[0].substr(0, sisa);
      let ribuan = split[0].substr(sisa).match(/\d{3}/gi);
      if (ribuan) { let separator = sisa ? '.' : ''; rupiah += separator + ribuan.join('.'); }
      rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
      return rupiah ? 'Rp ' + rupiah : '';
    }
    function parseRawNumber(str) { if (!str) return 0; return parseFloat(str.replace(/[^0-9]/g, '')) || 0; }

    [targetInput, periodInput].forEach(el => {
      el.addEventListener('keyup', function() { this.value = formatInputRupiah(this.value); updateCalculator(); });
    });

    function setMainFreq(freq) {
      mainFreq = freq;
      const btns = document.querySelectorAll('.freq-btn');
      const subWrapper = document.getElementById('sub-day-wrapper');
      const dayPickerBox = document.getElementById('day-picker-box');

      btns.forEach(b => b.classList.remove('active'));
      if (freq === 'hari') {
        btns[0].classList.add('active');
        subWrapper.classList.add('active');
        if (daySubMode === 'custom') dayPickerBox.classList.add('active');
      } else {
        if (freq === 'minggu') btns[1].classList.add('active');
        if (freq === 'bulan') btns[2].classList.add('active');
        subWrapper.classList.remove('active');
        dayPickerBox.classList.remove('active');
      }
      updateCalculator();
    }

    function setDaySubMode(mode) {
      daySubMode = mode;
      const subBtns = document.querySelectorAll('.sub-btn');
      const dayPickerBox = document.getElementById('day-picker-box');

      subBtns.forEach(b => b.classList.remove('active'));
      if (mode === 'everyday') {
        subBtns[0].classList.add('active');
        dayPickerBox.classList.remove('active');
      } else {
        subBtns[1].classList.add('active');
        dayPickerBox.classList.add('active');
      }
      updateCalculator();
    }

    function updateCalculator() {
      const target = parseRawNumber(targetInput.value);
      const period = parseRawNumber(periodInput.value);
      const emptyWrap = document.getElementById('calc-content-empty');
      const activeWrap = document.getElementById('calc-content-active');

      if (target > 0 && period > 0) {
        emptyWrap.style.display = 'none'; 
        activeWrap.style.display = 'block';

        const totalTimes = Math.ceil(target / period);
        let totalDays = totalTimes;
        let monthlyRate = 0;

        if (mainFreq === 'hari') {
          if (daySubMode === 'custom') {
            const checkedDays = document.querySelectorAll('.day-pills-wrap input:checked').length;
            const activeDays = checkedDays > 0 ? checkedDays : 1;
            totalDays = Math.ceil((totalTimes / activeDays) * 7);
            monthlyRate = (period * activeDays) * 4;
          } else {
            totalDays = totalTimes;
            monthlyRate = period * 30;
          }
          document.getElementById('calc-time-unit').innerText = daySubMode === 'custom' ? 'KALI NABUNG' : 'HARI';
        } else if (mainFreq === 'minggu') {
          totalDays = totalTimes * 7;
          monthlyRate = period * 4;
          document.getElementById('calc-time-unit').innerText = 'MINGGU';
        } else if (mainFreq === 'bulan') {
          totalDays = totalTimes * 30;
          monthlyRate = period;
          document.getElementById('calc-time-unit').innerText = 'BULAN';
        }

        let monthsLeft = (totalDays / 30).toFixed(1);

        document.getElementById('calc-time-num').innerText = totalTimes.toLocaleString('id-ID');
        document.getElementById('calc-time-desc').innerText = `Estimasi durasi: ~${totalDays} hari total (~${monthsLeft} bulan)`;

        const l2Times = Math.ceil((target * 0.2) / period);
        document.getElementById('calc-l2-time').innerText = `${l2Times} ${document.getElementById('calc-time-unit').innerText}`;
        document.getElementById('calc-monthly-rate').innerText = formatRupiah(monthlyRate);

        const quoteEl = document.getElementById('calc-quote');
        if (totalDays <= 30) quoteEl.innerHTML = '🔥 <b>Target Cepat!</b> Realistis selesai dalam sebulan!';
        else if (totalDays <= 365) quoteEl.innerHTML = '🚀 <b>Rencana Bagus!</b> Target kamu kelar dalam setahun.';
        else quoteEl.innerHTML = '💡 <i>"Langkah kecil konsisten jauh lebih baik daripada nominal besar tapi terhenti."</i>';

      } else {
        emptyWrap.style.display = 'block'; 
        activeWrap.style.display = 'none';
      }
    }

    function getLevelText(percentage) {
      if (percentage >= 100) return 'LEVEL MAX (100%)';
      if (percentage >= 80) return 'LEVEL 5 (80%)';
      if (percentage >= 60) return 'LEVEL 4 (60%)';
      if (percentage >= 40) return 'LEVEL 3 (40%)';
      if (percentage >= 20) return 'LEVEL 2 (20%)';
      return 'LEVEL 1 (0%)';
    }

    window.onload = function() {
      const savedGoalName = localStorage.getItem('rdpu_goal_name');
      const savedTarget = parseFloat(localStorage.getItem('rdpu_target_custom'));
      const savedSaldo = parseFloat(localStorage.getItem('rdpu_saldo')) || 0;

      if (savedGoalName && savedTarget) {
        let percent = ((savedSaldo / savedTarget) * 100).toFixed(1);
        if (percent > 100) percent = 100;
        const levelStr = getLevelText(percent);

        document.getElementById('modal-icon').innerText = '🏦';
        document.getElementById('modal-title').innerText = 'Lanjutkan Tabungan?';
        document.getElementById('modal-sub-desc').style.display = 'block';
        document.getElementById('saving-summary').innerHTML = `
          <div>Nama Tabungan: <span>${savedGoalName}</span></div>
          <div>Level Pencapaian: <span style="color:#3730a3;">${levelStr}</span></div>
          <div>Saldo Terkumpul: <span style="color:#10b981;">${formatRupiah(savedSaldo)}</span></div>
          <div>Target Utama: <span>${formatRupiah(savedTarget)}</span> (${percent}%)</div>
        `;
        document.getElementById('modal-actions-wrap').innerHTML = `
          <button type="button" class="btn-modal-continue" onclick="goToDashboard()">LANJUTKAN TABUNGAN</button>
          <button type="button" class="btn-modal-reset" onclick="startNewGoal()">Buat Target Baru</button>
        `;
        modalEl.classList.add('active');
      }
    };

    function goToDashboard() { window.location.replace('/dashboard'); }
    function startNewGoal() { localStorage.clear(); modalEl.classList.remove('active'); }
    function showErrorModal(title, desc) {
      document.getElementById('modal-icon').innerText = '⚠️';
      document.getElementById('modal-title').innerText = title;
      document.getElementById('modal-sub-desc').style.display = 'none';
      document.getElementById('saving-summary').innerHTML = `<div style="text-align:center; color:#dc2626; font-size:0.9rem;">${desc}</div>`;
      document.getElementById('modal-actions-wrap').innerHTML = `<button type="button" class="btn-modal-continue" onclick="closeErrorModal()">OK, Saya Isi!</button>`;
      modalEl.classList.add('active');
    }
    function closeErrorModal() { modalEl.classList.remove('active'); }

    function handleSetupSubmit(e) {
      e.preventDefault();
      if (document.activeElement) document.activeElement.blur();
      
      const goalName = document.getElementById('goal-name').value.trim();
      const targetVal = parseRawNumber(targetInput.value);
      const periodVal = parseRawNumber(periodInput.value);

      if (!goalName) { showErrorModal('Input Belum Lengkap!', 'Harap isi <b>Nama Tabungan</b> kamu terlebih dahulu.'); return; }
      if (targetVal <= 0) { showErrorModal('Target Tidak Valid!', 'Harap masukkan nominal <b>Target Utama Tabungan</b> > Rp 0.'); return; }
      if (periodVal <= 0) { showErrorModal('Nominal Nabung Kosong!', 'Harap masukkan nominal <b>Rencana Nabung</b> > Rp 0.'); return; }

      if (mainFreq === 'hari' && daySubMode === 'custom') {
        const checkedDays = document.querySelectorAll('.day-pills-wrap input:checked');
        if (checkedDays.length === 0) {
          showErrorModal('Hari Belum Dipilih!', 'Harap pilih minimal <b>1 Hari</b> untuk jadwal nabung khusus.');
          return;
        }
      }

      // INTEGRASI PENYIMPANAN DATA DENGAN DASHBOARD
      localStorage.setItem('rdpu_goal_name', goalName);
      localStorage.setItem('rdpu_target_custom', targetVal);
      localStorage.setItem('rdpu_periodAmount', periodVal);
      localStorage.setItem('rdpu_freq', mainFreq);
      localStorage.setItem('rdpu_daySubMode', daySubMode);
      
      const customDays = Array.from(document.querySelectorAll('.day-pills-wrap input:checked')).map(el => el.value);
      localStorage.setItem('rdpu_customDays', JSON.stringify(customDays));

      localStorage.setItem('rdpu_saldo', 0);
      localStorage.setItem('rdpu_history', JSON.stringify([]));
      window.location.replace('/dashboard');
    }
    
        const inputEl = document.getElementById('saldo-input');
    const noteEl = document.getElementById('note-input');
    const modalEl = document.getElementById('app-modal');
    let currentTargetPercentage = 0;
    let isGoalCompletedCelebration = false;
    let isEstimasiAnimating = false;
    let editModalInterval = null; // INTERVAL LIVE TIMER DEFEK

    function verifyGoalData() {
      const goalName = localStorage.getItem('rdpu_goal_name');
      if (!goalName) { window.location.replace('/'); return false; }
      return true;
    }

    window.addEventListener('pageshow', function(event) {
      if (event.persisted || !verifyGoalData()) { window.location.replace('/'); }
    });

    function formatRupiah(angka) { return 'Rp ' + Number(angka).toLocaleString('id-ID'); }

    function attachRupiahFormatter(el) {
      el.addEventListener('keyup', function() {
        let number_string = this.value.replace(/[^,\d]/g, '').toString();
        let split = number_string.split(',');
        let sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        let ribuan = split[0].substr(sisa).match(/\d{3}/gi);
        if (ribuan) { let separator = sisa ? '.' : ''; rupiah += separator + ribuan.join('.'); }
        rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
        this.value = rupiah ? 'Rp ' + rupiah : '';
      });
    }

    attachRupiahFormatter(inputEl);

    function toggleEstimasi() {
      if (isEstimasiAnimating) return;
      const box = document.getElementById('est-box');
      const btnText = document.getElementById('btn-est-text');
      const btnIcon = document.getElementById('btn-est-icon');

      if (box.classList.contains('active')) {
        isEstimasiAnimating = true;
        box.classList.remove('active');
        box.classList.add('hiding');
        btnText.innerText = 'Lihat Estimasi Sisa Waktu';
        btnIcon.innerText = '⏳';
        setTimeout(() => { box.classList.remove('hiding'); isEstimasiAnimating = false; }, 250);
      } else {
        box.classList.remove('hiding');
        box.classList.add('active');
        btnText.innerText = 'Sembunyikan Estimasi';
        btnIcon.innerText = '🙈';
      }
    }

    function showModal(title, desc, type, isConfirmReset = false, onConfirm = null) {
      const iconEl = document.getElementById('modal-icon');
      document.getElementById('modal-title').innerText = title;
      document.getElementById('modal-desc').innerHTML = desc;

      if (type === 'success') { iconEl.className = 'modal-icon icon-success'; iconEl.innerText = '🎉'; }
      else if (type === 'warning') { iconEl.className = 'modal-icon icon-warning'; iconEl.innerText = '⚠️'; }
      else if (type === 'error') { iconEl.className = 'modal-icon icon-error'; iconEl.innerText = '❌'; }

      const actionsEl = document.getElementById('modal-actions');
      if (isConfirmReset) {
        actionsEl.innerHTML = `
          <button class="btn-modal-cancel" onclick="closeModal()">Batal</button>
          <button class="btn-modal-confirm" id="confirmModalBtn">Ya, Lanjutkan</button>
        `;
        document.getElementById('confirmModalBtn').onclick = () => { closeModal(); if (onConfirm) onConfirm(); };
      } else {
        actionsEl.innerHTML = `<button class="btn-modal-primary" onclick="closeModal()">OK, Siap!</button>`;
      }
      modalEl.classList.add('active');
      document.body.classList.add('modal-open');
    }

    function closeModal() { 
      if (editModalInterval) clearInterval(editModalInterval); // BERSIONALKAN TIMER INTERAL
      modalEl.classList.remove('active'); 
      document.body.classList.remove('modal-open');
      
      // JALANKAN ANIMASI PROGRESS BAR SETELAH MODAL DITUTUP
      animateProgressBar();

      if (isGoalCompletedCelebration) { triggerLongCelebration(); isGoalCompletedCelebration = false; }
    }

    function animateProgressBar() {
      const fillEl = document.getElementById('progress-fill');
      if (fillEl) fillEl.style.width = currentTargetPercentage.toFixed(1) + '%';
    }

    function triggerLongCelebration() {
      var duration = 3.5 * 1000;
      var animationEnd = Date.now() + duration;
      var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
      var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    function addMoneyProcess(amount, type, noteText = '') {
      const savedSaldo = parseFloat(localStorage.getItem('rdpu_saldo')) || 0;
      let newSaldo = savedSaldo;

      if (type === 'deposit') {
        newSaldo += amount;
      } else if (type === 'withdraw') {
        if (amount > savedSaldo) {
          showModal('Saldo Tidak Cukup!', `Kamu ingin menarik <b>${formatRupiah(amount)}</b>, tapi saldo saat ini cuma <b>${formatRupiah(savedSaldo)}</b>.`, 'error');
          return;
        }
        newSaldo -= amount;
      }

      const defaultNote = type === 'deposit' ? 'Setoran Tabungan' : 'Penarikan Saldo';
      const finalNote = noteText.trim() !== '' ? noteText.trim() : defaultNote;

      addHistoryItem(newSaldo, amount, type, finalNote);
      recalculateAllHistoryAndSaldo();

      const targetAmount = parseFloat(localStorage.getItem('rdpu_target_custom')) || 500000;
      if (type === 'deposit') {
        if (newSaldo >= targetAmount) {
          isGoalCompletedCelebration = true;
          showModal('🎉 TARGET UTAMA TERCAPAI! 🔥', `Selamat! Saldo kamu mencapai <b>${formatRupiah(newSaldo)}</b>. Target utama <b>${formatRupiah(targetAmount)}</b> telah kamu capai secara sempurna! 🚀`, 'success');
        } else {
          showModal('Berhasil Nabung! 🎉', `Saldo bertambah <b>+${formatRupiah(amount)}</b> (${finalNote}).`, 'success');
        }
      } else {
        showModal('Penarikan Berhasil! 💸', `Saldo berkurang <b>-${formatRupiah(amount)}</b> (${finalNote}).`, 'warning');
      }

      inputEl.value = '';
      noteEl.value = '';
    }

    function handleQuickAdd(val) {
      showModal(
        'Tambah Saldo Cepat',
        `Apakah kamu yakin ingin menambahkan <b>${formatRupiah(val)}</b> ke tabungan?`,
        'warning',
        true,
        () => addMoneyProcess(val, 'deposit', 'Isi Cepat')
      );
    }

    function handleUpdate(type) {
      const cleanVal = inputEl.value.replace(/[^0-9]/g, '');
      if (cleanVal === '') {
        showModal('Input Kosong!', 'Harap masukkan nominal angka terlebih dahulu.', 'error');
        return;
      }

      const amount = parseFloat(cleanVal);
      if (amount <= 0) {
        showModal('Input Tidak Valid!', 'Nominal transaksi harus lebih besar dari Rp 0.', 'error');
        return;
      }

      const noteText = noteEl.value;
      addMoneyProcess(amount, type, noteText);
    }

    function renderUI(currentAmount) {
      const goalName = localStorage.getItem('rdpu_goal_name') || "Target Nabung";
      const targetAmount = parseFloat(localStorage.getItem('rdpu_target_custom')) || 500000;
      
      const freq = localStorage.getItem('rdpu_freq') || 'hari';
      const daySubMode = localStorage.getItem('rdpu_daySubMode') || 'everyday';
      const period = parseFloat(localStorage.getItem('rdpu_periodAmount')) || 20000;
      const customDays = JSON.parse(localStorage.getItem('rdpu_customDays') || '[]');

      document.getElementById('dash-goal-title').innerText = `🎯 ${goalName}`;

      let percentage = (currentAmount / targetAmount) * 100;
      if (percentage > 100) percentage = 100;
      
      currentTargetPercentage = percentage;

      let remaining = targetAmount - currentAmount;
      if (remaining < 0) remaining = 0;

      let daysLeft = 0;
      let totalTimesNeeded = Math.ceil(remaining / period);

      if (remaining === 0) {
        daysLeft = 0;
      } else {
        if (freq === 'hari') {
          if (daySubMode === 'custom') {
            const activeDays = customDays.length > 0 ? customDays.length : 1;
            daysLeft = Math.ceil((totalTimesNeeded / activeDays) * 7);
          } else {
            daysLeft = totalTimesNeeded;
          }
        } else if (freq === 'minggu') {
          daysLeft = totalTimesNeeded * 7;
        } else if (freq === 'bulan') {
          daysLeft = totalTimesNeeded * 30;
        }
      }

      let weeksLeft = (daysLeft / 7).toFixed(1);
      let monthsLeft = (daysLeft / 30).toFixed(1);

      document.getElementById('est-days').innerText = daysLeft.toLocaleString('id-ID');
      document.getElementById('est-weeks').innerText = weeksLeft;
      document.getElementById('est-months').innerText = monthsLeft;

      const quoteEl = document.getElementById('est-quote');
      if (remaining === 0) {
        quoteEl.innerHTML = '🏆 <b>Target Lunas!</b> Kamu berhasil mencapai target 100%.';
      } else if (daysLeft <= 14) {
        quoteEl.innerHTML = '🔥 <b>Sudah Dekat Sekali!</b> Sedikit lagi target utama kamu selesai!';
      } else if (daysLeft <= 60) {
        quoteEl.innerHTML = '💪 <b>Progres Bagus!</b> Tetap konsisten nabung sesuai jadwal ya.';
      } else {
        quoteEl.innerHTML = '💡 <i>"Setiap langkah kecil membawamu makin dekat ke tujuan."</i>';
      }

      const levels = [
        { id: 0, val: 0, defaultText: '1' },
        { id: 20, val: 20, defaultText: '2' },
        { id: 40, val: 40, defaultText: '3' },
        { id: 60, val: 60, defaultText: '4' },
        { id: 80, val: 80, defaultText: '5' },
        { id: 100, val: 100, defaultText: 'MAX' }
      ];

      levels.forEach(lvl => {
        const stepEl = document.getElementById(`step-${lvl.id}`);
        const circleEl = document.getElementById(`circle-${lvl.id}`);
        if (stepEl && circleEl) {
          stepEl.classList.remove('active', 'completed');
          if (percentage >= lvl.val) {
            stepEl.classList.add('completed');
            circleEl.innerText = (lvl.val > 0 && lvl.val < 100) ? '✓' : lvl.defaultText;
          } else {
            circleEl.innerText = lvl.defaultText;
          }
        }
      });

      const levelBadge = document.getElementById('level-badge');
      if (percentage >= 100) { levelBadge.innerText = 'LEVEL MAX (100%)'; document.getElementById('step-100').classList.add('active'); }
      else if (percentage >= 80) { levelBadge.innerText = 'LEVEL 5 (80%)'; document.getElementById('step-80').classList.add('active'); }
      else if (percentage >= 60) { levelBadge.innerText = 'LEVEL 4 (60%)'; document.getElementById('step-60').classList.add('active'); }
      else if (percentage >= 40) { levelBadge.innerText = 'LEVEL 3 (40%)'; document.getElementById('step-40').classList.add('active'); }
      else if (percentage >= 20) { levelBadge.innerText = 'LEVEL 2 (20%)'; document.getElementById('step-20').classList.add('active'); }
      else { levelBadge.innerText = 'LEVEL 1 (0%)'; document.getElementById('step-0').classList.add('active'); }

      document.getElementById('target-text').innerText = formatRupiah(targetAmount);
      document.getElementById('percent-text').innerText = percentage.toFixed(1) + '%';
      document.getElementById('current-text').innerText = formatRupiah(currentAmount);
      document.getElementById('remaining-text').innerText = formatRupiah(remaining);

      // JIKA MODAL TIDAK AKTIF, UPDATE LANGSUNG ANIMASI BAR
      if (!modalEl.classList.contains('active')) {
        animateProgressBar();
      }
    }

    function addHistoryItem(totalSaldo, amount, type, note) {
      let historyArr = JSON.parse(localStorage.getItem('rdpu_history')) || [];
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      historyArr.unshift({ 
        id: Date.now(), 
        amount: totalSaldo, 
        diff: amount, 
        type: type, 
        note: note, 
        date: dateStr,
        isEdited: false,
        lastEditTime: 0
      });
      if (historyArr.length > 20) historyArr.pop();

      localStorage.setItem('rdpu_history', JSON.stringify(historyArr));
    }

    function recalculateAllHistoryAndSaldo() {
      let historyArr = JSON.parse(localStorage.getItem('rdpu_history')) || [];
      
      let runningSaldo = 0;
      let reversedHistory = historyArr.slice().reverse();

      reversedHistory.forEach(item => {
        if (item.type === 'deposit') {
          runningSaldo += item.diff;
        } else if (item.type === 'withdraw') {
          runningSaldo -= item.diff;
        }
        item.amount = runningSaldo < 0 ? 0 : runningSaldo;
      });

      if (runningSaldo < 0) runningSaldo = 0;

      historyArr = reversedHistory.reverse();
      localStorage.setItem('rdpu_history', JSON.stringify(historyArr));
      localStorage.setItem('rdpu_saldo', runningSaldo);

      renderUI(runningSaldo);
      renderHistoryUI();
    }

    function renderHistoryUI() {
      let historyArr = JSON.parse(localStorage.getItem('rdpu_history')) || [];
      const listEl = document.getElementById('history-list');
      document.getElementById('history-count').innerText = `${historyArr.length} Catatan`;

      if (historyArr.length === 0) {
        listEl.innerHTML = `<li style="text-align:center; color:#94a3b8; font-size:0.85rem; padding: 10px 0;">Belum ada histori transaksi</li>`;
        return;
      }

      listEl.innerHTML = historyArr.map(item => {
        const isPlus = item.type !== 'withdraw';
        const badgeClass = isPlus ? 'diff-plus' : 'diff-minus';
        const sign = isPlus ? '+' : '-';
        const noteText = item.note || (isPlus ? 'Setoran' : 'Penarikan');

        return `
          <li class="history-item">
            <div>
              <div class="history-note">${noteText}</div>
              <div class="history-date">${item.date} • Saldo: ${formatRupiah(item.amount)}</div>
            </div>
            <div class="history-right">
              <span class="history-diff ${badgeClass}">${sign}${formatRupiah(item.diff)}</span>
              <button type="button" class="btn-edit-item" onclick="openEditModal(${item.id})">✏️</button>
            </div>
          </li>
        `;
      }).join('');
    }

    // FUNGSI EDIT PINTAR: MATEMATIKA MILIDETIK + LIVE TIMER DEFEK PER DETIK + TEXT HIGHLIGHT
    function openEditModal(itemId) {
      if (editModalInterval) clearInterval(editModalInterval);

      let historyArr = JSON.parse(localStorage.getItem('rdpu_history')) || [];
      const item = historyArr.find(h => h.id === itemId);
      if (!item) return;

      const now = Date.now();
      const lastEdit = item.lastEditTime || 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const timePassed = now - lastEdit;
      
      const isNominalLocked = item.isEdited && (timePassed < twentyFourHours);

      const editFormHtml = `
        <div style="text-align:left; margin-bottom: 0.5rem;">
          <label style="font-size:0.75rem; color:#64748b; font-weight:700;">Nominal Transaksi Baru:</label>
          <input type="text" id="edit-modal-amount" value="${formatRupiah(item.diff)}" ${isNominalLocked ? 'disabled style="margin-top:2px; margin-bottom:4px; background:#f1f5f9; color:#94a3b8; cursor:not-allowed;"' : 'style="margin-top:2px; margin-bottom:10px;"'}>
          ${isNominalLocked ? `<div style="font-size:0.68rem; color:#d97706; margin-bottom:8px;">🔒 <b>Nominal dikunci </b> (<b id="cooldown-timer-text">...</b>).</div>` : ''}
          
          <label style="font-size:0.75rem; color:#64748b; font-weight:700;">Catatan/Keterangan Baru:</label>
          <input type="text" id="edit-modal-note" value="${item.note || ''}" style="margin-top:2px;">
        </div>

        <div class="edit-warning-note">
          💡 <b>Peringatan:</b> Mengubah nominal angka akan memperbarui <b>saldo utama</b> & mengunci edit nominal selama <b>24 Jam!</b> Catatan/keterangan tetap <b>bebas diubah</b> kapan saja.
        </div>
      `;

      showModal('Edit Transaksi ✏️', editFormHtml, 'warning', true, () => {
        if (editModalInterval) clearInterval(editModalInterval);

        const newAmountVal = parseRawNumber(document.getElementById('edit-modal-amount').value);
        const newNoteVal = document.getElementById('edit-modal-note').value.trim();

        if (newAmountVal <= 0) {
          setTimeout(() => {
            showModal('Nominal Tidak Valid!', 'Nominal transaksi harus lebih besar dari <b>Rp 0</b>.', 'error');
          }, 150);
          return;
        }

        const isAmountChanged = newAmountVal !== item.diff;

        item.diff = newAmountVal;
        item.note = newNoteVal !== '' ? newNoteVal : (item.type === 'deposit' ? 'Setoran Tabungan' : 'Penarikan Saldo');

        if (isAmountChanged) {
          item.isEdited = true;
          item.lastEditTime = Date.now();
        }

        localStorage.setItem('rdpu_history', JSON.stringify(historyArr));
        recalculateAllHistoryAndSaldo();
      });

      // UPDATE COUNTDOWN TIMER REAL-TIME PER DETIK DI MODAL
      if (isNominalLocked) {
        const updateTimerDisplay = () => {
          const currentTime = Date.now();
          const currentPassed = currentTime - lastEdit;
          const remainingMs = twentyFourHours - currentPassed;

          if (remainingMs <= 0) {
            clearInterval(editModalInterval);
            const timerEl = document.getElementById('cooldown-timer-text');
            if (timerEl) timerEl.innerText = "Selesai! Silakan buka ulang modal";
            return;
          }

          const h = Math.floor(remainingMs / (1000 * 60 * 60));
          const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

          const timerEl = document.getElementById('cooldown-timer-text');
          if (timerEl) {
            timerEl.innerText = `${h} Jam ${m} Menit ${s} Detik lagi`;
          }
        };

        updateTimerDisplay();
        editModalInterval = setInterval(updateTimerDisplay, 1000);
      }

      const modalAmountEl = document.getElementById('edit-modal-amount');
      if (modalAmountEl && !isNominalLocked) attachRupiahFormatter(modalAmountEl);
    }

    function parseRawNumber(str) { if (!str) return 0; return parseFloat(str.replace(/[^0-9]/g, '')) || 0; }

    function triggerResetModal() {
      showModal(
        'Konfirmasi Reset!',
        'Apakah kamu yakin ingin mereset seluruh progres & riwayat transaksi? Kamu akan diarahkan kembali ke halaman setup.',
        'warning',
        true,
        () => {
          localStorage.clear();
          window.location.replace('/');
        }
      );
    }

    window.onload = function() {
      if (!verifyGoalData()) return;

      history.pushState(null, null, location.href);
      window.onpopstate = function () {
        if (!localStorage.getItem('rdpu_goal_name')) { window.location.replace('/'); }
        else { history.pushState(null, null, location.href); }
      };

      recalculateAllHistoryAndSaldo();
      animateProgressBar();
    };