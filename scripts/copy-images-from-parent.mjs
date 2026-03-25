import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(webDir, "..");
const dest = path.join(webDir, "public");

const exts = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"]);

function copyImagesFrom(dir) {
  if (!fs.existsSync(dir)) {
    console.error("Không tìm thấy thư mục:", dir);
    process.exit(1);
  }
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    if (!fs.statSync(fp).isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    if (!exts.has(ext)) continue;
    fs.copyFileSync(fp, path.join(dest, name));
    n++;
    console.log("Copied:", name);
  }
  const jcb = path.join(dir, "JCB.png");
  if (fs.existsSync(jcb)) {
    fs.copyFileSync(jcb, path.join(dest, "jcb.png"));
    console.log("Copied: jcb.png (từ JCB.png)");
  }
  console.log("Xong. Tổng file ảnh (gốc):", n);
}

copyImagesFrom(projectRoot);
