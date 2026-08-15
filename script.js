// Variable global untuk menyimpan posisi scroll sebelum modal dibuka
let savedScrollPosition = 0;

document.addEventListener("DOMContentLoaded", () => {
  
  setTimeout(() => {
    document.body.classList.remove('preload');
  }, 50); // 50 milidetik

  // ==========================================================================
  // 1. THEME TOGGLE (DARK / LIGHT MODE)
  // ==========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (themeToggle) {
    if (localStorage.getItem('portfolio-theme') === 'light') {
      body.classList.add('light-theme');
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-sun';
    }

    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      body.classList.toggle('light-theme');
      
      const isLight = body.classList.contains('light-theme');
      localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
      
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    });
  }

  // ==========================================================================
  // 2. HAMBURGER MENU TOGGLE (MOBILE NAV - INSTANT SOLID FIX)
  // ==========================================================================
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const navbarEl = document.querySelector('.navbar');

  if (menuToggle && navLinks && navbarEl) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('show');
      navbarEl.classList.toggle('menu-open', isOpen);
      
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });
  }

  // ==========================================================================
  // 3. NAVBAR SCROLLED DETECTOR
  // ==========================================================================
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 5) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ==========================================================================
  // 4. SMOOTH PROJECT FILTER ANIMATION
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          const isMatch = (filterValue === 'all' || category === filterValue);

          if (isMatch) {
            card.classList.remove('is-hidden');
            setTimeout(() => { card.classList.remove('hide'); }, 10);
          } else {
            card.classList.add('hide');
            setTimeout(() => {
              if (card.classList.contains('hide')) {
                card.classList.add('is-hidden');
              }
            }, 350);
          }
        });
      });
    });
  }

  // ==========================================================================
  // 5. HANDLE WEB3FORMS SUBMIT
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-btn');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Kirim Pesan';

      if (submitBtn) {
        submitBtn.innerText = 'Mengirim...';
        submitBtn.disabled = true;
      }

      const formData = new FormData(contactForm);
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          showModal("Pesan Terkirim! 🚀", "Terima kasih, pesan kamu sudah masuk!", "fa-circle-check");
          contactForm.reset();
        } else {
          showModal("Gagal Mengirim ❌", json.message || "Terjadi kesalahan.", "fa-circle-xmark");
        }
      })
      .catch(() => {
        showModal("Gagal Mengirim ❌", "Cek koneksi internet kamu.", "fa-circle-xmark");
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      });
    });
  }

  // ==========================================================================
  // 6. EVENT LISTENER: CLOSE MODAL ON BACKDROP CLICK
  // ==========================================================================
  const modalOverlay = document.getElementById('custom-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

}); // <--- PENUTUP SCRIPT UTAMA YANG KEMARIN HILANG!

// ==========================================================================
// 7. SYSTEM MODAL POP-UP
// ==========================================================================
function showModal(title = "Berhasil!", desc = "Pesan kamu sudah terkirim 🚀", iconClass = "fa-circle-check") {
  const modalOverlay = document.getElementById('custom-modal');
  if (!modalOverlay) return;

  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const iconEl = modalOverlay.querySelector('.modal-icon i');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  if (iconEl) iconEl.className = `fa-solid ${iconClass}`;

  savedScrollPosition = window.scrollY;
  modalOverlay.classList.add('active');
  document.body.classList.add('modal-open');
  document.body.style.top = `-${savedScrollPosition}px`;
}

function closeModal() {
  const modalOverlay = document.getElementById('custom-modal');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollPosition);
  }
}

// ==========================================================================
// 8. COPY EMAIL TO CLIPBOARD
// ==========================================================================
function copyEmailToClipboard(emailAddress) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(emailAddress)
      .then(() => { showModal("Email Disalin! 🚀", emailAddress, "fa-copy"); })
      .catch(() => { fallbackCopyText(emailAddress); });
  } else {
    fallbackCopyText(emailAddress);
  }
}

function fallbackCopyText(textToCopy) {
  const tempInput = document.createElement("textarea");
  tempInput.value = textToCopy;
  tempInput.style.position = "fixed";
  tempInput.style.left = "-9999px";
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  try {
    document.execCommand("copy");
    showModal("Email Disalin! 🚀", textToCopy, "fa-copy");
  } catch (err) {
    showModal("Email Disalin! 🚀", textToCopy, "fa-copy");
  }
  document.body.removeChild(tempInput);
}
