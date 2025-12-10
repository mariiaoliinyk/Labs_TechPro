//  Отримання посилань на DOM-елементи
const form = document.getElementById('tableGeneratorForm');
const rowsInput = document.getElementById('rowsN');
const colsInput = document.getElementById('colsM');
const tableContainer = document.getElementById('tableContainer');
const averageValueDisplay = document.getElementById('averageValue');

// Глобальна змінна для зберігання всіх чисел таблиці
let tableData = []; 

// Функція для обчислення та відображення середнього значення 
function calculateAndDisplayAverage() {
    if (tableData.length === 0) {
        averageValueDisplay.textContent = 'Середнє значення: -';
        return;
    }
    
    // Сума всіх елементів
    const sum = tableData.reduce((acc, current) => acc + current, 0);
    
    // Обчислення середнього
    const average = sum / tableData.length;
    
    // Виведення результату
    averageValueDisplay.textContent = `Середнє значення всіх чисел: ${average.toFixed(2)}`;
}

//  Функція для підсвічування максимальних значень 
function highlightMax() {
    //  Знаходимо максимальне число в масиві
    if (tableData.length === 0) return;
    const maxNumber = Math.max(...tableData);

    // Отримуємо всі клітинки таблиці (використовуємо делегування або querySelectorAll)
    const cells = tableContainer.querySelectorAll('td');

    //  Перебираємо клітинки та застосовуємо/видаляємо клас
    cells.forEach(cell => {
        // Очищаємо попереднє підсвічування, щоб toggle працював коректно
        cell.classList.remove('highlight-max'); 

        // Отримуємо числове значення з текстового вмісту
        const cellValue = parseInt(cell.textContent);
        
        // Використовуємо toggle, щоб працювало як увімкнення, так і вимкнення підсвічування
        if (cellValue === maxNumber) {
            cell.classList.add('highlight-max');
        }
    });

    // Оновлюємо текст кнопки для UX
    const btn = document.getElementById('highlightButton');
    if (btn) {
        const isHighlighted = cells[0] && cells[0].classList.contains('highlight-max');
        btn.textContent = isHighlighted ? 'Прибрати Підсвічування' : 'Підсвітити Максимальне';
    }
}


//  Головна функція для створення таблиці 
function generateTable(N, M) {
    // 1. Очищуємо контейнер від попередньої таблиці та кнопок
    tableContainer.innerHTML = ''; 
    averageValueDisplay.textContent = '';
    tableData = []; // Скидаємо дані

    // Створюємо головний елемент таблиці
    const table = document.createElement('table');
    const tableBody = document.createElement('tbody');

    // 2. Генерація таблиці
    for (let i = 0; i < N; i++) {
        const row = document.createElement('tr'); // Створюємо рядок <tr>

        for (let j = 0; j < M; j++) {
            const cell = document.createElement('td'); // Створюємо клітинку <td>
            
            // Генеруємо випадкове число від 1 до 100
            const randomNumber = Math.floor(Math.random() * 1000) + 1;
            
            // Наповнюємо клітинку вмістом
            cell.textContent = randomNumber;
            
            // Зберігаємо число в масив даних
            tableData.push(randomNumber);
            
            // Додаємо клітинку до рядка
            row.appendChild(cell);
        }
        // Додаємо рядок до тіла таблиці
        tableBody.appendChild(row);
    }

    //  Додаємо тіло таблиці до таблиці, а таблицю  до контейнера
    table.appendChild(tableBody);
    tableContainer.appendChild(table);

    //  Створюємо кнопку "Підсвітити максимальне"
    const highlightButton = document.createElement('button');
    highlightButton.id = 'highlightButton';
    highlightButton.textContent = 'Підсвітити Максимальне';
    
    // Додаємо обробник події для підсвічування
    highlightButton.addEventListener('click', highlightMax);
    
    // Додаємо кнопку після таблиці
    tableContainer.appendChild(highlightButton);

    // Обчислюємо та виводимо середнє значення
    calculateAndDisplayAverage();
}

// Обробник події submit форми 
form.addEventListener('submit', function(event) {
    event.preventDefault(); // це скасовує стандартну дію (перезавантаження сторінки)
    
    // Отримуємо числові значення N і M
    const N = parseInt(rowsInput.value);
    const M = parseInt(colsInput.value);
    
    // Валідація (хоча input[type="number"] з min="1" вже допомагає)
    if (isNaN(N) || isNaN(M) || N < 1 || M < 1) {
        alert('Будь ласка, введіть коректні значення для N і M (більше 0).');
        return;
    }

    // Запускаємо генерацію
    generateTable(N, M);
});


// Ініціалізуємо таблицю при завантаженні сторінки (не обов'язково)
document.addEventListener('DOMContentLoaded', () => {
    generateTable(5, 5);
});