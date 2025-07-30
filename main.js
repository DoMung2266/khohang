async function uploadToDropbox() {
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const imageFile = document.getElementById("image").files[0];
  const statusDiv = document.getElementById("status");

  if (!name || !description || !imageFile) {
    statusDiv.innerText = "❌ Vui lòng điền đầy đủ thông tin!";
    return;
  }

  statusDiv.innerText = "🔄 Đang upload...";

  const reader = new FileReader();
  reader.onload = async function () {
    const imageData = reader.result;
    const timestamp = Date.now();
    const imagePath = `/khohang/images/${name}-${timestamp}.jpg`;
    const jsonPath = `/khohang/metadata/${name}-${timestamp}.json`;
    const metadata = {
      name,
      description,
      imagePath,
      time: new Date().toISOString()
    };

    try {
      // Upload ảnh sản phẩm
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
        body: imageData
      });

      if (!imageRes.ok) {
        const errorText = await imageRes.text();
        throw new Error(`❌ Lỗi upload ảnh: ${imageRes.status} - ${errorText}`);
      }

      // Upload metadata JSON
      const jsonRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          "Dropbox-API-Arg": JSON.stringify({
            path: jsonPath,
            mode: "add",
            autorename: true,
            mute: false
          }),
          "Content-Type": "application/octet-stream"
        },
        body: JSON.stringify(metadata)
      });

      if (!jsonRes.ok) {
        const errorText = await jsonRes.text();
        throw new Error(`❌ Lỗi upload metadata: ${jsonRes.status} - ${errorText}`);
      }

      statusDiv.innerText = `✅ Upload thành công!\n📁 Ảnh: ${imagePath}\n📝 Metadata: ${jsonPath}`;
    } catch (error) {
      console.error("Upload thất bại:", error);
      statusDiv.innerText = `⚠️ Lỗi xảy ra:\n${error.message}`;
    }
  };

  reader.readAsArrayBuffer(imageFile);
}
