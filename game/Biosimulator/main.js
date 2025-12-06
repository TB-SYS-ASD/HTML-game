// ===== 初始数据 =====
const stats = {
    'human-male': 0,
    'human-female': 0,
    'child': 0,
    'zombie': 0,
    'vampire': 0
};
const creatureEmojis = {
    'human-male': '👨',
    'human-female': '👩',
    'child': '👶',
    'zombie': '🧟',
    'vampire': '🧛'
};

// ===== 背景粒子 =====
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 20 + 's';
        p.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(p);
    }
}

// ===== 创建生物 =====
function createCreature(type, x = null, y = null) {
    const canvas = document.getElementById('gameCanvas');
    const c = document.createElement('div');
    c.className = `creature ${type}`;
    c.textContent = creatureEmojis[type];
    c.dataset.type = type;
    c.dataset.id = Date.now() + Math.random();

    const maxX = canvas.offsetWidth - 40;
    const maxY = canvas.offsetHeight - 40;
    c.style.left = (x ?? Math.random() * maxX) + 'px';
    c.style.top = (y ?? Math.random() * maxY) + 'px';

    makeDraggable(c);
    canvas.appendChild(c);

    stats[type]++;
    updateStats();
    c.style.transform = 'scale(0)';
    setTimeout(() => c.style.transform = 'scale(1)', 10);
    return c;
}

// ===== 拖拽 =====
function makeDraggable(el) {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        el.dataset.dragging = 'true';
        p3 = e.clientX;
        p4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        p1 = p3 - e.clientX;
        p2 = p4 - e.clientY;
        p3 = e.clientX;
        p4 = e.clientY;

        const canvas = document.getElementById('gameCanvas');
        let newLeft = el.offsetLeft - p1;
        let newTop = el.offsetTop - p2;
        newLeft = Math.max(0, Math.min(canvas.offsetWidth - el.offsetWidth, newLeft));
        newTop = Math.max(0, Math.min(canvas.offsetHeight - el.offsetHeight, newTop));

        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        checkInteractions(el);
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        delete el.dataset.dragging;
    }
}

// ===== 自动游走 =====
function autoMoveCreatures() {
    document.querySelectorAll('.creature').forEach(c => {
        if (c.dataset.dragging === 'true') return;

        const speed = 0.5 + Math.random() * 1.5;
        const dx = (Math.random() - 0.5) * speed;
        const dy = (Math.random() - 0.5) * speed;

        const canvas = document.getElementById('gameCanvas');
        let x = parseFloat(c.style.left) || 0;
        let y = parseFloat(c.style.top) || 0;
        x += dx;
        y += dy;

        if (x < 0 || x > canvas.offsetWidth - 40) x -= dx;
        if (y < 0 || y > canvas.offsetHeight - 40) y -= dy;

        c.style.left = x + 'px';
        c.style.top = y + 'px';
        checkInteractions(c);
    });
}
setInterval(autoMoveCreatures, 100);

// ===== 碰撞检测 =====
function checkInteractions(creature) {
    const creatures = document.querySelectorAll('.creature');
    const r1 = creature.getBoundingClientRect();
    creatures.forEach(other => {
        if (other === creature || other.dataset.interacting) return;
        const r2 = other.getBoundingClientRect();
        const dist = Math.hypot(r1.left - r2.left, r1.top - r2.top);
        if (dist < 50) handleInteraction(creature, other);
    });
}

// ===== 交互逻辑 =====
function handleInteraction(c1, c2) {
    const t1 = c1.dataset.type;
    const t2 = c2.dataset.type;
    c1.dataset.interacting = 'true';
    c2.dataset.interacting = 'true';
    setTimeout(() => {
        delete c1.dataset.interacting;
        delete c2.dataset.interacting;
    }, 2000);

    // 1. 交配
    if ((t1 === 'human-male' && t2 === 'human-female') || (t1 === 'human-female' && t2 === 'human-male')) {
        if (Math.random() < 0.3) {
            const x = (parseFloat(c1.style.left) + parseFloat(c2.style.left)) / 2;
            const y = (parseFloat(c1.style.top) + parseFloat(c2.style.top)) / 2;
            createCreature('child', x, y);
            showInteractionEffect(c1, '💕');
            showInteractionEffect(c2, '💕');
        }
    }
    // 2. 吸血鬼咬人
    else if ((t1 === 'vampire' && (t2 === 'human-male' || t2 === 'human-female')) ||
             (t2 === 'vampire' && (t1 === 'human-male' || t1 === 'human-female'))) {
        const vamp = t1 === 'vampire' ? c1 : c2;
        const human = t1 === 'vampire' ? c2 : c1;
        if (Math.random() < 0.4) {
            convertCreature(human, 'zombie');
            showInteractionEffect(vamp, '🩸');
            showInteractionEffect(human, '🧟');
        } else if (Math.random() < 0.6) {
            const x = parseFloat(vamp.style.left) + 30;
            const y = parseFloat(vamp.style.top) + 30;
            createCreature('vampire', x, y);
            showInteractionEffect(vamp, '✨');
        }
    }
    // 3. 治疗僵尸
    else if ((t1 === 'zombie' && (t2 === 'human-male' || t2 === 'human-female')) ||
             (t2 === 'zombie' && (t1 === 'human-male' || t1 === 'human-female'))) {
        const zombie = t1 === 'zombie' ? c1 : c2;
        if (Math.random() < 0.3) {
            const newType = Math.random() < 0.5 ? 'human-male' : 'human-female';
            convertCreature(zombie, newType);
            showInteractionEffect(zombie, '💚');
        }
    }
    // 4. 小孩成长
    else if (t1 === 'child' || t2 === 'child') {
        const child = t1 === 'child' ? c1 : c2;
        if (Math.random() < 0.1) {
            const newType = Math.random() < 0.5 ? 'human-male' : 'human-female';
            convertCreature(child, newType);
            showInteractionEffect(child, '🌱');
        }
    }
}

// ===== 通用转换 =====
function convertCreature(elem, newType) {
    const old = elem.dataset.type;
    if (old === newType) return;
    elem.dataset.type = newType;
    elem.className = `creature ${newType}`;
    elem.textContent = creatureEmojis[newType];
    stats[old]--;
    stats[newType]++;
    updateStats();
}

// ===== 特效 =====
function showInteractionEffect(creature, emoji) {
    const ef = document.createElement('div');
    ef.className = 'interaction-effect';
    ef.textContent = emoji;
    ef.style.left = creature.style.left;
    ef.style.top = creature.style.top;
    document.getElementById('gameCanvas').appendChild(ef);
    setTimeout(() => ef.remove(), 1000);
}

// ===== 更新统计 =====
function updateStats() {
    document.getElementById('male-count').textContent = stats['human-male'];
    document.getElementById('female-count').textContent = stats['human-female'];
    document.getElementById('child-count').textContent = stats['child'];
    document.getElementById('zombie-count').textContent = stats['zombie'];
    document.getElementById('vampire-count').textContent = stats['vampire'];
    document.getElementById('total-count').textContent = Object.values(stats).reduce((a, b) => a + b, 0);
}

// ===== 平衡干预 =====
function balanceChecker() {
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total < 3) return;
    const maxType = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);
    const minType = Object.keys(stats).reduce((a, b) => stats[a] < stats[b] ? a : b);
    if (stats[maxType] > total * 0.6) {
        const victims = Array.from(document.querySelectorAll(`.creature.${maxType}`));
        if (victims.length) {
            const target = victims[Math.floor(Math.random() * victims.length)];
            const replace = minType === 'child' ? (Math.random() < 0.5 ? 'human-male' : 'human-female') : minType;
            convertCreature(target, replace);
        }
    }
}
setInterval(balanceChecker, 5000);

// ===== 初始化 =====
window.onload = () => {
    createParticles();
    setTimeout(() => createCreature('human-male'), 500);
    setTimeout(() => createCreature('human-female'), 700);
    setTimeout(() => createCreature('zombie'), 900);
    setTimeout(() => createCreature('vampire'), 1100);
};
