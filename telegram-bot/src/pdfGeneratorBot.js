const PDFDocument = require("pdfkit");
const axios = require("axios");

async function generateCatalogPDF(sarees) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 40 });
            const buffers = [];

            doc.on("data", (buffer) => buffers.push(buffer));
            doc.on("end", () => resolve(Buffer.concat(buffers)));

            // Page Setup
            const pageWidth = 595.28; // A4 width in points
            const pageHeight = 841.89;
            const margin = 40;

            // -- Cover Page --
            doc.rect(0, 0, pageWidth, pageHeight).fill("#FDF6F0"); // Cream background

            // Border
            doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2))
                .strokeColor("#C9A227")
                .lineWidth(2)
                .stroke();

            // Title
            doc.fillColor("#8B1A2E")
                .font("Times-Italic")
                .fontSize(50)
                .text("Exquisite Collection", 0, 300, { align: "center", width: pageWidth });

            doc.fillColor("#A0A0A0")
                .font("Helvetica")
                .fontSize(16)
                .text("SAREE CATALOG 2026", 0, 360, { align: "center", width: pageWidth });

            doc.moveTo(pageWidth / 2 - 50, 400)
                .lineTo(pageWidth / 2 + 50, 400)
                .strokeColor("#C9A227")
                .lineWidth(1)
                .stroke();

            doc.fillColor("#666666")
                .fontSize(10)
                .text(`Generated on: ${new Date().toLocaleDateString()}`, 0, 750, { align: "center", width: pageWidth });

            // -- Content Pages --
            doc.addPage();

            // Grid Layout
            const activeSarees = sarees.filter(s => s.status !== 'removed');
            const cols = 2;
            const cardWidth = (pageWidth - (margin * 2) - 20) / cols; // 20pt gap
            const cardHeight = 220;
            const startX = margin;
            let currentX = startX;
            let currentY = margin;

            for (let i = 0; i < activeSarees.length; i++) {
                const saree = activeSarees[i];

                // Check page overflow
                if (currentY + cardHeight > pageHeight - margin) {
                    doc.addPage();
                    currentY = margin;
                }

                // Draw Card Container
                doc.roundedRect(currentX, currentY, cardWidth, cardHeight, 5)
                    .fillAndStroke("white", "#E0E0E0");

                // Fetch and Draw Image
                if (saree.image_url) {
                    try {
                        const response = await axios.get(saree.image_url, { responseType: "arraybuffer" });
                        const imgBuffer = Buffer.from(response.data, "binary");

                        // Image fit logic (left half of card)
                        doc.image(imgBuffer, currentX + 5, currentY + 5, {
                            fit: [cardWidth * 0.45, cardHeight - 10],
                            align: 'center',
                            valign: 'center'
                        });
                    } catch (err) {
                        console.error(`Failed to load image for saree ${saree.id}:`, err.message);
                        // Placeholder
                        doc.fillColor("#F5F5F5")
                            .rect(currentX + 5, currentY + 5, cardWidth * 0.45, cardHeight - 10)
                            .fill();
                        doc.fillColor("#AAAAAA")
                            .fontSize(8)
                            .text("No Image", currentX + 15, currentY + cardHeight / 2);
                    }
                } else {
                    // Placeholder
                    doc.fillColor("#F5F5F5")
                        .rect(currentX + 5, currentY + 5, cardWidth * 0.45, cardHeight - 10)
                        .fill();
                    doc.fillColor("#AAAAAA")
                        .fontSize(8)
                        .text("No Image", currentX + 15, currentY + cardHeight / 2);
                }

                // Content (Right half)
                const contentX = currentX + (cardWidth * 0.5);
                let textY = currentY + 15;

                // Category Tag
                doc.roundedRect(contentX, textY, 80, 15, 3)
                    .fill("#FDF6E3"); // Light gold
                doc.fillColor("#C9A227")
                    .fontSize(8)
                    .font("Helvetica-Bold")
                    .text(saree.categoryName?.toUpperCase() || "SAREE", contentX + 5, textY + 4);

                textY += 25;

                // Name
                doc.fillColor("#333333")
                    .font("Times-Bold")
                    .fontSize(12)
                    .text(saree.name.length > 30 ? saree.name.substring(0, 27) + "..." : saree.name, contentX, textY, { width: cardWidth * 0.45 });

                textY += 35;

                // Fabric/Details
                if (saree.fabric) {
                    doc.fillColor("#666666")
                        .font("Helvetica")
                        .fontSize(9)
                        .text(`Fabric: ${saree.fabric}`, contentX, textY, { width: cardWidth * 0.45 });
                    textY += 15;
                }

                // Price
                doc.fillColor("#8B1A2E") // Burgundy
                    .font("Helvetica-Bold")
                    .fontSize(14)
                    .text(`Rs. ${saree.price}`, contentX, textY + 10);

                // Out of Stock
                if (saree.status === 'out_of_stock') {
                    doc.fillColor("#FF0000")
                        .fontSize(8)
                        .text("(Out of Stock)", contentX, textY + 30);
                }

                // Move grid position
                if ((i + 1) % cols === 0) {
                    currentX = startX;
                    currentY += cardHeight + 20;
                } else {
                    currentX += cardWidth + 20;
                }
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = generateCatalogPDF;
