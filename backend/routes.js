const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();
const pricingData = [];

fs.createReadStream(path.join(__dirname, 'data', 'pricing.csv'))
  .pipe(csv())
  .on('data', (row) => {
    pricingData.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

function normalizeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(Boolean);
}

function isPartialMatch(inputWords, entryWords) {
  return inputWords.every(word => entryWords.some(entryWord => entryWord.includes(word)));
}

router.post('/get-price', (req, res) => {
  const { item, service, description } = req.body;

  console.log('Received request:', req.body);

  const normalizedItem = normalizeString(item);
  const normalizedService = normalizeString(service);
  const normalizedDescription = normalizeString(description);
  
  console.log('Normalized Item:', normalizedItem);
  console.log('Normalized Service:', normalizedService);
  console.log('Normalized Description:', normalizedDescription);

  const match = pricingData.find(entry => {
    const entryItem = normalizeString(entry.item);
    const entryService = normalizeString(entry.service);
    const entryDescription = normalizeString(entry.description);

    console.log('Comparing with entry:', entry);
    console.log('Normalized Entry Item:', entryItem);
    console.log('Normalized Entry Service:', entryService);
    console.log('Normalized Entry Description:', entryDescription);

    const itemMatch = isPartialMatch(normalizedItem, entryItem);
    const serviceMatch = isPartialMatch(normalizedService, entryService);
    const descriptionMatch = isPartialMatch(normalizedDescription, entryDescription);

    console.log(`Item match: ${itemMatch}, Service match: ${serviceMatch}, Description match: ${descriptionMatch}`);

    return itemMatch && serviceMatch && descriptionMatch;
  });

  if (match) {
    const formattedPrice = `£${parseFloat(match.price).toFixed(2)}`;
    const message = `Pricing for this service starts from ${formattedPrice}. Your Maker will confirm the fee once they have assessed your item.`;
    console.log('Match found:', match);
    res.json({ price: formattedPrice, message: message });
  } else {
    console.log('No match found');
    res.json({ message: "You'll need a bespoke quote from a Maker to get an accurate price for this. Please continue to make a booking, telling us more about your item." });
  }
});

module.exports = router;