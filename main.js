let accessToken = null;

function handleAuthClick() {
  gapi.load("client:auth2", () => {
    gapi.auth2.init({ client_id: CLIENT_ID }).then(() => {
      gapi.auth2.getAuthInstance().signIn().then(() => {
        accessToken = gapi.auth.getToken().access_token;
        document.getElementById("status").innerText = "✅ Đã đăng nhập";
      });
    });
  });
}

function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file || !accessToken) {
    alert("Vui lòng đăng nhập và chọn file!");
    return;
  }

  const metadata = {
    name: file.name,
    mimeType: file.type
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({ Authorization: "Bearer " + accessToken }),
    body: form
  })
  .then(res => res.json())
  .then(val => {
    alert("✅ Upload thành công! File ID: " + val.id);
  })
  .catch(err => {
    console.error("❌ Upload lỗi:", err);
    alert("Upload thất bại!");
  });
}
