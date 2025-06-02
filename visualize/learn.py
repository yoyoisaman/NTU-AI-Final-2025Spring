import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib.lines import Line2D  

learn_log1 = {
    (1, 1): "wood log",
    (9, 1): "",
    (10, 5): "wooden pickaxe",
    (12, 5): "",
    (13, 6): "cobblestone",
    (14, 6): "",
    (15, 7): "stone pickaxe",
    (16, 7): "",
    (17, 8): "coal",
    (18, 9): "raw copper",
    (19, 9): "",
    (20, 10): "granite",
    (21, 10): "",
    (22, 11): "raw iron",
    (23, 11): "",
    (24, 13): "iron ingot",
    (27, 13): "",
    (28, 14): "lapis lazuli",
    (29, 14): "",
    (30, 15): "iron pickaxe",
    (33, 15): "",
    (34, 16): "copper ingot",
    (35, 16): "",
    (36, 17): "diamond",
    (37, 18): "raw gold",
    (38, 19): "gold ingot",
    (39, 20): "diamond pickaxe",
    (40, 20): "",
    (41, 21): "chest",
    (42, 22): "deepslate",
}

learn_log2 = {
    (1, 1): "wood log",
    (2, 2): "plank",
    (11, 2): "",
    (12, 5): "wooden pickaxe",
    (13, 6): "cobblestone",
    (14, 6): "",
    (15, 7): "raw copper",
    (16, 8): "coal",
    (19, 8): "",
    (20, 9): "lapis lazuli",
    (21, 10): "diorite",
    (36, 10): "",
    (37, 11): "raw iron",
}

sorted_items1 = sorted(learn_log1.items(), key=lambda kv: kv[0][0])
xs1 = [item[0][0] for item in sorted_items1]
ys1 = [item[0][1] for item in sorted_items1]

sorted_items2 = sorted(learn_log2.items(), key=lambda kv: kv[0][0])
xs2 = [item[0][0] for item in sorted_items2]
ys2 = [item[0][1] for item in sorted_items2]

xs1 = [0] + xs1
ys1 = [0] + ys1
xs2 = [0] + xs2
ys2 = [0] + ys2
last_y1 = ys1[-1]
last_y2 = ys2[-1]
xs1.append(50)
ys1.append(last_y1)
xs2.append(50)
ys2.append(last_y2)

sns.set_style("whitegrid", {"grid.color": "#F2F2F2"})

fig, ax = plt.subplots(figsize=(8, 5))

ax.plot(xs1, ys1, color="orange", linewidth=2.5, solid_capstyle="butt")
ax.plot(xs2, ys2, color="purple", linewidth=2.5, solid_capstyle="butt")

ax.set_xlim(-2, 45)
max_y = max(max(ys1), max(ys2))
ax.set_ylim(-2, max_y + 4)

for spine in ["top", "right", "bottom", "left"]:
    ax.spines["top"].set_visible(True)
    ax.spines["right"].set_visible(True)
    ax.spines["top"].set_color("#D9D9D9")
    ax.spines["right"].set_color("#D9D9D9")
    ax.spines["top"].set_linewidth(0.5)
    ax.spines["right"].set_linewidth(0.5)

ax.tick_params(axis="x", direction="in", pad=8, labelsize=13)
ax.tick_params(axis="y", direction="in", pad=8, labelsize=13)

ax.set_yticks(np.arange(0, 25, 4))

# ax.set_xlabel("Prompt Iterations", fontsize=13)
ax.set_ylabel("Number of Distinct Items", fontsize=13)

arrowprops = dict(
    arrowstyle="-|>",
    color="black",
    linewidth=1.5,
    mutation_scale=16,
    shrinkA=0,
    shrinkB=0,
    clip_on=False,
    joinstyle="miter"
)

ax.annotate(
    "",
    xy=(1, 0),
    xytext=(0, 0),
    xycoords="axes fraction",
    textcoords="axes fraction",
    arrowprops=arrowprops
)
ax.annotate(
    "",
    xy=(0, 1),
    xytext=(0, 0),
    xycoords="axes fraction",
    textcoords="axes fraction",
    arrowprops=arrowprops
)

fig.subplots_adjust(left=0.08, bottom=0.14, right=0.96, top=0.95) 

orange_line = Line2D([0], [0], color="orange", linewidth=2, solid_capstyle="butt")
purple_line = Line2D([0], [0], color="purple", linewidth=2, solid_capstyle="butt")
fig.legend(handles=[orange_line, purple_line],
           labels=["Voyager+++ (Ours)", "Voyager"],
           loc="lower center", ncol=2, frameon=False,
           fontsize=12, columnspacing=1.5)

plt.savefig("./visualize/output/learn_raw.svg", dpi=300, bbox_inches="tight")
plt.show()