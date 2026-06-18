import http from 'k6/http';
import { token } from './env.js';

export function api9() {
    const url =
        'https://uat-thapthaitalk.one.th/rtarf-backend/api/v1/contact/get-contacts?limit=40';

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