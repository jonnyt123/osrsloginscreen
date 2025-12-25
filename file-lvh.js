// Simulation toggle for local testing without a backend.
// Default is OFF. Enable by visiting the page with `?simulate=1` or `?simulate=true`.
const _simParam = new URLSearchParams(window.location.search).get('simulate');
const DEFAULT_SIMULATE = false;
const SIMULATE_LOGIN = _simParam === null ? DEFAULT_SIMULATE : (_simParam === '' || /^(1|true|yes)$/i.test(_simParam));

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');

    // Inline message element shown below the form (non-blocking)
    let msgEl = document.getElementById('loginMessage');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = 'loginMessage';
        msgEl.style.marginTop = '8px';
        msgEl.style.fontSize = '14px';
        msgEl.style.minHeight = '18px';
        const loginBox = document.querySelector('.login-box');
        if (loginBox) loginBox.appendChild(msgEl);
    }

    // Progress bar elements
    const progressContainer = document.getElementById('progressContainer');
    const progressFiller = document.getElementById('progressFiller');
    const progressLabel = document.getElementById('progressLabel');

    function showProgress(durationMs = 1000) {
        if (progressContainer) progressContainer.style.display = 'block';
        if (!progressFiller || !progressLabel) return;
        let start = performance.now();
        function tick(now) {
            let pct = Math.min(100, Math.floor(((now - start) / durationMs) * 100));
            progressFiller.style.width = pct + '%';
            progressLabel.textContent = `Saving preferences - ${pct}%`;
            if (pct < 100) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function hideProgress() {
        if (progressContainer) progressContainer.style.display = 'none';
        if (progressFiller) {
            progressFiller.style.width = '0%';
        }
        if (progressLabel) progressLabel.textContent = 'Saving preferences - 0%';
    }

    // Session select: cycle names when button clicked
    const sessionButton = document.getElementById('sessionButton');
    const sessionNames = ['bspwm','sowm','Plasma (X11)','Plasma (Wayland)'];
    const sessionKeys = ['bspwm','sowm','plasma','plasmawayland'];
    let sessionIndex = 0;
    if (sessionButton) {
        sessionButton.addEventListener('click', () => {
            sessionIndex = (sessionIndex + 1) % sessionNames.length;
            sessionButton.innerHTML = sessionNames[sessionIndex] + '<div class="small-desc">Click to switch</div>';
        });
    }

    // Music toggle (controls audio element if present)
    const musicToggle = document.getElementById('musicToggle');
    const audioEl = document.getElementById('backgroundAudio');
    if (musicToggle) {
        musicToggle.style.cursor = 'pointer';
        musicToggle.addEventListener('click', () => {
            if (!audioEl) return;
            if (audioEl.paused) {
                audioEl.play();
                musicToggle.src = 'assets/images/components/musicOn.png';
                localStorage.setItem('unmuted', 'true');
            } else {
                audioEl.pause();
                musicToggle.src = 'assets/images/components/musicOff.png';
                localStorage.setItem('unmuted', 'false');
            }
        });
    }

    // Background selector and persistent config
    const backgrounds = [
        'assets/images/backgrounds/default.jpg',
        'assets/images/backgrounds/aKingdomDivided.jpg',
        'assets/images/backgrounds/chambersOfXeric.jpg',
        'assets/images/backgrounds/dragonSlayerII.jpg',
        'assets/images/backgrounds/fossilIsland.jpg',
        'assets/images/backgrounds/halloween.jpg',
        'assets/images/backgrounds/halloween2.jpg',
        'assets/images/backgrounds/inferno.jpg',
        'assets/images/backgrounds/kebosLowlands.jpg',
        'assets/images/backgrounds/monkeyMadnessII.jpg',
        'assets/images/backgrounds/nex.jpg',
        'assets/images/backgrounds/songOfTheElves.jpg'
    ];

    function applyBackground(path) {
        const loginBox = document.querySelector('.login-box');
        if (!loginBox) return;
        // Keep the login container overlay as first image, then the background image underneath
        loginBox.style.backgroundImage = `url('assets/images/components/loginContainer.png'), url('${path}')`;
        localStorage.setItem('background', path);
    }

    const bgLeft = document.getElementById('bgLeft');
    const bgRight = document.getElementById('bgRight');

    let currentBackground = localStorage.getItem('background') || backgrounds[0];
    let bgIndex = Math.max(0, backgrounds.indexOf(currentBackground));
    if (bgIndex === -1) bgIndex = 0;
    applyBackground(backgrounds[bgIndex]);

    if (bgLeft) bgLeft.addEventListener('click', () => {
        bgIndex = (bgIndex - 1 + backgrounds.length) % backgrounds.length;
        applyBackground(backgrounds[bgIndex]);
    });
    if (bgRight) bgRight.addEventListener('click', () => {
        bgIndex = (bgIndex + 1) % backgrounds.length;
        applyBackground(backgrounds[bgIndex]);
    });

    // Respect hideBackgroundSelect preference
    const hideBgSelect = localStorage.getItem('hideBackgroundSelect') === 'true';
    const bgArrows = document.querySelector('.background-arrows');
    if (hideBgSelect && bgArrows) bgArrows.style.display = 'none';

    // Settings modal handlers
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const rememberCbx = document.getElementById('rememberUsernameCbx');
    const hideUsernameCbx = document.getElementById('hideUsernameCbx');
    const hideBgCbx = document.getElementById('hideBackgroundSelectCbx');

    // initialize settings from localStorage
    if (rememberCbx) rememberCbx.checked = localStorage.getItem('rememberUsername') === 'true';
    if (hideUsernameCbx) hideUsernameCbx.checked = localStorage.getItem('hideUsername') === 'true';
    if (hideBgCbx) hideBgCbx.checked = localStorage.getItem('hideBackgroundSelect') === 'true';

    function openSettings() {
        if (settingsModal) {
            settingsModal.setAttribute('aria-hidden', 'false');
        }
    }
    function closeSettings() {
        if (settingsModal) {
            settingsModal.setAttribute('aria-hidden', 'true');
        }
    }

    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => {
        if (rememberCbx) localStorage.setItem('rememberUsername', rememberCbx.checked.toString());
        if (hideUsernameCbx) localStorage.setItem('hideUsername', hideUsernameCbx.checked.toString());
        if (hideBgCbx) {
            localStorage.setItem('hideBackgroundSelect', hideBgCbx.checked.toString());
            if (bgArrows) bgArrows.style.display = hideBgCbx.checked ? 'none' : 'flex';
        }
        closeSettings();
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = usernameEl.value.trim();
        const password = passwordEl.value;
        msgEl.textContent = '';

        if (!username || !password) {
            msgEl.style.color = '#ff6666';
            msgEl.textContent = 'Please enter both username and password.';
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        msgEl.style.color = '#ffffff';
        msgEl.textContent = 'Logging in...';
        // show progress bar
        showProgress(SIMULATE_LOGIN ? 1400 : 5000);

        // If SIMULATE_LOGIN is true, emulate a network response for local testing.
        if (SIMULATE_LOGIN) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 600));
                // Simulate failure when username is literally "fail"
                if (username.toLowerCase() === 'fail') {
                    msgEl.style.color = '#ff6666';
                    msgEl.textContent = 'Login failed (simulated).';
                    hideProgress();
                    return;
                }

                msgEl.style.color = '#66ff66';
                msgEl.textContent = 'Login successful (simulated) — redirecting...';
                setTimeout(() => window.location.assign('/'), 700);
            } catch (err) {
                console.error('Simulated login error:', err);
                msgEl.style.color = '#ff6666';
                msgEl.textContent = 'Simulated network error.';
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                hideProgress();
            }
            return;
        }

        // Example fetch-based flow. Replace `/api/login` with a real endpoint.
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const text = await res.text();
                msgEl.style.color = '#ff6666';
                msgEl.textContent = text || 'Login failed. Check credentials.';
                return;
            }

            // Success: show visual success and optionally redirect
            msgEl.style.color = '#66ff66';
            msgEl.textContent = 'Login successful — redirecting...';
            setTimeout(() => window.location.assign('/'), 700);
        } catch (err) {
            console.error('Login error:', err);
            msgEl.style.color = '#ff6666';
            msgEl.textContent = 'Network error — try again.';
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            hideProgress();
        }
    });

    // Initialize runes canvas animation
    try {
        const canvas = document.getElementById('runesCanvas');
        if (canvas && canvas.getContext) {
            new LoginScreenAnimation(canvas);
        }
    } catch (e) {
        console.error('Runes animation failed to start', e);
    }
});

// --- Ported LoginScreenRunes animation (adapted from React component) ---
class Sprite {
    constructor(pixels, width, height) {
        this.pixels = pixels;
        this.width = width;
        this.height = height;
    }
}
Sprite.CACHE = null;

class LoginScreenAnimation {
    constructor(canvas) {
        const ctx = canvas.getContext('2d');
        if (!canvas || !ctx) throw new Error('Failed to get Canvas 2D rendering context');
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.pixels = new Int32Array(this.width * this.height);
        this.rgba = new Uint8ClampedArray(this.pixels.length * 4);
        this.field1234 = new Int32Array(256);
        this.field1220 = new Int32Array(256);
        this.field1217 = new Int32Array(256);
        this.field1222 = new Int32Array(256);
        this.field1219 = new Int32Array(256);
        this.field1233 = new Int32Array(32768);
        this.field1230 = new Int32Array(32768);
        this.field1225 = new Int32Array(32768);
        this.field1214 = new Int32Array(32768);

        for (let i = 0; i < 64; ++i) this.field1220[i] = i * 0x40000;
        for (let i = 0; i < 64; ++i) this.field1220[i + 64] = i * 0x400 + 0xff0000;
        for (let i = 0; i < 64; ++i) this.field1220[i + 128] = i * 4 + 0xffff00;
        for (let i = 0; i < 64; ++i) this.field1220[i + 192] = 0xffffff;
        for (let i = 0; i < 64; ++i) this.field1217[i] = i * 0x400;
        for (let i = 0; i < 64; ++i) this.field1217[i + 64] = i * 4 + 0x00ff00;
        for (let i = 0; i < 64; ++i) this.field1217[i + 128] = i * 0x40000 + 0xffff;
        for (let i = 0; i < 64; ++i) this.field1217[i + 192] = 0xffffff;
        for (let i = 0; i < 64; ++i) this.field1222[i] = i * 4;
        for (let i = 0; i < 64; ++i) this.field1222[i + 64] = i * 0x40000 + 0xff;
        for (let i = 0; i < 64; ++i) this.field1222[i + 128] = i * 0x400 + 0xff00ff;
        for (let i = 0; i < 64; ++i) this.field1222[i + 192] = 0xffffff;

        this.method2215(undefined);
        this.loadSprites().then(() => this.animate());

        this.animationFrame = null;
        this.lastTimestamp = Date.now();
        this.cycle = 0;
        this.destroyed = false;

        // handle resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.pixels = new Int32Array(this.width * this.height);
        this.rgba = new Uint8ClampedArray(this.pixels.length * 4);
    }

    async loadSprites() {
        if (Sprite.CACHE != null) return;
        Sprite.CACHE = [];
        const spriteNames = ['0.png','1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png','11.png'];
        const tmpCanvas = document.createElement('canvas');
        const tmpCtx = tmpCanvas.getContext('2d');
        for (let name of spriteNames) {
            const img = new Image();
            img.src = `assets/sprites/${name}`;
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    tmpCanvas.width = img.width;
                    tmpCanvas.height = img.height;
                    tmpCtx.clearRect(0,0,img.width,img.height);
                    tmpCtx.drawImage(img,0,0);
                    const data = tmpCtx.getImageData(0,0,img.width,img.height).data;
                    const rgba = new Int32Array(data.buffer);
                    const mask = new Uint8Array(rgba.length/1);
                    for (let i=0;i<rgba.length;i++) mask[i] = (data[i*4+3]) & 0xff;
                    Sprite.CACHE.push(new Sprite(mask, img.width, img.height));
                    resolve();
                };
                img.onerror = reject;
            });
        }
    }

    animate() {
        if (this.destroyed) return;
        let numFrames = Math.floor((Date.now() - this.lastTimestamp) / 20);
        this.lastTimestamp += numFrames * 20;
        if (numFrames > 5) numFrames = 1;
        if (numFrames > 0) {
            while (numFrames-- > 0) {
                this.cycle++;
                this.draw(-20, this.cycle);
                this.draw(this.width - 108, this.cycle);
            }
            for (let i = 0; i < this.pixels.length; i++) {
                let p = this.pixels[i];
                this.rgba[i * 4] = (p >> 16) & 0xff;
                this.rgba[i * 4 + 1] = (p >> 8) & 0xff;
                this.rgba[i * 4 + 2] = p & 0xff;
                this.rgba[i * 4 + 3] = (p >> 24) & 0xff;
            }
            this.ctx.putImageData(new ImageData(this.rgba, this.width, this.height), 0, 0);
        }
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.destroyed = true;
        if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    }

    // The methods below are ported without modification (names preserved from original)
    draw(xOffset, cycle) {
        if (this.field1231 === undefined) this.field1231 = cycle;
        let var3 = cycle - this.field1231;
        if (var3 >= 256) var3 = 0;
        this.field1231 = cycle;
        if (var3 > 0) this.method2207(var3, cycle);
        this.method2213(xOffset);
    }

    method2207(var1, cycle) {
        this.field1229 = (this.field1229 || 0) + (var1 << 7);
        if (this.field1229 > this.field1233.length) {
            this.field1229 -= this.field1233.length;
            if (Sprite.CACHE != null) this.method2215(Sprite.CACHE[Math.floor(Math.random()*Sprite.CACHE.length)]);
        }

        let var2 = 0;
        let var3 = var1 << 7;
        let var4 = (256 - var1) << 7;

        let var6;
        for (let var5 = 0; var5 < var4; ++var5) {
            var6 = this.field1225[var3 + var2] - Math.floor((this.field1233[(var2 + this.field1229) & (this.field1233.length - 1)] * var1)/6);
            if (var6 < 0) var6 = 0;
            this.field1225[var2++] = var6;
        }

        let var15 = 10;
        var6 = 128 - var15;
        let var7, var10;
        for (var7 = 256 - var1; var7 < 256; ++var7) {
            let var8 = var7 << 7;
            for (let var9 = 0; var9 < 128; ++var9) {
                var10 = Math.floor(Math.random() * 100.0);
                this.field1225[var8 + var9] = var10 < 50 && var9 > var15 && var9 < var6 ? 0xff : 0;
            }
        }

        if ((this.field1235 || 0) > 0) this.field1235 -= var1 * 4;
        if ((this.field1224 || 0) > 0) this.field1224 -= var1 * 4;

        if ((this.field1235 || 0) === 0 && (this.field1224 || 0) === 0) {
            var7 = Math.floor(Math.random() * Math.floor(2000/var1));
            if (var7 === 0) this.field1235 = 0x400;
            if (var7 === 1) this.field1224 = 0x400;
        }

        for (var7 = 0; var7 < 256 - var1; ++var7) this.field1234[var7] = this.field1234[var7 + var1];
        for (var7 = 256 - var1; var7 < 256; ++var7) {
            this.field1234[var7] = Math.floor(Math.sin(this.field1218 / 14.0) * 16.0 + Math.sin(this.field1218 / 15.0) * 14.0 + Math.sin(this.field1218 / 16.0) * 12.0);
            ++this.field1218;
        }

        this.field1226 = (this.field1226 || 0) + var1;
        var7 = ((cycle & 1) + var1) >> 1;
        if (var7 > 0) {
            let var16 = 128; let var17 = 2; var10 = 128 - var17 - var17;
            let var11, var12, var13;
            for (var11 = 0; var11 < this.field1226 * 100; ++var11) {
                var12 = Math.floor(Math.random() * var10) + var17;
                var13 = Math.floor(Math.random() * var16) + var16;
                this.field1225[var12 + (var13 << 7)] = 192;
            }

            this.field1226 = 0;

            for (var11 = 0; var11 < 256; ++var11) {
                var12 = 0; var13 = var11 << 7;
                for (var14 = -var7; var14 < 128; ++var14) {
                    if (var14 + var7 < 128) var12 += this.field1225[var7 + var13 + var14];
                    if (var14 - (var7 + 1) >= 0) var12 -= this.field1225[var13 + var14 - (var7 + 1)];
                    if (var14 >= 0) this.field1214[var13 + var14] = Math.floor(var12 / (Math.imul(var7,2) + 1));
                }
            }

            for (var11 = 0; var11 < 128; ++var11) {
                var12 = 0;
                for (var13 = -var7; var13 < 256; ++var13) {
                    var14 = var13 << 7;
                    if (var7 + var13 < 256) var12 += this.field1214[var11 + var14 + var7 * 128];
                    if (var13 - (var7 + 1) >= 0) var12 -= this.field1214[var14 + var11 - (var7 + 1) * 128];
                    if (var13 >= 0) this.field1225[var14 + var11] = var12 / (var7 * 2 + 1);
                }
            }
        }
    }

    method2212(var1, var2, var3) {
        let var4 = 256 - var3;
        return (((var3 * (var2 & 0x00ff00) + var4 * (var1 & 0x00ff00)) & 0xff0000) + ((var4 * (var1 & 0xff00ff) + var3 * (var2 & 0xff00ff)) & 0xff00ff00)) >> 8;
    }

    method2213(var1) {
        let var2 = this.field1219.length;
        if ((this.field1235 || 0) > 0) this.method2224(this.field1235, this.field1217);
        else if ((this.field1224 || 0) > 0) this.method2224(this.field1224, this.field1222);
        else for (let var3 = 0; var3 < var2; ++var3) this.field1219[var3] = this.field1220[var3];
        this.method2214(var1);
    }

    method2224(var1, var2) {
        let var3 = this.field1219.length;
        for (let var4 = 0; var4 < var3; ++var4) {
            if (var1 > 768) {
                this.field1219[var4] = this.method2212(this.field1220[var4], var2[var4], 0x400 - var1);
            } else if (var1 > 256) {
                this.field1219[var4] = var2[var4];
            } else {
                this.field1219[var4] = this.method2212(var2[var4], this.field1220[var4], 256 - var1);
            }
        }
    }

    method2214(var1) {
        let var2 = 0;
        for (let var3 = 1; var3 < 0xff; ++var3) {
            let var4 = ((256 - var3) * this.field1234[var3]) >> 8;
            let var5 = var4 + var1;
            let var6 = 0;
            let var7 = 128;
            if (var5 < 0) { var6 = -var5; var5 = 0; }
            if (var5 + 128 >= this.width) var7 = this.width - var5;
            let i = var5 + (var3 + 8) * this.width;
            var2 += var6;
            for (let var9 = var6; var9 < var7; ++var9) {
                let var10 = this.field1225[var2++];
                let col = i % this.width;
                if (var10 !== 0 && col >= 0 && col < this.width) {
                    this.pixels[i++] = ((var10 & 0xff) << 24) | (this.field1219[var10] & 0xffffff);
                } else { ++i; }
            }
            var2 += 128 - var7;
        }
    }

    method2215(sprite) {
        for (let i = 0; i < this.field1233.length; ++i) this.field1233[i] = 0;
        let row;
        for (let i = 0; i < 5000; ++i) {
            row = Math.floor(Math.random() * 128.0 * 256.0);
            this.field1233[row] = Math.floor(Math.random() * 256.0);
        }
        let col, j;
        for (let i = 0; i < 20; ++i) {
            for (row = 1; row < 0xff; ++row) {
                for (col = 1; col < 127; ++col) {
                    j = col + (row << 7);
                    this.field1230[j] = (this.field1233[j + 128] + this.field1233[j - 128] + this.field1233[j + 1] + this.field1233[j - 1]) >> 2;
                }
            }
            let tmp = this.field1233; this.field1233 = this.field1230; this.field1230 = tmp;
        }

        if (sprite != null) {
            let i = 0;
            for (let row = 0; row < sprite.height; ++row) for (let col = 0; col < sprite.width; ++col) if (sprite.pixels[i++] !== 0) this.field1233[col + 16 + ((row + 16) << 7)] = 0;
        }
    }
}
