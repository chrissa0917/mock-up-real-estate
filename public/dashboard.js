const BOOKING_KEY = 'aurelia_bookings';
const PROPOSAL_KEY = 'aurelia_proposals';
const allowedStatuses = ['New', 'Contacted', 'Proposal Sent', 'Booked'];

function statusTag(status) {
  const safe = allowedStatuses.includes(status) ? status : 'New';
  return `<span class="status-tag">${safe}</span>`;
}

function renderBookings(rows) {
  const body = document.getElementById('bookingRows');
  body.innerHTML = rows.map((r) => `
    <tr>
      <td>${r.property || '-'}</td>
      <td>${r.date || '-'}</td>
      <td>${r.time || '-'}</td>
      <td>${r.name || '-'}</td>
      <td>${r.email || '-'}</td>
      <td>${r.phone || '-'}</td>
      <td>${r.notes || '-'}</td>
      <td>${statusTag(r.status)}</td>
    </tr>
  `).join('');
}

function renderProposals(rows) {
  const body = document.getElementById('proposalRows');
  body.innerHTML = rows.map((r) => `
    <tr>
      <td>${r.budget || '-'}</td>
      <td>${r.location || '-'}</td>
      <td>${r.propertyType || '-'}</td>
      <td>${r.timeline || '-'}</td>
      <td>${r.name || '-'}</td>
      <td>${r.email || '-'}</td>
      <td>${r.phone || '-'}</td>
      <td>${statusTag(r.status)}</td>
    </tr>
  `).join('');
}

function hydrate(data) {
  document.getElementById('totalTours').textContent = data.totals.totalTourRequests;
  document.getElementById('totalProposals').textContent = data.totals.totalProposalRequests;
  document.getElementById('newLeads').textContent = data.totals.newLeads;
  document.getElementById('pendingFollowUps').textContent = data.totals.pendingFollowUps;
  renderBookings(data.recentBookings);
  renderProposals(data.recentProposals);
}

function fromLocalStorage() {
  const bookings = JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]');
  const proposals = JSON.parse(localStorage.getItem(PROPOSAL_KEY) || '[]');
  const allLeads = [...bookings, ...proposals];
  return {
    totals: {
      totalTourRequests: bookings.length,
      totalProposalRequests: proposals.length,
      newLeads: allLeads.filter((lead) => (lead.status || 'New') === 'New').length,
      pendingFollowUps: allLeads.filter((lead) => !['Booked', 'Proposal Sent'].includes(lead.status || 'New')).length
    },
    recentBookings: bookings.slice().reverse().slice(0, 12),
    recentProposals: proposals.slice().reverse().slice(0, 12)
  };
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Dashboard API unavailable');
    hydrate(data);
  } catch (error) {
    hydrate(fromLocalStorage());
  }
}

loadDashboard();
