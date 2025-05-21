import openai
import json
import os
import asyncio
from typing import List, Dict, Union
import re 


openai.api_key = os.getenv("OPENAI_API_KEY") 


async def refine_subgoals(main_task: str, detailed_guide: str, subgoals_list: List[str]) -> List[str]:

    subgoals_to_refine_str = "\n".join([f"- {subgoal}" for subgoal in subgoals_list])

    prompt = f"""
    You are an expert Minecraft task refinement agent. Your goal is to review, correct, and optimize a given ordered list of atomic Minecraft subgoals based on specific rules and the provided detailed guide.

    Main Task: "{main_task}"

    Detailed Guide for reference (materials, steps, and considerations):

    Subgoals to be refined:
    --- Original Subgoals ---
    {subgoals_to_refine_str}
    --- End of Original Subgoals ---

   
    Apply the following strict refinement rules:
    1. **Correct Task Order & Tool Dependencies**:
        - Review the entire sequence for correct chronological order and essential tool dependencies.
        - **Rule**: A tool MUST be acquired (mined/crafted) *before* it is used to mine or break a required resource.
        - **Tool Progression**:
            - **Hand**: Can mine wood, dirt, gravel (for flint), sand.
            - **Wooden Pickaxe**: Can mine stone (cobblestone), coal ore.
            - **Stone Pickaxe**: Can mine stone, coal ore, iron ore, lapis lazuli ore, nether quartz ore.
            - **Iron Pickaxe**: Can mine stone, coal ore, iron ore, gold ore, diamond ore, emerald ore, redstone ore, lapis lazuli ore.
            - **Diamond Pickaxe**: Can mine all minable blocks including obsidian, ancient debris, crying obsidian.

    2. **Correct Final Task Description**:
        - The final subgoal in the refined list MUST reflect the "Main Task".
        - If the "Main Task" is a result (e.g., "Make a Nether Portal"), the last subgoal must be that exact result (e.g., "Make a Nether Portal"), not a follow-up action.

    3. **Strict Action Verb Limitation**:
        - All subgoals MUST start with one of the following verbs: "**Craft**", "**Mine**", "**Smelt**", "**Place**".
        - For **Mine** and **Smelt**, include the exact numerical quantity. For example: "Mine 30 Wood Logs", "Smelt 8 Iron Ore".
        - Rewrite or remove subgoals using other verbs like "Find", "Use", "Enter", "Activate", "Collect", etc.

    4. **Resource Sufficiency & Early Collection**:
        - Ensure the **total quantity of mined resources (e.g., wood logs, iron, cobblestone)** is sufficient to cover **all downstream crafting and smelting needs**.
        - You MUST **analyze the total resource requirements across all subgoals** and **gather the needed quantities as early as possible**.
        - For example, if later subgoals require 12 wooden planks and 4 sticks (which equals 4 logs), then "Mine X Wood Logs" must cover this full requirement at the beginning.
        - Do **not under-collect**. Err on the side of overestimating slightly if necessary.

    Think step-by-step through the original subgoals, applying each rule carefully. Do not add explanations or reasoning to your final output.

    Provide your refined list of subgoals ONLY as a JSON array of strings, where each string is a subgoal. Wrap your entire JSON output in a Markdown code block with 'json' highlighting (e.g., ```json\n[\n  "subgoal1",\n  "subgoal2"\n]\n```).
    """

    print("\n呼叫 GPT 進行子任務精煉...")
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a Minecraft task refinement agent. You output only a JSON array of refined subgoals."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7, 
            max_tokens=3000 
        )
        json_response = response.choices[0].message.content
        print(json_response)
        json_match = re.search(r"```json\s*(\[.*?\])\s*```", json_response, re.DOTALL)
        if json_match:
            json_string = json_match.group(1) 
            print(f"提取到的 JSON 字串:\n{json_string}\n---") 
            return json.loads(json_string) 
        else:
            print("警告: 未在 LLM 輸出中找到 '```json' 格式。嘗試直接解析整個輸出為 JSON。")
            try:
                return json.loads(json_response)
            except json.JSONDecodeError as e:
                print(f"錯誤: 直接解析整個輸出為 JSON 也失敗: {e}")
                print(f"原始 LLM 輸出無法解析為 JSON，請檢查其格式。")
                return []
    except json.JSONDecodeError as e:
        print(f"解析 GPT 輸出 JSON 錯誤: {e}")
        print(f"原始 GPT 輸出: {response.choices[0].message.content}")
        return []
    except Exception as e:
        print(f"呼叫 OpenAI API 錯誤: {e}")
        return []

async def main():
    task_prepare_path = "TaskPrepare.json"
    subgoals_input_path = "Subgoals-before-Refine.json"
    main_task = ""
    detailed_guide = ""

    try:
        with open(task_prepare_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            main_task = data.get("task", "Unknown Task")
            detailed_guide = data.get("guide", "No detailed guide provided.")
        print(f"成功從 {task_prepare_path} 讀取主任務：'{main_task}' 和詳細指南。")
    except FileNotFoundError:
        print(f"錯誤：找不到輸入檔案 {task_prepare_path}。請確保前一個 Agent 已生成 TaskPrepare.json。")
        print("將使用預設的 'Make a Nether Portal' 任務和指南。")
        return
    except json.JSONDecodeError:
        print(f"錯誤：TaskPrepare.json 檔案損壞或格式不正確。請檢查檔案內容。")
        print("將使用預設的 'Make a Nether Portal' 任務和指南。")
        return

    
    original_subgoals = []

    try:
        with open(subgoals_input_path, "r", encoding="utf-8") as f:
            original_subgoals = json.load(f)
        print(f"成功從 {subgoals_input_path} 讀取原始子任務列表。")
        print(f"原始子任務數量: {len(original_subgoals)}")
    except FileNotFoundError:
        print(f"錯誤：找不到輸入檔案 {subgoals_input_path}。請確保前一個 Agent 已生成 Subgoals_CoT.json。")
        print("將使用預設的原始子任務範例。")
        return
    except json.JSONDecodeError:
        print(f"錯誤：{subgoals_input_path} 檔案損壞或格式不正確。請檢查檔案內容。")
        print("將使用預設的原始子任務範例。")
        return
    if not main_task or not detailed_guide or not original_subgoals:
        print("無法獲取所有必要的輸入，終止執行。")
        return

    refined_subgoals = await refine_subgoals(main_task, detailed_guide, original_subgoals)

    output_file_name = "Subgoals_Refined.json" 
    if refined_subgoals:
        print(f"\n嘗試儲存精煉後的子任務列表 (共 {len(refined_subgoals)} 項)...")
        
        try:
            with open(output_file_name, "w", encoding="utf-8") as f:
                json.dump(refined_subgoals, f, ensure_ascii=False, indent=4)
            print(f"\n精煉後的子任務列表已成功儲存到 {output_file_name}")
            print(f"內容預覽 (前5項): {json.dumps(refined_subgoals[:5], ensure_ascii=False, indent=4)}...") 
        except Exception as e:
            print(f"儲存 JSON 檔案時發生錯誤: {e}")
    else:
        print("\n未生成精煉後的子任務列表。")

if __name__ == "__main__":
    asyncio.run(main())