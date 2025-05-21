import openai
import json
import os
from typing import List
import asyncio

openai.api_key = os.getenv("OPENAI_API_KEY") 

def decompose_task_into_subgoals(main_task: str, detailed_guide: str) -> List[str]:
    prompt = f"""
    You are an expert Minecraft task decomposition agent. Your goal is to break down a main Minecraft task into a strictly ordered list of atomic subgoals. Each subgoal should be the smallest possible actionable step.

    You should assume the player starts with absolutely nothing in their inventory and all resources must be acquired from scratch. 
    For example start from :mine 20 wood, create 1 create table, place 1 create table

    Consider the following main task: "{main_task}"

    Here is a detailed guide for completing this task, which you should use as reference for materials, steps, and considerations:
    --- Detailed Guide ---
    {detailed_guide}
    --- End of Detailed Guide ---

    When decomposing, adhere to these strict rules:
    0. Each subgoal should follow a concise format, such as "Mine [quantity] [block]", "Craft [quantity] [item]", "Smelt [quantity] [item]", "Place [quantity] [item]".
    1.  **Atomic Subgoals**: Each subgoal must be the smallest possible actionable step. For example, instead of "Craft an Iron Pickaxe", break it down into:
        - "Mine 10 Iron Ore"
        - "Craft 1 Furnace"
        - "Smelt 10 Iron Ore"
        - "Craft 1 Iron Pickaxe (one pickaxe need 3 iron)"
    2.  **Strict Ordering**: Subgoals must be in the exact chronological order they need to be completed. For example, "Craft 1 Wooden Pickaxe" must come after "Mine 5 Wood" and "Craft 1 Crafting Table".
    3.  **Clarity and Actionability**: Each subgoal should be a clear, concise instruction.
    
    Provide your response ONLY as a JSON array of strings, where each string is a subgoal.
    Example:
    ["Mine 3 wood logs", "Craft 1 crafting table", "Place 1 crafting table", ...]

    Start decomposing the task now.
    """

    print("\n呼叫 GPT 進行任務拆分...")
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",  
            response_format={"type": "json_object"}, 
            messages=[
                {"role": "system", "content": "You are a Minecraft task decomposition agent. You output only a JSON array of ordered, atomic subgoals."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000 
        )
        
        json_response = response.choices[0].message.content
        print(json_response)
        return json.loads(json_response)
    except json.JSONDecodeError as e:
        print(f"解析 GPT 輸出 JSON 錯誤: {e}")
        print(f"原始 GPT 輸出: {response.choices[0].message.content}")
        return []
    except Exception as e:
        print(f"呼叫 OpenAI API 錯誤: {e}")
        return []

async def main():

    input_file_path = "TaskPrepare.json"
    main_task = ""
    detailed_guide = ""

    try:
        with open(input_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            main_task = data.get("task", "Unknown Task")
            detailed_guide = data.get("guide", "No detailed guide provided.")
        print(f"成功從 {input_file_path} 讀取任務：'{main_task}'")
    except FileNotFoundError:
        print(f"錯誤：找不到輸入檔案 {input_file_path}。將使用預設範例。")
        return
    except json.JSONDecodeError:
        print(f"錯誤：TaskPrepare.json 檔案損壞或格式不正確。請檢查檔案內容。")
        return

    if not main_task or not detailed_guide:
        print("無法獲取任務或詳細指南，終止執行。")
        return
    subgoals = decompose_task_into_subgoals(main_task, detailed_guide)

    output_file_name = "Subgoals-before-Refine.json"
    if subgoals:
        try:
            with open(output_file_name, "w", encoding="utf-8") as f:
                json.dump(subgoals, f, ensure_ascii=False, indent=4)
            print(f"\n子任務列表已成功儲存到 {output_file_name}")
        except Exception as e:
            print(f"儲存 JSON 檔案時發生錯誤: {e}")
    else:
        print("\n未生成子任務列表。")

if __name__ == "__main__":
    asyncio.run(main())