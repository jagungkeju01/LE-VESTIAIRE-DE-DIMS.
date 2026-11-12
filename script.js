/* MAISON DIMS — shared storefront interactions. Static demo: cart, favorites and reviews use this browser's localStorage. */
(() => {
  'use strict';
  const PRODUCTS = window.MAISON_PRODUCTS || [];
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const currencyCodes = { IDR:{locale:'id-ID',currency:'IDR',rate:1}, USD:{locale:'en-US',currency:'USD',rate:1/15800}, EUR:{locale:'de-DE',currency:'EUR',rate:1/17100} };
  let currency = localStorage.getItem('md_currency') || 'IDR';
  let theme = localStorage.getItem('md_theme') || 'light';
  document.documentElement.dataset.theme = theme;
  const money = value => {
    if (!value || value < 0) return 'Segera hadir';
    const c = currencyCodes[currency] || currencyCodes.IDR;
    const amount = value * c.rate;
    return new Intl.NumberFormat(c.locale,{style:'currency',currency:c.currency,maximumFractionDigits:currency==='IDR'?0:2}).format(amount);
  };
  const productById = id => PRODUCTS.find(p=>p.id===id) || PRODUCTS[0];
  const getCart = () => read('md_cart', []);
  const getLikes = () => read('md_likes', []);
  const cartCount = () => getCart().reduce((n,item)=>n+item.qty,0);
  const safe = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function injectDrawer(){
    if ($('#site-drawer')) return;
    const drawer=document.createElement('div'); drawer.id='site-drawer'; drawer.className='drawer-overlay'; drawer.innerHTML=`<button class="drawer-scrim" data-close-menu aria-label="Tutup menu"></button><aside class="site-drawer" aria-label="Menu utama"><button class="drawer-close" data-close-menu aria-label="Tutup menu">×</button><p class="eyebrow">MAISON DIMS®</p><nav><a href="products.html">SHOPS</a><a href="about.html">ABOUT US</a><a href="lookbook.html">LOOKBOOK</a><a href="archives.html">ARCHIVES</a><a href="account.html">MY ACCOUNT</a><a href="cart.html">SHOPPING BAG (<span data-cart-count>0</span>)</a></nav><div class="drawer-currency"><label for="currency-select">CURRENCY</label><select id="currency-select"><option value="IDR">IDR — Indonesian Rupiah</option><option value="USD">USD — US Dollar (estimate)</option><option value="EUR">EUR — Euro (estimate)</option></select><small>Nilai konversi perkiraan untuk tampilan, bukan kurs real-time.</small></div></aside>`;
    document.body.append(drawer);
    $$('[data-close-menu]',drawer).forEach(el=>el.addEventListener('click',closeDrawer));
    $('#currency-select',drawer).value=currency;
    $('#currency-select',drawer).addEventListener('change',e=>{currency=e.target.value;localStorage.setItem('md_currency',currency);renderPrices();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
  }
  function openDrawer(){injectDrawer();$('#site-drawer').classList.add('open');document.body.classList.add('menu-open');}
  function closeDrawer(){$('#site-drawer')?.classList.remove('open');document.body.classList.remove('menu-open');}
  function addGlobalHeaderControls(){
    injectDrawer();
    $$('.more-link').forEach(a=>{a.href='#menu';a.setAttribute('aria-label','Buka menu');a.setAttribute('aria-expanded','false');a.addEventListener('click',e=>{e.preventDefault();openDrawer();a.setAttribute('aria-expanded','true');});});
    $$('.user-icon').forEach(a=>{a.href='account.html';a.setAttribute('aria-label','Akun saya');});
    $$('.bag-icon').forEach(a=>{a.href='cart.html';a.setAttribute('aria-label','Buka keranjang');});
    $$('[data-cart-count]').forEach(el=>el.textContent=cartCount());
    $$('.currency').forEach(el=>{el.innerHTML=`<span class="flag-id" aria-hidden="true"></span> ${currency}`;el.title='Ganti mata uang melalui menu •••';});
    $$('.nav-right').forEach(nav=>{if(!$('.theme-toggle',nav)){const b=document.createElement('button');b.type='button';b.className='theme-toggle';b.id='theme-toggle';b.setAttribute('aria-label','Ganti mode terang atau gelap');b.addEventListener('click',toggleTheme);nav.append(b);} });
    updateThemeButton();
  }
  function toggleTheme(){theme=theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;localStorage.setItem('md_theme',theme);updateThemeButton();}
  function updateThemeButton(){ $$('.theme-toggle').forEach(b=>{b.textContent=theme==='dark'?'☀':'☾';b.title=theme==='dark'?'Gunakan mode terang':'Gunakan mode gelap';}); }
  function renderPrices(){
    $$('[data-price-id]').forEach(el=>{const p=productById(el.dataset.priceId);if(p)el.textContent=money(p.price);});
    $$('[data-product-price]').forEach(el=>{const p=productById(el.dataset.productPrice);if(p)el.textContent=money(p.price);});
    const select=$('#currency-select'); if(select)select.value=currency;
    if ($('#cart-items')) renderCart();
  }
  function toggleLike(id, button){const likes=getLikes();const next=likes.includes(id)?likes.filter(x=>x!==id):[...likes,id];write('md_likes',next);if(button){button.classList.toggle('liked',next.includes(id));button.setAttribute('aria-pressed',String(next.includes(id)));button.textContent=next.includes(id)?'♥':'♡';}renderLikeButtons();}
  function renderLikeButtons(){const likes=getLikes();$$('[data-like-id]').forEach(b=>{const on=likes.includes(b.dataset.likeId);b.classList.toggle('liked',on);b.setAttribute('aria-pressed',String(on));b.textContent=on?'♥':'♡';});}
  function addToCart(id,size,qty=1){const p=productById(id);if(!p||p.comingSoon){alert('Foto dan informasi produk ini belum lengkap.');return;}const cart=getCart();const key=`${id}|${size}`;const found=cart.find(i=>i.key===key);if(found)found.qty+=qty;else cart.push({key,id,size,qty});write('md_cart',cart);updateCartUI();toast(`${p.name} ditambahkan ke keranjang.`);}
  function updateCartUI(){$$('[data-cart-count]').forEach(el=>el.textContent=cartCount());}
  function toast(message){let el=$('#site-toast');if(!el){el=document.createElement('div');el.id='site-toast';el.className='site-toast';document.body.append(el);}el.textContent=message;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),2400);}
  function renderProductGrid(){const grid=$('#product-grid');if(!grid)return;
    const filters=$('.filter-bar');const controls=filters?$$('select',filters):[];
    const state={category:controls[0]?.value||'category : all',size:controls[1]?.value||'size : all',price:controls[2]?.value||'price : all',availability:controls[3]?.value||'availability : all',sort:controls[4]?.value||'sort : Featured'};
    let list=PRODUCTS.filter(p=>{
      if(p.comingSoon)return true;
      const cat=state.category.toLowerCase();if(!cat.includes('all')&&!p.category.toLowerCase().includes(cat.replace('sweaters','knitwear').replace('hoodies','hoodie').replace('jackets','jacket').replace('t-shirts','t-shirt')))return false;
      if(state.price.includes('Under')&&p.price>=200000)return false;
      if(state.price.includes('200.000')&&state.price.includes('400.000')&&(p.price<200000||p.price>400000))return false;
      if(state.price.includes('Above')&&p.price<=400000)return false;
      if(state.availability.includes('in stock')&&p.stock<1)return false;
      if(state.availability.includes('sold out')&&p.stock>0)return false;
      return true;
    });
    if(state.sort.includes('low to high'))list.sort((a,b)=>a.price-b.price);else if(state.sort.includes('high to low'))list.sort((a,b)=>b.price-a.price);else if(state.sort.includes('Newest'))list.reverse();
    grid.innerHTML=list.map(p=>`<article class="product-card ${p.comingSoon?'coming-soon':''}"><div class="product-image-wrap">${p.comingSoon?`<div class="product-image image-placeholder"><span>PRODUCT IMAGE 09<br>COMING SOON</span></div>`:`<a class="product-image" href="product-detail.html?product=${encodeURIComponent(p.id)}" aria-label="Lihat ${safe(p.name)}"><img src="${safe(p.images[0])}" alt="${safe(p.name)}" loading="lazy"></a><button class="like-button" data-like-id="${p.id}" aria-label="Sukai ${safe(p.name)}" aria-pressed="false">♡</button><button class="quick-select" data-select-product="${p.id}" aria-label="Pilih ${safe(p.name)}" title="Pilih produk">✓</button>`}</div><div class="product-info"><div><h2>${safe(p.name)}</h2><p>${safe(p.category)}</p></div><span class="price" data-price-id="${p.id}">${money(p.price)}</span></div>${p.comingSoon?'<p class="coming-note">Tambahkan 3 foto untuk mengaktifkan produk ini.</p>':''}</article>`).join('');
    if(!list.length)grid.innerHTML='<p class="empty-state">Tidak ada produk yang cocok dengan filter.</p>';
    renderLikeButtons();
    $$('[data-like-id]',grid).forEach(b=>b.addEventListener('click',e=>{e.preventDefault();toggleLike(b.dataset.likeId,b);}));
    $$('[data-select-product]',grid).forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('selected');b.setAttribute('aria-pressed',String(b.classList.contains('selected')));}));
  }
  function renderDetail(){const name=$('#product-name');if(!name)return;const id=new URLSearchParams(location.search).get('product')||'chmb';const p=productById(id);if(!p||p.comingSoon){$('.detail-layout').innerHTML='<div class="empty-state"><h1>Produk belum tersedia</h1><p>Foto depan, belakang, dan label/ukuran untuk produk ini belum diunggah.</p><a class="button button-dark" href="products.html">KEMBALI KE KATALOG</a></div>';return;}
    name.textContent=p.name;$('#product-price').dataset.productPrice=p.id;$('#product-price').textContent=money(p.price);$('#product-description').textContent=p.description;document.title=p.name+' — MAISON DIMS®';const crumb=$('.breadcrumb span:last-child');if(crumb)crumb.textContent=p.name;
    const main=$('#main-product-photo'),gallery=$('#product-thumbnails');main.src=p.images[0];main.alt=`Foto depan ${p.name}`;
    const labels=['Foto depan','Foto belakang','Foto label dan ukuran'];gallery.innerHTML=p.images.map((src,i)=>`<button type="button" class="thumbnail ${i===0?'active':''}" data-image="${safe(src)}" aria-label="${labels[i]}"><img src="${safe(src)}" alt="${labels[i]} ${safe(p.name)}" loading="lazy"><span class="thumbnail-check">✓</span></button>`).join('');
    $$('.thumbnail',gallery).forEach(b=>b.addEventListener('click',()=>{main.src=b.dataset.image;main.alt=b.querySelector('img').alt;$$('.thumbnail',gallery).forEach(t=>t.classList.remove('active'));b.classList.add('active');}));
    const like=$('#detail-like');like.dataset.likeId=p.id;like.addEventListener('click',()=>toggleLike(p.id,like));renderLikeButtons();
    const stock=$('#stock-count');if(stock)stock.textContent=p.stock>0?`In stock · ${p.stock} available`:'Sold out';
    const qty=$('#quantity');const size=$('#size-select');const add=$('#add-to-cart');add.addEventListener('click',()=>{if(!size.value){toast('Pilih ukuran terlebih dahulu.');size.focus();return;}addToCart(p.id,size.value,Math.max(1,parseInt(qty.value,10)||1));});
    $('#buy-now').addEventListener('click',()=>{if(!size.value){toast('Pilih ukuran terlebih dahulu.');size.focus();return;}const amount=Math.max(1,Math.min(20,parseInt(qty.value,10)||1));write('md_checkout_items',[{key:`${p.id}|${size.value}`,id:p.id,size:size.value,qty:amount}]);location.href='checkout.html';});
    renderReviews(p.id);renderRelated(p.id);
  }
  function renderRelated(id){const box=$('#related-products');if(!box)return;box.innerHTML=PRODUCTS.filter(p=>p.id!==id&&!p.comingSoon).slice(0,4).map(p=>`<article class="product-card"><a class="product-image" href="product-detail.html?product=${p.id}"><img src="${p.images[0]}" alt="${safe(p.name)}" loading="lazy"></a><div class="product-info"><h3>${safe(p.name)}</h3><span class="price" data-price-id="${p.id}">${money(p.price)}</span></div></article>`).join('');}
  function renderReviews(id){const list=$('#review-list');if(!list)return;const reviews=read('md_reviews_'+id,[]);const avg=reviews.length?reviews.reduce((a,r)=>a+r.rating,0)/reviews.length:0;$('#review-summary').textContent=reviews.length?`${avg.toFixed(1)} / 5 · ${reviews.length} ulasan`:'Belum ada ulasan — jadilah yang pertama.';list.innerHTML=reviews.length?reviews.slice().reverse().map(r=>`<article class="review-card"><div class="review-top"><strong>${safe(r.name)}</strong><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div><p>${safe(r.comment)}</p><small>${safe(r.date)}</small></article>`).join(''):'<p class="muted">Ulasan pelanggan akan muncul di sini setelah dikirim dari browser ini.</p>';const form=$('#review-form');if(form&&!form.dataset.bound){form.dataset.bound='1';form.addEventListener('submit',e=>{e.preventDefault();const name=$('#review-name').value.trim()||'Guest';const rating=parseInt($('#review-rating').value,10);const comment=$('#review-comment').value.trim();if(!comment){toast('Tulis komentar terlebih dahulu.');return;}const current=read('md_reviews_'+id,[]);current.push({name,rating,comment,date:new Date().toLocaleDateString('id-ID')});write('md_reviews_'+id,current);form.reset();renderReviews(id);toast('Ulasan disimpan di browser ini.');});}}
  function renderCart(){const host=$('#cart-items');if(!host)return;const cart=getCart();if(!cart.length){host.innerHTML='<div class="empty-state"><h2>Keranjang masih kosong</h2><p>Temukan item favoritmu di koleksi MAISON DIMS.</p><a class="button button-dark" href="products.html">EXPLORE SHOPS</a></div>';$('#cart-subtotal').textContent=money(0);$('#checkout-demo')?.setAttribute('disabled','disabled');return;}host.innerHTML=cart.map(item=>{const p=productById(item.id);return `<article class="cart-row"><img src="${p.images[0]}" alt="${safe(p.name)}"><div class="cart-row-info"><a href="product-detail.html?product=${p.id}"><strong>${safe(p.name)}</strong></a><p>Size: ${safe(item.size)}</p><span>${money(p.price)}</span><div class="cart-qty"><button data-qty="-1" data-key="${safe(item.key)}" aria-label="Kurangi jumlah">−</button><span>${item.qty}</span><button data-qty="1" data-key="${safe(item.key)}" aria-label="Tambah jumlah">+</button><button class="remove-item" data-remove="${safe(item.key)}">Hapus</button></div></div><strong>${money(p.price*item.qty)}</strong></article>`}).join('');$('#cart-subtotal').textContent=money(cart.reduce((sum,i)=>sum+productById(i.id).price*i.qty,0));$('#checkout-demo')?.removeAttribute('disabled');if($('#checkout-demo'))$('#checkout-demo').onclick=()=>{localStorage.removeItem('md_checkout_items');location.href='checkout.html';};$$('[data-qty]',host).forEach(b=>b.addEventListener('click',()=>{const c=getCart();const item=c.find(i=>i.key===b.dataset.key);if(item)item.qty=Math.max(1,item.qty+Number(b.dataset.qty));write('md_cart',c);renderCart();updateCartUI();}));$$('[data-remove]',host).forEach(b=>b.addEventListener('click',()=>{write('md_cart',getCart().filter(i=>i.key!==b.dataset.remove));renderCart();updateCartUI();}));}
  function renderCheckout(){
    const form=$('#checkout-form'); if(!form)return;
    const direct=read('md_checkout_items',null); const items=(direct&&direct.length?direct:getCart()).filter(i=>productById(i.id));
    const list=$('#checkout-items'); const subtotalEl=$('#checkout-subtotal'); const discountEl=$('#checkout-discount'); const totalEl=$('#checkout-total'); const voucherInput=$('#voucher-code'); const voucherStatus=$('#voucher-status');
    let discount=0;
    function totals(){const subtotal=items.reduce((sum,i)=>sum+productById(i.id).price*i.qty,0);discount=localStorage.getItem('md_voucher_applied')==='DIMS10'?Math.round(subtotal*.10):0;const total=Math.max(0,subtotal-discount);if(subtotalEl)subtotalEl.textContent=money(subtotal);if(discountEl)discountEl.textContent='− '+money(discount);if(totalEl)totalEl.textContent=money(total);return {subtotal,discount,total};}
    if(!items.length){list.innerHTML='<div class="empty-state"><h2>Belum ada produk</h2><p>Pilih produk dari katalog sebelum checkout.</p><a class="button button-dark" href="products.html">KEMBALI KE KATALOG</a></div>';form.querySelector('button[type="submit"]')?.setAttribute('disabled','disabled');totals();return;}
    list.innerHTML=items.map(i=>{const p=productById(i.id);return `<article class="checkout-item"><img src="${safe(p.images[0])}" alt="${safe(p.name)}"><div><strong>${safe(p.name)}</strong><p>Ukuran: ${safe(i.size)} · Jumlah: ${i.qty}</p><small>${money(p.price)} / item</small></div><strong>${money(p.price*i.qty)}</strong></article>`}).join('');
    totals();
    $('#apply-voucher')?.addEventListener('click',()=>{const code=(voucherInput.value||'').trim().toUpperCase();if(code==='DIMS10'){localStorage.setItem('md_voucher_applied','DIMS10');voucherStatus.textContent='Voucher DIMS10 diterapkan: diskon demo 10%.';voucherStatus.className='voucher-status success';}else{localStorage.removeItem('md_voucher_applied');voucherStatus.textContent='Kode voucher tidak valid. Coba DIMS10 untuk simulasi.';voucherStatus.className='voucher-status';}totals();});
    form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const selected=form.querySelector('input[name="payment-method"]:checked');if(!selected){toast('Pilih metode pembayaran.');return;}const sum=totals();const order={id:'MD-'+Date.now().toString().slice(-8),createdAt:new Date().toISOString(),customer:{name:$('#buyer-name').value.trim(),phone:$('#buyer-phone').value.trim(),email:$('#buyer-email').value.trim(),country:$('#buyer-country').value,city:$('#buyer-city').value.trim(),district:$('#buyer-district').value.trim(),postal:$('#buyer-postal').value.trim(),address:$('#buyer-address').value.trim(),note:$('#buyer-note').value.trim()},payment:selected.value,items,subtotal:sum.subtotal,discount:sum.discount,total:sum.total,currency};const orders=read('md_demo_orders',[]);orders.push(order);write('md_demo_orders',orders);if(!direct||!direct.length)write('md_cart',[]);localStorage.removeItem('md_checkout_items');localStorage.removeItem('md_voucher_applied');toast('Pesanan demo tersimpan di browser.');$('#checkout-status').textContent=`Pesanan ${order.id} berhasil dibuat sebagai simulasi. Metode: ${order.payment}. Total: ${money(order.total)}. Belum ada pembayaran nyata yang diproses.`;$('#checkout-status').classList.add('success');form.querySelector('button[type="submit"]').disabled=true;});
  }
  function renderAccount(){const form=$('#account-form');if(!form)return;const current=read('md_account',null);const status=$('#account-status');if(current){status.textContent=`Kamu masuk sebagai ${current.name} (${current.email}). Akun demo ini hanya tersimpan di browser ini.`;$('#account-name').value=current.name;$('#account-email').value=current.email;$('#account-password').placeholder='Isi untuk mengganti password demo';$('#account-submit').textContent='Simpan perubahan';}form.addEventListener('submit',e=>{e.preventDefault();const name=$('#account-name').value.trim(),email=$('#account-email').value.trim(),password=$('#account-password').value;if(!name||!email||!password){status.textContent='Isi nama, email, dan password demo.';return;}write('md_account',{name,email,password});status.textContent=`Akun demo tersimpan untuk ${email}. Jangan gunakan password asli; ini bukan autentikasi server.`;toast('Data akun demo tersimpan.');});$('#account-logout')?.addEventListener('click',()=>{localStorage.removeItem('md_account');form.reset();status.textContent='Kamu telah keluar dari akun demo.';});}
  function renderArchive(){const grid=$('#archive-grid');if(!grid)return;grid.innerHTML=PRODUCTS.filter(p=>!p.comingSoon).slice(0,4).map(p=>`<article class="product-card"><a class="product-image" href="product-detail.html?product=${p.id}"><img src="${p.images[0]}" alt="${safe(p.name)}" loading="lazy"></a><div class="product-info"><h2>${safe(p.name)}</h2><span class="price" data-price-id="${p.id}">${money(p.price)}</span></div></article>`).join('');}
  function bindGlobal(){addGlobalHeaderControls();renderPrices();}
  document.addEventListener('DOMContentLoaded',()=>{bindGlobal();renderProductGrid();const filters=$('.filter-bar');if(filters)filters.querySelectorAll('select').forEach(select=>select.addEventListener('change',renderProductGrid));renderDetail();renderCart();renderCheckout();renderAccount();renderArchive();});
})();
