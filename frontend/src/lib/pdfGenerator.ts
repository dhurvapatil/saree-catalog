import jsPDF from "jspdf";
import { Saree, SareeCategory } from "@/lib/supabase";

// Define a type for the image cache to avoid repeated downloads
const imageCache: Record<string, string> = {};

// Helper to convert image URL to base64
const getBase64FromUrl = async (url: string): Promise<string> => {
    if (imageCache[url]) return imageCache[url];

    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                imageCache[url] = base64data;
                resolve(base64data);
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Error fetching image for PDF", e);
        return "";
    }
};

export const generateCatalogPDF = async (sarees: Saree[], categories: SareeCategory[]): Promise<Blob> => {
    // Premium Catalog Design - A4 Vertical
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const availableWidth = pageWidth - (margin * 2);

    // Filter active items
    const items = sarees.filter(s => s.status !== 'removed');

    // -- Cover Page --
    // Background color
    doc.setFillColor(253, 250, 245); // Cream
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(201, 162, 39); // Gold
    doc.setLineWidth(1);
    doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

    // Title
    doc.setFont("times", "italic");
    doc.setFontSize(40);
    doc.setTextColor(120, 28, 51); // Burgundy
    doc.text("Exquisite Collection", pageWidth / 2, 100, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(160, 160, 160);
    doc.text("SAREE CATALOG 2026", pageWidth / 2, 115, { align: "center" });

    doc.setDrawColor(201, 162, 39);
    doc.line(pageWidth / 2 - 20, 130, pageWidth / 2 + 20, 130);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 260, { align: "center" });


    // -- Content Pages --

    // Grid settings
    const cols = 2;
    const itemsPerPage = 6;
    const cardWidth = (availableWidth - 10) / cols; // 10mm gap
    const cardHeight = 70; // Fixed height per card
    const startY = 30;

    // Helper: Draw Card
    const drawCard = (x: number, y: number, item: Saree, imageBase64: string) => {
        // Card Background
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

        // Image
        if (imageBase64) {
            try {
                // Image takes up left 40% of card
                const imgWidth = cardWidth * 0.4;
                const imgHeight = cardHeight - 4; // Padding
                doc.addImage(imageBase64, 'JPEG', x + 2, y + 2, imgWidth, imgHeight, undefined, 'FAST');
            } catch (e) { }
        } else {
            // Placeholder
            doc.setFillColor(245, 245, 245);
            doc.rect(x + 2, y + 2, cardWidth * 0.4, cardHeight - 4, 'F');
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("No Image", x + 10, y + cardHeight / 2);
        }

        // Content (Right 60%)
        const contentX = x + (cardWidth * 0.45);
        let currentY = y + 10;

        // Category Tag
        const category = categories.find(c => c.id === item.category_id)?.name || "Uncategorized";
        doc.setFillColor(253, 246, 227); // Light gold bg
        doc.setDrawColor(201, 162, 39);
        doc.roundedRect(contentX, currentY - 4, 30, 6, 1, 1, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(201, 162, 39); // Gold text
        doc.text(category.toUpperCase(), contentX + 15, currentY, { align: "center" });

        currentY += 10;

        // Name
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        // Truncate name if too long
        const safeName = item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name;
        doc.text(safeName, contentX, currentY);

        currentY += 6;

        // Fabric
        if (item.fabric) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(item.fabric, contentX, currentY);
            currentY += 8;
        }

        // Price
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(176, 58, 46); // Burgundy
        doc.text(`Rs. ${Math.floor(item.price).toLocaleString('en-IN')}`, contentX, currentY + 5);

        // Status Check
        if (item.status === 'out_of_stock') {
            doc.setTextColor(200, 0, 0);
            doc.setFontSize(7);
            doc.text("(Out of Stock)", contentX, currentY + 12);
        }

    };

    // Process all items
    for (let i = 0; i < items.length; i++) {
        // Add new page every [itemsPerPage] items (start from index 0)
        // But first page is Cover, so we add page immediately for first item
        if (i % itemsPerPage === 0) {
            doc.addPage();

            // Page Header
            doc.setFillColor(253, 250, 245);
            doc.rect(0, 0, pageWidth, 20, 'F');
            doc.setFont("times", "italic");
            doc.setFontSize(12);
            doc.setTextColor(120, 28, 51);
            doc.text("Latest Collection", margin, 12);
            doc.line(margin, 20, pageWidth - margin, 20);
        }

        const pageIndex = i % itemsPerPage;
        const col = pageIndex % cols;
        const row = Math.floor(pageIndex / cols);

        const x = margin + (col * (cardWidth + 10));
        const y = startY + (row * (cardHeight + 10));

        // Get Image
        let imageBase64 = "";
        if (items[i].image_url) {
            imageBase64 = await getBase64FromUrl(items[i].image_url as string);
        }

        drawCard(x, y, items[i], imageBase64);
    }

    return doc.output("blob");
};
