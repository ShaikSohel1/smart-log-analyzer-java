// Smart Log Analyzer - Dashboard Script

let barChartInstance = null;
let doughnutChartInstance = null;
let currentAnalysisData = null;

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initDragAndDrop();
    fetchRecentHistory();

    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", handleFileSelect);
    }
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    const themeToggleBtn = document.getElementById("themeToggle");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateThemeIcon(newTheme);
            if (currentAnalysisData) {
                renderCharts(currentAnalysisData);
            }
        });
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
        themeIcon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
}

// Drag & Drop File Upload
function initDragAndDrop() {
    const dropZone = document.getElementById("dropZone");
    if (!dropZone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            const fileInput = document.getElementById("fileInput");
            fileInput.files = files;
            handleFileSelect();
        }
    });
}

function handleFileSelect() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    document.getElementById("fileNameDisplay").innerText = file.name;
    document.getElementById("fileSizeDisplay").innerText = `(${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById("filePreview").classList.remove("hidden");

    uploadAndAnalyzeFile(file);
}

function clearFileSelection() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
    document.getElementById("filePreview").classList.add("hidden");
}

// Upload & Analyze File
async function uploadAndAnalyzeFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    showProgress(30);
    showToast("Analyzing log file...", "info");

    try {
        const response = await fetch("/api/logs/analyze", {
            method: "POST",
            body: formData
        });

        showProgress(80);
        const result = await response.json();

        if (response.ok && result.success) {
            showProgress(100);
            showToast("Log analysis completed successfully!", "success");
            currentAnalysisData = result.data;
            updateDashboard(result.data);
            fetchRecentHistory();
        } else {
            showProgress(0);
            const errorMsg = result.message || "Failed to analyze log file.";
            showToast(errorMsg, "error");
        }
    } catch (error) {
        showProgress(0);
        console.error("Upload error:", error);
        showToast("Error connecting to server. Please try again.", "error");
    } finally {
        setTimeout(() => hideProgress(), 800);
    }
}

// Run Built-in Sample Log
async function analyzeSampleLog() {
    showProgress(40);
    showToast("Analyzing built-in sample log...", "info");

    try {
        const response = await fetch("/api/logs/sample");
        showProgress(80);
        const result = await response.json();

        if (response.ok && result.success) {
            showProgress(100);
            showToast("Sample log analyzed successfully!", "success");
            currentAnalysisData = result.data;
            updateDashboard(result.data);
            fetchRecentHistory();
        } else {
            showProgress(0);
            showToast(result.message || "Failed to analyze sample log.", "error");
        }
    } catch (error) {
        showProgress(0);
        console.error("Sample log error:", error);
        showToast("Failed to run sample log analysis.", "error");
    } finally {
        setTimeout(() => hideProgress(), 800);
    }
}

// Update Dashboard View
function updateDashboard(data) {
    const totalLogs = data.totalLogs || 0;
    const errors = data.errorCount !== undefined ? data.errorCount : (data.errors || 0);
    const failedLogins = data.failedLogins || 0;
    const suspiciousCount = data.suspiciousIpCount !== undefined ? data.suspiciousIpCount : 
                           (data.suspiciousIPs ? Object.keys(data.suspiciousIPs).length : 0);

    animateCounter("totalLogs", totalLogs);
    animateCounter("errorCount", errors);
    animateCounter("failedLogins", failedLogins);
    animateCounter("suspiciousIpCount", suspiciousCount);

    updateOverallStatusBadge(data.overallStatus || "NORMAL");

    renderIpTable(data);
    renderCharts(data);
}

// Animate Counters
function animateCounter(id, targetValue) {
    const el = document.getElementById(id);
    if (!el) return;

    let start = 0;
    const duration = 600;
    const stepTime = Math.abs(Math.floor(duration / (targetValue || 1)));

    const timer = setInterval(() => {
        start += Math.ceil((targetValue - start) / 5);
        if (start >= targetValue) {
            el.innerText = targetValue;
            clearInterval(timer);
        } else {
            el.innerText = start;
        }
    }, Math.max(stepTime, 20));
}

// Status Health Badge Update
function updateOverallStatusBadge(status) {
    const badgeText = document.getElementById("overallStatusText");
    const badge = document.getElementById("overallStatusBadge");
    if (!badgeText || !badge) return;

    badgeText.innerText = status;
    badge.className = "status-indicator";

    if (status === "CRITICAL_ALERT") {
        badge.innerHTML = `<span class="dot pulse" style="background-color: var(--accent-red)"></span> <span>CRITICAL ALERT</span>`;
    } else if (status === "ELEVATED_RISK") {
        badge.innerHTML = `<span class="dot pulse" style="background-color: var(--accent-amber)"></span> <span>ELEVATED RISK</span>`;
    } else {
        badge.innerHTML = `<span class="dot pulse" style="background-color: var(--accent-green)"></span> <span>NORMAL</span>`;
    }
}

// Render IP Table
function renderIpTable(data) {
    const body = document.getElementById("ipTableBody");
    if (!body) return;

    body.innerHTML = "";

    let activities = data.ipActivities;
    if (!activities && data.suspiciousIPs) {
        activities = [];
        for (const ip in data.suspiciousIPs) {
            const count = data.suspiciousIPs[ip];
            let risk = "LOW";
            if (count > 15) risk = "CRITICAL";
            else if (count > 10) risk = "HIGH";
            else if (count > 5) risk = "MEDIUM";
            activities.push({
                ipAddress: ip,
                attemptCount: count,
                riskLevel: risk,
                recommendation: count > 10 ? "Block IP immediately" : "Enforce rate limiting"
            });
        }
    }

    if (!activities || activities.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="4" class="empty-table-msg">
                    <i class="fa-solid fa-circle-check" style="color: var(--accent-green)"></i> No suspicious IP activity detected above threshold (>5 failed logins).
                </td>
            </tr>`;
        return;
    }

    activities.forEach(item => {
        let badgeClass = "badge-low";
        if (item.riskLevel === "CRITICAL") badgeClass = "badge-critical";
        else if (item.riskLevel === "HIGH") badgeClass = "badge-high";
        else if (item.riskLevel === "MEDIUM") badgeClass = "badge-medium";

        body.innerHTML += `
            <tr>
                <td><code>${item.ipAddress}</code></td>
                <td><strong>${item.attemptCount}</strong></td>
                <td><span class="badge-risk ${badgeClass}">${item.riskLevel}</span></td>
                <td>${item.recommendation || 'Flag for security review.'}</td>
            </tr>
        `;
    });
}

// Filter IP Table
function filterIpTable() {
    const input = document.getElementById("ipSearchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#ipTableBody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}

// Chart.js Rendering
function renderCharts(data) {
    const totalLogs = data.totalLogs || 0;
    const errors = data.errorCount !== undefined ? data.errorCount : (data.errors || 0);
    const failedLogins = data.failedLogins || 0;
    const normalLogs = Math.max(0, totalLogs - errors - failedLogins);

    // Bar Chart
    const barCtx = document.getElementById("barChart");
    if (barCtx) {
        if (barChartInstance) barChartInstance.destroy();

        barChartInstance = new Chart(barCtx, {
            type: "bar",
            data: {
                labels: ["Total Logs", "Errors", "Failed Logins"],
                datasets: [{
                    label: "Count",
                    data: [totalLogs, errors, failedLogins],
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.7)",
                        "rgba(239, 68, 68, 0.7)",
                        "rgba(245, 158, 11, 0.7)"
                    ],
                    borderColor: [
                        "#3b82f6",
                        "#ef4444",
                        "#f59e0b"
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(255, 255, 255, 0.05)" } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Doughnut Chart
    const doughnutCtx = document.getElementById("doughnutChart");
    if (doughnutCtx) {
        if (doughnutChartInstance) doughnutChartInstance.destroy();

        doughnutChartInstance = new Chart(doughnutCtx, {
            type: "doughnut",
            data: {
                labels: ["Normal Logs", "System Errors", "Failed Auth Attempts"],
                datasets: [{
                    data: [normalLogs, errors, failedLogins],
                    backgroundColor: [
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(239, 68, 68, 0.8)",
                        "rgba(245, 158, 11, 0.8)"
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') } }
                }
            }
        });
    }
}

// Fetch History
async function fetchRecentHistory() {
    try {
        const response = await fetch("/api/logs/history");
        const result = await response.json();

        if (response.ok && result.success) {
            renderHistoryTable(result.data);
        }
    } catch (e) {
        console.error("Failed to fetch analysis history", e);
    }
}

function renderHistoryTable(historyList) {
    const body = document.getElementById("historyTableBody");
    if (!body) return;

    body.innerHTML = "";
    if (!historyList || historyList.length === 0) {
        body.innerHTML = `<tr><td colspan="8" class="empty-table-msg">No recent history found.</td></tr>`;
        return;
    }

    historyList.forEach(item => {
        const date = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A';
        body.innerHTML += `
            <tr>
                <td>#${item.id}</td>
                <td><code>${item.fileName}</code></td>
                <td>${item.totalLogs}</td>
                <td><span style="color:var(--accent-red)">${item.errorCount}</span></td>
                <td><span style="color:var(--accent-amber)">${item.failedLogins}</span></td>
                <td>${item.suspiciousIpCount}</td>
                <td><span class="badge-risk ${item.overallStatus === 'NORMAL' ? 'badge-low' : 'badge-high'}">${item.overallStatus}</span></td>
                <td>${date}</td>
            </tr>
        `;
    });
}

// Toast Notifications
function showToast(message, type = "info") {
    const toast = document.getElementById("statusToast");
    const toastText = document.getElementById("statusText");
    const toastIcon = document.getElementById("toastIcon");

    if (!toast || !toastText) return;

    toastText.innerText = message;
    toast.classList.remove("hidden");

    if (type === "error") {
        toast.style.borderColor = "var(--accent-red)";
        toastIcon.className = "fa-solid fa-triangle-exclamation";
        toastIcon.style.color = "var(--accent-red)";
    } else if (type === "success") {
        toast.style.borderColor = "var(--accent-green)";
        toastIcon.className = "fa-solid fa-circle-check";
        toastIcon.style.color = "var(--accent-green)";
    } else {
        toast.style.borderColor = "var(--accent-blue)";
        toastIcon.className = "fa-solid fa-circle-info";
        toastIcon.style.color = "var(--accent-blue)";
    }
}

// Progress Bar Helpers
function showProgress(percentage) {
    const container = document.getElementById("progressContainer");
    const bar = document.getElementById("progressBar");
    if (container && bar) {
        container.classList.remove("hidden");
        bar.style.width = `${percentage}%`;
    }
}

function hideProgress() {
    const container = document.getElementById("progressContainer");
    const bar = document.getElementById("progressBar");
    if (container && bar) {
        bar.style.width = `0%`;
        container.classList.add("hidden");
    }
}

// Export JSON Report
function exportReportJson() {
    if (!currentAnalysisData) {
        showToast("No analysis data available to export.", "error");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnalysisData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `log_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}