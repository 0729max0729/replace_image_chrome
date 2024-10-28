// 從儲存空間加載圖片 URL 和機率
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["imageGroups", "probability"], (data) => {
    const container = document.getElementById("imageGroupsContainer");

    if (data.imageGroups) {
      data.imageGroups.forEach((group, index) => {
        addImageGroup(container, index + 1, group.join("\n"));
      });
    } else {
      addImageGroup(container, 1, "");
    }

    if (data.probability !== undefined) {
      document.getElementById("probability").value = data.probability;
    }
  });
});

// 添加新圖片組
document.getElementById("addGroup").addEventListener("click", () => {
  const container = document.getElementById("imageGroupsContainer");
  const groupCount = container.children.length + 1;
  addImageGroup(container, groupCount, "");
});

// 儲存使用者輸入的圖片 URL 和替換機率
document.getElementById("save").addEventListener("click", () => {
  const imageGroups = Array.from(document.querySelectorAll(".image-group-textarea")).map(textarea =>
    textarea.value.split("\n").map(url => url.trim()).filter(url => url)
  );

  const probability = parseInt(document.getElementById("probability").value, 10) || 100;

  chrome.storage.sync.set({ imageGroups: imageGroups, probability: probability }, () => {
    const status = document.getElementById("status");
    status.textContent = "Settings saved!";
    setTimeout(() => status.textContent = "", 2000);
  });
});

// 動態添加圖片組的區塊，並附上刪除按鈕
function addImageGroup(container, groupNumber, value) {
  const div = document.createElement("div");
  div.className = "image-group";
  div.innerHTML = `
    <label>Image Group ${groupNumber}:</label>
    <textarea class="image-group-textarea">${value}</textarea>
    <button class="delete-group">Delete Group</button>
  `;
  container.appendChild(div);

  // 添加刪除按鈕的事件監聽
  div.querySelector(".delete-group").addEventListener("click", () => {
    div.remove();
  });
}
