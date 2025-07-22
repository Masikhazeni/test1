const clients = new Map(); 

export function addClient(userId, res) {
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    
    const userClients = clients.get(userId);
    userClients.add(res);
    
    res.on('close', () => {
        userClients.delete(res);
        if (userClients.size === 0) {
            clients.delete(userId);
        }
    });
}

export function sendToUser(userId, data) {
    if (clients.has(userId)) {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        clients.get(userId).forEach(client => {
            try {
                client.write(message);
            } catch (err) {
                console.error('Error sending SSE message:', err);
                 clients.get(userId).delete(client);   
                //  حذف کردن کلاینت خراب
            }
        });
    }
}
