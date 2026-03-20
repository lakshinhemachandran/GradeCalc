const classNameInput = document.querySelector("#class-name-input");
const addRow = document.querySelector("#add-row");
const existingGradeList = document.querySelector("#existing-grade-list");
const pendingGradeList = document.querySelector("#pending-grade-list");
const addPending = document.querySelector("#add-pending");
const calculateBtn = document.querySelector("#calculate-btn");
const restartBtn = document.querySelector("button[onclick='window.scrollTo(0,0)']");

const createRow = () => {
    const newRow = document.createElement("div");
    newRow.className = 'grade-row';
    newRow.innerHTML = `
        <input type="number" class="score" placeholder="Score">
        <input type="number" class="total" placeholder="Total">
    `;
    return newRow;
};

addRow.addEventListener("click", () => {
    existingGradeList.appendChild(createRow());
});

addPending.addEventListener("click", () => {
    pendingGradeList.appendChild(createRow());
});

calculateBtn.addEventListener("click", () => {
    const existingScores = [...existingGradeList.querySelectorAll('.score')]
        .map(input => parseFloat(input.value) || 0);
    const existingTotals = [...existingGradeList.querySelectorAll('.total')]
        .map(input => parseFloat(input.value) || 0);

    const pendingScores = [...pendingGradeList.querySelectorAll('.score')]
        .map(input => parseFloat(input.value) || 0);
    const pendingTotals = [...pendingGradeList.querySelectorAll('.total')]
        .map(input => parseFloat(input.value) || 0);

    const totalScore = [...existingScores, ...pendingScores].reduce((a, b) => a + b, 0);
    const totalPossible = [...existingTotals, ...pendingTotals].reduce((a, b) => a + b, 0);

    const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

    document.getElementById('display-class-name').innerText = classNameInput.value || "Science";
    document.getElementById('final-result').innerText = percentage.toFixed(1) + "%";
});

restartBtn.addEventListener("click", () => {
    classNameInput.value = "";
    existingGradeList.innerHTML = `
        <div class="grade-row">
            <input type="number" class="score" placeholder="Score">
            <input type="number" class="total" placeholder="Total">
        </div>
    `;
    pendingGradeList.innerHTML = `
        <div class="grade-row">
            <input type="number" class="score" placeholder="Score">
            <input type="number" class="total" placeholder="Total">
        </div>
    `;
    document.getElementById('final-result').innerText = "--%";
});
