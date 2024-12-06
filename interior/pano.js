(() => {

    const leftbtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    let isAutoRotating = false; // Track the auto-rotation state
    const rotationStep = 40; // Rotation step size for manual viewer control

    const viewer = pannellum.viewer('panoramaViewer', {
        "type": "equirectangular",
        "panorama": "2.jpg", 
        "autoLoad": true,
        "showZoomCtrl": false,
        "compass": false,
        "yaw": 0,
        "pitch": -15,
        "hfov": 110,
        "maxHfov": 130,
        "minHfov": 20,
        "keyboardZoom": true,
        "showFullscreenCtrl": false,
        "disableContextMenu": true,
        "autoRotate": -2,
        "multiResMinHfov": 20,
        "hotSpots": [
            {
                "pitch": -13,
                "yaw": 35,
                "type": "info",
                "text": "Steering Wheel",
                "clickHandlerFunc": () => {
                    showPopup("This is the Steering Wheel. <a href='https://en.wikipedia.org/wiki/Car_controls' target='_blank'>Learn more</a>");
                }
            },
            {
                "pitch": -10,
                "yaw": -20,
                "type": "info",
                "text": "Dashboard",
                "clickHandlerFunc": () => {
                    showPopup("This is the dashboard area.<a href='https://en.wikipedia.org/wiki/Dashboard' target='_blank'>Learn more</a>");
                }
            },
            {
                "pitch": -22,
                "yaw": 55,
                "type": "info",
                "text": "Controls",
                "clickHandlerFunc": () => {
                    showPopup("These are the controls on the driver side.");
                }
            },
            {
                "pitch": -35,
                "yaw": 1,
                "type": "info",
                "text": "Gear Box",
                "clickHandlerFunc": () => {
                    showPopup("This is the Gear Box. <a href='https://en.wikipedia.org/wiki/Transmission_(mechanical_device)' target='_blank'>Learn more</a>");
                }
            },
            {
                "pitch": -75,
                "yaw": 10,
                "type": "info",
                "text": "Hand Brake",
                "clickHandlerFunc": () => {
                    showPopup("This is the hand brake.");
                }
            },
            {
                "pitch": 5,
                "yaw": 120,
                "type": "info",
                "text": "Front Seat",
                "clickHandlerFunc": () => {
                    showPopup("This is the front seat.");
                }
            },
            {
                "pitch": -5,
                "yaw": 180,
                "type": "info",
                "text": "Rear Seat",
                "clickHandlerFunc": () => {
                    showPopup("This is the rear seat.");
                }
            }
        ],
    });

    autoRotateBtn.addEventListener("click", () => {
        if (!isAutoRotating) {
            viewer.startAutoRotate(-15);
            isAutoRotating = true;
            autoRotateBtn.style.backgroundColor = 'green';
        } else {
            viewer.stopAutoRotate();
            isAutoRotating = false;
            autoRotateBtn.style.backgroundColor = '#555555';
        }
    });

    function rotateViewer(yawChange, pitchChange) {
        viewer.setYaw(viewer.getYaw() + yawChange);
        viewer.setPitch(viewer.getPitch() + pitchChange);
    }

    function updateButtonColor(activeBtn, otherBtns) {
        activeBtn.style.backgroundColor = 'green';
        otherBtns.forEach(btn => btn.style.backgroundColor = '');
    }

    leftbtn.addEventListener('click', () => {
        rotateViewer(-rotationStep, 0);
        updateButtonColor(leftbtn, [rightBtn, upBtn, downBtn, zoomInBtn, zoomOutBtn]);
    });

    rightBtn.addEventListener('click', () => {
        rotateViewer(rotationStep, 0);
        updateButtonColor(rightBtn, [leftbtn, upBtn, downBtn, zoomInBtn, zoomOutBtn]);
    });

    upBtn.addEventListener('click', () => {
        rotateViewer(0, rotationStep);
        updateButtonColor(upBtn, [leftbtn, rightBtn, downBtn, zoomInBtn, zoomOutBtn]);
    });

    downBtn.addEventListener('click', () => {
        rotateViewer(0, -rotationStep);
        updateButtonColor(downBtn, [leftbtn, rightBtn, upBtn, zoomInBtn, zoomOutBtn]);
    });

    zoomInBtn.addEventListener('click', () => {
        let currentFov = viewer.getHfov();
        viewer.setHfov(currentFov - 20);
        updateButtonColor(zoomInBtn, [zoomOutBtn]);
    });

    zoomOutBtn.addEventListener('click', () => {
        let currentFov = viewer.getHfov();
        viewer.setHfov(currentFov + 20);
        updateButtonColor(zoomOutBtn, [zoomInBtn]);
    });

    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            fullscreenBtn.style.backgroundColor = '';
        } else {
            document.getElementById('playerContainer').requestFullscreen();
            fullscreenBtn.style.backgroundColor = 'green';
        }
    });

    document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.innerHTML = document.fullscreenElement ?
            '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
    });

    function showPopup(content) {
        popupText.innerHTML = content;
        popupContainer.style.display = 'block';
    }

    closePopup.addEventListener('click', () => {
        popupContainer.style.display = 'none';
    });

    popupContainer.addEventListener('click', (event) => {
        if (event.target === popupContainer) {
            popupContainer.style.display = 'none';
        }
    });

})();