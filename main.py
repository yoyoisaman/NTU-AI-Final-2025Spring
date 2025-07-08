from voyager import Voyager
import json

from decompose.decompose_agent import DecomposeAgent


mc_port = your_minecraft_port
env_wait_ticks = 75
openai_api_key = ""



# First instantiate Voyager with skill_library_dir.
voyager = Voyager(
    mc_port=mc_port,
    env_wait_ticks=env_wait_ticks,
    openai_api_key=openai_api_key,
    skill_library_dir="./skill_library/test", # Load a learned skill library.
    ckpt_dir="./run/demo", # Feel free to use a new dir. Do not use the same dir as skill library because new events will still be recorded to ckpt_dir. 
    resume=False, # Do not resume from a skill library because this is not learning.
)


task = "YOUR TASK" # e.g. "Craft a diamond pickaxe"


# 1.Run task decomposition of original Voyager
# sub_goals = voyager.decompose_task(task=task)

# 2.Run task decomposition of Voyager+++
decompose_agent = DecomposeAgent(openai_api_key=openai_api_key)
sub_goals = decompose_agent.decompose(task)
    

print("----------SUB GOAL-----------")
print(sub_goals)

voyager.inference(sub_goals=sub_goals)


# 
# voyager.learn()