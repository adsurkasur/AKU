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
