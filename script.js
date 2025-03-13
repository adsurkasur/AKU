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
    let price = getValue("price");
    let cost = getValue("cost");
    let volume = getValue("volume");

    // Validasi input: tidak boleh kosong atau negatif
    if (investment <= 0 || operational < 0 || price <= 0 || cost < 0 || volume < 0) {
        alert("Harap masukkan angka yang valid! Nilai tidak boleh negatif atau kosong.");
        return;
    }

    // Cek jika harga jual lebih kecil dari biaya produksi
    if (price < cost) {
        alert("Harga jual lebih kecil dari biaya produksi! Bisnis akan rugi.");
        return;
    }

    let profit = (price - cost) * volume - operational;
    let revenue = price * volume; // Pendapatan
    let profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) + "%" : "Tidak valid";
    let roi = investment > 0 ? (profit / investment * 100).toFixed(2) + "%" : "Tidak valid";
    let bepUnit = price > cost ? (investment / (price - cost)).toFixed(2) : "Tidak valid";
    let bepRupiah = price > cost ? formatRupiah((investment / (price - cost)) * price) : "Tidak valid";
    let hpp = volume > 0 ? formatRupiah((cost * volume + operational) / volume) : "Tidak valid";
    let pp = profit > 0 ? (investment / profit).toFixed(2) + " bulan" : "Tidak valid";

    setText("profit", formatRupiah(profit));
    setText("bep", isBepRupiah ? bepRupiah : `${bepUnit} unit`);
    setText("hpp", hpp);
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
document.querySelectorAll(".popup, #popupInfo").forEach(popup => {
    popup.addEventListener("click", function(event) {
        if (event.target === this) {
            this.classList.add("hidden"); // Menyembunyikan popup
            document.body.style.overflow = "auto";
        }
    });
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
    popupText.textContent = text;
    popup.classList.remove("hidden");
}

// Event listener untuk menutup pop-up
document.getElementById("closePopup").addEventListener("click", function () {
    document.getElementById("popupInfo").classList.add("hidden");
});
