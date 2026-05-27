// api/sms-proxy.js — সার্ভার-সাইড প্রক্সি (CORS সমস্যা সমাধানের জন্য)
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { country, number } = req.query;

  if (!country || !number) {
    return res.status(400).json({ error: 'Country and number are required' });
  }

  const targetUrl = `https://receive-smss.live/sms/${country}/${number}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });

    if (!response.ok) {
      throw new Error(`Source site returned ${response.status}`);
    }

    const html = await response.text();
    
    // ক্যাশিং হেডার্স যোগ করা যাতে বারবার লোড না হয়
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).send(html);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch SMS data from source' });
  }
}
