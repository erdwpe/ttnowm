/* ==========================
    COUNTDOWN RAMADHAN
========================== */
function initRamadanCountdown() {
  const target = new Date(2026, 1, 18, 0, 0, 0);

  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMinutes = document.getElementById('cdMinutes');
  const elSeconds = document.getElementById('cdSeconds');
  const elMsg = document.getElementById('countdownMessage');

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  function update() {
    const now = new Date();
    let diff = Math.max(0, target - now);

    if (diff <= 0) {
      elDays.textContent = '0';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      elMsg.style.display = 'block';
      elMsg.textContent = '🌙 Ramadhan telah dimulai!';
      clearInterval(intervalId);
      return;
    }

    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    elDays.textContent = days;
    elHours.textContent = String(hours).padStart(2, '0');
    elMinutes.textContent = String(minutes).padStart(2, '0');
    elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  update();
  var intervalId = setInterval(update, 1000);
}
// ----- FAQ: close details when switching tabs + make accordion behavior -----
function closeAllDetails() {
  document.querySelectorAll('#faqTab details[open]').forEach(d => d.removeAttribute('open'));
}

// 1) Close FAQ details whenever a tab button is clicked (safe even if not FAQ)
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    // after switching tab (if you call switchTab earlier), ensure FAQ details close
    // small timeout to allow other tab logic to run first (optional)
    setTimeout(closeAllDetails, 0);
  });
});

// 2) Make FAQ behave like an accordion: when opening one <details> close the others
document.querySelectorAll('#faqTab details summary').forEach(summary => {
  summary.addEventListener('click', function (e) {
    const details = this.parentElement; // the <details> element
    // if details already open, clicking summary will close it natively — we only close others
    if (!details.hasAttribute('open')) {
      // close other open details
      document.querySelectorAll('#faqTab details[open]').forEach(d => {
        if (d !== details) d.removeAttribute('open');
      });
      // allow this one to open normally
    } else {
      // clicked on an already open details -> will close; nothing else to do
    }
  });
});

// ---------- UNIVERSAL TAB SWITCHER (replace old tab handlers) ----------
/* ===== Unified tab-switcher (replace old tab code) ===== */
(function() {
  const tabButtons = document.querySelectorAll('.tabs button');
  const tabContents = document.querySelectorAll('.tab-content');

  function deactivateAll() {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
  }

  function showTabById(tabId) {
    const content = document.getElementById(tabId);
    if (!content) return;
    deactivateAll();
    // activate the content
    content.classList.add('active');
    // activate corresponding button (by matching data-target)
    const btn = Array.from(tabButtons).find(x => x.dataset.target === tabId);
    if (btn) btn.classList.add('active');

    // if countdown tab, init once
    if (tabId === 'countdownTab' && !window.__ramadanCountdownInited) {
      try { initRamadanCountdown(); window.__ramadanCountdownInited = true; } 
      catch(e){ console.warn('Countdown init error', e); }
    }
  }

  // wire buttons
  tabButtons.forEach(btn => {
    const target = btn.dataset.target;
    // safety: ensure dataset.target exists
    if (!target) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showTabById(target);
    });
  });

  // sync initial active tab: prefer a button with class active, else show downloadTab
  (function init() {
    const activeBtn = document.querySelector('.tabs button.active');
    const startTarget = activeBtn && activeBtn.dataset.target ? activeBtn.dataset.target : 'downloadTab';
    showTabById(startTarget);
  })();

})();


/* ==========================
      FORMAT DATE
========================== */
function formatDate() {
  return new Date().toISOString().split("T")[0];
}

/* ==========================
      ZIP DOWNLOAD
========================== */
function downloadImagesAsZip(imageUrls, zipName) {
  Swal.fire({
    title: 'Membuat ZIP...',
    html: 'Harap tunggu...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const zip = new JSZip();
  const folder = zip.folder(zipName.replace(".zip", ""));

  const tasks = imageUrls.map((url, i) =>
    fetch(url).then(r => r.blob()).then(b => folder.file(`image${i+1}.jpg`, b))
  );

  Promise.all(tasks).then(() => {
    zip.generateAsync({ type: "blob" }).then(content => {
      Swal.close();
      saveAs(content, zipName);
      Swal.fire("Berhasil!", "ZIP berhasil diunduh.", "success");
    });
  });
}

/* ==========================
      DOWNLOAD VIDEO
========================== */
function downloadVideo() {
  const url = document.getElementById('tiktokURL').value;
  const resultDiv = document.getElementById('result');

  if (!url) return Swal.fire("Oops!", "Masukkan link terlebih dahulu.", "warning");

  /* ==========================
        TIKTOK HANDLER
  =========================== */
  if (url.includes("tiktok.com")) {
    Swal.fire({
      title: 'Memproses...',
      text: 'Mengambil data TikTok...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => {
        Swal.close();

        if (!data.data) return Swal.fire("Error", "Video tidak ditemukan", "error");

        const v = data.data;
        const isImg = Array.isArray(v.images);

        // build output
        resultDiv.innerHTML = `
          <div class="card">
            ${isImg ? `
              <form id="imageForm"><div class="image-grid">
                ${v.images.map(img => `
                  <label class="image-checkbox">
                    <input type="checkbox" name="img" value="${img}">
                    <img src="${img}" class="thumb">
                  </label>
                `).join("")}
              </div></form>
            ` : `<img src="${v.cover}" class="thumb">`}

            <h2>${v.title || "Tanpa judul"}</h2>
            <p><strong>Author:</strong> ${v.author.nickname} (@${v.author.unique_id})</p>

            <div class="button-wrapper">
              ${isImg ? `
                <button id="zipAllBtn" class="btn">Unduh Semua</button>
                <button id="zipSelectedBtn" class="btn">Unduh Terpilih</button>
              ` : `
                <button id="openDownloadBtn" class="btn">Unduh Video</button>
              `}
            </div>
          </div>
        `;

        // event listener
        if (isImg) {
          document.getElementById("zipAllBtn").onclick = () =>
            downloadImagesAsZip(v.images, `tiktok-${formatDate()}.zip`);

          document.getElementById("zipSelectedBtn").onclick = () => {
            const selected = [...document.querySelectorAll('input[name="img"]:checked')].map(x => x.value);
            if (!selected.length) return Swal.fire("Tidak ada gambar dipilih");
            downloadImagesAsZip(selected, `tiktok-selected-${formatDate()}.zip`);
          };

          Swal.fire("Slide Foto", "Pilih gambar atau unduh semua", "info");
        } else {
          document.getElementById("openDownloadBtn").onclick = () =>
            window.open(v.play, "_blank");

          Swal.fire("Berhasil!", "Video siap diunduh.", "success");
        }

        document.querySelector('[data-target="resultTab"]').click();
      });

    return;
  }

  /* ==========================
        IG HANDLER
  =========================== */
  if (url.includes("instagram.com")) {
    Swal.fire({
      title: "Memproses...",
      text: "Mengambil data Instagram...",
      didOpen: () => Swal.showLoading()
    });

    const isStory = url.includes('/stories/');
    function igFallback() {
      fetch(`https://api.ryzumi.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`)
        .then(r => r.json())
        .then(data => {
          Swal.close();
          if (!data.data) return Swal.fire("Error", "Data tidak ditemukan", "error");

          resultDiv.innerHTML = data.data.map((m, i) => `
            <div class="card">
              <button class="btn" onclick="window.open('${m.url}', '_blank')">Unduh Media ${i+1}</button>
            </div>
          `).join("");

          document.querySelector('[data-target="resultTab"]').click();
        });
    }

    if (isStory) return igFallback();

    fetch("https://erdwpe.it.com/proxy/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })
      .then(r => r.json())
      .then(data => {
        Swal.close();
        if (!data.files) return igFallback();

        resultDiv.innerHTML = data.files.map((m, i) => `
          <div class="card">
            <img src="${m.thumbnail}" class="thumb">
            <button class="btn" onclick="window.open('${m.url}', '_blank')">Unduh Media ${i+1}</button>
          </div>
        `).join("");

        document.querySelector('[data-target="resultTab"]').click();
      })
      .catch(() => igFallback());

    return;
  }

  /* ==========================
        FACEBOOK HANDLER
  =========================== */
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    Swal.fire({
      title: "Memproses...",
      text: "Mengambil data Facebook...",
      didOpen: () => Swal.showLoading()
    });

    fetch(`https://api.ryzumi.vip/api/downloader/fbdl?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => {
        Swal.close();
        if (!data.data) return Swal.fire("Error", "Video tidak ditemukan", "error");

        resultDiv.innerHTML = data.data.map((v, i) => `
          <div class="card">
            <img src="${v.thumbnail}" class="thumb">
            <button class="btn" onclick="window.open('${v.url}', '_blank')">Unduh Video ${i+1}</button>
          </div>
        `).join("");

        document.querySelector('[data-target="resultTab"]').click();
      });

    return;
  }

  Swal.fire("Error", "Link tidak valid", "error");
}

/* ==========================
      QRIS POPUP
========================== */
// QRIS popup (robust)
const btnQRIS = document.getElementById("btnQRIS");
const popupQRIS = document.getElementById("popupQRIS");
const downloadQrisBtn = document.getElementById("downloadQrisBtn");

// show popup only when button clicked
if (btnQRIS && popupQRIS) {
  btnQRIS.addEventListener("click", () => {
    // ensure popup is hidden first, then show
    popupQRIS.classList.add("show");
    popupQRIS.setAttribute("aria-hidden", "false");
  });
}

// close function
function closePopupQRIS() {
  if (!popupQRIS) return;
  popupQRIS.classList.remove("show");
  popupQRIS.setAttribute("aria-hidden", "true");
}

// click outside modal closes it
popupQRIS && popupQRIS.addEventListener("click", (e) => {
  if (e.target === popupQRIS) closePopupQRIS();
});

// close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && popupQRIS && popupQRIS.classList.contains("show")) {
    closePopupQRIS();
  }
});


/* ==========================
 ENTER TO SUBMIT
========================== */
document.getElementById("tiktokURL").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    downloadVideo();
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
