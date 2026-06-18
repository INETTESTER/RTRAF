import http from 'k6/http';
import { token } from './env.js';

export function api7() {
    const url =
        'https://uat-thapthaitalk.one.th/rtarf-backend/api/v2/listchat/get-listchat?unread_first=false&filter=all&offset=0&query=&in_room=true&lang=th';

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