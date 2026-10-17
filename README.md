# 🌸 Vy's TaskFlow - Professional Task Management Dashboard

Hệ thống quản lý công việc và tác vụ chuyên nghiệp, giao diện chuẩn **Pastel Glassmorphism**, tích hợp đầy đủ tính năng của các nền tảng năng suất hàng đầu (như Notion & Trello) nhưng vẫn giữ trọn vẹn tone màu pastel hồng/tím dịu mắt, thân thiện và tinh tế.

---

## 🌟 Tính Năng Nâng Cao Nổi Bật

### 1. 🎯 Mức Độ Ưu Tiên & Danh Mục (Priority & Categories)
- **Mức độ ưu tiên:** 
  - 🔴 **Cao (Gấp)**: Badge màu đỏ/hồng san hô nổi bật.
  - 🟡 **Trung bình**: Badge màu vàng hổ phách ấm áp.
  - 🟢 **Thấp**: Badge màu xanh mint dịu mát.
- **Danh mục / Nhãn phân loại:**
  - 📚 **Học tập** (Study)
  - 💼 **Dự án** (Project)
  - 🏠 **Việc nhà** (Chore)
  - 💖 **Cá nhân** (Personal)

### 2. ⏳ Quản Lý Hạn Chót & Cảnh Báo Quá Hạn (Deadlines & Overdue)
- Bộ chọn ngày và giờ hoàn thành (`datetime-local`) chi tiết.
- Tự động phát hiện và đánh dấu thẻ **⚠️ Quá hạn** màu đỏ cùng hiệu ứng nhấp nháy khi thời gian hiện tại đã vượt quá hạn chót mà công việc chưa hoàn thành.

### 3. 🔍 Lọc, Tìm Kiếm & Sắp Xếp Nâng Cao (Search, Filters & Sort)
- **Thanh tìm kiếm (Search Bar):** Lọc từ khóa theo thời gian thực (hỗ trợ tìm cả tên công việc lẫn các bước công việc con).
- **Bộ lọc đa chiều:**
  - Trạng thái: *Tất cả* | *Cần làm* | *Đang làm* | *Đã xong*.
  - Danh mục: Lọc theo từng danh mục cụ thể.
  - Mức độ ưu tiên: Lọc theo độ khẩn cấp.
- **Sắp xếp linh hoạt:** Theo *Mới nhất*, *Cũ nhất*, *Hạn chót gần nhất ⏳*, hoặc *Ưu tiên cao nhất 🔴*.

### 4. ✏️ Chỉnh Sửa Chi Tiết & Công Việc Con (Edit Modal & Subtasks)
- Cửa sổ Modal chuyên nghiệp cho phép chỉnh sửa:
  - Tên công việc, Mức độ ưu tiên, Danh mục, Trạng thái, Hạn chót.
  - **Quản lý danh sách việc con (Subtasks / Checklist):** Thêm các bước cụ thể, tick chọn hoàn thành từng bước con và theo dõi tiến độ hoàn thành ngay trên thẻ công việc.

### 5. 📊 Thanh Tiến Độ & Chế Độ Xem (Progress & Views)
- **Thanh tiến độ trực quan (Progress Bar %):** Thể hiện % công việc đã hoàn thành với hiệu ứng chuyển màu gradient pastel sinh động.
- **Bộ chuyển đổi chế độ xem:**
  - 📋 **List View (Chế độ Danh sách):** Xem chi tiết kèm bảng điều khiển việc con mở rộng.
  - 📊 **Kanban Board View (Chế độ Bảng Kanban):** Chia làm 3 cột chuyên nghiệp: *Cần làm* ➔ *Đang thực hiện* ➔ *Đã hoàn thành*, có nút chuyển trạng thái nhanh giữa các cột.

### 6. 🌙 Giao Diện Sáng / Tối & Lưu Trữ Bền Vững (Dark Mode & LocalStorage)
- **Dark Mode / Light Mode:** Nút chuyển đổi mượt mà ở góc phải Header, giữ nguyên tone màu pastel neon sang trọng trong nền tối.
- **Đồng hồ thời gian thực:** Hiển thị `Giờ:Phút:Giây` cập nhật từng giây liên tục kèm lời chào cá nhân hóa theo từng buổi trong ngày.
- **Lưu trữ tự động (LocalStorage):** Mọi tác vụ, việc con, chế độ xem, theme sáng/tối đều được lưu trữ bền vững. Tải lại trang (F5) không bao giờ mất dữ liệu.
- **Xuất dữ liệu dự phòng (JSON Export):** Cho phép tải về toàn bộ dữ liệu công việc dưới dạng file `.json` để sao lưu khi cần.

---

## 🛠️ Cấu Trúc Mã Nguồn

| Tập tin | Mô tả chi tiết |
| :--- | :--- |
| [index.html](file:///d:/Vy_baitap1/index.html) | Khung cấu trúc ngữ nghĩa HTML5 chuyên nghiệp: Header, Thanh tiến độ, Form thêm việc, Toolbar, Khung List View, Khung Kanban View, Modal Edit & Subtasks, Footer. |
| [style.css](file:///d:/Vy_baitap1/style.css) | Toàn bộ hệ thống CSS Tokens (hỗ trợ Light/Dark Theme), hiệu ứng Glassmorphism `backdrop-filter`, lưới Kanban Responsive, Badge phân loại màu sắc và hiệu ứng hoạt họa mượt mà. |
| [script.js](file:///d:/Vy_baitap1/script.js) | Toàn bộ logic quản lý State, LocalStorage, đồng hồ thời gian thực, CRUD tác vụ & subtasks, tìm kiếm realtime, lọc đa điều kiện, chuyển cột Kanban và xuất JSON. |

---

## 🚀 Hướng Dẫn Sử Dụng

1. Nhấp đúp chuột mở file [index.html](file:///d:/Vy_baitap1/index.html) bằng bất kỳ trình duyệt web nào (Chrome, Edge, Firefox, Safari...).
2. Trải nghiệm thêm việc với mức độ ưu tiên, hạn chót, chuyển đổi chế độ Kanban và bật Dark Mode!