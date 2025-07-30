async function uploadToDropbox() {
  const getValue = id => document.getElementById(id).value.trim();
  const statusDiv = document.getElementById("status");
  const imageFile = document.getElementById("image").files[0];

  const name = getValue("name");
  const code = getValue("code");
  const brand = getValue("brand") || "KhongRiengHang";
  const specs = getValue("specs");
  const woodType = getValue("woodType");
  const extra = getValue("extra");
  const description = getValue("description");

  if (!name || !code || !description || !imageFile) {
    statusDiv.innerText = "❌ Vui lòng điền đầy đủ thông tin!";
    return;
  }

  statusDiv.innerText = "🔄 Đang xử lý...";

  const brandSafe = brand.replace(/[^\w\s\-]/gi, "").trim().replace(/\s+/g, "_");
  const imagePath = `/hangmau/images/${brandSafe}/${code}.jpg`;
  const productsPath = `/hangmau/products.json`;
  const newProduct = {
    name, code, brand, specs, woodType, extra, description,
    image: imagePath,
    time: new Date().toISOString()
  };

  try {
    // 🖼️ Upload ảnh sản phẩm
    const imageRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: imagePath,
          mode: "add",
          autorename: true,
          mute: false
        }),
        "Content-Type": "application/octet-stream"
      },
      body: imageFile
    });

    if (!imageRes.ok) {
      const errText = await imageRes.text();
      throw new Error(`❌ Lỗi upload ảnh: ${imageRes.status} – ${errText}`);
    }

    // 📥 Đọc products.json hiện tại (nếu có)
    let products = [];
    try {
      const jsonRes = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          "Dropbox-API-Arg": JSON.stringify({ path: productsPath })
        }
      });

      if (jsonRes.ok) {
        const existingData = await jsonRes.text();
        products = JSON.parse(existingData);
      }
    } catch (err) {
      console.warn("📭 products.json chưa tồn tại, sẽ tạo mới.");
    }

    if (!Array.isArray(products)) products = [];

    products.push(newProduct); // 🆕 Thêm sản phẩm mới

    // 📤 Upload lại products.json
    const uploadRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: productsPath,
          mode: "overwrite",
          autorename: false,
          mute: false
        }),
        "Content-Type": "application/octet-stream"
      },
      body: JSON.stringify(products, null, 2)
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`❌ Lỗi ghi products.json: ${uploadRes.status} – ${errText}`);
    }

    statusDiv.innerText = `✅ Upload thành công!\n📸 Ảnh: ${imagePath}\n📄 products.json đã được cập nhật.`;
  } catch (error) {
    console.error("❌ Lỗi toàn trình:", error);
    statusDiv.innerText = `⚠️ Đã xảy ra lỗi:\n${error.message}`;
  }
}
