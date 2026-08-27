const BASE =
    "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0";

const muscleNames = {
    pectorals: "الصدر",
    back: "الظهر",
    delts: "الأكتاف",
    biceps: "البايسبس",
    triceps: "الترايسبس",
    quads: "الأرجل",
    abs: "البطن",
    calves: "الساق"
};


let exercises = [];

let currentMuscle = "pectorals";

let workout =
    JSON.parse(
        localStorage.getItem("mfitness-workout") || "[]"
    );

let selectedExercise = null;


const grid =
    document.getElementById("exerciseGrid");

const search =
    document.getElementById("search");

const modal =
    document.getElementById("modal");


/* LOAD EXERCISES */

async function loadExercises(muscle = "pectorals") {

    currentMuscle = muscle;

    grid.innerHTML =
        '<div class="loading">جاري تحميل التمارين...</div>';

    try {

        const response =
            await fetch(
                `${BASE}/api/en/muscles/${muscle}.json`
            );

        if (!response.ok) {
            throw new Error("API Error");
        }

        const data =
            await response.json();

        exercises =
            data.exercises || [];

        renderExercises(exercises);

    } catch (error) {

        console.error(error);

        grid.innerHTML =
            `<div class="loading">
                تعذر تحميل التمارين.
                <br>
                تأكد من اتصال الإنترنت.
            </div>`;
    }
}


/* RENDER EXERCISES */

function renderExercises(list) {

    if (!list.length) {

        grid.innerHTML =
            `<div class="loading">
                ما لقينا تمارين مطابقة.
            </div>`;

        return;
    }


    grid.innerHTML =
        list
            .slice(0, 24)
            .map((exercise, index) => {

                return `
                    <article
                        class="exercise-card"
                        data-index="${index}"
                    >

                        <img
                            loading="lazy"
                            src="${exercise.gifUrl}"
                            alt="${escapeHtml(exercise.name)}"
                        >

                        <div class="exercise-info">

                            <button
                                class="add"
                                data-add="${index}"
                            >
                                +
                            </button>

                            <h3>
                                ${escapeHtml(exercise.name)}
                            </h3>

                            <small>
                                ${
                    muscleNames[
                        exercise.muscle
                        ] ||
                    exercise.muscle
                }

                                ·

                                ${
                    exercise.equipment ||
                    "متنوع"
                }
                            </small>

                        </div>

                    </article>
                `;

            })
            .join("");


    /* CARD CLICK */

    grid
        .querySelectorAll(".exercise-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            "[data-add]"
                        )
                    ) {
                        return;
                    }

                    const index =
                        Number(
                            card.dataset.index
                        );

                    openModal(
                        exercises[index]
                    );
                }
            );

        });


    /* ADD BUTTON */

    grid
        .querySelectorAll("[data-add]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const index =
                        Number(
                            button.dataset.add
                        );

                    addWorkout(
                        exercises[index]
                    );

                }
            );

        });

}


/* SEARCH */

search.addEventListener(
    "input",
    () => {

        const query =
            search.value
                .trim()
                .toLowerCase();


        const filtered =
            exercises.filter(exercise => {

                return (
                    (exercise.name || "")
                        .toLowerCase()
                        .includes(query)

                    ||

                    (exercise.equipment || "")
                        .toLowerCase()
                        .includes(query)
                );

            });


        renderExercises(filtered);

    }
);


/* MUSCLE BUTTONS */

document
    .querySelectorAll(".muscle-card")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                loadExercises(
                    button.dataset.muscle
                );

                document
                    .getElementById("exercises")
                    .scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );

    });


/* OPEN MODAL */

function openModal(exercise) {

    selectedExercise =
        exercise;


    document
        .getElementById("modalGif")
        .src =
        exercise.gifUrl;


    document
        .getElementById("modalGif")
        .alt =
        exercise.name;


    document
        .getElementById("modalTitle")
        .textContent =
        exercise.name;


    document
        .getElementById("modalMuscle")
        .textContent =
        muscleNames[
            exercise.muscle
            ] ||
        exercise.muscle;


    document
        .getElementById("modalEquipment")
        .textContent =
        `المعدات: ${
            exercise.equipment ||
            "متنوع"
        }`;


    modal.classList.add("open");

}


/* CLOSE MODAL */

document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener(
            "click",
            closeModal
        );

    });


function closeModal() {

    modal.classList.remove("open");

}


/* ADD FROM MODAL */

document
    .getElementById("modalAdd")
    .addEventListener(
        "click",
        () => {

            if (selectedExercise) {

                addWorkout(
                    selectedExercise
                );

            }

            closeModal();

        }
    );


/* WORKOUT */

function addWorkout(exercise) {

    if (
        workout.some(
            item =>
                item.id === exercise.id
        )
    ) {

        return;
    }


    workout.push(
        exercise
    );


    saveWorkout();

    renderWorkout();

}


function removeWorkout(id) {

    workout =
        workout.filter(
            exercise =>
                exercise.id !== id
        );


    saveWorkout();

    renderWorkout();

}


function saveWorkout() {

    localStorage.setItem(
        "mfitness-workout",
        JSON.stringify(workout)
    );

}


function renderWorkout() {

    document
        .getElementById("workoutCount")
        .textContent =
        `${workout.length} تمرين`;


    const list =
        document.getElementById(
            "workoutList"
        );


    if (!workout.length) {

        list.innerHTML =
            `
            <p class="empty">

                لم تضف أي تمرين بعد.

                <br>

                اضغط + على أي تمرين لإضافته.

            </p>
            `;

        return;
    }


    list.innerHTML =
        workout
            .map(exercise => {

                return `
                    <div class="workout-item">

                        <img
                            src="${exercise.gifUrl}"
                            alt=""
                        >

                        <div>

                            <strong>
                                ${escapeHtml(
                    exercise.name
                )}
                            </strong>

                            <small>
                                ${
                    muscleNames[
                        exercise.muscle
                        ] ||
                    exercise.muscle
                }
                            </small>

                        </div>

                        <button
                            class="remove"
                            data-remove="${exercise.id}"
                        >
                            ×
                        </button>

                    </div>
                `;

            })
            .join("");


    list
        .querySelectorAll("[data-remove]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeWorkout(
                        button.dataset.remove
                    );

                }
            );

        });

}


/* HTML SECURITY */

function escapeHtml(text = "") {

    return String(text)
        .replace(
            /[&<>"']/g,
            character => {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                }[character];

            }
        );

}


/* START */

renderWorkout();

loadExercises("pectorals");