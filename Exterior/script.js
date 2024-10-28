(() => {
    const frame = document.getElementById('frame');
    const card = document.getElementById('cardElement');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const fullscreenBtn = document.getElementById('fullscreenbtn');
    const toggle360Btn = document.getElementById('toggle360Btn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const spinner = document.getElementById('loadingSpinner');
    const toggleView = document.getElementById('toggleView');
    const zoomControls = document.querySelector('.zoom-controls');
    const chnageframelink = document.querySelector('.navigationlink');

    const totalFrames = 72;
    let currentFrame = 0;
    let isDragging = false;//the image is being dragged
    let startMove = 0;// X-coordinate where dragging starts
    let startMoveY = 0; // Y-coordinate where dragging starts (for zoom dragging)
    let frameOffsetX = 0;//X-offset for zoom drag movement
    let frameOffsetY = 0;

    let is360Playing = false;
    let autoRotateInterval;

    let zoomFactor = 1; //initially zoom level
    const zoomStep = 0.2; // The zoom increases/decreases per step
    const maxZoom = 5;
    const minZoom = 1;

    let isZoomed = false;
    let initialPinchDistance = null;// Initial distance between two touch points
    let initialZoomFactor = 1;
    let cumulativeRotation = 0;
    let hasAutoRotatedOnce = false;

    function updateFrame() {
        frame.src = toggleView.checked ? `range-open/${currentFrame}.jpg` : `range/${currentFrame}.jpg`;
    }

    toggleView.addEventListener('change', () => {
        currentFrame = 0;
        updateFrame();
    });

    function rotateLoader(direction) {
        const rotationAngle = 360 / totalFrames;
        cumulativeRotation += (direction === 'right' ? -rotationAngle : rotationAngle);
        spinner.style.transform = `rotate(${cumulativeRotation}deg)`;
    }

    // Ensure image stays within the container on zoom
    function limitImagePosition() {
        const containerRect = card.getBoundingClientRect();
        const imageRect = frame.getBoundingClientRect();

        const maxOffsetX = (imageRect.width - containerRect.width) / 2 / zoomFactor;
        const maxOffsetY = (imageRect.height - containerRect.height) / 2 / zoomFactor;
        // Limit the offsets
        frameOffsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, frameOffsetX));
        frameOffsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, frameOffsetY));

        frame.style.transform = `scale(${zoomFactor}) translate(${frameOffsetX}px, ${frameOffsetY}px)`;
    }

    // Updates the zoom level and applies limits to the image's position
    function updateZoom() {
        limitImagePosition();
        if (zoomFactor === minZoom) {
            frameOffsetX = 0; //here reset the variables
            frameOffsetY = 0;
            frame.style.cursor = '';
        } else {
            frame.style.cursor = 'all-scroll';
            const containerRect = card.getBoundingClientRect();
            const imageRect = frame.getBoundingClientRect();
            const maxOffsetX = (imageRect.width - containerRect.width) / 5 / zoomFactor;
            const maxOffsetY = (imageRect.height - containerRect.height) / 5 / zoomFactor;

            frameOffsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, frameOffsetX));
            frameOffsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, frameOffsetY));
        }
        frame.style.transform = `scale(${zoomFactor}) translate(${frameOffsetX}px, ${frameOffsetY}px)`;
    }

    function autoRotate360() {
        autoRotateInterval = setInterval(() => {
            currentFrame = (currentFrame % totalFrames) + 1;
            updateFrame();
            rotateLoader('left');
        }, 100);
    }

    function stopAutoRotate360() {
        clearInterval(autoRotateInterval);
    }

    function autoRotateOnce() {
        if (hasAutoRotatedOnce) return;

        let frameCount = 0;
        autoRotateOnceInterval = setInterval(() => {
            currentFrame = (currentFrame % totalFrames) + 1;
            updateFrame();
            rotateLoader('left');
            frameCount++;
            if (frameCount >= totalFrames) {
                clearInterval(autoRotateOnceInterval);
                hasAutoRotatedOnce = true;
            }
        }, 100);
    }

    function stopAutoRotateOnce() {
        clearInterval(autoRotateOnceInterval);
    }

    window.addEventListener('load', () => {
        autoRotateOnce();
        frame.addEventListener('mousedown', () => {
            stopAutoRotateOnce();
            toggle360Btn.style.backgroundColor = '#555555';
            leftArrow.style.backgroundColor = '#555555';
            rightArrow.style.backgroundColor = '#555555';
            zoomInBtn.style.background = '#555555';
            zoomOutBtn.style.background = '#555555';
        });
        frame.addEventListener('touchstart', () => {
            stopAutoRotateOnce();
        });
    });

    // Event listener for stopping rotation when mousedown (or touchstart on mobile) on the frame
    frame.addEventListener('mousedown', () => {
        if (is360Playing) {
            stopAutoRotate360();
            toggle360Btn.style.backgroundColor = "green";
            is360Playing = false;
        }
    });

    frame.addEventListener('touchstart', () => {
        if (is360Playing) {
            stopAutoRotate360();
            toggle360Btn.style.backgroundColor = '#555555';
            is360Playing = false;
        }
    });

    frame.addEventListener('mousedown', (event) => {
        isDragging = true;
        startMove = event.clientX;
        startMoveY = event.clientY;
        event.preventDefault();
        frame.style.cursor = 'grabbing';
        zoomControls.style.display = 'none';
        chnageframelink.style.display = 'none';
    });

    window.addEventListener('mousemove', (event) => {
        if (!isDragging) return; //here condition false because when player rotate play in mouse move

        if (isZoomed) {
            const dx = (event.clientX - startMove) / zoomFactor;
            const dy = (event.clientY - startMoveY) / zoomFactor;
            frameOffsetX += dx;
            frameOffsetY += dy;
            limitImagePosition();
            startMove = event.clientX;
            startMoveY = event.clientY;
        } else {
            const currentMove = event.clientX;
            const playMove = currentMove - startMove;

            if (playMove < -10) {
                currentFrame = (currentFrame % totalFrames) + 1;
                startMove = currentMove;
                updateFrame();
                rotateLoader('left');
            } else if (playMove > 10) {
                currentFrame = (currentFrame - 1 + totalFrames) % totalFrames;
                startMove = currentMove;
                updateFrame();
                rotateLoader('right');
            }
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        frame.style.cursor = 'grab';
        zoomControls.style.display = 'flex';
        chnageframelink.style.display = 'flex';
    });

    //  checks if there are two touch points (fingers) on the screen
    frame.addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) {
            // Pinch to zoom functionality
            initialPinchDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
            );
            initialZoomFactor = zoomFactor;
        } else {
            isDragging = true;
            startMove = event.touches[0].clientX;
            startMoveY = event.touches[0].clientY;
        }
        event.preventDefault();
        zoomControls.style.display = 'none';
        chnageframelink.style.display = 'none';
    });

    frame.addEventListener('touchmove', (event) => {
        if (event.touches.length === 2) {
            const pinchDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
            );
            const scaleChange = pinchDistance / initialPinchDistance;
            zoomFactor = Math.min(maxZoom, Math.max(minZoom, initialZoomFactor * scaleChange));
            isZoomed = zoomFactor > 1;
            updateZoom();
        } else if (isDragging) {

            if (isZoomed) {
                const dx = (event.touches[0].clientX - startMove) / zoomFactor;
                const dy = (event.touches[0].clientY - startMoveY) / zoomFactor;
                frameOffsetX += dx;
                frameOffsetY += dy;
                limitImagePosition();
                startMove = event.touches[0].clientX;
                startMoveY = event.touches[0].clientY;
            } else {
                const currentMove = event.touches[0].clientX;
                const playMove = currentMove - startMove;

                if (playMove < -10) {
                    currentFrame = (currentFrame % totalFrames) + 1;
                    startMove = currentMove;
                    updateFrame();
                    rotateLoader('left');
                } else if (playMove > 10) {
                    currentFrame = (currentFrame - 1 + totalFrames) % totalFrames;
                    startMove = currentMove;
                    updateFrame();
                    rotateLoader('right');
                }
            }
        }
        event.preventDefault();
    });

    toggle360Btn.addEventListener('click', () => {
        if (is360Playing) {
            stopAutoRotate360();
            toggle360Btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
            toggle360Btn.style.backgroundColor = '#555555';
        } else {
            autoRotate360();
            toggle360Btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
            toggle360Btn.style.backgroundColor = 'green';
        }
        is360Playing = !is360Playing;
    });

    frame.addEventListener('touchend', () => {
        isDragging = false;
        zoomControls.style.display = 'flex';
        chnageframelink.style.display = 'flex';
    });

    rightArrow.addEventListener('click', () => {
        currentFrame = (currentFrame - 1 + totalFrames) % totalFrames;
        updateFrame();
        rotateLoader('left');
        rightArrow.style.backgroundColor = 'green';
        leftArrow.style.backgroundColor = '';
    });

    leftArrow.addEventListener('click', () => {
        currentFrame = (currentFrame % totalFrames) + 1;
        updateFrame();
        rotateLoader('right');
        leftArrow.style.backgroundColor = 'green';
        rightArrow.style.backgroundColor = '';
    });

    zoomInBtn.addEventListener('click', () => {
        zoomFactor = Math.min(maxZoom, zoomFactor + zoomStep);
        isZoomed = zoomFactor > 1;
        updateZoom();
        zoomInBtn.style.backgroundColor = 'green';
        zoomOutBtn.style.background = '';
    });

    zoomOutBtn.addEventListener('click', () => {
        zoomFactor = Math.max(minZoom, zoomFactor - zoomStep);
        isZoomed = zoomFactor > 1;
        updateZoom();
        zoomOutBtn.style.backgroundColor = 'green';
        zoomInBtn.style.background = '';
    });

    frame.addEventListener('wheel', (event) => {
        if (event.deltaY < 0) {
            zoomFactor = Math.min(maxZoom, zoomFactor + zoomStep);
        } else {
            zoomFactor = Math.max(minZoom, zoomFactor - zoomStep);
        }
        isZoomed = zoomFactor > 1;
        updateZoom();
        event.preventDefault();
    });

    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            fullscreenBtn.style.backgroundColor = '';
        } else {
            document.getElementById('imageContainer').requestFullscreen();
            fullscreenBtn.style.backgroundColor = 'green';
        }
    });

    document.addEventListener('fullscreenchange', () => {
        !document.fullscreenElement ? fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>' : fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
    });

    updateFrame();
})();
