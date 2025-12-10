// Імпортуємо модуль для зчитування введення користувача
const readline = require("readline");

// Створюємо інтерфейс для читання з консолі
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Функція для підрахунку кількості від’ємних чисел у масиві
function countNegativeNumbers(numbers) {
  if (!Array.isArray(numbers)) {
    console.log("Помилка: потрібно передати масив чисел!");
    return;
  }

  if (numbers.length === 0) {
    console.log("Помилка: масив порожній!");
    return;
  }

  const allNumbers = numbers.every(num => typeof num === "number" && !isNaN(num));
  if (!allNumbers) {
    console.log("Помилка: усі елементи мають бути числами!");
    return;
  }

  const negativeNumbers = numbers.filter(num => num < 0);
  console.log(`Кількість від’ємних чисел: ${negativeNumbers.length}`);
}

// Запитуємо у користувача числа
rl.question("Введіть числа через пробіл: ", (input) => {
  // Перетворюємо рядок у масив чисел
  const numbersArray = input
    .split(" ")
    .map(Number)
    .filter(n => !isNaN(n));

  countNegativeNumbers(numbersArray);

  // Закриваємо інтерфейс
  rl.close();
});
