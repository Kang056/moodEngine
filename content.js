(function() {
    // 避免重複載入
    if (document.getElementById('atmosphere-ui-root')) return;

    // ==========================================
    // 1. 特效核心引擎 (Effect Engine)
    // ==========================================
    const EffectEngine = {
        styleElement: null,
        container: null,
        currentType: null,

        // 產生隨機陰影字串
        createShadows: function(count, colorFunc, widthArea = 100, heightArea = 100) {
            let shadows = [];
            for (let i = 0; i < count; i++) {
                let x = Math.floor(Math.random() * widthArea);
                let y = Math.floor(Math.random() * heightArea);
                let color = colorFunc();
                shadows.push(`${x}vw ${y}vh ${color}`);
                shadows.push(`${x}vw ${y - 100}vh ${color}`);
            }
            return shadows.join(', ');
        },

        clear: function() {
            if (this.styleElement) this.styleElement.remove();
            if (this.container) this.container.remove();
            this.styleElement = null;
            this.container = null;
            this.currentType = null;
        },

        start: function(type) {
            // 如果點擊「關閉」，則清除
            if (type === 'off') {
                this.clear();
                return;
            }

            // 如果已經是當前特效，不做事
            if (this.currentType === type) return;

            this.clear();
            this.currentType = type;

            let config = this.getConfig(type);
            this.injectCSS(config);
            this.createLayers(config);
        },

        // 取得特效參數設定
        getConfig: function(type) {
            switch(type) {
                case 'sakura': // 櫻花 (粉色，飄落旋轉)
                    return {
                        count: [40, 20], 
                        size: ['6px', '9px'],
                        animName: 'anim-sakura',
                        duration: ['18s', '25s'],
                        color: () => `rgba(255, ${160 + Math.random()*40}, ${190 + Math.random()*40}, 0.9)`,
                        keyframes: `
                            0% { transform: translate(0, 0) rotate(0deg); }
                            100% { transform: translate(15vw, 100vh) rotate(360deg); }
                        `
                    };
                case 'firefly': // 螢火蟲 (黃綠色，緩慢向上浮動)
                    return {
                        count: [30, 20],
                        size: ['4px', '6px'],
                        animName: 'anim-firefly',
                        duration: ['10s', '15s'],
                        color: () => `rgba(${200 + Math.random()*55}, 255, 50, ${Math.random() * 0.5 + 0.3})`,
                        keyframes: `
                            0% { transform: translateY(0) scale(1); opacity: 0; }
                            50% { opacity: 1; }
                            100% { transform: translateY(-80vh) scale(0.5); opacity: 0; }
                        `
                    };
                case 'maple': // 楓葉 (紅橘色，翻滾掉落)
                    return {
                        count: [30, 15],
                        size: ['8px', '12px'],
                        animName: 'anim-maple',
                        duration: ['14s', '20s'],
                        color: () => {
                            const c = ['204, 85, 0', '255, 140, 0', '160, 82, 45'];
                            return `rgba(${c[Math.floor(Math.random()*3)]}, 0.9)`;
                        },
                        keyframes: `
                            0% { transform: translate(0, 0) rotate(0deg); }
                            30% { transform: translate(5vw, 30vh) rotate(90deg); }
                            60% { transform: translate(-5vw, 60vh) rotate(180deg); }
                            100% { transform: translate(0, 100vh) rotate(360deg); }
                        `
                    };
                case 'fire': // 火花 (橘紅色，快速向上噴發)
                    return {
                        count: [60, 40],
                        size: ['3px', '5px'],
                        animName: 'anim-fire',
                        duration: ['5s', '8s'], // 速度快
                        color: () => `rgba(255, ${Math.random()*100}, 0, ${Math.random()*0.8 + 0.2})`,
                        keyframes: `
                            0% { transform: translate(0, 100vh) scale(1); opacity: 1; }
                            50% { opacity: 0.8; }
                            100% { transform: translate(${Math.random()*10 - 5}vw, 0vh) scale(0); opacity: 0; }
                        `
                    };
                case 'snow': // 下雪 (白色，緩慢飄落)
                default:
                    return {
                        count: [150, 80],
                        size: ['2px', '3px'],
                        animName: 'anim-snow',
                        duration: ['25s', '20s'],
                        color: () => `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
                        keyframes: `
                            0% { transform: translate(0, 0); }
                            25% { transform: translate(-2vw, 25vh); }
                            50% { transform: translate(2vw, 50vh); }
                            75% { transform: translate(-2vw, 75vh); }
                            100% { transform: translate(0, 100vh); }
                        `
                    };
            }
        },

        injectCSS: function(config) {
            const css = `
                @keyframes ${config.animName} { ${config.keyframes} }
                .atm-layer {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none; z-index: 2147483640;
                }
                .atm-particle {
                    position: absolute; top: 0; left: 0; border-radius: 50%;
                    background: transparent;
                }
            `;
            this.styleElement = document.createElement('style');
            this.styleElement.innerText = css;
            document.head.appendChild(this.styleElement);
        },

        createLayers: function(config) {
            this.container = document.createElement('div');
            this.container.className = 'atm-layer';
            
            config.count.forEach((count, index) => {
                const layer = document.createElement('div');
                layer.className = 'atm-particle';
                layer.style.width = config.size[index];
                layer.style.height = config.size[index];
                layer.style.boxShadow = this.createShadows(count, config.color);
                
                // 修正動畫方向：火花從下往上，其他預設從上往下
                // 這裡的 keyframes 已經在上面定義好了，直接套用
                layer.style.animation = `${config.animName} ${config.duration[index]} linear infinite`;
                this.container.appendChild(layer);
            });
            document.body.appendChild(this.container);
        }
    };

    // ==========================================
    // 2. UI 介面構建 (仿照圖片樣式)
    // ==========================================
    function createUI() {
        const root = document.createElement('div');
        root.id = 'atmosphere-ui-root';
        
        // CSS 樣式：深色玻璃擬態 + 圖片佈局
        const style = document.createElement('style');
        style.innerText = `
            #atmosphere-ui-root {
                position: fixed; top: 20px; left: 20px; z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                user-select: none;
            }
            
            /* 懸浮開關按鈕 (+) */
            .atm-toggle-btn {
                width: 30px; height: 30px; 
                background: #6366f1; /* 圖片中的紫色/藍色 */
                border-radius: 50%; 
                color: white; font-size: 30px; line-height: 24px; text-align: center;
                cursor: grab; 
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                transition: transform 0.2s, background 0.3s;
                position: absolute; top: 0; left: 0; z-index: 2;
            }
            .atm-toggle-btn:active { cursor: grabbing; transform: scale(0.95); }
            .atm-toggle-btn.active { transform: rotate(45deg); background: #4f46e5; }

            /* 主面板 Card */
            .atm-panel {
                position: absolute; top: 32px; left: 0;
                width: 280px;
                background: #0f172a; /* 深藍色背景 */
                border: 1px solid #334155;
                border-radius: 16px;
                padding: 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                display: none; flex-direction: column; gap: 12px;
                opacity: 0; transform: translateY(-10px);
                transition: opacity 0.3s, transform 0.3s;
            }
            .atm-panel.open { display: flex; opacity: 1; transform: translateY(0); }

            /* 按鈕群組 */
            .atm-grid {
                display: flex; gap: 8px; justify-content: space-between;
            }
            .atm-option {
                width: 40px; height: 40px; border-radius: 12px; border: none;
                background: #1e293b; color: #fff; cursor: pointer;
                font-size: 20px; display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            .atm-option:hover { background: #334155; }
            .atm-option.active { background: #6366f1; box-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
        `;
        document.head.appendChild(style);

        // 建立元素結構
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'atm-toggle-btn';
        toggleBtn.innerText = '+';

        const panel = document.createElement('div');
        panel.className = 'atm-panel';

        
        const grid = document.createElement('div');
        grid.className = 'atm-grid';

        // 定義 5 種特效 + 關閉
        const options = [
            { id: 'sakura', icon: '🌸' }, // 櫻
            { id: 'firefly', icon: '✨' }, // 螢 (圖片中的星星/閃光)
            { id: 'maple', icon: '🍁' }, // 楓
            { id: 'snow', icon: '❄️' }, // 雪
            { id: 'fire', icon: '🔥' }, // 火
            { id: 'off', icon: '🚫' }  // 關
        ];

        let activeBtn = null; // 記錄當前按下的按鈕

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'atm-option';
            btn.innerText = opt.icon;
            btn.onclick = () => {
                // UI 切換 active 狀態
                if (activeBtn) activeBtn.classList.remove('active');
                if (opt.id !== 'off') {
                    btn.classList.add('active');
                    activeBtn = btn;
                } else {
                    activeBtn = null;
                }
                
                // 執行特效
                EffectEngine.start(opt.id);
            };
            grid.appendChild(btn);
        });

        

        // 組合面板
        panel.appendChild(grid);
        root.appendChild(toggleBtn);
        root.appendChild(panel);
        document.body.appendChild(root);

        // ==========================================
        // 3. 互動邏輯 (拖曳 + 開關)
        // ==========================================
        let isDragging = false;
        let hasMoved = false;
        let startX, startY, initialLeft, initialTop;

        toggleBtn.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = root.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

            root.style.left = `${initialLeft + dx}px`;
            root.style.top = `${initialTop + dy}px`;
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            
            // 如果只是點擊（沒有拖曳），則切換面板
            if (!hasMoved) {
                toggleBtn.classList.toggle('active');
                if (toggleBtn.classList.contains('active')) {
                    toggleBtn.innerText = '×'; // 變成叉叉
                    panel.classList.add('open');
                } else {
                    toggleBtn.innerText = '+';
                    panel.classList.remove('open');
                }
            }
        });
    }

    createUI();

})();
