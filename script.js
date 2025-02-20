let usdtToRubRate = 91; // Курс USDT/RUB
let usdToRubRate = 91; // Курс USD/RUB

// Находим элемент на странице для отображения курса USDT/RUB
const usdtRubRateElement = document.getElementById("usdt-rub-rate");

async function fetchUsdtRubRate() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=rub');
        const data = await response.json();
        const usdtToRubRate = parseFloat(data.tether.rub);
        console.log(`📈 Курс USDT/RUB: ${usdtToRubRate}`);
        
        if (usdtRubRateElement) {
            usdtRubRateElement.innerText = usdtToRubRate.toFixed(2);
        }
    } catch (error) {
        console.error("❌ Ошибка загрузки курса USDT/RUB:", error);
        if (usdtRubRateElement) {
            usdtRubRateElement.innerText = "Ошибка загрузки";
        }
    }
}

fetchUsdtRubRate(); // Первый запрос
//setInterval(fetchUsdtRubRate, 10000); // Повторяем каждые 10 секунд

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

// Функция для получения актуального курса валют
async function getExchangeRates() {
    try {
        await getUsdToRubRate(); // Функция обновляет переменную usdToRubRate
        await fetchUsdtRubRate();
    } catch (error) {
        console.error("Ошибка получения курса валют:", error);
        alert("Ошибка при обновлении курса валют!");
    }
}

// Основная функция расчета
async function calculate() {
    try {
        // Получаем данные из формы
        const price = parseFloat(document.getElementById('price').value);
        const country = document.getElementById('country').value;
        const declarant = document.getElementById('declarant').value;
        const engineType = document.getElementById('engineType').value;
        const engineVolume = document.getElementById('engineVolume').value;
        const age = document.getElementById('age').value;

        // Проверяем корректность введенной стоимости авто
        if (isNaN(price) || price <= 0) {
            alert("Введите корректную стоимость авто!");
            return;
        }

        // Обновляем курс валют
        await getExchangeRates();
        
        // === Логистика (зависит от страны) ===
        let logisticsUsdt = 0;
        let logisticsRub = 110000; // Брокерские услуги / ЕЛПТС

        if (country === "USA") {
            logisticsUsdt = 4105;
        } else if (country === "Korea") {
            logisticsUsdt = 4050;
        } else {
            alert("Выберите корректную страну!");
            return;
        }

        // Конвертация логистики в рубли
        const logisticsRubC = logisticsUsdt * usdtToRubRate;
        const logisticsTotal = logisticsRubC + logisticsRub;

        // === Расчет таможенных пошлин ===
        let customs = 0;

        if (age === "0-3"  ) {
            customs = price * 0.485 * usdToRubRate ; // 48.5% от цены
        } else {
            if (declarant === "individual") {
                // Физическое лицо
                if (engineType === "petrol-diesel" || engineType === "hybrid") {
                    if (age === "3-5") {
                        if (engineVolume === "1.5-2.0") customs = 5700 * usdToRubRate ;
                        else if (engineVolume === "2.0-2.5") customs = 7860 * usdToRubRate ;
                        else if (engineVolume === "2.5-3.0") customs = 9400 * usdToRubRate ;
                    } else if (age === "5-7") {
                        if (engineVolume === "1.5-2.0") customs = 10000 * usdToRubRate ;
                        else if (engineVolume === "2.0-2.5") customs = 13000 * usdToRubRate ;
                        else if (engineVolume === "2.5-3.0") customs = 15600 * usdToRubRate ;
                    }
                }
            } else if (declarant === "legal") {
                // Юридическое лицо
                let util = 0;
                if (engineVolume === "1.5-2.0") util = 1174000;
                else if (engineVolume === "2.0-2.5") util = 2840000;
                else if (engineVolume === "2.5-3.0") util = 2840000;

                if (engineType === "petrol-diesel" || engineType === "hybrid") {
                    if (age === "3-5") {
                        if (engineVolume === "1.5-2.0") customs = 5700 * usdToRubRate + util;
                        else if (engineVolume === "2.0-2.5") customs = 7860 * usdToRubRate + util;
                        else if (engineVolume === "2.5-3.0") customs = 9400 * usdToRubRate + util;
                    } else if (age === "5-7") {
                        if (engineVolume === "1.5-2.0") customs = 10000 * usdToRubRate + util;
                        else if (engineVolume === "2.0-2.5") customs = 13000 * usdToRubRate + util;
                        else if (engineVolume === "2.5-3.0") customs = 15600 * usdToRubRate + util;
                    }
                }
            }
        }

        // === Итоговая стоимость ===
        const total = price * usdtToRubRate + customs + logisticsTotal;
        document.getElementById('result').innerText = `Итоговая стоимость: ${total.toFixed(2)} ₽`;
    } catch (error) {
        console.error("Ошибка расчета:", error);
        alert("Произошла ошибка при расчете. Проверьте консоль для подробностей.");
    }
}



// Запрашиваем курс USD/RUB при загрузке страницы
getUsdToRubRate();
