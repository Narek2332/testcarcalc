let usdtToRubRate = 91; // Курс USDT/RUB
let usdToRubRate = 91; // Курс USD/RUB

// Находим элемент на странице для отображения курса USDT/RUB
const usdtRubRateElement = document.getElementById("usdt-rub-rate");

// Функция для подключения к WebSocket Binance
function connectBinanceWebSocket() {
    const binanceWS = new WebSocket('wss://stream.binance.com:9443/ws/usdtrub@ticker');

    // Подключение к Binance WebSocket
    binanceWS.onopen = () => {
        console.log('✅ WebSocket Binance подключен');
    };

    // Получаем курс USDT/RUB и обновляем интерфейс
    binanceWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Извлекаем текущую цену
        const usdtToRubRate = parseFloat(data.c); // Последняя цена
        console.log(`📈 Курс USDT/RUB: ${usdtToRubRate}`);
        
        // Обновляем HTML
        if (usdtRubRateElement) {
            usdtRubRateElement.innerText = usdtToRubRate.toFixed(2); // Округляем до 2 знаков
        }
    };

    // Обработка ошибок
    binanceWS.onerror = (error) => {
        console.error("❌ Ошибка WebSocket:", error);
        if (usdtRubRateElement) {
            usdtRubRateElement.innerText = "Ошибка загрузки";
        }
    };

    // Обработка закрытия соединения
    binanceWS.onclose = () => {
        console.log('WebSocket соединение закрыто. Попытка переподключения...');
        if (usdtRubRateElement) {
            usdtRubRateElement.innerText = "Переподключение...";
        }

        // Переподключение через 5 секунд
        setTimeout(() => {
            connectBinanceWebSocket(); // Повторное подключение
        }, 5000);
    };
}

// Запускаем подключение к WebSocket Binance
connectBinanceWebSocket();


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
        let logisticsRub = 110000; // Брокерские услуги / ЕЛПТС

        // Конвертируем логистику в рубли
        const logisticsRubC = logisticsUsdt * usdtToRubRate;
        const logisticsTotal = logisticsRubC + logisticsRub;

        // Таможня
        let customs = 0;
        if (age === "0-3") {
            customs = price * 0.485; // 48.5%
        } else {
            if (declarant === "individual") {
                if (engineType === "petrol-diesel") {
                    if (engineVolume === "1.5-2.0") customs = 5700;
                    else if (engineVolume === "2.0-2.5") customs = 7860;
                    else if (engineVolume === "2.5-3.0") customs = 9400;
                }
                if (age === "5-7") {
                    if (engineVolume === "1.5-2.0") customs = 10000;
                    else if (engineVolume === "2.0-2.5") customs = 13000;
                    else if (engineVolume === "2.5-3.0") customs = 15600;
                }
            } else if (declarant === "legal") {
                // Добавляем коммерческий утиль для юр. лиц
                const util = engineVolume === "1.5-2.0" ? 1174000 : 2840000;
                if (engineType === "petrol-diesel") {
                    if (engineVolume === "1.5-2.0") customs = 5700 * usdToRubRate + util;
                    else if (engineVolume === "2.0-2.5") customs = 7860 * usdToRubRate + util;
                    else if (engineVolume === "2.5-3.0") customs = 9400 * usdToRubRate + util;
                }
                if (age === "5-7") {
                    if (engineVolume === "1.5-2.0") customs = 10000 * usdToRubRate + util;
                    else if (engineVolume === "2.0-2.5") customs = 13000 * usdToRubRate + util;
                    else if (engineVolume === "2.5-3.0") customs = 15600 * usdToRubRate + util;
                }
            }
        }

        // Итоговая стоимость
        const total = (price + customs) * usdToRubRate + logisticsTotal;
        document.getElementById('result').innerText = `Итоговая стоимость: ${total.toFixed(2)} ₽`;
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при расчете. Проверьте консоль для подробностей.");
    }
}


// Запрашиваем курс USD/RUB при загрузке страницы
getUsdToRubRate();
