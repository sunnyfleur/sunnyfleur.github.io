document.addEventListener('DOMContentLoaded', function() {
  // Tạo các phần tử con trỏ tùy chỉnh
  const cursorOuter = document.createElement('div');
  cursorOuter.classList.add('cursor-outer');
  document.body.appendChild(cursorOuter);

  const cursorInner = document.createElement('div');
  cursorInner.classList.add('cursor-inner');
  document.body.appendChild(cursorInner);

  // Tạo nút bật/tắt hiệu ứng con trỏ
  const cursorToggle = document.createElement('button');
  cursorToggle.classList.add('cursor-toggle');
  cursorToggle.innerHTML = '<i class="ph-bold ph-cursor"></i>';
  cursorToggle.setAttribute('title', 'Bật/tắt hiệu ứng con trỏ');
  document.body.appendChild(cursorToggle);

  // Kiểm tra nếu đã tắt hiệu ứng từ trước
  const cursorEnabled = localStorage.getItem('cursorEnabled') !== 'false';
  
  // Áp dụng trạng thái hiện tại
  if (cursorEnabled) {
    document.body.classList.add('custom-cursor');
    cursorToggle.classList.add('active');
  } else {
    document.body.classList.remove('custom-cursor');
    cursorToggle.classList.remove('active');
    cursorOuter.style.display = 'none';
    cursorInner.style.display = 'none';
  }

  // Xử lý sự kiện khi click vào nút bật/tắt
  cursorToggle.addEventListener('click', function() {
    const isEnabled = document.body.classList.contains('custom-cursor');
    
    if (isEnabled) {
      // Tắt hiệu ứng
      document.body.classList.remove('custom-cursor');
      cursorToggle.classList.remove('active');
      cursorOuter.style.display = 'none';
      cursorInner.style.display = 'none';
      localStorage.setItem('cursorEnabled', 'false');
      
      // Tắt hiệu ứng đuôi sao nếu có
      const trailContainer = document.querySelector('.cursor-trail-container');
      if (trailContainer) {
        trailContainer.style.display = 'none';
      }
    } else {
      // Bật hiệu ứng
      document.body.classList.add('custom-cursor');
      cursorToggle.classList.add('active');
      cursorOuter.style.display = 'block';
      cursorInner.style.display = 'block';
      localStorage.setItem('cursorEnabled', 'true');
      
      // Bật lại hiệu ứng đuôi sao nếu có
      const trailContainer = document.querySelector('.cursor-trail-container');
      if (trailContainer) {
        trailContainer.style.display = 'block';
      }
    }
  });

  // Thêm class cho body
  if (cursorEnabled) {
    // Cập nhật vị trí con trỏ khi di chuyển chuột
    document.addEventListener('mousemove', function(e) {
      cursorOuter.style.left = e.clientX + 'px';
      cursorOuter.style.top = e.clientY + 'px';
      cursorInner.style.left = e.clientX + 'px';
      cursorInner.style.top = e.clientY + 'px';
    });

    // Thêm hiệu ứng khi hover vào phần tử có thể click
    const hoverElements = document.querySelectorAll('a, button, .btn, .menu__link, .socials-square__link, .gallery__item');
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', function() {
        document.body.classList.add('cursor-hover');
      });
      element.addEventListener('mouseleave', function() {
        document.body.classList.remove('cursor-hover');
      });
    });

    // Thêm hiệu ứng khi click
    document.addEventListener('mousedown', function() {
      document.body.classList.add('cursor-click');
    });
    document.addEventListener('mouseup', function() {
      document.body.classList.remove('cursor-click');
    });

    // Hiệu ứng khi chuột không di chuyển trong thời gian dài
    let timeout;
    function resetTimeout() {
      document.body.classList.remove('cursor-inactive');
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.body.classList.add('cursor-inactive');
      }, 5000);
    }

    document.addEventListener('mousemove', resetTimeout);
    resetTimeout();

    // Hiệu ứng đặc biệt cho các phần tử portfolio
    const portfolioItems = document.querySelectorAll('.gallery__item');
    portfolioItems.forEach(item => {
      item.addEventListener('mouseenter', function() {
        cursorOuter.style.mixBlendMode = 'overlay';
        cursorOuter.style.backgroundColor = 'rgba(var(--accent-rgb), 0.1)';
      });
      item.addEventListener('mouseleave', function() {
        cursorOuter.style.mixBlendMode = 'normal';
        cursorOuter.style.backgroundColor = 'transparent';
      });
    });

    // Thêm vài hiệu ứng ngẫu nhiên khi di chuyển chuột nhanh
    let lastX = 0;
    let lastY = 0;
    let isMovingFast = false;

    document.addEventListener('mousemove', function(e) {
      const speed = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
      
      if (speed > 20 && !isMovingFast) {
        isMovingFast = true;
        cursorOuter.style.transitionDuration = '0.1s';
        cursorInner.style.transitionDuration = '0.1s';
      } else if (speed < 10 && isMovingFast) {
        isMovingFast = false;
        cursorOuter.style.transitionDuration = '0.3s';
        cursorInner.style.transitionDuration = '0.3s';
      }
      
      lastX = e.clientX;
      lastY = e.clientY;
    });
  }
}); 