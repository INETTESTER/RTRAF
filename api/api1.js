import ws from 'k6/ws';
import { token_chat } from './env.js';

export function api1() {
    const url =
        'wss://uat-thapthaitalk.one.th/centrifugo/connection/websocket';

    const centrifugoToken =
        token_chat;

    const response = ws.connect(url, {}, function (socket) {
        socket.on('open', () => {
            console.log('WebSocket connected');

            socket.send(
                JSON.stringify({
                    id: 1,
                    connect: {
                        token: centrifugoToken,
                        name: 'js',
                    },
                })
            );
        });

        socket.on('message', (data) => {
            console.log('Response body:', data);

            // ตอบ heartbeat
            if (data === '{}') {
                console.log('Ping received');
                socket.send('{}');
                console.log('Pong sent');
                return;
            }

            try {
                const msg = JSON.parse(data);

                // Connect สำเร็จ
                if (msg.id === 1 && msg.connect) {
                    console.log('Connect success');

                    socket.send(
                        JSON.stringify({
                            id: 2,
                            subscribe: {
                                channel:
                                    'listchat-a04a98e5-7c59-4a28-bded-c1e05516003a',
                                flag: 1,
                            },
                        })
                    );
                }

                // Subscribe สำเร็จ
                if (msg.id === 2 && msg.subscribe !== undefined) {
                    console.log('Subscribe success');
                }

                // กรณีมี push message จาก chat
                if (msg.push) {
                    console.log(
                        'Chat message:',
                        JSON.stringify(msg.push)
                    );
                }
            } catch (e) {
                console.log('Parse error:', e);
            }
        });

        socket.on('error', (e) => {
            console.log('WebSocket error:', JSON.stringify(e));
        });

        socket.on('close', () => {
            console.log('WebSocket disconnected');
        });

        // ค้างไว้ 5 นาที
        socket.setTimeout(() => {
            console.log('Closing socket...');
            socket.close();
        }, 300000);
    });

    console.log('Status:', response.status);

    return response;
}