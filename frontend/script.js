// 📂 ELEMENTS
const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const fileName = document.getElementById("fileName");
const status = document.getElementById("status");
const loader = document.getElementById("loader");
const dashboard = document.getElementById("dashboard");

let chartInstance = null;
let autoInterval = null;

// 📌 FILE NAME
fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        fileName.innerText = "📄 " + fileInput.files[0].name;
    }
});

// 📦 DRAG DROP
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");

    fileInput.files = e.dataTransfer.files;
    fileName.innerText = "📄 " + fileInput.files[0].name;
});

// 🚀 UPLOAD
async function uploadFile() {

    if (!fileInput.files.length) {
        showToast("Select a file first");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        toggleLoader(true);
        updateStatus("⏳ Analyzing...", "info");

        const res = await fetch("http://localhost:8080/api/logs/analyze", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();

        renderDashboard(data);
        renderChart(data);
        showTopAttacker(data);
        calculateRisk(data);
        compareTrend(data);

        window.lastData = data;

        saveHistory(data);

        updateStatus("✅ Done", "success");
        showToast("Analysis complete 🚀");

    } catch (err) {
        console.error(err);
        updateStatus("❌ Error analyzing logs", "error");
        showToast("Error occurred");
    } finally {
        toggleLoader(false);
    }
}

// 📊 DASHBOARD
function renderDashboard(data) {

    dashboard.classList.remove("hidden");

    document.getElementById("totalLogs").innerText = data.totalLogs || 0;
    document.getElementById("errors").innerText = data.errors || 0;
    document.getElementById("failedLogins").innerText = data.failedLogins || 0;

    const tbody = document.querySelector("#ipTable tbody");
    tbody.innerHTML = "";

    const ips = data.suspiciousIPs || {};

    for (let ip in ips) {
        const count = ips[ip];

        let badge = "🟢 Low";
        if (count > 10) badge = "🔴 Critical";
        else if (count > 5) badge = "🟠 Medium";

        const row = document.createElement("tr");

        if (count > 5) {
            row.style.background = "#7f1d1d";
            row.style.color = "white";
        }

        row.innerHTML = `
            <td>${ip}</td>
            <td>${count}</td>
            <td>${badge}</td>
        `;

        row.onclick = () => showIPDetails(ip, count);

        tbody.appendChild(row);
    }

    sortTable();
}

// 📊 CHART
function renderChart(data) {

    const ctx = document.getElementById("logChart").getContext("2d");

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Total", "Errors", "Failed"],
            datasets: [{
                data: [data.totalLogs, data.errors, data.failedLogins],
                backgroundColor: ["#60a5fa", "#ef4444", "#facc15"]
            }]
        },
        options: {
            plugins: { legend: { display: false } }
        }
    });
}

// 🔍 SEARCH
document.getElementById("searchInput").addEventListener("input", function () {
    const val = this.value.toLowerCase();
    document.querySelectorAll("#ipTable tbody tr").forEach(row => {
        const ip = row.children[0].innerText.toLowerCase();
        row.style.display = ip.includes(val) ? "" : "none";
    });
});

// 🔽 SORT
function sortTable() {
    const tbody = document.querySelector("#ipTable tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
        return b.children[1].innerText - a.children[1].innerText;
    });

    tbody.innerHTML = "";
    rows.forEach(r => tbody.appendChild(r));
}

// 🚨 TOP ATTACKER
function showTopAttacker(data) {
    let maxIP = "";
    let max = 0;

    for (let ip in data.suspiciousIPs) {
        if (data.suspiciousIPs[ip] > max) {
            max = data.suspiciousIPs[ip];
            maxIP = ip;
        }
    }

    if (maxIP) {
        showToast(`🚨 Top attacker: ${maxIP} (${max})`);
    }
}

// 📊 RISK SCORE
function calculateRisk(data) {
    const score = (data.errors * 2) + (data.failedLogins * 3);

    let level = "Low";
    if (score > 20) level = "High";
    else if (score > 10) level = "Medium";

    showToast(`⚠️ Risk: ${level}`);
}

// 📈 TREND
function compareTrend(data) {
    const history = JSON.parse(localStorage.getItem("history")) || [];

    if (history.length === 0) return;

    const last = history[history.length - 1];

    if (data.totalLogs > last.logs) showToast("📈 Increased");
    else showToast("📉 Decreased");
}

// 🧾 MODAL
function showIPDetails(ip, count) {
    document.getElementById("modalText").innerText =
        `IP: ${ip} | Attempts: ${count}`;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

// ⬇️ JSON
function downloadResults() {
    if (!window.lastData) return;

    const blob = new Blob([JSON.stringify(window.lastData, null, 2)]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "result.json";
    a.click();
}

// 📁 CSV
function exportCSV() {
    if (!window.lastData) return;

    let csv = "IP,Attempts\n";

    for (let ip in window.lastData.suspiciousIPs) {
        csv += `${ip},${window.lastData.suspiciousIPs[ip]}\n`;
    }

    const blob = new Blob([csv]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "logs.csv";
    a.click();
}

// 🌙 DARK MODE
document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

// 🔁 AUTO REFRESH
document.getElementById("autoRefresh").addEventListener("change", function () {
    if (this.checked) {
        autoInterval = setInterval(uploadFile, 10000);
    } else {
        clearInterval(autoInterval);
    }
});

// 🔔 TOAST
function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.remove("hidden");

    setTimeout(() => t.classList.add("hidden"), 3000);
}

// 🔄 LOADER
function toggleLoader(show) {
    loader.classList.toggle("hidden", !show);
}

// 📢 STATUS
function updateStatus(msg, type) {
    status.innerText = msg;
    status.className = "status " + type;
}

// 🕒 HISTORY
function saveHistory(data) {
    let h = JSON.parse(localStorage.getItem("history")) || [];

    h.push({
        time: new Date().toLocaleString(),
        logs: data.totalLogs
    });

    localStorage.setItem("history", JSON.stringify(h));
    loadHistory();
}

function loadHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";

    const h = JSON.parse(localStorage.getItem("history")) || [];

    h.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item.time} → Logs: ${item.logs}`;
        list.appendChild(li);
    });
}

window.onload = loadHistory;