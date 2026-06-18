import http from 'k6/http';
import { token } from './env.js';

export function api10() {
    const url = 'https://uat-thapthaitalk.one.th/rtarf-backend/api/v1/room/get-groups';

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            Authorization: 'Bearer ' + token,
            //Cookie: cookie,
        },
    };

    const response = http.get(url, params);

    //console.log('Response body:', response.body);

    return response;
}