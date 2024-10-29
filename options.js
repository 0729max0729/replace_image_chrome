// 從儲存空間加載圖片 URL 和機率
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["imageGroup", "probability"], (data) => {
    if (data.imageGroup) {
      document.getElementById("imageGroupTextarea").value = data.imageGroup.join("\n");
    }

    if (data.probability !== undefined) {
      document.getElementById("probability").value = data.probability;
    }
  });
});

// 儲存使用者輸入的圖片 URL 和替換機率
document.getElementById("save").addEventListener("click", () => {
  const imageGroup = document.getElementById("imageGroupTextarea").value
    .split("\n")
    .map(url => url.trim())
    .filter(url => url);

  const probability = parseInt(document.getElementById("probability").value, 10) || 100;

  chrome.storage.sync.set({ imageGroup: imageGroup, probability: probability }, () => {
    const status = document.getElementById("status");
    status.textContent = "Settings saved!";
    setTimeout(() => status.textContent = "", 2000);
  });
});
