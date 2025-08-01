<script>
  // Tự động gán token vào biến toàn cục từ localStorage
  window.DROPBOX_ACCESS_TOKEN = localStorage.getItem("dropbox_token") || "";

  // Hiển thị lại nếu đã lưu token
  document.addEventListener("DOMContentLoaded", () => {
    const tokenInput = document.getElementById("tokenInput");
    const tokenStatus = document.getElementById("tokenStatus");

    if (window.DROPBOX_ACCESS_TOKEN) {
      tokenInput.value = "••••••••••"; // Không hiển thị token thật
      tokenInput.disabled = true;
      tokenStatus.textContent = "✅ Token đã được lưu & sử dụng.";
    } else {
      tokenStatus.textContent = "📌 Chưa có token Dropbox. Vui lòng nhập!";
    }
  });

  function saveToken() {
    const input = document.getElementById("tokenInput");
    const token = input.value.trim();
    if (!token) return alert("Vui lòng nhập token hợp lệ!");
    localStorage.setItem("dropbox_token", token);
    window.DROPBOX_ACCESS_TOKEN = token;
    input.value = "••••••••••";
    input.disabled = true;
    document.getElementById("tokenStatus").textContent = "✅ Token đã lưu.";
  }

  function clearToken() {
    localStorage.removeItem("dropbox_token");
    window.DROPBOX_ACCESS_TOKEN = "";
    const input = document.getElementById("tokenInput");
    input.value = "";
    input.disabled = false;
    document.getElementById("tokenStatus").textContent = "🗑 Token đã xoá.";
  }
</script>
