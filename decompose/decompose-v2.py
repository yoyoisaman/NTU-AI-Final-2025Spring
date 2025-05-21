import openai
import json
import os
import asyncio
from typing import List, Dict, Union, Optional
import re

openai.api_key = os.getenv("OPENAI_API_KEY") 


def extract_subgoal(llm_output: str) -> Optional[str]:
    """
    從包含 Chain of Thought Reasoning 和 Subgoal 的 LLM 輸出中提取最終的 subgoal 字串。

    Args:
        llm_output (str): LLM 的完整輸出字串，包含 Reasoning 和 Subgoal。

    Returns:
        Optional[str]: 如果找到 Subgoal，則返回其字串內容；否則返回 None。
    """

    pattern = re.compile(r"Subgoal:\s*(.*?)(?:\n|$)", re.IGNORECASE | re.MULTILINE)
    
    match = pattern.search(llm_output)
    
    if match:
        subgoal = match.group(1).strip()
        return subgoal if subgoal else None
    else:
        return None

async def decide_next_subgoal(
    final_task: str, 
    detailed_guide: str, 
    generated_subgoals: List[str]
) -> str:
    """
    基於已生成的子任務和詳細指南，決定下一個原子子任務。
    如果任務完成，則返回特殊的完成標誌。
    """
    completed_steps_str = "\n".join([f"- {step}" for step in generated_subgoals]) if generated_subgoals else "None yet."

    prompt = f"""
    You are an expert Minecraft task decomposition agent. Your goal is to generate the *next single, atomic subgoal* to complete a main Minecraft task, given the steps already generated. You must use Chain of Thought reasoning before outputting the subgoal.

    Assume the player starts with absolutely nothing in their inventory, and all resources must be acquired from scratch. Resource gathering should prioritize one-time bulk collection where possible.
    You should assume the player starts with absolutely nothing in their inventory and all resources must be acquired from scratch. 
    For example start from mine 20 wood logs,then create 1 create table.
    
    Main Task: "{final_task}"

    Detailed Guide for reference (materials, steps, and considerations):
    --- Detailed Guide ---
    {detailed_guide}
    --- End of Detailed Guide ---

    Subgoals generated so far:
    {completed_steps_str}

    Strict Rules for generating the NEXT subgoal:
    1.  **Atomic Step**: The subgoal must be the smallest possible actionable step.
    2.  **Strict Chronological Order**: The subgoal must be the immediate next step required after the last generated subgoal (or the very first step if none generated).
    3.  **Clarity and Actionability**: The subgoal should be a clear, concise instruction.
    4.  **Stop Condition**: If the main task is fully completed based on the detailed guide and all necessary subgoals have been generated, output ONLY "__TASK_COMPLETED__". Do NOT output anything else if the task is completed.

    Think step-by-step:
    - What is the current state of the player's inventory, assuming the last subgoal was completed?
    - What resources are needed for the *next* logical step based on the Detailed Guide and the main task?
    - Is there any resource I should gather in bulk now for future steps?
    - What is the single, most atomic and chronologically correct next action?

    Output the reasoning and next atomic subgoal, or "__TASK_COMPLETED__" if finished.

    Few shot Example: 
    
    task: Mine Iron Ore
    Subgoals generated so far: []

    Reasoning:
    1.  **Current State Review**: Nothing has been accomplished yet. The player starts with an empty inventory.
    2.  **Identify Dependencies**: The first step in the Detailed Guide is to gather initial wood. To do this, no tools are needed.
    3.  **Resource Planning**: The guide estimates ~20 wood logs are needed in total for initial tools, crafting, fuel, etc. This is the earliest stage to collect wood.
    4.  **Next Atomic Action**: The most atomic and initial step is to start mining wood.

    Subgaol:
    Mine 20 wood logs
    """

    print(f"\n呼叫 GPT 決定下一個子任務 (已完成 {len(generated_subgoals)} 步)...")
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": "You are a Minecraft task decomposition agent. You generate only the next atomic subgoal or a completion signal."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500 
        )
        full_llm_output = response.choices[0].message.content.strip()
        print(f"原始 LLM 輸出:\n{full_llm_output}\n---") 

        next_subgoal = extract_subgoal(full_llm_output)

        if next_subgoal is None:
            print("警告: LLM 輸出中未找到 'Subgoal:' 標籤。檢查原始輸出。")
            if full_llm_output.strip().upper() == "__TASK_COMPLETED__":
                return "__TASK_COMPLETED__"
            else:
                return "__ERROR__" 
        return next_subgoal
    except Exception as e:
        print(f"呼叫 OpenAI API 錯誤: {e}")
        return "__ERROR__" 
async def generate_subgoals_chain_of_thought(
    final_task: str, 
    detailed_guide: str,
    max_steps: int = 50
) -> List[str]:
    """
    透過 Chain of Thought 模式逐步生成所有原子子任務。
    """
    subgoals_list: List[str] = ["Mine 20 wood logs"]
    current_step_count = 0

    while current_step_count < max_steps:
        next_subgoal = await decide_next_subgoal(final_task, detailed_guide, subgoals_list)

        if next_subgoal == "__TASK_COMPLETED__":
            print("\n任務已完成。停止生成子任務。")
            break
        elif next_subgoal == "__ERROR__":
            print("\n生成子任務時發生錯誤，停止。")
            break
        elif next_subgoal in subgoals_list:
            print(f"\n警告: 偵測到重複子任務 '{next_subgoal}'。停止生成。")
            break
        elif not next_subgoal:
            print("\nLLM 返回空子任務，停止。")
            break
        else:
            subgoals_list.append(next_subgoal)
            print(f"-> 生成子任務 {current_step_count + 1}: {next_subgoal}")
            current_step_count += 1
            await asyncio.sleep(0.5) 
    
    if current_step_count >= max_steps:
        print(f"\n達到最大步數限制 ({max_steps})，停止生成子任務。")

    return subgoals_list

async def main():
    input_file_path = "TaskPrepare_v1.json"
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

    subgoals = await generate_subgoals_chain_of_thought(main_task, detailed_guide)

    output_file_name = "Subgoals_CoT.json"
    if subgoals:
        print(f"\n嘗試儲存子任務列表 (共 {len(subgoals)} 項)...")
        cleaned_subgoals = []
        for i, item in enumerate(subgoals):
            if isinstance(item, str):
                cleaned_subgoals.append(item)
            else:
                print(f"警告: 子任務列表中發現非字串項目在索引 {i}，類型為 '{type(item)}'，值為 '{item}'。已跳過該項目。")
        
        if not cleaned_subgoals:
            print("警告: 處理後的子任務列表為空，所有項目可能都不是字串。不儲存空檔案。")
            return 

        try:
            with open(output_file_name, "w", encoding="utf-8") as f:
                json.dump(cleaned_subgoals, f, ensure_ascii=False, indent=4)
            print(f"\n子任務列表已成功儲存到 {output_file_name}")
            print(f"內容預覽 (前5項): {json.dumps(cleaned_subgoals[:5], ensure_ascii=False, indent=4)}...") 
        except Exception as e:
            print(f"儲存 JSON 檔案時發生錯誤: {e}")
    else:
        print("\n未生成子任務列表。")

if __name__ == "__main__":
    asyncio.run(main())