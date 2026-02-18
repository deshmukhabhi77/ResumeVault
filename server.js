const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use("/resumes", express.static("resumes"));

if (!fs.existsSync("resumes")) {
    fs.mkdirSync("resumes");
}

// Read Data
function readData() {
    return JSON.parse(fs.readFileSync("data.json"));
}

// Write Data
function writeData(data) {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "resumes/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Upload Resume
app.post("/upload", upload.single("resume"), (req, res) => {
    const { name, designation } = req.body;

    const data = readData();

    const newResume = {
        id: Date.now(),
        name,
        designation,
        filePath: `/resumes/${req.file.filename}`
    };

    data.push(newResume);
    writeData(data);

    res.json({ message: "Uploaded Successfully" });
});

// Get All Resumes
app.get("/resumes-data", (req, res) => {
    res.json(readData());
});

// Delete Resume
app.delete("/delete/:id", (req, res) => {
    let data = readData();
    const id = parseInt(req.params.id);

    const resume = data.find(r => r.id === id);

    if (resume) {
        const filePath = path.join(__dirname, resume.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    data = data.filter(r => r.id !== id);
    writeData(data);

    res.json({ message: "Deleted Successfully" });
});

// Edit Resume
app.put("/edit/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { name, designation } = req.body;

    const data = readData();
    const resume = data.find(r => r.id === id);

    if (resume) {
        resume.name = name;
        resume.designation = designation;
        writeData(data);
        res.json({ message: "Updated Successfully" });
    } else {
        res.status(404).json({ message: "Not Found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
