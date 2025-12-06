// 实时过滤 + 计数
function filterGames(){
    const kw=document.getElementById('searchInput').value.trim().toLowerCase();
    const cards=document.querySelectorAll('.game-card');
    let visible=0;
    cards.forEach(c=>{
        const ok=c.dataset.name.toLowerCase().includes(kw)||c.dataset.desc.toLowerCase().includes(kw);
        c.style.display=ok?'flex':'none';
        if(ok) visible++;
    });
    document.getElementById('total').textContent=visible;
}

// 页面加载时先执行一次，确保计数正确
filterGames();
