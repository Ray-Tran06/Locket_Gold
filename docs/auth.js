(function () {
  var loginForm = document.getElementById("loginForm");
  var signupForm = document.getElementById("signupForm");
  var loginTab = document.getElementById("loginTab");
  var signupTab = document.getElementById("signupTab");
  var message = document.getElementById("authMessage");
  var account = document.getElementById("authAccount");
  var auth = null;
  var mode = "login";

  function showMessage(text, kind) {
    message.textContent = text;
    message.className = "auth-message " + kind;
  }

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

  function reportError(error) {
    showMessage(getErrorMessage(error), "error");
  }

  loginTab.addEventListener("click", function () {
    setMode("login");
  });
  signupTab.addEventListener("click", function () {
    setMode("signup");
  });

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
