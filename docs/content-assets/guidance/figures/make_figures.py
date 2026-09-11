"""Render original synthetic examples. These are not product benchmarks."""

# %% Paths and settings
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "figures"
os.environ.setdefault("MPLCONFIGDIR", str(ROOT / ".cache" / "matplotlib"))

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

OUT.mkdir(parents=True, exist_ok=True)
COLORS = ["#40675a", "#b16e42", "#497994"]
plt.rcParams.update(
    {
        "font.family": "DejaVu Sans",
        "font.size": 11,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.labelcolor": "#243d34",
        "text.color": "#243d34",
        "xtick.color": "#476153",
        "ytick.color": "#476153",
        "axes.edgecolor": "#a7b3a7",
        "figure.facecolor": "#f7f6f0",
        "axes.facecolor": "#f7f6f0",
        "savefig.facecolor": "#f7f6f0",
    }
)
examples = {
    "provenance": "Original constructed examples. Not observations or product output."
}


def finish(fig, name):
    """Save the same standalone figure in PNG and PDF formats."""
    fig.text(
        0.015,
        0.975,
        "SYNTHETIC EXAMPLE / NOT PRODUCT PERFORMANCE",
        va="top",
        fontsize=9,
    )
    for ax in fig.axes:
        ax.set_axisbelow(True)
        ax.grid(axis="y", color="#dce1d8", linewidth=0.6)
    fig.tight_layout(rect=(0.01, 0.01, 0.99, 0.93))
    fig.savefig(OUT / f"{name}.png", dpi=120)
    fig.savefig(OUT / f"{name}.pdf", metadata={"CreationDate": None, "ModDate": None})
    plt.close(fig)
    print(f"Rendered {name}", flush=True)


# %% Annual total and seasonality
monthly = np.array([160, 140, 100, 80, 60, 40, 20, 20, 40, 60, 100, 140])
flat = np.full(12, 80)
assert monthly.sum() == flat.sum() == 960
examples["annual-precipitation"] = {
    "seasonal_mm": monthly.tolist(),
    "uniform_mm": flat.tolist(),
}
fig, ax = plt.subplots(figsize=(10, 5.17))
x = np.arange(12)
ax.bar(
    x - 0.18,
    monthly,
    0.36,
    color=COLORS[0],
    label=f"Seasonal example: {monthly.sum()} mm/year",
)
ax.bar(
    x + 0.18,
    flat,
    0.36,
    color=COLORS[1],
    label=f"Uniform example: {flat.sum()} mm/year",
)
ax.set_xticks(
    x,
    [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ],
)
ax.set_ylabel("Monthly precipitation (mm)")
ax.set_ylim(0, 225)
ax.legend(frameon=False, loc="upper right")
finish(fig, "annual-precipitation")

# %% Identical daily totals, different hourly maxima
steady = np.full(24, 2)
burst = np.zeros(24, dtype=int)
burst[12:14] = [18, 30]
assert steady.sum() == burst.sum() == 48
examples["annual-maximum"] = {
    "steady_hourly_mm": steady.tolist(),
    "burst_hourly_mm": burst.tolist(),
}
fig, axes = plt.subplots(1, 2, figsize=(10, 5.17), sharey=True)
for ax, data, name, color in zip(
    axes, [steady, burst], ["Steady rainfall", "Two-hour burst"], COLORS
):
    ax.bar(np.arange(24), data, color=color)
    ax.set_title(
        f"{name}\nDaily total: {data.sum()} mm | Hourly max: {data.max()} mm",
        fontsize=11,
        pad=14,
    )
    ax.set_xlabel("Hour of day")
    ax.set_xticks([0, 6, 12, 18, 23])
    ax.set_ylim(0, 34)
axes[0].set_ylabel("Hourly precipitation (mm)")
finish(fig, "annual-maximum")

# %% Equal wet frequency, different spell length
alternating = np.tile([0, 2], 6)
clustered = np.array([2] * 6 + [0] * 6)
assert alternating.sum() == clustered.sum() == 12
assert (alternating >= 1).sum() == (clustered >= 1).sum() == 6
examples["intermittency"] = {
    "alternating_daily_mm": alternating.tolist(),
    "clustered_daily_mm": clustered.tolist(),
    "wet_threshold_mm_day": 1,
}
fig, axes = plt.subplots(2, 1, figsize=(10, 5.17), sharex=True, sharey=True)
for ax, data, name, color in zip(
    axes,
    [alternating, clustered],
    ["Alternating sequence", "Clustered sequence"],
    COLORS,
):
    ax.bar(np.arange(1, 13), data, color=color)
    ax.axhline(1, color="#707870", linestyle="--", linewidth=1)
    ax.set_title(f"{name} | 6 wet days | 12 mm total", loc="left", fontsize=11)
    ax.set_ylabel("Rain (mm/day)")
    ax.set_ylim(0, 2.8)
axes[1].set_xticks(np.arange(1, 13))
axes[1].set_xlabel("Day in the example window (dashed line: 1 mm/day wet threshold)")
finish(fig, "intermittency")

# %% Phase sensitivity, explicitly mathematical (not empirical)
temperature = np.linspace(-5, 7, 121)
curves = [1 / (1 + np.exp(-(temperature - midpoint) / 0.8)) for midpoint in [0, 2]]
examples["precipitation-phase"] = {
    "temperature_c": temperature.tolist(),
    "transition_midpoints_c": [0, 2],
    "slope_scale_c": 0.8,
    "rain_fractions": [curve.tolist() for curve in curves],
}
fig, ax = plt.subplots(figsize=(10, 5.17))
for curve, midpoint, color, style in zip(curves, [0, 2], COLORS, ["-", "--"]):
    ax.plot(
        temperature,
        curve,
        color=color,
        linestyle=style,
        linewidth=2.5,
        label=f"Illustrative midpoint: {midpoint} °C",
    )
ax.set_xlabel("Air temperature (°C)")
ax.set_ylabel("Illustrative rain fraction (0-1)")
ax.set_ylim(-0.03, 1.03)
ax.legend(loc="upper left", frameon=False)
finish(fig, "precipitation-phase")

# %% Equal marginals, different dependence and basin maxima
cell_a = np.array([0, 0, 20, 0, 0, 0])
cell_b = np.array([0, 0, 0, 0, 20, 0])
assert np.array_equal(np.sort(cell_a), np.sort(cell_b))
examples["spatial-coherence"] = {
    "cell_a_daily_mm": cell_a.tolist(),
    "synchronized_cell_b_daily_mm": cell_a.tolist(),
    "staggered_cell_b_daily_mm": cell_b.tolist(),
    "cell_weights": [0.5, 0.5],
}
fig, axes = plt.subplots(1, 2, figsize=(10, 5.17), sharey=True)
x = np.arange(1, 7)
for ax, second, name in zip(axes, [cell_a, cell_b], ["Synchronized", "Staggered"]):
    basin = (cell_a + second) / 2
    ax.bar(x - 0.18, cell_a, 0.36, color=COLORS[0], label="Cell A")
    ax.bar(x + 0.18, second, 0.36, color=COLORS[1], label="Cell B")
    ax.plot(x, basin, color=COLORS[2], marker="o", linewidth=2, label="Basin mean")
    ax.set_title(f"{name}\nBasin maximum: {basin.max():g} mm/day", fontsize=12, pad=14)
    ax.set_xlabel("Day")
    ax.set_xticks(x)
    ax.set_ylim(0, 29)
    ax.legend(loc="upper right", frameon=False, fontsize=9)
axes[0].set_ylabel("Daily precipitation (mm)")
finish(fig, "spatial-coherence")

# %% Public provenance
(OUT / "examples.json").write_text(json.dumps(examples, indent=2) + "\n")
(OUT / "make_figures.py").write_text(Path(__file__).read_text())
