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