let usdtToUsdRate = 1; // Курс USDT/USD
let usdToRubRate = 75; // Курс USD/RUB

// Подключение к WebSocket Bybit для получения курса USDT/USD
const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');

ws.onopen = () => {
    console.log('WebSocket подключен');
    ws.send(JSON.stringify({
        op: "subscribe",
        args: ["tickers.USDTUSD"]
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.topic === "tickers.USDTUSD" && data.type === "snapshot") {
        usdtToUsdRate = parseFloat(data.data.lastPrice);
        document.getElementById("usdt-usd-rate").innerText = usdtToUsdRate.toFixed(4);
        console.log('Текущий курс USDT/USD:', usdtToUsdRate);
    }
};

ws.onerror = (error) => {
    console.error('WebSocket ошибка:', error);
};

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
