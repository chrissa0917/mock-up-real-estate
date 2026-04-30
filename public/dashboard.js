const allowedStatuses = ['New', 'Contacted', 'Proposal Sent', 'Booked'];

function statusTag(status) {
  const safe = allowedStatuses.includes(status) ? status : 'New';
  return `<span class="status-tag">${safe}</span>`;
}

function renderBookings(rows) {
  const body = document.getElementById('bookingRows');
  body.innerHTML = rows.map((r) => `
    <tr>
      <td>${r.property}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.phone}</td>
      <td>${r.notes || '-'}</td>
      <td>${statusTag(r.status)}</td>
    </tr>
  `).join('');
}

function renderProposals(rows) {
  const body = document.getElementById('proposalRows');
  body.innerHTML = rows.map((r) => `
    <tr>
      <td>${r.budget}</td>
      <td>${r.location}</td>
      <td>${r.propertyType}</td>
      <td>${r.timeline}</td>
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.phone}</td>
      <td>${statusTag(r.status)}</td>
    </tr>
  `).join('');
}

async function loadDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  document.getElementById('totalTours').textContent = data.totals.totalTourRequests;
  document.getElementById('totalProposals').textContent = data.totals.totalProposalRequests;
  document.getElementById('newLeads').textContent = data.totals.newLeads;
  document.getElementById('pendingFollowUps').textContent = data.totals.pendingFollowUps;

  renderBookings(data.recentBookings);
  renderProposals(data.recentProposals);
}

loadDashboard();
