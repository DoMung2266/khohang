// ✅ Biến toàn cục lưu ảnh resize
window.fileResized = null;

// 🗑 Reset ảnh
function clearImage() {
  document.getElementById("imageInput").value = "";
  document.getElementById("previewImage").src = "";
  document.getElementById("previewImage").style.display = "none";
  document.getElementById("imageStatus").textContent = "🗑 Ảnh đã xoá.";
  document.getElementById("imageStatus").style.color = "gray";
  window.fileResized = null;
}

// 🧼 Resize ảnh thành Blob JPEG
window.resizeImage = function (file, maxWidth = 1024, maxHeight = 1024) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(blob => {
          window.fileResized = blob;
          resolve(blob);
        }, "image/jpeg", 0.9);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
