from voyager import Voyager
import os


mc_port = 11944
env_wait_ticks = 50
openai_api_key = os.getenv("OPENAI_API_KEY") 




# First instantiate Voyager with skill_library_dir.
voyager = Voyager(
    mc_port=mc_port,
    env_wait_ticks=env_wait_ticks,
    openai_api_key=openai_api_key,
    skill_library_dir="./ckpt", # Load a learned skill library.
    ckpt_dir="./run/demo", # Feel free to use a new dir. Do not use the same dir as skill library because new events will still be recorded to ckpt_dir. 
    resume=False, # Do not resume from a skill library because this is not learning.
)
# Run task decomposition
# task = "Mine 9 obsidian" # e.g. "Craft a diamond pickaxe"
# sub_goals = voyager.decompose_task(task=task)

print("----------SUB GOAL-----------")
print(sub_goals)

voyager.inference(sub_goals=sub_goals)