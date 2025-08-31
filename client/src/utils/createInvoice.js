// Hàm xuất hóa đơn ra PDF
// Tham số: invoiceData = { customer, cart, total, paymentMethod }
// Sử dụng jsPDF để tạo file PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import đúng chuẩn cho ES module

export function exportInvoicePDF(invoiceData) {

	const { customer, cart, total, paymentMethod } = invoiceData;
	// Khởi tạo jsPDF với font mặc định hỗ trợ Unicode
	const doc = new jsPDF({ encoding: 'UTF-8' });
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(18);
	doc.text('HÓA ĐƠN THANH TOÁN', 105, 20, { align: 'center' });
	doc.setFontSize(12);
	doc.text(`Tên khách hàng: ${customer?.name || ''}`, 20, 35);
	doc.text(`Số điện thoại: ${customer?.phone || ''}`, 20, 43);
	doc.text(`Giới tính: ${customer?.gender || ''}`, 20, 51);
	doc.text(`Địa chỉ: ${customer?.address || ''}`, 20, 59);
	doc.text(`Hình thức thanh toán: ${paymentMethod || ''}`, 20, 67);

	// Tạo dữ liệu bảng món ăn
	const tableData = cart.map((i, idx) => [
		idx + 1,
		i.menuItem?.name || '',
		i.quantity,
		i.menuItem?.price?.toLocaleString() + ' đ',
		(i.menuItem?.price * i.quantity).toLocaleString() + ' đ'
	]);

	autoTable(doc, {
		startY: 80,
		head: [['STT', 'Tên món', 'Số lượng', 'Đơn giá', 'Thành tiền']],
		body: tableData,
		theme: 'grid',
		styles: { font: 'helvetica', fontSize: 11, cellPadding: 2 },
		headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
		columnStyles: {
			0: { halign: 'center', cellWidth: 12 },
			2: { halign: 'center', cellWidth: 22 },
			3: { halign: 'right', cellWidth: 32 },
			4: { halign: 'right', cellWidth: 32 }
		}
	});

	// Hiển thị tổng tiền nổi bật
	const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 120;
	doc.setFontSize(14);
	doc.setTextColor(37, 99, 235);
	doc.text(`Tổng tiền thanh toán: ${total?.toLocaleString()} đ`, 20, finalY);
	doc.setTextColor(0, 0, 0);

	// Tải về file PDF
	doc.save('hoa-don.pdf');
	// Nếu muốn in luôn:
	// window.open(doc.output('bloburl'), '_blank');
}
