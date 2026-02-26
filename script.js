// Helpers
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

/** Scroll progress bar */
(function scrollProgress(){
  const bar = $("#progress");
  const onScroll = () => {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = h.scrollHeight - h.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/** Mobile nav */
(function navToggle(){
  const toggle = $("#navToggle");
  const links = $("#navLinks");

  if(!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // close on link click (mobile)
  $$("#navLinks a").forEach(a => {
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // close on outside click
  document.addEventListener("click", (e) => {
    if (!links.classList.contains("is-open")) return;
    const isInside = links.contains(e.target) || toggle.contains(e.target);
    if (!isInside) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

/** Highlight today's opening hours row */
(function highlightToday(){
  const today = new Date().getDay(); // 0=Sun .. 6=Sat
  const row = document.querySelector(`.hours tr[data-day="${today}"]`);
  if(row) row.classList.add("is-today");
})();

/** Copy-to-clipboard chips */
async function copyText(text, el){
  try{
    await navigator.clipboard.writeText(text);
    const hint = el.querySelector(".chip__hint");
    if(hint){
      const old = hint.textContent;
      hint.textContent = "Copied!";
      setTimeout(() => hint.textContent = old, 1200);
    }
  }catch(err){
    alert("Copy failed. You can copy manually: " + text);
  }
}

(function copyChips(){
  const phoneBtn = $("#copyPhone");
  const emailBtn = $("#copyEmail");

  if(phoneBtn){
    phoneBtn.addEventListener("click", () => copyText(phoneBtn.dataset.copy, phoneBtn));
  }
  if(emailBtn){
    emailBtn.addEventListener("click", () => copyText(emailBtn.dataset.copy, emailBtn));
  }
})();

/** Gallery Lightbox */
(function lightbox(){
  const box = $("#lightbox");
  const img = $("#lightboxImg");
  const cap = $("#lightboxCaption");
  const close = $("#lightboxClose");

  if(!box || !img || !cap || !close) return;

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt || "Gallery image";
    cap.textContent = alt || "";
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const shut = () => {
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    img.src = "";
    img.alt = "";
    cap.textContent = "";
    document.body.style.overflow = "";
  };

  $$(".gallery__item").forEach(btn => {
    btn.addEventListener("click", () => {
      open(btn.dataset.img, btn.dataset.alt);
    });
  });

  close.addEventListener("click", shut);
  box.addEventListener("click", (e) => {
    if(e.target === box) shut();
  });

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && box.classList.contains("is-open")) shut();
  });
})();

/** Booking form (client-side validation + WhatsApp prefill) */
(function bookingForm(){
  const form = $("#bookingForm");
  const msg = $("#formMsg");
  if(!form || !msg) return;

  const setMsg = (text, ok=false) => {
    msg.textContent = text;
    msg.style.color = ok ? "rgba(61,255,181,.92)" : "rgba(255,255,255,.72)";
  };

  // Set min date = today
  const dateInput = form.querySelector('input[name="date"]');
  if(dateInput){
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,"0");
    const dd = String(today.getDate()).padStart(2,"0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const service = (data.get("service") || "").toString().trim();
    const date = (data.get("date") || "").toString().trim();
    const time = (data.get("time") || "").toString().trim();
    const notes = (data.get("notes") || "").toString().trim();
    const policy = data.get("policy");

    if(name.length < 2) return setMsg("Please enter your full name.");
    if(phone.length < 9) return setMsg("Please enter a valid phone number.");
    if(!service) return setMsg("Please select a service.");
    if(!date) return setMsg("Please choose a preferred date.");
    if(!time) return setMsg("Please choose a preferred time.");
    if(!policy) return setMsg("Please confirm the deposit & cancellation policy.");

    const text =
      `Hi Princess! I'd like to book a nail appointment.%0A%0A` +
      `Name: ${encodeURIComponent(name)}%0A` +
      `My Phone: ${encodeURIComponent(phone)}%0A` +
      `Service: ${encodeURIComponent(service)}%0A` +
      `Preferred Date: ${encodeURIComponent(date)}%0A` +
      `Preferred Time: ${encodeURIComponent(time)}%0A` +
      `Notes: ${encodeURIComponent(notes || "None")}%0A%0A` +
      `I understand the R100 deposit secures my slot and the 24hr cancellation policy applies.`;

    setMsg("Opening WhatsApp with your booking request…", true);

    const wa = `https://wa.me/27671099815?text=${text}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  });
})();