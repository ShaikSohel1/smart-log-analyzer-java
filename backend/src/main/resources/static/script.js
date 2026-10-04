// Smart Log Analyzer - Enterprise Dashboard Script

let barChartInstance = null;
let doughnutChartInstance = null;
let currentAnalysisData = null;

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initDragAndDrop();
    initYear();
    initEventListeners();
    fetchRecentHistory();
});

// Populate Year safely in Footer
function initYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear().toString();
    }
}

// Bind explicit event listeners to DOM elements
function initEventListeners() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", handleFileSelect);
    }

    const btnRunSample = document.getElementById("btnRunSample");
    if (btnRunSample) {
        btnRunSample.addEventListener("click", analyzeSampleLog);
    }

    const btnClearFile = document.getElementById("btnClearFile");
    if (btnClearFile) {
        btnClearFile.addEventListener("click", clearFileSelection);
    }

    const btnExportJson = document.getElementById("btnExportJson");
    if (btnExportJson) {
        btnExportJson.addEventListener("click", exportReportJson);
    }

    const btnRefreshHistory = document.getElementById("btnRefreshHistory");
    if (btnRefreshHistory) {
        btnRefreshHistory.addEventListener("click", fetchRecentHistory);
    }

    const ipSearchInput = document.getElementById("ipSearchInput");
    if (ipSearchInput) {
        ipSearchInput.addEventListener("input", filterIpTable);
        ipSearchInput.addEventListener("keyup", filterIpTable);
    }
}

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
        if (!dt || !dt.files || dt.files.length === 0) return;
        const file = dt.files[0];
        
        const fileInput = document.getElementById("fileInput");
        if (fileInput && typeof DataTransfer !== "undefined") {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
        }

        const fileNameDisplay = document.getElementById("fileNameDisplay");
        const fileSizeDisplay = document.getElementById("fileSizeDisplay");
        const filePreview = document.getElementById("filePreview");

        if (fileNameDisplay) fileNameDisplay.innerText = file.name;
        if (fileSizeDisplay) fileSizeDisplay.innerText = `(${(file.size / 1024).toFixed(1)} KB)`;
        if (filePreview) filePreview.classList.remove("hidden");

        uploadAndAnalyzeFile(file);
    });
}

function handleFileSelect() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    const fileSizeDisplay = document.getElementById("fileSizeDisplay");
    const filePreview = document.getElementById("filePreview");

    if (fileNameDisplay) fileNameDisplay.innerText = file.name;
    if (fileSizeDisplay) fileSizeDisplay.innerText = `(${(file.size / 1024).toFixed(1)} KB)`;
    if (filePreview) filePreview.classList.remove("hidden");

    uploadAndAnalyzeFile(file);
}

function clearFileSelection() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
    const filePreview = document.getElementById("filePreview");
    if (filePreview) filePreview.classList.add("hidden");
}

// Upload & Analyze File
async function uploadAndAnalyzeFile(file) {
    if (!file) return;

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
    if (!data) return;

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

// Animate Counters safely
function animateCounter(id, targetValue) {
    const el = document.getElementById(id);
    if (!el) return;

    targetValue = Math.max(0, parseInt(targetValue, 10) || 0);
    if (targetValue === 0) {
        el.innerText = "0";
        return;
    }

    let start = 0;
    const duration = 500;
    const stepTime = Math.max(20, Math.floor(duration / targetValue));

    const timer = setInterval(() => {
        const diff = targetValue - start;
        const step = Math.max(1, Math.ceil(diff / 4));
        start += step;
        if (start >= targetValue) {
            el.innerText = targetValue.toString();
            clearInterval(timer);
        } else {
            el.innerText = start.toString();
        }
    }, stepTime);
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

// Helper function to sanitize HTML output
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><code>${escapeHtml(item.ipAddress)}</code></td>
            <td><strong>${item.attemptCount}</strong></td>
            <td><span class="badge-risk ${badgeClass}">${escapeHtml(item.riskLevel)}</span></td>
            <td>${escapeHtml(item.recommendation || 'Flag for security review.')}</td>
        `;
        body.appendChild(row);
    });
}

// Filter IP Table
function filterIpTable() {
    const inputEl = document.getElementById("ipSearchInput");
    if (!inputEl) return;
    const input = inputEl.value.toLowerCase();
    const rows = document.querySelectorAll("#ipTableBody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}

// Chart.js Rendering
function renderCharts(data) {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js library is not loaded.");
        return;
    }

    const totalLogs = data.totalLogs || 0;
    const errors = data.errorCount !== undefined ? data.errorCount : (data.errors || 0);
    const failedLogins = data.failedLogins || 0;
    const normalLogs = Math.max(0, totalLogs - errors - failedLogins);

    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

    // Bar Chart
    const barCtx = document.getElementById("barChart");
    if (barCtx) {
        if (barChartInstance) barChartInstance.destroy();

        const ctx = barCtx.getContext("2d");
        const blueGradient = ctx.createLinearGradient(0, 0, 0, 260);
        blueGradient.addColorStop(0, "rgba(59, 130, 246, 0.85)");
        blueGradient.addColorStop(1, "rgba(59, 130, 246, 0.15)");

        const redGradient = ctx.createLinearGradient(0, 0, 0, 260);
        redGradient.addColorStop(0, "rgba(239, 68, 68, 0.85)");
        redGradient.addColorStop(1, "rgba(239, 68, 68, 0.15)");

        const amberGradient = ctx.createLinearGradient(0, 0, 0, 260);
        amberGradient.addColorStop(0, "rgba(245, 158, 11, 0.85)");
        amberGradient.addColorStop(1, "rgba(245, 158, 11, 0.15)");

        barChartInstance = new Chart(barCtx, {
            type: "bar",
            data: {
                labels: ["Total Logs", "Errors", "Failed Logins"],
                datasets: [{
                    label: "Count",
                    data: [totalLogs, errors, failedLogins],
                    backgroundColor: [blueGradient, redGradient, amberGradient],
                    borderColor: ["#3b82f6", "#ef4444", "#f59e0b"],
                    borderWidth: 1.5,
                    borderRadius: 8,
                    barThickness: 45
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } },
                        grid: { display: false }
                    }
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
                        "rgba(16, 185, 129, 0.85)",
                        "rgba(239, 68, 68, 0.85)",
                        "rgba(245, 158, 11, 0.85)"
                    ],
                    borderColor: isDark ? "#111827" : "#ffffff",
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' },
                            padding: 18,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
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
        let statusBadgeClass = "badge-low";
        if (item.overallStatus === "CRITICAL_ALERT") statusBadgeClass = "badge-critical";
        else if (item.overallStatus === "ELEVATED_RISK") statusBadgeClass = "badge-high";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${item.id}</td>
            <td><code>${escapeHtml(item.fileName)}</code></td>
            <td>${item.totalLogs}</td>
            <td><span style="color:var(--accent-red)">${item.errorCount}</span></td>
            <td><span style="color:var(--accent-amber)">${item.failedLogins}</span></td>
            <td>${item.suspiciousIpCount}</td>
            <td><span class="badge-risk ${statusBadgeClass}">${escapeHtml(item.overallStatus)}</span></td>
            <td>${escapeHtml(date)}</td>
        `;
        body.appendChild(row);
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
        if (toastIcon) {
            toastIcon.className = "fa-solid fa-triangle-exclamation";
            toastIcon.style.color = "var(--accent-red)";
        }
    } else if (type === "success") {
        toast.style.borderColor = "var(--accent-green)";
        if (toastIcon) {
            toastIcon.className = "fa-solid fa-circle-check";
            toastIcon.style.color = "var(--accent-green)";
        }
    } else {
        toast.style.borderColor = "var(--accent-blue)";
        if (toastIcon) {
            toastIcon.className = "fa-solid fa-circle-info";
            toastIcon.style.color = "var(--accent-blue)";
        }
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

// Explicitly export all interactive functions to global window scope for inline HTML handlers
window.analyzeSampleLog = analyzeSampleLog;
window.clearFileSelection = clearFileSelection;
window.exportReportJson = exportReportJson;
window.fetchRecentHistory = fetchRecentHistory;
window.filterIpTable = filterIpTable;
window.handleFileSelect = handleFileSelect;
window.uploadAndAnalyzeFile = uploadAndAnalyzeFile;