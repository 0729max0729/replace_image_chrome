chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    // 從同步儲存空間中取得使用者設定的圖片 URL 和替換機率
    chrome.storage.sync.get(["imageGroup", "probability"], (data) => {
      const imageUrls = data.imageGroup && data.imageGroup.length > 0 ? data.imageGroup : ["https://source.unsplash.com/random/800x600"];
      const probability = data.probability !== undefined ? data.probability : 100;

      // 執行圖片替換腳本，傳入圖片 URL 和替換機率
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: replaceImages,
        args: [imageUrls, probability]
      });
    });
  }
}, { url: [{ urlMatches: "*://*/*" }] });

// 圖片替換函數，使用指定的機率來決定是否替換圖片
function replaceImages(imageUrls, probability) {
  const replaceImage = (img) => {
    if (Math.random() * 100 < probability) {
      // 隨機選擇一張圖片並加上隨機參數防止緩存
      const randomUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      img.src = `${randomUrl}?t=${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  };

  // 使用 IntersectionObserver 替換圖片
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        replaceImage(entry.target);
        observer.unobserve(entry.target); // 替換後停止觀察該圖片
      }
    });
  });

  // 對初始頁面上的所有圖片進行替換並觀察
  document.querySelectorAll("img").forEach(img => {
    replaceImage(img); // 立即替換當前可見的圖片
    observer.observe(img); // 對圖片添加觀察，以便未來進入視窗時替換
  });

  // 使用 MutationObserver 監聽新圖片的插入
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === "IMG") {
          observer.observe(node); // 對新增的圖片進行觀察
        } else if (node.querySelectorAll) {
          node.querySelectorAll("img").forEach(img => observer.observe(img)); // 若為容器元素，檢查是否有新增的圖片
        }
      });
    });
  });

  // 觀察 document.body 的變化，監聽所有新增的子節點
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

