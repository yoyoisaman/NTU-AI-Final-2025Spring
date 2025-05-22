from voyager import Voyager
import os
import json
import signal
import sys
import atexit


mc_port = 59653
env_wait_ticks = 50
openai_api_key = ""
class PromptCounter:
    def __init__(self):
        self.action_agent_prompts = 0
        self.curriculum_agent_prompts = 0
        self.critic_agent_prompts = 0
        self.total_prompts = 0
    
    def print_stats(self):
        print("\n===== Prompt 使用 =====")
        print(f"Action Agent Prompts: {self.action_agent_prompts}")
        print(f"Curriculum Agent Prompts: {self.curriculum_agent_prompts}")
        print(f"Critic Agent Prompts: {self.critic_agent_prompts}")
        print(f"共 Prompts: {self.total_prompts}")
        print("==========================\n")
prompt_counter = PromptCounter()

# /gamemode spectator
# /spectate bot

# First instantiate Voyager with skill_library_dir.
voyager = Voyager(
    mc_port=mc_port,
    env_wait_ticks=env_wait_ticks,
    openai_api_key=openai_api_key,
    skill_library_dir="./skill_library/obsidian", # Load a learned skill library.
    ckpt_dir="./run/obsidian_ckpt", # Feel free to use a new dir. Do not use the same dir as skill library because new events will still be recorded to ckpt_dir. 
    resume=True, # Do not resume from a skill library because this is not learning.
)

original_action_llm = voyager.action_agent.llm
original_curriculum_llm = voyager.curriculum_agent.llm
original_critic_llm = voyager.critic_agent.llm

def counted_action_llm(*args, **kwargs):
    prompt_counter.action_agent_prompts += 1
    prompt_counter.total_prompts += 1
    return original_action_llm(*args, **kwargs)

def counted_curriculum_llm(*args, **kwargs):
    prompt_counter.curriculum_agent_prompts += 1
    prompt_counter.total_prompts += 1
    return original_curriculum_llm(*args, **kwargs)

def counted_critic_llm(*args, **kwargs):
    prompt_counter.critic_agent_prompts += 1
    prompt_counter.total_prompts += 1
    return original_critic_llm(*args, **kwargs)

voyager.action_agent.llm = counted_action_llm
voyager.curriculum_agent.llm = counted_curriculum_llm
voyager.critic_agent.llm = counted_critic_llm

def exit_handler():
    prompt_counter.print_stats()

atexit.register(exit_handler)

def signal_handler(sig, frame):
    prompt_counter.print_stats()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Run task decomposition
# task = "Craft a diamond pickaxe" # e.g. "Craft a diamond pickaxe"
# sub_goals = voyager.decompose_task(task=task)

# Read subgoals from file
with open('./Subgoals_Refined_diamond_pickaxe.json', 'r') as f:
    sub_goals = json.load(f)
    
print("----------SUB GOAL-----------")
print(sub_goals)

# voyager.inference(sub_goals=sub_goals)Mine 1 Obsidian
voyager.learn(reset_env=False)