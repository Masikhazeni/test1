import { useState, useEffect } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

const SSETestPage = () => {
  const [userId, setUserId] = useState('2');
  const [token, setToken] = useState('your-jwt-token-here');
  const [connected, setConnected] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [eventSource, setEventSource] = useState(null);
  const [error, setError] = useState(null);

  // تمیزکاری هنگام آنمونت
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const handleConnect = () => {
    if (!userId || !token) {
      setError('لطفاً شناسه کاربر و توکن را وارد کنید');
      return;
    }

    setError(null);
    const url = `http://localhost:3000/api/sse/${userId}`;
    
    const es = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      heartbeatTimeout: 60000,
    });

    es.addEventListener('open', () => {
      setConnected(true);
      setError(null);
    });

    es.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        setDataList(prev => [data, ...prev]);
      } catch (err) {
        setError('خطا در پردازش داده دریافتی');
        console.error('Parse error:', err);
      }
    });

    es.addEventListener('error', (err) => {
      console.error('SSE Error:', err);
      setError('خطا در اتصال به سرور. وضعیت: ' + (es.readyState === 2 ? 'اتصال بسته شد' : 'خطای شبکه'));
      es.close();
      setConnected(false);
    });

    setEventSource(es);
  };

  const handleDisconnect = () => {
    if (eventSource) {
      eventSource.close();
      setConnected(false);
      setEventSource(null);
      setError(null);
    }
  };

  return (
    <div className="sse-container">
      <h2>🧪 تست اتصال SSE</h2>
      
      <div className="input-section">
        <div className="input-group">
          <label>شناسه کاربر:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={connected}
          />
        </div>

        <div className="input-group">
          <label>توکن احراز هویت:</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={connected}
          />
        </div>
      </div>

      <div className="button-group">
        <button
          onClick={handleConnect}
          disabled={connected}
          className={connected ? 'disabled' : 'connect'}
        >
          {connected ? 'متصل' : 'اتصال'}
        </button>
        <button
          onClick={handleDisconnect}
          disabled={!connected}
          className={!connected ? 'disabled' : 'disconnect'}
        >
          قطع ارتباط
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="data-section">
        <h3>📡 داده‌های دریافتی ({dataList.length})</h3>
        
        {dataList.length === 0 ? (
          <p className="empty-state">هنوز داده‌ای دریافت نشده است</p>
        ) : (
          <div className="data-list">
            {dataList.map((item, index) => (
              <div key={index} className="data-item">
                <div className="data-time">
                  {new Date(item.date).toLocaleString('fa-IR')}
                </div>
                <div className="data-values">
                  <span className="temp">🌡️ {item.temperature}°C</span>
                  <span className="humidity">💧 {item.humidity}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .sse-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          direction: rtl;
        }
        
        .input-section {
          background: #f5f7fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .input-group {
          margin-bottom: 15px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #4a5568;
        }
        
        .input-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .connect {
          background-color: #48bb78;
          color: white;
        }
        
        .connect:hover:not(:disabled) {
          background-color: #38a169;
        }
        
        .disconnect {
          background-color: #f56565;
          color: white;
        }
        
        .disconnect:hover:not(:disabled) {
          background-color: #e53e3e;
        }
        
        .disabled {
          background-color: #a0aec0;
          color: white;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #e53e3e;
          background: #fff5f5;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #fed7d7;
        }
        
        .data-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .data-list {
          max-height: 500px;
          overflow-y: auto;
          border: 1px solid #edf2f7;
          border-radius: 6px;
        }
        
        .data-item {
          padding: 15px;
          border-bottom: 1px solid #edf2f7;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .data-item:last-child {
          border-bottom: none;
        }
        
        .data-time {
          color: #718096;
          font-size: 13px;
        }
        
        .data-values {
          display: flex;
          gap: 15px;
        }
        
        .temp {
          color: #dd6b20;
          background: #fffaf0;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .humidity {
          color: #3182ce;
          background: #ebf8ff;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .empty-state {
          color: #a0aec0;
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default SSETestPage;
