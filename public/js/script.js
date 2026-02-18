import { Filesystem, Directory } from '@capacitor/filesystem';

const form = document.getElementById("resumeForm");
const resumeList = document.getElementById("resumeList");
const searchBar = document.getElementById("searchBar");

let resumes = [];

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const designation = document.getElementById("designation").value;
    const file = document.getElementById("resumeFile").files[0];

    const reader = new FileReader();

    reader.onload = async function () {
        const base64Data = reader.result.split(',')[1];

        // Save file internally
        await Filesystem.writeFile({
            path: file.name,
            data: base64Data,
            directory: Directory.Data
        });

        const resumeData = {
            id: Date.now(),
            name,
            designation,
            fileName: file.name
        };

        resumes.push(resumeData);

        // Save metadata JSON
        await Filesystem.writeFile({
            path: "data.json",
            data: JSON.stringify(resumes),
            directory: Directory.Data
        });

        loadResumes();
        form.reset();
    };

    reader.readAsDataURL(file);
});

async function loadResumes() {
    try {
        const result = await Filesystem.readFile({
            path: "data.json",
            directory: Directory.Data
        });

        resumes = JSON.parse(result.data);
    } catch {
        resumes = [];
    }

    displayResumes(resumes);
}

function displayResumes(data) {
    resumeList.innerHTML = "";

    data.forEach(resume => {
        const div = document.createElement("div");
        div.classList.add("resume-card");

        div.innerHTML = `
            <h3>${resume.name}</h3>
            <p>${resume.designation}</p>
            <button onclick="deleteResume(${resume.id})">Delete</button>
        `;

        resumeList.appendChild(div);
    });
}

async function deleteResume(id) {
    resumes = resumes.filter(r => r.id !== id);

    await Filesystem.writeFile({
        path: "data.json",
        data: JSON.stringify(resumes),
        directory: Directory.Data
    });

    loadResumes();
}

searchBar.addEventListener("input", () => {
    const value = searchBar.value.toLowerCase();
    const filtered = resumes.filter(r =>
        r.name.toLowerCase().includes(value) ||
        r.designation.toLowerCase().includes(value)
    );
    displayResumes(filtered);
});

loadResumes();
