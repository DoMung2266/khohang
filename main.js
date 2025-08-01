// 🔐 Token Dropbox được lưu từ localStorage
window.DROPBOX_ACCESS_TOKEN = localStorage.getItem("dropbox_token") || "";

// Hiển thị trạng thái token
document.addEventListener("DOMContentLoaded", () => {
  const tokenInput = document.getElementById("tokenInput");
  const tokenStatus = document.getElementById("tokenStatus");

  if (window.DROPBOX_ACCESS_TOKEN) {
    tokenInput.value = "••••••••••";
    tokenInput.disabled = true;
    tokenStatus.textContent = "✅ Token đã được lưu & sử dụng.";
  } else {
    tokenStatus.textContent = "📌 Vui lòng nhập token Dropbox!";
  }

  loadBrands(); // 👈 Tải hãng khi DOM đã sẵn sàng
});

function saveToken() {
  const input = document.getElementById("tokenInput");
  const token = input.value.trim();
  if (!token || token.length < 30) return alert("❌ Token không hợp lệ!");
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

// 🏷 Tải danh sách hãng từ Dropbox
async function loadBrands() {
  const brandSelect = document.getElementById("brand");
  brandSelect.innerHTML = `<option>⏳ Đang tải hãng...</option>`;

  try {
    const res = await fetch("https://content.dropboxapi.com/2/files/download", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${window.DROPBOX_ACCESS_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({ path: "/hangmau/config.json" })
      }
    });
    const data = await res.json();
    brandSelect.innerHTML = "";

    if (Array.isArray(data)) {
      // 👉 Thêm dòng gợi ý đầu tiên
      brandSelect.innerHTML = `<option value="">-- Chọn hãng --</option>`;
      data.forEach(b => {
        brandSelect.innerHTML += `<option value="${b}">${b}</option>`;
      });
      brandSelect.selectedIndex = 0; // đảm bảo không chọn hãng nào mặc định
    } else {
      brandSelect.innerHTML = `<option value="">❌ Dữ liệu hãng không hợp lệ</option>`;
    }
  } catch (err) {
    brandSelect.innerHTML = `<option value="">❌ Không tải được hãng</option>`;
  }
}

// 📷 Preview ảnh + resize khi chọn
document.getElementById("imageInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById("previewImage");
  const status = document.getElementById("imageStatus");

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    status.textContent = "🔄 Đang xử lý ảnh...";
    status.style.color = "orange";

    try {
      await resizeImage(file); // kết quả lưu vào window.fileResized
      status.textContent = "✅ Ảnh đã được resize.";
      status.style.color = "green";
    } catch (err) {
      status.textContent = "❌ Lỗi khi xử lý ảnh.";
      status.style.color = "red";
    }
  }
});

// 🚀 Upload sản phẩm
async function uploadToDropbox() {
  const get = id => document.getElementById(id).value.trim();
  const statusDiv = document.getElementById("status");

  const name = get("name"),
        code = get("code"),
        brand = get("brand"),
        specs = get("specs"),
        woodType = get("woodType"),
        extra = get("extra"),
        imageBlob = window.fileResized;

  if (!name || !code || !brand || !imageBlob) {
    statusDiv.textContent = "❌ Vui lòng nhập đầy đủ thông tin và chọn ảnh!";
    return;
  }

  statusDiv.textContent = "🔄 Đang upload sản phẩm...";

  const brandSafe = brand.replace(/[^\w\s\-]/gi, "").trim().replace(/\s+/g, "_");
  const imagePath = `/hangmau/images/${brandSafe}/${code}.jpg`;
  const productsPath = `/hangmau/products.json`;

  const newProduct = {
    name, code, brand, specs, woodType, extra,
    image: imagePath,
    time: new Date().toISOString()
  };

  try {
    // ✨ Upload ảnh đã resize
    const imageRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${window.DROPBOX_ACCESS_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: imagePath, mode: "add", autorename: true
        }),
        "Content-Type": "application/octet-stream"
      },
      body: imageBlob
    });

    if (!imageRes.ok) throw new Error(`Lỗi khi upload ảnh: ${imageRes.status}`);

    // 📂 Lấy sản phẩm hiện có
    let products = [];
    try {
      const jsonRes = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${window.DROPBOX_ACCESS_TOKEN}`,
          "Dropbox-API-Arg": JSON.stringify({ path: productsPath })
        }
      });
      if (jsonRes.ok) products = await jsonRes.json();
    } catch {}

    products.push(newProduct);

    // 📤 Ghi sản phẩm mới
    const uploadRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${window.DROPBOX_ACCESS_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: productsPath, mode: "overwrite"
        }),
        "Content-Type": "application/octet-stream"
      },
      body: JSON.stringify(products, null, 2)
    });

    if (!uploadRes.ok) throw new Error(`Lỗi ghi JSON: ${uploadRes.status}`);

    statusDiv.textContent = `✅ Upload thành công!\n📸 Ảnh: ${imagePath}\n📄 products.json đã cập nhật.`;

    // 🧹 Reset form sau khi gửi
    ["name", "code", "specs", "woodType", "extra"].forEach(id => {
      document.getElementById(id).value = "";
    });
    clearImage();
  } catch (err) {
    statusDiv.textContent = `⚠️ Có lỗi xảy ra: ${err.message}`;
  }
}
