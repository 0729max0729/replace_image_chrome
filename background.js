chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    // 從同步儲存空間中取得使用者設定的圖片 URL 組和替換機率
    chrome.storage.sync.get(["imageGroups", "probability"], (data) => {
      const imageGroups = data.imageGroups && data.imageGroups.length > 0 ? data.imageGroups : [["https://source.unsplash.com/random/800x600"]];
      const probability = data.probability !== undefined ? data.probability : 100;

      // 隨機選擇一組圖片 URL
      const selectedGroup = imageGroups[Math.floor(Math.random() * imageGroups.length)];

      // 執行圖片替換腳本，傳入隨機選中的圖片組和替換機率
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: replaceImages,
        args: [selectedGroup, probability]
      });
    });
  }
}, { url: [{ urlMatches: "https://www.google.com/search" }] });

// 圖片替換函數，使用指定的機率和隨機選中的圖片組來替換網頁上的圖片
function replaceImages(imageUrls, probability) {
  const replaceImage = (img) => {
    // 針對每張圖片，使用隨機機率決定是否替換，並隨機選擇一張圖片
    if (Math.random() * 100 < probability) {
      img.src = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    }
  };

  // 初始替換現有的所有圖片
  document.querySelectorAll("img").forEach(replaceImage);

  // 使用 MutationObserver 監聽新圖片的插入
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === "IMG") {
          replaceImage(node); // 對新增的圖片進行替換
        } else if (node.querySelectorAll) {
          node.querySelectorAll("img").forEach(replaceImage); // 若為容器元素，檢查是否有新增的圖片
        }
      });
    });
  });

  // 觀察 document.body 的變化，監聽所有新增的子節點
  observer.observe(document.body, { childList: true, subtree: true });
}


