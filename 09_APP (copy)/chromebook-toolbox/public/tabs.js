// Tab switching logic
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-tab");
    document.querySelectorAll(".tab-content").forEach(tab =>
      tab.classList.toggle("active", tab.id === id)
    );
  });
});

// Show terminal by default
document.getElementById("terminal").classList.add("active");
