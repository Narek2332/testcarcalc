let usdtToUsdRate = 1; // Курс USDT/USD
let usdToRubRate = 75; // Курс USD/RUB

// Находим элемент на странице для отображения курса USDT/USD
const usdtUsdRateElement = document.getElementById("usdt-usd-rate");

// Функция для подключения к WebSocket
function connectWebSocket() {
    const coinbaseWS = new WebSocket('wss://ws-feed.pro.coinbase.com');

    // Подключение к Coinbase WebSocket
    coinbaseWS.onopen = () => {
        console.log('✅ WebSocket Coinbase подключен');
        
        // Подписка на тикер для пары USDT-USD
        coinbaseWS.send(JSON.stringify({
            type: 'subscribe',
            product_ids: ['USDT-USD'], // Пара USDT/USD
            channels: ['ticker'] // Канал для получения обновлений курса
        }));
    };

    // Получаем курс USDT/USD и обновляем интерфейс
    coinbaseWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Фильтруем сообщения с типом 'ticker' и парой USDT-USD
        if (data?.type === 'ticker' && data?.product_id === 'USDT-USD' && data?.price) {
            const usdtToUsdRate = parseFloat(data.price); // Текущая цена
            console.log(`📈 Курс USDT/USD: ${usdtToUsdRate}`);
            
            // Обновляем HTML
            if (usdtUsdRateElement) {
                usdtUsdRateElement.innerText = usdtToUsdRate.toFixed(4); // Округляем до 4 знаков
            }
        }
    };

    // Обработка ошибок
    coinbaseWS.onerror = (error) => {
        console.error("❌ Ошибка WebSocket:", error);
        if (usdtUsdRateElement) {
            usdtUsdRateElement.innerText = "Ошибка загрузки";
        }
    };

    

// Запускаем подключение к WebSocket
connectWebSocket();
}
// Получение курса USD/RUB через прокси-сервер
async function getUsdToRubRate() {
    try {
        const proxyUrl = "https://api.allorigins.win/get?url=";
        const apiUrl = encodeURIComponent("https://www.cbr-xml-daily.ru/daily_json.js");
        const response = await fetch(proxyUrl + apiUrl);
        const data = await response.json();
        const parsedData = JSON.parse(data.contents);

        usdToRubRate = parseFloat(parsedData.Valute.USD.Value);
        document.getElementById("usd-rub-rate").innerText = usdToRubRate.toFixed(2);
        console.log('Текущий курс USD/RUB:', usdToRubRate);
    } catch (error) {
        console.error("Ошибка при получении курса USD/RUB:", error);
    }
}

// Основная функция расчета
async function calculate() {
    try {
        const price = parseFloat(document.getElementById('price').value);
        const country = document.getElementById('country').value;
        const declarant = document.getElementById('declarant').value;
        const engineType = document.getElementById('engineType').value;
        const engineVolume = document.getElementById('engineVolume').value;
        const age = document.getElementById('age').value;

        if (isNaN(price) || price <= 0) {
            alert("Введите корректную стоимость авто!");
            return;
        }

        // Обновляем курс USD/RUB
        await getUsdToRubRate();

        // Логистика
        let logisticsUsdt = country === "USA" ? 4105 : 4050;
        let logisticsRub = 110000; // Брокерские услуги

        // Конвертируем логистику в рубли
        const logisticsUsd = logisticsUsdt * usdtToUsdRate;
        const logisticsTotal = logisticsUsd * usdToRubRate + logisticsRub;

        // Таможня
        let customs = price * 0.485; // 48.5% от цены авто (пример)

        // Итоговая стоимость
        const total = (price + customs) * usdToRubRate + logisticsTotal;
        document.getElementById('result').innerText = `Итоговая стоимость: ${total.toFixed(2)} ₽`;
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при расчете. Проверьте консоль.");
    }
}

// Запрашиваем курс USD/RUB при загрузке страницы
getUsdToRubRate();
