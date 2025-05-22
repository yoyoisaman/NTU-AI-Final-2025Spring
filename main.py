from voyager import Voyager

mc_port = 3798
env_wait_ticks = 100
openai_api_key = ""


voyager = Voyager(
    mc_port=mc_port,
    env_wait_ticks=env_wait_ticks,
    openai_api_key=openai_api_key,
    skill_library_dir="./skill_library/trial3",
    resume=True    
)

# start lifelong learning
voyager.learn(reset_env=False)


