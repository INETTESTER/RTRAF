import http from 'k6/http';
import { token } from './env.js';

export function api11() {
    const url =
        'https://uat-thapthaitalk.one.th/rtarf-backend/api/v2/chat/92c0502f-d37d-42e6-bf0f-dc694b3da8dd/send-message';

    const payload = JSON.stringify({
        message: 'สวัสดีชาวโลก',
        message_id_client: 'Tsn2ml2bpV',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    };

    const response = http.post(url, payload, params);

    //console.log('Response body:', response.body);

    return response;
}