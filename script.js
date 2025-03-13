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

    // Validasi input
    if (
        isNaN(investment) || isNaN(operational) || isNaN(cost) || 
        isNaN(volume) || isNaN(markup) || 
        investment < 0 || operational < 0 || cost < 0 || 
        volume < 0 || markup < 0
    ) {
        alert("Harap masukkan angka yang valid! Nilai tidak boleh negatif.");
        return;
    }

    // Jika pendekatan investment cost digunakan tetapi volume kosong
    if (investment > 0 && (isNaN(volume) || volume <= 0)) {
        alert("Harap masukkan volume penjualan untuk menghitung analisis dengan investment cost.");
        return;
    }

    // **Validasi volume hanya jika pakai pendekatan biaya produksi**
    if (cost > 0 && volume === 0) {
        alert("Jika menggunakan biaya produksi, volume tidak boleh 0!");
        return;
    }

    // **Perbaikan HPP**
    let hpp, metode;
    if (cost > 0) {
        hpp = (cost * volume + operational) / (volume > 0 ? volume : 1); 
        metode = "Menggunakan perhitungan berdasarkan biaya produksi per unit & volume.";
    } else if (investment > 0 && volume > 0) {
        hpp = (investment + operational) / volume;
        metode = "Menggunakan perhitungan berdasarkan investment cost.";
    } else {
        alert("Harap isi biaya produksi atau investment cost!");
        return;
    }

    // Hitung Harga Jual berdasarkan markup
    let hargaJual = hpp * (1 + (markup / 100));

    // Pastikan Harga Jual tidak lebih kecil dari HPP
    if (hargaJual <= hpp) {
        alert("Harga jual harus lebih tinggi dari HPP untuk menghitung BEP!");
        return;
    }
    
    // **Perbaikan Profit**
    let profit = volume > 0 ? (hargaJual - hpp) * volume : 0;
    let roi, pp;
    if (profit <= 0) {
        roi = "Tidak valid";
        pp = "Tidak valid";
    } else {
        roi = (investment > 0) ? (profit / investment * 100).toFixed(2) + "%" : "Tidak valid";
        pp = (investment > 0) ? (investment / profit).toFixed(2) + " bulan" : "Tidak valid";
    }

    // **Perbaikan Payback Period**
    if (!isNaN(pp) && pp > 12) {
        let tahun = (pp / 12).toFixed(2);
        pp = `${tahun} tahun`;
    }

    // **Perbaikan BEP**
    let bepUnit, bepRupiah;
    if (hargaJual > hpp && investment > 0) {
        bepUnit = (investment / (hargaJual - hpp)).toFixed(2);
        bepRupiah = formatRupiah(investment / (hargaJual - hpp) * hargaJual);
    } else {
        bepUnit = "Tidak valid";
        bepRupiah = "Tidak valid";
    }

    // Hitung Revenue & Profit Margin
    let revenue = volume > 0 ? hargaJual * volume : "Tidak tersedia"; 
    let profitMargin = volume > 0 && revenue > 0 ? ((profit / revenue) * 100).toFixed(2) + "%" : "Tidak valid";

    // Tampilkan hasil perhitungan
    setText("hargaJual", formatRupiah(hargaJual));
    setText("revenue", revenue !== "Tidak tersedia" ? formatRupiah(revenue) : revenue);
    setText("profit", profit !== "Tidak tersedia" ? formatRupiah(profit) : profit);
    setText("bep", volume > 0 ? `${bepUnit} unit` : "Tidak tersedia");
    setText("hpp", formatRupiah(hpp));
    setText("roi", roi);
    setText("pp", pp);
    setText("profit-margin", profitMargin);
    setText("metode", metode); // Tampilkan metode yang digunakan
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
        ["Investment Cost", getValue("investment")],
        ["Operational Cost per Bulan", getValue("operational")],
        ["Biaya Produksi per Unit", getValue("biayaProduksi")],
        ["Volume Penjualan per Bulan", getValue("volume")],
        ["Markup (%)", getValue("markup")],
        ["Harga Pokok Produksi (HPP) per unit", ""],
        ["Harga Jual per Unit", ""],
        ["Revenue (Pendapatan)", ""],
        ["Profit (Laba Bersih)", ""],
        ["ROI (Return on Investment)", ""],
        ["BEP (Break Even Point)", ""],
        ["Payback Period", ""],
        ["Profit Margin", ""]
    ];

    let ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Add formulas to the worksheet
    ws['B7'].f = `(B3 + B4) / B5`; // HPP per unit
    ws['B8'].f = `B7 * (1 + B6 / 100)`; // Harga Jual per Unit
    ws['B9'].f = `B8 * B5`; // Revenue
    ws['B10'].f = `(B8 - B7) * B5`; // Profit
    ws['B11'].f = `B10 / B2 * 100`; // ROI
    ws['B12'].f = `B2 / (B8 - B7)`; // BEP
    ws['B13'].f = `B2 / B10`; // Payback Period
    ws['B14'].f = `B10 / B9 * 100`; // Profit Margin

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
