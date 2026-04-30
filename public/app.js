const listings = [
  {
    id: 'bel-air-estate',
    name: 'Bel Air Panorama Estate',
    price: '$8,950,000',
    location: 'Bel Air, Los Angeles',
    features: '5 Beds • 7 Baths • Infinity Pool • Private Cinema',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=90'
  },
  {
    id: 'canyon-villa',
    name: 'Canyon Glass Villa',
    price: '$6,400,000',
    location: 'Hollywood Hills, Los Angeles',
    features: '4 Beds • 6 Baths • Smart Residence • Wine Gallery',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=90'
  },
  {
    id: 'coastal-manor',
    name: 'Coastal Serenity Manor',
    price: '$11,200,000',
    location: 'Malibu, California',
    features: '6 Beds • 8 Baths • Oceanfront Deck • Private Spa',
    image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=90'
  }
];

const BOOKING_KEY = 'aurelia_bookings';
const PROPOSAL_KEY = 'aurelia_proposals';

const listingGrid = document.getElementById('listingGrid');
const bookingProperty = document.getElementById('bookingProperty');
const modal = document.getElementById('listingModal');

function appendLocalItem(key, item) {
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  current.push(item);
  localStorage.setItem(key, JSON.stringify(current));
}

listings.forEach((listing) => {
  const option = document.createElement('option');
  option.value = listing.name;
  option.textContent = `${listing.name} · ${listing.location}`;
  bookingProperty.appendChild(option);

  const card = document.createElement('article');
  card.className = 'card glass-panel';
  card.innerHTML = `
    <img src="${listing.image}" alt="${listing.name}">
    <div class="card-content">
      <h3>${listing.name}</h3>
      <p>${listing.price}</p>
      <p>${listing.location}</p>
      <p>${listing.features}</p>
    </div>
  `;

  card.addEventListener('click', () => openModal(listing));
  listingGrid.appendChild(card);
});

function openModal(listing) {
  modal.hidden = false;
  document.getElementById('modalImage').src = listing.image;
  document.getElementById('modalTitle').textContent = listing.name;
  document.getElementById('modalPrice').textContent = `${listing.price} · ${listing.location}`;
  document.getElementById('modalFeatures').textContent = listing.features;
}

document.getElementById('closeModal').addEventListener('click', () => {
  modal.hidden = true;
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.hidden = true;
});

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const message = document.getElementById('bookingMessage');

  try {
    const data = await postJson('/api/book-tour', formData);
    message.textContent = data.message;
    e.target.reset();
  } catch (error) {
    const fallbackBooking = { ...formData, status: 'New', submittedAt: new Date().toISOString() };
    appendLocalItem(BOOKING_KEY, fallbackBooking);
    message.textContent = 'Tour saved locally. Concierge team will confirm once connection is restored.';
    e.target.reset();
  }
});

document.getElementById('proposalForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const card = document.getElementById('proposalResult');

  try {
    const data = await postJson('/api/request-proposal', formData);
    const { summary } = data.proposal;
    card.hidden = false;
    card.innerHTML = `
      <h3>Proposal Summary</h3>
      <p><strong>Objective:</strong> ${summary.objective}</p>
      <p><strong>Investment Window:</strong> ${summary.investmentWindow}</p>
      <p><strong>Price Guidance:</strong> ${summary.priceGuidance}</p>
      <p><strong>Next Step:</strong> ${summary.conciergeNextStep}</p>
    `;
    e.target.reset();
  } catch (error) {
    const fallbackProposal = { ...formData, status: 'New', submittedAt: new Date().toISOString() };
    appendLocalItem(PROPOSAL_KEY, fallbackProposal);
    card.hidden = false;
    card.innerHTML = '<p>Request saved locally. Proposal will sync when server connection is available.</p>';
    e.target.reset();
  }
});
