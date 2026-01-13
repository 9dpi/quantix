async function test() {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
