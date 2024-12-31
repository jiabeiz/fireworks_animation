// 获取canvas元素和上下文
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

// 设置canvas尺寸为全屏
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 烟花粒子类
class Particle {
    constructor(x, y, color, fadeColor, size) {
        this.x = x;
        this.y = y;
        this.initialColor = color;
        this.fadeColor = fadeColor;
        this.radius = size;//Math.random() * 2 + 1;
        this.velocity = {
            x: Math.random() * 6 - 3,
            y: Math.random() * 6 - 3
        };
        this.life = 100;
        this.initialLife = 100;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getCurrentColor();
        ctx.fill();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
        this.velocity.y += 0.05; // 模拟重力
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        this.radius *= 0.99; // 粒子逐渐变小
    }

    getCurrentColor() {
        const lifeRatio = this.life / this.initialLife;
        return this.interpolateColor(this.initialColor, this.fadeColor, 1 - lifeRatio);
    }

    interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));
        const alpha = 1 - factor; // 粒子逐渐变透明
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
/*
class Particle {
    constructor(x, y, color, fadeColor, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.fadeColor = fadeColor;
        this.size = size;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.gravity = 0.05;
        this.life = 100;
        this.alpha = 1;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += this.gravity;
        this.life--;
        this.alpha = this.life / 100;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}
*/

// 烟花类
class Firework {
    /**
     * 创建一个新的烟花实例
     */
    constructor() {
        /** @type {number} 烟花的 x 坐标 */
        this.x = Math.random() * canvas.width;
        /** @type {number} 烟花的 y 坐标，初始位置在画布底部 */
        this.y = canvas.height;

        /** @type {string[]} 烟花的颜色方案 */
        this.colors = this.getRandomColorScheme();
        /** @type {string} 烟花的主色 */
        this.mainColor = this.colors[0];

        ///** @type {string} 烟花的颜色 */
        //this.color = this.getRandomSoftColor();

        /** @type {{x: number, y: number}} 烟花的速度 */
        this.velocity = {
            x: Math.random() * 2 - 1,  // 减小水平速度
            y: -Math.random() * 5 - 6 // 增加垂直速度，使烟花飞得更高
        };

        /** @type {{x: number, y: number}} 烟花的加速度向量 */
        this.acceleration = {
            x: (Math.random() - 0.5) * 0.025, // 水平加速度
            y: Math.random() * 0.02 + 0.04   // 垂直加速度（包括重力）
        };

        this.targetX = Math.random() * canvas.width; // 烟花爆炸的随机目标宽度
        this.targetY = Math.random() * canvas.height * 0.667; // 烟花爆炸的随机目标高度
        /** @type {Particle[]} 烟花爆炸后产生的粒子 */
        this.particles = [];
        /** @type {boolean} 烟花是否已经爆炸 */
        this.exploded = false;
        /** @type {number} 烟花爆炸延迟 */
        this.explosionDelay = Math.random() * 30 + 10; // 爆炸延迟
    }

    /**
     * 绘制烟花
     */
    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2); // 增大圆的半径以便更容易看到
            ctx.fillStyle = this.mainColor;//'rgba(255, 255, 255, 0.8)'; // 80% 不透明度的白色
            ctx.fill();
            console.log('Drawing firework at', this.x, this.y); // 添加日志
        } else {
            this.particles.forEach(particle => particle.draw());
        }
    }

    /**
     * 更新烟花的状态
     */
    update() {
        if (!this.exploded) {
            // 更新速度
            this.velocity.x += this.acceleration.x;
            this.velocity.y += this.acceleration.y;

            // 更新位置
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            //this.velocity.y += 0.05; // 保持重力效果

            // 当达到目标高度或速度接近零时爆炸
            const distanceToTarget = Math.hypot(this.targetX - this.x, this.targetY - this.y);
            if (distanceToTarget < 10 || this.y <= this.targetY || this.velocity.y > 0) {
                if (this.explosionDelay <= 0) {
                    this.explode();
                } else {
                    this.explosionDelay--;
                }
            }
        } else {
            this.particles.forEach((particle, index) => {
                particle.update();
                if (particle.life <= 0) {
                    this.particles.splice(index, 1);
                }
            });
        }
    }

    /**
     * 烟花爆炸
     */
    explode() {
        this.exploded = true;
        const particleCount = Math.floor(Math.random() * 100) + 100; // 随机粒子数量
        const explosionSize = 4; // 新增：控制爆炸大小的因子

        for (let i = 0; i < particleCount; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const fadeColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            // 生成不同大小的粒子
            let size;
            const sizeRandom = Math.random();
            if (sizeRandom < 0.6) {
                // 60% 的概率生成小粒子
                size = Math.random() * 1.5 + 0.5; // 0.5 到 2 之间
            } else if (sizeRandom < 0.9) {
                // 30% 的概率生成中等粒子
                size = Math.random() * 2 + 2; // 2 到 4 之间
            } else {
                // 10% 的概率生成大粒子
                size = Math.random() * 3 + 4; // 4 到 7 之间
            }

            // 创建新粒子
            const particle = new Particle(this.x, this.y, color, fadeColor, size);
            
            // 调整粒子的初始速度来控制爆炸大小
            particle.velocity.x = (Math.random() * 2 - 1) * explosionSize;
            particle.velocity.y = (Math.random() * 2 - 1) * explosionSize;

            this.particles.push(particle);
        }
    }

    /**
     * 获取一个随机的柔和颜色
     * @returns {string} 随机的柔和颜色
     */
    getRandomSoftColor() {
        const softColors = [
            'rgba(255, 200, 200, 0.8)', // 柔和的粉红
            'rgba(200, 255, 200, 0.8)', // 柔和的绿色
            'rgba(200, 200, 255, 0.8)', // 柔和的蓝色
            'rgba(255, 255, 200, 0.8)', // 柔和的黄色
            'rgba(255, 200, 255, 0.8)', // 柔和的紫色
            'rgba(200, 255, 255, 0.8)'  // 柔和的青色
        ];
        return softColors[Math.floor(Math.random() * softColors.length)];
    }
    
    /**
     * 获取粒子的颜色，考虑渐变效果
     * @returns {string} 粒子的颜色
     */
    getParticleColor() {
        const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const alpha = Math.random() * 0.3 + 0.7; // 0.7 到 1 之间的透明度
        return this.adjustColor(baseColor, alpha);
    }

    /**
     * 调整颜色的亮度和透明度
     * @param {string} color - 原始颜色（十六进制）
     * @param {number} alpha - 透明度
     * @returns {string} 调整后的颜色（rgba格式）
     */
    adjustColor(color, alpha) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const brightness = Math.random() * 0.3 + 0.7; // 模拟燃烧亮度变化
        return `rgba(${r * brightness}, ${g * brightness}, ${b * brightness}, ${alpha})`;
    }

    /**
     * 获取随机的和谐颜色方案
     * @returns {string[]} 随机和谐颜色方案
     * 可以在colorSchemes中修改、添加、删除颜色方案
     */
    getRandomColorScheme() {
        const colorSchemes = [
            //夏日棒棒冰
            ['#eb85a3', '#edb2b2', '#f3e5d3'],//, '#83b5ad'
            //浪语绵绵'#b0ccd5', 
            ['#d1bdd7', '#eeb9b9', '#ead6a9'],
            //香芋 '#9f88a1', 
            ['#efc2c2', '#c6b3d1', '#e59181'],
            //云梦之境
            //['#f1e0b2', '#f0cac2', '#bfaece', '#89b4b8'],
            //山顶栀子 , '#9fadc5'
            ['#0043fd', '#069aff', '#6f6dff'],
            //万花筒'#e5d6b7', a5c1a3
            ['#e0b8cd', '#ff3782', '#38ff98'],
            //软软梅果 , '#977b95'
            ['#cfbbd6', '#ffa01f', '#e7b5b5'],
            
            // 红色系
            ['#FF533e', '#FF5555', '#FFEB91'],
            ['#02FF8D', '#23FFA0', '#ADFFD9'],
            // 蓝色系
            ['#5170FF', '#51ACFF', '#ADF6FF'],
            // 绿色系
            /*['#00FF00', '#55FF55', '#88FF88'],
            // 蓝色系
            ['#0000FF', '#5555FF', '#8888FF'],
            // 金色系
            ['#FFD700', '#FFA500', '#FF8C00'],
            // 银色系
            ['#C0C0C0', '#D3D3D3', '#A9A9A9'],
            // 青色系
            ['#00FFFF', '#00CED1', '#48D1CC'],
            // 橙色系
            ['#FFA500', '#FF8C00', '#FF7F50'],
            // 紫色系
            ['#800080', '#9932CC', '#BA55D3'],
            // 粉色系
            ['#FFC0CB', '#FFB6C1', '#FF69B4'],
            
            //彩虹色
            ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'],
            // 白色（用于模拟闪光）
            ['#FFFFFF', '#F0F0F0', '#E0E0E0']*/

        ];
        return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    }
}

class SpecialFirework {
    constructor() {
        this.text = "新年快乐";
        this.particles = [];
        this.colors = this.getRandomColorScheme();
        this.exploded = false;
    }

    explode() {
        this.exploded = true;
        const particlesPerChar = 200; // 每个字符的粒子数
        const explosionSize = 4; // 爆炸大小因子
    
        ctx.font = '120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    
        for (let i = 0; i < this.text.length; i++) {
            const char = this.text[i];
            const x = canvas.width * (i + 1) / (this.text.length + 1);
            const y = canvas.height / 2;
    
            const metrics = ctx.measureText(char);
            const width = metrics.width;
            const height = 120; // 假设高度等于字体大小
    
            for (let j = 0; j < particlesPerChar; j++) {
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                const fadeColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    
                let particleX, particleY;
                do {
                    particleX = x + (Math.random() - 0.5) * width;
                    particleY = y + (Math.random() - 0.5) * height;
                } while (!ctx.isPointInPath(new Path2D(char), particleX, particleY));
    
                const size = Math.random() * 2 + 1;
                const particle = new Particle(particleX, particleY, color, fadeColor, size);
    
                particle.velocity.x = (particleX - x) * 0.1 * explosionSize;
                particle.velocity.y = (particleY - y) * 0.1 * explosionSize;
    
                this.particles.push(particle);
            }
        }
    }
    

    update() {
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    draw() {
        this.particles.forEach(particle => particle.draw());
    }

    getRandomColorScheme() {
        const colorSchemes = [
            ['#FF0000', '#FF5555', '#FF8888'], // 红色系
            ['#FFD700', '#FFA500', '#FF8C00'], // 金色系
            ['#FF69B4', '#FF1493', '#C71585'], // 粉红色系
            ['#00FF00', '#7FFF00', '#32CD32'], // 绿色系
            ['#1E90FF', '#00BFFF', '#87CEFA'], // 蓝色系
        ];
        return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    }
}


// 存储烟花的数组
const fireworks = [];

// 动画循环，负责更新和绘制烟花效果
function animate() {
    // 请求下一帧动画，确保动画持续进行
    requestAnimationFrame(animate);

    // 测试绘制
    //ctx.fillStyle = 'white';
    //ctx.beginPath();
    //ctx.arc(100, 100, 10, 0, Math.PI * 2);
    //ctx.fill();

    // 在整个画布上绘制半透明的黑色矩形
    // 这会创建一个淡出效果，使之前的帧逐渐消失
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 有小概率生成新的烟花
    if (Math.random() < 0.05) { // 稍微增加烟花生成频率，// 5%的概率每帧生成新烟花
        fireworks.push(new Firework());
    }

    fireworks.forEach((firework, index) => {
        // 更新烟花的位置和状态
        firework.update();

        // 绘制烟花
        firework.draw();

        // 如果烟花已经爆炸且所有粒子都消失了，从数组中移除这个烟花
        if (firework.exploded && firework.particles.length === 0) {
            fireworks.splice(index, 1);
        }
    });
}

// 开始动画
animate();

/*

let lastSpecialFireworkTime = 0;
const specialFireworkInterval = 30000; // 30秒
let specialFirework = null;
let isSpecialFireworkActive = false;
function animate(currentTime) {
    requestAnimationFrame(animate);

    // 计算自上次特殊烟花以来经过的时间
    const elapsedTime = currentTime - lastSpecialFireworkTime;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 创建普通烟花
    if (!isSpecialFireworkActive && Math.random() < 0.05) {
        fireworks.push(new Firework());
    }

    // 每30秒创建一个特殊烟花
    if (elapsedTime > specialFireworkInterval && !isSpecialFireworkActive) {
        specialFirework = new SpecialFirework();
        specialFirework.explode();
        lastSpecialFireworkTime = currentTime;
        isSpecialFireworkActive = true;
    }

    // 更新和绘制普通烟花
    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();
        if (firework.exploded && firework.particles.length === 0) {
            fireworks.splice(index, 1);
        }
    });

    // 更新和绘制特殊烟花
    if (specialFirework) {
        specialFirework.update();
        specialFirework.draw();
        if (specialFirework.particles.length === 0) {
            specialFirework = null;
            isSpecialFireworkActive = false;
        }
    }
}

// 初始化动画循环
lastSpecialFireworkTime = performance.now();
animate(performance.now());
*/
// 调整canvas大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
