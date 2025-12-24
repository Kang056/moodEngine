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
            if (type === 'off') {
                this.clear();
                return;
            }
            if (this.currentType === type) return;

            this.clear();
            this.currentType = type;

            let config = this.getConfig(type);
            this.injectCSS(config);
            this.createLayers(config);
        },

        getConfig: function(type) {
            switch(type) {
                case 'sakura': 
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
                case 'firefly': 
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
                case 'maple': 
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
                case 'fire': 
                    return {
                        count: [60, 40],
                        size: ['3px', '5px'],
                        animName: 'anim-fire',
                        duration: ['5s', '8s'],
                        color: () => `rgba(255, ${Math.random()*100}, 0, ${Math.random()*0.8 + 0.2})`,
                        keyframes: `
                            0% { transform: translate(0, 100vh) scale(1); opacity: 1; }
                            50% { opacity: 0.8; }
                            100% { transform: translate(${Math.random()*10 - 5}vw, 0vh) scale(0); opacity: 0; }
                        `
                    };
                case 'snow': 
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
                layer.style.animation = `${config.animName} ${config.duration[index]} linear infinite`;
                this.container.appendChild(layer);
            });
            document.body.appendChild(this.container);
        }
    };

    // ==========================================
    // 2. UI 介面構建 (極簡直排版 + SVG ICON)
    // ==========================================
    function createUI() {
        const root = document.createElement('div');
        root.id = 'atmosphere-ui-root';
        
        const style = document.createElement('style');
        style.innerText = `
            #atmosphere-ui-root {
                position: fixed; top: 20px; left: 20px; z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                user-select: none;
            }
            
            /* 懸浮開關按鈕 (改用 Flex 居中 SVG) */
            .atm-toggle-btn {
                width: 40px; height: 40px; 
                background: #6366f1;
                border-radius: 50%; 
                color: white; 
                display: flex; justify-content: center; align-items: center; /* SVG 居中 */
                cursor: grab; 
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s; /* 加入回彈效果 */
                position: absolute; top: 0; left: 0; z-index: 2;
            }
            .atm-toggle-btn:active { cursor: grabbing; transform: scale(0.90); }
            /* 旋轉 45 度，讓 雪花 icon 變成 x */
            .atm-toggle-btn.active { transform: rotate(135deg); background: #4f46e5; }

            /* 主面板 - 極簡長條形 */
            .atm-panel {
                position: absolute; 
                // width: 56px;
                background: #0f172a;
                border: 1px solid #334155;
                border-radius: 20px;
                padding: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                display: none; flex-direction: column; gap: 8px;
                opacity: 0; 
                transition: opacity 0.2s;
            }
            .atm-panel.open { display: flex; opacity: 1; }

            /* 按鈕群組 */
            .atm-grid {
                display: flex; flex-direction: column; gap: 6px;
            }
            
            .atm-option {
                width: 40px; height: 40px;
                border-radius: 12px; border: none;
                background: #1e293b; color: #fff; cursor: pointer;
                font-size: 20px; display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            .atm-option:hover { background: #334155; transform: scale(1.05); }
            .atm-option.active { background: #6366f1; box-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
        `;
        document.head.appendChild(style);

        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'atm-toggle-btn';
        
        // 插入 SVG 圖示 (雪花 icon)
        toggleBtn.innerHTML = `
            <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="64" cy="64" r="64" fill="#6366f1"/>
                
                <g stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="64" cy="64" r="10" fill="white" stroke="none"/>
                    
                    <line x1="64" y1="32" x2="64" y2="16" />
                    <line x1="64" y1="96" x2="64" y2="112" />
                    <line x1="32" y1="64" x2="16" y2="64" />
                    <line x1="96" y1="64" x2="112" y2="64" />
                    
                    <line x1="42" y1="42" x2="30" y2="30" stroke-width="6"/>
                    <line x1="86" y1="42" x2="98" y2="30" stroke-width="6"/>
                    <line x1="42" y1="86" x2="30" y2="98" stroke-width="6"/>
                    <line x1="86" y1="86" x2="98" y2="98" stroke-width="6"/>
                </g>
                
                <circle cx="64" cy="64" r="56" stroke="white" stroke-width="2" opacity="0.2"/>
            </svg>
        `;

        const panel = document.createElement('div');
        panel.className = 'atm-panel';
        
        const grid = document.createElement('div');
        grid.className = 'atm-grid';

        const options = [
            { id: 'sakura', icon: '🌸' },
            { id: 'firefly', icon: '✨' },
            { id: 'maple', icon: '🍁' },
            { id: 'snow', icon: '❄️' },
            { id: 'fire', icon: '🔥' },
            { id: 'off', icon: '🚫' } 
        ];

        let activeBtn = null; 

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'atm-option';
            btn.innerText = opt.icon;
            btn.onclick = () => {
                if (activeBtn) activeBtn.classList.remove('active');
                if (opt.id !== 'off') {
                    btn.classList.add('active');
                    activeBtn = btn;
                } else {
                    activeBtn = null;
                }
                EffectEngine.start(opt.id);
            };
            grid.appendChild(btn);
        });

        panel.appendChild(grid);
        root.appendChild(toggleBtn);
        root.appendChild(panel);
        document.body.appendChild(root);

        // ==========================================
        // 3. 互動邏輯
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
            
            if(panel.classList.contains('open')) {
                updatePanelPosition();
            }
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            
            if (!hasMoved) {
                toggleBtn.classList.toggle('active');
                if (toggleBtn.classList.contains('active')) {
                    // 不需要手動改成 X，CSS 旋轉會處理
                    updatePanelPosition();
                    panel.classList.add('open');
                } else {
                    panel.classList.remove('open');
                }
            }
        });

        function updatePanelPosition() {
            const rootRect = root.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const panelW = 70; 
            const panelH = 290; 
            const gap = 10;

            if (rootRect.bottom + panelH + gap > viewportHeight) {
                panel.style.top = 'auto';
                panel.style.bottom = '50px';
            } else {
                panel.style.top = '50px';
                panel.style.bottom = 'auto';
            }

            if (rootRect.left + panelW > viewportWidth) {
                panel.style.left = 'auto';
                panel.style.right = '0px';
            } else {
                panel.style.left = '0px';
                panel.style.right = 'auto';
            }
        }
    }

    createUI();
})();
