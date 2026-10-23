
(function () {
  const labels = ["A", "B", "C", "D", "E"];

  const initial = [
    [0, 5, 0, 0, 0],
    [5, 0, 3, 0, 0],
    [0, 3, 0, 7, 0],
    [0, 0, 7, 0, 2],
    [0, 0, 0, 2, 0]
  ];

  let matrix = clone(initial);
  let history = [];

  const $ = id => document.getElementById(id);

  function clone(data) {
    return data.map(row => row.slice());
  }

  // Convert nonzero matrix entries into COO triplets.
  function triplets() {
    const result = [];

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          result.push({
            r: r,
            c: c,
            v: matrix[r][c]
          });
        }
      }
    }

    return result;
  }

  function pairName(r, c) {
    return labels[r] + "–" + labels[c];
  }

  // Display the adjacency matrix.
  function renderMatrix() {
    let html = "<thead><tr><th></th>";

    html += labels.map(label =>
      `<th>${label}</th>`
    ).join("");

    html += "</tr></thead><tbody>";

    matrix.forEach((row, r) => {
      html += `<tr><th>${labels[r]}</th>`;

      row.forEach((value, c) => {
        let cls = "";

        if (r === c) {
          cls = "diag";
        } else if (value !== 0) {
          cls = "nz";
        }

        html += `
          <td class="${cls}"
              title="${labels[r]} to ${labels[c]}">
            ${value}
          </td>`;
      });

      html += "</tr>";
    });

    $("matrixTable").innerHTML = html + "</tbody>";
  }

  // Display COO triplets in a table.
  function renderTriplets() {
    const data = triplets();

    $("tripletCountTag").textContent =
      data.length + " TRIPLETS";

    if (data.length === 0) {
      $("tripletBody").innerHTML = `
        <tr>
          <td colspan="5" class="table-empty">
            No nonzero entries. Insert a road to begin.
          </td>
        </tr>`;
      return;
    }

    $("tripletBody").innerHTML = data.map((item, i) => `
      <tr>
        <td>${String(i + 1).padStart(2, "0")}</td>
        <td>${item.r}</td>
        <td>${item.c}</td>
        <td>${pairName(item.r, item.c)}</td>
        <td class="value">${item.v} km</td>
      </tr>
    `).join("");
  }

  // Display triplets as linked-list nodes.
  function renderNodes() {
    const data = triplets();

    if (data.length === 0) {
      $("linkedNodes").innerHTML =
        '<div class="null-node">HEAD → NULL</div>';
      return;
    }

    let html = "";

    data.forEach((item, i) => {
      html += `
        <div class="node-wrap">
          <div class="node">
            <div class="node-head">
              NODE ${String(i + 1).padStart(2, "0")}
            </div>
            <div class="node-fields">
              <span title="Row">${item.r}</span>
              <span title="Column">${item.c}</span>
              <span title="Value">${item.v}</span>
            </div>
          </div>
          <div class="node-arrow">→</div>
        </div>`;
    });

    html += '<div class="null-node">NULL</div>';

    $("linkedNodes").innerHTML = html;
  }

  // Update the summary figures.
  function renderMetrics() {
    const n = matrix.length;
    const count = triplets().length;
    const total = n * n;

    $("verticesCount").textContent = n;
    $("nonzeroCount").textContent = count;

    $("densityValue").textContent =
      (count / total * 100).toFixed(1) + "%";

    $("storageValue").textContent =
      ((total - count) / total * 100).toFixed(1) + "%";
  }

  function renderAll() {
    renderMatrix();
    renderTriplets();
    renderNodes();
    renderMetrics();
  }

  function show(box, message, type) {
    box.className = "result show " + type;
    box.textContent = message;
  }

  // Add an entry to the operation history.
  function log(title, detail) {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    history.unshift({ title, detail, now });
    history = history.slice(0, 6);

    renderHistory();
  }

  function renderHistory() {
    const box = $("historyList");

    if (history.length === 0) {
      box.innerHTML = `
        <div class="table-empty">
          No operations yet. Your actions will appear here.
        </div>`;
      return;
    }

    const icons = {
      Insert: "+",
      Update: "↻",
      Delete: "−",
      Search: "⌕",
      Convert: "⇄",
      Reconstruct: "▦",
      Reset: "↺"
    };

    box.innerHTML = history.map(item => `
      <div class="history-item">
        <div class="history-mark">
          ${icons[item.title] || "•"}
        </div>
        <div class="history-text">
          <strong>${item.title}</strong>
          ${item.detail}
        </div>
        <div class="history-time">${item.now}</div>
      </div>
    `).join("");
  }

  function fillSelects() {
    ["fromNode", "toNode"].forEach(id => {
      $(id).innerHTML = labels.map((label, index) =>
        `<option value="${index}">
          ${label} — Intersection ${index + 1}
        </option>`
      ).join("");
    });
  }

  function getPair() {
    return {
      a: Number($("fromNode").value),
      b: Number($("toNode").value)
    };
  }

  function getDistance() {
    return Number($("distanceInput").value);
  }

  function validPair(a, b) {
    if (a === b) {
      show(
        $("resultBox"),
        "Choose two different intersections. Self-connections are not supported.",
        "error"
      );
      return false;
    }

    return true;
  }

  // Roads are undirected, so update both matrix positions.
  function setRoad(a, b, value) {
    matrix[a][b] = value;
    matrix[b][a] = value;
  }

  // INSERT a new road.
  $("insertBtn").addEventListener("click", () => {
    const { a, b } = getPair();
    const value = getDistance();

    if (!validPair(a, b)) return;

    if (!Number.isFinite(value) || value <= 0) {
      show(
        $("resultBox"),
        "Enter a positive distance before inserting a road.",
        "error"
      );
      return;
    }

    if (matrix[a][b] !== 0) {
      show(
        $("resultBox"),
        `Road ${pairName(a, b)} already exists. Use Update to change its distance.`,
        "error"
      );
      return;
    }

    setRoad(a, b, value);
    renderAll();

    show(
      $("resultBox"),
      `Road ${pairName(a, b)} inserted at ${value} km. Both directions have been updated.`,
      "ok"
    );

    log("Insert", `${pairName(a, b)} added at ${value} km`);
  });

  // UPDATE an existing road.
  $("updateBtn").addEventListener("click", () => {
    const { a, b } = getPair();
    const value = getDistance();

    if (!validPair(a, b)) return;

    if (!Number.isFinite(value) || value <= 0) {
      show(
        $("resultBox"),
        "Enter a positive distance before updating a road.",
        "error"
      );
      return;
    }

    if (matrix[a][b] === 0) {
      show(
        $("resultBox"),
        `No road exists between ${labels[a]} and ${labels[b]}. Use Insert first.`,
        "error"
      );
      return;
    }

    const oldValue = matrix[a][b];

    setRoad(a, b, value);
    renderAll();

    show(
      $("resultBox"),
      `Road ${pairName(a, b)} updated from ${oldValue} km to ${value} km.`,
      "ok"
    );

    log(
      "Update",
      `${pairName(a, b)} changed from ${oldValue} to ${value} km`
    );
  });

  // DELETE an existing road.
  $("deleteBtn").addEventListener("click", () => {
    const { a, b } = getPair();

    if (!validPair(a, b)) return;

    if (matrix[a][b] === 0) {
      show(
        $("resultBox"),
        `No direct road exists between ${labels[a]} and ${labels[b]}.`,
        "error"
      );
      return;
    }

    const oldValue = matrix[a][b];

    setRoad(a, b, 0);
    renderAll();

    show(
      $("resultBox"),
      `Road ${pairName(a, b)} (${oldValue} km) deleted from both directions.`,
      "ok"
    );

    log("Delete", `${pairName(a, b)} removed`);
  });

  // SEARCH for a road.
  $("searchBtn").addEventListener("click", () => {
    const { a, b } = getPair();

    if (!validPair(a, b)) return;

    if (matrix[a][b] === 0) {
      show(
        $("resultBox"),
        `No direct road exists between ${labels[a]} and ${labels[b]}.`,
        "info"
      );

      log("Search", `No road found for ${pairName(a, b)}`);
    } else {
      show(
        $("resultBox"),
        `Road ${pairName(a, b)} exists. Distance: ${matrix[a][b]} km.`,
        "ok"
      );

      log(
        "Search",
        `${pairName(a, b)} found: ${matrix[a][b]} km`
      );
    }
  });

  // CONVERT the matrix into COO triplets.
  $("convertBtn").addEventListener("click", () => {
    renderTriplets();
    renderNodes();

    show(
      $("conversionResult"),
      `Conversion complete: ${matrix.length} × ${matrix.length} matrix scanned; ${triplets().length} nonzero entries represented as COO triplets.`,
      "ok"
    );

    log("Convert", `Matrix converted to ${triplets().length} COO triplets`);
  });

  // RECONSTRUCT the matrix from its nonzero entries.
  $("reconstructBtn").addEventListener("click", () => {
    const data = triplets();

    const rebuilt = Array.from(
      { length: matrix.length },
      () => Array(matrix.length).fill(0)
    );

    data.forEach(item => {
      rebuilt[item.r][item.c] = item.v;
    });

    const same = rebuilt.every((row, r) =>
      row.every((value, c) => value === matrix[r][c])
    );

    matrix = rebuilt;
    renderAll();

    show(
      $("conversionResult"),
      same
        ? "Reconstruction successful. The matrix matches the current COO entries."
        : "Reconstruction completed. Review the resulting matrix.",
      "ok"
    );

    log(
      "Reconstruct",
      same
        ? "Matrix reconstructed; validation passed"
        : "Matrix reconstructed"
    );
  });

  // RESTORE the original network.
  $("resetBtn").addEventListener("click", () => {
    matrix = clone(initial);

    $("distanceInput").value = "";
    $("resultBox").className = "result";
    $("conversionResult").className = "result";

    renderAll();
    log("Reset", "Original five-intersection network restored");
  });

  // Clear the history panel.
  $("clearHistoryBtn").addEventListener("click", () => {
    history = [];
    renderHistory();
  });

  // Initial setup.
  fillSelects();
  renderAll();
  renderHistory();
})();
