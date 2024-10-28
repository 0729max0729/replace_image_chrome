// 從 Google 圖片搜尋結果頁面中提取圖片 URL
const imageUrls = [];
const images = document.querySelectorAll('img');
images.forEach(img => {
  if (img.src && img.src.startsWith('http')) {
    imageUrls.push(img.src);
  }
});

// 向背景腳本發送圖片 URL
chrome.runtime.sendMessage({ type: 'IMAGE_URLS', data: imageUrls });
