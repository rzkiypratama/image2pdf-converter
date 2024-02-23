document
.getElementById("imageFiles")
.addEventListener("change", function (event) {
  const files = event.target.files;

  if (files.length === 0) {
    return;
  }

  if (files.length > 25) {
    alert("Maximum 25 images allowed.");
    return;
  }

  const images = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function (event) {
      const imageData = {
        name: file.name,
        type: file.type,
        base64: event.target.result.split(",")[1],
      };
      images.push(imageData);

      // Save images to localStorage
      localStorage.setItem("images", JSON.stringify(images));
    };

    reader.readAsDataURL(file);
  }
});

document
.getElementById("convertBtn")
.addEventListener("click", async () => {
  const imageFiles = JSON.parse(localStorage.getItem("images"));

  if (!imageFiles || imageFiles.length === 0) {
    alert("Please select at least one image file.");
    return;
  }

  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let i = 0; i < imageFiles.length; i++) {
    const imageData = imageFiles[i];
    const imageBytes = base64ToArrayBuffer(imageData.base64);
    const image = await pdfDoc.embedPng(imageBytes);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = pdfUrl;
  downloadLink.download = "converted_images.pdf";
  downloadLink.textContent = "Download PDF";
  document.getElementById("pdfDownloadLink").innerHTML = "";
  document.getElementById("pdfDownloadLink").appendChild(downloadLink);

  // Clear localStorage after PDF is created
  localStorage.removeItem("images");
});

function base64ToArrayBuffer(base64) {
const binaryString = window.atob(base64);
const binaryLen = binaryString.length;
const bytes = new Uint8Array(binaryLen);
for (let i = 0; i < binaryLen; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
return bytes;
}