from voyager import Voyager
import os
import json
import signal
import sys
import atexit
from decompose.decompose_agent import DecomposeAgent


mc_port = 5057
env_wait_ticks = 75
openai_api_key = "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"


# /gamemode spectator
# /spectate bot
# /effect give @p minecraft:night_vision 1000000 0 true
# 1312162062533188546

# First instantiate Voyager with skill_library_dir.
voyager = Voyager(
    mc_port=mc_port,
    env_wait_ticks=env_wait_ticks,
    openai_api_key=openai_api_key,
    skill_library_dir="./skill_library/obsidian", # Load a learned skill library.
    ckpt_dir="./run/demo4", # Feel free to use a new dir. Do not use the same dir as skill library because new events will still be recorded to ckpt_dir. 
    resume=False, # Do not resume from a skill library because this is not learning.
)


# voyager = Voyager(
#     mc_port=mc_port,
#     env_wait_ticks=env_wait_ticks,
#     openai_api_key=openai_api_key,
#     ckpt_dir="./run/demo1", # Feel free to use a new dir. Do not use the same dir as skill library because new events will still be recorded to ckpt_dir. 
#     resume=False, # Do not resume from a skill library because this is not learning.
# )

# Run task decomposition
# task = "Craft a Diamond Pickaxe"  # e.g. "Craft a diamond pickaxe"
# sub_goals = voyager.decompose_task(task=task)


# decompose_agent = DecomposeAgent(openai_api_key=openai_api_key)
# task = "Craft a Compass" 
# sub_goals = decompose_agent.decompose(task)

# Read subgoals from file
with open('./Subgoals_Refined_golden_sword.json', 'r') as f:
    sub_goals = json.load(f)
    

print("----------SUB GOAL-----------")
print(sub_goals)

voyager.inference(sub_goals=sub_goals)

# voyager.learn()