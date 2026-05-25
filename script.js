const URBANFIX = {
  businessName: "UrbanFix",
  whatsappNumber: "923243184621",
  email: "urbanfix@gmail.com",
  workingHours: {
    startHour: 11,
    endHour: 19,
    intervalMinutes: 30
  }
};

const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const backToTop = document.getElementById("backToTop");
const yearSpan = document.getElementById("year");
const bookingForm = document.getElementById("bookingForm");
const serviceSelect = document.getElementById("service");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const emailButton = document.getElementById("emailButton");
const requestStatus = document.getElementById("requestStatus");

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

function makeWhatsAppLink(message) {
  const appLink = `whatsapp://send?phone=${URBANFIX.whatsappNumber}&text=${encodeURIComponent(message)}`;
  const webLink = `https://wa.me/${URBANFIX.whatsappNumber}?text=${encodeURIComponent(message)}`;
  
  // Detect if mobile device
  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || window.innerWidth <= 768;
  }

  // Return appLink for mobile, webLink for desktop
  return isMobileDevice() ? appLink : webLink;
}

function updateContactLinks() {
  document.querySelectorAll(".whatsapp-direct").forEach((link) => {
    link.href = makeWhatsAppLink();
  });

  ["footerEmail", "footerMailLink"].forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.href = `mailto:${URBANFIX.email}`;
    link.innerHTML = `<i class="fa-solid fa-envelope"></i> ${URBANFIX.email}`;
  });
}

function setHeaderState() {
  siteHeader.classList.toggle("scrolled", window.scrollY > 15);
  backToTop.classList.toggle("visible", window.scrollY > 650);
}

function setupNavigation() {
  window.addEventListener("scroll", setHeaderState);
  setHeaderState();

  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("active");
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupRevealAnimations() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}

function setupCounters() {
  const counters = document.querySelectorAll(".counter");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = parseFloat(counter.dataset.target || "0");
      const decimals = parseInt(counter.dataset.decimals || "0", 10);
      const suffix = counter.dataset.suffix || "";
      const duration = 1300;
      const startTime = performance.now();

      function animate(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        counter.textContent = `${current.toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(animate);
        else counter.textContent = `${target.toFixed(decimals)}${suffix}`;
      }

      requestAnimationFrame(animate);
      counterObserver.unobserve(counter);
    });
  }, { threshold: 0.35 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDisplayDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatDisplayTime(value) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute || 0, 0, 0);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getAvailableSlots() {
  const slots = [];
  const startMinutes = URBANFIX.workingHours.startHour * 60;
  const endMinutes = URBANFIX.workingHours.endHour * 60;

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += URBANFIX.workingHours.intervalMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${pad(hour)}:${pad(minute)}`;
    slots.push({ value, label: formatDisplayTime(value) });
  }

  return slots;
}

function updateTimeSlots() {
  const selectedValue = timeSelect.value;
  timeSelect.innerHTML = "";

  if (!dateInput.value) {
    timeSelect.insertAdjacentHTML("beforeend", `<option value="">Select date first</option>`);
    return;
  }

  timeSelect.insertAdjacentHTML("beforeend", `<option value="">Select time</option>`);
  getAvailableSlots().forEach((slot) => {
    const selected = slot.value === selectedValue ? "selected" : "";
    timeSelect.insertAdjacentHTML("beforeend", `<option value="${slot.value}" ${selected}>${slot.label}</option>`);
  });
}

function setMinimumDate() {
  const minDate = formatDateInputValue(getTomorrow());
  dateInput.min = minDate;

  if (!dateInput.value || dateInput.value < minDate) {
    dateInput.value = minDate;
  }

  updateTimeSlots();
}

function setupServiceButtons() {
  document.querySelectorAll(".service-select, .service-chip").forEach((button) => {
    button.addEventListener("click", () => {
      serviceSelect.value = button.dataset.service || "";
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => serviceSelect.focus({ preventScroll: true }), 500);
    });
  });
}

function getBookingData() {
  const formData = new FormData(bookingForm);
  return {
    name: (formData.get("name") || "").trim(),
    phone: (formData.get("phone") || "").trim(),
    email: (formData.get("email") || "").trim(),
    service: (formData.get("service") || "").trim(),
    propertyType: (formData.get("propertyType") || "").trim(),
    date: (formData.get("date") || "").trim(),
    time: (formData.get("time") || "").trim(),
    promoCode: (formData.get("promoCode") || "").trim().toUpperCase(),
    priorityRequest: formData.get("priorityRequest") === "on",
    area: (formData.get("area") || "").trim(),
    message: (formData.get("message") || "").trim(),
    specialInstructions: (formData.get("specialInstructions") || "").trim()
  };
}

function isValidBookingDate(value) {
  if (!value) return false;
  const selected = new Date(`${value}T00:00:00`);
  return selected > getToday();
}

function isValidBookingTime(value) {
  if (!value) return false;
  const [hour, minute] = value.split(":").map(Number);
  const selectedMinutes = hour * 60 + (minute || 0);
  const startMinutes = URBANFIX.workingHours.startHour * 60;
  const endMinutes = URBANFIX.workingHours.endHour * 60;
  return selectedMinutes >= startMinutes && selectedMinutes <= endMinutes;
}

function showStatus(message, type = "success") {
  requestStatus.hidden = false;
  requestStatus.classList.toggle("error", type === "error");
  requestStatus.innerHTML = message;
}

function clearStatus() {
  requestStatus.hidden = true;
  requestStatus.classList.remove("error");
  requestStatus.innerHTML = "";
}

function validateBookingData(data) {
  if (!data.name || !data.phone || !data.service || !data.date || !data.time || !data.area || !data.message) {
    showStatus("Please complete all required fields before sending your request.", "error");
    return false;
  }

  if (!isValidBookingDate(data.date)) {
    showStatus("Same-day booking is not available. Please select tomorrow or any later date.", "error");
    return false;
  }

  if (!isValidBookingTime(data.time)) {
    showStatus("Please choose a booking time between 11:00 AM and 7:00 PM.", "error");
    return false;
  }

  return true;
}

function createBookingReference() {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `UF-${datePart}-${randomPart}`;
}

function buildBookingMessage(data, ref) {
  return `New UrbanFix Service Request\n\n` +
    `Reference: ${ref}\n` +
    `Name: ${data.name}\n` +
    `Phone / WhatsApp: ${data.phone}\n` +
    `Email: ${data.email || "Not provided"}\n` +
    `Required Service: ${data.service}\n` +
    `Priority Request: ${data.priorityRequest ? "Yes" : "No"}\n` +
    `Promo Code: ${data.promoCode || "Not provided"}\n` +
    `Property Type: ${data.propertyType}\n` +
    `Preferred Date: ${formatDisplayDate(data.date)}\n` +
    `Preferred Time: ${formatDisplayTime(data.time)}\n` +
    `Complete Address: ${data.area}\n` +
    `Problem Details: ${data.message}\n` +
    `Special Instructions: ${data.specialInstructions || "Not provided"}\n\n` +
    `Please review this request and call the customer after approval.`;
}

function buildConfirmationMessage(data, ref) {
  return `<strong>Thank you. Your request has been received.</strong><br>` +
    `Your ${escapeHtml(data.service)} request for <strong>${escapeHtml(formatDisplayDate(data.date))}</strong> at <strong>${escapeHtml(formatDisplayTime(data.time))}</strong> has been forwarded to UrbanFix. ` +
    `Once approved, our customer service team will call you. Thank you for your patience.<br>` +
    `<small>Reference: ${escapeHtml(ref)}</small>`;
}

function openEmailRequest(data, ref) {
  const subject = encodeURIComponent(`UrbanFix Service Request - ${ref}`);
  const body = encodeURIComponent(buildBookingMessage(data, ref));
  window.location.href = `mailto:${URBANFIX.email}?subject=${subject}&body=${body}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sendWhatsAppRequest() {
  const data = getBookingData();
  if (!validateBookingData(data)) return;

  const ref = createBookingReference();
  const message = buildBookingMessage(data, ref);
  showStatus(buildConfirmationMessage(data, ref));
  window.open(makeWhatsAppLink(message), "_blank", "noopener");
}

function sendEmailRequest() {
  const data = getBookingData();
  if (!validateBookingData(data)) return;

  const ref = createBookingReference();
  showStatus(buildConfirmationMessage(data, ref));
  openEmailRequest(data, ref);
}

function setupBookingForm() {
  dateInput.addEventListener("change", () => {
    if (dateInput.value && !isValidBookingDate(dateInput.value)) {
      dateInput.value = dateInput.min;
      showStatus("Same-day booking is not available. The date has been changed to the next available date.", "error");
    }
    updateTimeSlots();
  });

  timeSelect.addEventListener("change", () => {
    if (timeSelect.value && !isValidBookingTime(timeSelect.value)) {
      timeSelect.value = "";
      showStatus("Please choose a booking time between 11:00 AM and 7:00 PM.", "error");
    }
  });

  bookingForm.addEventListener("input", clearStatus);

  bookingForm.addEventListener("reset", () => {
    setTimeout(() => {
      clearStatus();
      setMinimumDate();
    }, 0);
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendWhatsAppRequest();
  });

  emailButton.addEventListener("click", sendEmailRequest);
}

function init() {
  yearSpan.textContent = new Date().getFullYear();
  updateContactLinks();
  setupNavigation();
  setupRevealAnimations();
  setupCounters();
  setupServiceButtons();
  setupBookingForm();
  setMinimumDate();
}

document.addEventListener("DOMContentLoaded", init);
