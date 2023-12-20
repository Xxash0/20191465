const W3CWebSocket = require('websocket').w3cwebsocket;
const binanceFuturesTickers = [];
let usdsmTicker = null;

const usdsTickerWebSocket = async () => {
    try {
        usdsmTicker = new W3CWebSocket('wss://fstream.binance.com/ws/!miniTicker@arr');
        usdsmTicker.onmessage = (e) => {
            const _binanceFuturesTickers = JSON.parse(e.data);
            for (let tick of _binanceFuturesTickers) {
                binanceFuturesTickers[tick.s] = Number(tick.c);
            }
        };
        usdsmTicker.onerror = () => {
            console.log(`USDS ticker websocket ERROR occurred.`);
        };
        usdsmTicker.onclose = () => {
            usdsTickerWebSocket();
        };
    }
 catch (error) {
    console.log(error);
    }
};
usdsTickerWebSocket();