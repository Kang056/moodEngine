(function() {
    // 防止重複執行：如果已經下雪了，就不再執行
    if (document.querySelector('.snow-overlay')) return;

    // 1. 定義產生隨機雪花陰影的函數
    function createSnowShadow(n) {
        let shadowValue = '';
        for (let i = 0; i < n; i++) {
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let alpha = (Math.floor(Math.random() * 10) / 15) + 0.3;
            let color = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;

            shadowValue += `${x}vw ${y}vh ${color}`;
            shadowValue += `, ${x}vw ${y - 100}vh ${color}`;

            if (i < n - 1) {
                shadowValue += ', ';
            }
        }
        return shadowValue;
    }

    // 2. 產生數據
    const snow1 = createSnowShadow(200);
    const snow2 = createSnowShadow(150);
    const snow3 = createSnowShadow(100);
    const snow4 = createSnowShadow(50);

    // 3. 建立 CSS
    const cssStyles = `
        @keyframes anim-snow-1 {
            0% { transform: translate(0, 0); }
            20% { transform: translate(2vw, 20vh); }
            40% { transform: translate(-2vw, 40vh); }
            60% { transform: translate(2vw, 60vh); }
            80% { transform: translate(-2vw, 80vh); }
            100% { transform: translate(0, 100vh); }
        }
        @keyframes anim-snow-2 {
            0% { transform: translate(0, 0); }
            25% { transform: translate(-2vw, 25vh); }
            50% { transform: translate(1vw, 50vh); }
            75% { transform: translate(-2vw, 75vh); }
            100% { transform: translate(0, 100vh); }
        }
        @keyframes anim-snow-3 {
            0% { transform: translate(0, 0); }
            15% { transform: translate(2vw, 15vh); }
            30% { transform: translate(-1vw, 30vh); }
            45% { transform: translate(3vw, 45vh); }
            60% { transform: translate(-3vw, 60vh); }
            75% { transform: translate(1vw, 75vh); }
            90% { transform: translate(-1vw, 90vh); }
            100% { transform: translate(0, 100vh); }
        }
        @keyframes anim-snow-4 {
            0% { transform: translate(0, 0); }
            30% { transform: translate(1.5vw, 30vh); }
            60% { transform: translate(-1.5vw, 60vh); }
            100% { transform: translate(0, 100vh); }
        }

        .snow-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            pointer-events: none;
            z-index: 2147483647; /* 設定為最大值，確保覆蓋所有元素 */
            overflow: hidden;
        }

        .snow-layer {
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 50%;
            background: transparent;
        }

        .snow-layer-1 { width: 1px; height: 1px; box-shadow: ${snow1}; animation: anim-snow-1 25s linear infinite; opacity: 0.6; }
        .snow-layer-2 { width: 2px; height: 2px; box-shadow: ${snow2}; animation: anim-snow-2 20s linear infinite; opacity: 0.8; }
        .snow-layer-3 { width: 3px; height: 3px; box-shadow: ${snow3}; animation: anim-snow-3 15s linear infinite; }
        .snow-layer-4 { width: 4px; height: 4px; box-shadow: ${snow4}; animation: anim-snow-4 10s linear infinite; filter: blur(1px); }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = cssStyles;
    document.head.appendChild(styleSheet);

    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow-overlay';
    
    for(let i=1; i<=4; i++){
        let layer = document.createElement('div');
        layer.className = `snow-layer snow-layer-${i}`;
        snowContainer.appendChild(layer);
    }

    document.body.appendChild(snowContainer);
})();
