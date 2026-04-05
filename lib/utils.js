export function formatPrice(value) {
  return `${Number(value || 0).toFixed(0)} ج.م`;
}

export function buildWhatsAppUrl({
  phone,
  customerName,
  customerPhone,
  backupPhone,
  address,
  items,
  total
}) {
  const text = [
    "طلب جديد من Roqa Store",
    "",
    `اسم العميل: ${customerName || ""}`,
    `رقم العميل: ${customerPhone || ""}`,
    `رقم احتياطي: ${backupPhone || ""}`,
    `العنوان: ${address || ""}`,
    "",
    "المنتجات:"
  ];

  items.forEach((item, index) => {
    text.push(`${index + 1}- ${item.name} | ${item.category_name} | ${item.price} ج.م`);
    text.push(`الصورة: ${item.image_url}`);
  });

  text.push("");
  text.push(`إجمالي السعر: ${Number(total || 0).toFixed(0)} ج.م`);

  return `https://wa.me/${phone}?text=${encodeURIComponent(text.join("\n"))}`;
}