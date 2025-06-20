function formatDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

function downloadImagesAsZip(imageUrls, zipName) {
  Swal.fire({
    title: 'Membuat ZIP...',
    html: 'Harap tunggu, sedang mengunduh gambar...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const zip = new JSZip();
  const folder = zip.folder(zipName.replace(".zip", ""));

  const fetches = imageUrls.map((url, i) =>
    fetch(url)
      .then(res => res.blob())
      .then(blob => folder.file(`image${i + 1}.jpg`, blob))
  );

  Promise.all(fetches).then(() =>
    zip.generateAsync({ type: "blob" }).then(content => {
      Swal.close();
      saveAs(content, zipName);
      Swal.fire('Berhasil!', 'ZIP berhasil diunduh.', 'success');
    })
  );
}

// Tab Switching
const tabDownload = document.getElementById("tabDownload");
const tabResult = document.getElementById("tabResult");
const tabFaq = document.getElementById("tabFaq");
const tabDonasi = document.getElementById("tabDonasi");

const downloadTab = document.getElementById("downloadTab");
const resultTab = document.getElementById("resultTab");
const faqTab = document.getElementById("faqTab");
const donasiTab = document.getElementById("donasiTab");

tabDownload.addEventListener("click", () => {
  tabDownload.classList.add("active");
  tabResult.classList.remove("active");
  tabFaq.classList.remove("active");
  tabDonasi.classList.remove("active");
  downloadTab.classList.add("active");
  resultTab.classList.remove("active");
  faqTab.classList.remove("active");
  donasiTab.classList.remove("active");
});
tabResult.addEventListener("click", () => {
  tabDownload.classList.remove("active");
  tabResult.classList.add("active");
  tabFaq.classList.remove("active");
  tabDonasi.classList.remove("active");
  downloadTab.classList.remove("active");
  resultTab.classList.add("active");
  faqTab.classList.remove("active");
  donasiTab.classList.remove("active");
});
tabFaq.addEventListener("click", () => {
  tabDownload.classList.remove("active");
  tabResult.classList.remove("active");
  tabFaq.classList.add("active");
  tabDonasi.classList.remove("active");
  downloadTab.classList.remove("active");
  resultTab.classList.remove("active");
  faqTab.classList.add("active");
  donasiTab.classList.remove("active");
});
tabDonasi.addEventListener("click", () => {
  tabDownload.classList.remove("active");
  tabResult.classList.remove("active");
  tabFaq.classList.remove("active");
  tabDonasi.classList.add("active");
  downloadTab.classList.remove("active");
  resultTab.classList.remove("active");
  faqTab.classList.remove("active");
  donasiTab.classList.add("active");
});

function downloadVideo() {
  const url = document.getElementById('tiktokURL').value;
  const resultDiv = document.getElementById('result');
  const downloadArea = document.getElementById('downloadArea');

  if (!url) {
    Swal.fire('Oops!', 'Silakan masukkan link terlebih dahulu.', 'warning');
    return;
  }

  if (url.includes("tiktok.com")) {
    Swal.fire({
      title: 'Sedang mencari data...',
      text: 'Harap tunggu, memproses link Tiktok...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
          fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const video = data.data;
            const isImagePost = Array.isArray(video.images) && video.images.length > 0;
    
            // Bangun HTML lengkap dulu
            resultDiv.innerHTML = `
              <div class="card">
                ${isImagePost
                  ? `<form id="imageForm"><div class="image-grid">
                        ${video.images.map((img) => `
                          <label class="image-checkbox">
                          <input type="checkbox" name="img" value="${img}">
                          <img src="${img}" class="thumb" loading="lazy">
                          </label>`).join("")}
                    </div></form>`
                  : `<img src="${video.cover}" alt="thumbnail" class="thumb" />`}
                <h2>${video.title || 'Tanpa judul'}</h2>
                <p><strong>👤 Author:</strong> ${video.author.nickname} (@${video.author.unique_id})</p>
                <p><strong>🎵 Musik:</strong> ${video.music_info?.title || 'Tidak tersedia'}</p>
                <p><strong>📅 Diposting:</strong> ${new Date(video.create_time * 1000).toLocaleDateString()}</p>
                <div class="button-wrapper">
                  ${isImagePost
                    ? `
                      <button id="zipAllBtn" class="btn">🗂️ Unduh Semua Gambar</button>
                      <button id="zipSelectedBtn" class="btn">✅ Unduh Terpilih</button>
                    `
                    : `<button id="openDownloadBtn" class="btn">💾 Unduh Video</button>`
                  }
                  ${video.music_info?.play
                    ? `<button id="mp3DownloadBtn" class="btn">🎧 Unduh MP3</button>`
                    : ''
                  }
                </div>
              </div>
            `;
    
            // 🔗 Pasang tombol klik setelah elemen sudah muncul
            if (isImagePost) {
              document.getElementById("zipAllBtn").addEventListener("click", () => {
                downloadImagesAsZip(video.images, `tiktok-slide-${formatDate()}.zip`);
              });
    
              document.getElementById("zipSelectedBtn").addEventListener("click", () => {
                const selected = Array.from(document.querySelectorAll('input[name="img"]:checked')).map(el => el.value);
                if (selected.length === 0) {
                  Swal.fire('Tidak ada gambar terpilih!', 'Pilih minimal 1 gambar.', 'warning');
                  return;
                }
                downloadImagesAsZip(selected, `tiktok-selected-${formatDate()}.zip`);
              });
    
              Swal.fire('Slide Foto Terdeteksi', 'Silakan pilih gambar yang ingin Anda unduh Atau Anda Dapat Langsung Menggunduh Semua Foto Pilih "Unduh Semua Gambar" Nanti Otomatis Akan Menggunduh Semua Dalam Bentuk Zip', 'info');
            } else {
              document.getElementById("openDownloadBtn").addEventListener("click", () => {
                window.open(video.play, '_blank');
              });
    
              Swal.fire('Berhasil!', 'Video berhasil ditampilkan.', 'success');
            }
    
            if (video.music_info?.play) {
              document.getElementById("mp3DownloadBtn").addEventListener("click", () => {
                window.open(video.music_info.play, '_blank');
              });
            }
    
            tabResult.click(); // pindah ke tab detail
          } else {
            Swal.fire('Gagal!', 'Video tidak ditemukan atau link salah.', 'error');
          }
        });
    
  } else if (url.includes("instagram.com")) {
    Swal.fire({
      title: 'Sedang mencari data...',
      text: 'Harap tunggu, memproses link Instagram...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    const isStoryURL = url.includes('/stories/');

    function useRyzumiAPI() {
      fetch(`https://api.ryzumi.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
            Swal.fire('Gagal!', 'Data tidak ditemukan.', 'error');
            return;
          }
    
          const results = data.data.reverse(); // Menampilkan story terbaru dulu
          Swal.close();
          resultDiv.innerHTML = results.map((item, i) => `
            <div class="card">
              <button class="btn" onclick="window.open('${item.url}', '_blank')">
                ⬇ Unduh Media ${i + 1}
              </button>
            </div>
          `).join("");
    
          Swal.fire('Berhasil!', 'Konten berhasil dimuat.', 'success');
          tabResult.click();
        })
        .catch(err => {
          console.error(err);
          Swal.fire('Error!', 'Gagal memuat dari', 'error');
        });
    }
    
    if (isStoryURL) {
      // Story langsung pakai Ryzumi
      useRyzumiAPI();
    } else {
      // Coba fetch dari backend kamu dulu
      fetch('https://api-tiktok-three.vercel.app/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
            throw new Error('Data kosong.');
          }
    
          const results = data.files;
          Swal.close();
          resultDiv.innerHTML = results.map((item, i) => `
            <div class="card">
            <img src="${item.thumbnail}" class="thumb" />
              <button class="btn" onclick="window.open('${item.url}', '_blank')">
                ⬇ Unduh Media ${i + 1}
              </button>
            </div>
          `).join("");
    
          Swal.fire('Berhasil!', 'Konten berhasil dimua.', 'success');
          tabResult.click();
        })
        .catch(err => {
          console.warn('Fallback ke API Ryzumi karena backend error:', err);
          useRyzumiAPI(); // Fallback otomatis
        });
    }
    
  } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
    Swal.fire({
      title: 'Sedang mencari data...',
      text: 'Harap tunggu, memproses link Facebook...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    fetch(`https://api.ryzumi.vip/api/downloader/fbdl?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
          Swal.fire('Gagal!', 'Data tidak ditemukan.', 'error');
          return;
        }

        const results = data.data;
        Swal.close();
        resultDiv.innerHTML = results.map((item, i) => `
          <div class="card">
            <img src="${item.thumbnail}" class="thumb" />
            <p><strong>Resolusi:</strong> ${item.resolution || 'N/A'}</p>
            <button class="btn" onclick="window.open('${item.url}', '_blank')">
              ⬇ Unduh Video ${i + 1}
            </button>
          </div>
        `).join("");

        Swal.fire('Berhasil!', 'Video berhasil ditemukan. Cek di tab Detail Result.', 'success');
        tabResult.click();
      });

  } else {
    Swal.fire("Error", "Hanya mendukung TikTok, Instagram, dan Facebook.", "error");
  }
}

// QRIS popup
const btnQRIS = document.getElementById("btnQRIS");
const popupQRIS = document.getElementById("popupQRIS");

btnQRIS.addEventListener("click", () => {
  popupQRIS.style.display = "flex";
  popupQRIS.classList.add("show");
});

function closePopupQRIS() {
  popupQRIS.style.display = "none";
  popupQRIS.classList.remove("show");
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && popupQRIS.style.display === "flex") {
    closePopupQRIS();
  }
});
document.getElementById("tiktokURL").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault(); // mencegah reload form
    downloadVideo();     // panggil fungsi download
  }
});
document.getElementById("year").textContent = new Date().getFullYear();
