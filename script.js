function hitungAnalisis() {
    let investment = parseFloat(document.getElementById("investment").value) || 0;
    let operational = parseFloat(document.getElementById("operational").value) || 0;
    let price = parseFloat(document.getElementById("price").value) || 0;
    let cost = parseFloat(document.getElementById("cost").value) || 0;
    let volume = parseFloat(document.getElementById("volume").value) || 0;

    let profit = (price - cost) * volume - operational;
    let roi = ((profit / investment) * 100).toFixed(2) + "%";
    let bep = (investment / (price - cost)).toFixed(2);
    let hpp = ((operational + cost * volume) / volume).toFixed(2);

    document.getElementById("roi").textContent = roi;
    document.getElementById("bep").textContent = bep + " unit";
    document.getElementById("hpp").textContent = "Rp " + hpp;
}

document.querySelectorAll(".info-btn").forEach(button => {
    button.addEventListener("click", function () {
        document.getElementById("popup-text").textContent = this.getAttribute("data-info");
        document.getElementById("popup").style.display = "flex";
    });
});

document.getElementById("popup").addEventListener("click", function (e) {
    if (e.target === this) {
        this.style.display = "none";
    }
});

document.getElementById("close-popup").addEventListener("click", function () {
    document.getElementById("popup").style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("popupInfo");
    const closePopup = document.getElementById("closePopup");

    closePopup.addEventListener("click", function () {
        popup.classList.add("hidden");
    });

    // Klik luar pop-up juga menutupnya
    popup.addEventListener("click", function (event) {
        if (event.target === popup) {
            popup.classList.add("hidden");
        }
    });
});

let currentTable = "";

function openTablePopup(tableType) {
    currentTable = tableType;
    document.getElementById("tablePopup").style.display = "block";
    document.getElementById("popupTitle").innerText = (tableType === 'investmentTable') ? "Investment Cost" : "Operational Cost";
}

function closeTablePopup() {
    document.getElementById("tablePopup").style.display = "none";
    updateTotalCost();
}

function addRow() {
    let table = document.querySelector("#costTable tbody");
    let row = table.insertRow();
    row.innerHTML = `
        <td><input type="text"></td>
        <td><input type="number" oninput="updateTotalCost()"></td>
        <td><input type="number" oninput="updateTotalCost()"></td>
        <td><button onclick="deleteRow(this)">Hapus</button></td>
    `;
}

function deleteRow(button) {
    button.parentElement.parentElement.remove();
    updateTotalCost();
}

function updateTotalCost() {
    let total = 0;
    document.querySelectorAll("#costTable tbody tr").forEach(row => {
        let qty = row.cells[1].querySelector("input").value || 0;
        let price = row.cells[2].querySelector("input").value || 0;
        total += (parseFloat(qty) * parseFloat(price));
    });

    if (currentTable === 'investmentTable') {
        document.getElementById("investmentTotal").value = total;
    } else {
        document.getElementById("operationalTotal").value = total;
    }
}

function updateCalculations() {
    let totalUnit = document.getElementById("totalUnit").value || 1;
    let biayaProduksi = document.getElementById("biayaProduksi").value || 0;
    
    let hpp = biayaProduksi / totalUnit;
    document.getElementById("hpp").innerText = hpp.toFixed(2);

    let investment = parseFloat(document.getElementById("investmentTotal").value) || 0;
    let bep = investment / hpp;
    document.getElementById("bep").innerText = bep.toFixed(2);
}
