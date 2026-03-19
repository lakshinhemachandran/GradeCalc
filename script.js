const percentToLetterConvertBtn = document.querySelector("#percentToLetterConvert")
const letterGrade = document.querySelector("#lettergrade")
const percentageGradeInput = document.querySelector("#percentageGradeInput")

const convertGrade = () => {
    letterGrade.innerHTML = ""

    if (percentageGradeInput.value === "") {
        letterGrade.innerHTML = ""
        return
    }

    const score = Number(percentageGradeInput.value) 

    if (score === 100) {
        letterGrade.innerHTML = "A+ - You Passed!"
    } else if (score >= 90 && score < 100) {
        letterGrade.innerHTML = "A - You Passed!"
    } else if (score >= 80 && score < 90) {
        letterGrade.innerHTML = "B - You Passed!"
    } else if (score >= 70 && score < 80) {        
        letterGrade.innerHTML = "C - You Passed."
    } else if (score >= 60 && score < 70) {
        letterGrade.innerHTML = "D - You Failed, keep trying for a C or higher!"
    } else {
        letterGrade.innerHTML = "F - You Failed, keep trying for a C or higher!"
    }
}

percentToLetterConvertBtn.addEventListener("click", convertGrade)

percentageGradeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        convertGrade()
    }
})
