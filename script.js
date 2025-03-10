window.onload = function() {
    document.getElementById("prevMeter").disabled = true;

    let today = new Date();
    let formattedToday = formatDate(today);
    document.getElementById("billDate").value = today.toISOString().split('T')[0];
    document.getElementById("formattedDate").innerText = formattedToday;
};

function formatDate(date) {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    
    let day = date.getDate();
    let month = months[date.getMonth()];
    let year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
}

function loadPrevMeter() {
    let houseNumber = document.getElementById("houseNumber").value;

    if (houseNumber.trim() === "") {
        alert("กรุณากรอกบ้านเลขที่ที่ต้องการดึงข้อมูล!");
        return;
    }

    let storedData = localStorage.getItem(houseNumber);
    if (storedData) {
        let data = JSON.parse(storedData);
        let latestBill = data[data.length - 1];
        document.getElementById("prevMeter").value = latestBill.currentMeter;
        document.getElementById("prevMeter").disabled = true;
    } else {
        document.getElementById("prevMeter").value = "";
        document.getElementById("prevMeter").disabled = false;
        alert("ไม่พบข้อมูลมิเตอร์ครั้งก่อนสำหรับบ้านเลขที่นี้! กรุณากรอกเลขมิเตอร์ครั้งก่อนด้วยตัวเอง");
    }
}

function generateBill() {
    let houseNumber = document.getElementById("houseNumber").value;
    let prevMeter = parseInt(document.getElementById("prevMeter").value);
    let currentMeter = parseInt(document.getElementById("currentMeter").value);
    let otherFeeInput = document.getElementById("otherFee").value;
    let billDate = document.getElementById("billDate").value || new Date().toISOString().split('T')[0];
    let formattedBillDate = formatDate(new Date(billDate));

    if (isNaN(prevMeter) || isNaN(currentMeter) || houseNumber.trim() === "") {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
        return;
    }

    let otherFee = parseFloat(otherFeeInput);
    if (otherFeeInput.trim() === "") {
        let confirmNoFee = confirm("ยืนยันที่จะไม่ใส่ค่าบริการอื่นๆ ใช่หรือไม่?");
        if (!confirmNoFee) return;
        otherFee = 0;
    } else if (isNaN(otherFee)) {
        alert("กรุณากรอกค่าบริการอื่นๆ ให้ถูกต้อง!");
        return;
    }

    let unitsUsed = currentMeter - prevMeter;
    let unitPrice = 6;
    let totalAmount = unitsUsed * unitPrice + otherFee;

    let billContent = `
        <h3>บิลค่าน้ำ บ้านสวยบางเลน</h3>
        <p>วันที่ออกบิล ${formattedBillDate}</p>
        <p>บ้านเลขที่ ${houseNumber}</p>
        <p>เลขมิเตอร์ครั้งก่อน: ${prevMeter}</p>
        <p>เลขมิเตอร์ครั้งนี้: ${currentMeter}</p>
        <p>ใช้น้ำรวม: ${unitsUsed} หน่วย</p>
        <p>ราคาหน่วยละ 6 บาท</p>
        <p>ค่าบริการอื่นๆ: ${otherFee} บาท</p>
        <p><strong>รวมเป็นเงิน: ${totalAmount} บาท</strong></p>

        <div class="center-content">
        <p><strong>สแกนด้านล่างเพื่อชำระเงิน</strong></p>
        <img src="https://jaokit.github.io/WaterBillingWebProject/images/qrcode.jpg" alt="QR Code" width="150">
        <p><strong>แอดไลน์ 093-4935961 โอนแล้วรบกวนส่งสลิปผ่านไลน์ด้วยค่ะ</strong></p>
    `;

    document.getElementById("billOutput").innerHTML = billContent;

    let billData = {
        houseNumber: houseNumber,
        prevMeter: prevMeter,
        currentMeter: currentMeter,
        otherFee: otherFee,
        totalAmount: totalAmount,
        billDate: billDate,
        isPaid: false
    };

    let storedBills = JSON.parse(localStorage.getItem(houseNumber)) || [];
    storedBills.push(billData);
    localStorage.setItem(houseNumber, JSON.stringify(storedBills));

    alert("บันทึกบิลเรียบร้อย! ค่ามิเตอร์ครั้งนี้จะอัปเดตเมื่อคุณกด 'ดึงข้อมูลมิเตอร์ครั้งก่อน' ในครั้งถัดไป");
}

function printBill() {
    if (document.getElementById("billOutput").innerHTML.trim() === "") {
        alert("กรุณาสร้างบิลก่อนพิมพ์บิล!");
        return;
    }

    let billContent = document.getElementById("billOutput").innerHTML;
    let printWindow = window.open("", "", "width=600,height=400");
    
    printWindow.document.write(`
        <html>
        <head>
            <title>พิมพ์บิลค่าน้ำ</title>
            <style>
                body {
                    text-align: left;
                }
                .center-content {
                    text-align: center;
                    margin-top: 20px;
                }
                img {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            ${billContent}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

function viewHistory(showPendingOnly = false) {
    let historyOutput = document.getElementById("historyOutput");
    historyOutput.innerHTML = "";
    let keys = Object.keys(localStorage);

    if (keys.length === 0) {
        historyOutput.innerHTML = "<p>ยังไม่มีประวัติการบันทึกบิล</p>";
        return;
    }

    let historyContent = "<h3>ประวัติการบันทึกบิล:</h3><ul>";
    keys.forEach(function(key) {
        let storedData = localStorage.getItem(key);
        try {
            let bills = JSON.parse(storedData);
            if (Array.isArray(bills)) {
                bills.forEach(function(data, index) {
                    if (showPendingOnly && data.isPaid) return;
                    historyContent += `
                        <li>
                            วันที่: ${data.billDate} - บ้านเลขที่: ${key} - 
                            จำนวนเงินที่จ่าย: ${data.totalAmount} บาท - 
                            สถานะ: <strong class="${data.isPaid ? 'paid' : 'pending'}">${data.isPaid ? "ชำระแล้ว" : "ค้างชำระ"}</strong>
                            ${data.isPaid ? '' : `<button onclick="markAsPaid('${key}', ${index})">ชำระแล้ว</button>`}
                            <button onclick="deleteBill('${key}', ${index})">ลบบิล</button>
                            <button onclick="toggleAdditionalInfo(${index})">ดูข้อมูลเพิ่มเติม</button>       

                            <div id="additionalInfo-${index}" style="display: none;">
                                <p>เลขมิเตอร์ครั้งก่อน: ${data.prevMeter}</p>
                                <p>เลขมิเตอร์ครั้งล่าสุด: ${data.currentMeter}</p>
                                <p>ค่าบริการอื่นๆ: ${data.otherFee || 0} บาท</p>
                            </div>
                        </li>
                    `;
                });
            } else {
                historyContent += `<li>ข้อมูลของบ้านเลขที่ ${key} ไม่ถูกต้อง</li>`;
            }
        } catch (e) {
            console.error("Error parsing data for house number:", key);
            historyContent += `<li>บ้านเลขที่: ${key} - ข้อมูลไม่สามารถแสดงได้</li>`;
        }
    });

    historyContent += "</ul>";
    historyOutput.innerHTML = historyContent;
}

function toggleAdditionalInfo(index) {
    let additionalInfo = document.getElementById(`additionalInfo-${index}`);
    if (additionalInfo.style.display === "none") {
        additionalInfo.style.display = "block";
    } else {
        additionalInfo.style.display = "none";
    }
}

document.getElementById("showPendingBillsBtn").addEventListener("click", function() {
    viewHistory(true);
});

document.getElementById("showAllBillsBtn").addEventListener("click", function() {
    viewHistory(false);
});

function showPendingBills() {
    viewHistory(true);
}

function showAllBills() {
    viewHistory(false);
}

function deleteBill(houseNumber, billIndex) {
    let confirmDelete = confirm("คุณต้องการลบบิลที่ " + (billIndex + 1) + " ของบ้านเลขที่ " + houseNumber + " หรือไม่?");
    if (confirmDelete) {
        let storedData = localStorage.getItem(houseNumber);
        if (storedData) {
            let bills = JSON.parse(storedData);
            bills.splice(billIndex, 1);
            if (bills.length === 0) {
                localStorage.removeItem(houseNumber);
            } else {
                localStorage.setItem(houseNumber, JSON.stringify(bills));
            }
            alert("บิลที่ " + (billIndex + 1) + " ของบ้านเลขที่ " + houseNumber + " ถูกลบแล้ว!");
            viewHistory();
        } else {
            console.error("ไม่พบข้อมูลบิลสำหรับบ้านเลขที่:", houseNumber);
        }
    }
}

function markAsPaid(houseNumber, billIndex) {
    let storedData = localStorage.getItem(houseNumber);
    if (storedData) {
        let bills = JSON.parse(storedData);
        let bill = bills[billIndex];

        if (!bill.isPaid) {
            bill.isPaid = true;
        }

        localStorage.setItem(houseNumber, JSON.stringify(bills));

        alert("บิลที่ " + (billIndex + 1) + " ของบ้านเลขที่ " + houseNumber + " ได้รับการชำระแล้ว!");
        viewHistory();
    } else {
        console.error("ไม่พบข้อมูลบิลสำหรับบ้านเลขที่:", houseNumber);
    }
}