/**
 * Weather Planner - Animations Module
 * Chuyên trách:
 *  - 3D Tilt Effect thuần Vanilla JS (±6°, perspective 1000px, glare sheen)
 *  - Animation nhiệt độ
 *  - Transition thêm/xóa mục lịch trình
 *  - Cuộn trang mượt
 */

const AnimationManager = {
  // Cấu hình mặc định cho 3D Tilt Effect
  tiltDefaults: {
    maxTilt: 6,           // Góc nghiêng tối đa ±6 độ
    perspective: 1000,    // Chiều sâu phối cảnh 3D
    scale: 1.02,          // Phóng to nhẹ khi hover
    glare: true,          // Bật hiệu ứng vệt sáng phản quang kính
    maxGlare: 0.35        // Độ trong suốt tối đa của vệt sáng
  },

  // 1. Khởi tạo 3D Tilt Effect cho các phần tử mục tiêu
  initTilt(selectorOrElements = ".weather-card, .itinerary-section, .destination-card", customOptions = {}) {
    const options = { ...this.tiltDefaults, ...customOptions };
    let elements = [];

    if (typeof selectorOrElements === "string") {
      elements = Array.from(document.querySelectorAll(selectorOrElements));
    } else if (selectorOrElements instanceof NodeList || Array.isArray(selectorOrElements)) {
      elements = Array.from(selectorOrElements);
    } else if (selectorOrElements instanceof HTMLElement) {
      elements = [selectorOrElements];
    }

    elements.forEach(element => {
      // Tránh gắn listener lặp lại nhiều lần
      if (element.dataset.tiltInitialized === "true") return;
      element.dataset.tiltInitialized = "true";
      element.classList.add("tilt-enabled");

      // Tạo lớp phủ Glare (vệt sáng phản quang kính) nếu được bật
      let glareElement = null;
      if (options.glare) {
        glareElement = element.querySelector(".glass-glare-overlay");
        if (!glareElement) {
          glareElement = document.createElement("div");
          glareElement.className = "glass-glare-overlay";
          element.appendChild(glareElement);
        }
      }

      // Xử lý sự kiện di chuột (mousemove)
      const handleMouseMove = (e) => {
        const rect = element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Vị trí chuột so với phần tử
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Tỷ lệ từ -1 (mép trái/trên) đến 1 (mép phải/dưới), tâm là 0
        const xPercent = ((mouseX / width) - 0.5) * 2;
        const yPercent = ((mouseY / height) - 0.5) * 2;

        // Tính góc nghiêng
        const rotateX = (-yPercent * options.maxTilt).toFixed(2);
        const rotateY = (xPercent * options.maxTilt).toFixed(2);

        element.classList.remove("tilt-resetting");
        element.style.transform = `perspective(${options.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${options.scale}, ${options.scale}, ${options.scale})`;

        // Cập nhật vệt sáng phản quang chạy theo vị trí chuột
        if (glareElement) {
          const glareX = ((mouseX / width) * 100).toFixed(1);
          const glareY = ((mouseY / height) * 100).toFixed(1);
          glareElement.style.opacity = options.maxGlare;
          glareElement.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)`;
        }
      };

      // Xử lý sự kiện rời chuột (mouseleave) - trả về vị trí gốc nhẹ nhàng
      const handleMouseLeave = () => {
        element.classList.add("tilt-resetting");
        element.style.transform = `perspective(${options.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

        if (glareElement) {
          glareElement.style.opacity = "0";
        }
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);
    });
  },

  // 2. Hiệu ứng giật số/phóng to nhẹ khi cập nhật nhiệt độ
  triggerTempUpdate(element) {
    if (!element) return;
    element.classList.remove("temp-updated");
    void element.offsetWidth;
    element.classList.add("temp-updated");
  },

  // 3. Hoạt ảnh XÓA mục: Fade-out, trượt sang phải và thu hẹp chiều cao về 0
  animateItemRemoval(element, callback) {
    if (!element) {
      if (typeof callback === "function") callback();
      return;
    }

    // Kích hoạt class animation CSS
    element.classList.add("item-removing");

    // Đợi đúng thời gian animation hoàn tất (350ms) để thực thi xóa khỏi DOM
    const handleAnimationEnd = () => {
      element.removeEventListener("animationend", handleAnimationEnd);
      if (typeof callback === "function") callback();
    };

    element.addEventListener("animationend", handleAnimationEnd);

    // Fallback an toàn trong trường hợp trình duyệt không kích hoạt animationend
    setTimeout(() => {
      element.removeEventListener("animationend", handleAnimationEnd);
      if (typeof callback === "function") callback();
    }, 360);
  },

  // 4. Cuộn trang mượt đến phần tử mục tiêu
  smoothScrollTo(element) {
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
};

window.AnimationManager = AnimationManager;
