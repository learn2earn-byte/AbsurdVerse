document.addEventListener('DOMContentLoaded', async function() {
  // كل الكود سيكون هنا لضمان تحميل الصفحة أولاً
  const data = await loadNFTData();
  displayStories(data.nfts);
  setupModals();
});
async function loadNFTData() {
  try {
    const response = await fetch('nft-data.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (!data || !Array.isArray(data.nfts)) {
      throw new Error('Invalid NFT data format');
    }
    return data;
  } catch (error) {
    console.error('Failed to load NFT data:', error);
    return { nfts: [] }; // إرجاع بيانات افتراضية في حالة الخطأ
  }
}

/**
 * Function to display NFT stories
 * @param {Array} nfts - Array of NFT objects. Each object should have the following structure:
 *   {
 *     id: string,       // Unique identifier for the NFT
 *     image: string,    // URL of the NFT image
 *     title: string,    // Title of the NFT
 *     story: string,    // Story associated with the NFT
 *     link: string      // Optional URL link for the NFT
 *   }
 */
function displayStories(nfts) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  const fragment = document.createDocumentFragment();

  nfts.forEach(nft => {
    const card = document.createElement('div');
    card.className = 'nft-card';
    card.dataset.id = nft.id;

    card.innerHTML = `
      <img src="${nft.image}" alt="${nft.title}" class="nft-image">
      <div class="nft-story">
        <h3>${nft.title}</h3>
        <p>${nft.story.length > 80 ? nft.story.substring(0, 80) + '...' : nft.story}</p>
        <button class="story-btn">Read Story</button>
      </div>
    `;

    fragment.appendChild(card);
  });

  gallery.appendChild(fragment);
}
function setupModals() {
  const modal = document.getElementById('storyModal');
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  
  document.querySelectorAll('.story-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const card = this.closest('.nft-card');
      const nftId = card.dataset.id;
      const nfts = await loadNFTData();
      if (!Array.isArray(nfts) || !nfts.length) {
        console.error('Invalid or empty NFT data');
        return;
      }

      const nft = nfts.find(n => n.id === nftId);

      if (!nft) {
        console.error(`NFT with ID ${nftId} not found`);
        return;
      }
      document.getElementById('modalLink').href = nft.link && isValidURL(nft.link) ? nft.link : '#';
      document.getElementById('modalTitle').textContent = nft.title;
      document.getElementById('modalStory').textContent = nft.story;
      modal.style.display = 'block';
    });
  });

  function closeModal() {
    modal.style.display = 'none';
  }

  document.querySelector('.close').addEventListener('click', closeModal);
}
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}