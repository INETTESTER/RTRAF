import http from 'k6/http';
import { token } from './env.js';

export function api8() {
    const url = 'https://uat-thapthaitalk.one.th/rtarf-backend/api/v1/listchat/get-unread-chat';

    const params = {
        headers: {
            Authorization: 'Bearer ' + token,
            //Cookie: cookie,
        },
    };

    const response = http.get(url, params);

    //console.log('Response body:', response.body);

    return response;
}