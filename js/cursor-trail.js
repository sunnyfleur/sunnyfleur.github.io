document.addEventListener('DOMContentLoaded', function() {
  // Tạo container cho hiệu ứng theo dõi
  const trailContainer = document.createElement('div');
  trailContainer.classList.add('cursor-trail-container');
  document.body.appendChild(trailContainer);

  // Kiểm tra nếu hiệu ứng con trỏ đã bị tắt
  const cursorEnabled = localStorage.getItem('cursorEnabled') !== 'false';
  if (!cursorEnabled) {
    trailContainer.style.display = 'none';
  }

  // Mảng lưu trữ các điểm trong đuôi
  const trail = [];
  const maxTrail = 20; // Số lượng điểm tối đa trong đuôi

  // Tạo điểm và thêm vào đuôi
  function createTrailPoint(x, y) {
    // Kiểm tra nếu hiệu ứng đã bị tắt
    if (!document.body.classList.contains('custom-cursor')) {
      return;
    }

    const point = document.createElement('div');
    point.classList.add('cursor-trail-point');
    point.style.left = x + 'px';
    point.style.top = y + 'px';
    
    // Kích thước và màu sắc ngẫu nhiên
    const size = Math.random() * 6 + 1;
    const hue = Math.random() * 30 + 30; // Trong phạm vi vàng/cam (30-60)
    
    point.style.width = size + 'px';
    point.style.height = size + 'px';
    point.style.backgroundColor = `hsla(${hue}, 90%, 50%, 0.8)`;
    
    trailContainer.appendChild(point);
    
    // Thêm vào mảng và giới hạn số lượng
    trail.push({
      element: point,
      x: x,
      y: y,
      size: size,
      createdAt: Date.now()
    });
    
    // Xóa các điểm cũ nếu vượt quá số lượng tối đa
    if (trail.length > maxTrail) {
      const oldestPoint = trail.shift();
      trailContainer.removeChild(oldestPoint.element);
    }
  }

  // Cập nhật vị trí và độ mờ của các điểm theo thời gian
  function updateTrail() {
    const now = Date.now();
    trail.forEach((point, index) => {
      const age = now - point.createdAt;
      const maxAge = 1000; // Thời gian tồn tại tối đa (ms)
      
      // Tính toán độ mờ dựa trên tuổi
      const opacity = 1 - age / maxAge;
      
      // Cập nhật style nếu điểm vẫn còn tồn tại
      if (opacity > 0) {
        point.element.style.opacity = opacity;
        
        // Thêm hiệu ứng thu nhỏ dần
        const scale = 1 - (age / maxAge) * 0.5;
        point.element.style.transform = `scale(${scale})`;
      }
    });
    
    requestAnimationFrame(updateTrail);
  }

  // Theo dõi di chuyển chuột để tạo điểm mới
  let lastX = 0;
  let lastY = 0;
  let lastTimeCreated = 0;

  document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    // Chỉ tạo điểm mới sau mỗi 40ms (tương đương ~25 điểm/giây) 
    // và khi chuột di chuyển đủ xa
    const distance = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
    
    if (now - lastTimeCreated > 40 && distance > 5) {
      createTrailPoint(e.clientX, e.clientY);
      lastX = e.clientX;
      lastY = e.clientY;
      lastTimeCreated = now;
    }
  });

  // Bắt đầu vòng lặp cập nhật
  updateTrail();
}); 