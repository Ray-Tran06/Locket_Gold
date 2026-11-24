// Danh sach cac goi nang cap va gia tien hien thi tren trang.
var PACKS = [
  { badge: "IOS", chip: "3 tháng", name: "Locket Gold Basic IOS", price: 25000, items: ["Mở khóa Locket Gold", "Không quảng cáo", "Upload ảnh từ thư viện", "Quay video Lockets 5 giây", "Xem người đã xem Lockets", "Thay đổi icon Locket"] },
  { badge: "BEST SELLER", chip: "1 năm", name: "Locket Gold Pro IOS", price: 59000, items: ["Mở khóa Locket Gold", "Không quảng cáo", "Upload ảnh từ thư viện", "Quay video Lockets 30 giây", "Mở khóa chức năng Chụp Photobooth", "Xem người đã xem Lockets", "Thay đổi icon Locket", "Bảo hành 1 năm"] },
  { badge: "IOS", chip: "Vĩnh viễn", name: "Locket Gold Forever IOS", price: 150000, items: ["Mở khóa Locket Gold", "Không quảng cáo", "Upload ảnh từ thư viện", "Quay video Lockets 30 giây", "Mở khóa chức năng Chụp Photobooth", "Xem người đã xem Lockets", "Thay đổi icon Locket", "Mở khóa giới hạn bạn bè", "Huy hiệu Locket Gold"] }
];
// Trang thai dang luu goi duoc chon, don tam thoi va so thu tu don.
var state = { pack: 1, pending: null };
var orderSequence = 1009;
// Rut gon viec lay phan tu theo id tu DOM.
var $ = function (i) { return document.getElementById(i) };
// Dinh dang so tien theo tien te Viet Nam.
var money = function (n) { return n === 0 ? "Miễn phí" : n.toLocaleString("vi-VN") + "đ" };

// Tao danh sach cac goi mot lan va gan cac su kien chon goi.
function drawPacks() {
  $("packs").innerHTML = "";
  PACKS.forEach(function (p, i) {
    var d = document.createElement("div"); d.className = "pack"; d.setAttribute("role", "radio");
    d.setAttribute("aria-checked", i === state.pack); d.tabIndex = 0;
    d.innerHTML = '<span class="badge">' + p.badge + '</span><span class="chip">' + p.chip + '</span><h3>' + p.name + '</h3><div class="price">' + money(p.price) + '</div><ul>' + p.items.map(function (x) { return "<li>" + x + "</li>" }).join("") + '</ul><button class="pbtn" tabindex="-1">' + (i === state.pack ? "Đang chọn gói này" : "Chọn gói này") + "</button>";
    var pick = function () { selectPack(i) };
    d.onclick = pick; d.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick() } };
    $("packs").appendChild(d);
  });
  var rail = $("packs");
  var selected = rail.children[state.pack];
  if (selected && window.matchMedia("(max-width: 560px)").matches) {
    var railRect = rail.getBoundingClientRect();
    var selectedRect = selected.getBoundingClientRect();
    rail.scrollLeft += selectedRect.left - railRect.left - (rail.clientWidth - selectedRect.width) / 2;
  }
  summary();
}
// Cap nhat goi duoc chon ma khong tao lai toan bo cac the.
function selectPack(index) {
  state.pack = index;
  state.pending = null;
  var cards = $("packs").children;
  for (var i = 0; i < cards.length; i++) {
    cards[i].setAttribute("aria-checked", i === index);
    cards[i].querySelector(".pbtn").textContent = i === index ? "Đang chọn gói này" : "Chọn gói này";
  }
  summary();
}
// Cap nhat thong tin tong tien va trang thai nut thanh toan.
function summary() {
  var p = PACKS[state.pack];
  $("sPack").textContent = p.name; $("sPrice").textContent = money(p.price);
  $("payBody").hidden = true; $("done").hidden = true; $("payHint").hidden = false;
  $("cta").disabled = false;
  $("cta").textContent = "Tiếp tục thanh toán · " + money(p.price);
}
// Mo trang Zalo khi nguoi dung bam nut tiep tuc thanh toan.
$("cta").onclick = function () {
  window.open("https://zalo.me/0768057164", "_blank", "noopener,noreferrer");
};
// Tao ma QR minh hoa bang SVG tu mot gia tri seed.
function drawQR(seed) {
  var s = seed, svg = "", n = 29;
  // Tao so ngau nhien de phan bo cac diem den trong ma QR.
  function r() { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  // Ve ba vien manh dinh vi cua ma QR.
  function finder(x, y) { return '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#111"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#111"/>' }
  for (var y = 0; y < n; y++)for (var x = 0; x < n; x++) {
    var inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    if (!inF && r() > 0.52) svg += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#111"/>';
  }
  $("qr").innerHTML = svg + finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7);
}
// Sinh ma don hang moi, sau do tang bo dem.
function nextId() { return "LK" + (orderSequence++) }
// Hien thi trang thai hoan tat gia lap don hang.
function finish(o) {
  $("payHint").hidden = true; $("payBody").hidden = true; $("done").hidden = false;
  $("done").textContent = "Đã mô phỏng đơn " + o.id + ". Bản mẫu này không nhận thanh toán hoặc kích hoạt Locket Gold thật.";
}
// Kiem tra thong tin lien he, tao don tam va hien ma thanh toan minh hoa.
$("mk").onclick = function () {
  if ($("contact").value.trim().length < 5) { $("err").textContent = "Nhập Zalo hoặc email để nhận thông tin kích hoạt."; return }
  $("err").textContent = "";
  var p = PACKS[state.pack], id = nextId();
  if (p.price === 0) { finish({ id: id, pack: p.name, amt: 0, done: true }); return }
  state.pending = { id: id, pack: p.name, amt: p.price, done: false };
  $("memo").textContent = id; $("amt").textContent = money(p.price);
  drawQR(parseInt(id.slice(2), 10) * 7919);
  $("payHint").hidden = true; $("payBody").hidden = false; $("done").hidden = true;
};
// Xac nhan gia lap thanh toan neu dang co don cho xu ly.
$("paid").onclick = function () { if (state.pending) { var o = state.pending; state.pending = null; finish(o) } };
// Dieu huong trang hien tai dua tren hash tren thanh dia chi.
function route() {
  var h = (location.hash || "").replace("#", "");
  var v = h === "hoi-dap" ? "hoi-dap" : "cua-hang";
  var activeNav = h === "goi-khung" ? "goi-khung" : v;
  var switchingToHome = v === "cua-hang" && !$("v-cua-hang").classList.contains("on");
  document.querySelectorAll(".view").forEach(function (e) { e.classList.toggle("on", e.id === "v-" + v) });
  document.querySelectorAll("header a[data-v]").forEach(function (a) { a.classList.toggle("on", a.dataset.v === activeNav) });
  if ((h === "goi-khung" || h === "add-locket") && switchingToHome) {
    window.requestAnimationFrame(function () {
      $(h).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else if (h !== "goi-khung" && h !== "add-locket") {
    window.scrollTo(0, 0);
  }
}
// Tao mot so trai tim trang tri nen, giam so luong tren dien thoai.
function setupBackgroundHearts() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var layer = document.createElement("div");
  layer.className = "background-hearts";
  layer.setAttribute("aria-hidden", "true");
  var count = window.matchMedia("(max-width: 560px)").matches ? 5 : 8;
  for (var i = 0; i < count; i++) {
    var heart = document.createElement("span");
    heart.className = "background-heart";
    heart.textContent = "♥";
    heart.style.left = (3 + Math.random() * 94) + "%";
    heart.style.fontSize = (16 + Math.random() * 14) + "px";
    heart.style.setProperty("--heart-duration", (18 + Math.random() * 10) + "s");
    heart.style.setProperty("--heart-delay", (-Math.random() * 22) + "s");
    heart.style.setProperty("--heart-drift", (Math.random() * 48 - 24) + "px");
    layer.appendChild(heart);
  }
  document.body.insertBefore(layer, document.body.firstChild);
}
// Cho cac khu vuc noi len nhe khi lan dau cuon den.
function setupScrollReveal() {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var targets = document.querySelectorAll(".catalog, .feature-row, #add-locket, #v-hoi-dap details");
  var observer = new IntersectionObserver(function (entries, currentObserver) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
  targets.forEach(function (target) {
    target.classList.add("reveal-on-scroll");
    observer.observe(target);
  });
}
// Re-render giao dien khi dia chi hash thay doi.
window.addEventListener("hashchange", route);
// Ve danh sach goi va ap dung route ngay khi trang duoc tai.
drawPacks(); route(); setupBackgroundHearts(); setupScrollReveal();
// Tao hieu ung trai tim nho tai vi tri nguoi dung click vao trang.
document.addEventListener("click", function (event) {
  if (event.detail === 0) return;
  var heart = document.createElement("span");
  heart.className = "click-heart";
  heart.setAttribute("aria-hidden", "true");
  heart.textContent = "♥";
  heart.style.setProperty("--heart-drift", (Math.random() * 24 - 12) + "px");
  heart.style.left = event.clientX + "px";
  heart.style.top = event.clientY + "px";
  document.body.appendChild(heart);
  window.setTimeout(function () { heart.remove() }, 1050);
});
