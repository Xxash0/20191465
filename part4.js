//계좌 정보 조회 예제 코드
const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('querystring');

const BINANCE_ACCESS_KEY = 'BINANCE_ACCESS_KEY';
const BINANCE_SECRET_KEY = 'BINANCE_SECRET_KEY';

const query = querystring.stringify({
    recvWindow: 10000,
    timestamp: moment().valueOf(),
});

const sign = crypto
    .createHmac('sha256', BINANCE_SECRET_KEY)
    .update(query)
    .digest('hex');

axios({
    method: 'GET',
    url: `https://fapi.binance.com/fapi/v2/account?${query}&signature=${sign}`,
    headers: {
        'X-MBX-APIKEY': BINANCE_ACCESS_KEY,
    },
})
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.log(error.response || error);
        return null;
    });
