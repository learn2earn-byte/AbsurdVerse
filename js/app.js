// 1. دالة لتحميل بيانات الـ NFTs
async function loadNFTs() {
  try {
    // جلب البيانات من ملف JSON
    const basePath = new URL('.', window.location.href).href; // تحديد المسار الأساسي
    const response = await fetch(`${basePath}data/nfts.json`);
    
    // التحقق من نجاح الطلب
    if (!response.ok) {
      throw new Error(`خطأ في الشبكة عند تحميل ${response.url}: ${response.status}`);
    }
    
    const data = await response.json();
    return data.nfts; // إرجاع مصفوفة الـ NFTs
    
  } catch (error) {
    console.error('Failed to load data:', error);
    return []; // إرجاع مصفوفة فارغة في حالة الخطأ
}

// 2. دالة لعرض الـ NFTs في الصفحة
function displayNFTs(nfts) {
  const gallery = document.querySelector('.image-container');
  
  // مسح المحتوى القديم (إذا وجد)
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

// 3. دالة لتحميل وعرض الـ Featured NFT
async function loadFeaturedNFT() {
  try {
    const basePath = window.location.origin;
    const response = await fetch(`${basePath}/data/nfts.json`);
    const data = await response.json();
    const featured = Array.isArray(data.nfts) 
      ? data.nfts.find(nft => nft.id && typeof nft.id === "string" && nft.id === "sefnar") 
      : null;
    
    if (featured) {
      document.querySelector('.featured-image').src = featured.image;
      document.querySelector('.nft-details h3').textContent = featured.title;
      document.querySelector('.story-preview p').textContent = featured.short_story;
    }
  } catch (error) {
    console.error('Error loading featured NFT:', error);
}

// الدوال الحالية تبقى كما هي
// (تمت كتابة الدوال أعلاه بالفعل، لا داعي لإعادة تعريفها هنا)

// ▼▼▼ أضف الدوال الجديدة هنا ▼▼▼

// 1. دالة تحميل القصة المميزة
async function loadFeaturedStory() {
  try {
    const response = await fetch('./data/nfts.json');
    const data = await response.json();
    // Find the featured NFT (assuming id "sefnar")
    const featuredNFT = Array.isArray(data.nfts)
      ? data.nfts.find(nft => nft.id && typeof nft.id === "string" && nft.id === "sefnar")
      : null;
    if (featuredNFT && typeof featuredNFT.story === 'string') {
      document.getElementById('story-excerpt').textContent =
        featuredNFT.story.substring(0, 100) + '...';
    } else if (featuredNFT && Array.isArray(featuredNFT.story)) {
      // If story is an array, join the first section(s) as excerpt
      const excerpt = featuredNFT.story[0]?.content;
      document.getElementById('story-excerpt').textContent =
        (typeof excerpt === 'string'
          ? excerpt.substring(0, 100)
          : Array.isArray(excerpt) ? excerpt.join(' ').substring(0, 100) : '') + '...';
    } else {
      // Fallback for unsupported types
      document.getElementById('story-excerpt').textContent = 'No story available.';
    }
  } catch (error) {
    console.error('Error loading featured story:', error);
  }
}

// 2. دالة تهيئة الأحداث للعناصر الجديدة
function setupFeaturedEvents() {
  const featuredBtn = document.querySelector('.featured-section .story-btn');
  let cachedData = null; // Cache variable to store fetched data

  if (featuredBtn) {
    featuredBtn.addEventListener('click', async () => {
      if (!cachedData) {
      const nft = cachedData && Array.isArray(cachedData.nfts) 
        ? cachedData.nfts.find(nft => nft.id === "sefnar") 
        : null;
        cachedData = await response.json(); // Cache the data after the first fetch
      }
      const nft = cachedData.nfts.find(nft => nft.id === "sefnar");
      const modal = document.getElementById('storyModal');
      if (nft && modal) {
        document.getElementById('modalTitle').textContent = nft.title;
        document.getElementById('modalStory').textContent = nft.story;
        document.getElementById('modalLink').href = nft.external_link;
        // عرض traits/properties
        const traitsDiv = document.getElementById('modalTraits');
        traitsDiv.innerHTML = '';
        if (nft.traits && nft.traits.length) {
          traitsDiv.innerHTML += `<strong>Traits:</strong> ${nft.traits.join(', ')}<br>`;
        }
        if (nft.properties) {
          traitsDiv.innerHTML += `<strong>Rarity:</strong> ${nft.properties.rarity}<br>`;
          traitsDiv.innerHTML += `<strong>Year Minted:</strong> ${nft.properties.year_minted}`;
        }
        modal.style.display = 'block';
      }
    });
  }

  // إغلاق المودال عند الضغط خارج المحتوى أو زر Escape
  const modal = document.getElementById('storyModal');
  if (modal) {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
  }
}

// 3. دالة لعرض القصة في المودال
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
    }
  }

  // إضافة حدث النقر لتوسيع/طي القسم
  storyDiv.querySelectorAll('.story-section').forEach(section => {
    section.addEventListener('click', () => {
      section.classList.toggle('expanded');
    });
  });
}

// 5. تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', async () => {
  showLoadingMessage();
  const [featuredStoryResult, nfts] = await Promise.all([loadFeaturedStory(), loadNFTs()]);
  if (nfts && nfts.length > 0) {
    displayNFTs(nfts);
    setupEventListeners();
    setupFeaturedEvents();
  } else {
    displayErrorMessage('لا توجد بيانات متاحة حاليًا');
  }
});

// 6. دالة لعرض رسالة الخطأ
function displayErrorMessage(message) {
  const gallery = document.querySelector('.image-container');
  gallery.innerHTML = `<div class="error-message">${message}</div>`;
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  gallery.innerHTML = '';
  gallery.appendChild(errorDiv);
}

// 7. إعداد الأحداث (للأزرار والمودال)
function setupEventListeners() {
  // سيتم تنفيذ هذا الجزء لاحقاً
  console.log('تم تحميل الأحداث بنجاح');
}

// رسالة تحميل أثناء جلب البيانات
function showLoadingMessage() {
  const resultDiv = document.getElementById('gasResult');
  if (resultDiv) {
    resultDiv.textContent = "Loading...";
  }
}
// 8. دالة لحساب الغاز
function calculateGasFee() {
  const ethInput = document.getElementById('ethAmount').value.trim();
  const eth = /^[0-9]*\.?[0-9]+$/.test(ethInput) ? parseFloat(ethInput) : NaN;
  const resultDiv = document.getElementById('gasResult');
  if (isNaN(eth) || eth <= 0) {
    resultDiv.textContent = "Please enter a valid ETH amount.";
    return;
  }
  // مثال: افتراض أن العمولة 0.002 ETH لكل عملية
  const fee = eth * 0.002; // This multiplier represents an assumed gas fee rate per transaction.
  resultDiv.textContent = `Estimated Gas Fee: ${fee.toFixed(6)} ETH`;
}
  // including congestion, transaction complexity, and gas price fluctuations, and are subject to change.

resultDiv.textContent = `Estimated Gas Fee: ${fee.toFixed(6)} ETH`;
}

console.info('App.js loaded successfully');
