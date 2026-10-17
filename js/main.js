/**
 * Weather Planner - Main JavaScript
 * Kiến trúc: Module hóa (StorageManager, WeatherModule, ItineraryModule, DestinationModule, UIManager, App)
 * Tính năng:
 *  - Lưu/khôi phục thành phố và danh sách lịch trình qua LocalStorage (saveStorage, loadStorage)
 *  - Tự động hiển thị lại thành phố chọn cuối cùng khi tải lại trang
 *  - Bộ tính năng danh sách: Tìm kiếm, Lọc, Sắp xếp trên Title, Phân trang (10, 20, 50, all)
 *  - Thêm, Đổi màu 'Đã đến', Xóa với CSS Transition
 */

// ==========================================================================
// 1. STORAGE MODULE (Quản lý lưu trữ LocalStorage)
// ==========================================================================
const StorageManager = {
  KEYS: {
    SELECTED_CITY: "wp_selected_city",
    ITINERARY_LIST: "wp_itinerary_list"
  },

  // Lưu trữ dữ liệu an toàn vào LocalStorage
  saveStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Lỗi khi lưu dữ liệu với khóa "${key}":`, error);
    }
  },

  // Tải dữ liệu từ LocalStorage với giá trị dự phòng mặc định
  loadStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Lỗi khi đọc dữ liệu với khóa "${key}". Sử dụng giá trị mặc định.`, error);
      return defaultValue;
    }
  },

  // Phương thức tiện ích riêng cho thành phố
  saveCity(cityName) {
    this.saveStorage(this.KEYS.SELECTED_CITY, cityName);
  },

  loadCity(defaultCity = "Đà Lạt") {
    return this.loadStorage(this.KEYS.SELECTED_CITY, defaultCity);
  },

  // Phương thức tiện ích riêng cho danh sách lịch trình
  saveItinerary(itineraryList) {
    this.saveStorage(this.KEYS.ITINERARY_LIST, itineraryList);
  },

  loadItinerary(defaultList = []) {
    return this.loadStorage(this.KEYS.ITINERARY_LIST, defaultList);
  }
};

// ==========================================================================
// 2. WEATHER MODULE (Quản lý dữ liệu thời tiết 3 thành phố)
// ==========================================================================
const WeatherModule = {
  CITIES_WEATHER: [
    {
      city: "Biên Hòa",
      province: "Đồng Nai",
      temperature: 33,
      condition: "Nắng ráo & Nắng gắt",
      icon: "☀️",
      humidity: "62%",
      windSpeed: "11 km/h",
      feelsLike: "36°C",
      rainChance: "15%",
      tip: "Thời tiết Biên Hòa ban ngày khá nắng nóng, thích hợp du lịch sinh thái rừng tràm hoặc công viên giải trí dưới bóng mát."
    },
    {
      city: "Đà Lạt",
      province: "Lâm Đồng",
      temperature: 19,
      condition: "Se lạnh & Sương mù nhẹ",
      icon: "⛅",
      humidity: "86%",
      windSpeed: "14 km/h",
      feelsLike: "18°C",
      rainChance: "25%",
      tip: "Khí hậu Đà Lạt se lạnh mát mẻ quanh năm, hãy chuẩn bị áo ấm để dạo chợ đêm hoặc săn mây trên đỉnh đồi."
    },
    {
      city: "Vũng Tàu",
      province: "Bà Rịa - Vũng Tàu",
      temperature: 29,
      condition: "Nắng nhẹ & Gió biển mát",
      icon: "🌤️",
      humidity: "72%",
      windSpeed: "20 km/h",
      feelsLike: "31°C",
      rainChance: "10%",
      tip: "Gió biển mát rượi, sóng êm và trời trong xanh. Rất lý tưởng để tắm biển Bãi Sau và ngắm hoàng hôn ngọn Hải Đăng."
    }
  ],

  getWeatherData(cityName) {
    return this.CITIES_WEATHER.find(item => item.city === cityName) || this.CITIES_WEATHER[1];
  }
};

// ==========================================================================
// 3. DESTINATIONS DATA & MODULE (Tìm kiếm, Lọc, Sắp xếp trên Title, Phân trang)
// ==========================================================================
const DestinationModule = {
  DATA: [
    // --- BIÊN HÒA (ĐỒNG NAI) ---
    { id: 101, title: "Khu Du Lịch Bửu Long", city: "Biên Hòa", location: "Biên Hòa, Đồng Nai", category: "Nghỉ dưỡng", weatherTag: "☀️ Nắng ấm", desc: "Được mệnh danh là 'Vịnh Hạ Long thu nhỏ của miền Nam' với hồ nước trong xanh và núi đá vôi thơ mộng." },
    { id: 102, title: "Văn Miếu Trấn Biên", city: "Biên Hòa", location: "Biên Hòa, Đồng Nai", category: "Văn hóa / Di tích", weatherTag: "☀️ Nắng ráo", desc: "Văn miếu đầu tiên được xây dựng tại xứ Đàng Trong, nơi tôn vinh các bậc hiền tài và truyền thống hiếu học." },
    { id: 103, title: "Khu Du Lịch Sinh Thái Vườn Xoài", city: "Biên Hòa", location: "Biên Hòa, Đồng Nai", category: "Nghỉ dưỡng", weatherTag: "☀️ Nắng ấm", desc: "Không gian dã ngoại xanh mát với các hoạt động chèo thuyền, trượt cỏ và sở thú bán hoang dã phong phú." },
    { id: 104, title: "Chùa Bửu Đức", city: "Biên Hòa", location: "Biên Hòa, Đồng Nai", category: "Văn hóa / Di tích", weatherTag: "☀️ Nắng dịu", desc: "Ngôi chùa Nam tông cổ kính ẩn mình giữa rừng cây xanh ngút ngàn, tĩnh lặng và thanh tịnh." },
    { id: 105, title: "Khu Du Lịch Thác Giang Điền", city: "Biên Hòa", location: "Gần Biên Hòa, Đồng Nai", category: "Nghỉ dưỡng", weatherTag: "☀️ Nắng đẹp", desc: "Dòng thác tự nhiên hùng vĩ với bãi cỏ rộng lớn, lý tưởng để cắm trại, picnic cuối tuần cùng gia đình." },
    { id: 106, title: "Chùa Ông (Thất Phủ Cổ Miếu)", city: "Biên Hòa", location: "Biên Hòa, Đồng Nai", category: "Văn hóa / Di tích", weatherTag: "☀️ Nắng ráo", desc: "Ngôi chùa cổ nhất của người Hoa ở Nam Bộ với kiến trúc điêu khắc chạm trổ gỗ đá tinh xảo hơn 300 năm tuổi." },

    // --- ĐÀ LẠT (LÂM ĐỒNG) ---
    { id: 201, title: "Đỉnh Langbiang Huyền Thoại", city: "Đà Lạt", location: "Lạc Dương, Đà Lạt", category: "Vùng núi", weatherTag: "🌬️ Se lạnh", desc: "Nóc nhà của cao nguyên Lâm Viên, nơi bạn có thể đi xe Jeep lên đỉnh Radar ngắm toàn cảnh thung lũng Suối Vàng." },
    { id: 202, title: "Hồ Xuân Hương & Quảng Trường Lâm Viên", city: "Đà Lạt", location: "Trung tâm Đà Lạt", category: "Nghỉ dưỡng", weatherTag: "⛅ Mát mẻ", desc: "Trái tim của xứ sở ngàn hoa với biểu tượng nụ hoa Atiso khổng lồ và hồ nước phẳng lặng mộng mơ." },
    { id: 203, title: "Dinh III Bảo Đại", city: "Đà Lạt", location: "Đà Lạt, Lâm Đồng", category: "Văn hóa / Di tích", weatherTag: "⛅ Mát lành", desc: "Biệt điện mùa hè cổ điển theo kiến trúc Pháp của vị hoàng đế cuối cùng triều Nguyễn nằm giữa rừng thông cổ thụ." },
    { id: 204, title: "Thung Lũng Tình Yêu & Đồi Mộng Mơ", city: "Đà Lạt", location: "Đà Lạt, Lâm Đồng", category: "Nghỉ dưỡng", weatherTag: "⛅ Dịu mát", desc: "Thắng cảnh nổi tiếng với đồi thông, mê cung tình yêu, hồ Đa Thiện và thảm hoa muôn sắc rực rỡ quanh năm." },
    { id: 205, title: "Thiền Viện Trúc Lâm & Hồ Tuyền Lâm", city: "Đà Lạt", location: "Đà Lạt, Lâm Đồng", category: "Văn hóa / Di tích", weatherTag: "⛅ Thanh tịnh", desc: "Một trong ba thiền viện lớn nhất nước ta, tựa lưng vào núi Phượng Hoàng và hướng tầm nhìn ra hồ Tuyền Lâm xanh biếc." },
    { id: 206, title: "Thác Datanla & Cáp Trượt Xuyên Rừng", city: "Đà Lạt", location: "Đèo Prenn, Đà Lạt", category: "Vùng núi", weatherTag: "🌬️ Mát rượi", desc: "Trải nghiệm máng trượt alpine coaster dài nhất Đông Nam Á băng qua rừng thông và thác nước cuồn cuộn." },
    { id: 207, title: "Đồi Chè Cầu Đất & Săn Mây", city: "Đà Lạt", location: "Cầu Đất, Đà Lạt", category: "Vùng núi", weatherTag: "⛅ Sương mù", desc: "Điểm săn mây bình minh kỳ ảo với đồi chè bát ngát cả trăm năm tuổi và những cánh quạt gió khổng lồ." },
    { id: 208, title: "Chợ Đêm Đà Lạt (Chợ Âm Phủ)", city: "Đà Lạt", location: "Trung tâm Đà Lạt", category: "Văn hóa / Di tích", weatherTag: "🌙 Se lạnh", desc: "Thiên đường ẩm thực đường phố về đêm với bánh tráng nướng giòn rụm, sữa đậu nành nóng hổi và đồ len thủ công." },

    // --- VŨNG TÀU (BÀ RỊA - VŨNG TÀU) ---
    { id: 301, title: "Tượng Chúa Kitô Vua (Núi Nhỏ)", city: "Vũng Tàu", location: "Núi Nhỏ, Vũng Tàu", category: "Văn hóa / Di tích", weatherTag: "🌤️ Gió biển", desc: "Tượng Chúa dang tay lớn nhất châu Á trên đỉnh Tao Phùng, leo 133 bậc thang trong lòng tượng ngắm toàn cảnh biển." },
    { id: 302, title: "Bãi Sau (Bãi Thùy Vân)", city: "Vũng Tàu", location: "TP. Vũng Tàu", category: "Biển đảo", weatherTag: "☀️ Nắng biển", desc: "Bãi tắm dài và sôi động nhất Vũng Tàu với bờ cát trắng phẳng mịn, sóng biển êm đềm và hàng dừa vi vu gió." },
    { id: 303, title: "Ngọn Hải Đăng Cổ Vũng Tàu", city: "Vũng Tàu", location: "Đỉnh Núi Nhỏ, Vũng Tàu", category: "Văn hóa / Di tích", weatherTag: "🌤️ Lộng gió", desc: "Một trong những ngọn hải đăng cổ xưa nhất Đông Nam Á xây từ năm 1862, địa điểm ngắm hoàng hôn biển tuyệt đẹp." },
    { id: 304, title: "Mũi Nghinh Phong & Cổng Trời", city: "Vũng Tàu", location: "Bãi Dứa, Vũng Tàu", category: "Biển đảo", weatherTag: "🌬️ Lộng gió", desc: "Mũi đất đón gió bốn mùa vươn dài ra biển khơi với chiếc 'Cổng trời' check-in nhìn thẳng ra đại dương xanh thẳm." },
    { id: 305, title: "Bạch Dinh (Villa Blanche)", city: "Vũng Tàu", location: "Núi Lớn, Vũng Tàu", category: "Văn hóa / Di tích", weatherTag: "☀️ Nắng ấm", desc: "Dinh thự nghỉ dưỡng kiến trúc Pháp cuối thế kỷ 19 nhìn ra biển Bãi Trước, lưu giữ nhiều hiện vật cổ gốm sứ quý giá." },
    { id: 306, title: "Hồ Mây Park (Cáp Treo Núi Lớn)", city: "Vũng Tàu", location: "Núi Lớn, Vũng Tàu", category: "Nghỉ dưỡng", weatherTag: "⛅ Mát mẻ", desc: "Tổ hợp vui chơi giải trí trên đỉnh núi cao với tuyến cáp treo vượt biển, hồ nước nhân tạo và công viên nước." },
    { id: 307, title: "Bãi Trước (Bãi Tầm Dương)", city: "Vũng Tàu", location: "TP. Vũng Tàu", category: "Biển đảo", weatherTag: "☀️ Nắng nhẹ", desc: "Công viên ven biển xanh mát, nơi ngắm bình minh và dạo bộ ngắm tàu thuyền tấp nập neo đậu." }
  ],

  state: {
    selectedCity: "Đà Lạt",
    searchQuery: "",
    category: "all",
    sortTitle: "asc",
    itemsPerPage: 10,
    currentPage: 1
  },

  getFilteredData() {
    let list = this.DATA.filter(item => item.city === this.state.selectedCity);

    // 1. Tìm kiếm theo Title & Location & Desc
    if (this.state.searchQuery.trim() !== "") {
      const q = this.state.searchQuery.trim().toLowerCase();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    }

    // 2. Lọc danh mục
    if (this.state.category !== "all") {
      list = list.filter(item => item.category === this.state.category);
    }

    // 3. Sắp xếp trên Title (A-Z, Z-A)
    list.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, "vi", { sensitivity: "base" });
      return this.state.sortTitle === "asc" ? cmp : -cmp;
    });

    return list;
  }
};

// ==========================================================================
// 4. ITINERARY MODULE (Quản lý danh sách lịch trình chuyến đi cá nhân)
// ==========================================================================
const ItineraryModule = {
  items: [],

  // Mẫu mặc định khi lần đầu sử dụng
  DEFAULT_ITEMS: [
    { id: "it-1", name: "Ghé thăm Thác Datanla", time: "9:00 AM", visited: false },
    { id: "it-2", name: "Dạo quanh Hồ Xuân Hương", time: "3:30 PM", visited: true }
  ],

  init() {
    this.items = StorageManager.loadItinerary(this.DEFAULT_ITEMS);
  },

  getAll() {
    return this.items;
  },

  add(name, time) {
    const trimmedName = name.trim();
    const trimmedTime = time.trim() || "Chưa đặt giờ";

    if (!trimmedName) {
      alert("Vui lòng nhập tên địa điểm!");
      return null;
    }

    const newItem = {
      id: "it-" + Date.now(),
      name: trimmedName,
      time: trimmedTime,
      visited: false
    };

    this.items.unshift(newItem);
    StorageManager.saveItinerary(this.items);
    return newItem;
  },

  toggleVisited(id) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.visited = !item.visited;
      StorageManager.saveItinerary(this.items);
    }
  },

  delete(id) {
    this.items = this.items.filter(item => item.id !== id);
    StorageManager.saveItinerary(this.items);
  }
};

// ==========================================================================
// 5. UI MANAGER MODULE (renderUI - Phụ trách cập nhật giao diện người dùng)
// ==========================================================================
const UIManager = {
  // DOM References
  dom: {
    citySelector: document.getElementById("city-selector"),
    currentCity: document.getElementById("current-city"),
    weatherIcon: document.getElementById("weather-icon"),
    temperature: document.getElementById("temperature"),
    conditionBadge: document.getElementById("condition-badge"),
    humidity: document.getElementById("humidity"),
    windSpeed: document.getElementById("wind-speed"),
    feelsLike: document.getElementById("feels-like"),
    rainChance: document.getElementById("rain-chance"),
    weatherTipText: document.getElementById("weather-tip-text"),

    itineraryForm: document.getElementById("itinerary-form"),
    itineraryName: document.getElementById("itinerary-name"),
    itineraryTime: document.getElementById("itinerary-time"),
    itineraryList: document.getElementById("itinerary-list"),
    itineraryStats: document.getElementById("itinerary-stats"),

    searchInput: document.getElementById("search-input"),
    clearSearchBtn: document.getElementById("clear-search-btn"),
    categoryFilter: document.getElementById("category-filter"),
    sortTitle: document.getElementById("sort-title"),
    itemsPerPage: document.getElementById("items-per-page"),
    destinationsContainer: document.getElementById("destinations-container"),
    totalCountBadge: document.getElementById("total-count-badge"),
    paginationInfo: document.getElementById("pagination-info"),
    pageNumbersContainer: document.getElementById("page-numbers"),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    clockDisplay: document.getElementById("clock-display"),
    dateDisplay: document.getElementById("date-display")
  },

  // Khởi tạo hiển thị toàn bộ UI
  renderUI() {
    this.renderWeatherUI();
    this.renderItineraryUI();
    this.renderDestinationsUI();
  },

  // 5.1 Cập nhật hiển thị thời tiết (Cột trái)
  renderWeatherUI() {
    const selectedCity = DestinationModule.state.selectedCity;
    const data = WeatherModule.getWeatherData(selectedCity);
    if (!data) return;

    if (this.dom.citySelector && this.dom.citySelector.value !== selectedCity) {
      this.dom.citySelector.value = selectedCity;
    }

    this.dom.currentCity.textContent = `${data.city}, ${data.province}`;
    this.dom.temperature.textContent = data.temperature;
    this.dom.conditionBadge.textContent = data.condition;
    this.dom.weatherIcon.textContent = data.icon;
    this.dom.humidity.textContent = data.humidity;
    this.dom.windSpeed.textContent = data.windSpeed;
    this.dom.feelsLike.textContent = data.feelsLike;
    this.dom.rainChance.textContent = data.rainChance;
    this.dom.weatherTipText.textContent = data.tip;

    // Hiệu ứng nhẹ khi đổi nhiệt độ
    this.dom.temperature.parentElement.classList.add("temp-updated");
    setTimeout(() => {
      this.dom.temperature.parentElement.classList.remove("temp-updated");
    }, 400);
  },

  // 5.2 Cập nhật hiển thị lịch trình
  renderItineraryUI(newItemId = null) {
    if (!this.dom.itineraryList) return;

    const list = ItineraryModule.getAll();
    const total = list.length;
    const visitedCount = list.filter(item => item.visited).length;

    if (this.dom.itineraryStats) {
      this.dom.itineraryStats.textContent = `${visitedCount}/${total} đã ghé thăm`;
    }

    if (total === 0) {
      this.dom.itineraryList.innerHTML = `
        <div class="itinerary-empty">
          <span>Chưa có địa điểm nào trong lịch trình. Hãy nhập hoặc chọn từ danh sách bên dưới!</span>
        </div>
      `;
      return;
    }

    this.dom.itineraryList.innerHTML = list.map(item => {
      const isNew = item.id === newItemId ? "new-item-enter" : "";
      const visitedClass = item.visited ? "visited" : "";
      const visitedLabel = item.visited ? "✔️ Đã đến" : "Chưa đến";

      return `
        <div class="itinerary-item ${visitedClass} ${isNew}" id="${item.id}" data-id="${item.id}">
          <div class="itinerary-item-info">
            <span class="itinerary-item-title">${this.escapeHtml(item.name)}</span>
            <span class="itinerary-item-time">⏰ ${this.escapeHtml(item.time)}</span>
          </div>
          <div class="itinerary-item-actions">
            <button type="button" class="btn-toggle-visited" onclick="App.toggleItineraryVisited('${item.id}')" title="Đánh dấu đã đến hoặc chưa">
              ${visitedLabel}
            </button>
            <button type="button" class="btn-delete-itinerary" onclick="App.deleteItineraryItem('${item.id}')" title="Xóa khỏi lịch trình">
              🗑️ Xóa
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  // 5.3 Cập nhật hiển thị danh sách địa điểm gợi ý & phân trang
  renderDestinationsUI() {
    const list = DestinationModule.getFilteredData();
    const total = list.length;
    const currentCity = DestinationModule.state.selectedCity;
    this.dom.totalCountBadge.textContent = `${currentCity}: ${total} điểm đến`;

    // Tính toán phân trang: 10, 20, 50, all
    let paginatedList = [];
    let totalPages = 1;
    const itemsPerPage = DestinationModule.state.itemsPerPage;

    if (itemsPerPage === "all") {
      paginatedList = list;
      totalPages = 1;
      DestinationModule.state.currentPage = 1;
    } else {
      const limit = parseInt(itemsPerPage, 10);
      totalPages = Math.max(1, Math.ceil(total / limit));
      if (DestinationModule.state.currentPage > totalPages) {
        DestinationModule.state.currentPage = totalPages;
      }
      const startIndex = (DestinationModule.state.currentPage - 1) * limit;
      paginatedList = list.slice(startIndex, startIndex + limit);
    }

    // Hiển thị Card
    if (paginatedList.length === 0) {
      this.dom.destinationsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏖️</div>
          <h3>Không tìm thấy địa điểm tại ${this.escapeHtml(currentCity)}</h3>
          <p>Vui lòng thử điều chỉnh từ khóa tìm kiếm hoặc đổi danh mục khám phá.</p>
        </div>
      `;
    } else {
      this.dom.destinationsContainer.innerHTML = paginatedList.map(item => `
        <article class="destination-card" tabindex="0">
          <div>
            <div class="card-top">
              <span class="card-badge-category">${this.escapeHtml(item.category)}</span>
              <span class="card-weather-tag">${this.escapeHtml(item.weatherTag)}</span>
            </div>
            <h3 class="card-title">${this.escapeHtml(item.title)}</h3>
            <div class="card-location">📍 ${this.escapeHtml(item.location)}</div>
          </div>
          <p class="card-desc">${this.escapeHtml(item.desc)}</p>
          <div class="card-footer">
            <span class="card-tag">✨ Điểm đến lý tưởng</span>
            <button type="button" class="card-action-btn" onclick="App.quickAddItinerary('${this.escapeHtml(item.title)}')">+ Lên lịch</button>
          </div>
        </article>
      `).join("");
    }

    // Cập nhật phân trang
    this.renderPaginationUI(total, totalPages);
  },

  // 5.4 Cập nhật thanh phân trang
  renderPaginationUI(totalCount, totalPages) {
    const itemsPerPage = DestinationModule.state.itemsPerPage;
    const currentPage = DestinationModule.state.currentPage;
    const currentCity = DestinationModule.state.selectedCity;

    if (totalCount === 0 || itemsPerPage === "all") {
      this.dom.paginationInfo.textContent = itemsPerPage === "all" ? `Đang hiển thị tất cả ${totalCount} địa điểm tại ${currentCity}` : "Không có kết quả";
      this.dom.prevBtn.disabled = true;
      this.dom.nextBtn.disabled = true;
      this.dom.pageNumbersContainer.innerHTML = "";
      return;
    }

    const limit = parseInt(itemsPerPage, 10);
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalCount);
    this.dom.paginationInfo.textContent = `Hiển thị ${start} - ${end} trên ${totalCount} địa điểm tại ${currentCity}`;

    this.dom.prevBtn.disabled = currentPage <= 1;
    this.dom.nextBtn.disabled = currentPage >= totalPages;

    this.dom.pageNumbersContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.type = "button";
      pageBtn.className = `page-btn ${i === currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.setAttribute("aria-label", `Trang ${i}`);
      pageBtn.addEventListener("click", () => {
        DestinationModule.state.currentPage = i;
        this.renderDestinationsUI();
      });
      this.dom.pageNumbersContainer.appendChild(pageBtn);
    }
  },

  // Tiện ích escape chống XSS
  escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#039;");
  }
};

// ==========================================================================
// 6. MAIN APP ORCHESTRATOR (Entry Point & Global Handlers)
// ==========================================================================
const App = {
  init() {
    this.initClock();
    this.loadInitialState();
    this.initEventListeners();
    UIManager.renderUI();
  },

  // Tải trạng thái khởi tạo từ LocalStorage (loadStorage)
  loadInitialState() {
    // 1. Khôi phục thành phố được chọn sau cùng
    const savedCity = StorageManager.loadCity("Đà Lạt");
    DestinationModule.state.selectedCity = savedCity;

    // 2. Khôi phục danh sách lịch trình đã lưu
    ItineraryModule.init();
  },

  initClock() {
    const updateTime = () => {
      const now = new Date();
      UIManager.dom.clockDisplay.textContent = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      UIManager.dom.dateDisplay.textContent = now.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "short", day: "numeric" });
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  // Gắn các sự kiện UI
  initEventListeners() {
    // 1. Sự kiện đổi thành phố -> lưu vào LocalStorage (saveStorage)
    if (UIManager.dom.citySelector) {
      UIManager.dom.citySelector.addEventListener("change", (e) => {
        const newCity = e.target.value;
        DestinationModule.state.selectedCity = newCity;
        DestinationModule.state.currentPage = 1;

        // Lưu thành phố chọn cuối cùng vào LocalStorage
        StorageManager.saveCity(newCity);

        // Cập nhật lại UI
        UIManager.renderWeatherUI();
        UIManager.renderDestinationsUI();
      });
    }

    // 2. Thêm mục lịch trình
    if (UIManager.dom.itineraryForm) {
      UIManager.dom.itineraryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = UIManager.dom.itineraryName.value;
        const time = UIManager.dom.itineraryTime.value;

        const newItem = ItineraryModule.add(name, time);
        if (newItem) {
          UIManager.renderItineraryUI(newItem.id);
          UIManager.dom.itineraryName.value = "";
          UIManager.dom.itineraryTime.value = "";
          UIManager.dom.itineraryName.focus();
        }
      });
    }

    // 3. Tìm kiếm
    UIManager.dom.searchInput.addEventListener("input", (e) => {
      DestinationModule.state.searchQuery = e.target.value;
      UIManager.dom.clearSearchBtn.style.display = DestinationModule.state.searchQuery ? "block" : "none";
      DestinationModule.state.currentPage = 1;
      UIManager.renderDestinationsUI();
    });

    UIManager.dom.clearSearchBtn.addEventListener("click", () => {
      UIManager.dom.searchInput.value = "";
      DestinationModule.state.searchQuery = "";
      UIManager.dom.clearSearchBtn.style.display = "none";
      DestinationModule.state.currentPage = 1;
      UIManager.dom.searchInput.focus();
      UIManager.renderDestinationsUI();
    });

    // 4. Lọc danh mục
    UIManager.dom.categoryFilter.addEventListener("change", (e) => {
      DestinationModule.state.category = e.target.value;
      DestinationModule.state.currentPage = 1;
      UIManager.renderDestinationsUI();
    });

    // 5. Sắp xếp trên Title
    UIManager.dom.sortTitle.addEventListener("change", (e) => {
      DestinationModule.state.sortTitle = e.target.value;
      UIManager.renderDestinationsUI();
    });

    // 6. Phân trang: 10, 20, 50, all
    UIManager.dom.itemsPerPage.addEventListener("change", (e) => {
      DestinationModule.state.itemsPerPage = e.target.value === "all" ? "all" : parseInt(e.target.value, 10);
      DestinationModule.state.currentPage = 1;
      UIManager.renderDestinationsUI();
    });

    // 7. Chuyển trang Prev / Next
    UIManager.dom.prevBtn.addEventListener("click", () => {
      if (DestinationModule.state.currentPage > 1) {
        DestinationModule.state.currentPage--;
        UIManager.renderDestinationsUI();
      }
    });

    UIManager.dom.nextBtn.addEventListener("click", () => {
      const list = DestinationModule.getFilteredData();
      const itemsPerPage = DestinationModule.state.itemsPerPage;
      const limit = itemsPerPage === "all" ? list.length : parseInt(itemsPerPage, 10);
      const totalPages = Math.ceil(list.length / limit);
      if (DestinationModule.state.currentPage < totalPages) {
        DestinationModule.state.currentPage++;
        UIManager.renderDestinationsUI();
      }
    });
  },

  // Phương thức public thao tác với lịch trình
  toggleItineraryVisited(id) {
    ItineraryModule.toggleVisited(id);
    UIManager.renderItineraryUI();
  },

  deleteItineraryItem(id) {
    const elem = document.getElementById(id);
    if (elem) {
      elem.style.transition = "all 0.25s ease";
      elem.style.opacity = "0";
      elem.style.transform = "translateX(24px)";
      setTimeout(() => {
        ItineraryModule.delete(id);
        UIManager.renderItineraryUI();
      }, 250);
    } else {
      ItineraryModule.delete(id);
      UIManager.renderItineraryUI();
    }
  },

  quickAddItinerary(destTitle) {
    if (UIManager.dom.itineraryName && UIManager.dom.itineraryTime) {
      UIManager.dom.itineraryName.value = `Ghé thăm ${destTitle}`;
      UIManager.dom.itineraryTime.value = "9:00 AM";
      UIManager.dom.itineraryName.focus();
      UIManager.dom.itineraryForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
};

// Đưa App ra global scope để các inline handler (onclick) có thể truy cập sạch sẽ
window.App = App;

// Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
