import http from 'k6/http';
import { token2 } from './env.js';

export function api6() {
    const url = 'https://uat-thapthaitalk.one.th/rtarf-backend/api/v1/conference/action-user';

    const payload = JSON.stringify({
        action: 'connecting',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            Authorization: 'Bearer ' + token2,
            //Cookie: cookie,
        },
    };

    const response = http.post(url, payload, params);

    console.log('Response body:', response.body);

    return response;
}