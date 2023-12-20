const axios = require('axios');
const moment = require('moment');
const W3CWebSocket = require('websocket').w3cwebsocket;

const BINANCE_ACCESS_KEY = 'BINANCE_ACCESS_KEY';

const getListenKey = async (url, accessKey) => {
    return await axios({
        method: 'POST',
        url,
        headers: {
            'X-MBX-APIKEY': accessKey,
        },
    })
    .then((response) => {
        return response.data.listenKey;
    })
    .catch((error) => {
        console.log(error.response.data);
        return null;
    });
};

const usdsmWebSocket = async () => {
    try {
        usdsmUserData = null;
        usdsmListenKey = await getListenKey('https://fapi.binance.com/fapi/v1/listenKey', BINANCE_ACCESS_KEY);

        usdsmUserData = new W3CWebSocket(
            `wss://fstream.binance.com/ws/${usdsmListenKey}`
            );
            usdsmUserData.onopen = () => {
                console.log(`USDS-M websocket has been OPENED.`);
            };
            usdsmUserData.onmessage = (e) => {
                usdsmProcess(e);
            };
            usdsmUserData.onerror = () => {
                console.log(`USDS-M websocket ERROR occurred.`);
            };
            usdsmUserData.onclose = () => {
                // console.log(`USDS-M websocket has been CLOSED.`);
                usdsmWebSocket();
            };
        } catch (error) {
        console.log(error);
    }
};

const usdsmProcess = async (e) => {
    try {
        if (typeof e.data === 'string') {
            const data = JSON.parse(e.data);
            if (data.e === 'ORDER_TRADE_UPDATE') {
                if (data.o.X === 'FILLED' && data.o.o === 'LIMIT') {
                    // 지정가 주문 체결시 하고 싶은 작업을 여기에 작성
                }
            } else if (data.e === 'ACCOUNT_UPDATE' && data.a.m === 'ORDER') {
                // 주문 정보의 변동으로 인해 계좌정보가 변동된 경우 하고 싶은 작업을 여기에 작성
                // 예를 들면 포지션이 추가되었을 때, 포지션이 시장가로 종료 되었을 때 등
            } else if (data.e === 'ACCOUNT_UPDATE' && data.a.m === 'FUNDING_FEE') {
                // 펀딩비가 발생되어 계좌정보가 변동된 경우 하고 싶은 작업을 여기에 작성
            } else if (data.e === 'listenKeyExpired') {
                console.log('USDS-M websocket listen key expired!!!');
            }
        }
    } catch (error) {
        console.log(error);
    }
};

usdsmWebSocket();
