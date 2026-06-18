import http from 'k6/http';
import { token } from './env.js';

export function api5() {
    const url = 'https://uat-thapthaitalk.one.th/rtarf-backend/api/v1/noti/get-unread-chat';

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