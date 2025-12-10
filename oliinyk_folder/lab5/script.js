

const STORAGE_KEY = "advertisingProjects";
let projects = [];

// Отримання елементів DOM
const projectForm = document.getElementById('projectForm');
const projectTableBody = document.getElementById('projectTableBody');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');

// Об'єкт для зручного доступу до полів введення
const formElements = {
    projectName: document.getElementById('projectName'),
    clientName: document.getElementById('clientName'),
    projectType: document.getElementById('projectType'),
    costIn: document.getElementById('costIn'),
    markupPercent: document.getElementById('markupPercent'),
    quantity: document.getElementById('quantity'),
    discountPercent: document.getElementById('discountPercent'),
    startDate: document.getElementById('startDate')
};


// ЗБЕРЕЖЕННЯ ДАНИХ

/**
 * Зберігає поточний масив projects у LocalStorage.
 */
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Завантажує дані з LocalStorage при старті.
 */
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        projects = JSON.parse(data);
    }
    renderTable();
}


// ЛОГІКА РОЗРАХУНКУ 


/**
 * Розраховує ключові фінансові показники проєкту.
 * @param {object} project - Об'єкт проєкту з вхідними даними.
 * @returns {object} Об'єкт з розрахованими показниками (відформатованими).
 */
function calculateProject(project) {
    const costIn = parseFloat(project.costIn);
    const markupPercent = parseFloat(project.markupPercent);
    const quantity = parseInt(project.quantity);
    const discountPercent = parseFloat(project.discountPercent || 0);

    // 1. Вихідна Вартість (OUT) за одиницю (IN + Націнка)
    const costOutPerUnit = costIn * (1 + markupPercent / 100);

    // 2. Фінальна Вартість (OUT, Total) для клієнта
    const totalCostOutPreDiscount = costOutPerUnit * quantity;
    const totalFinalCost = totalCostOutPreDiscount * (1 - discountPercent / 100);

    // 3. Загальна Вхідна Вартість (IN, Total)
    const totalCostIn = costIn * quantity;

    // 4. Валовий Прибуток
    const grossProfit = totalFinalCost - totalCostIn;

    return {
        costOutPerUnit: costOutPerUnit.toFixed(2),
        totalFinalCost: totalFinalCost.toFixed(2),
        totalCostIn: totalCostIn.toFixed(2),
        grossProfit: grossProfit.toFixed(2)
    };
}

//  (Відображення Таблиці)

/**
 * Генерує та оновлює HTML-таблицю на основі масиву projects.
 */
function renderTable() {
    projectTableBody.innerHTML = '';
    
    if (projects.length === 0) {
        projectTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Немає збережених рекламних проєктів.</td></tr>';
        return;
    }

    projects.forEach((project, index) => {
        const calcs = calculateProject(project);
        
        const row = document.createElement('tr');
        const profitClass = calcs.grossProfit >= 0 ? 'text-success' : 'text-danger';

        row.innerHTML = `
            <td>${project.projectName}</td>
            <td>${project.clientName}</td>
            <td>${project.projectType}</td>
            
            <td class="text-end">${calcs.totalCostIn}</td>
            <td class="text-end fw-bold">${calcs.totalFinalCost}</td>
            <td class="text-end ${profitClass}">${calcs.grossProfit}</td>
            
            <td>${project.startDate}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="editProject(${index})">Редагувати</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject(${index})">Видалити</button>
            </td>
        `;
        projectTableBody.appendChild(row);
    });
}

// (Обробка Форми)

/**
 * Обробник події відправки форми. Додає новий проєкт.
 */
function addProject(e) {
    e.preventDefault();

    //  Перевірка валідності форми
    if (!projectForm.checkValidity()) {
        projectForm.classList.add('was-validated');
        return;
    }
    
    //  Створення нового об'єкта проєкту
    const newProject = {
        projectName: formElements.projectName.value.trim(),
        clientName: formElements.clientName.value.trim(),
        projectType: formElements.projectType.value,
        costIn: formElements.costIn.value,
        markupPercent: formElements.markupPercent.value,
        quantity: formElements.quantity.value,
        discountPercent: formElements.discountPercent.value,
        startDate: formElements.startDate.value
    };

    // Збереження, оновлення інтерфейсу та очищення форми
    projects.push(newProject);
    saveData();
    renderTable();
    
    projectForm.reset();
    projectForm.classList.remove('was-validated');
}

//  (Видалення та Редагування)

/**
 * Видаляє проєкт за індексом.
 * @param {number} index - Індекс проєкту в масиві.
 */
function deleteProject(index) {
    if (confirm(`Ви впевнені, що хочете видалити проєкт "${projects[index].projectName}"?`)) {
        projects.splice(index, 1);
        saveData();
        renderTable();
    }
}

/**
 * Переносить дані проєкту у форму для редагування.
 * @param {number} index - Індекс проєкту в масиві.
 */
function editProject(index) {
    const projectToEdit = projects[index];
    
    // 1. Заповнити форму даними
    for (const key in formElements) {
        if (formElements.hasOwnProperty(key)) {
            formElements[key].value = projectToEdit[key];
        }
    }

    // 2. Видалити старий запис з масиву (щоб при submit він був замінений новим)
    projects.splice(index, 1);
    saveData();
    renderTable();
    
    // 3. Прокрутка до форми
    projectForm.scrollIntoView({ behavior: 'smooth' });
    alert(`Редагування проєкту "${projectToEdit.projectName}". Внесіть зміни та натисніть "Додати Проєкт" для оновлення.`);
}


// ІМПОРТ ТА ЕКСПОРТ JSON

/**
 * Експортує дані у файл projects.json.
 */
function exportData() {
    if (projects.length === 0) {
        alert("Немає даних для експорту.");
        return;
    }
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    
    // Тригер завантаження
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Імпортує дані з обраного JSON-файлу.
 */
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = () => {
        try {
            const importedData = JSON.parse(reader.result);
            if (Array.isArray(importedData)) {
                projects = importedData;
                saveData();
                renderTable();
                alert("✅ Дані успішно імпортовано!");
            } else {
                alert("❌ Помилка імпорту: Файл має містити коректний JSON-масив.");
            }
        } catch (error) {
            alert(`❌ Помилка парсингу JSON: ${error.message}`);
        }
    };
    
    reader.readAsText(file);
    importInput.value = ''; // Очистити поле
}


// ІНІЦІАЛІЗАЦІЯ

// Підключення обробників подій до елементів інтерфейсу
projectForm.addEventListener('submit', addProject);
exportBtn.addEventListener('click', exportData);
importBtn.addEventListener('click', () => importInput.click()); 
importInput.addEventListener('change', importData);

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', loadData);