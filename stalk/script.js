
// Enter key event listener
document.addEventListener('DOMContentLoaded', () => {
    // TikTok
    document.getElementById('tiktok-username').addEventListener('keydown', e => {
      if (e.key === 'Enter') stalkTikTok();
    });
  
    // YouTube
    document.getElementById('youtube-username').addEventListener('keydown', e => {
      if (e.key === 'Enter') stalkYouTube();
    });
  
    // Mobile Legends
    document.getElementById('ml-zoneId').addEventListener('keydown', e => {
      if (e.key === 'Enter') stalkML();
    });
  });
  
// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });
  
  // Helper untuk tampilkan hasil dengan gambar
  function renderResult(container, title, fields, imageUrl) {
    let html = `<h3>${title}</h3><ul>`;
    for (const [key, val] of Object.entries(fields)) {
      html += `<li><strong>${key}:</strong> ${val ?? '-'}</li>`;
    }
    html += '</ul>';
    if (imageUrl) {
      html += `<img src="${imageUrl}" alt="gambar" width="150" style="border:2px solid #000; margin-top:10px;" />`;
    }
    container.innerHTML = html;
  }
  
  // Mobile Legends
  async function stalkML() {
    const userId = document.getElementById("ml-userId").value.trim();
    const zoneId = document.getElementById("ml-zoneId").value.trim();
    const resultBox = document.getElementById("ml-result");
    if (!userId || !zoneId) return resultBox.textContent = "Masukkan User ID dan Zone ID";
  
    const url = `https://api.ryzumi.vip/api/stalk/mobile-legends?userId=${userId}&zoneId=${zoneId}`;
    resultBox.textContent = "Loading...";
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("ML response:", data); // Debug
        const result = data;
        if (!result) throw new Error("Data tidak ditemukan");
        
      renderResult(resultBox, "Mobile Legends", {
        Username: result.username,
        Region: result.region
      }, result.avatar);
    } catch (err) {
      resultBox.textContent = "Gagal mengambil data.";
    }
  }
  
  // TikTok
  async function stalkTikTok() {
    const username = document.getElementById("tiktok-username").value.trim();
    const resultBox = document.getElementById("tiktok-result");
    if (!username) return resultBox.textContent = "Masukkan username TikTok";
  
    const url = `https://api.ryzumi.vip/api/stalk/tiktok?username=${username}`;
    resultBox.textContent = "Loading...";
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("TikTok response:", data.userInfo); // Debug
        const user = data.userInfo;
        if (!user) throw new Error("Data tidak ditemukan");
        
      renderResult(resultBox, "TikTok", {
        Username: user.username,
        Nama: user.name,
        Followers: user.totalFollowers,
        Following: user.totalFollowing,
        Likes: user.totalLikes,
        Verified: user.verified ? "✅" : "❌",
        Bio: user.bio ?? "-"
      }, user.avatar);
    } catch (err) {
      resultBox.textContent = "Gagal mengambil data.";
    }
  }
  
  // YouTube
  async function stalkYouTube() {
    const username = document.getElementById("youtube-username").value.trim();
    const resultBox = document.getElementById("youtube-result");
    if (!username) return resultBox.textContent = "Masukkan username YouTube";
  
    const url = `https://api.ryzumi.vip/api/stalk/youtube?username=${username}`;
    resultBox.textContent = "Loading...";
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("YouTube response:", data); // Debug
        const channel = data.channelMetadata;
        if (!channel) throw new Error("Data tidak ditemukan");
        
  
      renderResult(resultBox, "YouTube", {
        Username: channel.username,
        Subscribers: channel.subscriberCount,
        Video: channel.videoCount ?? "Tidak diketahui",
        Deskripsi: channel.description || "-",
        Link: `<a href="${channel.channelUrl}" target="_blank">Kunjungi Channel</a>`
      }, channel.avatarUrl);
    } catch (err) {
      resultBox.textContent = "Gagal mengambil data.";
    }
  }
  