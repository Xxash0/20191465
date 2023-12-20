const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('querystring');
const BINANCE_ACCESS_KEY = 'BINANCE_ACCESS_KEY';
const BINANCE_SECRET_KEY = 'BINANCE_SECRET_KEY';
const _query = {
    symbol: 'XRPUSDT',
    side: 'BUY',
    positionSide: 'LONG',
    type: 'LIMIT',
    timeInForce: 'GTC',
    quantity: 100,
    price: '1.1',
    timestamp: moment().valueOf(),
};
const query = querystring.stringify(_query);
const sign = crypto
    .createHmac('sha256', BINANCE_SECRET_KEY)
    .update(query)
    .digest('hex');
axios({
    method: 'POST',
    url: `https://fapi.binance.com/fapi/v1/order?${query}&signature=${sign}`,
    headers: {
        'X-MBX-APIKEY': BINANCE_ACCESS_KEY,
    },
})
    .then((response) => {
    // 주문 성공
    })
    .catch((error) => {
        console.log(error.response.data);
    });
