// 1. دالة لتحميل بيانات الـ NFTs
async function loadNFTs() {
  try {
    const basePath = new URL('.', window.location.href).href;
    const response = await fetch(`${basePath}data/nfts.json`);
    if (!response.ok) {
      throw new Error(`خطأ في الشبكة عند تحميل ${response.url}: ${response.status}`);
    }
    const data = await response.json();
    return data.nfts;
  } catch (error) {
    console.error('Failed to load data:', error);
    return [];
  }
}

// 2. دالة لعرض الـ NFTs في الصفحة
function displayNFTs(nfts) {
  const gallery = document.querySelector('.image-container');
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
  nfts.forEach(nft => {
    const nftElement = `
      <div class="nft-card" ${nft.id && typeof nft.id === 'string' && nft.id.trim() ? `data-id="${nft.id}"` : (() => { console.warn(`Invalid nft.id:`, nft.id); return 'data-id="unknown"'; })()}>
        <div class="nft-image-wrapper">
          <img 
            src="${nft.image}" 
            alt="${nft.title}" 
            class="nft-image"
            loading="lazy"
          >
          <div class="nft-overlay">
            <h3>${nft.title}</h3>
            <p>${nft.short_story}</p>
            <button class="story-btn">عرض القصة</button>
          </div>
        </div>
      </div>
    `;
    gallery.insertAdjacentHTML('beforeend', nftElement);
  });
}

// 3. دالة لتحميل وعرض القصة المميزة
async function loadFeaturedStory() {
  try {
    const response = await fetch('./data/nfts.json');
    const data = await response.json();
    const featuredNFT = Array.isArray(data.nfts)
      ? data.nfts.find(nft => nft.id && typeof nft.id === "string" && nft.id === "sefnar")
      : null;
    if (featuredNFT && typeof featuredNFT.story === 'string') {
      document.getElementById('story-excerpt').textContent =
        featuredNFT.story.substring(0, 100) + '...';
    } else if (featuredNFT && Array.isArray(featuredNFT.story)) {
      const excerpt = featuredNFT.story[0]?.content;
      document.getElementById('story-excerpt').textContent =
        (typeof excerpt === 'string'
          ? excerpt.substring(0, 100)
          : Array.isArray(excerpt) ? excerpt.join(' ').substring(0, 100) : '') + '...';
    } else {
      document.getElementById('story-excerpt').textContent = 'No story available.';
    }
  } catch (error) {
    console.error('Error loading featured story:', error);
  }
}

// 4. دالة لعرض القصة في المودال
function renderStory(nft, storyContainerId = 'storySections', traitsContainerSelector = '.traits-container') {
  const storyDiv = document.getElementById(storyContainerId);
  storyDiv.innerHTML = '';

  if (Array.isArray(nft.story)) {
    nft.story.forEach(part => {
      const section = document.createElement('div');
      section.className = 'story-section';
      let contentHtml = '';
      if (Array.isArray(part.content)) {
        contentHtml = '<ul>' + part.content.map(item => `<li>${item}</li>`).join('') + '</ul>';
      } else {
        contentHtml = `<p>${part.content}</p>`;
      }
      section.innerHTML = `<h3>${part.title}</h3>${contentHtml}`;
      storyDiv.appendChild(section);
    });
  } else {
    storyDiv.innerHTML = '<p>No story available.</p>';
  }
  const traitsDiv = document.querySelector(traitsContainerSelector);
  if (!traitsDiv) {
    console.warn(`Traits container not found for selector: ${traitsContainerSelector}`);
    return;
  }
  traitsDiv.innerHTML = '';
  if (nft.traits && nft.traits.length) {
    traitsDiv.innerHTML = `
      <div class="traits-grid">
        ${nft.traits.map(t => `<span class="trait">${t}</span>`).join('')}
      </div>
    `;
  }
  // إضافة حدث النقر لتوسيع/طي القسم
  storyDiv.querySelectorAll('.story-section').forEach(section => {
    section.addEventListener('click', () => {
      section.classList.toggle('expanded');
    });
  });
}

// 5. دالة لعرض رسالة الخطأ
function displayErrorMessage(message) {
  const gallery = document.querySelector('.image-container');
  gallery.innerHTML = `<div class="error-message">${message}</div>`;
}

// 6. رسالة تحميل أثناء جلب البيانات
function showLoadingMessage() {
  const resultDiv = document.getElementById('gasResult');
  if (resultDiv) {
    resultDiv.textContent = "Loading...";
  }
}

// 7. دالة لحساب الغاز
function calculateGas() {
  const ethInput = document.getElementById('ethAmount').value.trim();
  const eth = /^[0-9]*\.?[0-9]+$/.test(ethInput) ? parseFloat(ethInput) : NaN;
  const resultDiv = document.getElementById('gasResult');
  if (isNaN(eth) || eth <= 0) {
    resultDiv.textContent = "Please enter a valid ETH amount.";
    return;
  }
  const fee = eth * 0.002;
  resultDiv.textContent = `Estimated Gas Fee: ${fee.toFixed(6)} ETH`;
}

// 8. إعداد الأحداث (للأزرار والمودال)
function setupEventListeners() {
  const estimateBtn = document.getElementById('estimateFeesButton');
  if (estimateBtn) {
    estimateBtn.addEventListener('click', calculateGas);
  }
  // يمكنك إضافة أحداث أخرى هنا إذا لزم الأمر
  console.log('تم تحميل الأحداث بنجاح');
}

// 9. تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', async () => {
  showLoadingMessage();
  await loadFeaturedStory();
  const nfts = await loadNFTs();
  if (nfts && nfts.length > 0) {
    displayNFTs(nfts);
    setupEventListeners();
  } else {
    displayErrorMessage('لا توجد بيانات متاحة حاليًا');
  }
  // تحديث السنة في الفوتر
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  console.info('App.js loaded successfully');
});
