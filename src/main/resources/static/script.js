const fileInput = document.getElementById("fileInput");

let chart = null;

async function uploadFile(){

    if(fileInput.files.length === 0){
        alert("Please select a log file");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    document.getElementById("status").innerText =
        "Analyzing logs...";

    try{

        const response = await fetch(
            "http://localhost:8080/api/logs/analyze",
            {
                method:"POST",
                body:formData
            }
        );

        const data = await response.json();

        updateDashboard(data);

        document.getElementById("status").innerText =
            "Analysis completed successfully";

    }
    catch(error){

        console.error(error);

        document.getElementById("status").innerText =
            "Analysis failed";

    }
}

function updateDashboard(data){

    document.getElementById("totalLogs").innerText =
        data.totalLogs;

    document.getElementById("errors").innerText =
        data.errors;

    document.getElementById("failedLogins").innerText =
        data.failedLogins;

    document.getElementById("ipCount").innerText =
        Object.keys(data.suspiciousIPs).length;

    loadTable(data.suspiciousIPs);

    loadChart(data);
}

function loadTable(ips){

    const body =
        document.getElementById("ipTableBody");

    body.innerHTML = "";

    for(const ip in ips){

        let risk = "Low";
        let css = "risk-low";

        if(ips[ip] > 10){
            risk = "High";
            css = "risk-high";
        }
        else if(ips[ip] > 5){
            risk = "Medium";
            css = "risk-medium";
        }

        body.innerHTML += `
            <tr>
                <td>${ip}</td>
                <td>${ips[ip]}</td>
                <td class="${css}">${risk}</td>
            </tr>
        `;
    }
}

function loadChart(data){

    const ctx =
        document.getElementById("logChart");

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx,{
        type:"bar",
        data:{
            labels:[
                "Total Logs",
                "Errors",
                "Failed Logins"
            ],
            datasets:[{
                label:"Count",
                data:[
                    data.totalLogs,
                    data.errors,
                    data.failedLogins
                ]
            }]
        }
    });
}