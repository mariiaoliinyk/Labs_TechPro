// Початкові дані
let projects = [
    { id: 1, name: "Stalker2", type: "SEO", cost: 15000, revenue: 250000 },
    { id: 2, name: "inst Продукт X", type: "PPC", cost: 8000, revenue: 12000 },
    { id: 3, name: "Google Пошук Q3", type: "SMM", cost: 5000, revenue: 4500 },
    { id: 4, name: "YouTube Інфлюенсер Q2", type: "PPC", cost: 12000, revenue: 30000 },
];
let nextId = projects.length + 1;
let myChart; 
let projectList; 
const STORAGE_KEY = 'adProjectsData';

// ЗБЕРЕЖЕННЯ ОБЧИСЛЕНЬ 


function loadProjects() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        projects = JSON.parse(data);
        const maxId = _.maxBy(projects, 'id');
        nextId = maxId ? maxId.id + 1 : 1;
        if (projects.length > 0) {
            Swal.fire('Дані завантажено!', 'Попередні дані проєктів відновлено.', 'info');
        }
    }
}

function saveProjects() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    Swal.fire('Збережено!', 'Дані успішно збережено в браузері.', 'success');
}

// АНАЛІТИЧНІ ОБЧИСЛЕННЯ 


function calculateAnalytics() {
    if (projects.length === 0) {
        return { projects: [], totalProfit: 0, averageROI: 0, sumByCategory: {} };
    }

    // Додаємо поля 'profit' та 'roi' до кожного проєкту
    const projectsWithAnalytics = _.map(projects, project => {
        const profit = project.revenue - project.cost;
        const roi = (profit / project.cost) * 100;

        return {
            ...project,
            profit: profit,
            roi: isNaN(roi) || !isFinite(roi) ? 0 : roi 
        };
    });

    // Обчислення №1: Загальний прибуток
    const totalProfit = _.sumBy(projectsWithAnalytics, 'profit');

    // Обчислення №2: Середній ROI
    const averageROI = _.meanBy(projectsWithAnalytics, 'roi');

    return {
        projects: projectsWithAnalytics,
        totalProfit: totalProfit,
        averageROI: averageROI
    };
}

// ВІЗУАЛІЗАЦІЯ ДАНИХ 
function renderChart(analyticsData) {
    if (analyticsData.projects.length === 0) {
        if (myChart) myChart.destroy();
        document.getElementById('profitChart').style.display = 'none';
        return;
    }
    document.getElementById('profitChart').style.display = 'block';

    const profits = analyticsData.projects.map(p => p.profit);
    const labels = analyticsData.projects.map(p => p.name);

    const ctx = document.getElementById('profitChart').getContext('2d');

    if (myChart) {
        myChart.destroy(); 
    }
    
    myChart = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: labels, 
            datasets: [
                {
                    label: 'Прибуток/Збиток (грн)',
                    data: profits,
                    type: 'bar', 
                    // Бірюзовий для прибутку, червоний для збитку
                    backgroundColor: profits.map(p => p >= 0 ? 'rgba(0, 128, 128, 0.7)' : 'rgba(255, 99, 132, 0.7)'), 
                    borderColor: profits.map(p => p >= 0 ? 'rgba(0, 128, 128, 1)' : 'rgba(255, 99, 132, 1)'),
                    borderWidth: 1,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Сума (грн)' }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Прибуток/Збиток по Проєктах'
                }
            }
        }
    });
}

// ФІЛЬТРАЦІЯ/СОРТУВАННЯ 
function renderList(projectsWithAnalytics) {
    const listBody = document.querySelector('#projectTable .list');
    
    // Якщо List.js вже існує, ми його знищуємо, щоб коректно перевизначити дані
    if (projectList) {
        projectList.destroy();
        projectList = null; 
    }
    
    listBody.innerHTML = ''; 

    // Додавання рядків до DOM
    projectsWithAnalytics.forEach(p => {
        const row = document.createElement('tr');
        const profitClass = p.profit >= 0 ? 'profit-positive' : 'profit-negative';
        
        row.innerHTML = `
            <td class="name">${p.name}</td>
            <td class="type">${p.type}</td>
            <td class="cost">${p.cost.toFixed(2)}</td>
            <td class="revenue">${p.revenue.toFixed(2)}</td>
            <td class="profit ${profitClass}">${p.profit.toFixed(2)}</td>
            <td class="roi">${p.roi.toFixed(2)}%</td>
            <td><button class="delete-btn" onclick="deleteProject(${p.id})">🗑️</button></td>
        `;
        listBody.appendChild(row);
    });

    // Повна ініціалізація List.js після заповнення DOM
    projectList = new List('projectTable', {
        valueNames: ['name', 'type', 'cost', 'revenue', 'profit', 'roi']
    });
}


function updateDashboard() {
    const analytics = calculateAnalytics();

    // Оновлення аналітичних показників
    document.getElementById('total-profit').textContent = analytics.totalProfit.toFixed(2);
    document.getElementById('total-profit').className = analytics.totalProfit >= 0 ? 'profit-positive' : 'profit-negative';
    
    document.getElementById('average-roi').textContent = analytics.averageROI.toFixed(2);

    renderList(analytics.projects);
    renderChart(analytics);
}

// Функція для додавання нового проєкту (SweetAlert2)
async function addProject() {
    const { value: formValues } = await Swal.fire({
        title: 'Додати новий рекламний проєкт',
        html:
            '<input id="swal-name" class="swal2-input" placeholder="Назва Проєкту">' +
            '<input id="swal-type" class="swal2-input" placeholder="Тип (SEO, PPC, SMM)">' +
            '<input id="swal-cost" type="number" class="swal2-input" placeholder="Вартість (грн)">' +
            '<input id="swal-revenue" type="number" class="swal2-input" placeholder="Дохід (грн)">',
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('swal-name').value;
            const type = document.getElementById('swal-type').value;
            const cost = parseFloat(document.getElementById('swal-cost').value);
            const revenue = parseFloat(document.getElementById('swal-revenue').value);
            if (!name || !type || isNaN(cost) || isNaN(revenue)) {
                Swal.showValidationMessage(`Будь ласка, заповніть усі поля коректно.`);
                return false;
            }
            return { name, type, cost, revenue };
        }
    });

    if (formValues) {
        projects.push({
            id: nextId++,
            name: formValues.name,
            type: formValues.type,
            cost: formValues.cost,
            revenue: formValues.revenue
        });
        updateDashboard();
        Swal.fire('Готово!', 'Новий проєкт додано до розрахунків.', 'success');
    }
}

// Функція видалення проєкту (SweetAlert2)
function deleteProject(id) {
    Swal.fire({
        title: 'Ви впевнені?',
        text: "Ви не зможете відновити цей проєкт!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Так, видалити!',
        cancelButtonText: 'Скасувати'
    }).then((result) => {
        if (result.isConfirmed) {
            projects = _.reject(projects, { id: id }); 
            updateDashboard();
            Swal.fire('Видалено!', 'Проєкт успішно видалено.', 'success');
        }
    });
}


// Запуск застосунку при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    loadProjects(); 
    updateDashboard(); 
});