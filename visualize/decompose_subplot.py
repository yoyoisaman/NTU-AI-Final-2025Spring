import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib.offsetbox import OffsetImage, AnnotationBbox

def plot_craft_data(ax, data1_list, data2_list, title):
    unique_labels = []
    for label, _ in data1_list:
        if label not in unique_labels:
            unique_labels.append(label)

    label_to_y = {lab: i for i, lab in enumerate(unique_labels)}

    x_max = 50

    x1 = [-0.3]
    y1 = [label_to_y[data1_list[0][0]]]
    for lab, x in data1_list:
        x1.append(x)
        y1.append(label_to_y[lab])
    x1.append(49.5)
    y1.append(label_to_y[data1_list[-1][0]])

    x2 = [-0.3]
    y2 = [label_to_y[data2_list[0][0]]]
    for lab, x in data2_list:
        x2.append(x)
        y2.append(label_to_y[lab])
    x2.append(49.5)
    y2.append(label_to_y[data2_list[-1][0]])

    sns.set_style("whitegrid", {"grid.color": "#F2F2F2"})

    ax.hlines(label_to_y[unique_labels[-1]], 0, 49.5, color="black", linewidth=2.5, linestyles="--")
    ax.plot(x1, y1, color="orange", linewidth=3, solid_capstyle="butt")
    ax.plot(x2, y2, color="purple", linewidth=3, solid_capstyle="butt")

    for (lab_i, x_i), (lab_j, x_j) in zip(data1_list, data1_list[1:]):
        if lab_i == lab_j:
            ax.hlines(label_to_y[lab_i], x_i, x_j, color="orange", linewidth=3)
    for (lab_i, x_i), (lab_j, x_j) in zip(data2_list, data2_list[1:]):
        if lab_i == lab_j:
            ax.hlines(label_to_y[lab_i], x_i, x_j, color="purple", linewidth=3)

    for spine in ax.spines.values():
        spine.set_color("black")
        spine.set_linewidth(0.6)
        spine.set_linestyle("-")

    ax.tick_params(
        axis="x", which="both", direction="out", length=4, width=0.6,
        bottom=True, top=False, pad=6
    )
    ax.tick_params(
        axis="y", which="both", direction="out", length=4, width=0.6,
        left=True, right=False, pad=6
    )

    ax.set_xlim(-6, x_max)
    ax.set_ylim(-1, len(unique_labels))
    ax.set_xticks(np.arange(0, x_max + 1, 10))
    ax.set_xticklabels(np.arange(0, x_max + 1, 10), fontsize=12.5)
    ax.set_yticks(range(len(unique_labels)))
    ax.set_yticklabels(unique_labels, fontsize=12.5)
    ax.set_xlabel("Prompting Iterations in Code Generation", fontsize=12.5)
    ax.set_title(title, fontsize=15, fontweight="bold")

    for i, lab in enumerate(unique_labels):
        fname = "./visualize/images/" + lab.replace(" ", "_") + ".png"
        img = plt.imread(fname)
        offset_image = OffsetImage(img, zoom=0.23)
        ab = AnnotationBbox(offset_image, (-3, i), frameon=False)
        ax.add_artist(ab)