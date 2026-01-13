async function test() {
    const apiKey = 'YOUR_KEY'; // User should fill this or I use env
    const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=1min&apikey=${process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2).substring(0, 1000));
    } catch (e) {
        console.error(e);
    }
}
test();
