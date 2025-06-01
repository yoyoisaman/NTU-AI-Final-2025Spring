from decompose_subplot import plot_craft_data
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.lines import Line2D

obj1_data1 = [
    ("wood log", 1),
    ("crafting table", 2),
    ("crafting table", 4),
    ("wooden pickaxe", 5),
    ("wooden pickaxe", 8),
    ("stone pickaxe", 9),
    ("stone pickaxe", 10),
    ("furnace", 11),
    ("iron ingot", 12),
    ("iron pickaxe", 13),
    ("raw gold", 14),
    ("raw gold", 15),
    ("gold ingot", 16),
    ("golden sword", 17),
]

obj1_data2 = [
    ("wood log", 1),
    ("crafting table", 2),
    ("crafting table", 10),
    ("wooden pickaxe", 11),
    ("wooden pickaxe", 27),
    ("stone pickaxe", 28),
    ("stone pickaxe", 29),
    ("furnace", 30),
    ("furnace", 31),
    ("iron ingot", 32),
    ("iron ingot", 34),
    ("iron pickaxe", 35),
    ("raw gold", 36),
    ("raw gold", 37),
    ("gold ingot", 38),
    ("gold ingot", 43),
    ("golden sword", 44),
]

obj2_data1 = [
    ("wood log", 1),
    ("crafting table", 2),
    ("crafting table", 10),
    ("wooden pickaxe", 11),
    ("stone pickaxe", 12),
    ("stone pickaxe", 20),
    ("raw iron", 21),
    ("raw iron", 22),
    ("furnace", 22.5),
    ("iron ingot", 23),
    ("iron ingot", 24),
    ("bucket", 25),
    ("bucket", 27),
    ("lava source", 28),
    ("lava source", 31),
    ("lava bucket", 32),
]

obj2_data2 = [
    ("wood log", 1),
    ("crafting table", 2),
    ("crafting table", 14),
    ("wooden pickaxe", 15),
]

obj3_data1 = obj1_data1
obj3_data2 = obj1_data2
obj4_data1 = obj2_data1
obj4_data2 = obj2_data2

sns.set_style("whitegrid", {"grid.color": "#F2F2F2"})

fig, axes = plt.subplots(2, 2, figsize=(10.6, 3.7 * 2 + 0.5))
plot_craft_data(axes[0, 0], obj1_data1, obj1_data2, "Craft a Golden Sword")
plot_craft_data(axes[0, 1], obj2_data1, obj2_data2, "Collect a Lava Bucket")
plot_craft_data(axes[1, 0], obj3_data1, obj3_data2, "Third Scenario")
plot_craft_data(axes[1, 1], obj4_data1, obj4_data2, "Fourth Scenario")

orange_line = Line2D([0], [0], color="orange", linewidth=2, solid_capstyle="butt")
purple_line = Line2D([0], [0], color="purple", linewidth=2, solid_capstyle="butt")
fig.legend(
    handles=[orange_line, purple_line],
    labels=["Voyager+ (Ours)", "Voyager"],
    loc="lower center",
    ncol=2,
    frameon=False,
    fontsize=12,
    columnspacing=0.7
)

line = Line2D([0, 1], [0.045, 0.045], transform=fig.transFigure, color="#C8C8C8", linewidth=0.5, solid_capstyle="butt")
fig.add_artist(line)

plt.tight_layout(rect=[0, 0.053, 1, 1])
fig.savefig("./visualize/output/decompose_4obj.svg", dpi=300)
plt.show()
