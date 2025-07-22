"use strict"
    let eventSource;

    function connect() {
      const userId = document.getElementById('userId').value;
      const token = document.getElementById('token').value;

      if (!userId || !token) {
        alert('User ID and Token required!');
        return;
      }

      const url = `http://localhost:3000/api/sse/${userId}?token=${token}`;
      eventSource = new EventSource(url);

      eventSource.onmessage = (e) => {

        const data = JSON.parse(e.data);
        console.log(data)
        const item = document.createElement('li');
        item.textContent = `📡 ${data.date} | 🌡️ ${data.temperature}° | 💧 ${data.humidity}%`;
        document.getElementById('data').prepend(item);
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error", err);
        eventSource.close();
      };
    }
