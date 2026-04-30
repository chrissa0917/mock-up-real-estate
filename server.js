const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const dataDir = path.join(__dirname, 'data');
const bookingsFile = path.join(dataDir, 'bookings.json');
const proposalsFile = path.join(dataDir, 'proposals.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.post('/api/book-tour', (req, res) => {
  const { property, date, time, name, email, phone, preferredTime, notes } = req.body;

  if (!property || !date || !time || !name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Missing required booking fields.'
    });
  }

  const booking = {
    id: `booking_${Date.now()}`,
    property,
    date,
    time,
    name,
    email,
    phone,
    preferredTime: preferredTime || '',
    notes: notes || '',
    submittedAt: new Date().toISOString()
  };

  const bookings = readJson(bookingsFile);
  bookings.push(booking);
  writeJson(bookingsFile, bookings);

  return res.json({
    success: true,
    message: 'Your private tour has been booked successfully.',
    booking
  });
});

app.post('/api/request-proposal', (req, res) => {
  const { budget, location, propertyType, timeline } = req.body;

  if (!budget || !location || !propertyType || !timeline) {
    return res.status(400).json({
      success: false,
      message: 'Missing required proposal fields.'
    });
  }

  const proposal = {
    id: `proposal_${Date.now()}`,
    budget,
    location,
    propertyType,
    timeline,
    summary: {
      objective: `Acquire a ${propertyType.toLowerCase()} residence in ${location}.`,
      investmentWindow: timeline,
      priceGuidance: `Target budget set at ${budget}.`,
      conciergeNextStep: 'A private advisor will curate 3-5 matching residences and arrange discreet viewings.'
    },
    submittedAt: new Date().toISOString()
  };

  const proposals = readJson(proposalsFile);
  proposals.push(proposal);
  writeJson(proposalsFile, proposals);

  return res.json({
    success: true,
    message: 'Proposal request received.',
    proposal
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Luxury real estate app running on http://localhost:${port}`);
});
