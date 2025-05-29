
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

// Tab logic
const tabDownload = document.getElementById("tabDownload");
const tabResult = document.getElementById("tabResult");
const downloadTab = document.getElementById("downloadTab");
const resultTab = document.getElementById("resultTab");
const tabFaq = document.getElementById("tabFaq");
const faqTab = document.getElementById("faqTab");

tabFaq.addEventListener("click", () => {
  tabDownload.classList.remove("active");
  tabResult.classList.remove("active");
  tabFaq.classList.add("active");

  downloadTab.classList.remove("active");
  resultTab.classList.remove("active");
  faqTab.classList.add("active");
});

tabDownload.addEventListener("click", () => {
  tabDownload.classList.add("active");
  tabResult.classList.remove("active");
  downloadTab.classList.add("active");
  resultTab.classList.remove("active");
  tabFaq.classList.remove("active");
  faqTab.classList.remove("active");

});

tabResult.addEventListener("click", () => {
  tabResult.classList.add("active");
  tabDownload.classList.remove("active");
  resultTab.classList.add("active");
  downloadTab.classList.remove("active");
  tabFaq.classList.remove("active");
  faqTab.classList.remove("active");
});

function downloadVideo() {
  const url = document.getElementById('tiktokURL').value;
  const resultDiv = document.getElementById('result');
  const downloadArea = document.getElementById('downloadArea');

  if (!url) {
    Swal.fire('Oops!', 'Silakan masukkan link TikTok terlebih dahulu.', 'warning');
    return;
  }

  resultDiv.innerHTML = "Sedang memproses...";
  downloadArea.innerHTML = "";

  const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (data.data) {
        const video = data.data;
        const filename = `tiktok-${formatDate()}`;
        const isImagePost = Array.isArray(video.images) && video.images.length > 0;

        resultDiv.innerHTML = `
          <div class="card">
            ${isImagePost 
              ? `<form id="imageForm"><div class="image-grid">
                    ${video.images.map((img, i) => `
                      <label class="image-checkbox">
                        <input type="checkbox" name="img" value="${img}" checked>
                        <img src="${img}" class="thumb" loading="lazy">
                      </label>
                    `).join("")}
                 </div></form>`
              : `<img src="${video.cover}" alt="thumbnail" class="thumb" />`
            }
            
            <h2>${video.title || 'Tanpa judul'}</h2>
            
            <p><strong>👤 Author:</strong> ${video.author.nickname} (@${video.author.unique_id})</p>
            <p><strong>🎵 Musik:</strong> ${video.music_info && video.music_info.title ? video.music_info.title : 'Tidak tersedia'}</p>
            <p><strong>📅 Diposting:</strong> ${new Date(video.create_time * 1000).toLocaleDateString()}</p>
          </div>
        `;
        console.log("Judul Musik:", video.music_info?.title);
        console.log("Link MP3:", video.music_info?.play || video.music_info?.play);
        if (isImagePost) {
          downloadArea.innerHTML = `
            <button id="zipAllBtn" class="btn" style="margin-top: 1rem; background-color:#ffcc00; color:black;">
              🗂️ Unduh Semua Gambar
            </button>
            <button id="zipSelectedBtn" class="btn" style="margin-top: 1rem; background-color:#4caf50; color:white;">
              ✅ Unduh Terpilih
            </button>
          `;

          document.getElementById("zipAllBtn").addEventListener("click", () => {
            downloadImagesAsZip(video.images, `tiktok-slide-${formatDate()}.zip`);
          });

          document.getElementById("zipSelectedBtn").addEventListener("click", () => {
            const selected = Array.from(document.querySelectorAll('input[name="img"]:checked'))
                                  .map(el => el.value);
            if (selected.length === 0) {
              Swal.fire('Tidak ada gambar terpilih!', 'Pilih minimal 1 gambar.', 'warning');
              return;
            }
            downloadImagesAsZip(selected, `tiktok-selected-${formatDate()}.zip`);
          });

          // ✅ Tambahkan tombol MP3 jika ada
          if (video.music_info && (video.music_info.play || video.music_info.url)) {
            const mp3Btn = document.createElement('button');
            mp3Btn.id = 'mp3DownloadBtn';
            mp3Btn.className = 'btn';
            mp3Btn.style.cssText = 'margin-top: 1rem; background-color:#ff4d4d; color:white;';
            mp3Btn.innerHTML = '🎧 Unduh MP3';
            downloadArea.appendChild(mp3Btn);
            

            document.getElementById("mp3DownloadBtn").addEventListener("click", () => {
              Swal.fire({
                title: 'Unduh Musik?',
                text: 'MP3 akan dibuka di tab baru.',
                imageUrl: "download.png",
    imageWidth: '88px',
    imageHeight: '88px',
    imageAlt: "Custom image",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, buka!',
                cancelButtonText: 'Batal'
              }).then((result) => {
                if (result.isConfirmed) {
                  const mp3url = video.music_info.play|| video.music_info.url;
                  window.open(mp3url, '_blank');
                  Swal.fire('Berhasil!', 'Musik dibuka di tab baru.', 'success');
                }
              });
            });
          }

        } else {
          // untuk video biasa
          downloadArea.innerHTML = `
            <button id="openDownloadBtn" class="btn" style="margin-top: 1rem; background-color:#10f500; color:black;">
              💾 Unduh Video
            </button>
          `;

          document.getElementById("openDownloadBtn").addEventListener("click", () => {
            Swal.fire({
              title: 'Unduh Video?',
              text: "Video akan dibuka di tab baru.",
              imageUrl: "download.png",
              imageWidth: '88px',
              imageHeight: '88px',
              imageAlt: "Custom image",
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Ya, buka!',
              cancelButtonText: 'Batal'
            }).then((result) => {
              if (result.isConfirmed) {
                window.open(video.play, '_blank');
                Swal.fire('Berhasil!', 'Video dibuka di tab baru.', 'success');
              }
            });
          });
        }

        Swal.fire('Berhasil!', 'Konten berhasil ditampilkan.', 'success');
      } else {
        Swal.fire('Gagal!', 'Video tidak ditemukan atau link salah.', 'error');
      }
    })
    .catch(err => {
      console.error(err);
      
      Swal.fire('Error', 'Terjadi kesalahan saat memproses.', 'error');
    });
}
document.getElementById("year").textContent = new Date().getFullYear();
