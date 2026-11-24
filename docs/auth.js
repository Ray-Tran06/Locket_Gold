(function () {
  // Lay cac phan tu giao dien dang nhap/dang ky va khoi tao trang thai.
  var loginForm = document.getElementById("loginForm");
  var signupForm = document.getElementById("signupForm");
  var loginTab = document.getElementById("loginTab");
  var signupTab = document.getElementById("signupTab");
  var message = document.getElementById("authMessage");
  var account = document.getElementById("authAccount");
  var auth = null;
  var mode = "login";

  // Hien thong bao dang nhap hoac dang ky kem mau trang thai.
  function showMessage(text, kind) {
    message.textContent = text;
    message.className = "auth-message " + kind;
  }

  // Chuyen giua che do dang nhap va dang ky.
  function setMode(nextMode) {
    mode = nextMode;
    var isLogin = mode === "login";
    loginForm.hidden = !isLogin;
    signupForm.hidden = isLogin;
    loginTab.classList.toggle("on", isLogin);
    signupTab.classList.toggle("on", !isLogin);
    loginTab.setAttribute("aria-selected", String(isLogin));
    signupTab.setAttribute("aria-selected", String(!isLogin));
    showMessage(
      auth
        ? "Tài khoản tại đây dành cho khách hàng. Quyền admin được cấp riêng."
        : "Cần cấu hình Firebase để bật đăng nhập và đăng ký. Xem các bước trong README.txt.",
      auth ? "info" : "warning"
    );
  }

  // Chuyen ma loi Firebase thanh thong diep de hien thi cho nguoi dung.
  function getErrorMessage(error) {
    var messages = {
      "auth/email-already-in-use": "Email này đã có tài khoản. Hãy đăng nhập.",
      "auth/invalid-email": "Địa chỉ email chưa hợp lệ.",
      "auth/invalid-credential": "Email hoặc mật khẩu không chính xác.",
      "auth/user-disabled": "Tài khoản này hiện đã bị vô hiệu hóa.",
      "auth/weak-password": "Mật khẩu cần có ít nhất 6 ký tự.",
      "auth/too-many-requests": "Có quá nhiều lần thử. Vui lòng đợi rồi thử lại.",
      "auth/network-request-failed": "Không kết nối được Firebase. Kiểm tra mạng rồi thử lại.",
      "auth/operation-not-allowed": "Email/Password chưa được bật trong Firebase Authentication."
    };
    return messages[error.code] || "Không thể hoàn tất yêu cầu. Vui lòng kiểm tra cấu hình Firebase và thử lại.";
  }

  // Hien loi Firebase duoi dang thong bao tren giao dien.
  function reportError(error) {
    showMessage(getErrorMessage(error), "error");
  }

  // Khi bam tab dang nhap thi chuyen sang che do dang nhap.
  loginTab.addEventListener("click", function () {
    setMode("login");
  });
  // Khi bam tab dang ky thi chuyen sang che do dang ky.
  signupTab.addEventListener("click", function () {
    setMode("signup");
  });

  // Xu ly submit form dang nhap tai khoan bang email va mat khau.
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!auth) {
      setMode(mode);
      return;
    }

    auth.signInWithEmailAndPassword(
      document.getElementById("loginEmail").value.trim(),
      document.getElementById("loginPassword").value
    ).catch(reportError);
  });

  // Xu ly submit form dang ky va kiem tra hai mat khau co trung nhau.
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!auth) {
      setMode(mode);
      return;
    }

    var password = document.getElementById("signupPassword").value;
    if (password !== document.getElementById("signupPasswordConfirm").value) {
      showMessage("Hai mật khẩu chưa trùng khớp.", "error");
      return;
    }

    auth.createUserWithEmailAndPassword(
      document.getElementById("signupEmail").value.trim(),
      password
    ).catch(reportError);
  });

  // Gui yeu cau dat lai mat khau qua Firebase neu co email hop le.
  document.getElementById("resetPassword").addEventListener("click", function () {
    if (!auth) {
      setMode("login");
      return;
    }

    var email = document.getElementById("loginEmail").value.trim();
    if (!email) {
      showMessage("Nhập email để nhận liên kết đặt lại mật khẩu.", "error");
      return;
    }

    auth.sendPasswordResetEmail(email)
      .then(function () {
        showMessage("Đã gửi hướng dẫn đặt lại mật khẩu nếu email có tài khoản.", "success");
      })
      .catch(reportError);
  });

  // Dang xuat tai khoan Firebase khi nguoi dung bam nut dang xuat.
  document.getElementById("signOut").addEventListener("click", function () {
    if (auth) {
      auth.signOut().catch(reportError);
    }
  });

  var config = window.firebaseConfig;
  var hasConfig = config &&
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId;

  if (window.firebase && hasConfig) {
    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      auth = window.firebase.auth();
      auth.onAuthStateChanged(function (user) {
        var tabs = document.querySelector(".auth-tabs");
        loginForm.hidden = Boolean(user) || mode !== "login";
        signupForm.hidden = Boolean(user) || mode !== "signup";
        tabs.hidden = Boolean(user);
        account.hidden = !user;

        if (user) {
          document.getElementById("authUserEmail").textContent = user.email || "";
          showMessage("Đăng nhập thành công. Đây là tài khoản khách hàng.", "success");
        } else {
          setMode(mode);
        }
      }, reportError);
    } catch (error) {
      reportError(error);
    }
  } else if (!window.firebase) {
    showMessage("Không tải được Firebase SDK. Kiểm tra kết nối mạng rồi tải lại trang.", "error");
  } else {
    setMode("login");
  }
})();
  // Lay cau hinh Firebase va khoi tao dich vu dang nhap neu cau hinh da day du.
