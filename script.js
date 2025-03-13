// Variabel global untuk menyimpan format BEP (default: unit)
let isBepRupiah = false;

// Fungsi toggle format BEP (unit <-> rupiah)
function toggleFormatBep() {
    isBepRupiah = !isBepRupiah;
    hitungAnalisis();
}

// Fungsi utama untuk perhitungan
function hitungAnalisis() {
    let investment = getValue("investment");
    let operational = getValue("operational");
    let cost = getValue("biayaProduksi");
    let volume = getValue("volume");
    let markup = parseFloat(document.getElementById("markup").value);

    // Validasi input: tidak boleh kosong atau negatif
    if (
        isNaN(investment) || isNaN(operational) || isNaN(cost) || 
        isNaN(volume) || isNaN(markup) || 
        investment <= 0 || operational < 0 ||
        cost < 0 || volume <= 0 || markup < 0
    ) {
        alert("Harap masukkan angka yang valid! Nilai tidak boleh negatif atau kosong.");
        return;
    }

    // Hitung Harga Pokok Produksi (HPP)
    let hpp = (cost * volume + operational) / volume;

    // Hitung Harga Jual berdasarkan markup
    let hargaJual = hpp * (1 + (markup / 100));

    // Pastikan Harga Jual tidak lebih kecil dari HPP
    if (hargaJual < hpp) {
        alert("Harga jual lebih kecil dari HPP! Bisnis akan rugi.");
        return;
    }

    // Hitung Profit
    let profit = (hargaJual - hpp) * volume;

    // Hitung Revenue (Pendapatan)
    let revenue = hargaJual * volume; 

    // Hitung Profit Margin
    let profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) + "%" : "Tidak valid";

    // Hitung ROI (Return on Investment)
    let roi = investment > 0 ? (profit / investment * 100).toFixed(2) + "%" : "Tidak valid";

    // Hitung Break Even Point (BEP)
    let bepUnit = hargaJual > hpp ? (investment / (hargaJual - hpp)).toFixed(2) : "Tidak valid";
    let bepRupiah = hargaJual > hpp ? formatRupiah(investment / (hargaJual - hpp) * hargaJual) : "Tidak valid";

    // Hitung Payback Period (PP)
    let pp = profit > 0 ? (investment / profit).toFixed(2) + " bulan" : "Tidak valid";

    // Tampilkan hasil perhitungan
    setText("hargaJual", formatRupiah(hargaJual));
    setText("revenue", formatRupiah(revenue));
    setText("profit", formatRupiah(profit));
    setText("bep", isBepRupiah ? bepRupiah : `${bepUnit} unit`);
    setText("hpp", formatRupiah(hpp));
    setText("roi", roi);
    setText("pp", pp);
    setText("profit-margin", profitMargin);
}

// Fungsi untuk format Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
}

// Fungsi mendapatkan nilai input dengan ID tertentu (dengan pengecekan agar tidak error)
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
        ["Harga Pokok Produksi (HPP) per unit", document.getElementById("hpp").textContent],
        ["Harga Jual per Unit", document.getElementById("hargaJual").textContent],
        ["Revenue (Pendapatan)", document.getElementById("revenue").textContent],
        ["Profit (Laba Bersih)", document.getElementById("profit").textContent],
        ["ROI (Return on Investment)", document.getElementById("roi").textContent],
        ["BEP (Break Even Point)", document.getElementById("bep").textContent],
        ["Payback Period", document.getElementById("pp").textContent],
        ["Profit Margin", document.getElementById("profit-margin").textContent]
    ];

    let ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Add formulas to the worksheet
    ws['B2'].f = `(${getValue("biayaProduksi")} * ${getValue("volume")} + ${getValue("operational")}) / ${getValue("volume")}`;
    ws['B3'].f = `B2 * (1 + ${parseFloat(document.getElementById("markup").value) / 100})`;
    ws['B4'].f = `B3 * ${getValue("volume")}`;
    ws['B5'].f = `(B3 - B2) * ${getValue("volume")}`;
    ws['B6'].f = `B5 / ${getValue("investment")} * 100`;
    ws['B7'].f = `${getValue("investment")} / (B3 - B2)`;
    ws['B8'].f = `${getValue("investment")} / B5`;
    ws['B9'].f = `B5 / B4 * 100`;

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
            setText("hpp", jsonData[1][1]);
            setText("hargaJual", jsonData[2][1]);
            setText("revenue", jsonData[3][1]);
            setText("profit", jsonData[4][1]);
            setText("roi", jsonData[5][1]);
            setText("bep", jsonData[6][1]);
            setText("pp", jsonData[7][1]);
            setText("profit-margin", jsonData[8][1]);
        }
    };

    reader.readAsArrayBuffer(file);
}
