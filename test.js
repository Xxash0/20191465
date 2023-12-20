const axios = require('axios');
const moment = require('moment');
const W3CWebSocket = require('websocket').w3cwebsocket;
 
const BINANCE_ACCESS_KEY = 'BINANCE_ACCESS_KEY'; //주문을 위한 api access_key 
const BINANCE_SECRET_KEY = 'BINANCE_SECRET_KEY'; //주문을 위한 api secret_key 

//주문 정보 체크  코드 
const getListenKey = async (url, accessKey) => {
    return await axios({
        method: 'POST',
        url,
        headers: {
            'X-MBX-APIKEY': accessKey,
        },
    })
        .then((response) => {
            return response.data.listenKey;
        })
        .catch((error) => {
            console.log(moment().local().format('HH:mm:ss'), error.response.data);
            return null;
        });
};

//주문정보 체크 코드 
const usdsmWebSocket = async () => {
    try {
        usdsmUserData = null;
        usdsmListenKey = await getListenKey('https://fapi.binance.com/fapi/v1/listenKey', BINANCE_ACCESS_KEY);

        usdsmUserData = new W3CWebSocket(`wss://fstream.binance.com/ws/${usdsmListenKey}`);
        usdsmUserData.onopen = () => {
            console.log(`USDS-M websocket has been OPENED.`);
        };
        usdsmUserData.onmessage = (e) => {
            usdsmProcess(e);
        };
        usdsmUserData.onerror = () => {
            console.log(`USDS-M websocket ERROR occurred.`);
        };
        usdsmUserData.onclose = () => {
            // console.log(`USDS-M websocket has been CLOSED.`);
            usdsmWebSocket();
        };
    } catch (error) {
        console.log(moment().local().format('HH:mm:ss'), error);
    }
};


//주문하기 부분 
const sendOrder = async ({ symbol, side, positionSide, price, quantity }) => {
    const _query = {
        symbol,
        side,
        positionSide,
        type: 'LIMIT',
        timeInForce: 'GTC',
        quantity,
        price,
        timestamp: moment().valueOf(),
    };
    const query = querystring.stringify(_query);
    const sign = crypto
        .createHmac('sha256', BINANCE_SECRET_KEY)
        .update(query)
        .digest('hex');
     await axios({
        method: 'POST',
        url: `https://fapi.binance.com/fapi/v1/order?${query}&signature=${sign}`,
        headers: {
            'X-MBX-APIKEY': BINANCE_ACCESS_KEY,
        },
    })
        .then((response) => {
            // 주문 성공
        })
        .catch((error) => {
            console.log(moment().local().format('HH:mm:ss'), error.response.data);
        });
};


//주문정보변경 코드 부분중 이익을 봤을시 롱 숏 포지션을 종료하는 코드
const usdsmProcess = async (e) => {
    try {
        if (typeof e.data === 'string') {
            const data = JSON.parse(e.data);
             if (data.e === 'ORDER_TRADE_UPDATE') {
                if (data.o.X === 'FILLED' && data.o.o === 'LIMIT') {
                    await sendOrder({
                        symbol: data.o.s,
                        side: data.o.S === 'BUY' ? 'SELL' : 'BUY',
                        positionSide: data.o.ps,
                        price: Number(
                            data.o.S === 'BUY' ? data.o.p * 1.0024 : data.o.p * 0.9976
                        ).toFixed(5), // toFixed(2) 의 숫자 2는 해당 코인의 가격이 소숫점 몇째자리까지 취급하느냐에 따라 다르게 넣어줘야 합니다. 예를 들어 비트코인은 2 이고 도지코인의 경우 5 입니다.
                        quantity: data.o.q,
                    });
                }
            }
        }
    }catch (error) {
        console.log(moment().local().format('HH:mm:ss'), error);
    }
};

usdsmWebSocket();