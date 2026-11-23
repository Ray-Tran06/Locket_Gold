var PACKS = [
  { badge: "IOS", chip: "3 tháng", name: "Locket Gold Basic IOS", price: 20000, items: ["Mở khóa Locket Gold", "Không quảng cáo", "Upload ảnh từ thư viện", "Quay video Lockets 5 giây", "Xem người đã xem Lockets", "Thay đổi icon Locket"] },
  { badge: "BEST SELLER", chip: "1 năm", name: "Locket Gold Pro IOS", price: 50000, items: ["Mở khóa Locket Gold", "Không quảng cáo", "Upload ảnh từ thư viện", "Quay video Lockets 30 giây", "Mở khóa chức năng Chụp Photobooth", "Xem người đã xem Lockets", "Thay đổi icon Locket", "Bảo hành 1 năm"] },
  { badge: "IOS", chip: "Vĩnh viễn", name: "Locket Gold Forever IOS", price: 129000, items: ["Mở khóa Locket Gold", "Không quảng cáo", "Upload ảnh từ thư viện", "Quay video Lockets 30 giây", "Mở khóa chức năng Chụp Photobooth", "Xem người đã xem Lockets", "Thay đổi icon Locket", "Mở khóa giới hạn bạn bè", "Huy hiệu Locket Gold"] }
];
var state = { pack: 1, pending: null };
var orderSequence = 1009;
var $ = function (i) { return document.getElementById(i) };
var money = function (n) { return n === 0 ? "Miễn phí" : n.toLocaleString("vi-VN") + "đ" };

function drawPacks() {
  $("packs").innerHTML = "";
  PACKS.forEach(function (p, i) {
    var d = document.createElement("div"); d.className = "pack"; d.setAttribute("role", "radio");
    d.setAttribute("aria-checked", i === state.pack); d.tabIndex = 0;
    d.innerHTML = '<span class="badge">' + p.badge + '</span><span class="chip">' + p.chip + '</span><h3>' + p.name + '</h3><div class="price">' + money(p.price) + '</div><ul>' + p.items.map(function (x) { return "<li>" + x + "</li>" }).join("") + '</ul><button class="pbtn" tabindex="-1">' + (i === state.pack ? "Đang chọn gói này" : "Chọn gói này") + "</button>";
    var pick = function () { state.pack = i; state.pending = null; drawPacks(); summary() };
    d.onclick = pick; d.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick() } };
    $("packs").appendChild(d);
  });
  summary();
}
function summary() {
  var p = PACKS[state.pack];
  $("sPack").textContent = p.name; $("sPrice").textContent = money(p.price);
  $("payBody").hidden = true; $("done").hidden = true; $("payHint").hidden = false;
  $("cta").disabled = false;
  $("cta").textContent = "Tiếp tục thanh toán · " + money(p.price);
}
$("cta").onclick = function () {
  window.open("https://zalo.me/0768057164", "_blank", "noopener,noreferrer");
};
function drawQR(seed) {
  var s = seed, svg = "", n = 29;
  function r() { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  function finder(x, y) { return '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#111"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#111"/>' }
  for (var y = 0; y < n; y++)for (var x = 0; x < n; x++) {
    var inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    if (!inF && r() > 0.52) svg += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#111"/>';
  }
  $("qr").innerHTML = svg + finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7);
}
function nextId() { return "LK" + (orderSequence++) }
function finish(o) {
  $("payHint").hidden = true; $("payBody").hidden = true; $("done").hidden = false;
  $("done").textContent = "Đã mô phỏng đơn " + o.id + ". Bản mẫu này không nhận thanh toán hoặc kích hoạt Locket Gold thật.";
}
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
$("paid").onclick = function () { if (state.pending) { var o = state.pending; state.pending = null; finish(o) } };
function route() {
  var h = (location.hash || "").replace("#", "");
  var v = h === "hoi-dap" ? "hoi-dap" : "cua-hang";
  var activeNav = h === "goi-khung" ? "goi-khung" : v;
  document.querySelectorAll(".view").forEach(function (e) { e.classList.toggle("on", e.id === "v-" + v) });
  document.querySelectorAll("header a[data-v]").forEach(function (a) { a.classList.toggle("on", a.dataset.v === activeNav) });
  if (h !== "goi-khung" && h !== "add-locket") {
    window.scrollTo(0, 0);
  }
}
window.addEventListener("hashchange", route);
drawPacks(); route();
document.addEventListener("click", function (event) {
  if (event.detail === 0) return;
  var heart = document.createElement("span");
  heart.className = "click-heart";
  heart.setAttribute("aria-hidden", "true");
  heart.textContent = "♥";
  heart.style.left = event.clientX + "px";
  heart.style.top = event.clientY + "px";
  document.body.appendChild(heart);
  window.setTimeout(function () { heart.remove() }, 850);
});
