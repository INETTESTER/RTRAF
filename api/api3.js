import http from 'k6/http';
import { token } from './env.js';

export function api3() {
    const url =
        'https://uat-thapthaitalk.one.th/rtarf-backend/api/v1/file/profile/account/a04a98e5-7c59-4a28-bded-c1e05516003a';

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