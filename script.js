// Variabel global untuk menyimpan format BEP (default: unit)
let isBepRupiah = false;

// Fungsi toggle format BEP (unit <-> rupiah)
function toggleFormatBep() {
    isBepRupiah = !isBepRupiah;
    hitungAnalisis();
}

// Fungsi untuk memvalidasi angka
function isValidInput(value) {
    return !isNaN(value) && value >= 0;
}

function hitungAnalisis() {
    let investment = getValue("investment"); // Biaya investasi awal
    let operational = getValue("operational"); // Biaya operasional bulanan
    let cost = getValue("biayaProduksi"); // Biaya produksi per unit
    let volume = getValue("volume"); // Volume produksi / penjualan
    let markup = parseFloat(document.getElementById("markup").value); // Markup % dari HPP

    // Validasi input
    if (![investment, operational, cost, volume, markup].every(isValidInput)) {
        alert("Harap masukkan angka yang valid! Nilai tidak boleh negatif.");
        return;
    }

    if (volume <= 0) {
        alert("Harap masukkan volume penjualan yang valid dan lebih besar dari 0.");
        return;
    }

    if (cost > 0 && volume === 0) {
        alert("Jika menggunakan biaya produksi, volume tidak boleh 0!");
        return;
    }

    // **Perhitungan HPP**
    let hpp = cost + (operational / Math.max(volume, 1));
    let metode = "Menggunakan perhitungan berdasarkan biaya produksi dan operasional per unit.";

    // **Perhitungan Harga Jual**
    let hargaJual = hpp * (1 + (markup / 100));

    if (hargaJual <= hpp) {
        alert("Harga jual harus lebih tinggi dari HPP untuk menghitung BEP!");
        return;
    }

    // **Perhitungan Profit**
    let profit = volume * (hargaJual - hpp);
    let roi = "Tidak valid", pp = "Tidak valid";

    if (investment > 0 && profit > 0) {
        roi = (profit / investment * 100).toFixed(2) + "%";
    }

    // **Perhitungan Payback Period (PP)**
    if (investment > 0 && profit > 0) {
        let totalHari = Math.round((investment / profit) * 30);
        let ppTahun = Math.floor(totalHari / 365);
        totalHari %= 365;
        let ppBulan = Math.floor(totalHari / 30);
        totalHari %= 30;
        let ppMinggu = Math.floor(totalHari / 7);
        let ppHari = totalHari % 7;

        pp = `${ppTahun} tahun ${ppBulan} bulan ${ppMinggu} minggu ${ppHari} hari`;
    }

    // **Perhitungan BEP**
    let bepUnit = "Tidak valid", bepRupiah = "Tidak valid";

    if (hargaJual > hpp && investment > 0) {
        bepUnit = (investment / (hargaJual - hpp)).toFixed(2);
        bepRupiah = formatRupiah(investment / (hargaJual - hpp) * hargaJual);
    } else if (investment <= 0 && operational > 0) {
        bepUnit = (operational / (hargaJual - hpp)).toFixed(2);
        bepRupiah = formatRupiah(operational / (hargaJual - hpp) * hargaJual);
    }

    // **Perhitungan Revenue & Profit Margin**
    let revenue = hargaJual * volume;
    let profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) + "%" : "Tidak valid";

    // **Tampilkan hasil perhitungan**
    setText("hargaJual", formatRupiah(hargaJual));
    setText("revenue", formatRupiah(revenue));
    setText("profit", formatRupiah(profit));
    setText("bep", isBepRupiah ? bepRupiah : `${bepUnit} unit`);
    setText("hpp", formatRupiah(hpp));
    setText("roi", roi);
    setText("pp", pp);
    setText("profit-margin", profitMargin);
    setText("metode", metode);
}

// Fungsi untuk format Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(number);
}

// Fungsi mendapatkan nilai input dengan ID tertentu
function getValue(id) {
    let el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
}

// Fungsi mengubah teks dalam elemen dengan ID tertentu
function setText(id, text) {
    let el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Fungsi untuk update perhitungan berdasarkan data tabel
function updateCalculations() {
    let totalUnit = getValue("totalUnit");
    let biayaProduksi = getValue("biayaProduksi");
    let hppValue = totalUnit > 0 ? biayaProduksi / totalUnit : 0;

    setText("hpp", totalUnit > 0 ? formatRupiah(hppValue) : "Tidak valid");
    setText("bep", hppValue > 0 ? (getValue("investment") / hppValue).toFixed(2) : "Tidak valid");
}

// Fungsi untuk tabel (tambah/hapus/update total)
function addRow(tableId) {
    let table = document.querySelector(`#${tableId} tbody`);
    let row = table.insertRow();
    row.innerHTML = `
        <td><input type="text"></td>
        <td><input type="number" oninput="updateTotalCost('${tableId}')"></td>
        <td><input type="number" oninput="updateTotalCost('${tableId}')"></td>
        <td><button class="btn-hapus" onclick="deleteRow(this, '${tableId}')">Hapus</button></td>
    `;
}

function deleteRow(button, tableId) {
    button.parentElement.parentElement.remove();
    updateTotalCost(tableId);
}

function updateTotalCost(tableId) {
    let total = 0;
    document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
        let qty = row.cells[1].querySelector("input").value || 0;
        let price = row.cells[2].querySelector("input").value || 0;
        total += (parseFloat(qty) * parseFloat(price));
    });
    document.getElementById(tableId === "investmentTable" ? "investment" : "operational").value = total;
}

// Fungsi untuk membuka/menutup tabel pop-up
function openTablePopup(type) {
    let popup = document.getElementById(type === 'investment' ? "investmentPopup" : "operationalPopup");
    if (popup) {
        popup.style.display = "block";
        document.body.style.overflow = "hidden";
    }
}

function closeTablePopup(type) {
    let popup = document.getElementById(type);
    if (popup) {
        popup.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// Menutup pop-up jika klik di luar kontennya (termasuk popup info)
document.querySelectorAll(".popup, #popupInfo, #investmentPopup, #operationalPopup").forEach(popup => {
    popup.addEventListener("click", function(event) {
        if (event.target === this) {
            this.style.display = "none"; // Menyembunyikan popup
            document.body.style.overflow = "auto";
        }
    });
});

// Menutup pop-up jika tombol 'Esc' ditekan
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".popup, #popupInfo, #investmentPopup, #operationalPopup").forEach(popup => {
            popup.style.display = "none"; // Menyembunyikan popup
            popup.classList.add("hidden"); // Ensure the hidden class is added
        });
        document.body.style.overflow = "auto";
    }
});

// Event listener untuk tombol "info"
document.querySelectorAll(".info-btn").forEach(button => {
    button.addEventListener("click", function () {
        let infoText = this.getAttribute("data-info");
        showPopupInfo(infoText);
    });
});

// Fungsi untuk menampilkan pop-up info
function showPopupInfo(text) {
    let popup = document.getElementById("popupInfo");
    let popupText = document.getElementById("popupText");
    popupText.innerHTML = text;
    popup.classList.remove("hidden");
    popup.style.display = "flex"; // Ensure the popup is displayed
}

// Event listener untuk menutup pop-up
document.getElementById("closePopup").addEventListener("click", function () {
    let popup = document.getElementById("popupInfo");
    popup.classList.add("hidden");
    popup.style.display = "none"; // Ensure the popup is hidden
});

function exportToXlsx() {
    // Create a new workbook and worksheet
    let wb = XLSX.utils.book_new();
    let ws_data = [
        ["Parameter", "Value"],
        ["Investment Cost", getValue("investment")],
        ["Operational Cost per Bulan", getValue("operational")],
        ["Biaya Produksi per Unit", getValue("biayaProduksi")],
        ["Volume Penjualan per Bulan", getValue("volume")],
        ["Markup (%)", getValue("markup")],
        ["Harga Pokok Produksi (HPP) per unit", getText("hpp")],
        ["Harga Jual per Unit", getText("hargaJual")],
        ["Revenue (Pendapatan)", getText("revenue")],
        ["Profit (Laba Bersih)", getText("profit")],
        ["ROI (Return on Investment)", getText("roi")],
        ["BEP (Break Even Point)", getText("bep")],
        ["Payback Period", getText("pp")],
        ["Profit Margin", getText("profit-margin")]
    ];

    let ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Analisis");

    // Export the workbook to XLSX file
    XLSX.writeFile(wb, "Hasil_Analisis.xlsx");
}

function importFromXlsx(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assuming the first sheet contains the data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse the worksheet data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Update the form fields with the imported data
        if (jsonData.length > 1) {
            setInputValue("investment", jsonData[1][1]);
            setInputValue("operational", jsonData[2][1]);
            setInputValue("biayaProduksi", jsonData[3][1]);
            setInputValue("volume", jsonData[4][1]);
            setInputValue("markup", jsonData[5][1]);
            setText("hpp", jsonData[6][1]);
            setText("hargaJual", jsonData[7][1]);
            setText("revenue", jsonData[8][1]);
            setText("profit", jsonData[9][1]);
            setText("roi", jsonData[10][1]);
            setText("bep", jsonData[11][1]);
            setText("pp", jsonData[12][1]);
            setText("profit-margin", jsonData[13][1]);
        }
    };

    reader.readAsArrayBuffer(file);
}

// Helper function to get the text content of an element by its ID
function getText(id) {
    let el = document.getElementById(id);
    return el ? el.textContent : "";
}

// Helper function to get the value of an input field by its ID
function getValue(id) {
    let el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
}

// Helper function to set the value of an input field by its ID
function setInputValue(id, value) {
    let el = document.getElementById(id);
    if (el) {
        el.value = value;
    }
}

// Helper function to set the text content of an element by its ID
function setText(id, text) {
    let el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    }
}
