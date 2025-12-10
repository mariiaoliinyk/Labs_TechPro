// Функція для генерації випадкового числа в діапазоні від min до max
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Функція для створення масиву з n випадкових чисел
const generateRandomArray = (n) => {
  if (typeof n !== "number" || n <= 0) {
    console.log("Помилка: кількість елементів має бути додатним числом!");
    return [];
  }
  return Array.from({ length: n }, () => getRandomNumber(-150, 151));
};

// Функція для обробки масиву: заміна від’ємних чисел на 0 і знаходження суми
const processArray = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    console.log("Помилка: масив порожній або некоректний!");
    return;
  }

  // Замінюємо від’ємні числа на 0
  const modifiedArray = arr.map(num => (num < 0 ? 0 : num));

  // сума всіх елементів
  const sum = modifiedArray.reduce((acc, num) => acc + num, 0);

  // Вивід результату
  console.log("Оригінальний масив:", arr);
  console.log("Масив після заміни від’ємних чисел:", modifiedArray);
  console.log("Сума всіх елементів:", sum);
};


const numbers = generateRandomArray(10);
processArray(numbers);
