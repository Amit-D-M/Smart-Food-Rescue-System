// 🟢 ADD FOOD (Restaurant)
async function addFood() {
  let name = document.getElementById("food").value;
  let qty = document.getElementById("qty").value;
  let location = document.getElementById("location").value;
  let time = document.getElementById("time").value;

  if (!name || !qty || !location) {
    alert("Please fill all fields");
    return;
  }

  await fetch("http://localhost:5000/add-food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, qty, location, time })
  });

  alert("Food Added Successfully!");
  document.getElementById("food").value = "";
  document.getElementById("qty").value = "";
  document.getElementById("location").value = "";
  document.getElementById("time").value = "";
}

// 🔵 VOLUNTEER PAGE — SHOW FOOD
if (document.getElementById("list")) {
  let volunteerFoods = [];

  async function loadFood(filterStatus = "Available", filterLocation = "") {
    let res = await fetch("http://localhost:5000/foods");
     console.log("CLICKED ID:", id);   // 👈 ADD THIS
    let foods = await res.json();
    volunteerFoods = foods;

    let output = "";

    foods.forEach((item) => {
      if ((filterStatus === "" || item.status === filterStatus) &&
          (filterLocation === "" || item.location.includes(filterLocation))) {
        output += `
          <div class="card">
            <h3>${item.name}</h3>
            <p><b>Qty:</b> ${item.qty}</p>
            <p><b>Location:</b> ${item.location}</p>
            <p><b>Time:</b> ${item.time}</p>
            <p><b>Status:</b> ${item.status}</p>
            ${item.status === "Available" ? `<button onclick="acceptFood('${item._id}')">Accept</button>` : ""}
          </div>
        `;
      }
    });

    document.getElementById("list").innerHTML = output;
  }

  loadFood();
  setInterval(() => loadFood(), 30000);

  window.acceptFood = async function(id) {
    await fetch(`http://localhost:5000/accept/${id}`, { method: "POST" });
    loadFood();
  };

  window.filterVolunteer = (status, location) => loadFood(status, location);
}

// 🟡 NGO PAGE — SHOW ACCEPTED FOOD
if (document.getElementById("ngoList")) {
  async function loadNGO() {
    let res = await fetch("http://localhost:5000/foods");
    let foods = await res.json();

    let output = "";

    foods.forEach((item) => {
      if (item.status === "Accepted") {
        output += `
          <div class="card">
            <h3>${item.name}</h3>
            <p>Qty: ${item.qty}</p>
            <p>From: ${item.location}</p>
            <p>Accepted at: ${item.acceptedAt || "N/A"}</p>
            <button onclick="deliverFood('${item._id}')">Deliver</button>
          </div>
        `;
      }
    });

    document.getElementById("ngoList").innerHTML = output;
  }

  loadNGO();
  setInterval(() => loadNGO(), 30000);

  window.deliverFood = async function(id) {
    await fetch(`http://localhost:5000/deliver/${id}`, { method: "POST" });
    loadNGO();
  };
}

// 🔵 DELIVERY PAGE
if (document.getElementById("deliveryList")) {
  async function loadDelivery() {
    let res = await fetch("http://localhost:5000/foods");
    let foods = await res.json();

    let output = "";

    foods.forEach(item => {
      output += `
        <div class="card">
          <h3>${item.name}</h3>
          <p>Status: ${item.status}</p>
          <p>Accepted at: ${item.acceptedAt || "N/A"}</p>
          <p>Delivered at: ${item.deliveredAt || "N/A"}</p>
        </div>
      `;
    });

    document.getElementById("deliveryList").innerHTML = output;
  }

  loadDelivery();
  setInterval(() => loadDelivery(), 30000);
}

// ⚫ ADMIN PAGE
if (document.getElementById("adminPanel")) {
  async function loadAdmin() {
    let res = await fetch("http://localhost:5000/foods");
    let foods = await res.json();

    let output = "";
    let delivered = 0;

    foods.forEach((item) => {
      if (item.status === "Delivered") delivered++;

      output += `
        <div class="card">
          <h3>${item.name}</h3>
          <p>Qty: ${item.qty}</p>
          <p>Location: ${item.location}</p>
          <p>Status: ${item.status}</p>
          <p>Accepted at: ${item.acceptedAt || "N/A"}</p>
          <p>Delivered at: ${item.deliveredAt || "N/A"}</p>
          <button onclick="editFood('${item._id}')">Edit</button>
          <button onclick="deleteFood('${item._id}')">Delete</button>
        </div>
      `;
    });

    output += `
      <h3>Total: ${foods.length}</h3>
      <h3>Delivered: ${delivered}</h3>
    `;

    document.getElementById("adminPanel").innerHTML = output;
  }

  loadAdmin();
  setInterval(() => loadAdmin(), 30000);

  window.editFood = async (id) => {
    let name = prompt("New Food Name:");
    let qty = prompt("New Quantity:");
    let location = prompt("New Location:");
    if (name && qty && location) {
      await fetch(`http://localhost:5000/edit/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, qty, location })
      });
      loadAdmin();
    }
  };

  window.deleteFood = async (id) => {
    if (confirm("Are you sure to delete?")) {
      await fetch(`http://localhost:5000/delete/${id}`, { method: "POST" });
      loadAdmin();
    }
  };
}