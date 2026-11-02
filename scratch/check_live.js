async function main() {
  try {
    const res = await fetch('https://esportsgg.vercel.app');
    const html = await res.text();
    console.log('HTML response status:', res.status);
    const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (!match) {
      console.log('Script tag not found, searching with regex...');
      const match2 = html.match(/\/assets\/index-[a-zA-Z0-9_\-]+\.js/);
      if (match2) {
        console.log('Found script via match2:', match2[0]);
      } else {
        console.log('HTML preview:', html.slice(0, 500));
        return;
      }
    }
    const scriptPath = match ? match[1] : html.match(/\/assets\/index-[a-zA-Z0-9_\-]+\.js/)[0];
    console.log('Live bundle script path:', scriptPath);
    const bundleRes = await fetch('https://esportsgg.vercel.app' + scriptPath);
    const js = await bundleRes.text();
    console.log('Bundle fetched, length:', js.length);

    console.log('1. Live Render Backend URL connected:', js.includes('https://esport-management-hub.onrender.com/api/v1'));
    console.log('2. Room ID/Pass Update option present:', js.includes('Update Room ID & Password') || js.includes('Update ID & Pass') || js.includes('Publish Room ID & Pass'));
    console.log('3. Organizer Authority Required check:', js.includes('Organizer Authority Required'));
  } catch (err) {
    console.error('Check error:', err);
  }
}

main();
