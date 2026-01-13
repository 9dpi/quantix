async function test() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json');
        const data = await response.json();
        console.log('EUR to USD:', data.eur.usd);
    } catch (e) {
        console.error(e);
    }
}
test();
